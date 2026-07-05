// ============================================================
// Student Helpdesk Agent — Model: Conversation
// ============================================================
// Scoped to institutionId for multi-tenant isolation.
// ============================================================

import mongoose from 'mongoose';

const messageSubSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
      enum: ['user', 'assistant'],
    },
    content: {
      type: String,
      required: true,
    },
    sources: {
      type: [String],
      default: [],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const conversationSchema = new mongoose.Schema(
  {
    institutionId: {
      type: String,
      required: true,
      index: true,
      default: 'inst-xyz-001',
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    studentId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: '',
    },
    messages: {
      type: [messageSubSchema],
      default: [],
    },
    messageCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

conversationSchema.methods.autoTitle = function () {
  if (!this.title && this.messages.length > 0) {
    const firstUserMsg = this.messages.find((m) => m.role === 'user');
    if (firstUserMsg) {
      this.title = firstUserMsg.content.substring(0, 80);
      if (firstUserMsg.content.length > 80) this.title += '...';
    }
  }
};

const Conversation = mongoose.model('Conversation', conversationSchema);
export default Conversation;
