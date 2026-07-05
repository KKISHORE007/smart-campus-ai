// ============================================================
// Student Helpdesk Agent — Middleware: Authentication & Authorization
// ============================================================
// Lightweight JWT token middleware supporting both online Mongoose
// user lookup and offline fallback for seamless demo execution.
// ============================================================

import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { AppError } from './errorHandler.js';
import logger from '../utils/logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'antigravity-secret-key-2026-xyzec';

function isDbConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

/**
 * Issue a JWT token for an authenticated user.
 */
export function generateToken(user) {
  return jwt.sign(
    {
      userId: user.userId,
      email: user.email,
      role: user.role,
      institutionId: user.institutionId,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Verify JWT token from Authorization header.
 */
export async function authenticate(req, _res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Access denied. No valid authentication token provided.', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (isDbConnected()) {
      const user = await User.findOne({ userId: decoded.userId, isActive: true });
      if (user) {
        req.user = user.toSafeObject();
        return next();
      }
    }

    // Offline / Fallback User from token claims
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      institutionId: decoded.institutionId || 'inst-xyz-001',
      name: decoded.name || 'Demo User',
    };
    next();
  } catch (err) {
    logger.warn(`Auth failure: ${err.message}`);
    next(new AppError('Invalid or expired authentication token. Please log in again.', 401));
  }
}

/**
 * Guard route for Admin role only.
 */
export function requireAdmin(req, _res, next) {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'super_admin')) {
    return next(new AppError('Access denied. Administrator privileges are required for this action.', 403));
  }
  next();
}
