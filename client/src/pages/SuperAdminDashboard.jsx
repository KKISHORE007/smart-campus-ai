// ============================================================
// Student Helpdesk Agent — Page: Super Admin Dashboard
// ============================================================
// Implements all required layout & 6 Executive Modules:
// Top Right: Sign Out button
// Bottom Right: Floating AI Assistant HUD
// Top Left: ☰ Hamburger Drawer / Navigation with 6 Options:
//   1. User Management (Student / Professor / HOD management)
//   2. Fees Analytics (Campus fee progress & collection metrics)
//   3. Fees Structure (Feed department & year fees that sync to all dashboards)
//   4. New Joinee (Pre-Approval direct account creation & Pending Approval requests)
//   5. Announcement Management
//   6. College Branding & Cover Studio (Cover image, slideshow text/images, map pinning)
// Default / Home: Executive Campus Analytics overview
// ============================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function SuperAdminDashboard() {
  const { user, institution, logout, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  // Navigation & Drawer state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('home'); // home | user_management | fees_analytics | fees_structure | new_joinee | announcements | college_branding

  // 1. User Management Sub-tab
  const [userMgmtTab, setUserMgmtTab] = useState('student'); // student | professor | hod
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // 2. Fees Analytics Filter
  const [feeDeptFilter, setFeeDeptFilter] = useState('ALL');

  // 3. Fees Structure Form State
  const [selectedDeptFee, setSelectedDeptFee] = useState('Computer Science & Engineering');
  const [selectedYearFee, setSelectedYearFee] = useState('1st Year');
  const [tuitionFee, setTuitionFee] = useState('125000');
  const [labFee, setLabFee] = useState('15000');
  const [developmentFee, setDevelopmentFee] = useState('10000');

  // 4. New Joinee Sub-tabs & Forms
  const [joineeMainTab, setJoineeMainTab] = useState('pre_approval'); // pre_approval | new_approval
  const [joineeRoleTab, setJoineeRoleTab] = useState('professor'); // student | professor | hod
  // Pre-approval form state
  const [preName, setPreName] = useState('');
  const [preEmail, setPreEmail] = useState('');
  const [preUsername, setPreUsername] = useState('');
  const [prePassword, setPrePassword] = useState('Welcome@2026');
  const [preDept, setPreDept] = useState('Computer Science & Engineering');
  const [preRoleSpecial, setPreRoleSpecial] = useState('Class Advisor'); // or Section / RollNo

  // 5. Announcements state
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annPriority, setAnnPriority] = useState('high');

  // 6. College Branding state
  const [collegeName, setCollegeName] = useState('XYZ Engineering College (Autonomous)');
  const [coverPhoto, setCoverPhoto] = useState('https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1600&q=80');
  const [contactPhone, setContactPhone] = useState('+91 44 2345 6789');
  const [contactEmail, setContactEmail] = useState('admin@xyzec.edu');
  const [collegeAddress, setCollegeAddress] = useState('College Road, Guindy, Chennai - 600025');
  const [mapPinnedCoords, setMapPinnedCoords] = useState({ lat: '13.0108', lng: '80.2354', label: 'Main Campus Quadrangle' });
  const [slides, setSlides] = useState([
    { id: 1, url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80', title: 'World-Class Innovation Laboratories', subtitle: 'Equipped with NVIDIA DGX AI clusters and modern robotics gear.' },
    { id: 2, url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80', title: 'Excellence in Engineering Education', subtitle: 'Over 95% placement record across top tier global corporations.' }
  ]);
  const [newSlideUrl, setNewSlideUrl] = useState('');
  const [newSlideTitle, setNewSlideTitle] = useState('');
  const [newSlideSub, setNewSlideSub] = useState('');

  // Bottom-Right AI Assistant Drawer
  const [showAiDrawer, setShowAiDrawer] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiChatLogs, setAiChatLogs] = useState([
    { sender: 'ai', text: '👋 Greetings Executive Administrator! I am your Campus AI Advisor. I monitor real-time fee progress, registration queues, and institutional branding.' }
  ]);

  // Persistent / Demo Lists
  const [studentAccounts, setStudentAccounts] = useState({});
  const [professorAccounts, setProfessorAccounts] = useState({});
  const [hodAccounts, setHodAccounts] = useState({});
  const [feeStructures, setFeeStructures] = useState({});
  const [announcementsList, setAnnouncementsList] = useState([]);

  // Load state from local storage
  useEffect(() => {
    loadLocalAccounts();
    // Load Fee structures
    const storedFees = JSON.parse(localStorage.getItem('helpdesk_fee_structures') || '{}');
    setFeeStructures(storedFees);
    // Load Branding
    const storedBranding = JSON.parse(localStorage.getItem('smart_campus_branding') || 'null');
    if (storedBranding) {
      if (storedBranding.name) setCollegeName(storedBranding.name);
      if (storedBranding.coverPhoto) setCoverPhoto(storedBranding.coverPhoto);
      if (storedBranding.contactPhone) setContactPhone(storedBranding.contactPhone);
      if (storedBranding.contactEmail) setContactEmail(storedBranding.contactEmail);
      if (storedBranding.address) setCollegeAddress(storedBranding.address);
      if (storedBranding.slides) setSlides(storedBranding.slides);
    }
    // Load Announcements
    const storedAnn = JSON.parse(localStorage.getItem('helpdesk_announcements') || 'null');
    if (storedAnn) {
      setAnnouncementsList(storedAnn);
    } else {
      setAnnouncementsList([
        { id: 1, title: 'End Semester Fee Payment Deadline Extended', priority: 'high', date: '08 July 2026', content: 'All students are instructed to clear their semester dues before 20th July.' },
        { id: 2, title: 'Faculty Grading Portal Open for Internal Assessment 2', priority: 'medium', date: '05 July 2026', content: 'Class Advisors and Subject Staff should post internal marks by Friday.' }
      ]);
    }
  }, []);

  const loadLocalAccounts = () => {
    const sAcc = JSON.parse(localStorage.getItem('helpdesk_student_accounts') || '{}');
    const pAcc = JSON.parse(localStorage.getItem('helpdesk_professor_accounts') || '{}');
    const hAcc = JSON.parse(localStorage.getItem('helpdesk_hod_accounts') || '{}');

    // Ensure default demo entries exist if empty
    if (Object.keys(pAcc).length === 0) {
      pAcc['ramesh.cse@xyzec.edu'] = {
        name: 'Dr. Ramesh Kumar',
        email: 'ramesh.cse@xyzec.edu',
        username: 'prof_ramesh',
        password: 'staff12345',
        department: 'Computer Science & Engineering',
        roleType: 'class_advisor',
        section: 'A',
        advisorYear: '2nd Year (2025 Batch)',
        status: 'approved',
        joiningDate: '15-06-2022'
      };
      localStorage.setItem('helpdesk_professor_accounts', JSON.stringify(pAcc));
    }

    if (Object.keys(hAcc).length === 0) {
      hAcc['hod.cse@xyzec.edu'] = {
        name: 'Dr. R. K. Sharma',
        email: 'hod.cse@xyzec.edu',
        username: 'hod_sharma',
        password: 'hod12345',
        department: 'Computer Science & Engineering',
        status: 'approved',
        joiningDate: '10-05-2019'
      };
      localStorage.setItem('helpdesk_hod_accounts', JSON.stringify(hAcc));
    }

    setStudentAccounts(sAcc);
    setProfessorAccounts(pAcc);
    setHodAccounts(hAcc);
  };

  // Handlers for Account Approvals
  const handleApproveAccount = (role, key) => {
    if (role === 'student') {
      const updated = { ...studentAccounts };
      if (updated[key]) updated[key].status = 'approved';
      localStorage.setItem('helpdesk_student_accounts', JSON.stringify(updated));
      setStudentAccounts(updated);
    } else if (role === 'professor') {
      const updated = { ...professorAccounts };
      if (updated[key]) updated[key].status = 'approved';
      localStorage.setItem('helpdesk_professor_accounts', JSON.stringify(updated));
      setProfessorAccounts(updated);
    } else if (role === 'hod') {
      const updated = { ...hodAccounts };
      if (updated[key]) updated[key].status = 'approved';
      localStorage.setItem('helpdesk_hod_accounts', JSON.stringify(updated));
      setHodAccounts(updated);
    }
  };

  const handleRejectAccount = (role, key) => {
    if (role === 'student') {
      const updated = { ...studentAccounts };
      if (updated[key]) {
        updated[key].status = 'deleted';
      } else {
        updated[key] = { status: 'deleted' };
      }
      localStorage.setItem('helpdesk_student_accounts', JSON.stringify(updated));
      setStudentAccounts(updated);
    } else if (role === 'professor') {
      const updated = { ...professorAccounts };
      if (updated[key]) {
        updated[key].status = 'deleted';
      } else {
        updated[key] = { status: 'deleted' };
      }
      localStorage.setItem('helpdesk_professor_accounts', JSON.stringify(updated));
      setProfessorAccounts(updated);
    } else if (role === 'hod') {
      const updated = { ...hodAccounts };
      if (updated[key]) {
        updated[key].status = 'deleted';
      } else {
        updated[key] = { status: 'deleted' };
      }
      localStorage.setItem('helpdesk_hod_accounts', JSON.stringify(updated));
      setHodAccounts(updated);
    }
    alert('🗑️ Account deleted / rejected successfully. Access for this ID is now permanently blocked.');
  };

  // Handler for Pre-Approval Direct Account Creation
  const handleCreatePreApproved = (e) => {
    e.preventDefault();
    if (!preName || !preEmail || !preUsername || !prePassword) {
      alert('⚠️ Please fill in Name, Email, Username, and Password to pre-approve.');
      return;
    }
    const lookupKey = preEmail.trim().toLowerCase();

    if (joineeRoleTab === 'professor') {
      const updated = {
        ...professorAccounts,
        [lookupKey]: {
          name: preName,
          email: preEmail,
          username: preUsername,
          password: prePassword,
          department: preDept,
          roleType: preRoleSpecial,
          status: 'approved',
          joiningDate: new Date().toLocaleDateString('en-GB')
        }
      };
      localStorage.setItem('helpdesk_professor_accounts', JSON.stringify(updated));
      setProfessorAccounts(updated);
    } else if (joineeRoleTab === 'hod') {
      const updated = {
        ...hodAccounts,
        [lookupKey]: {
          name: preName,
          email: preEmail,
          username: preUsername,
          password: prePassword,
          department: preDept,
          status: 'approved',
          joiningDate: new Date().toLocaleDateString('en-GB')
        }
      };
      localStorage.setItem('helpdesk_hod_accounts', JSON.stringify(updated));
      setHodAccounts(updated);
    } else {
      const updated = {
        ...studentAccounts,
        [lookupKey]: {
          name: preName,
          email: preEmail,
          username: preUsername,
          password: prePassword,
          department: preDept,
          registerNo: preRoleSpecial || 'REG-2026-99',
          status: 'approved',
          joinYear: '2026'
        }
      };
      localStorage.setItem('helpdesk_student_accounts', JSON.stringify(updated));
      setStudentAccounts(updated);
    }

    alert(`✅ Pre-Approved ${joineeRoleTab.toUpperCase()} Account created successfully! User can login directly with ${preEmail} or ${preUsername}.`);
    setPreName('');
    setPreEmail('');
    setPreUsername('');
  };

  // Fee Structure Save Handler
  const handleSaveFeeStructure = (e) => {
    e.preventDefault();
    const key = `${selectedDeptFee}___${selectedYearFee}`;
    const total = Number(tuitionFee) + Number(labFee) + Number(developmentFee);
    const updated = {
      ...feeStructures,
      [key]: {
        department: selectedDeptFee,
        year: selectedYearFee,
        tuitionFee: Number(tuitionFee),
        labFee: Number(labFee),
        developmentFee: Number(developmentFee),
        totalFee: total
      }
    };
    setFeeStructures(updated);
    localStorage.setItem('helpdesk_fee_structures', JSON.stringify(updated));
    alert(`✅ Saved Fee Structure for ${selectedDeptFee} (${selectedYearFee}): Total ₹${total.toLocaleString()}`);
  };

  // Save College Branding Handler
  const handleSaveBranding = (e) => {
    e.preventDefault();
    const brandingObj = {
      name: collegeName,
      coverPhoto,
      contactPhone,
      contactEmail,
      address: collegeAddress,
      mapPinnedCoords,
      slides
    };
    localStorage.setItem('smart_campus_branding', JSON.stringify(brandingObj));
    alert('✅ College Branding, Banners & Pinned Map Location saved successfully!');
  };

  // Add Slide Banner
  const handleAddSlide = (e) => {
    e.preventDefault();
    if (!newSlideUrl) return;
    const nextId = slides.length ? Math.max(...slides.map(s => s.id)) + 1 : 1;
    const updated = [...slides, { id: nextId, url: newSlideUrl, title: newSlideTitle || 'Campus Excellence', subtitle: newSlideSub || 'Welcome to our institution' }];
    setSlides(updated);
    setNewSlideUrl('');
    setNewSlideTitle('');
    setNewSlideSub('');
  };

  const handleUpdateSlideText = (id, field, value) => {
    setSlides(slides.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleDeleteSlide = (id) => {
    setSlides(slides.filter(s => s.id !== id));
  };

  // Add Announcement
  const handleAddAnnouncement = (e) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;
    const newEntry = {
      id: Date.now(),
      title: annTitle,
      content: annContent,
      priority: annPriority,
      date: new Date().toLocaleDateString('en-GB')
    };
    const updated = [newEntry, ...announcementsList];
    setAnnouncementsList(updated);
    localStorage.setItem('helpdesk_announcements', JSON.stringify(updated));
    setAnnTitle('');
    setAnnContent('');
    alert('📢 Broadcasted campus announcement successfully!');
  };

  // AI Assistant Chat Handler
  const handleSendAiPrompt = (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    const q = aiPrompt;
    setAiPrompt('');
    setAiChatLogs(prev => [...prev, { sender: 'user', text: q }]);

    setTimeout(() => {
      let reply = "I have analyzed your request across campus departments.";
      if (q.toLowerCase().includes('fee') || q.toLowerCase().includes('collection')) {
        reply = "📊 Fee Analytics Audit: Campus collection rate currently stands at 82.4%. Computer Science & Engineering leads collection at 94%, while Mechanical Engineering has 14 pending reminders.";
      } else if (q.toLowerCase().includes('joinee') || q.toLowerCase().includes('approval')) {
        reply = `👥 Registration Status: There are currently ${Object.values(professorAccounts).filter(u => u.status === 'pending_approval').length} Professor accounts and ${Object.values(hodAccounts).filter(u => u.status === 'pending_approval').length} HOD accounts waiting for Executive Pre-Approval.`;
      } else {
        reply = "✨ All institutional systems, RAG embeddings, and fee portals are fully operational.";
      }
      setAiChatLogs(prev => [...prev, { sender: 'ai', text: reply }]);
    }, 400);
  };

  // Compute stats for overview
  const totalProfessors = Object.keys(professorAccounts).length;
  const totalHods = Object.keys(hodAccounts).length;
  const totalStudents = Object.keys(studentAccounts).length + 420; // Demo base
  const totalCollected = 14250000;
  const totalPending = 2380000;

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
            title="Toggle Executive Navigation"
            style={{
              background: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.4)',
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
            <span style={{ fontSize: '1.6rem' }}>👑</span>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, background: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                SUPER ADMIN EXECUTIVE BOARD
              </h1>
              <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 700, letterSpacing: '0.5px' }}>
                INSTITUTIONAL CONTROL & OVERSIGHT PORTAL
              </span>
            </div>
          </div>
        </div>

        {/* Top Right: Sign Out Option */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ textAlign: 'right', display: 'none', mdDisplay: 'block' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white' }}>Executive Board</div>
            <div style={{ fontSize: '0.72rem', color: '#10b981' }}>● Super Admin Active</div>
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
        
        {/* SIDEBAR NAVIGATION DRAWER (Toggleable via ☰) */}
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
              EXECUTIVE MODULES
            </div>

            {/* Default Home Option */}
            <button
              onClick={() => setActiveTab('home')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                border: activeTab === 'home' ? '1px solid #38bdf8' : '1px solid transparent',
                background: activeTab === 'home' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                color: activeTab === 'home' ? '#38bdf8' : '#cbd5e1',
                fontWeight: activeTab === 'home' ? 800 : 600,
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '0.92rem'
              }}
            >
              <span>📊</span> Executive Home Analytics
            </button>

            {/* 1. User Management */}
            <button
              onClick={() => setActiveTab('user_management')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                border: activeTab === 'user_management' ? '1px solid #a78bfa' : '1px solid transparent',
                background: activeTab === 'user_management' ? 'rgba(167, 139, 250, 0.15)' : 'transparent',
                color: activeTab === 'user_management' ? '#a78bfa' : '#cbd5e1',
                fontWeight: activeTab === 'user_management' ? 800 : 600,
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '0.92rem'
              }}
            >
              <span>👥</span> 1. User Management
            </button>

            {/* 2. Fees Analytics */}
            <button
              onClick={() => setActiveTab('fees_analytics')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                border: activeTab === 'fees_analytics' ? '1px solid #10b981' : '1px solid transparent',
                background: activeTab === 'fees_analytics' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                color: activeTab === 'fees_analytics' ? '#10b981' : '#cbd5e1',
                fontWeight: activeTab === 'fees_analytics' ? 800 : 600,
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '0.92rem'
              }}
            >
              <span>💰</span> 2. Fees Analytics
            </button>

            {/* 3. Fees Structure */}
            <button
              onClick={() => setActiveTab('fees_structure')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                border: activeTab === 'fees_structure' ? '1px solid #f59e0b' : '1px solid transparent',
                background: activeTab === 'fees_structure' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                color: activeTab === 'fees_structure' ? '#f59e0b' : '#cbd5e1',
                fontWeight: activeTab === 'fees_structure' ? 800 : 600,
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '0.92rem'
              }}
            >
              <span>🏛️</span> 3. Fees Structure
            </button>

            {/* 4. New Joinee */}
            <button
              onClick={() => setActiveTab('new_joinee')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                border: activeTab === 'new_joinee' ? '1px solid #f472b6' : '1px solid transparent',
                background: activeTab === 'new_joinee' ? 'rgba(244, 114, 182, 0.15)' : 'transparent',
                color: activeTab === 'new_joinee' ? '#f472b6' : '#cbd5e1',
                fontWeight: activeTab === 'new_joinee' ? 800 : 600,
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '0.92rem'
              }}
            >
              <span>🆕</span> 4. New Joinee & Approvals
            </button>

            {/* 5. Announcement Tab */}
            <button
              onClick={() => setActiveTab('announcements')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                border: activeTab === 'announcements' ? '1px solid #38bdf8' : '1px solid transparent',
                background: activeTab === 'announcements' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                color: activeTab === 'announcements' ? '#38bdf8' : '#cbd5e1',
                fontWeight: activeTab === 'announcements' ? 800 : 600,
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '0.92rem'
              }}
            >
              <span>📢</span> 5. Announcements
            </button>

            {/* 6. College Branding Tab */}
            <button
              onClick={() => setActiveTab('college_branding')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                border: activeTab === 'college_branding' ? '1px solid #c084fc' : '1px solid transparent',
                background: activeTab === 'college_branding' ? 'rgba(192, 132, 252, 0.15)' : 'transparent',
                color: activeTab === 'college_branding' ? '#c084fc' : '#cbd5e1',
                fontWeight: activeTab === 'college_branding' ? 800 : 600,
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '0.92rem'
              }}
            >
              <span>🎨</span> 6. College Branding & Cover
            </button>
          </aside>
        )}

        {/* CONTENT AREA */}
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto', maxHeight: 'calc(100vh - 70px)' }}>

          {/* ============================================================
              DEFAULT HOME: EXECUTIVE CAMPUS ANALYTICS (When no option chosen or Home)
          ============================================================ */}
          {activeTab === 'home' && (
            <div>
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800 }}>Campus Executive Analytics Overview</h2>
                <p style={{ color: '#94a3b8', margin: '4px 0 0 0' }}>
                  Real-time synchronization across all institutional departments, fee receipts, and faculty portfolios.
                </p>
              </div>

              {/* Stat Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                  <div style={{ fontSize: '0.82rem', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase' }}>REGISTERED STUDENTS</div>
                  <div style={{ fontSize: '2.4rem', fontWeight: 800, margin: '8px 0' }}>{totalStudents}</div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Across 8 UG & PG Semesters</div>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(167, 139, 250, 0.3)' }}>
                  <div style={{ fontSize: '0.82rem', color: '#a78bfa', fontWeight: 700, textTransform: 'uppercase' }}>ACTIVE PROFESSORS</div>
                  <div style={{ fontSize: '2.4rem', fontWeight: 800, margin: '8px 0' }}>{totalProfessors + 48}</div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Faculty & Class Advisors</div>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(244, 114, 182, 0.3)' }}>
                  <div style={{ fontSize: '0.82rem', color: '#f472b6', fontWeight: 700, textTransform: 'uppercase' }}>DEPARTMENT HEADS (HODs)</div>
                  <div style={{ fontSize: '2.4rem', fontWeight: 800, margin: '8px 0' }}>{totalHods + 6}</div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Academic Leadership</div>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  <div style={{ fontSize: '0.82rem', color: '#10b981', fontWeight: 700, textTransform: 'uppercase' }}>TOTAL FEE PROGRESS</div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 800, margin: '8px 0', color: '#34d399' }}>₹1.42 Cr</div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>85.4% Campus Collection Rate</div>
                </div>
              </div>

              {/* Quick Launch Cards into the 6 Modules */}
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem' }}>Executive Command Center Modules</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                <div onClick={() => setActiveTab('user_management')} style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>👥</div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '1.1rem' }}>1. User Management</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Manage Student, Professor, and HOD database entries & credentials.</p>
                </div>

                <div onClick={() => setActiveTab('fees_analytics')} style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>💰</div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '1.1rem' }}>2. Fees Analytics</h4>
                  <p style={{ margin: '0, fontSize: 0.85rem', color: '#94a3b8' }}>Campus collection metrics, department progress, and defaulter tracking.</p>
                </div>

                <div onClick={() => setActiveTab('fees_structure')} style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>🏛️</div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '1.1rem' }}>3. Fees Structure</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Feed department & year fees that feed into professor & student dashboards.</p>
                </div>

                <div onClick={() => setActiveTab('new_joinee')} style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>🆕</div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '1.1rem' }}>4. New Joinee & Approvals</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Pre-approve direct accounts or approve pending signup requests.</p>
                </div>

                <div onClick={() => setActiveTab('announcements')} style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>📢</div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '1.1rem' }}>5. Announcement Management</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Broadcast urgent academic notices to all portals.</p>
                </div>

                <div onClick={() => setActiveTab('college_branding')} style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>🎨</div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '1.1rem' }}>6. College Branding & Cover</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Main cover photo, slideshow banners, contact info & map pinning.</p>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================
              MODULE 1: USER MANAGEMENT (a. Student, b. Professor, c. HOD)
          ============================================================ */}
          {activeTab === 'user_management' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800 }}>1. Executive User Management</h2>
                  <p style={{ color: '#94a3b8', margin: '4px 0 0 0' }}>Inspect, manage, and edit credentials across Student, Professor, and HOD registries.</p>
                </div>

                {/* Sub-tabs: Student | Professor | HOD */}
                <div style={{ display: 'flex', gap: '8px', background: 'rgba(15, 23, 42, 0.8)', padding: '6px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <button
                    onClick={() => setUserMgmtTab('student')}
                    style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', background: userMgmtTab === 'student' ? '#3b82f6' : 'transparent', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                  >
                    a. Student Management
                  </button>
                  <button
                    onClick={() => setUserMgmtTab('professor')}
                    style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', background: userMgmtTab === 'professor' ? '#8b5cf6' : 'transparent', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                  >
                    b. Professor Management
                  </button>
                  <button
                    onClick={() => setUserMgmtTab('hod')}
                    style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', background: userMgmtTab === 'hod' ? '#ec4899' : 'transparent', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                  >
                    c. HOD Management
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div style={{ marginBottom: '1.5rem' }}>
                <input
                  type="text"
                  placeholder={`Search ${userMgmtTab.toUpperCase()} registry by Name, Email, or Department...`}
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  style={{ width: '100%', maxWidth: '480px', padding: '0.8rem 1.2rem', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                />
              </div>

              {/* Render Selected User Table */}
              {userMgmtTab === 'student' && (
                <div style={{ background: 'rgba(15, 23, 42, 0.7)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#38bdf8', fontSize: '0.82rem' }}>
                        <th style={{ padding: '1rem' }}>FULL NAME</th>
                        <th style={{ padding: '1rem' }}>ROLL NO / EMAIL</th>
                        <th style={{ padding: '1rem' }}>DEPARTMENT</th>
                        <th style={{ padding: '1rem' }}>BATCH</th>
                        <th style={{ padding: '1rem' }}>STATUS</th>
                        <th style={{ padding: '1rem' }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(studentAccounts).filter(([_, u]) => u.status !== 'deleted').map(([key, u]) => (
                        <tr key={key} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.9rem' }}>
                          <td style={{ padding: '1rem', fontWeight: 700 }}>{u.name}</td>
                          <td style={{ padding: '1rem' }}>{u.registerNo || u.email}</td>
                          <td style={{ padding: '1rem' }}>{u.department}</td>
                          <td style={{ padding: '1rem' }}>{u.joinYear || '2026'}</td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: u.status === 'approved' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)', color: u.status === 'approved' ? '#34d399' : '#fcd34d' }}>
                              {u.status === 'approved' ? 'APPROVED' : 'PENDING'}
                            </span>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <button onClick={() => handleRejectAccount('student', key)} style={{ padding: '6px 12px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', border: '1px solid #ef4444', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}>
                              Delete Record
                            </button>
                          </td>
                        </tr>
                      ))}
                      {Object.keys(studentAccounts).filter(k => studentAccounts[k]?.status !== 'deleted').length === 0 && (
                        <tr>
                          <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                            No custom students registered yet. Students created via public signup or Pre-Approval appear here.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {userMgmtTab === 'professor' && (
                <div style={{ background: 'rgba(15, 23, 42, 0.7)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#a78bfa', fontSize: '0.82rem' }}>
                        <th style={{ padding: '1rem' }}>PROFESSOR NAME</th>
                        <th style={{ padding: '1rem' }}>USERNAME / EMAIL</th>
                        <th style={{ padding: '1rem' }}>DEPARTMENT</th>
                        <th style={{ padding: '1rem' }}>DESIGNATION / SECTION</th>
                        <th style={{ padding: '1rem' }}>STATUS</th>
                        <th style={{ padding: '1rem' }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(professorAccounts).filter(([_, u]) => u.status !== 'deleted').map(([key, u]) => (
                        <tr key={key} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.9rem' }}>
                          <td style={{ padding: '1rem', fontWeight: 700 }}>{u.name}</td>
                          <td style={{ padding: '1rem' }}>{u.username || u.email}</td>
                          <td style={{ padding: '1rem' }}>{u.department}</td>
                          <td style={{ padding: '1rem' }}>{u.roleType === 'class_advisor' ? `Class Advisor (Sec: ${u.section || 'A'})` : 'Subject Staff'}</td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: u.status === 'approved' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)', color: u.status === 'approved' ? '#34d399' : '#fcd34d' }}>
                              {u.status === 'approved' ? 'APPROVED' : 'PENDING'}
                            </span>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <button onClick={() => handleRejectAccount('professor', key)} style={{ padding: '6px 12px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', border: '1px solid #ef4444', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}>
                              Delete Record
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {userMgmtTab === 'hod' && (
                <div style={{ background: 'rgba(15, 23, 42, 0.7)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#f472b6', fontSize: '0.82rem' }}>
                        <th style={{ padding: '1rem' }}>HOD NAME</th>
                        <th style={{ padding: '1rem' }}>USERNAME / EMAIL</th>
                        <th style={{ padding: '1rem' }}>DEPARTMENT OVERSIGHT</th>
                        <th style={{ padding: '1rem' }}>JOINING DATE</th>
                        <th style={{ padding: '1rem' }}>STATUS</th>
                        <th style={{ padding: '1rem' }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(hodAccounts).filter(([_, u]) => u.status !== 'deleted').map(([key, u]) => (
                        <tr key={key} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.9rem' }}>
                          <td style={{ padding: '1rem', fontWeight: 700 }}>{u.name}</td>
                          <td style={{ padding: '1rem' }}>{u.username || u.email}</td>
                          <td style={{ padding: '1rem' }}>{u.department}</td>
                          <td style={{ padding: '1rem' }}>{u.joiningDate || '10-05-2019'}</td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: u.status === 'approved' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)', color: u.status === 'approved' ? '#34d399' : '#fcd34d' }}>
                              {u.status === 'approved' ? 'APPROVED' : 'PENDING'}
                            </span>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <button onClick={() => handleRejectAccount('hod', key)} style={{ padding: '6px 12px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', border: '1px solid #ef4444', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}>
                              Delete Record
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ============================================================
              MODULE 2: FEES ANALYTICS (Mirrors & Expands HOD Fee Progress)
          ============================================================ */}
          {activeTab === 'fees_analytics' && (
            <div>
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800 }}>2. Campus Student Fee Progress & Collection Analytics</h2>
                <p style={{ color: '#94a3b8', margin: '4px 0 0 0' }}>
                  Real-time collection audits across all institutional departments, synced with Super Admin Fees Structure.
                </p>
              </div>

              {/* Department Collection Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {[
                  { dept: 'Computer Science & Engineering', collected: '94%', target: '₹52,00,000', received: '₹48,88,000', color: '#38bdf8' },
                  { dept: 'Electronics & Comm. (ECE)', collected: '88%', target: '₹40,00,000', received: '₹35,20,000', color: '#a78bfa' },
                  { dept: 'Mechanical Engineering', collected: '76%', target: '₹28,00,000', received: '₹21,28,000', color: '#f59e0b' },
                  { dept: 'Information Technology (IT)', collected: '91%', target: '₹34,00,000', received: '₹30,94,000', color: '#10b981' }
                ].map((item, idx) => (
                  <div key={idx} style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '1.4rem', borderRadius: '16px', border: `1px solid ${item.color}40` }}>
                    <div style={{ fontSize: '0.82rem', color: item.color, fontWeight: 700 }}>{item.dept}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '10px' }}>
                      <span style={{ fontSize: '2rem', fontWeight: 800 }}>{item.collected}</span>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{item.received} / {item.target}</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginTop: '10px', overflow: 'hidden' }}>
                      <div style={{ width: item.collected, height: '100%', background: item.color }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Individual Student Fee Progress Breakdown Table */}
              <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.15rem' }}>Student Fee Receipts & Semester Dues Status</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#38bdf8', fontSize: '0.82rem' }}>
                      <th style={{ padding: '0.9rem' }}>STUDENT NAME</th>
                      <th style={{ padding: '0.9rem' }}>ROLL NO</th>
                      <th style={{ padding: '0.9rem' }}>DEPARTMENT</th>
                      <th style={{ padding: '0.9rem' }}>BASE SEMESTER FEE</th>
                      <th style={{ padding: '0.9rem' }}>PAID AMOUNT</th>
                      <th style={{ padding: '0.9rem' }}>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'Kavin Kishore R', roll: 'REG-2026-001', dept: 'Computer Science & Engineering', base: '₹1,40,000', paid: '₹1,40,000', status: 'PAID FULL' },
                      { name: 'Ananya S', roll: 'REG-2026-014', dept: 'Computer Science & Engineering', base: '₹1,40,000', paid: '₹95,000', status: 'PENDING ₹45,000' },
                      { name: 'Siddharth M', roll: 'REG-2026-029', dept: 'Electronics & Comm. (ECE)', base: '₹1,30,000', paid: '₹1,30,000', status: 'PAID FULL' },
                      { name: 'Vignesh P', roll: 'REG-2026-042', dept: 'Mechanical Engineering', base: '₹1,20,000', paid: '₹60,000', status: 'PENDING ₹60,000' }
                    ].map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.9rem' }}>
                        <td style={{ padding: '0.9rem', fontWeight: 700 }}>{row.name}</td>
                        <td style={{ padding: '0.9rem', color: '#94a3b8' }}>{row.roll}</td>
                        <td style={{ padding: '0.9rem' }}>{row.dept}</td>
                        <td style={{ padding: '0.9rem', fontWeight: 700 }}>{row.base}</td>
                        <td style={{ padding: '0.9rem', color: '#38bdf8' }}>{row.paid}</td>
                        <td style={{ padding: '0.9rem' }}>
                          <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: row.status.includes('PAID') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: row.status.includes('PAID') ? '#34d399' : '#fca5a5' }}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================
              MODULE 3: FEES STRUCTURE (Feeds Fees into Professor/Student Dashboards)
          ============================================================ */}
          {activeTab === 'fees_structure' && (
            <div>
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800 }}>3. Department Fee Structure Configuration</h2>
                <p style={{ color: '#94a3b8', margin: '4px 0 0 0' }}>
                  Feed institutional semester fees per department & year. Values saved here automatically update the analytics across Professor and Student portals.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Fee Feeding Form */}
                <form onSubmit={handleSaveFeeStructure} style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '1.8rem', borderRadius: '16px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                  <h3 style={{ margin: '0 0 1.2rem 0', color: '#fcd34d', fontSize: '1.15rem' }}>Feed Department Semester Fee</h3>

                  <div style={{ marginBottom: '1.2rem' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>SELECT DEPARTMENT *</label>
                    <select
                      value={selectedDeptFee}
                      onChange={(e) => setSelectedDeptFee(e.target.value)}
                      style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                    >
                      <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                      <option value="Electronics & Comm. (ECE)">Electronics & Comm. (ECE)</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Information Technology (IT)">Information Technology (IT)</option>
                      <option value="Civil Engineering">Civil Engineering</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '1.2rem' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>SELECT STUDENT YEAR *</label>
                    <select
                      value={selectedYearFee}
                      onChange={(e) => setSelectedYearFee(e.target.value)}
                      style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                    >
                      <option value="1st Year">1st Year (2026 Batch)</option>
                      <option value="2nd Year">2nd Year (2025 Batch)</option>
                      <option value="3rd Year">3rd Year (2024 Batch)</option>
                      <option value="4th Year">4th Year (2023 Batch)</option>
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.2rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>TUITION FEE (₹)</label>
                      <input
                        type="number"
                        value={tuitionFee}
                        onChange={(e) => setTuitionFee(e.target.value)}
                        style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>LAB / ACADEMIC FEE (₹)</label>
                      <input
                        type="number"
                        value={labFee}
                        onChange={(e) => setLabFee(e.target.value)}
                        style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>DEVELOPMENT / EXAM FEE (₹)</label>
                    <input
                      type="number"
                      value={developmentFee}
                      onChange={(e) => setDevelopmentFee(e.target.value)}
                      style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                    />
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
                      cursor: 'pointer',
                      boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)'
                    }}
                  >
                    Save & Sync Department Fee Structure ➔
                  </button>
                </form>

                {/* Display Configured Fee Structures */}
                <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '1.8rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.15rem' }}>Active Synced Fee Matrices</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {Object.entries(feeStructures).map(([key, item]) => (
                      <div key={key} style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: '#fcd34d' }}>
                          <span>{item.department}</span>
                          <span>{item.year}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.85rem', color: '#cbd5e1' }}>
                          <span>Tuition: ₹{item.tuitionFee?.toLocaleString()}</span>
                          <span>Lab: ₹{item.labFee?.toLocaleString()}</span>
                          <span>Total: <strong style={{ color: '#10b981' }}>₹{item.totalFee?.toLocaleString()}</strong></span>
                        </div>
                      </div>
                    ))}
                    {Object.keys(feeStructures).length === 0 && (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                        No custom fees saved yet. Feed values in the form to configure campus fees.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================
              MODULE 4: NEW JOINEE (1. Pre-Approval Direct Creation | 2. New Approval Requests)
          ============================================================ */}
          {activeTab === 'new_joinee' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.8rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800 }}>4. New Joinee Registration & Approvals</h2>
                  <p style={{ color: '#94a3b8', margin: '4px 0 0 0' }}>Pre-approve directly created accounts or verify pending signup requests.</p>
                </div>

                {/* Main Sub-Tabs: 1. Pre-Approval | 2. New Approval */}
                <div style={{ display: 'flex', gap: '10px', background: 'rgba(15, 23, 42, 0.8)', padding: '6px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <button
                    onClick={() => setJoineeMainTab('pre_approval')}
                    style={{ padding: '0.7rem 1.4rem', borderRadius: '10px', background: joineeMainTab === 'pre_approval' ? '#ec4899' : 'transparent', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer' }}
                  >
                    1. Pre-Approval Direct Creation
                  </button>
                  <button
                    onClick={() => setJoineeMainTab('new_approval')}
                    style={{ padding: '0.7rem 1.4rem', borderRadius: '10px', background: joineeMainTab === 'new_approval' ? '#3b82f6' : 'transparent', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer' }}
                  >
                    2. New Approval Requests (Pending Queue)
                  </button>
                </div>
              </div>

              {/* Sub-tab 1: PRE-APPROVAL DIRECT CREATION */}
              {joineeMainTab === 'pre_approval' && (
                <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '2rem', borderRadius: '18px', border: '1px solid rgba(244, 114, 182, 0.3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#fbcfe8' }}>Create & Pre-Approve Member Account</h3>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                        Accounts fed here bypass pending status and are immediately authorized for direct portal login.
                      </p>
                    </div>

                    {/* Role selector: Professor | HOD | Student */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => setJoineeRoleTab('professor')}
                        style={{ padding: '0.5rem 1.1rem', borderRadius: '8px', background: joineeRoleTab === 'professor' ? '#8b5cf6' : 'rgba(30, 41, 59, 0.6)', color: 'white', border: '1px solid #8b5cf6', fontWeight: 700, cursor: 'pointer' }}
                      >
                        👨‍🏫 Professor
                      </button>
                      <button
                        type="button"
                        onClick={() => setJoineeRoleTab('hod')}
                        style={{ padding: '0.5rem 1.1rem', borderRadius: '8px', background: joineeRoleTab === 'hod' ? '#ec4899' : 'rgba(30, 41, 59, 0.6)', color: 'white', border: '1px solid #ec4899', fontWeight: 700, cursor: 'pointer' }}
                      >
                        🏛️ HOD
                      </button>
                      <button
                        type="button"
                        onClick={() => setJoineeRoleTab('student')}
                        style={{ padding: '0.5rem 1.1rem', borderRadius: '8px', background: joineeRoleTab === 'student' ? '#3b82f6' : 'rgba(30, 41, 59, 0.6)', color: 'white', border: '1px solid #3b82f6', fontWeight: 700, cursor: 'pointer' }}
                      >
                        👨‍🎓 Student
                      </button>
                    </div>
                  </div>

                  {/* Pre-Approval Form */}
                  <form onSubmit={handleCreatePreApproved}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1.2rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>ORIGINAL FULL NAME *</label>
                        <input
                          type="text"
                          placeholder="e.g. Dr. K. R. Ramanathan"
                          value={preName}
                          onChange={(e) => setPreName(e.target.value)}
                          required
                          style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>OFFICIAL MAIL ID (LOGIN EMAIL) *</label>
                        <input
                          type="email"
                          placeholder="e.g. ramanathan.cse@xyzec.edu"
                          value={preEmail}
                          onChange={(e) => setPreEmail(e.target.value)}
                          required
                          style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1.2rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>USERNAME (UNIQUE ID) *</label>
                        <input
                          type="text"
                          placeholder="e.g. prof_ramanathan"
                          value={preUsername}
                          onChange={(e) => setPreUsername(e.target.value)}
                          required
                          style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>INITIAL PASSWORD *</label>
                        <input
                          type="text"
                          value={prePassword}
                          onChange={(e) => setPrePassword(e.target.value)}
                          required
                          style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1.8rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>ACADEMIC DEPARTMENT *</label>
                        <select
                          value={preDept}
                          onChange={(e) => setPreDept(e.target.value)}
                          style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                        >
                          <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                          <option value="Electronics & Comm. (ECE)">Electronics & Comm. (ECE)</option>
                          <option value="Mechanical Engineering">Mechanical Engineering</option>
                          <option value="Information Technology (IT)">Information Technology (IT)</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                          {joineeRoleTab === 'professor' ? 'FACULTY ROLE DESIGNATION' : joineeRoleTab === 'student' ? 'ROLL NO / EXAM ID' : 'HOD TITLE'}
                        </label>
                        <input
                          type="text"
                          placeholder={joineeRoleTab === 'professor' ? 'e.g. Class Advisor (Sec A)' : 'e.g. REG-2026-105'}
                          value={preRoleSpecial}
                          onChange={(e) => setPreRoleSpecial(e.target.value)}
                          style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      style={{
                        padding: '1rem 2rem',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
                        color: 'white',
                        border: 'none',
                        fontWeight: 800,
                        fontSize: '1rem',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(236, 72, 153, 0.4)'
                      }}
                    >
                      Create & Pre-Approve {joineeRoleTab.toUpperCase()} Account ✅
                    </button>
                  </form>
                </div>
              )}

              {/* Sub-tab 2: NEW APPROVAL REQUESTS */}
              {joineeMainTab === 'new_approval' && (
                <div>
                  {/* Role filter buttons */}
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
                    <button
                      onClick={() => setJoineeRoleTab('professor')}
                      style={{ padding: '0.6rem 1.3rem', borderRadius: '10px', background: joineeRoleTab === 'professor' ? '#8b5cf6' : 'rgba(30,41,59,0.7)', color: 'white', border: '1px solid #8b5cf6', fontWeight: 700, cursor: 'pointer' }}
                    >
                      👨‍🏫 Professor Requests ({Object.values(professorAccounts).filter(u => u.status === 'pending_approval').length})
                    </button>
                    <button
                      onClick={() => setJoineeRoleTab('hod')}
                      style={{ padding: '0.6rem 1.3rem', borderRadius: '10px', background: joineeRoleTab === 'hod' ? '#ec4899' : 'rgba(30,41,59,0.7)', color: 'white', border: '1px solid #ec4899', fontWeight: 700, cursor: 'pointer' }}
                    >
                      🏛️ HOD Requests ({Object.values(hodAccounts).filter(u => u.status === 'pending_approval').length})
                    </button>
                    <button
                      onClick={() => setJoineeRoleTab('student')}
                      style={{ padding: '0.6rem 1.3rem', borderRadius: '10px', background: joineeRoleTab === 'student' ? '#3b82f6' : 'rgba(30,41,59,0.7)', color: 'white', border: '1px solid #3b82f6', fontWeight: 700, cursor: 'pointer' }}
                    >
                      👨‍🎓 Student Requests ({Object.values(studentAccounts).filter(u => u.status === 'pending_approval').length})
                    </button>
                  </div>

                  <div style={{ background: 'rgba(15, 23, 42, 0.7)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#38bdf8', fontSize: '0.82rem' }}>
                          <th style={{ padding: '1rem' }}>APPLICANT NAME</th>
                          <th style={{ padding: '1rem' }}>EMAIL ID</th>
                          <th style={{ padding: '1rem' }}>USERNAME</th>
                          <th style={{ padding: '1rem' }}>DEPARTMENT</th>
                          <th style={{ padding: '1rem' }}>STATUS</th>
                          <th style={{ padding: '1rem' }}>AUTHORIZATION</th>
                        </tr>
                      </thead>
                      <tbody>
                        {joineeRoleTab === 'professor' && Object.entries(professorAccounts).map(([key, u]) => (
                          <tr key={key} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '1rem', fontWeight: 700 }}>{u.name}</td>
                            <td style={{ padding: '1rem' }}>{u.email}</td>
                            <td style={{ padding: '1rem', color: '#60a5fa' }}>{u.username}</td>
                            <td style={{ padding: '1rem' }}>{u.department}</td>
                            <td style={{ padding: '1rem' }}>
                              <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: u.status === 'approved' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)', color: u.status === 'approved' ? '#34d399' : '#fcd34d' }}>
                                {u.status === 'approved' ? 'APPROVED ✅' : 'WAITING APPROVAL ⏳'}
                              </span>
                            </td>
                            <td style={{ padding: '1rem' }}>
                              {u.status !== 'approved' ? (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button onClick={() => handleApproveAccount('professor', key)} style={{ padding: '6px 14px', borderRadius: '8px', background: '#10b981', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                                    Approve ✅
                                  </button>
                                  <button onClick={() => handleRejectAccount('professor', key)} style={{ padding: '6px 14px', borderRadius: '8px', background: '#ef4444', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                                    Reject ❌
                                  </button>
                                </div>
                              ) : (
                                <span style={{ color: '#10b981', fontWeight: 700, fontSize: '0.85rem' }}>Authorized</span>
                              )}
                            </td>
                          </tr>
                        ))}

                        {joineeRoleTab === 'hod' && Object.entries(hodAccounts).map(([key, u]) => (
                          <tr key={key} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '1rem', fontWeight: 700 }}>{u.name}</td>
                            <td style={{ padding: '1rem' }}>{u.email}</td>
                            <td style={{ padding: '1rem', color: '#60a5fa' }}>{u.username}</td>
                            <td style={{ padding: '1rem' }}>{u.department}</td>
                            <td style={{ padding: '1rem' }}>
                              <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: u.status === 'approved' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)', color: u.status === 'approved' ? '#34d399' : '#fcd34d' }}>
                                {u.status === 'approved' ? 'APPROVED ✅' : 'WAITING APPROVAL ⏳'}
                              </span>
                            </td>
                            <td style={{ padding: '1rem' }}>
                              {u.status !== 'approved' ? (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button onClick={() => handleApproveAccount('hod', key)} style={{ padding: '6px 14px', borderRadius: '8px', background: '#10b981', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                                    Approve ✅
                                  </button>
                                  <button onClick={() => handleRejectAccount('hod', key)} style={{ padding: '6px 14px', borderRadius: '8px', background: '#ef4444', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                                    Reject ❌
                                  </button>
                                </div>
                              ) : (
                                <span style={{ color: '#10b981', fontWeight: 700, fontSize: '0.85rem' }}>Authorized</span>
                              )}
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
              MODULE 5: ANNOUNCEMENT MANAGEMENT
          ============================================================ */}
          {activeTab === 'announcements' && (
            <div>
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800 }}>5. Campus Announcement Broadcast Center</h2>
                <p style={{ color: '#94a3b8', margin: '4px 0 0 0' }}>Publish high-priority academic notices directly to Student, Professor, and HOD portals.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <form onSubmit={handleAddAnnouncement} style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '1.8rem', borderRadius: '16px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                  <h3 style={{ margin: '0 0 1.2rem 0', color: '#38bdf8', fontSize: '1.15rem' }}>Broadcast New Notice</h3>

                  <div style={{ marginBottom: '1.2rem' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>NOTICE TITLE *</label>
                    <input
                      type="text"
                      placeholder="e.g. Mid-Semester Exam Timetable Published"
                      value={annTitle}
                      onChange={(e) => setAnnTitle(e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                    />
                  </div>

                  <div style={{ marginBottom: '1.2rem' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>URGENCY PRIORITY *</label>
                    <select
                      value={annPriority}
                      onChange={(e) => setAnnPriority(e.target.value)}
                      style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                    >
                      <option value="high">🚨 High Priority (Red Alert Ribbon)</option>
                      <option value="medium">🟡 Normal Academic Notice</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>FULL ANNOUNCEMENT DETAILS *</label>
                    <textarea
                      rows={4}
                      placeholder="Provide full instructions..."
                      value={annContent}
                      onChange={(e) => setAnnContent(e.target.value)}
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
                      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      color: 'white',
                      border: 'none',
                      fontWeight: 800,
                      fontSize: '1rem',
                      cursor: 'pointer'
                    }}
                  >
                    📢 Broadcast Announcement Now ➔
                  </button>
                </form>

                {/* Published List */}
                <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '1.8rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.15rem' }}>Active Live Broadcasts</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {announcementsList.map((ann) => (
                      <div key={ann.id} style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '1.2rem', borderRadius: '12px', borderLeft: ann.priority === 'high' ? '4px solid #ef4444' : '4px solid #38bdf8' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: 'white', marginBottom: '6px' }}>
                          <span>{ann.title}</span>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{ann.date}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5 }}>{ann.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================
              MODULE 6: COLLEGE BRANDING, COVER STUDIO & MAP PINNING
          ============================================================ */}
          {activeTab === 'college_branding' && (
            <div>
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800 }}>6. College Branding, Cover Studio & Map Pinning</h2>
                <p style={{ color: '#94a3b8', margin: '4px 0 0 0' }}>
                  Slide 1 controls College Name & Cover Photo. Slides 2+ manage dynamic banner captions. Includes interactive Map Pinning location setup.
                </p>
              </div>

              <form onSubmit={handleSaveBranding}>
                {/* SLIDE 1: COLLEGE NAME & MAIN COVER PHOTO */}
                <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '1.8rem', borderRadius: '18px', border: '1px solid rgba(192, 132, 252, 0.4)', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.2rem' }}>
                    <span style={{ fontSize: '1.6rem' }}>🏫</span>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#e9d5ff' }}>Slide 1: College Name & Main Cover Photo</h3>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#c084fc', marginBottom: '6px' }}>COLLEGE INSTITUTIONAL NAME *</label>
                      <input
                        type="text"
                        value={collegeName}
                        onChange={(e) => setCollegeName(e.target.value)}
                        required
                        style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '10px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontWeight: 700 }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#c084fc', marginBottom: '6px' }}>MAIN COVER PHOTO URL *</label>
                      <input
                        type="text"
                        value={coverPhoto}
                        onChange={(e) => setCoverPhoto(e.target.value)}
                        required
                        style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '10px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                      />
                    </div>
                  </div>

                  {/* Preview Main Cover */}
                  <div style={{ height: '220px', borderRadius: '14px', overflow: 'hidden', position: 'relative', border: '2px solid #c084fc' }}>
                    <img src={coverPhoto} alt="College Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)', padding: '1.2rem' }}>
                      <h4 style={{ margin: 0, color: 'white', fontSize: '1.4rem' }}>{collegeName}</h4>
                      <p style={{ margin: 0, color: '#e9d5ff', fontSize: '0.85rem' }}>Main Campus Front Quadrangle • Verified Institutional Cover</p>
                    </div>
                  </div>
                </div>

                {/* SLIDESHOW BANNERS (Slides 2+) */}
                <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '1.8rem', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '2rem' }}>
                  <h3 style={{ margin: '0 0 1.2rem 0', fontSize: '1.2rem' }}>Additional Showcase Slides & Separate Text Editor</h3>

                  {/* Existing Banners */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.8rem' }}>
                    {slides.map((s) => (
                      <div key={s.id} style={{ background: 'rgba(30, 41, 59, 0.7)', padding: '1.2rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.15)' }}>
                        <img src={s.url} alt="Slide" style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '10px', marginBottom: '10px' }} />
                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>SLIDE TITLE</label>
                        <input
                          type="text"
                          value={s.title}
                          onChange={(e) => handleUpdateSlideText(s.id, 'title', e.target.value)}
                          style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', color: 'white', marginBottom: '8px' }}
                        />
                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>SLIDE SUBTITLE</label>
                        <input
                          type="text"
                          value={s.subtitle}
                          onChange={(e) => handleUpdateSlideText(s.id, 'subtitle', e.target.value)}
                          style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', color: 'white', marginBottom: '10px' }}
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteSlide(s.id)}
                          style={{ padding: '6px 12px', borderRadius: '6px', background: '#ef4444', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '0.75rem' }}
                        >
                          ✕ Delete Slide
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add New Banner */}
                  <div style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '1.2rem', borderRadius: '12px' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', color: '#38bdf8' }}>+ Add New Slide Banner</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '10px' }}>
                      <input
                        type="text"
                        placeholder="Image URL"
                        value={newSlideUrl}
                        onChange={(e) => setNewSlideUrl(e.target.value)}
                        style={{ padding: '0.7rem', borderRadius: '8px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                      />
                      <input
                        type="text"
                        placeholder="Slide Headline Text"
                        value={newSlideTitle}
                        onChange={(e) => setNewSlideTitle(e.target.value)}
                        style={{ padding: '0.7rem', borderRadius: '8px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                      />
                      <input
                        type="text"
                        placeholder="Subtitle Text"
                        value={newSlideSub}
                        onChange={(e) => setNewSlideSub(e.target.value)}
                        style={{ padding: '0.7rem', borderRadius: '8px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                      />
                      <button
                        type="button"
                        onClick={handleAddSlide}
                        style={{ padding: '0.7rem 1.4rem', borderRadius: '8px', background: '#10b981', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                      >
                        + Add Slide
                      </button>
                    </div>
                  </div>
                </div>

                {/* CONTACT & INTERACTIVE MAP PINNING STUDIO */}
                <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '1.8rem', borderRadius: '18px', border: '1px solid rgba(56, 189, 248, 0.4)', marginBottom: '2rem' }}>
                  <h3 style={{ margin: '0 0 1.2rem 0', fontSize: '1.2rem', color: '#38bdf8' }}>Institutional Contact & Interactive Map Pinning Option</h3>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.2rem', marginBottom: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>PHONE NUMBER *</label>
                      <input
                        type="text"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>EMAIL ID *</label>
                      <input
                        type="text"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>PINNED MAP LOCATION LABEL *</label>
                      <input
                        type="text"
                        value={mapPinnedCoords.label}
                        onChange={(e) => setMapPinnedCoords({ ...mapPinnedCoords, label: e.target.value })}
                        style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>COMPLETE COLLEGE ADDRESS *</label>
                    <input
                      type="text"
                      value={collegeAddress}
                      onChange={(e) => setCollegeAddress(e.target.value)}
                      style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                    />
                  </div>

                  {/* Map Pin Coordinates Box */}
                  <div style={{ background: '#09090b', padding: '1.2rem', borderRadius: '12px', border: '1px dashed #38bdf8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <div style={{ color: '#38bdf8', fontWeight: 800 }}>📍 Interactive Map Pinning Active</div>
                      <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Latitude: {mapPinnedCoords.lat} • Longitude: {mapPinnedCoords.lng} ({mapPinnedCoords.label})</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newLat = prompt("Enter GPS Latitude for Campus Map Pin:", mapPinnedCoords.lat);
                        const newLng = prompt("Enter GPS Longitude for Campus Map Pin:", mapPinnedCoords.lng);
                        if (newLat && newLng) setMapPinnedCoords({ ...mapPinnedCoords, lat: newLat, lng: newLng });
                      }}
                      style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', background: '#38bdf8', color: '#09090b', border: 'none', fontWeight: 800, cursor: 'pointer' }}
                    >
                      📍 Adjust Map Pin Coordinates
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  style={{
                    padding: '1.1rem 2.5rem',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #c084fc 0%, #9333ea 100%)',
                    color: 'white',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '1.05rem',
                    cursor: 'pointer',
                    boxShadow: '0 6px 20px rgba(192, 132, 252, 0.4)'
                  }}
                >
                  Save All College Branding, Banners & Pinned Map Details ➔
                </button>
              </form>
            </div>
          )}

        </main>
      </div>

      {/* ============================================================
          BOTTOM RIGHT CORNER: FLOATING AI EXECUTIVE ASSISTANT
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
            <span>🤖</span> Super Admin AI HUD
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
                <span>🤖</span> Executive AI Assistant
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
                placeholder="Ask AI about campus fees, queues..."
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
