// ============================================================
// Student Helpdesk Agent — Routes: Student Management
// ============================================================
// Supports offline in-memory fallback.
// ============================================================

import express from 'express';
import mongoose from 'mongoose';
import Student from '../models/Student.js';
import * as mockStore from '../services/mockStore.js';
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

    if (!isDbConnected()) {
      const existing = mockStore.mockStudents.find((s) => s.studentId === studentId || s.email === email);
      if (existing) throw new AppError('Student with this ID or Email already exists', 409);

      const newStudent = { studentId, name, email, department, year, interests: interests || [], isActive: true };
      mockStore.mockStudents.push(newStudent);
      return res.status(201).json({ success: true, message: 'Created in mockStore', student: newStudent });
    }

    let student = await Student.findOne({ $or: [{ studentId }, { email }] });
    if (student) throw new AppError('Student with this ID or Email already exists', 409);

    student = await Student.create({ studentId, name, email, department, year, interests: interests || [] });
    logger.info(`👤 Created new student profile: ${student.name}`);
    res.status(201).json({ success: true, message: 'Student profile created successfully', student });
  })
);

/**
 * @route GET /api/students
 */
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    if (!isDbConnected()) {
      return res.status(200).json({ success: true, count: mockStore.mockStudents.length, students: mockStore.mockStudents });
    }
    const students = await Student.find({ isActive: true }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: students.length, students });
  })
);

/**
 * @route GET /api/students/:studentId
 */
router.get(
  '/:studentId',
  asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    if (!isDbConnected()) {
      const student = mockStore.mockStudents.find((s) => s.studentId === studentId);
      if (!student) throw new AppError(`Student not found with ID: ${studentId}`, 404);
      return res.status(200).json({ success: true, student });
    }

    const student = await Student.findOne({ studentId });
    if (!student) throw new AppError(`Student not found with ID: ${studentId}`, 404);
    res.status(200).json({ success: true, student });
  })
);

export default router;
