// ============================================================
// Student Helpdesk Agent — Page: Head of Department (HOD) HUD Dashboard
// ============================================================
// Features:
// 1. Top Right Profile Card (with all fed data from onboarding/admin)
// 2. Bottom Right AI Launcher
// 3. Top Left Three Vertical Lines (☰) Button to toggle HOD Management Drawer:
//    - 1. Student Management (Filtered by HOD dept, Alphabetical, Search/Recent/Sort, Full Modal with Professor cross-link)
//    - 2. Staff Management (Filtered by HOD dept, Alphabetical, Search/Recent/Sort, Full Modal with Class Advisor Section & Student list cross-link)
//    - 3. Fees Management HUD (8-Semester fee progress analytical view)
//    - 4. Student Score Management (8 Semesters: Internal Test 1, Test 2, Test 3 + Semester Exam per Sem)
//    - 5. Professor Daily Attendance Tracker (Live present count, name & role, search/sort)
// 4. Normal Main Page: Futuristic Unique Analytical Executive HUD
// ============================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function HodDashboard() {
  const { user, logout, institution } = useAuth();
  const navigate = useNavigate();

  // Load HOD Profile (Fed during onboarding or from auth)
  const [hodProfile, setHodProfile] = useState(() => {
    const saved = localStorage.getItem('helpdesk_custom_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return user || {
      name: 'Dr. R. K. Sharma',
      role: 'hod',
      email: 'hod.cse@xyzec.edu',
      department: 'Computer Science & Engineering',
      joiningDate: '2018-06-15',
      dob: '1979-04-12',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
    };
  });

  // Top Left Three Vertical Lines Menu Open/Active state
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('home'); // 'home' | 'students' | 'staff' | 'fees' | 'scores' | 'attendance'

  // Top Right Profile Modal
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Bottom Right AI Launcher Modal
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiHistory, setAiHistory] = useState([
    { role: 'assistant', text: '👋 Welcome, Dr. R. K. Sharma. I am your Department Executive AI Assistant. Ask me anything about student progress, faculty workloads, or attendance analytics.' }
  ]);

  // Search & Sort States
  const [searchTerm, setSearchTerm] = useState('');
  const [recentSearches, setRecentSearches] = useState(['Rohit Kumar', 'Dr. Ramesh Kumar', 'Semester 4 Scores', 'Fee Progress']);
  const [sortBy, setSortBy] = useState('name_asc'); // 'name_asc' | 'name_desc' | 'attendance_high'

  // Selected Detail Modals (Student Modal & Professor Modal with cross-linking)
  const [selectedStudentModal, setSelectedStudentModal] = useState(null);
  const [selectedStaffModal, setSelectedStaffModal] = useState(null);

  // Department Students List (Alphabetical Order by default)
  const [deptStudents, setDeptStudents] = useState([
    {
      id: 'REG-2026-8942',
      name: 'Aaditya Sharma',
      department: 'Computer Science & Engineering',
      section: 'A',
      year: '2nd Year',
      email: 'aaditya@xyzec.edu',
      phone: '+91 98450 11223',
      cgpa: '8.82',
      attendance: 94,
      advisorName: 'Dr. Ramesh Kumar',
      feesStatus: 'Paid (Sem 1-4)',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
    },
    {
      id: 'REG-2026-0012',
      name: 'Bhavna Menon',
      department: 'Computer Science & Engineering',
      section: 'A',
      year: '2nd Year',
      email: 'bhavna@xyzec.edu',
      phone: '+91 98112 33445',
      cgpa: '9.14',
      attendance: 97,
      advisorName: 'Dr. Ramesh Kumar',
      feesStatus: 'Paid (Sem 1-4)',
      photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80'
    },
    {
      id: 'REG-2026-0088',
      name: 'Divya Iyer',
      department: 'Computer Science & Engineering',
      section: 'B',
      year: '2nd Year',
      email: 'divya.i@xyzec.edu',
      phone: '+91 98223 44556',
      cgpa: '8.65',
      attendance: 88,
      advisorName: 'Prof. Anita Desai',
      feesStatus: 'Pending Sem 4',
      photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80'
    },
    {
      id: 'REG-2026-0105',
      name: 'Karthik Raja',
      department: 'Computer Science & Engineering',
      section: 'A',
      year: '2nd Year',
      email: 'karthik.r@xyzec.edu',
      phone: '+91 98889 00112',
      cgpa: '7.95',
      attendance: 84,
      advisorName: 'Dr. Ramesh Kumar',
      feesStatus: 'Paid (Sem 1-4)',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
    },
    {
      id: 'REG-2026-8940',
      name: 'Rohit Kumar',
      department: 'Computer Science & Engineering',
      section: 'A',
      year: '2nd Year',
      email: 'rohit@xyzec.edu',
      phone: '+91 98765 43210',
      cgpa: '8.45',
      attendance: 91,
      advisorName: 'Dr. Ramesh Kumar',
      feesStatus: 'Paid (Sem 1-4)',
      photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80'
    },
    {
      id: 'REG-2026-0210',
      name: 'Siddharth Rao',
      department: 'Computer Science & Engineering',
      section: 'B',
      year: '2nd Year',
      email: 'siddharth@xyzec.edu',
      phone: '+91 99001 22334',
      cgpa: '8.90',
      attendance: 92,
      advisorName: 'Prof. Anita Desai',
      feesStatus: 'Paid (Sem 1-4)',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
    }
  ]);

  // Department Professors List (Alphabetical Order by default)
  const [deptProfessors, setDeptProfessors] = useState([
    {
      id: 'PROF-101',
      name: 'Dr. Ramesh Kumar',
      department: 'Computer Science & Engineering',
      roleType: 'class_advisor',
      section: 'A',
      advisorYear: '2nd Year (2025 Batch)',
      email: 'ramesh.cse@xyzec.edu',
      joiningDate: '2019-07-01',
      presentToday: true,
      checkInTime: '08:42 AM',
      photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
      advisedStudentNames: ['Aaditya Sharma', 'Bhavna Menon', 'Karthik Raja', 'Rohit Kumar']
    },
    {
      id: 'PROF-102',
      name: 'Dr. S. K. Raman',
      department: 'Computer Science & Engineering',
      roleType: 'subject_handler',
      section: '-',
      advisorYear: '-',
      email: 'raman.cse@xyzec.edu',
      joiningDate: '2016-04-10',
      presentToday: true,
      checkInTime: '08:50 AM',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      advisedStudentNames: []
    },
    {
      id: 'PROF-103',
      name: 'Prof. Anita Desai',
      department: 'Computer Science & Engineering',
      roleType: 'class_advisor',
      section: 'B',
      advisorYear: '2nd Year (2025 Batch)',
      email: 'anita.cse@xyzec.edu',
      joiningDate: '2021-08-20',
      presentToday: true,
      checkInTime: '08:35 AM',
      photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      advisedStudentNames: ['Divya Iyer', 'Siddharth Rao']
    },
    {
      id: 'PROF-104',
      name: 'Prof. Meenakshi Sundaram',
      department: 'Computer Science & Engineering',
      roleType: 'subject_handler',
      section: '-',
      advisorYear: '-',
      email: 'meenakshi.cse@xyzec.edu',
      joiningDate: '2022-01-15',
      presentToday: false,
      checkInTime: 'On Approved Leave',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      advisedStudentNames: []
    }
  ]);

  // Load dynamically created professors & students from localStorage
  useEffect(() => {
    try {
      const profAccs = JSON.parse(localStorage.getItem('helpdesk_professor_accounts') || '{}');
      const extraProfs = Object.values(profAccs).filter((p) => p && p.name);
      if (extraProfs.length > 0) {
        // Merge without duplicates
        const existingNames = new Set(deptProfessors.map((p) => p.name));
        const toAdd = extraProfs.filter((p) => !existingNames.has(p.name)).map((p, idx) => ({
          id: p.id || `PROF-LOCAL-${idx}`,
          name: p.name,
          department: p.department || 'Computer Science & Engineering',
          roleType: p.staffType || 'subject_handler',
          section: p.section || '-',
          advisorYear: p.advisorYear || '-',
          email: p.email || '-',
          joiningDate: p.joiningDate || '2025-01-01',
          presentToday: true,
          checkInTime: '08:45 AM',
          photoUrl: p.photoUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
          advisedStudentNames: p.staffType === 'class_advisor' ? ['Rohit Kumar'] : []
        }));
        setDeptProfessors((prev) => [...prev, ...toAdd]);
      }
    } catch (e) {}
  }, []);

  // Filter & Sort Students
  const filteredStudents = deptStudents
    .filter((s) => {
      if (!searchTerm) return true;
      const query = searchTerm.toLowerCase();
      return (
        s.name.toLowerCase().includes(query) ||
        s.id.toLowerCase().includes(query) ||
        s.advisorName.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
      if (sortBy === 'attendance_high') return b.attendance - a.attendance;
      return 0;
    });

  // Filter & Sort Professors
  const filteredProfessors = deptProfessors
    .filter((p) => {
      if (!searchTerm) return true;
      const query = searchTerm.toLowerCase();
      return (
        p.name.toLowerCase().includes(query) ||
        p.email.toLowerCase().includes(query) ||
        p.roleType.toLowerCase().includes(query) ||
        p.section.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
      return 0;
    });

  const handleRecentSearchClick = (term) => {
    setSearchTerm(term);
  };

  const handleSendAiPrompt = (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    const userMsg = { role: 'user', text: aiPrompt };
    const reply = {
      role: 'assistant',
      text: `📊 Executive Analysis on "${aiPrompt}": Current department attendance averages 91.4%. All Class Advisors have verified student fee rosters up to Semester 4. Faculty workload remains well balanced across CSE sections A and B.`
    };
    setAiHistory((prev) => [...prev, userMsg, reply]);
    setAiPrompt('');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at 10% 20%, #1e1b4b 0%, #09090b 90%)',
        color: '#f8fafc',
        fontFamily: "'Inter', sans-serif",
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* =========================================================
          TOP NAVIGATION BAR (THREE VERTICAL LINES & PROFILE)
          ========================================================= */}
      <header
        style={{
          background: 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(236, 72, 153, 0.3)',
          padding: '0.8rem 1.8rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          boxShadow: '0 8px 30px rgba(0,0,0,0.6)'
        }}
      >
        {/* LEFT: THREE VERTICAL LINES BUTTON (☰) + TITLE */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            title="Toggle HOD Management Menu"
            style={{
              background: menuOpen ? 'rgba(236, 72, 153, 0.3)' : 'rgba(30, 41, 59, 0.8)',
              border: '1px solid rgba(236, 72, 153, 0.5)',
              color: 'white',
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              fontSize: '1.4rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            ☰
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.5rem' }}>🏛️</span>
              <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, background: 'linear-gradient(135deg, #f472b6 0%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                HOD EXECUTIVE HUD
              </h1>
            </div>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>
              {hodProfile.department || 'Computer Science & Engineering'} • Head of Department
            </span>
          </div>
        </div>

        {/* RIGHT: PROFILE VISIBLE CARD (CLICK TO VIEW FULL FED DATA) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <div
            onClick={() => setShowProfileModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid rgba(236, 72, 153, 0.4)',
              padding: '6px 14px',
              borderRadius: '30px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            title="Click to view full HOD profile details"
          >
            <img
              src={hodProfile.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'}
              alt="HOD Profile"
              style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #f472b6' }}
            />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'white' }}>{hodProfile.name}</div>
              <div style={{ fontSize: '0.72rem', color: '#fbcfe8', fontWeight: 600 }}>Head of Department</div>
            </div>
          </div>

          <button
            onClick={() => { logout(); navigate('/'); }}
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#fca5a5',
              padding: '8px 14px',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* =========================================================
          MAIN CONTAINER WITH DRAWER MENU & CONTENT AREA
          ========================================================= */}
      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        {/* HAMBURGER DRAWER SIDEBAR MENU */}
        {menuOpen && (
          <aside
            style={{
              width: '280px',
              background: 'rgba(15, 23, 42, 0.95)',
              borderRight: '1px solid rgba(236, 72, 153, 0.3)',
              padding: '1.5rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem',
              backdropFilter: 'blur(20px)',
              animation: 'fadeIn 0.2s ease-in-out'
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fbcfe8', letterSpacing: '1px', paddingLeft: '10px', marginBottom: '8px' }}>
              DEPARTMENT MODULES
            </div>

            <button
              onClick={() => { setActiveMenu('home'); setMenuOpen(false); }}
              style={{
                padding: '0.9rem 1rem',
                borderRadius: '12px',
                border: activeMenu === 'home' ? '1px solid #f472b6' : '1px solid transparent',
                background: activeMenu === 'home' ? 'rgba(236, 72, 153, 0.2)' : 'transparent',
                color: activeMenu === 'home' ? '#f472b6' : '#cbd5e1',
                fontWeight: 700,
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer'
              }}
            >
              <span>🌐</span> Analytical Overview HUD
            </button>

            <button
              onClick={() => { setActiveMenu('students'); setMenuOpen(false); setSearchTerm(''); }}
              style={{
                padding: '0.9rem 1rem',
                borderRadius: '12px',
                border: activeMenu === 'students' ? '1px solid #f472b6' : '1px solid transparent',
                background: activeMenu === 'students' ? 'rgba(236, 72, 153, 0.2)' : 'transparent',
                color: activeMenu === 'students' ? '#f472b6' : '#cbd5e1',
                fontWeight: 700,
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer'
              }}
            >
              <span>🎓</span> 1. Student Management
            </button>

            <button
              onClick={() => { setActiveMenu('staff'); setMenuOpen(false); setSearchTerm(''); }}
              style={{
                padding: '0.9rem 1rem',
                borderRadius: '12px',
                border: activeMenu === 'staff' ? '1px solid #f472b6' : '1px solid transparent',
                background: activeMenu === 'staff' ? 'rgba(236, 72, 153, 0.2)' : 'transparent',
                color: activeMenu === 'staff' ? '#f472b6' : '#cbd5e1',
                fontWeight: 700,
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer'
              }}
            >
              <span>👨‍🏫</span> 2. Staff Management
            </button>

            <button
              onClick={() => { setActiveMenu('fees'); setMenuOpen(false); setSearchTerm(''); }}
              style={{
                padding: '0.9rem 1rem',
                borderRadius: '12px',
                border: activeMenu === 'fees' ? '1px solid #f472b6' : '1px solid transparent',
                background: activeMenu === 'fees' ? 'rgba(236, 72, 153, 0.2)' : 'transparent',
                color: activeMenu === 'fees' ? '#f472b6' : '#cbd5e1',
                fontWeight: 700,
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer'
              }}
            >
              <span>💰</span> 3. Fees Management HUD
            </button>

            <button
              onClick={() => { setActiveMenu('scores'); setMenuOpen(false); setSearchTerm(''); }}
              style={{
                padding: '0.9rem 1rem',
                borderRadius: '12px',
                border: activeMenu === 'scores' ? '1px solid #f472b6' : '1px solid transparent',
                background: activeMenu === 'scores' ? 'rgba(236, 72, 153, 0.2)' : 'transparent',
                color: activeMenu === 'scores' ? '#f472b6' : '#cbd5e1',
                fontWeight: 700,
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer'
              }}
            >
              <span>📊</span> 4. Student Score Management
            </button>

            <button
              onClick={() => { setActiveMenu('attendance'); setMenuOpen(false); setSearchTerm(''); }}
              style={{
                padding: '0.9rem 1rem',
                borderRadius: '12px',
                border: activeMenu === 'attendance' ? '1px solid #f472b6' : '1px solid transparent',
                background: activeMenu === 'attendance' ? 'rgba(236, 72, 153, 0.2)' : 'transparent',
                color: activeMenu === 'attendance' ? '#f472b6' : '#cbd5e1',
                fontWeight: 700,
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer'
              }}
            >
              <span>🕒</span> 5. Professor Attendance
            </button>

            <button
              onClick={() => { setActiveMenu('advisor_approvals'); setMenuOpen(false); setSearchTerm(''); }}
              style={{
                padding: '0.9rem 1rem',
                borderRadius: '12px',
                border: activeMenu === 'advisor_approvals' ? '1px solid #f472b6' : '1px solid transparent',
                background: activeMenu === 'advisor_approvals' ? 'rgba(236, 72, 153, 0.2)' : 'transparent',
                color: activeMenu === 'advisor_approvals' ? '#f472b6' : '#cbd5e1',
                fontWeight: 700,
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer'
              }}
            >
              <span>🔄</span> 6. Advisor Role Requests
            </button>

            <button
              onClick={() => { setActiveMenu('announcements'); setMenuOpen(false); setSearchTerm(''); }}
              style={{
                padding: '0.9rem 1rem',
                borderRadius: '12px',
                border: activeMenu === 'announcements' ? '1px solid #f472b6' : '1px solid transparent',
                background: activeMenu === 'announcements' ? 'rgba(236, 72, 153, 0.2)' : 'transparent',
                color: activeMenu === 'announcements' ? '#f472b6' : '#cbd5e1',
                fontWeight: 700,
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer'
              }}
            >
              <span>📢</span> 7. Student Announcements
            </button>
          </aside>
        )}

        {/* CONTENT DISPLAY AREA */}
        <main style={{ flex: 1, padding: '2rem', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
          {/* SEARCH & SORT TOOLBAR FOR MANAGEMENT MODULES */}
          {activeMenu !== 'home' && (
            <div style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(255,255,255,0.1)', padding: '1.2rem 1.5rem', borderRadius: '18px', marginBottom: '1.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <input
                    type="text"
                    placeholder={`Search ${activeMenu.toUpperCase()} by Name, ID, or Section...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '100%', padding: '0.8rem 1.2rem', borderRadius: '12px', background: '#0f172a', border: '1px solid rgba(236, 72, 153, 0.4)', color: 'white', fontSize: '0.95rem' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600 }}>Sort By:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{ padding: '0.75rem 1rem', borderRadius: '10px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }}
                  >
                    <option value="name_asc">Alphabetical Order (A → Z)</option>
                    <option value="name_desc">Alphabetical Order (Z → A)</option>
                    <option value="attendance_high">Highest Attendance / Rating</option>
                  </select>
                </div>
              </div>

              {/* RECENT SEARCH CHIPS */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>Recent Searches:</span>
                {recentSearches.map((term, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleRecentSearchClick(term)}
                    style={{ background: 'rgba(236, 72, 153, 0.15)', border: '1px solid rgba(236, 72, 153, 0.3)', color: '#fbcfe8', padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    🔍 {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================
              MODULE 0: NORMAL HOME — FUTURISTIC ANALYTICAL HUD
              ========================================================= */}
          {activeMenu === 'home' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: 'white' }}>
                    Department Analytical HUD
                  </h2>
                  <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '0.95rem' }}>
                    Real-time cybernetic oversight for {hodProfile.department}
                  </p>
                </div>
                <button
                  onClick={() => setMenuOpen(true)}
                  style={{ padding: '0.8rem 1.4rem', borderRadius: '12px', background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 15px rgba(236, 72, 153, 0.4)' }}
                >
                  ☰ Open HOD Management Modules →
                </button>
              </div>

              {/* HUD STAT METRIC CARDS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)', border: '1px solid rgba(236, 72, 153, 0.4)', padding: '1.6rem', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#fbcfe8', fontWeight: 700 }}>TOTAL STUDENTS</span>
                    <span style={{ fontSize: '1.5rem' }}>🎓</span>
                  </div>
                  <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'white' }}>{deptStudents.length}</div>
                  <div style={{ fontSize: '0.78rem', color: '#34d399', marginTop: '6px', fontWeight: 600 }}>● 100% Active in {hodProfile.department}</div>
                </div>

                <div style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)', border: '1px solid rgba(139, 92, 246, 0.4)', padding: '1.6rem', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#ddd6fe', fontWeight: 700 }}>TOTAL PROFESSORS</span>
                    <span style={{ fontSize: '1.5rem' }}>👨‍🏫</span>
                  </div>
                  <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'white' }}>{deptProfessors.length}</div>
                  <div style={{ fontSize: '0.78rem', color: '#60a5fa', marginTop: '6px', fontWeight: 600 }}>● Class Advisors & Subject Handlers</div>
                </div>

                <div style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)', border: '1px solid rgba(16, 185, 129, 0.4)', padding: '1.6rem', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#a7f3d0', fontWeight: 700 }}>FACULTY ATTENDANCE TODAY</span>
                    <span style={{ fontSize: '1.5rem' }}>🕒</span>
                  </div>
                  <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#34d399' }}>
                    {deptProfessors.filter(p => p.presentToday).length} / {deptProfessors.length}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#10b981', marginTop: '6px', fontWeight: 600 }}>● Verified Daily Biometric Check-in</div>
                </div>

                <div style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)', border: '1px solid rgba(245, 158, 11, 0.4)', padding: '1.6rem', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#fde68a', fontWeight: 700 }}>FEE COLLECTION HUD</span>
                    <span style={{ fontSize: '1.5rem' }}>💰</span>
                  </div>
                  <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#fbbf24' }}>96.4%</div>
                  <div style={{ fontSize: '0.78rem', color: '#f59e0b', marginTop: '6px', fontWeight: 600 }}>● Across 8 Semester Cycles</div>
                </div>
              </div>

              {/* HUD CYBERNETIC VISUAL DASHBOARD GRID */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.8rem' }}>
                <div style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255,255,255,0.1)', padding: '1.8rem', borderRadius: '20px' }}>
                  <h3 style={{ margin: '0 0 1.2rem 0', fontSize: '1.15rem', fontWeight: 800, color: '#fbcfe8' }}>
                    📈 Semester-by-Semester Academic Excellence HUD
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => {
                      const pct = sem <= 4 ? 85 + sem * 2 : 75 + sem;
                      return (
                        <div key={sem}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 700, marginBottom: '6px' }}>
                            <span>Semester {sem} Cohort Performance</span>
                            <span style={{ color: '#34d399' }}>{pct}% Avg</span>
                          </div>
                          <div style={{ width: '100%', height: '10px', background: 'rgba(0,0,0,0.4)', borderRadius: '6px', overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #ec4899 0%, #a78bfa 100%)', borderRadius: '6px' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255,255,255,0.1)', padding: '1.8rem', borderRadius: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ margin: '0 0 1.2rem 0', fontSize: '1.15rem', fontWeight: 800, color: '#c4b5fd' }}>
                      ⚡ Quick Department Actions
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <button
                        onClick={() => setActiveMenu('students')}
                        style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(236, 72, 153, 0.15)', border: '1px solid rgba(236, 72, 153, 0.3)', color: 'white', fontWeight: 700, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                      >
                        <span>🎓 Browse Department Students (A-Z)</span>
                        <span>➔</span>
                      </button>
                      <button
                        onClick={() => setActiveMenu('staff')}
                        style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.3)', color: 'white', fontWeight: 700, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                      >
                        <span>👨‍🏫 Inspect Faculty & Class Advisors</span>
                        <span>➔</span>
                      </button>
                      <button
                        onClick={() => setActiveMenu('scores')}
                        style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: 'white', fontWeight: 700, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                      >
                        <span>📊 View Internal Test 1, 2, 3 & Sem Marks</span>
                        <span>➔</span>
                      </button>
                    </div>
                  </div>

                  <div style={{ marginTop: '2rem', background: 'rgba(0,0,0,0.3)', padding: '1.2rem', borderRadius: '14px', border: '1px dashed rgba(236, 72, 153, 0.4)' }}>
                    <div style={{ fontSize: '0.82rem', color: '#fbcfe8', fontWeight: 700 }}>AI EXECUTIVE ADVISOR ACTIVE</div>
                    <p style={{ margin: '6px 0 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
                      Click the bottom-right AI Assistant button to query department trends instantly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              MODULE 1: STUDENT MANAGEMENT (ALPHABETICAL & CROSS-LINK)
              ========================================================= */}
          {activeMenu === 'students' && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: 'white' }}>
                  🎓 Student Management ({hodProfile.department})
                </h2>
                <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>
                  Displaying students in Alphabetical Order. Click any student to view full details and cross-link to their Class Advisor.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '1.5rem' }}>
                {filteredStudents.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setSelectedStudentModal(s)}
                    style={{
                      background: 'rgba(30, 41, 59, 0.75)',
                      border: '1px solid rgba(236, 72, 153, 0.3)',
                      padding: '1.5rem',
                      borderRadius: '18px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.4)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '1rem' }}>
                      <img src={s.photoUrl} alt={s.name} style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #f472b6' }} />
                      <div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white' }}>{s.name}</div>
                        <div style={{ fontSize: '0.78rem', color: '#fbcfe8', fontWeight: 600 }}>{s.id} • Sec {s.section}</div>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '1rem' }}>
                      <div><strong>Year:</strong> {s.year}</div>
                      <div><strong>Class Advisor:</strong> <span style={{ color: '#a78bfa', fontWeight: 700 }}>{s.advisorName}</span></div>
                      <div><strong>Attendance:</strong> <span style={{ color: s.attendance >= 90 ? '#34d399' : '#fbbf24', fontWeight: 700 }}>{s.attendance}%</span></div>
                    </div>

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                      <span style={{ color: '#60a5fa' }}>CGPA: {s.cgpa}</span>
                      <span style={{ color: '#f472b6', fontWeight: 700 }}>View Full Details →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================
              MODULE 2: STAFF MANAGEMENT (ALPHABETICAL & CROSS-LINK)
              ========================================================= */}
          {activeMenu === 'staff' && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: 'white' }}>
                  👨‍🏫 Staff & Faculty Management ({hodProfile.department})
                </h2>
                <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>
                  Displaying professors in Alphabetical Order. Class Advisors show their advised Section in CAPS and student list.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {filteredProfessors.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedStaffModal(p)}
                    style={{
                      background: 'rgba(30, 41, 59, 0.75)',
                      border: '1px solid rgba(139, 92, 246, 0.4)',
                      padding: '1.5rem',
                      borderRadius: '18px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.4)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '1rem' }}>
                      <img src={p.photoUrl} alt={p.name} style={{ width: '58px', height: '58px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #a78bfa' }} />
                      <div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white' }}>{p.name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                          <span style={{ fontSize: '0.75rem', background: p.roleType === 'class_advisor' ? 'rgba(139, 92, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)', color: p.roleType === 'class_advisor' ? '#ddd6fe' : '#93c5fd', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                            {p.roleType === 'class_advisor' ? `👑 CLASS ADVISOR (SEC ${p.section})` : '📚 SUBJECT STAFF'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '1rem' }}>
                      <div><strong>Email:</strong> {p.email}</div>
                      <div><strong>Joined:</strong> {p.joiningDate}</div>
                      {p.roleType === 'class_advisor' && (
                        <div style={{ marginTop: '6px', background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '8px', color: '#fde047' }}>
                          📌 Advised Cohort: <strong>{p.advisorYear} (Sec {p.section})</strong> ({p.advisedStudentNames.length} Students)
                        </div>
                      )}
                    </div>

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                      <span style={{ color: p.presentToday ? '#34d399' : '#f87171', fontWeight: 700 }}>
                        {p.presentToday ? `● Present (${p.checkInTime})` : '● Absent / On Leave'}
                      </span>
                      <span style={{ color: '#a78bfa', fontWeight: 700 }}>Inspect Faculty →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================
              MODULE 3: FEES MANAGEMENT TAB (UNIQUE ANALYTICAL HUD)
              ========================================================= */}
          {activeMenu === 'fees' && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: 'white' }}>
                  💰 Department Fees Progress HUD
                </h2>
                <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>
                  Unique Analytical HUD displaying fee verification across all 8 semesters.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
                {filteredStudents.map((s) => (
                  <div
                    key={s.id}
                    style={{
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid rgba(245, 158, 11, 0.4)',
                      padding: '1.5rem',
                      borderRadius: '18px',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.4)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div>
                        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'white' }}>{s.name}</div>
                        <div style={{ fontSize: '0.78rem', color: '#fde68a' }}>{s.id} • {s.year}</div>
                      </div>
                      <span style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', padding: '4px 10px', borderRadius: '14px', fontSize: '0.78rem', fontWeight: 700 }}>
                        {s.feesStatus}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginTop: '14px' }}>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => {
                        const paid = sem <= 4;
                        return (
                          <div
                            key={sem}
                            style={{
                              padding: '8px 4px',
                              textAlign: 'center',
                              borderRadius: '8px',
                              background: paid ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                              border: paid ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color: paid ? '#34d399' : '#64748b'
                            }}
                          >
                            Sem {sem}
                            <div style={{ fontSize: '0.65rem', marginTop: '2px' }}>{paid ? 'PAID' : 'DUE'}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================
              MODULE 4: STUDENT SCORE MANAGEMENT (8 SEMS: INT 1, 2, 3 + SEM EXAM)
              ========================================================= */}
          {activeMenu === 'scores' && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: 'white' }}>
                  📊 8-Semester Academic Scores & Internal Test HUD
                </h2>
                <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>
                  Fed by professors: View Internal Test 1, Test 2, Test 3 & Semester End Exam marks across Semesters 1 to 8.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {filteredStudents.map((s) => (
                  <div
                    key={s.id}
                    style={{
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid rgba(59, 130, 246, 0.35)',
                      padding: '1.5rem',
                      borderRadius: '18px',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.4)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={s.photoUrl} alt={s.name} style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #60a5fa' }} />
                        <div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white' }}>{s.name}</div>
                          <div style={{ fontSize: '0.78rem', color: '#93c5fd' }}>{s.id} • Sec {s.section}</div>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#34d399' }}>CGPA: {s.cgpa}</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                      {[1, 2, 3, 4].map((semNo) => (
                        <div key={semNo} style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fbcfe8', marginBottom: '8px' }}>
                            SEMESTER {semNo} RECORDS
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', textAlign: 'center', fontSize: '0.75rem' }}>
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '6px', borderRadius: '6px' }}>
                              <div style={{ color: '#94a3b8' }}>Internal 1</div>
                              <strong style={{ color: 'white' }}>{40 + semNo * 2}/50</strong>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '6px', borderRadius: '6px' }}>
                              <div style={{ color: '#94a3b8' }}>Internal 2</div>
                              <strong style={{ color: 'white' }}>{42 + semNo}/50</strong>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '6px', borderRadius: '6px' }}>
                              <div style={{ color: '#94a3b8' }}>Internal 3</div>
                              <strong style={{ color: 'white' }}>{44 + semNo}/50</strong>
                            </div>
                            <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '6px', borderRadius: '6px', border: '1px solid #10b981' }}>
                              <div style={{ color: '#6ee7b7' }}>Sem Exam</div>
                              <strong style={{ color: 'white' }}>{85 + semNo}/100</strong>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================
              MODULE 5: PROFESSOR DAILY ATTENDANCE TRACKER
              ========================================================= */}
          {activeMenu === 'attendance' && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: 'white' }}>
                  🕒 Professor Daily Attendance Tracker
                </h2>
                <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>
                  Live oversight of faculty check-ins today with role designation and present count.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filteredProfessors.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: p.presentToday ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
                      padding: '1.2rem 1.5rem',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <img src={p.photoUrl} alt={p.name} style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #a78bfa' }} />
                      <div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white' }}>{p.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                          {p.roleType === 'class_advisor' ? `👑 Class Advisor (Sec ${p.section})` : '📚 Subject Handling Staff'} • {p.department}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <span
                        style={{
                          padding: '6px 14px',
                          borderRadius: '20px',
                          fontWeight: 800,
                          fontSize: '0.82rem',
                          background: p.presentToday ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                          color: p.presentToday ? '#34d399' : '#f87171',
                          border: p.presentToday ? '1px solid #10b981' : '1px solid #ef4444'
                        }}
                      >
                        {p.presentToday ? `✅ PRESENT (${p.checkInTime})` : '❌ ABSENT / LEAVE'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* =========================================================
              MODULE 6: ADVISOR ROLE REQUESTS & APPROVALS
              ========================================================= */}
          {activeMenu === 'advisor_approvals' && (
            <div>
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800 }}>6. Professor Class Advisor Role Requests</h2>
                <p style={{ color: '#94a3b8', margin: '4px 0 0 0' }}>
                  Hierarchy oversight: Review and approve requests from faculty to assume or resign Section Class Advisorship. Only one Advisor per Section permitted.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {(() => {
                  const reqs = JSON.parse(localStorage.getItem('helpdesk_advisor_requests') || '[]');
                  if (reqs.length === 0) {
                    return (
                      <div style={{ background: 'rgba(30, 41, 59, 0.7)', padding: '3rem', borderRadius: '16px', textAlign: 'center', color: '#94a3b8' }}>
                        No pending Advisor Role requests from faculty at this time.
                      </div>
                    );
                  }
                  return reqs.map((r, idx) => (
                    <div key={r.id || idx} style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '1.8rem', borderRadius: '16px', border: '1px solid rgba(236, 72, 153, 0.4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                          <span style={{ fontSize: '1.2rem' }}>👨‍🏫</span>
                          <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fbcfe8' }}>{r.profName} ({r.profEmail})</h3>
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '6px' }}>
                          Current Role: <strong>{r.currentRole}</strong> (Sec {r.currentSection}) ➔ Requested Role: <strong style={{ color: '#f472b6' }}>{r.requestedRole}</strong> {r.requestedRole === 'class_advisor' ? `(Section ${r.requestedSection})` : ''}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Reason: "{r.reason}" • Submitted: {r.date}</div>
                      </div>

                      {r.status === 'pending_hod_approval' ? (
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button
                            onClick={() => {
                              const updated = reqs.map(i => i.id === r.id ? { ...i, status: 'approved' } : i);
                              localStorage.setItem('helpdesk_advisor_requests', JSON.stringify(updated));
                              alert(`✅ Approved role switch for ${r.profName}! Database updated.`);
                              window.location.reload();
                            }}
                            style={{ padding: '0.75rem 1.4rem', borderRadius: '10px', background: '#10b981', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer' }}
                          >
                            Approve Switch ✅
                          </button>
                          <button
                            onClick={() => {
                              const updated = reqs.map(i => i.id === r.id ? { ...i, status: 'rejected' } : i);
                              localStorage.setItem('helpdesk_advisor_requests', JSON.stringify(updated));
                              alert(`❌ Rejected request for ${r.profName}.`);
                              window.location.reload();
                            }}
                            style={{ padding: '0.75rem 1.4rem', borderRadius: '10px', background: '#ef4444', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer' }}
                          >
                            Reject ❌
                          </button>
                        </div>
                      ) : (
                        <span style={{ padding: '6px 14px', borderRadius: '20px', fontWeight: 800, background: r.status === 'approved' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: r.status === 'approved' ? '#34d399' : '#f87171' }}>
                          {r.status.toUpperCase()}
                        </span>
                      )}
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}

          {/* =========================================================
              MODULE 7: HOD STUDENT ANNOUNCEMENT BROADCAST STUDIO
              ========================================================= */}
          {activeMenu === 'announcements' && (
            <div>
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800 }}>7. HOD Student Announcement Broadcast Studio</h2>
                <p style={{ color: '#94a3b8', margin: '4px 0 0 0' }}>
                  Broadcast department-wide messages and media attachments directly to all students in the HOD Announcements tab.
                </p>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '2rem', borderRadius: '18px', border: '1px solid rgba(236, 72, 153, 0.4)', maxWidth: '720px' }}>
                <h3 style={{ margin: '0 0 1.2rem 0', color: '#f472b6' }}>Create Official Department Notice</h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const titleEl = e.target.elements.hodTitle;
                    const msgEl = e.target.elements.hodMsg;
                    const urlEl = e.target.elements.hodMediaUrl;
                    const typeEl = e.target.elements.hodMediaType;

                    const newAnn = {
                      id: Date.now(),
                      hodName: hodProfile.name,
                      title: titleEl.value,
                      message: msgEl.value,
                      attachmentUrl: urlEl.value.trim(),
                      attachmentType: typeEl.value,
                      date: new Date().toLocaleDateString('en-GB')
                    };

                    const existing = JSON.parse(localStorage.getItem('helpdesk_hod_announcements') || '[]');
                    const updated = [newAnn, ...existing];
                    localStorage.setItem('helpdesk_hod_announcements', JSON.stringify(updated));

                    titleEl.value = '';
                    msgEl.value = '';
                    urlEl.value = '';
                    alert('📢 Successfully broadcasted HOD notice to all Student Portals!');
                  }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}
                >
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#fbcfe8', marginBottom: '6px' }}>ANNOUNCEMENT HEADLINE *</label>
                    <input name="hodTitle" type="text" placeholder="e.g. End-Semester Lab Evaluation Schedule" required style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }} />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#fbcfe8', marginBottom: '6px' }}>WHATSAPP STYLE MESSAGE *</label>
                    <textarea name="hodMsg" rows={4} placeholder="Type department instructions..." required style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#fbcfe8', marginBottom: '6px' }}>ATTACHMENT MEDIA URL (OPTIONAL)</label>
                      <input name="hodMediaUrl" type="text" placeholder="https://image.or.video/url" style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#fbcfe8', marginBottom: '6px' }}>MEDIA TYPE</label>
                      <select name="hodMediaType" style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}>
                        <option value="image">📷 Image</option>
                        <option value="video">🎥 Video URL</option>
                        <option value="document">📄 Document Link</option>
                      </select>
                    </div>
                  </div>

                  <button type="submit" style={{ padding: '1rem', borderRadius: '12px', background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', color: 'white', border: 'none', fontWeight: 800, fontSize: '1rem', cursor: 'pointer' }}>
                    📢 Broadcast HOD Announcement to Students ➔
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* =========================================================
          MODAL 1: TOP RIGHT PROFILE VISIBLE DETAILS MODAL
          ========================================================= */}
      {showProfileModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(10px)', padding: '1rem' }}>
          <div style={{ background: '#0f172a', border: '1px solid rgba(236, 72, 153, 0.5)', padding: '2.5rem', borderRadius: '24px', maxWidth: '520px', width: '100%', boxShadow: '0 25px 60px rgba(0,0,0,0.8)', position: 'relative' }}>
            <button
              onClick={() => setShowProfileModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.4rem', cursor: 'pointer' }}
            >
              ✕
            </button>

            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <img
                src={hodProfile.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'}
                alt="HOD Profile"
                style={{ width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #f472b6', margin: '0 auto 10px auto' }}
              />
              <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>{hodProfile.name}</h3>
              <div style={{ color: '#f472b6', fontWeight: 700, fontSize: '0.9rem' }}>Head of Department (Executive Leadership)</div>
            </div>

            <div style={{ background: 'rgba(30, 41, 59, 0.7)', padding: '1.2rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Official Mail ID:</span>
                <strong style={{ color: '#60a5fa' }}>{hodProfile.email}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Academic Department:</span>
                <strong style={{ color: 'white' }}>{hodProfile.department}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Date of Joining:</span>
                <strong style={{ color: 'white' }}>{hodProfile.joiningDate || '2018-06-15'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Date of Birth:</span>
                <strong style={{ color: 'white' }}>{hodProfile.dob || '1979-04-12'}</strong>
              </div>
            </div>

            <div style={{ marginTop: '1.8rem', textAlign: 'center' }}>
              <button
                onClick={() => setShowProfileModal(false)}
                style={{ padding: '0.8rem 2rem', borderRadius: '12px', background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer' }}
              >
                Close Profile Studio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 2: FULL STUDENT DETAILS MODAL WITH PROFESSOR CROSS-LINK
          ========================================================= */}
      {selectedStudentModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110, backdropFilter: 'blur(12px)', padding: '1rem' }}>
          <div style={{ background: '#0f172a', border: '1px solid rgba(236, 72, 153, 0.5)', padding: '2.5rem', borderRadius: '24px', maxWidth: '580px', width: '100%', boxShadow: '0 25px 60px rgba(0,0,0,0.9)', position: 'relative' }}>
            <button
              onClick={() => setSelectedStudentModal(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.4rem', cursor: 'pointer' }}
            >
              ✕
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1.2rem' }}>
              <img src={selectedStudentModal.photoUrl} alt={selectedStudentModal.name} style={{ width: '74px', height: '74px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #f472b6' }} />
              <div>
                <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>{selectedStudentModal.name}</h3>
                <div style={{ color: '#fbcfe8', fontWeight: 700 }}>{selectedStudentModal.id} • Sec {selectedStudentModal.section}</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{selectedStudentModal.year}</div>
              </div>
            </div>

            <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '1.2rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Official Mail ID:</span>
                <strong style={{ color: '#60a5fa' }}>{selectedStudentModal.email}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Academic CGPA:</span>
                <strong style={{ color: '#34d399' }}>{selectedStudentModal.cgpa}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Attendance Verification:</span>
                <strong style={{ color: '#34d399' }}>{selectedStudentModal.attendance}%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#94a3b8' }}>Class Advisor (Professor):</span>
                <button
                  onClick={() => {
                    const prof = deptProfessors.find((p) => p.name.toLowerCase() === selectedStudentModal.advisorName.toLowerCase());
                    setSelectedStudentModal(null);
                    if (prof) setSelectedStaffModal(prof);
                  }}
                  style={{ background: 'rgba(139, 92, 246, 0.2)', border: '1px solid #a78bfa', color: '#ddd6fe', padding: '4px 12px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
                  title="Click to view full Professor details"
                >
                  👨‍🏫 {selectedStudentModal.advisorName} →
                </button>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <button
                onClick={() => setSelectedStudentModal(null)}
                style={{ padding: '0.8rem 2rem', borderRadius: '12px', background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer' }}
              >
                Close Student Modal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 3: FULL PROFESSOR DETAILS MODAL WITH STUDENT CROSS-LINK
          ========================================================= */}
      {selectedStaffModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110, backdropFilter: 'blur(12px)', padding: '1rem' }}>
          <div style={{ background: '#0f172a', border: '1px solid rgba(139, 92, 246, 0.5)', padding: '2.5rem', borderRadius: '24px', maxWidth: '620px', width: '100%', boxShadow: '0 25px 60px rgba(0,0,0,0.9)', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button
              onClick={() => setSelectedStaffModal(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.4rem', cursor: 'pointer' }}
            >
              ✕
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1.2rem' }}>
              <img src={selectedStaffModal.photoUrl} alt={selectedStaffModal.name} style={{ width: '74px', height: '74px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #a78bfa' }} />
              <div>
                <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>{selectedStaffModal.name}</h3>
                <div style={{ color: '#ddd6fe', fontWeight: 700 }}>
                  {selectedStaffModal.roleType === 'class_advisor' ? `👑 CLASS ADVISOR (SECTION ${selectedStaffModal.section})` : '📚 SUBJECT HANDLING STAFF'}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{selectedStaffModal.email}</div>
              </div>
            </div>

            <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '1.2rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Academic Department:</span>
                <strong style={{ color: 'white' }}>{selectedStaffModal.department}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Joining Date:</span>
                <strong style={{ color: 'white' }}>{selectedStaffModal.joiningDate}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Daily Attendance Status:</span>
                <strong style={{ color: selectedStaffModal.presentToday ? '#34d399' : '#f87171' }}>
                  {selectedStaffModal.presentToday ? `✅ Present (${selectedStaffModal.checkInTime})` : '❌ Absent / On Leave'}
                </strong>
              </div>
            </div>

            {/* CLASS ADVISOR ADVISED STUDENT COHORT LIST WITH CROSS-LINK */}
            {selectedStaffModal.roleType === 'class_advisor' && (
              <div style={{ background: 'rgba(139, 92, 246, 0.12)', border: '1px solid rgba(139, 92, 246, 0.3)', padding: '1.2rem', borderRadius: '14px', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fde047', marginBottom: '10px' }}>
                  📌 ADVISED COHORT STUDENTS (SECTION {selectedStaffModal.section})
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {selectedStaffModal.advisedStudentNames.length > 0 ? (
                    selectedStaffModal.advisedStudentNames.map((stName, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          const st = deptStudents.find((s) => s.name.toLowerCase() === stName.toLowerCase());
                          setSelectedStaffModal(null);
                          if (st) setSelectedStudentModal(st);
                        }}
                        style={{ padding: '6px 12px', borderRadius: '20px', background: 'rgba(59, 130, 246, 0.25)', border: '1px solid #3b82f6', color: 'white', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                        title="Click to inspect this student"
                      >
                        🎓 {stName} →
                      </button>
                    ))
                  ) : (
                    <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No student rosters assigned yet.</span>
                  )}
                </div>
              </div>
            )}

            <div style={{ textAlign: 'center' }}>
              <button
                onClick={() => setSelectedStaffModal(null)}
                style={{ padding: '0.8rem 2rem', borderRadius: '12px', background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer' }}
              >
                Close Faculty Modal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          FLOATING AI LAUNCHER BUTTON (BOTTOM RIGHT)
          ========================================================= */}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 90 }}>
        <button
          onClick={() => setShowAiModal(true)}
          style={{
            padding: '0.9rem 1.6rem',
            borderRadius: '50px',
            background: 'linear-gradient(135deg, #f472b6 0%, #a78bfa 100%)',
            color: 'white',
            border: 'none',
            fontWeight: 800,
            fontSize: '0.95rem',
            boxShadow: '0 8px 30px rgba(236, 72, 153, 0.6)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>🤖</span> AI Executive Advisor
        </button>
      </div>

      {/* AI LAUNCHER MODAL */}
      {showAiModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120, backdropFilter: 'blur(10px)', padding: '1rem' }}>
          <div style={{ background: '#0f172a', border: '1px solid rgba(236, 72, 153, 0.5)', padding: '2rem', borderRadius: '24px', maxWidth: '560px', width: '100%', boxShadow: '0 25px 60px rgba(0,0,0,0.9)', position: 'relative' }}>
            <button
              onClick={() => setShowAiModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.4rem', cursor: 'pointer' }}
            >
              ✕
            </button>

            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.3rem', fontWeight: 800, color: '#fbcfe8' }}>
              🤖 HOD AI Executive Advisor
            </h3>

            <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1rem', paddingRight: '6px' }}>
              {aiHistory.map((msg, i) => (
                <div key={i} style={{ padding: '10px 14px', borderRadius: '12px', background: msg.role === 'user' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(236, 72, 153, 0.15)', border: '1px solid rgba(255,255,255,0.08)', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                  <div style={{ fontSize: '0.85rem', color: 'white' }}>{msg.text}</div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendAiPrompt} style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="Ask about attendance, workloads, or course marks..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                style={{ flex: 1, padding: '0.8rem 1rem', borderRadius: '10px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
              />
              <button
                type="submit"
                style={{ padding: '0.8rem 1.4rem', borderRadius: '10px', background: '#f472b6', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' }}
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
