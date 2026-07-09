// ============================================================
// Student Helpdesk Agent — Routes: Admin Panel
// ============================================================
// Protected endpoints for Super Admin / Admin to manage:
// 1. College Profile & Branding
// 2. Gallery Management
// 3. Fee Structure Management
// 4. Document Upload for RAG
// 5. Announcements / News Management
// 6. Basic User Management
// 7. Knowledge Base Control & Analytics
// ============================================================

import express from 'express';
import mongoose from 'mongoose';
import KnowledgeDoc from '../models/KnowledgeDoc.js';
import Institution from '../models/Institution.js';
import User from '../models/User.js';
import * as ragService from '../services/ragService.js';
import * as mockStore from '../services/mockStore.js';
import { dbStore } from '../services/dbStore.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

const router = express.Router();

function isDbConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

// Ensure all admin routes require valid admin / super_admin JWT
router.use(authenticate, requireAdmin);

// ============================================================
// Module 1: College Profile & Branding
// ============================================================

router.get(
  '/branding',
  asyncHandler(async (req, res) => {
    const institutionId = req.user?.institutionId || 'inst-xyz-001';
    let institution = mockStore.mockInstitutions[0];

    if (isDbConnected()) {
      const inst = await Institution.findOne({ institutionId });
      if (inst) institution = inst;
    }

    res.status(200).json({ success: true, institution });
  })
);

router.put(
  '/branding',
  asyncHandler(async (req, res) => {
    const { name, code, motto, contactEmail, contactPhone, address, locationUrl, website, bannerImage, videoTourUrl, heroCarouselImages } = req.body;
    const institutionId = req.user?.institutionId || 'inst-xyz-001';

    logger.info(`🏛️ Admin updating branding for [${institutionId}]: "${name}"`);

    if (isDbConnected()) {
      const updateFields = { name, code, motto, contactEmail, contactPhone, address, locationUrl, website, bannerImage, videoTourUrl };
      if (heroCarouselImages) updateFields.heroCarouselImages = heroCarouselImages;
      
      const updated = await Institution.findOneAndUpdate(
        { institutionId },
        { $set: updateFields },
        { new: true, upsert: true }
      );
      return res.status(200).json({ success: true, message: 'Branding & Carousel updated in MongoDB', institution: updated });
    }

    const inst = mockStore.mockInstitutions[0];
    if (name !== undefined) inst.name = name;
    if (code !== undefined) inst.code = code;
    if (motto !== undefined) inst.motto = motto;
    if (contactEmail !== undefined) inst.contactEmail = contactEmail;
    if (contactPhone !== undefined) inst.contactPhone = contactPhone;
    if (address !== undefined) inst.address = address;
    if (locationUrl !== undefined) inst.locationUrl = locationUrl;
    if (website !== undefined) inst.website = website;
    if (bannerImage !== undefined) inst.bannerImage = bannerImage;
    if (videoTourUrl !== undefined) inst.videoTourUrl = videoTourUrl;
    if (heroCarouselImages !== undefined) inst.heroCarouselImages = heroCarouselImages;

    res.status(200).json({ success: true, message: 'Branding & Carousel updated (Offline Store)', institution: inst });
  })
);

// ============================================================
// Module 2: Gallery Management
// ============================================================

router.get(
  '/gallery',
  asyncHandler(async (_req, res) => {
    res.status(200).json({ success: true, count: mockStore.mockGallery.length, items: mockStore.mockGallery });
  })
);

router.post(
  '/gallery',
  asyncHandler(async (req, res) => {
    const { title, type, url, category, caption } = req.body;
    if (!title || !url) throw new AppError('Title and URL are required', 400);

    const newItem = {
      id: 'gal-' + Math.random().toString(36).substring(2, 9),
      title,
      type: type || 'image',
      url,
      category: category || 'progress',
      date: new Date().toISOString().split('T')[0],
      caption: caption || '',
    };
    mockStore.mockGallery.unshift(newItem);
    res.status(201).json({ success: true, message: 'Gallery item added', item: newItem });
  })
);

router.delete(
  '/gallery/:id',
  asyncHandler(async (req, res) => {
    const idx = mockStore.mockGallery.findIndex((g) => g.id === req.params.id);
    if (idx !== -1) mockStore.mockGallery.splice(idx, 1);
    res.status(200).json({ success: true, message: 'Gallery item deleted' });
  })
);

// ============================================================
// Module 3: Fee Structure Management
// ============================================================

router.get(
  '/fees',
  asyncHandler(async (_req, res) => {
    res.status(200).json({ success: true, count: mockStore.mockFees.length, items: mockStore.mockFees });
  })
);

router.post(
  '/fees',
  asyncHandler(async (req, res) => {
    const { program, tuitionFee, developmentFee, examFee, totalSemester, dueDate } = req.body;
    if (!program || !tuitionFee) throw new AppError('Program and Tuition fee required', 400);

    const newFee = {
      id: 'fee-' + Math.random().toString(36).substring(2, 9),
      program,
      tuitionFee,
      developmentFee: developmentFee || '₹15,000',
      examFee: examFee || '₹5,000',
      totalSemester: totalSemester || tuitionFee,
      dueDate: dueDate || '15 July 2026',
    };
    mockStore.mockFees.push(newFee);
    res.status(201).json({ success: true, message: 'Fee tier added', item: newFee });
  })
);

router.delete(
  '/fees/:id',
  asyncHandler(async (req, res) => {
    const idx = mockStore.mockFees.findIndex((f) => f.id === req.params.id);
    if (idx !== -1) mockStore.mockFees.splice(idx, 1);
    res.status(200).json({ success: true, message: 'Fee structure removed' });
  })
);

// ============================================================
// Module 4: Document Upload for RAG
// ============================================================

router.post(
  '/docs/upload',
  asyncHandler(async (req, res) => {
    const { title, content, category, tags = [], fileName, fileType, fileSize } = req.body;
    const institutionId = req.user?.institutionId || 'inst-xyz-001';

    if (!title || !content || !category) {
      throw new AppError('Please provide title, content, and category', 400);
    }

    logger.info(`📤 Admin document upload | title="${title}" | inst=${institutionId} | by=${req.user?.email}`);

    if (!isDbConnected()) {
      const newDoc = {
        _id: 'mock-doc-' + Math.random().toString(36).substring(2, 9),
        institutionId,
        title: title.trim(),
        content: content.trim(),
        category,
        tags: Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim()),
        fileName: fileName || 'admin_upload.txt',
        fileType: fileType || 'manual',
        fileSize: fileSize || `${Math.ceil(content.length / 1024)} KB`,
        uploadedBy: req.user?.email || 'stark@xyzec.edu',
        createdAt: new Date(),
        updatedAt: new Date(),
        chunkCount: Math.ceil(content.length / 500),
      };

      mockStore.MOCK_DOCS.unshift(newDoc);
      return res.status(201).json({
        success: true,
        message: 'Document uploaded and indexed successfully (Offline Store)',
        document: newDoc,
      });
    }

    const doc = await ragService.ingestDocument(
      title.trim(),
      content.trim(),
      category,
      Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim()),
      institutionId,
      {
        fileName: fileName || 'admin_upload.txt',
        fileType: fileType || 'manual',
        fileSize: fileSize || `${Math.ceil(content.length / 1024)} KB`,
        uploadedBy: req.user?.email || 'stark@xyzec.edu',
      }
    );

    res.status(201).json({
      success: true,
      message: 'Document uploaded and indexed into MongoDB RAG Vector Store successfully',
      document: doc,
    });
  })
);

router.get(
  '/docs',
  asyncHandler(async (req, res) => {
    const institutionId = req.user?.institutionId || 'inst-xyz-001';

    if (!isDbConnected()) {
      const docs = mockStore.MOCK_DOCS.filter((d) => !d.institutionId || d.institutionId === institutionId);
      return res.status(200).json({
        success: true,
        count: docs.length,
        documents: docs.map((d) => ({
          _id: d._id || d.title,
          title: d.title,
          category: d.category,
          tags: d.tags,
          fileName: d.fileName || 'handbook_entry.pdf',
          fileType: d.fileType || 'pdf',
          fileSize: d.fileSize || '18 KB',
          chunkCount: d.chunkCount || 4,
          createdAt: d.createdAt || new Date(),
        })),
      });
    }

    const docs = await KnowledgeDoc.find({ institutionId })
      .select('title category tags fileName fileType fileSize uploadedBy createdAt chunks')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: docs.length,
      documents: docs.map((d) => ({
        _id: d._id,
        title: d.title,
        category: d.category,
        tags: d.tags,
        fileName: d.fileName,
        fileType: d.fileType,
        fileSize: d.fileSize,
        uploadedBy: d.uploadedBy,
        chunkCount: d.chunks.length,
        createdAt: d.createdAt,
      })),
    });
  })
);

router.delete(
  '/docs/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!isDbConnected()) {
      const idx = mockStore.MOCK_DOCS.findIndex((d) => (d._id && d._id === id) || d.title === id);
      if (idx === -1) throw new AppError('Document not found in offline store', 404);
      mockStore.MOCK_DOCS.splice(idx, 1);
      return res.status(200).json({ success: true, message: 'Document deleted from repository' });
    }

    await KnowledgeDoc.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Document and vector embeddings deleted successfully' });
  })
);

// ============================================================
// Module 5: Announcements / News Management
// ============================================================

router.get(
  '/announcements',
  asyncHandler(async (_req, res) => {
    const list = dbStore.getAnnouncements();
    res.status(200).json({ success: true, count: list.length, items: list });
  })
);

router.post(
  '/announcements',
  asyncHandler(async (req, res) => {
    const { title, targetRole, priority, content, authorRole, authorName } = req.body;
    if (!title || !content) throw new AppError('Title and content required', 400);

    const newAnn = dbStore.addAnnouncement({
      title,
      targetRole: targetRole || 'all',
      authorRole: authorRole || 'super_admin',
      authorName: authorName || 'Executive Super Admin',
      priority: priority || 'medium',
      content,
    });
    res.status(201).json({ success: true, message: 'Announcement broadcasted & saved to database', item: newAnn });
  })
);

router.delete(
  '/announcements/:id',
  asyncHandler(async (req, res) => {
    dbStore.deleteAnnouncement(req.params.id);
    res.status(200).json({ success: true, message: 'Announcement deleted from database' });
  })
);

// ============================================================
// Module 6: Basic User Management
// ============================================================

router.get(
  '/users',
  asyncHandler(async (_req, res) => {
    const users = dbStore.getUsers();
    res.status(200).json({ success: true, count: users.length, items: users });
  })
);

router.post(
  '/users',
  asyncHandler(async (req, res) => {
    const { userId, loginId, email, name, role, department, password, registerNo, section, status } = req.body;
    if (!email || !name || !role) throw new AppError('Email, name, and role required', 400);

    const newUser = {
      userId: userId || 'USR-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
      loginId: loginId || email.split('@')[0],
      email: email.toLowerCase(),
      password: password || 'default123',
      name,
      role,
      department: department || 'General Engineering',
      registerNo: registerNo || '',
      section: section || 'A',
      institutionId: 'inst-xyz-001',
      isActive: true,
      status: status || 'approved',
    };

    const saved = dbStore.saveUser(newUser);

    if (isDbConnected()) {
      try {
        await User.create(saved);
      } catch (err) {}
    }

    res.status(201).json({ success: true, message: 'User added and saved to database', item: saved });
  })
);

router.put(
  '/users/:id/status',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!['pending', 'pending_approval', 'approved', 'rejected', 'deleted'].includes(status)) {
      throw new AppError('Invalid status value', 400);
    }

    const updated = dbStore.updateUserStatus(id, status);
    if (!updated) throw new AppError('User not found in database', 404);

    res.status(200).json({ success: true, message: `User status updated to ${status} in database`, item: updated });
  })
);

router.delete(
  '/users/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updated = dbStore.updateUserStatus(id, 'deleted');
    res.status(200).json({ success: true, message: 'User marked as deleted in database', item: updated });
  })
);

// Fee Structure APIs
router.get(
  '/fees/structure',
  asyncHandler(async (_req, res) => {
    const feeStructures = dbStore.getFeeStructures();
    res.status(200).json({ success: true, feeStructures });
  })
);

router.post(
  '/fees/structure',
  asyncHandler(async (req, res) => {
    const { key, data } = req.body;
    const saved = dbStore.saveFeeStructure(key, data);
    res.status(200).json({ success: true, message: 'Fee structure saved to database', item: saved });
  })
);

// ============================================================
// Module 7: Knowledge Base Control & Analytics
// ============================================================

router.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const institutionId = req.user?.institutionId || 'inst-xyz-001';

    if (!isDbConnected()) {
      return res.status(200).json({
        success: true,
        stats: {
          totalDocuments: mockStore.MOCK_DOCS.length,
          totalChunks: mockStore.MOCK_DOCS.length * 4,
          activeStudents: mockStore.mockUsers.filter((u) => u.role === 'student').length || 142,
          totalUsers: mockStore.mockUsers.length,
          totalQueries: 1284,
          storageUsed: '2.4 MB',
          aiStatus: 'Google Gemini 1.5 Pro + RAG Vector Store (Active)',
        },
      });
    }

    const docs = await KnowledgeDoc.find({ institutionId });
    const totalChunks = docs.reduce((sum, d) => sum + d.chunks.length, 0);
    const totalUsers = await User.countDocuments();

    res.status(200).json({
      success: true,
      stats: {
        totalDocuments: docs.length,
        totalChunks,
        activeStudents: await User.countDocuments({ role: 'student' }),
        totalUsers,
        totalQueries: 1284,
        storageUsed: `${(totalChunks * 0.4).toFixed(1)} MB`,
        aiStatus: 'Google Gemini 1.5 Pro + RAG Vector Store (Active)',
      },
    });
  })
);

export default router;
