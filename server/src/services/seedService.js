// ============================================================
// Student Helpdesk Agent — Service: Database Seeder
// ============================================================
// Populates MongoDB with institution XYZ Engineering College,
// Admin User, Demo Student, and 15+ rich policy documents.
// ============================================================

import mongoose from 'mongoose';
import Institution from '../models/Institution.js';
import User from '../models/User.js';
import Student from '../models/Student.js';
import KnowledgeDoc from '../models/KnowledgeDoc.js';
import * as ragService from './ragService.js';
import { MOCK_DOCS, mockInstitutions, mockUsers, mockStudents } from './mockStore.js';
import logger from '../utils/logger.js';

/**
 * Seed database with sample data.
 */
export async function seedDatabase(force = false) {
  try {
    if (mongoose.connection.readyState !== 1) {
      logger.warn('Mongoose not connected — skipping MongoDB seed (using mockStore).');
      return { seeded: false, reason: 'Database offline' };
    }

    const docCount = await KnowledgeDoc.countDocuments();
    if (docCount > 0 && !force) {
      logger.info(`📚 Database already seeded (${docCount} documents). Use force=true to re-seed.`);
      return { seeded: false, count: docCount, reason: 'Already seeded' };
    }

    logger.info('🌱 Seeding MongoDB with Institution, Users, and Knowledge Base...');

    if (force) {
      await Promise.all([
        Institution.deleteMany({}),
        User.deleteMany({}),
        Student.deleteMany({}),
        KnowledgeDoc.deleteMany({}),
      ]);
      logger.info('🗑️ Cleared existing database records.');
    }

    // 1. Seed Institution
    const inst = mockInstitutions[0];
    await Institution.findOneAndUpdate(
      { institutionId: inst.institutionId },
      { $set: inst },
      { upsert: true, new: true }
    );
    logger.info(`🏛️ Seeded institution: ${inst.name} (${inst.code})`);

    // 2. Seed Users
    for (const u of mockUsers) {
      await User.findOneAndUpdate(
        { email: u.email },
        { $set: u },
        { upsert: true, new: true }
      );
    }
    logger.info(`👤 Seeded ${mockUsers.length} users (Admin & Student)`);

    // 3. Seed Student Profile
    const stu = mockStudents[0];
    await Student.findOneAndUpdate(
      { studentId: stu.studentId },
      { $set: stu },
      { upsert: true, new: true }
    );

    // 4. Seed Documents with RAG Indexing
    let seededCount = 0;
    for (const d of MOCK_DOCS) {
      const existing = await KnowledgeDoc.findOne({ title: d.title, institutionId: d.institutionId });
      if (!existing) {
        await ragService.ingestDocument(
          d.title,
          d.content,
          d.category,
          d.tags,
          d.institutionId || 'inst-xyz-001',
          {
            fileName: d.fileName || 'handbook_entry.pdf',
            fileType: d.fileType || 'pdf',
            fileSize: d.fileSize || '20 KB',
            uploadedBy: d.uploadedBy || 'admin@xyzec.edu',
          }
        );
        seededCount++;
      }
    }

    logger.info(`✅ Successfully seeded ${seededCount} new documents into MongoDB.`);
    return { seeded: true, count: seededCount };
  } catch (err) {
    logger.error(`❌ Seeding failed: ${err.message}`, { stack: err.stack });
    return { seeded: false, error: err.message };
  }
}
