// ============================================================
// Student Helpdesk Agent — Backend Entry Point (MERN)
// ============================================================
// Express server initialization, middleware configuration,
// MongoDB connection, and API route mapping.
// Now includes Phase 7 Auth and Admin routes with xAI Grok support.
// ============================================================

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/db.js';
import logger from './utils/logger.js';
import { globalErrorHandler as errorHandler } from './middleware/errorHandler.js';
import { seedDatabase } from './services/seedService.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import systemRoutes from './routes/systemRoutes.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// ----------------------------------------------------------
// Middleware Configuration
// ----------------------------------------------------------

// CORS setup for frontend communication
app.use(
  cors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, _res, next) => {
  logger.info(`🌐 ${req.method} ${req.url} | ip=${req.ip}`);
  next();
});

// Rate limiting for chat endpoints
const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { success: false, error: 'Too many chat requests from this IP, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/chat', chatLimiter);

// ----------------------------------------------------------
// Route Mapping
// ----------------------------------------------------------

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/system', systemRoutes);

// Base health endpoint
app.get('/api', (_req, res) => {
  res.status(200).json({
    name: 'Student Helpdesk Agent API',
    version: '1.1.0 (Phase 7 Enterprise MERN)',
    status: 'active',
    institution: 'XYZ Engineering College (XYZ-EC)',
    endpoints: {
      auth: '/api/auth/login, /api/auth/me',
      admin: '/api/admin/docs, /api/admin/stats',
      chat: '/api/chat, /api/chat/history/:sessionId',
      students: '/api/students',
      system: '/api/system/health, /api/system/stats',
    },
  });
});

// Global Error Handler (must be after routes)
app.use(errorHandler);

// ----------------------------------------------------------
// Server & Database Initialization
// ----------------------------------------------------------

async function startServer() {
  try {
    logger.info('🚀 Initializing Student Helpdesk Agent Server (MERN Phase 7)...');
    
    // Connect to MongoDB with graceful offline fallback
    const isDbConnected = await connectDB();

    if (isDbConnected) {
      // Run automatic database seeding on startup
      await seedDatabase(false);
    } else {
      logger.warn('⚠️ Running in offline/no-database mode. In-memory mockStore active.');
    }

    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT} | Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`📡 API endpoint ready at: http://localhost:${PORT}/api`);
    });
  } catch (err) {
    logger.error(`❌ Server startup failed: ${err.message}`, { stack: err.stack });
    process.exit(1);
  }
}

startServer();
