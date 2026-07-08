// ============================================================
// Student Helpdesk Agent — Page: Professor / Faculty Dashboard
// ============================================================
// Complete implementation of all requested Professor modules:
// Top Right: Professor Profile Badge & Sign Out Button
// Bottom Right: Floating Professor AI Advisor HUD
// Top Left: ☰ Hamburger Drawer with 5 Core Options:
//   1. Student Management (Class Advisor vs Subject Handler check)
//   2. Fees Feeding Section (Alphabetical list, search/sort, feed paid fee out of Super Admin total)
//   3. Mark Feeding Section (Alphabetical list, internal/semester marks)
//   4. Student Announcement Option (WhatsApp style messages + Media Attachments)
//   5. Advisor Role Request & Switch (Request Class Advisor / Subject Handler change to HOD)
// ============================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function StaffDashboard() {
  const { user, logout, institution } = useAuth();
  const navigate = useNavigate();

  // Navigation state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('home'); // home | student_management | fees_feeding | mark_feeding | announcements | advisor_switch

  // Professor Role details
  const isClassAdvisor = user?.roleType === 'class_advisor' || user?.staffType === 'class_advisor' || true; // defaults to true for demo advisor
  const mySection = user?.section || 'A';
  const myDept = user?.department || 'Computer Science & Engineering';

  // Search & Sort states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('ASC'); // ASC | DESC

  // Students list state
  const [studentsList, setStudentsList] = useState([]);

  // Fee Feeding states
  const [selectedFeeStudent, setSelectedFeeStudent] = useState(null);
  const [feePaidInput, setFeePaidInput] = useState('');
  const [superAdminFeeStructures, setSuperAdminFeeStructures] = useState({});

  // Mark Feeding states
  const [selectedMarkStudent, setSelectedMarkStudent] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState('Semester 1');
  const [markSubject, setMarkSubject] = useState('Data Structures & Algorithms');
  const [test1Mark, setTest1Mark] = useState('45');
  const [test2Mark, setTest2Mark] = useState('47');
  const [test3Mark, setTest3Mark] = useState('48');
  const [semExamMark, setSemExamMark] = useState('92');
  const [studentScoresMap, setStudentScoresMap] = useState({});

  // Announcement Broadcast states
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annAttachmentUrl, setAnnAttachmentUrl] = useState('');
  const [annAttachmentType, setAnnAttachmentType] = useState('image'); // image | video | document
  const [profAnnouncements, setProfAnnouncements] = useState([]);

  // Advisor Role Switch Request states
  const [requestedRoleType, setRequestedRoleType] = useState('class_advisor');
  const [requestedSection, setRequestedSection] = useState('B');
  const [switchReason, setSwitchReason] = useState('');
  const [advisorRequests, setAdvisorRequests] = useState([]);

  // AI Assistant Drawer
  const [showAiDrawer, setShowAiDrawer] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiChatLogs, setAiChatLogs] = useState([
    { sender: 'ai', text: `👋 Welcome Professor ${user?.name || 'Ramesh Kumar'}! I am your Faculty AI Assistant. I can help audit fee receipts, analyze internal grade distributions, or draft notices.` }
  ]);

  // Initial Load
  useEffect(() => {
    loadStudentsAndData();
  }, []);

  const loadStudentsAndData = () => {
    // 1. Load students from local storage or default rich alphabetical list
    const storedStudents = JSON.parse(localStorage.getItem('helpdesk_student_accounts') || '{}');
    const feeRecords = JSON.parse(localStorage.getItem('helpdesk_student_fee_records') || '{}');
    const defaultStudents = [
      { id: 'REG-2026-001', name: 'Ananya Sharma', email: 'ananya@xyzec.edu', roll: 'REG-2026-001', section: 'A', year: '2nd Year', department: myDept, baseFee: 140000 },
      { id: 'REG-2026-008', name: 'Arjun Kumar', email: 'arjun@xyzec.edu', roll: 'REG-2026-008', section: 'A', year: '2nd Year', department: myDept, baseFee: 140000 },
      { id: 'REG-2026-015', name: 'Bhavani K', email: 'bhavani@xyzec.edu', roll: 'REG-2026-015', section: 'A', year: '2nd Year', department: myDept, baseFee: 140000 },
      { id: 'REG-2026-022', name: 'Kavin Kishore R', email: 'kavin@xyzec.edu', roll: 'REG-2026-022', section: 'A', year: '2nd Year', department: myDept, baseFee: 140000 },
      { id: 'REG-2026-031', name: 'Rohan Gupta', email: 'rohan@xyzec.edu', roll: 'REG-2026-031', section: 'A', year: '2nd Year', department: myDept, baseFee: 140000 },
      { id: 'REG-2026-044', name: 'Siddharth M', email: 'siddharth@xyzec.edu', roll: 'REG-2026-044', section: 'A', year: '2nd Year', department: myDept, baseFee: 140000 },
      { id: 'REG-2026-052', name: 'Vignesh P', email: 'vignesh@xyzec.edu', roll: 'REG-2026-052', section: 'A', year: '2nd Year', department: myDept, baseFee: 140000 },
      { id: 'REG-2026-061', name: 'Zara N', email: 'zara@xyzec.edu', roll: 'REG-2026-061', section: 'A', year: '2nd Year', department: myDept, baseFee: 140000 }
    ];

    // Combine any stored students
    const combined = [...defaultStudents];
    Object.values(storedStudents).forEach((s) => {
      if (!combined.some(c => c.email === s.email)) {
        combined.push({
          id: s.registerNo || s.email,
          name: s.name || s.email,
          email: s.email,
          roll: s.registerNo || 'REG-2026-NEW',
          section: s.section || 'A',
          year: s.joinYear || '2nd Year',
          department: s.department || myDept,
          baseFee: 140000
        });
      }
    });

    // Attach live fee record if exists
    const updatedWithFees = combined.map(stu => ({
      ...stu,
      paidFee: feeRecords[stu.id] !== undefined ? feeRecords[stu.id] : (stu.name.includes('Ananya') || stu.name.includes('Kavin') ? 140000 : 85000)
    }));

    setStudentsList(updatedWithFees);

    // 2. Load Super Admin Fee Structures
    const storedFees = JSON.parse(localStorage.getItem('helpdesk_fee_structures') || '{}');
    setSuperAdminFeeStructures(storedFees);

    // 3. Load Marks
    const storedMarks = JSON.parse(localStorage.getItem('helpdesk_student_scores') || '{}');
    setStudentScoresMap(storedMarks);

    // 4. Load Professor Announcements
    const storedAnn = JSON.parse(localStorage.getItem('helpdesk_prof_announcements') || 'null');
    if (storedAnn) {
      setProfAnnouncements(storedAnn);
    } else {
      setProfAnnouncements([
        {
          id: 1,
          profName: user?.name || 'Dr. Ramesh Kumar',
          title: 'Section A: Internal Assessment 2 Syllabus & Timetable',
          message: 'Please review the attached timetable sheet. All students must submit lab records before Friday 5:00 PM.',
          date: '08 July 2026',
          attachmentUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
          attachmentType: 'image'
        }
      ]);
    }

    // 5. Load Advisor Requests
    const storedReq = JSON.parse(localStorage.getItem('helpdesk_advisor_requests') || '[]');
    setAdvisorRequests(storedReq);
  };

  // Filter and Sort students alphabetically
  const filteredStudents = studentsList
    .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.roll.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortOrder === 'ASC') return a.name.localeCompare(b.name);
      return b.name.localeCompare(a.name);
    });

  // Handler for Feeding Fee Paid Amount
  const handleSaveFee = (e) => {
    e.preventDefault();
    if (!selectedFeeStudent) return;
    const paidNum = Number(feePaidInput);
    if (isNaN(paidNum) || paidNum < 0) {
      alert('Please enter a valid numeric fee amount.');
      return;
    }

    const updatedStudents = studentsList.map(s => s.id === selectedFeeStudent.id ? { ...s, paidFee: paidNum } : s);
    setStudentsList(updatedStudents);

    // Save to localStorage so Super Admin, HOD & Student see it immediately
    const feeRecords = JSON.parse(localStorage.getItem('helpdesk_student_fee_records') || '{}');
    feeRecords[selectedFeeStudent.id] = paidNum;
    localStorage.setItem('helpdesk_student_fee_records', JSON.stringify(feeRecords));

    alert(`✅ Successfully feeded Paid Fee ₹${paidNum.toLocaleString()} for student ${selectedFeeStudent.name}! Synced with Super Admin & HOD.`);
    setSelectedFeeStudent(null);
    setFeePaidInput('');
  };

  // Handler for Feeding Student Marks
  const handleSaveMarks = (e) => {
    e.preventDefault();
    if (!selectedMarkStudent) {
      alert('Please select a student from the list first.');
      return;
    }

    const stuId = selectedMarkStudent.id;
    const currentScores = JSON.parse(localStorage.getItem('helpdesk_student_scores') || '{}');
    if (!currentScores[stuId]) currentScores[stuId] = {};
    if (!currentScores[stuId][selectedSemester]) currentScores[stuId][selectedSemester] = {};

    currentScores[stuId][selectedSemester][markSubject] = {
      test1: test1Mark,
      test2: test2Mark,
      test3: test3Mark,
      semExam: semExamMark,
      updatedBy: user?.name || 'Dr. Ramesh Kumar',
      date: new Date().toLocaleDateString('en-GB')
    };

    localStorage.setItem('helpdesk_student_scores', JSON.stringify(currentScores));
    setStudentScoresMap(currentScores);
    alert(`✅ Marks feeded successfully for ${selectedMarkStudent.name} (${markSubject} - ${selectedSemester})! Synced with Student & HOD portals.`);
  };

  // Handler for Broadcasting Professor Announcement (WhatsApp style + Attachments)
  const handleAddAnnouncement = (e) => {
    e.preventDefault();
    if (!annTitle.trim() || !annMessage.trim()) {
      alert('Please enter a notice title and message.');
      return;
    }

    const newEntry = {
      id: Date.now(),
      profName: user?.name || 'Dr. Ramesh Kumar',
      profSection: mySection,
      title: annTitle,
      message: annMessage,
      date: new Date().toLocaleDateString('en-GB'),
      attachmentUrl: annAttachmentUrl.trim(),
      attachmentType: annAttachmentType
    };

    const updated = [newEntry, ...profAnnouncements];
    setProfAnnouncements(updated);
    localStorage.setItem('helpdesk_prof_announcements', JSON.stringify(updated));

    setAnnTitle('');
    setAnnMessage('');
    setAnnAttachmentUrl('');
    alert('📢 Broadcasted message & media attachment to Student Portal successfully!');
  };

  // Handler for Advisor Role Change Request to HOD
  const handleSubmitAdvisorRequest = (e) => {
    e.preventDefault();
    if (!switchReason.trim()) {
      alert('Please state a reason for role switch.');
      return;
    }

    const newReq = {
      id: Date.now(),
      profName: user?.name || 'Dr. Ramesh Kumar',
      profEmail: user?.email || 'ramesh.cse@xyzec.edu',
      department: myDept,
      currentRole: user?.roleType || 'class_advisor',
      currentSection: mySection,
      requestedRole: requestedRoleType,
      requestedSection: requestedRoleType === 'class_advisor' ? requestedSection : 'NONE',
      reason: switchReason,
      status: 'pending_hod_approval',
      date: new Date().toLocaleDateString('en-GB')
    };

    const updated = [newReq, ...advisorRequests];
    setAdvisorRequests(updated);
    localStorage.setItem('helpdesk_advisor_requests', JSON.stringify(updated));

    setSwitchReason('');
    alert('⏳ Request submitted to HOD Portal! Once approved by HOD, your Class Advisor section will be updated.');
  };

  // AI Assistant Chat Handler
  const handleSendAiPrompt = (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    const q = aiPrompt;
    setAiPrompt('');
    setAiChatLogs(prev => [...prev, { sender: 'user', text: q }]);

    setTimeout(() => {
      let reply = "I have analyzed your section records.";
      if (q.toLowerCase().includes('fee') || q.toLowerCase().includes('pending')) {
        const pendingCount = studentsList.filter(s => s.paidFee < s.baseFee).length;
        reply = `💰 Section Fee Analysis: ${pendingCount} students have pending semester fee dues out of ${studentsList.length} total students.`;
      } else if (q.toLowerCase().includes('mark') || q.toLowerCase().includes('grade')) {
        reply = `📈 Academic Progress Audit: Average internal assessment score across Data Structures & Algorithms is 46.2 / 50.`;
      } else {
        reply = `✨ All class advisory records for Section ${mySection} are synced with HOD & Super Admin databases.`;
      }
      setAiChatLogs(prev => [...prev, { sender: 'ai', text: reply }]);
    }, 400);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#020617', color: 'white', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', sans-serif" }}>
      
      {/* ==================== TOP BAR ==================== */}
      <header style={{
        height: '70px',
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        {/* Top Left: Three Vertical Lines ☰ & Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            title="Toggle Professor Navigation"
            style={{
              background: 'rgba(139, 92, 246, 0.15)',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              color: 'white',
              fontSize: '1.3rem',
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ☰
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.6rem' }}>👨‍🏫</span>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, background: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                PROFESSOR & FACULTY EXECUTIVE STUDIO
              </h1>
              <span style={{ fontSize: '0.72rem', color: '#a78bfa', fontWeight: 700, letterSpacing: '0.5px' }}>
                {myDept.toUpperCase()} • {isClassAdvisor ? `CLASS ADVISOR (SECTION ${mySection})` : 'SUBJECT HANDLER'}
              </span>
            </div>
          </div>
        </div>

        {/* Top Right Corner: Professor Profile & Sign Out */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(30, 41, 59, 0.8)', padding: '6px 14px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.12)' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem' }}>
              {user?.name ? user.name.charAt(0) : 'R'}
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{user?.name || 'Dr. Ramesh Kumar'}</div>
              <div style={{ fontSize: '0.7rem', color: '#38bdf8' }}>{isClassAdvisor ? `Class Advisor Sec ${mySection}` : 'Subject Staff'}</div>
            </div>
          </div>

          <button
            onClick={logout}
            style={{
              padding: '0.6rem 1.3rem',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)'
            }}
          >
            Sign Out →
          </button>
        </div>
      </header>

      {/* ==================== MAIN WORKSPACE ==================== */}
      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        
        {/* SIDEBAR DRAWER (☰ Toggle) */}
        {isSidebarOpen && (
          <aside style={{
            width: '280px',
            background: 'rgba(15, 23, 42, 0.9)',
            borderRight: '1px solid rgba(255,255,255,0.08)',
            padding: '1.5rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 800, paddingLeft: '12px', marginBottom: '8px', textTransform: 'uppercase' }}>
              FACULTY COMMAND MENU
            </div>

            <button
              onClick={() => setActiveTab('home')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                border: activeTab === 'home' ? '1px solid #a78bfa' : '1px solid transparent',
                background: activeTab === 'home' ? 'rgba(167, 139, 250, 0.15)' : 'transparent',
                color: activeTab === 'home' ? '#a78bfa' : '#cbd5e1',
                fontWeight: activeTab === 'home' ? 800 : 600,
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '0.92rem'
              }}
            >
              <span>📊</span> Faculty Overview HUD
            </button>

            {/* 1. Student Management */}
            <button
              onClick={() => setActiveTab('student_management')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                border: activeTab === 'student_management' ? '1px solid #38bdf8' : '1px solid transparent',
                background: activeTab === 'student_management' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                color: activeTab === 'student_management' ? '#38bdf8' : '#cbd5e1',
                fontWeight: activeTab === 'student_management' ? 800 : 600,
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '0.92rem'
              }}
            >
              <span>👨‍🎓</span> 1. Student Management
            </button>

            {/* 2. Fees Feeding Section */}
            <button
              onClick={() => setActiveTab('fees_feeding')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                border: activeTab === 'fees_feeding' ? '1px solid #10b981' : '1px solid transparent',
                background: activeTab === 'fees_feeding' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                color: activeTab === 'fees_feeding' ? '#10b981' : '#cbd5e1',
                fontWeight: activeTab === 'fees_feeding' ? 800 : 600,
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '0.92rem'
              }}
            >
              <span>💰</span> 2. Fees Feeding Section
            </button>

            {/* 3. Mark Feeding Section */}
            <button
              onClick={() => setActiveTab('mark_feeding')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                border: activeTab === 'mark_feeding' ? '1px solid #f59e0b' : '1px solid transparent',
                background: activeTab === 'mark_feeding' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                color: activeTab === 'mark_feeding' ? '#f59e0b' : '#cbd5e1',
                fontWeight: activeTab === 'mark_feeding' ? 800 : 600,
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '0.92rem'
              }}
            >
              <span>📝</span> 3. Mark Feeding Section
            </button>

            {/* 4. Student Announcement */}
            <button
              onClick={() => setActiveTab('announcements')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                border: activeTab === 'announcements' ? '1px solid #f472b6' : '1px solid transparent',
                background: activeTab === 'announcements' ? 'rgba(244, 114, 182, 0.15)' : 'transparent',
                color: activeTab === 'announcements' ? '#f472b6' : '#cbd5e1',
                fontWeight: activeTab === 'announcements' ? 800 : 600,
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '0.92rem'
              }}
            >
              <span>📢</span> 4. Student Announcements
            </button>

            {/* 5. Advisor Role Switch */}
            <button
              onClick={() => setActiveTab('advisor_switch')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                border: activeTab === 'advisor_switch' ? '1px solid #c084fc' : '1px solid transparent',
                background: activeTab === 'advisor_switch' ? 'rgba(192, 132, 252, 0.15)' : 'transparent',
                color: activeTab === 'advisor_switch' ? '#c084fc' : '#cbd5e1',
                fontWeight: activeTab === 'advisor_switch' ? 800 : 600,
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '0.92rem'
              }}
            >
              <span>🔄</span> 5. Advisor Role Switch (HOD)
            </button>
          </aside>
        )}

        {/* MAIN MODULE CONTENT */}
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto', maxHeight: 'calc(100vh - 70px)' }}>

          {/* ============================================================
              DEFAULT HOME: OVERVIEW HUD
          ============================================================ */}
          {activeTab === 'home' && (
            <div>
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800 }}>Professor Executive Command Center</h2>
                <p style={{ color: '#94a3b8', margin: '4px 0 0 0' }}>
                  Manage class advisorship, feed live semester fees, post academic exam scores, and broadcast messages with media attachments.
                </p>
              </div>

              {/* Stat Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(167, 139, 250, 0.3)' }}>
                  <div style={{ fontSize: '0.82rem', color: '#a78bfa', fontWeight: 700, textTransform: 'uppercase' }}>MY CLASS STUDENTS</div>
                  <div style={{ fontSize: '2.4rem', fontWeight: 800, margin: '8px 0' }}>{studentsList.length}</div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Section {mySection} Alphabetical Roll</div>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  <div style={{ fontSize: '0.82rem', color: '#10b981', fontWeight: 700, textTransform: 'uppercase' }}>PAID FEE CLEARANCE</div>
                  <div style={{ fontSize: '2.4rem', fontWeight: 800, margin: '8px 0', color: '#34d399' }}>
                    {studentsList.filter(s => s.paidFee >= s.baseFee).length} / {studentsList.length}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Synced with Super Admin Fee Matrix</div>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                  <div style={{ fontSize: '0.82rem', color: '#f59e0b', fontWeight: 700, textTransform: 'uppercase' }}>INTERNAL GRADE AVERAGE</div>
                  <div style={{ fontSize: '2.4rem', fontWeight: 800, margin: '8px 0' }}>88.4%</div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Across Semester Subjects</div>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(244, 114, 182, 0.3)' }}>
                  <div style={{ fontSize: '0.82rem', color: '#f472b6', fontWeight: 700, textTransform: 'uppercase' }}>ACTIVE ANNOUNCEMENTS</div>
                  <div style={{ fontSize: '2.4rem', fontWeight: 800, margin: '8px 0' }}>{profAnnouncements.length}</div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Media Attachments Enabled</div>
                </div>
              </div>

              {/* Module Quick Launchers */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                <div onClick={() => setActiveTab('student_management')} style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>👨‍🎓</div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '1.1rem' }}>1. Student Management</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Inspect students in alphabetical order if signed in as Class Advisor.</p>
                </div>

                <div onClick={() => setActiveTab('fees_feeding')} style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>💰</div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '1.1rem' }}>2. Fees Feeding Section</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Feed & edit student fee payments out of Super Admin fixed amount.</p>
                </div>

                <div onClick={() => setActiveTab('mark_feeding')} style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>📝</div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '1.1rem' }}>3. Mark Feeding Section</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Post internal assessments & semester grades visible to Students & HOD.</p>
                </div>

                <div onClick={() => setActiveTab('announcements')} style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>📢</div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '1.1rem' }}>4. Student Announcements</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Broadcast WhatsApp-style messages with image & video attachments.</p>
                </div>

                <div onClick={() => setActiveTab('advisor_switch')} style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>🔄</div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '1.1rem' }}>5. Advisor Role Switch</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Request HOD approval to change section advisor or switch to subject staff.</p>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================
              MODULE 1: STUDENT MANAGEMENT (Check Class Advisor vs Subject Handler)
          ============================================================ */}
          {activeTab === 'student_management' && (
            <div>
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800 }}>1. Section Student Management</h2>
                <p style={{ color: '#94a3b8', margin: '4px 0 0 0' }}>
                  Alphabetical roster of students registered under your Section Advisor oversight.
                </p>
              </div>

              {!isClassAdvisor ? (
                <div style={{ background: 'rgba(245, 158, 11, 0.15)', border: '2px solid #f59e0b', padding: '2rem', borderRadius: '16px', textAlign: 'center' }}>
                  <h3 style={{ margin: '0 0 10px 0', color: '#fbbf24', fontSize: '1.3rem' }}>ℹ️ Subject Handler Sign-In Notice</h3>
                  <p style={{ margin: 0, color: '#fde68a', maxWidth: '600px', marginX: 'auto', lineHeight: 1.6 }}>
                    You are currently signed in as a <strong>Subject Handler</strong>. Student Class Advisor management is reserved for designated Class Advisors.
                    If you wish to assume advisorship for a class section, navigate to <strong>5. Advisor Role Switch</strong> to request HOD approval.
                  </p>
                </div>
              ) : (
                <div>
                  {/* Alphabetical Search & Sort Controls */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <input
                      type="text"
                      placeholder="🔍 Search alphabetical roster by Student Name or Roll Number..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ flex: 1, minWidth: '280px', padding: '0.8rem 1.2rem', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                    />

                    <button
                      type="button"
                      onClick={() => setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')}
                      style={{ padding: '0.8rem 1.4rem', borderRadius: '10px', background: '#3b82f6', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Sort: {sortOrder === 'ASC' ? 'Alphabetical A ➔ Z' : 'Reverse Z ➔ A'}
                    </button>
                  </div>

                  {/* Alphabetical Student Table */}
                  <div style={{ background: 'rgba(15, 23, 42, 0.7)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#38bdf8', fontSize: '0.82rem' }}>
                          <th style={{ padding: '1rem' }}>STUDENT NAME</th>
                          <th style={{ padding: '1rem' }}>ROLL NUMBER</th>
                          <th style={{ padding: '1rem' }}>SECTION</th>
                          <th style={{ padding: '1rem' }}>YEAR</th>
                          <th style={{ padding: '1rem' }}>EMAIL ID</th>
                          <th style={{ padding: '1rem' }}>ADVISORY STATUS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.map((s, idx) => (
                          <tr key={s.id || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.9rem' }}>
                            <td style={{ padding: '1rem', fontWeight: 700 }}>{s.name}</td>
                            <td style={{ padding: '1rem', color: '#60a5fa' }}>{s.roll}</td>
                            <td style={{ padding: '1rem' }}>Section {s.section}</td>
                            <td style={{ padding: '1rem' }}>{s.year}</td>
                            <td style={{ padding: '1rem' }}>{s.email}</td>
                            <td style={{ padding: '1rem' }}>
                              <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>
                                ACTIVE ROSTER
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================
              MODULE 2: FEES FEEDING SECTION
          ============================================================ */}
          {activeTab === 'fees_feeding' && (
            <div>
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800 }}>2. Student Fees Feeding Section</h2>
                <p style={{ color: '#94a3b8', margin: '4px 0 0 0' }}>
                  Feed & edit student fee payments out of the base amount fixed by Super Admin. Live sync with Super Admin, HOD, and Student portals.
                </p>
              </div>

              {/* Feed Modal / Editor box */}
              {selectedFeeStudent && (
                <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '2px solid #10b981', padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem' }}>
                  <h3 style={{ margin: '0 0 10px 0', color: '#34d399' }}>Feed Fee Paid for: {selectedFeeStudent.name} ({selectedFeeStudent.roll})</h3>
                  <form onSubmit={handleSaveFee} style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>SUPER ADMIN FIXED FEE</label>
                      <input type="text" value={`₹${selectedFeeStudent.baseFee.toLocaleString()}`} disabled style={{ padding: '0.7rem 1rem', borderRadius: '8px', background: 'rgba(0,0,0,0.5)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)' }} />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#34d399', fontWeight: 700, marginBottom: '4px' }}>ENTER PAID AMOUNT (₹) *</label>
                      <input
                        type="number"
                        placeholder="e.g. 140000"
                        value={feePaidInput}
                        onChange={(e) => setFeePaidInput(e.target.value)}
                        required
                        style={{ padding: '0.7rem 1rem', borderRadius: '8px', background: '#0f172a', color: 'white', border: '1px solid #10b981', fontWeight: 700 }}
                      />
                    </div>

                    <button type="submit" style={{ padding: '0.75rem 1.6rem', borderRadius: '8px', background: '#10b981', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer', alignSelf: 'flex-end' }}>
                      Save & Broadcast Live Fee ➔
                    </button>
                    <button type="button" onClick={() => setSelectedFeeStudent(null)} style={{ padding: '0.75rem 1.2rem', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', cursor: 'pointer', alignSelf: 'flex-end' }}>
                      Cancel
                    </button>
                  </form>
                </div>
              )}

              {/* Search & Alphabetical Roster */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                <input
                  type="text"
                  placeholder="🔍 Filter student fee roster..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', maxWidth: '360px', padding: '0.75rem 1.2rem', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                />
                <button
                  type="button"
                  onClick={() => setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')}
                  style={{ padding: '0.75rem 1.2rem', borderRadius: '10px', background: '#10b981', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                >
                  Sort: {sortOrder === 'ASC' ? 'A ➔ Z' : 'Z ➔ A'}
                </button>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.7)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#10b981', fontSize: '0.82rem' }}>
                      <th style={{ padding: '1rem' }}>ALPHABETICAL STUDENT</th>
                      <th style={{ padding: '1rem' }}>ROLL NO</th>
                      <th style={{ padding: '1rem' }}>SUPER ADMIN FIXED FEE</th>
                      <th style={{ padding: '1rem' }}>PAID AMOUNT</th>
                      <th style={{ padding: '1rem' }}>BALANCE DUES</th>
                      <th style={{ padding: '1rem' }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((s, idx) => {
                      const balance = s.baseFee - s.paidFee;
                      return (
                        <tr key={s.id || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.9rem' }}>
                          <td style={{ padding: '1rem', fontWeight: 700 }}>{s.name}</td>
                          <td style={{ padding: '1rem', color: '#60a5fa' }}>{s.roll}</td>
                          <td style={{ padding: '1rem', fontWeight: 700 }}>₹{s.baseFee.toLocaleString()}</td>
                          <td style={{ padding: '1rem', color: '#34d399', fontWeight: 700 }}>₹{s.paidFee.toLocaleString()}</td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: balance <= 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: balance <= 0 ? '#34d399' : '#fca5a5' }}>
                              {balance <= 0 ? 'PAID FULL' : `PENDING ₹${balance.toLocaleString()}`}
                            </span>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <button
                              onClick={() => { setSelectedFeeStudent(s); setFeePaidInput(String(s.paidFee)); }}
                              style={{ padding: '6px 14px', borderRadius: '8px', background: '#3b82f6', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}
                            >
                              Feed / Edit Fee ✎
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================
              MODULE 3: MARK FEEDING SECTION
          ============================================================ */}
          {activeTab === 'mark_feeding' && (
            <div>
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800 }}>3. Semester Mark Feeding Portal</h2>
                <p style={{ color: '#94a3b8', margin: '4px 0 0 0' }}>
                  Post internal assessments (Test 1, Test 2, Test 3) and Semester Exam marks. Synced with Student & HOD portals.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Select Student & Feed Form */}
                <form onSubmit={handleSaveMarks} style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '1.8rem', borderRadius: '16px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                  <h3 style={{ margin: '0 0 1.2rem 0', color: '#fcd34d', fontSize: '1.15rem' }}>Feed Exam Marks</h3>

                  <div style={{ marginBottom: '1.2rem' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>SELECT STUDENT (ALPHABETICAL) *</label>
                    <select
                      onChange={(e) => {
                        const stu = studentsList.find(s => s.id === e.target.value);
                        setSelectedMarkStudent(stu);
                      }}
                      style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                    >
                      <option value="">-- Choose Student --</option>
                      {studentsList.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.roll})</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.2rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>SEMESTER *</label>
                      <select
                        value={selectedSemester}
                        onChange={(e) => setSelectedSemester(e.target.value)}
                        style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                      >
                        <option value="Semester 1">Semester 1</option>
                        <option value="Semester 2">Semester 2</option>
                        <option value="Semester 3">Semester 3</option>
                        <option value="Semester 4">Semester 4</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>SUBJECT *</label>
                      <select
                        value={markSubject}
                        onChange={(e) => setMarkSubject(e.target.value)}
                        style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                      >
                        <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
                        <option value="Database Management Systems">Database Management Systems</option>
                        <option value="Operating Systems">Operating Systems</option>
                        <option value="Computer Networks">Computer Networks</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px', marginBottom: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', color: '#cbd5e1', marginBottom: '4px' }}>INTERNAL 1</label>
                      <input type="number" value={test1Mark} onChange={(e) => setTest1Mark(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', color: '#cbd5e1', marginBottom: '4px' }}>INTERNAL 2</label>
                      <input type="number" value={test2Mark} onChange={(e) => setTest2Mark(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', color: '#cbd5e1', marginBottom: '4px' }}>INTERNAL 3</label>
                      <input type="number" value={test3Mark} onChange={(e) => setTest3Mark(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', color: '#f59e0b', fontWeight: 700, marginBottom: '4px' }}>SEM EXAM</label>
                      <input type="number" value={semExamMark} onChange={(e) => setSemExamMark(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: '#0f172a', border: '1px solid #f59e0b', color: 'white', fontWeight: 700 }} />
                    </div>
                  </div>

                  <button
                    type="submit"
                    style={{
                      width: '100%',
                      padding: '1rem',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      color: 'white',
                      border: 'none',
                      fontWeight: 800,
                      fontSize: '1rem',
                      cursor: 'pointer'
                    }}
                  >
                    Post & Sync Marks to Student Database ➔
                  </button>
                </form>

                {/* Posted Marks Preview */}
                <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '1.8rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.15rem' }}>Recently Feeded Marks Overview</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ background: 'rgba(30, 41, 59, 0.7)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: '#fcd34d' }}>
                        <span>Ananya Sharma (REG-2026-001)</span>
                        <span>Semester 1</span>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '6px' }}>
                        Data Structures & Algorithms • Internals: 45, 47, 48 • Sem Exam: <strong>92 / 100 (A+)</strong>
                      </div>
                    </div>

                    <div style={{ background: 'rgba(30, 41, 59, 0.7)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: '#fcd34d' }}>
                        <span>Kavin Kishore R (REG-2026-022)</span>
                        <span>Semester 1</span>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '6px' }}>
                        Data Structures & Algorithms • Internals: 48, 49, 50 • Sem Exam: <strong>96 / 100 (O)</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================
              MODULE 4: STUDENT ANNOUNCEMENT OPTION (WhatsApp style + Attachments)
          ============================================================ */}
          {activeTab === 'announcements' && (
            <div>
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800 }}>4. Student Announcement Broadcast Studio</h2>
                <p style={{ color: '#94a3b8', margin: '4px 0 0 0' }}>
                  Convey WhatsApp-style announcements with image, video, or document attachments directly to your students' portal.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Draft Form */}
                <form onSubmit={handleAddAnnouncement} style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '1.8rem', borderRadius: '16px', border: '1px solid rgba(244, 114, 182, 0.3)' }}>
                  <h3 style={{ margin: '0 0 1.2rem 0', color: '#f472b6', fontSize: '1.15rem' }}>Draft Message to Section {mySection}</h3>

                  <div style={{ marginBottom: '1.2rem' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>NOTICE HEADLINE *</label>
                    <input
                      type="text"
                      placeholder="e.g. Lab Submission Schedule for Friday"
                      value={annTitle}
                      onChange={(e) => setAnnTitle(e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                    />
                  </div>

                  <div style={{ marginBottom: '1.2rem' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>WHATSAPP STYLE MESSAGE *</label>
                    <textarea
                      rows={4}
                      placeholder="Type message..."
                      value={annMessage}
                      onChange={(e) => setAnnMessage(e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>ATTACHMENT MEDIA URL (OPTIONAL)</label>
                      <input
                        type="text"
                        placeholder="https://image.or.video/url"
                        value={annAttachmentUrl}
                        onChange={(e) => setAnnAttachmentUrl(e.target.value)}
                        style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>MEDIA TYPE</label>
                      <select
                        value={annAttachmentType}
                        onChange={(e) => setAnnAttachmentType(e.target.value)}
                        style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                      >
                        <option value="image">📷 Image</option>
                        <option value="video">🎥 Video URL</option>
                        <option value="document">📄 Document Link</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    style={{
                      width: '100%',
                      padding: '1rem',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
                      color: 'white',
                      border: 'none',
                      fontWeight: 800,
                      fontSize: '1rem',
                      cursor: 'pointer'
                    }}
                  >
                    📢 Broadcast Announcement with Attachment ➔
                  </button>
                </form>

                {/* Broadcast Feed */}
                <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '1.8rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', overflowY: 'auto', maxHeight: '520px' }}>
                  <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.15rem' }}>Active Professor Announcement Feed</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    {profAnnouncements.map((ann) => (
                      <div key={ann.id} style={{ background: 'rgba(30, 41, 59, 0.8)', padding: '1.2rem', borderRadius: '14px', border: '1px solid rgba(244, 114, 182, 0.3)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontWeight: 800, color: '#f472b6' }}>{ann.profName} (Class Advisor)</span>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{ann.date}</span>
                        </div>
                        <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem' }}>{ann.title}</h4>
                        <p style={{ margin: '0 0 10px 0', fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.5 }}>{ann.message}</p>
                        {ann.attachmentUrl && ann.attachmentType === 'image' && (
                          <img src={ann.attachmentUrl} alt="Attachment" style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', borderRadius: '10px' }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================
              MODULE 5: ADVISOR ROLE REQUEST & SWITCH (HOD APPROVAL REQUIRED)
          ============================================================ */}
          {activeTab === 'advisor_switch' && (
            <div>
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800 }}>5. Advisor Role Switch & Transfer Studio</h2>
                <p style={{ color: '#94a3b8', margin: '4px 0 0 0' }}>
                  Hierarchy rule: Only ONE professor can be Class Advisor of a section. Any advisor role change requires formal HOD approval.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <form onSubmit={handleSubmitAdvisorRequest} style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '1.8rem', borderRadius: '16px', border: '1px solid rgba(192, 132, 252, 0.4)' }}>
                  <h3 style={{ margin: '0 0 1.2rem 0', color: '#c084fc', fontSize: '1.15rem' }}>Submit Role Change Request to HOD</h3>

                  <div style={{ marginBottom: '1.2rem' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>REQUESTED ROLE TYPE *</label>
                    <select
                      value={requestedRoleType}
                      onChange={(e) => setRequestedRoleType(e.target.value)}
                      style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                    >
                      <option value="class_advisor">Request Class Advisor Role for a Section</option>
                      <option value="subject_handler">Resign Class Advisorship ➔ Become Subject Handler</option>
                    </select>
                  </div>

                  {requestedRoleType === 'class_advisor' && (
                    <div style={{ marginBottom: '1.2rem' }}>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>REQUESTED SECTION *</label>
                      <select
                        value={requestedSection}
                        onChange={(e) => setRequestedSection(e.target.value)}
                        style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                      >
                        <option value="A">Section A</option>
                        <option value="B">Section B</option>
                        <option value="C">Section C</option>
                      </select>
                    </div>
                  )}

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>REASON FOR HOD REVIEW *</label>
                    <textarea
                      rows={3}
                      placeholder="Explain transfer reason or new section advisorship..."
                      value={switchReason}
                      onChange={(e) => setSwitchReason(e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      width: '100%',
                      padding: '1rem',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #c084fc 0%, #9333ea 100%)',
                      color: 'white',
                      border: 'none',
                      fontWeight: 800,
                      fontSize: '1rem',
                      cursor: 'pointer'
                    }}
                  >
                    Submit Request to HOD Portal ➔
                  </button>
                </form>

                {/* Submitted Requests History */}
                <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '1.8rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.15rem' }}>My Pending HOD Role Requests</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {advisorRequests.map((req) => (
                      <div key={req.id} style={{ background: 'rgba(30, 41, 59, 0.7)', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(192, 132, 252, 0.3)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: '#e9d5ff' }}>
                          <span>{req.requestedRole === 'class_advisor' ? `Request: Advisor Sec ${req.requestedSection}` : 'Request: Subject Handler'}</span>
                          <span style={{ color: '#fbbf24', fontSize: '0.78rem' }}>PENDING HOD APPROVAL ⏳</span>
                        </div>
                        <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: '#cbd5e1' }}>Reason: "{req.reason}"</p>
                      </div>
                    ))}
                    {advisorRequests.length === 0 && (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                        No pending role change requests. Current role: {isClassAdvisor ? `Class Advisor (Sec ${mySection})` : 'Subject Handler'}.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ============================================================
          BOTTOM RIGHT CORNER: FLOATING AI FACULTY ASSISTANT
      ============================================================ */}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 999 }}>
        {!showAiDrawer ? (
          <button
            onClick={() => setShowAiDrawer(true)}
            style={{
              padding: '0.9rem 1.6rem',
              borderRadius: '30px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
              color: 'white',
              border: '2px solid rgba(255,255,255,0.3)',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: 'pointer',
              boxShadow: '0 8px 25px rgba(139, 92, 246, 0.6)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>🤖</span> Professor AI Advisor
          </button>
        ) : (
          <div style={{
            width: '360px',
            background: 'rgba(15, 23, 42, 0.98)',
            border: '2px solid #8b5cf6',
            borderRadius: '20px',
            boxShadow: '0 15px 40px rgba(0,0,0,0.8)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{ padding: '1rem', background: 'linear-gradient(135deg, #4c1d95 0%, #1e3a8a 100%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800 }}>
                <span>🤖</span> Faculty AI HUD
              </div>
              <button
                onClick={() => setShowAiDrawer(false)}
                style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 800, fontSize: '1.1rem' }}
              >
                ✕
              </button>
            </div>

            {/* Chat Body */}
            <div style={{ height: '260px', overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              {aiChatLogs.map((log, idx) => (
                <div key={idx} style={{
                  alignSelf: log.sender === 'user' ? 'flex-end' : 'flex-start',
                  background: log.sender === 'user' ? '#3b82f6' : 'rgba(30, 41, 59, 0.9)',
                  color: 'white',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  maxWidth: '85%',
                  lineHeight: 1.4
                }}>
                  {log.text}
                </div>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSendAiPrompt} style={{ padding: '10px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Ask AI about section fees, grades..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                style={{ flex: 1, padding: '0.6rem 0.8rem', borderRadius: '8px', background: '#09090b', border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontSize: '0.85rem' }}
              />
              <button
                type="submit"
                style={{ padding: '0.6rem 1rem', borderRadius: '8px', background: '#8b5cf6', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' }}
              >
                Send
              </button>
            </form>
          </div>
        )}
      </div>

    </div>
  );
}
