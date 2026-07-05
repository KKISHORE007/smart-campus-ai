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

    // 1. Check database if online
    if (isDbConnected()) {
      user = await User.findOne({
        $or: [
          { loginId: identifier },
          { email: identifier },
          { userId: identifier.toUpperCase() },
        ],
      });
      if (user) {
        const inst = await Institution.findOne({ institutionId: user.institutionId });
        if (inst) institution = inst;
      }
    }

    // 2. Check offline/mock store if not found in DB
    if (!user) {
      const offlineMatch = mockUsers.find(
        (u) =>
          (u.loginId && u.loginId.toLowerCase() === identifier) ||
          (u.email && u.email.toLowerCase() === identifier) ||
          (u.userId && u.userId.toLowerCase() === identifier)
      );
      if (offlineMatch && offlineMatch.password === password) {
        user = offlineMatch;
      }
    } else if (user.password !== password) {
      user = null; // Password mismatch
    }

    // 3. Check hardcoded Super Admin test credentials specifically
    if (!user && identifier === 'stark@123' && password === '12345678') {
      user = {
        userId: 'SUPER-STARK-001',
        loginId: 'stark@123',
        email: 'stark@xyzec.edu',
        name: 'Tony Stark (Super Admin)',
        role: 'super_admin',
        institutionId: 'inst-xyz-001',
        department: 'Executive Trust & Administration',
      };
    }

    if (!user) {
      throw new AppError('Invalid ID or Password. System checks verify you are not a registered member.', 401);
    }

    if (user.status === 'pending') {
      throw new AppError('⏳ Your request is in progress. It has not been approved by the Super Admin yet.', 403);
    }
    if (user.status === 'rejected') {
      throw new AppError('❌ Your join request has been rejected by the college administrator.', 403);
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
    const { loginId, email, password, name, role, department, year } = req.body;
    if (!email || !password || !name || !role) {
      throw new AppError('Email, password, name, and role are required', 400);
    }

    const newUser = {
      userId: (role.substring(0, 3).toUpperCase()) + '-PEND-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
      loginId: loginId || email.split('@')[0],
      email: email.toLowerCase(),
      password,
      name,
      role,
      department: department || 'General Engineering',
      year: Number(year) || 1,
      institutionId: 'inst-xyz-001',
      isActive: true,
      status: 'pending',
    };

    if (isDbConnected()) {
      const existing = await User.findOne({ $or: [{ email: newUser.email }, { loginId: newUser.loginId }] });
      if (existing) throw new AppError('An account with this email or login ID already exists', 400);
      const created = await User.create(newUser);
      return res.status(201).json({
        success: true,
        message: '⏳ Your join request has been submitted and is pending Super Admin approval!',
        user: created.toSafeObject(),
      });
    }

    // Offline store check
    const existingOffline = mockUsers.find((u) => u.email === newUser.email || u.loginId === newUser.loginId);
    if (existingOffline) throw new AppError('An account with this email or login ID already exists', 400);
    mockUsers.push(newUser);

    res.status(201).json({
      success: true,
      message: '⏳ Your join request has been submitted and is pending Super Admin approval! (Offline Store)',
      user: newUser,
    });
  })
);

export default router;
