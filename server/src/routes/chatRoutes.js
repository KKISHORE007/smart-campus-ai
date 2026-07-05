// ============================================================
// Student Helpdesk Agent — Routes: Chat & Conversations
// ============================================================
// Handles message sending, conversation history retrieval,
// and session listing for students. Supports in-memory mock fallback.
// ============================================================

import express from 'express';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import Conversation from '../models/Conversation.js';
import * as helpdeskAgent from '../services/helpdeskAgent.js';
import * as mockStore from '../services/mockStore.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

const router = express.Router();

function isDbConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

/**
 * @route POST /api/chat
 */
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { studentId = 'STU-2024-001', message, sessionId: reqSessionId, role = 'student', userName = 'Member' } = req.body;

    if (!message || !message.trim()) {
      throw new AppError('Message text is required', 400);
    }

    const sessionId = reqSessionId || uuidv4();
    logger.info(`💬 Incoming message | user=${userName} (${role}) | session=${sessionId.substring(0, 8)}...`);

    // -- Offline Mock Store Fallback --
    if (!isDbConnected()) {
      let conversation = mockStore.mockConversations.find((c) => c.sessionId === sessionId);
      if (!conversation) {
        conversation = {
          sessionId,
          studentId,
          title: message.trim().substring(0, 50),
          messages: [],
          messageCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockStore.mockConversations.unshift(conversation);
      }

      const agentResult = await helpdeskAgent.processMessage(
        studentId,
        message.trim(),
        sessionId,
        conversation.messages,
        'inst-xyz-001',
        role,
        userName
      );

      conversation.messages.push({ role: 'user', content: message.trim(), timestamp: new Date() });
      conversation.messages.push({
        role: 'assistant',
        content: agentResult.response,
        sources: agentResult.sources || [],
        timestamp: new Date(),
      });
      conversation.messageCount = conversation.messages.length;
      conversation.updatedAt = new Date();

      return res.status(200).json({
        success: true,
        response: agentResult.response,
        sessionId: sessionId,
        sources: agentResult.sources || [],
        suggestions: agentResult.suggestions || [],
        timestamp: new Date(),
      });
    }

    // -- Online MongoDB Execution --
    let conversation = await Conversation.findOne({ sessionId });
    if (!conversation) {
      conversation = new Conversation({
        sessionId,
        studentId,
        title: '',
        messages: [],
      });
    }

    const agentResult = await helpdeskAgent.processMessage(
      studentId,
      message.trim(),
      sessionId,
      conversation.messages,
      'inst-xyz-001',
      role,
      userName
    );

    conversation.messages.push({ role: 'user', content: message.trim(), timestamp: new Date() });
    conversation.messages.push({
      role: 'assistant',
      content: agentResult.response,
      sources: agentResult.sources || [],
      timestamp: new Date(),
    });

    conversation.messageCount = conversation.messages.length;
    conversation.autoTitle();
    await conversation.save();

    res.status(200).json({
      success: true,
      response: agentResult.response,
      sessionId: sessionId,
      sources: agentResult.sources || [],
      suggestions: agentResult.suggestions || [],
      timestamp: new Date(),
    });
  })
);

/**
 * @route GET /api/chat/history/:sessionId
 */
router.get(
  '/history/:sessionId',
  asyncHandler(async (req, res) => {
    const { sessionId } = req.params;

    if (!isDbConnected()) {
      const conv = mockStore.mockConversations.find((c) => c.sessionId === sessionId);
      return res.status(200).json({
        success: true,
        sessionId,
        title: conv?.title || 'New Conversation',
        messages: conv?.messages || [],
      });
    }

    const conversation = await Conversation.findOne({ sessionId });
    if (!conversation) {
      return res.status(200).json({
        success: true,
        sessionId,
        title: 'New Conversation',
        messages: [],
      });
    }

    res.status(200).json({
      success: true,
      sessionId: conversation.sessionId,
      studentId: conversation.studentId,
      title: conversation.title,
      messages: conversation.messages,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    });
  })
);

/**
 * @route GET /api/chat/sessions/:studentId
 */
router.get(
  '/sessions/:studentId',
  asyncHandler(async (req, res) => {
    const { studentId } = req.params;

    if (!isDbConnected()) {
      const sessions = mockStore.mockConversations.filter((c) => c.studentId === studentId);
      return res.status(200).json({
        success: true,
        studentId,
        total: sessions.length,
        sessions: sessions.map((s) => ({
          sessionId: s.sessionId,
          title: s.title,
          messageCount: s.messageCount,
          updatedAt: s.updatedAt,
        })),
      });
    }

    const limit = parseInt(req.query.limit, 10) || 20;
    const conversations = await Conversation.find({ studentId })
      .select('sessionId title messageCount updatedAt createdAt')
      .sort({ updatedAt: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      studentId,
      total: conversations.length,
      sessions: conversations,
    });
  })
);

/**
 * @route DELETE /api/chat/session/:sessionId
 */
router.delete(
  '/session/:sessionId',
  asyncHandler(async (req, res) => {
    const { sessionId } = req.params;

    if (!isDbConnected()) {
      const idx = mockStore.mockConversations.findIndex((c) => c.sessionId === sessionId);
      if (idx !== -1) mockStore.mockConversations.splice(idx, 1);
      return res.status(200).json({ success: true, message: 'Deleted from in-memory store' });
    }

    const result = await Conversation.deleteOne({ sessionId });
    if (result.deletedCount === 0) {
      throw new AppError('Conversation session not found', 404);
    }

    res.status(200).json({ success: true, message: 'Conversation session deleted successfully' });
  })
);

export default router;
