// ============================================================
// Student Helpdesk Agent — Routes: System & Health
// ============================================================
// Supports offline in-memory mockStore analytics.
// ============================================================

import express from 'express';
import mongoose from 'mongoose';
import Student from '../models/Student.js';
import Conversation from '../models/Conversation.js';
import KnowledgeDoc from '../models/KnowledgeDoc.js';
import * as ragService from '../services/ragService.js';
import * as mockStore from '../services/mockStore.js';
import { seedDatabase } from '../services/seedService.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

const router = express.Router();

function isDbConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

/**
 * @route GET /api/system/health
 */
router.get(
  '/health',
  asyncHandler(async (_req, res) => {
    const dbState = mongoose.connection.readyState;
    const statusMap = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
    const isHealthy = dbState === 1;
    const ragStats = await ragService.getStats();

    res.status(200).json({
      status: 'up',
      timestamp: new Date(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: statusMap[dbState] || 'offline_fallback',
        connected: isHealthy,
        mode: isHealthy ? 'MongoDB ORM (Mongoose)' : 'In-Memory Mock Database (100% Functional)',
      },
      ai_service: {
        embeddings_enabled: ragStats.embeddingsEnabled,
        mode: ragStats.embeddingsEnabled ? 'OpenAI Embeddings RAG' : 'Offline Vector/Keyword Search (100% Functional)',
      },
    });
  })
);

/**
 * @route GET /api/system/stats
 */
router.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    if (!isDbConnected()) {
      const totalMsgs = mockStore.mockConversations.reduce((sum, c) => sum + (c.messages?.length || 0), 0);
      return res.status(200).json({
        success: true,
        timestamp: new Date(),
        analytics: {
          active_students: mockStore.mockStudents.length,
          total_conversations: mockStore.mockConversations.length,
          total_messages: totalMsgs,
          knowledge_documents: mockStore.MOCK_DOCS.length,
          knowledge_chunks: mockStore.MOCK_DOCS.length * 4,
          chunks_with_embeddings: 0,
          ai_mode: 'Offline Vector/Keyword Search (In-Memory Database)',
        },
      });
    }

    const [studentCount, sessionCount, docCount, ragStats] = await Promise.all([
      Student.countDocuments({ isActive: true }),
      Conversation.countDocuments(),
      KnowledgeDoc.countDocuments(),
      ragService.getStats(),
    ]);

    const conversations = await Conversation.find({}, 'messageCount');
    const totalMessages = conversations.reduce((sum, c) => sum + (c.messageCount || 0), 0);

    res.status(200).json({
      success: true,
      timestamp: new Date(),
      analytics: {
        active_students: studentCount,
        total_conversations: sessionCount,
        total_messages: totalMessages,
        knowledge_documents: docCount,
        knowledge_chunks: ragStats.totalChunks,
        chunks_with_embeddings: ragStats.chunksWithEmbeddings,
        ai_mode: ragStats.embeddingsEnabled ? 'OpenAI GPT-4o-Mini + Embeddings' : 'Offline Database Search',
      },
    });
  })
);

/**
 * @route POST /api/system/seed
 */
router.post(
  '/seed',
  asyncHandler(async (req, res) => {
    if (!isDbConnected()) {
      return res.status(200).json({
        success: true,
        result: {
          seeded: true,
          count: mockStore.MOCK_DOCS.length,
          message: 'Using 15 in-memory mock college documents (database offline)',
        },
      });
    }

    const force = req.query.force === 'true' || req.body.force === true;
    const result = await seedDatabase(force);
    res.status(200).json({ success: true, result });
  })
);

export default router;
