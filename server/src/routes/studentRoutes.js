// ============================================================
// Student Helpdesk Agent — Routes: Student Management
// ============================================================
// Supports offline in-memory fallback.
// ============================================================

import express from 'express';
import mongoose from 'mongoose';
import Student from '../models/Student.js';
import * as mockStore from '../services/mockStore.js';
import { dbStore } from '../services/dbStore.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

const router = express.Router();

function isDbConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

/**
 * @route POST /api/students
 */
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { studentId, name, email, department, year, interests } = req.body;
    if (!studentId || !name || !email || !department || !year) {
      throw new AppError('Please provide all required student fields', 400);
    }

    const newStudent = { studentId, name, email, department, year, interests: interests || [], isActive: true };
    dbStore.saveUser(newStudent);

    if (isDbConnected()) {
      try {
        await Student.create(newStudent);
      } catch (err) {}
    }

    res.status(201).json({ success: true, message: 'Created student profile in database', student: newStudent });
  })
);

/**
 * @route GET /api/students
 */
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const students = dbStore.getUsers().filter(u => u.role === 'student' && u.status !== 'deleted');
    res.status(200).json({ success: true, count: students.length, students });
  })
);

/**
 * @route GET /api/students/marks/:studentId
 */
router.get(
  '/marks/:studentId',
  asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    const allMarks = dbStore.getMarks();
    res.status(200).json({ success: true, marks: allMarks[studentId] || {} });
  })
);

/**
 * @route POST /api/students/marks
 */
router.post(
  '/marks',
  asyncHandler(async (req, res) => {
    const { studentId, marksData } = req.body;
    if (!studentId || !marksData) throw new AppError('studentId and marksData required', 400);
    const saved = dbStore.saveMarks(studentId, marksData);
    res.status(200).json({ success: true, message: 'Marks saved to database', marks: saved });
  })
);

/**
 * @route GET /api/students/:studentId
 */
router.get(
  '/:studentId',
  asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    const student = dbStore.getUserByIdentifier(studentId);
    if (!student) throw new AppError(`Student not found with ID: ${studentId}`, 404);
    res.status(200).json({ success: true, student });
  })
);

export default router;
