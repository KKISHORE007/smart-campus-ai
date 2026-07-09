// ============================================================
// Student Helpdesk Agent — Persistent Disk Database Store
// ============================================================
// Persists all institutional data (users, credentials, fees,
// announcements, marks, pre-approvals) to disk in data/database.json
// Ensures seamless operation with or without MongoDB.
// ============================================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.resolve(__dirname, '../../data/database.json');

// Ensure data directory exists
const dataDir = path.dirname(DB_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Default initial state
const defaultDbState = {
  users: [
    {
      userId: 'SUPER-STARK-001',
      loginId: 'stark@123',
      email: 'stark@xyzec.edu',
      password: '12345678',
      name: 'Tony Stark (Super Admin)',
      role: 'super_admin',
      institutionId: 'inst-xyz-001',
      department: 'Executive Board',
      status: 'approved',
      createdAt: new Date().toISOString()
    },
    {
      userId: 'HOD-CSE-001',
      loginId: 'hod.cse',
      email: 'hod.cse@xyzec.edu',
      password: 'hod12345',
      name: 'Dr. R. K. Sharma',
      role: 'hod',
      institutionId: 'inst-xyz-001',
      department: 'Computer Science & Engineering',
      status: 'approved',
      joiningDate: '10-05-2019',
      createdAt: new Date().toISOString()
    },
    {
      userId: 'STAFF-LIB-001',
      loginId: 'staff.lib',
      email: 'staff.lib@xyzec.edu',
      password: 'staff12345',
      name: 'Prof. Anita Desai',
      role: 'staff',
      staffType: 'subject_staff',
      institutionId: 'inst-xyz-001',
      department: 'Library / Admin',
      status: 'approved',
      createdAt: new Date().toISOString()
    },
    {
      userId: 'STAFF-CSE-002',
      loginId: 'prof_cse',
      email: 'ramesh.cse@xyzec.edu',
      password: 'staff12345',
      name: 'Dr. Ramesh Kumar',
      role: 'staff',
      staffType: 'class_advisor',
      section: 'A',
      advisorYear: '2nd Year',
      institutionId: 'inst-xyz-001',
      department: 'Computer Science & Engineering',
      status: 'approved',
      createdAt: new Date().toISOString()
    },
    {
      userId: 'STU-ROHIT-001',
      loginId: 'rohit@xyzec.edu',
      email: 'rohit@xyzec.edu',
      password: 'student123',
      name: 'Rohit Kumar',
      role: 'student',
      registerNo: 'REG-2026-0001',
      institutionId: 'inst-xyz-001',
      department: 'Computer Science & Engineering',
      joinYear: '2026',
      status: 'approved',
      createdAt: new Date().toISOString()
    }
  ],
  announcements: [
    {
      id: 101,
      title: 'Mid-Semester Examination Schedule Announced',
      content: 'The Mid-Semester examinations for B.Tech 2nd, 3rd, and 4th years will commence from October 15th.',
      authorRole: 'hod',
      authorName: 'Dr. R. K. Sharma (HOD CSE)',
      priority: 'high',
      date: '08/07/2026'
    },
    {
      id: 102,
      title: 'Lab Submission Deadline Reminder',
      content: 'All 2nd Year Section A students must submit their DBMS Record files by Friday.',
      authorRole: 'staff',
      authorName: 'Dr. Ramesh Kumar (Class Advisor)',
      priority: 'medium',
      date: '08/07/2026'
    }
  ],
  feeStructures: {
    'Computer Science & Engineering___1st Year': {
      department: 'Computer Science & Engineering',
      year: '1st Year',
      tuitionFee: 120000,
      labFee: 15000,
      developmentFee: 10000,
      totalFee: 145000
    }
  },
  studentMarks: {},
  studentFeesProgress: {}
};

// Load or initialize DB
function loadDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultDbState, null, 2), 'utf8');
      return defaultDbState;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    logger.error('Error loading DB file, falling back to defaultDbState:', err.message);
    return defaultDbState;
  }
}

function saveDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    logger.error('Error saving DB file:', err.message);
  }
}

export const dbStore = {
  getDb: () => loadDb(),

  // Users
  getUsers: () => {
    const db = loadDb();
    return db.users || [];
  },

  getUserByIdentifier: (identifier) => {
    if (!identifier) return null;
    const db = loadDb();
    const cleanId = identifier.trim().toLowerCase();
    return (db.users || []).find(u => 
      (u.loginId && u.loginId.toLowerCase() === cleanId) ||
      (u.email && u.email.toLowerCase() === cleanId) ||
      (u.registerNo && u.registerNo.toLowerCase() === cleanId) ||
      (u.userId && u.userId.toLowerCase() === cleanId)
    );
  },

  saveUser: (userObj) => {
    const db = loadDb();
    const users = db.users || [];
    const idx = users.findIndex(u => 
      (u.loginId && userObj.loginId && u.loginId.toLowerCase() === userObj.loginId.toLowerCase()) ||
      (u.email && userObj.email && u.email.toLowerCase() === userObj.email.toLowerCase()) ||
      (u.userId && userObj.userId && u.userId === userObj.userId)
    );

    if (idx >= 0) {
      users[idx] = { ...users[idx], ...userObj, updatedAt: new Date().toISOString() };
    } else {
      const newUser = {
        userId: userObj.userId || `USER-${Date.now()}`,
        status: 'pending_approval',
        createdAt: new Date().toISOString(),
        ...userObj
      };
      users.push(newUser);
    }
    db.users = users;
    saveDb(db);
    return userObj;
  },

  updateUserStatus: (identifier, newStatus) => {
    const db = loadDb();
    const users = db.users || [];
    const cleanId = identifier.trim().toLowerCase();
    const idx = users.findIndex(u => 
      (u.loginId && u.loginId.toLowerCase() === cleanId) ||
      (u.email && u.email.toLowerCase() === cleanId) ||
      (u.userId && u.userId.toLowerCase() === cleanId)
    );
    if (idx >= 0) {
      users[idx].status = newStatus;
      db.users = users;
      saveDb(db);
      return users[idx];
    }
    return null;
  },

  // Announcements
  getAnnouncements: () => {
    const db = loadDb();
    return db.announcements || [];
  },

  addAnnouncement: (annObj) => {
    const db = loadDb();
    const list = db.announcements || [];
    const entry = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-GB'),
      ...annObj
    };
    list.unshift(entry);
    db.announcements = list;
    saveDb(db);
    return entry;
  },

  deleteAnnouncement: (id) => {
    const db = loadDb();
    db.announcements = (db.announcements || []).filter(a => String(a.id) !== String(id));
    saveDb(db);
    return true;
  },

  // Fee Structures
  getFeeStructures: () => {
    const db = loadDb();
    return db.feeStructures || {};
  },

  saveFeeStructure: (key, data) => {
    const db = loadDb();
    db.feeStructures = db.feeStructures || {};
    db.feeStructures[key] = data;
    saveDb(db);
    return data;
  },

  // Marks
  getMarks: () => {
    const db = loadDb();
    return db.studentMarks || {};
  },

  saveMarks: (studentId, marksData) => {
    const db = loadDb();
    db.studentMarks = db.studentMarks || {};
    db.studentMarks[studentId] = marksData;
    saveDb(db);
    return marksData;
  }
};
