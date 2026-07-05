// ============================================================
// Student Helpdesk Agent — Model: KnowledgeDoc
// ============================================================
// Mongoose schema for college knowledge documents with
// text chunks, embeddings, and institution-specific scoping.
// ============================================================

import mongoose from 'mongoose';

const chunkSubSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    embedding: { type: [Number], default: [] },
  },
  { _id: false }
);

const knowledgeDocSchema = new mongoose.Schema(
  {
    institutionId: {
      type: String,
      required: true,
      index: true,
      default: 'inst-xyz-001',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['academic', 'administrative', 'general'],
    },
    tags: {
      type: [String],
      default: [],
    },
    fileName: {
      type: String,
      default: 'manual_entry.txt',
    },
    fileType: {
      type: String,
      enum: ['pdf', 'docx', 'xlsx', 'txt', 'manual'],
      default: 'manual',
    },
    fileSize: {
      type: String,
      default: '4 KB',
    },
    uploadedBy: {
      type: String,
      default: 'admin@xyzec.edu',
    },
    chunks: {
      type: [chunkSubSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

knowledgeDocSchema.virtual('chunkCount').get(function () {
  return this.chunks.length;
});

const KnowledgeDoc = mongoose.model('KnowledgeDoc', knowledgeDocSchema);
export default KnowledgeDoc;
