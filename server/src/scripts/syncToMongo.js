import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import User from '../models/User.js';
import Institution from '../models/Institution.js';
import Student from '../models/Student.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

// Flexible schemas for dynamic campus collections
const AnnouncementSchema = new mongoose.Schema({
  id: Number,
  title: String,
  content: String,
  authorRole: String,
  authorName: String,
  priority: String,
  date: String
}, { timestamps: true });
const Announcement = mongoose.models.Announcement || mongoose.model('Announcement', AnnouncementSchema);

const FeeStructureSchema = new mongoose.Schema({
  department: String,
  year: String,
  tuitionFee: Number,
  labFee: Number,
  developmentFee: Number,
  totalFee: Number
}, { timestamps: true });
const FeeStructure = mongoose.models.FeeStructure || mongoose.model('FeeStructure', FeeStructureSchema);

const StudentMarkSchema = new mongoose.Schema({
  registerNo: String,
  semester: Number,
  subjects: Array,
  gpa: String,
  updatedAt: String
}, { timestamps: true });
const StudentMark = mongoose.models.StudentMark || mongoose.model('StudentMark', StudentMarkSchema);

async function syncAllToAtlas() {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.includes('<db_password>') || uri.includes('PUT_YOUR_PASSWORD_HERE')) {
    console.error('❌ Error: Please replace placeholder password in server/.env with your actual MongoDB password first!');
    process.exit(1);
  }

  console.log('🔄 Connecting to MongoDB Atlas...');
  try {
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB Atlas!');

    // Read local database.json
    const dbFilePath = path.join(__dirname, '../../data/database.json');
    const dbData = fs.existsSync(dbFilePath) ? JSON.parse(fs.readFileSync(dbFilePath, 'utf8')) : {};

    // 1. Sync Users
    const users = dbData.users || [];
    for (const u of users) {
      await User.findOneAndUpdate(
        { loginId: u.loginId },
        { ...u, isActive: true },
        { upsert: true, new: true }
      );
    }
    console.log(`✅ Synced ${users.length} records into 'users' collection.`);

    // 2. Sync Institution
    await Institution.findOneAndUpdate(
      { code: 'XYZ-EC' },
      {
        name: 'XYZ Engineering College',
        code: 'XYZ-EC',
        domain: 'xyzec.edu',
        address: 'Knowledge Park IV, Campus Road',
        establishedYear: 1998,
        contactEmail: 'helpdesk@xyzec.edu',
        isActive: true
      },
      { upsert: true, new: true }
    );
    console.log(`✅ Synced institution record into 'institutions' collection.`);

    // 3. Sync Announcements
    const announcements = dbData.announcements || [
      {
        id: 101,
        title: "Mid-Semester Examination Schedule Announced",
        content: "The Mid-Semester examinations for B.Tech 2nd, 3rd, and 4th years will commence from October 15th.",
        authorRole: "hod",
        authorName: "Dr. R. K. Sharma (HOD CSE)",
        priority: "high",
        date: "08/07/2026"
      },
      {
        id: 102,
        title: "Lab Submission Deadline Reminder",
        content: "All 2nd Year Section A students must submit their DBMS Record files by Friday.",
        authorRole: "staff",
        authorName: "Dr. Ramesh Kumar (Class Advisor)",
        priority: "medium",
        date: "08/07/2026"
      }
    ];
    for (const ann of announcements) {
      await Announcement.findOneAndUpdate(
        { id: ann.id },
        ann,
        { upsert: true, new: true }
      );
    }
    console.log(`✅ Synced ${announcements.length} records into 'announcements' collection.`);

    // 4. Sync Fee Structures
    const feeStructures = dbData.feeStructures || {
      "Computer Science & Engineering___1st Year": {
        department: "Computer Science & Engineering",
        year: "1st Year",
        tuitionFee: 120000,
        labFee: 15000,
        developmentFee: 10000,
        totalFee: 145000
      }
    };
    for (const key of Object.keys(feeStructures)) {
      const fee = feeStructures[key];
      await FeeStructure.findOneAndUpdate(
        { department: fee.department, year: fee.year },
        fee,
        { upsert: true, new: true }
      );
    }
    console.log(`✅ Synced fee structure records into 'feestructures' collection.`);

    // 5. Sync Students table
    await Student.findOneAndUpdate(
      { studentId: 'REG-2026-0001' },
      {
        studentId: 'REG-2026-0001',
        name: 'Rohit Kumar',
        email: 'rohit@xyzec.edu',
        department: 'Computer Science & Engineering',
        year: 1,
        interests: ['AI', 'Web Development']
      },
      { upsert: true, new: true }
    );
    console.log(`✅ Synced student profile into 'students' collection.`);

    // 6. Sync Student Marks table
    await StudentMark.findOneAndUpdate(
      { registerNo: 'REG-2026-0001', semester: 1 },
      {
        registerNo: 'REG-2026-0001',
        semester: 1,
        gpa: '9.2',
        subjects: [
          { code: 'CS101', name: 'Engineering Mathematics I', grade: 'O', internal1: 48, internal2: 49, internal3: 50 },
          { code: 'CS102', name: 'Programming in C', grade: 'A+', internal1: 45, internal2: 47, internal3: 48 }
        ],
        updatedAt: new Date().toLocaleDateString('en-GB')
      },
      { upsert: true, new: true }
    );
    console.log(`✅ Synced student marks into 'studentmarks' collection.`);

    console.log('\n🎉 ALL 6 CAMPUS STORAGE TABLES SUCCESSFULLY CREATED IN MONGODB ATLAS!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to sync to MongoDB Atlas:', err.message);
    process.exit(1);
  }
}

syncAllToAtlas();
