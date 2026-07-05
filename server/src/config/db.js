// ============================================================
// Student Helpdesk Agent — Config: Database Connection
// ============================================================
// Mongoose connection with retry logic and event listeners.
// ============================================================

import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/student_helpdesk';
  const maxRetries = 2;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 1500,
      });
      logger.info(`✅ MongoDB connected | ${uri.replace(/\/\/.*@/, '//***@')}`);
      break;
    } catch (err) {
      retries++;
      logger.error(`❌ MongoDB connection failed (attempt ${retries}/${maxRetries}): ${err.message}`);
      if (retries === maxRetries) {
        logger.error('Max retries reached. Running without database.');
        return false;
      }
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  // Event listeners
  mongoose.connection.on('disconnected', () => {
    logger.warn('⚠️ MongoDB disconnected');
  });

  mongoose.connection.on('error', (err) => {
    logger.error(`MongoDB error: ${err.message}`);
  });

  return true;
};

export default connectDB;
