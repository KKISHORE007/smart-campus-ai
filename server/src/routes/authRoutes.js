// ============================================================
// Student Helpdesk Agent — Routes: Authentication
// ============================================================
// Handles role-based login (student, staff, hod, super_admin),
// token issuance, and profile verification against registered members.
// Supports hardcoded test credentials: stark@123 / 12345678.
// ============================================================

import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Institution from '../models/Institution.js';
import { generateToken, authenticate } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import * as mockStore from '../services/mockStore.js';
import { mockUsers, mockInstitutions } from '../services/mockStore.js';
import { dbStore } from '../services/dbStore.js';
import logger from '../utils/logger.js';

const router = express.Router();

function isDbConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

const OFFLINE_INSTITUTION = mockInstitutions[0];

/**
 * @route POST /api/auth/login
 * @desc Authenticate user by loginId / email / userId and return JWT + institution branding
 * @access Public
 */
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { loginId, email, password, role } = req.body;
    const identifier = (loginId || email || '').trim().toLowerCase();

    if (!identifier || !password) {
      throw new AppError('Please provide both ID / Email and Password', 400);
    }

    logger.info(`🔐 Login attempt | ID=${identifier} | RequestedRole=${role || 'any'}`);

    let user = null;
    let institution = OFFLINE_INSTITUTION;

    // 1. Check persistent disk store first (authoritative record)
    const diskUser = dbStore.getUserByIdentifier(identifier);
    if (diskUser) {
      user = diskUser;
    }

    // 2. Check MongoDB if connected and not found in disk store
    if (!user && isDbConnected()) {
      const dbMatch = await User.findOne({
        $or: [
          { loginId: identifier },
          { email: identifier },
          { userId: identifier.toUpperCase() },
        ],
      });
      if (dbMatch) {
        user = dbMatch.toSafeObject ? dbMatch.toSafeObject() : dbMatch;
      }
    }

    // 3. Check legacy mockUsers if still not found
    if (!user) {
      const offlineMatch = mockUsers.find(
        (u) =>
          (u.loginId && u.loginId.toLowerCase() === identifier) ||
          (u.email && u.email.toLowerCase() === identifier) ||
          (u.userId && u.userId.toLowerCase() === identifier)
      );
      if (offlineMatch) {
        user = offlineMatch;
      }
    }

    if (!user) {
      throw new AppError('Access Denied: Account not found in database. Please register or check your credentials.', 401);
    }

    if (user.status === 'deleted') {
      throw new AppError('❌ Access Denied: This account ID has been deleted by the Super Admin.', 403);
    }

    if (user.status === 'pending_approval' || user.status === 'pending') {
      throw new AppError('⏳ Account Approval Pending: Your account is waiting for Super Admin approval. Once approved in the Super Admin Dashboard, you can log in.', 403);
    }

    if (user.password !== password) {
      throw new AppError('❌ Invalid password for this account.', 401);
    }

    // If a specific role was chosen on the Sign In page, warn or enforce if incompatible
    if (role && role !== user.role && user.role !== 'super_admin') {
      logger.warn(`User ${user.name} logged in with role ${role} but account is ${user.role}`);
    }

    const token = generateToken(user);
    logger.info(`✅ Login successful | user=${user.name} | role=${user.role}`);

    res.status(200).json({
      success: true,
      token,
      user: {
        userId: user.userId,
        loginId: user.loginId || user.email,
        email: user.email,
        name: user.name,
        role: user.role,
        institutionId: user.institutionId,
        department: user.department || 'General',
        year: user.year || 1,
      },
      institution,
    });
  })
);

/**
 * @route GET /api/auth/me
 * @desc Get currently authenticated user and institution details
 * @access Private
 */
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    let institution = OFFLINE_INSTITUTION;

    if (isDbConnected()) {
      const inst = await Institution.findOne({ institutionId: req.user.institutionId });
      if (inst) institution = inst;
    }

    res.status(200).json({
      success: true,
      user: req.user,
      institution,
    });
  })
);

/**
 * @route GET /api/auth/institution/:code
 * @desc Get college branding by institution code
 * @access Public
 */
router.get(
  '/institution/:code',
  asyncHandler(async (req, res) => {
    const { code } = req.params;
    let institution = OFFLINE_INSTITUTION;

    if (isDbConnected()) {
      const inst = await Institution.findOne({ code: code.toUpperCase() });
      if (inst) institution = inst;
    }

    res.status(200).json({
      success: true,
      institution,
    });
  })
);

/**
 * @route GET /api/auth/public-info
 * @desc Get public college branding, hero carousel images, and public announcements for landing page
 * @access Public
 */
router.get(
  '/public-info',
  asyncHandler(async (_req, res) => {
    let institution = mockInstitutions[0];

    if (isDbConnected()) {
      const inst = await Institution.findOne({ institutionId: 'inst-xyz-001' });
      if (inst) institution = inst;
    }

    res.status(200).json({
      success: true,
      institution,
      announcements: mockStore.mockAnnouncements || [],
      feeStructure: mockStore.mockFees || [],
    });
  })
);

/**
 * @route POST /api/auth/register
 * @desc Submit a join request for student, staff, or hod role (status defaults to pending)
 * @access Public
 */
router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { loginId, email, password, name, role, department, year, registerNo, section } = req.body;
    if (!email || !password || !name || !role) {
      throw new AppError('Email, password, name, and role are required', 400);
    }

    // Check persistent database store
    const existingDisk = dbStore.getUserByIdentifier(loginId || email);
    if (existingDisk) {
      throw new AppError('An account with this email or login ID already exists in the database', 400);
    }

    const newUser = {
      userId: (role.substring(0, 3).toUpperCase()) + '-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
      loginId: loginId || email.split('@')[0],
      email: email.toLowerCase(),
      password,
      name,
      role,
      department: department || 'General Engineering',
      year: Number(year) || 1,
      registerNo: registerNo || '',
      section: section || 'A',
      institutionId: 'inst-xyz-001',
      isActive: true,
      status: 'pending_approval',
    };

    // Save permanently to disk database
    const saved = dbStore.saveUser(newUser);

    // Also sync to MongoDB if connected
    if (isDbConnected()) {
      try {
        await User.create(newUser);
      } catch (err) {
        logger.warn('MongoDB sync note:', err.message);
      }
    }

    res.status(201).json({
      success: true,
      message: '⏳ Your registration has been saved to database under Pending Approval status!',
      user: saved,
    });
  })
);

/**
 * @route GET /api/auth/users
 * @desc Get all registered users from database
 * @access Public
 */
router.get(
  '/users',
  asyncHandler(async (_req, res) => {
    const users = dbStore.getUsers();
    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  })
);

export default router;
