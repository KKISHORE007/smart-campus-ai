// ============================================================
// Student Helpdesk Agent — Service: RAG Pipeline
// ============================================================
// Retrieval-Augmented Generation pipeline:
// - Document ingestion with text chunking & metadata
// - Embedding generation via OpenAI
// - Cosine similarity search scoped by institutionId
// - Automatically falls back to mockStore when offline
// ============================================================

import mongoose from 'mongoose';
import OpenAI from 'openai';
import KnowledgeDoc from '../models/KnowledgeDoc.js';
import * as mockStore from './mockStore.js';
import logger from '../utils/logger.js';

// ----------------------------------------------------------
// Helpers
// ----------------------------------------------------------

function chunkText(text, chunkSize = 500, overlap = 50) {
  const chunks = [];
  const sentences = text.split(/(?<=[.!?\n])\s+/);
  let current = '';

  for (const sentence of sentences) {
    if ((current + ' ' + sentence).length > chunkSize && current.length > 0) {
      chunks.push(current.trim());
      const words = current.split(' ');
      const overlapWords = words.slice(-Math.ceil(overlap / 5));
      current = overlapWords.join(' ') + ' ' + sentence;
    } else {
      current = current ? current + ' ' + sentence : sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());

  return chunks.length > 0 ? chunks : [text];
}

function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length || a.length === 0) return 0;
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

function isApiKeyValid() {
  const key = process.env.OPENAI_API_KEY;
  return key && !key.startsWith('sk-your') && key.length > 10;
}

function isDbConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

// ----------------------------------------------------------
// RAG Service
// ----------------------------------------------------------

let openai = null;
function getOpenAI() {
  if (!openai && isApiKeyValid()) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

async function generateEmbedding(text) {
  const client = getOpenAI();
  if (!client) return null;

  try {
    const response = await client.embeddings.create({
      model: 'text-embedding-3-small',
      input: text.substring(0, 8000),
    });
    return response.data[0].embedding;
  } catch (err) {
    logger.error(`Embedding generation failed: ${err.message}`);
    return null;
  }
}

/**
 * Ingest a document into the knowledge base, scoped by institutionId.
 */
export async function ingestDocument(title, content, category, tags = [], institutionId = 'inst-xyz-001', metadata = {}) {
  if (!isDbConnected()) {
    logger.warn(`Mongoose disconnected — cannot persist document "${title}" to MongoDB.`);
    return null;
  }

  const textChunks = chunkText(content);
  const chunks = [];

  for (const text of textChunks) {
    const embedding = await generateEmbedding(text);
    chunks.push({ text, embedding: embedding || [] });
  }

  const doc = await KnowledgeDoc.create({
    institutionId,
    title,
    content,
    category,
    tags,
    fileName: metadata.fileName || 'manual_entry.txt',
    fileType: metadata.fileType || 'manual',
    fileSize: metadata.fileSize || `${Math.ceil(content.length / 1024)} KB`,
    uploadedBy: metadata.uploadedBy || 'admin@xyzec.edu',
    chunks,
  });

  logger.info(`📚 Document ingested for [${institutionId}]: "${title}" | ${chunks.length} chunks`);
  return doc;
}

/**
 * Search for similar content using embeddings (or keyword fallback).
 * Strictly scoped to institutionId.
 */
export async function searchSimilar(query, topK = 3, institutionId = 'inst-xyz-001') {
  if (!isDbConnected()) {
    logger.debug(`Database offline — using in-memory mockStore for RAG retrieval [inst=${institutionId}].`);
    return mockStore.searchMockDocs(query, topK, institutionId);
  }

  const docs = await KnowledgeDoc.find({ institutionId });
  if (docs.length === 0) {
    return mockStore.searchMockDocs(query, topK, institutionId);
  }

  const queryEmbedding = await generateEmbedding(query);

  if (queryEmbedding) {
    const scored = [];
    for (const doc of docs) {
      for (const chunk of doc.chunks) {
        if (chunk.embedding && chunk.embedding.length > 0) {
          const sim = cosineSimilarity(queryEmbedding, chunk.embedding);
          scored.push({
            text: chunk.text,
            score: sim,
            docTitle: doc.title,
            category: doc.category,
          });
        }
      }
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }

  // Keyword fallback scoped to institutionId
  const queryLower = query.toLowerCase();
  const keywords = queryLower.split(/\s+/).filter((w) => w.length > 2);
  const scored = [];

  for (const doc of docs) {
    for (const chunk of doc.chunks) {
      const chunkLower = chunk.text.toLowerCase();
      let score = 0;
      for (const kw of keywords) {
        if (chunkLower.includes(kw)) score += 1;
      }
      const titleLower = doc.title.toLowerCase();
      for (const kw of keywords) {
        if (titleLower.includes(kw)) score += 2;
      }

      if (score > 0) {
        scored.push({
          text: chunk.text,
          score: score / keywords.length,
          docTitle: doc.title,
          category: doc.category,
        });
      }
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}

export async function getStats(institutionId = 'inst-xyz-001') {
  if (!isDbConnected()) {
    const docs = mockStore.MOCK_DOCS.filter((d) => !d.institutionId || d.institutionId === institutionId);
    return {
      documentCount: docs.length,
      totalChunks: docs.length * 4,
      chunksWithEmbeddings: 0,
      embeddingsEnabled: false,
    };
  }

  const docCount = await KnowledgeDoc.countDocuments({ institutionId });
  const docs = await KnowledgeDoc.find({ institutionId });
  const totalChunks = docs.reduce((sum, d) => sum + d.chunks.length, 0);
  const withEmbeddings = docs.reduce(
    (sum, d) => sum + d.chunks.filter((c) => c.embedding?.length > 0).length,
    0
  );

  return {
    documentCount: docCount,
    totalChunks,
    chunksWithEmbeddings: withEmbeddings,
    embeddingsEnabled: isApiKeyValid(),
  };
}
