// ============================================================
// Student Helpdesk Agent — Page: 8-Semester Student Dashboard
// ============================================================
// Features:
// 1. Academic Scores Tab: 8-Semester selector showing Internal Test 1, 2, 3
//    and semester end results for each subject.
// 2. Fee Analytics Tab: 8-Semester fee progress & payment status.
// 3. Custom Profile Modal: Editable Name, DOB, Join Year, Phone, Email,
//    and Profile Picture via live Webcam studio / File Upload.
//    Register Number / User ID is strictly locked.
// 4. Navigation & Back Button Interception: Sign Out confirmation on back arrow.
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function StudentDashboard() {
  const { user, logout, institution } = useAuth();
  const authUser = user;
  const navigate = useNavigate();

  // Load profile from local storage or fallback to authUser
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('helpdesk_custom_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return authUser || {
      name: 'Rohit Kumar',
      registerNo: 'REG-2026-8942',
      userId: 'REG-2026-8942',
      loginId: 'rohit@xyzec.edu',
      joinYear: '2026',
      dob: '2007-08-15',
      department: 'Computer Science & Engineering',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      email: 'rohit@xyzec.edu',
      phone: '+91 98765 43210',
      bio: 'Enrolled in Computer Science & Engineering, Batch of 2026.'
    };
  });

  // Active Tab: 'scores' | 'fees'
  const [activeTab, setActiveTab] = useState('scores');
  // Active Semester: 1 to 8
  const [activeSem, setActiveSem] = useState(1);
  // Modal State: Profile Editor
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editProfile, setEditProfile] = useState({ ...profile });
  const [toastMsg, setToastMsg] = useState(null);

  // Webcam States for Profile Modal
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraError, setCameraError] = useState(null);

  // 1. Intercept Chrome Browser Back Button (popstate)
  useEffect(() => {
    window.history.pushState(null, null, window.location.pathname);
    const handlePopState = (e) => {
      e.preventDefault();
      const confirmLeave = window.confirm('🚪 Are you sure you want to sign out and return to the Home Page?');
      if (confirmLeave) {
        logout();
        navigate('/', { replace: true });
      } else {
        window.history.pushState(null, null, window.location.pathname);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [logout, navigate]);

  // Toast auto-hide
  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  // Handle Camera inside Profile Modal
  const startCamera = async () => {
    setCameraError(null);
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setCameraError('Unable to access webcam. Please verify camera permissions or use file upload.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 320;
      canvas.height = video.videoHeight || 240;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');
      setEditProfile(prev => ({ ...prev, photoUrl: dataUrl }));
      stopCamera();
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditProfile(prev => ({ ...prev, photoUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfile({ ...editProfile });
    localStorage.setItem('helpdesk_custom_profile', JSON.stringify(editProfile));
    // Also sync to user key if exists
    const existingUser = localStorage.getItem('helpdesk_user');
    if (existingUser) {
      try {
        const parsed = JSON.parse(existingUser);
        localStorage.setItem('helpdesk_user', JSON.stringify({ ...parsed, ...editProfile }));
      } catch (e) {}
    }
    setShowProfileModal(false);
    setToastMsg('✅ Profile successfully updated and saved!');
  };

  // Mock Academic Data for 8 Semesters (Merged with live Professor posted marks from StaffDashboard!)
  const [liveScores, setLiveScores] = useState({});
  useEffect(() => {
    try {
      const allScores = JSON.parse(localStorage.getItem('helpdesk_student_scores') || '{}');
      const myId = String(user?.registerNo || user?.loginId || 'REG-2026-0001').trim().toUpperCase();
      let found = null;
      if (allScores && typeof allScores === 'object') {
        found = allScores[myId];
        if (!found) {
          Object.values(allScores).forEach(s => {
            if (s && typeof s === 'object') {
              Object.values(s).forEach(sub => {
                if (sub && sub.studentName && String(sub.studentName).toLowerCase() === String(user?.name || '').toLowerCase()) {
                  found = s;
                }
              });
            }
          });
        }
      }
      setLiveScores(found || {});
    } catch (e) {
      setLiveScores({});
    }
  }, [user]);

  const rawSemesterData = {
    1: [
      { code: 'MA101', name: 'Engineering Mathematics - I', credits: 4, test1: 46, test2: 48, test3: 45, result: 'A+', gpa: 9.5 },
      { code: 'CS101', name: 'Problem Solving & C Programming', credits: 4, test1: 49, test2: 50, test3: 48, result: 'O (Outstanding)', gpa: 10.0 },
      { code: 'PH101', name: 'Engineering Physics', credits: 3, test1: 42, test2: 44, test3: 43, result: 'A', gpa: 9.0 },
      { code: 'EE101', name: 'Basic Electrical Engineering', credits: 3, test1: 45, test2: 46, test3: 47, result: 'A+', gpa: 9.5 },
      { code: 'EG101', name: 'Technical English & Communication', credits: 2, test1: 48, test2: 47, test3: 49, result: 'O (Outstanding)', gpa: 10.0 },
    ],
    2: [
      { code: 'MA102', name: 'Engineering Mathematics - II', credits: 4, test1: 45, test2: 47, test3: 48, result: 'A+', gpa: 9.5 },
      { code: 'CS102', name: 'Data Structures & Algorithms', credits: 4, test1: 48, test2: 49, test3: 50, result: 'O (Outstanding)', gpa: 10.0 },
      { code: 'EC101', name: 'Digital Logic Design', credits: 3, test1: 44, test2: 45, test3: 46, result: 'A+', gpa: 9.5 },
      { code: 'CH101', name: 'Engineering Chemistry & Materials', credits: 3, test1: 41, test2: 43, test3: 42, result: 'A', gpa: 9.0 },
      { code: 'CS103', name: 'Python Programming Lab', credits: 2, test1: 50, test2: 50, test3: 50, result: 'O (Outstanding)', gpa: 10.0 },
    ],
    3: [
      { code: 'CS201', name: 'Object Oriented Programming (Java)', credits: 4, test1: 47, test2: 48, test3: 46, result: 'A+', gpa: 9.5 },
      { code: 'CS202', name: 'Database Management Systems', credits: 4, test1: 48, test2: 49, test3: 47, result: 'O (Outstanding)', gpa: 10.0 },
      { code: 'CS203', name: 'Computer Architecture & Org', credits: 3, test1: 43, test2: 45, test3: 44, result: 'A+', gpa: 9.5 },
      { code: 'MA201', name: 'Discrete Mathematics & Graph Theory', credits: 4, test1: 45, test2: 46, test3: 45, result: 'A+', gpa: 9.5 },
    ],
    4: [
      { code: 'CS204', name: 'Operating Systems & System Programming', credits: 4, test1: '⏳ Pending', test2: '⏳ Pending', test3: '⏳ Pending', result: 'In Progress', gpa: '-' },
      { code: 'CS205', name: 'Design & Analysis of Algorithms', credits: 4, test1: '⏳ Pending', test2: '⏳ Pending', test3: '⏳ Pending', result: 'In Progress', gpa: '-' },
      { code: 'CS206', name: 'Computer Networks & Security', credits: 3, test1: '⏳ Pending', test2: '⏳ Pending', test3: '⏳ Pending', result: 'In Progress', gpa: '-' },
      { code: 'MA202', name: 'Probability & Statistics', credits: 3, test1: '⏳ Pending', test2: '⏳ Pending', test3: '⏳ Pending', result: 'In Progress', gpa: '-' },
    ],
    5: [
      { code: 'CS301', name: 'Artificial Intelligence & Machine Learning', credits: 4, test1: '-', test2: '-', test3: '-', result: 'Scheduled', gpa: '-' },
      { code: 'CS302', name: 'Theory of Computation & Automata', credits: 4, test1: '-', test2: '-', test3: '-', result: 'Scheduled', gpa: '-' },
      { code: 'CS303', name: 'Web Stack Development (MERN)', credits: 3, test1: '-', test2: '-', test3: '-', result: 'Scheduled', gpa: '-' },
    ],
    6: [
      { code: 'CS304', name: 'Compiler Design & Optimization', credits: 4, test1: '-', test2: '-', test3: '-', result: 'Scheduled', gpa: '-' },
      { code: 'CS305', name: 'Cloud Computing & DevOps', credits: 3, test1: '-', test2: '-', test3: '-', result: 'Scheduled', gpa: '-' },
      { code: 'CS306', name: 'Cyber Security & Cryptography', credits: 3, test1: '-', test2: '-', test3: '-', result: 'Scheduled', gpa: '-' },
    ],
    7: [
      { code: 'CS401', name: 'Big Data Analytics & Spark', credits: 4, test1: '-', test2: '-', test3: '-', result: 'Scheduled', gpa: '-' },
      { code: 'CS402', name: 'Deep Learning & NLP', credits: 3, test1: '-', test2: '-', test3: '-', result: 'Scheduled', gpa: '-' },
      { code: 'CS403', name: 'Major Project Phase - I', credits: 3, test1: '-', test2: '-', test3: '-', result: 'Scheduled', gpa: '-' },
    ],
    8: [
      { code: 'CS404', name: 'Industry Internship & Thesis', credits: 12, test1: '-', test2: '-', test3: '-', result: 'Scheduled', gpa: '-' },
      { code: 'CS405', name: 'Advanced Engineering Ethics', credits: 2, test1: '-', test2: '-', test3: '-', result: 'Scheduled', gpa: '-' },
    ]
  };

  const SEMESTER_DATA = {};
  Object.keys(rawSemesterData).forEach(sem => {
    try {
      const semKey = `Semester ${sem}`;
      const liveSemObj = (liveScores && typeof liveScores === 'object') ? (liveScores[semKey] || liveScores[sem] || {}) : {};
      SEMESTER_DATA[sem] = rawSemesterData[sem].map(subj => {
        if (liveSemObj && typeof liveSemObj === 'object' && liveSemObj[subj.name] && typeof liveSemObj[subj.name] === 'object') {
          const live = liveSemObj[subj.name];
          const resNum = typeof live.semesterResult === 'number' ? live.semesterResult : 85;
          return {
            ...subj,
            test1: live.test1 !== undefined ? live.test1 : subj.test1,
            test2: live.test2 !== undefined ? live.test2 : subj.test2,
            test3: live.test3 !== undefined ? live.test3 : subj.test3,
            result: `${live.grade || 'A'} (${resNum}/100)`,
            gpa: (resNum / 10).toFixed(1)
          };
        }
        return subj;
      });
    } catch (err) {
      SEMESTER_DATA[sem] = rawSemesterData[sem];
    }
  });

  // Mock Fee Data for 8 Semesters
  const FEE_DATA = [
    { sem: 1, tuition: 65000, dev: 10000, exam: 2500, total: 77500, status: '✅ COMPLETED (PAID)', date: '12 Aug 2026', receipt: 'REC-2026-001' },
    { sem: 2, tuition: 65000, dev: 10000, exam: 2500, total: 77500, status: '✅ COMPLETED (PAID)', date: '10 Jan 2027', receipt: 'REC-2027-042' },
    { sem: 3, tuition: 68000, dev: 10000, exam: 2500, total: 80500, status: '✅ COMPLETED (PAID)', date: '14 Aug 2027', receipt: 'REC-2027-189' },
    { sem: 4, tuition: 68000, dev: 10000, exam: 2500, total: 80500, status: '⏳ PROCESSING (VERIFYING)', date: 'Current Semester', receipt: '-' },
    { sem: 5, tuition: 70000, dev: 12000, exam: 3000, total: 85000, status: '📅 UPCOMING (DUE AUG 2028)', date: 'Due 15 Aug 2028', receipt: '-' },
    { sem: 6, tuition: 70000, dev: 12000, exam: 3000, total: 85000, status: '📅 UPCOMING (DUE JAN 2029)', date: 'Due 15 Jan 2029', receipt: '-' },
    { sem: 7, tuition: 75000, dev: 12000, exam: 3000, total: 90000, status: '📅 UPCOMING (DUE AUG 2029)', date: 'Due 15 Aug 2029', receipt: '-' },
    { sem: 8, tuition: 75000, dev: 12000, exam: 3000, total: 90000, status: '📅 UPCOMING (DUE JAN 2030)', date: 'Due 15 Jan 2030', receipt: '-' },
  ];

  return (
    <div className="app-container" style={{ minHeight: '100vh', background: '#020617', color: 'white', display: 'flex', flexDirection: 'column' }}>
      
      {/* TOAST NOTIFICATION */}
      {toastMsg && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', padding: '1rem 1.5rem', borderRadius: '12px', boxShadow: '0 10px 30px rgba(16,185,129,0.4)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
        </div>
      )}

      {/* TOP NAVIGATION HEADER */}
      <header style={{ background: 'rgba(15, 23, 42, 0.9)', borderBottom: '1px solid rgba(59, 130, 246, 0.3)', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(10px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontSize: '2rem' }}>{institution?.logo || '🎓'}</div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {institution?.name || 'XYZ Engineering College'} • Student Portal
            </h1>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
              Academic Grading, Fee Analytics & Institutional Guidance
            </p>
          </div>
        </div>

        {/* Top Right Profile & Sign Out Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', background: 'rgba(30, 41, 59, 0.6)', padding: '6px 14px', borderRadius: '30px', border: '1px solid rgba(59, 130, 246, 0.4)' }}>
            <img src={profile?.photoUrl} alt="Student Avatar" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #38bdf8' }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f8fafc' }}>{profile?.name}</div>
              <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600 }}>ID: {profile?.registerNo}</div>
            </div>
          </div>

          <button
            onClick={() => { setEditProfile({ ...profile }); setShowProfileModal(true); }}
            style={{ padding: '8px 16px', borderRadius: '10px', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)', transition: 'all 0.2s' }}
            title="Open Profile Studio & Custom Settings"
          >
            👤 Profile Tab
          </button>

          <button
            onClick={() => {
              if (window.confirm('🚪 Are you sure you want to sign out?')) {
                logout();
                navigate('/', { replace: true });
              }
            }}
            style={{ padding: '8px 16px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.4)', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
            title="Sign Out cleanly to Home Page"
          >
            🚪 Sign Out
          </button>
        </div>
      </header>

      {/* MAIN BODY: SIDEBAR & TAB CONTENT */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* LEFT SIDEBAR NAVIGATION */}
        <aside style={{ width: '280px', background: 'rgba(15, 23, 42, 0.6)', borderRight: '1px solid rgba(255,255,255,0.1)', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem', paddingLeft: '0.5rem' }}>
            Academic Navigation
          </div>

          <button
            onClick={() => setActiveTab('scores')}
            style={{ padding: '1rem', borderRadius: '12px', border: activeTab === 'scores' ? '1px solid #3b82f6' : '1px solid transparent', background: activeTab === 'scores' ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.3) 100%)' : 'transparent', color: activeTab === 'scores' ? '#60a5fa' : '#cbd5e1', fontWeight: 700, fontSize: '1rem', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s' }}
          >
            <span style={{ fontSize: '1.3rem' }}>📊</span>
            <div>
              <div>Score Analytics</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 400 }}>8 Semesters • Test 1, 2, 3</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('fees')}
            style={{ padding: '1rem', borderRadius: '12px', border: activeTab === 'fees' ? '1px solid #10b981' : '1px solid transparent', background: activeTab === 'fees' ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.3) 100%)' : 'transparent', color: activeTab === 'fees' ? '#34d399' : '#cbd5e1', fontWeight: 700, fontSize: '1rem', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s' }}
          >
            <span style={{ fontSize: '1.3rem' }}>💰</span>
            <div>
              <div>Fees Analytics</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 400 }}>Sem 1 - 8 Payment Progress</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            style={{ padding: '1rem', borderRadius: '12px', border: activeTab === 'database' ? '1px solid #a855f7' : '1px solid transparent', background: activeTab === 'database' ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(147, 51, 234, 0.3) 100%)' : 'transparent', color: activeTab === 'database' ? '#c084fc' : '#cbd5e1', fontWeight: 700, fontSize: '1rem', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s' }}
          >
            <span style={{ fontSize: '1.3rem' }}>📂</span>
            <div>
              <div>Student Database</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 400 }}>Campus Directory & Records</div>
            </div>
          </button>

          <div style={{ marginTop: 'auto', background: 'rgba(30, 41, 59, 0.5)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: 700, marginBottom: '6px' }}>🤖 AI Advisor Ready</div>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
              Have questions about syllabus, test schedules, or rules? Click the AI icon in the bottom-right corner!
            </p>
          </div>
        </aside>

        {/* MAIN DASHBOARD CONTENT AREA */}
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          
          {/* TAB 1: ACADEMIC SCORE ANALYTICS */}
          {activeTab === 'scores' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.8rem', margin: 0, fontWeight: 800 }}>📊 8-Semester Academic Score Analytics</h2>
                  <p style={{ color: '#94a3b8', margin: '0.4rem 0 0 0' }}>
                    Tracking Internal Test 1, 2, and 3 along with Semester End Results.
                  </p>
                </div>
                
                {/* Professor Notice Banner */}
                <div style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.4)', padding: '0.6rem 1.2rem', borderRadius: '10px', color: '#fbbf24', fontSize: '0.85rem', fontWeight: 600 }}>
                  📌 Note: Internal marks & results are published and handled by your Professor in their dashboard.
                </div>
              </div>

              {/* 8-SEMESTER SWITCHER TABS */}
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '2rem', background: 'rgba(15, 23, 42, 0.8)', padding: '0.6rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((semNo) => (
                  <button
                    key={semNo}
                    onClick={() => setActiveSem(semNo)}
                    style={{ flex: 1, minWidth: '90px', padding: '0.8rem', borderRadius: '10px', border: activeSem === semNo ? '1px solid #3b82f6' : 'none', background: activeSem === semNo ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'transparent', color: activeSem === semNo ? 'white' : '#94a3b8', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', boxShadow: activeSem === semNo ? '0 4px 15px rgba(59, 130, 246, 0.4)' : 'none' }}
                  >
                    Semester {semNo}
                    <div style={{ fontSize: '0.7rem', fontWeight: 400, opacity: 0.8 }}>
                      {semNo <= 3 ? '✅ Published' : (semNo === 4 ? '⏳ In Progress' : '📅 Scheduled')}
                    </div>
                  </button>
                ))}
              </div>

              {/* SEMESTER TABLE / CARDS */}
              <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                <h3 style={{ margin: '0 0 1.2rem 0', fontSize: '1.3rem', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📑 Semester {activeSem} Grade Sheet</span>
                  <span style={{ fontSize: '0.8rem', background: 'rgba(59, 130, 246, 0.2)', padding: '4px 10px', borderRadius: '15px', color: '#93c5fd' }}>
                    {SEMESTER_DATA[activeSem]?.length || 0} Subjects Enrolled
                  </span>
                </h3>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '750px' }}>
                    <thead>
                      <tr style={{ background: 'rgba(30, 41, 59, 0.8)', borderBottom: '2px solid rgba(59, 130, 246, 0.4)', color: '#cbd5e1', fontSize: '0.9rem' }}>
                        <th style={{ padding: '1rem' }}>Subject Code & Title</th>
                        <th style={{ padding: '1rem', textAlign: 'center' }}>Credits</th>
                        <th style={{ padding: '1rem', textAlign: 'center' }}>Internal Test 1<br/><span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>(Max: 50)</span></th>
                        <th style={{ padding: '1rem', textAlign: 'center' }}>Internal Test 2<br/><span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>(Max: 50)</span></th>
                        <th style={{ padding: '1rem', textAlign: 'center' }}>Internal Test 3<br/><span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>(Max: 50)</span></th>
                        <th style={{ padding: '1rem', textAlign: 'center' }}>Semester Result</th>
                        <th style={{ padding: '1rem', textAlign: 'center' }}>Grade Point</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(SEMESTER_DATA[activeSem] || []).map((subj, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: idx % 2 === 0 ? 'transparent' : 'rgba(30, 41, 59, 0.2)' }}>
                          <td style={{ padding: '1rem' }}>
                            <strong style={{ color: 'white', display: 'block' }}>{subj.name}</strong>
                            <span style={{ fontSize: '0.8rem', color: '#38bdf8' }}>{subj.code}</span>
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 600 }}>{subj.credits}</td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            <span style={{ padding: '4px 10px', borderRadius: '6px', background: typeof subj.test1 === 'number' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)', color: typeof subj.test1 === 'number' ? '#34d399' : '#94a3b8', fontWeight: 700 }}>
                              {subj.test1}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            <span style={{ padding: '4px 10px', borderRadius: '6px', background: typeof subj.test2 === 'number' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)', color: typeof subj.test2 === 'number' ? '#34d399' : '#94a3b8', fontWeight: 700 }}>
                              {subj.test2}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            <span style={{ padding: '4px 10px', borderRadius: '6px', background: typeof subj.test3 === 'number' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)', color: typeof subj.test3 === 'number' ? '#34d399' : '#94a3b8', fontWeight: 700 }}>
                              {subj.test3}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            <span style={{ padding: '6px 12px', borderRadius: '20px', background: subj.result.includes('Outstanding') || subj.result === 'A+' ? 'rgba(59, 130, 246, 0.25)' : 'rgba(245, 158, 11, 0.2)', color: subj.result.includes('Outstanding') || subj.result === 'A+' ? '#60a5fa' : '#fbbf24', fontWeight: 800 }}>
                              {subj.result}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 800, color: '#10b981', fontSize: '1.1rem' }}>
                            {subj.gpa}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FEE ANALYTICS */}
          {activeTab === 'fees' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.8rem', margin: 0, fontWeight: 800 }}>💰 8-Semester Fee Progress & Analytics</h2>
                  <p style={{ color: '#94a3b8', margin: '0.4rem 0 0 0' }}>
                    Transparent breakdown of tuition, lab, and examination fee payments across all 8 semesters.
                  </p>
                </div>

                <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', padding: '0.6rem 1.2rem', borderRadius: '10px', color: '#34d399', fontSize: '0.85rem', fontWeight: 600 }}>
                  📌 Note: Fee payment receipts & semester completion triggers are verified by Faculty/Admin.
                </div>
              </div>

              {/* OVERVIEW STATS / PROGRESS BAR */}
              <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.3)', marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.3) 0%, rgba(15, 23, 42, 0.8) 100%)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', flexWrap: 'wrap' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#34d399' }}>Degree Fee Completion Progress</h3>
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>3 of 8 Semesters Verified & Paid in Full</span>
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399' }}>37.5% Completed</div>
                </div>
                
                <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ width: '37.5%', height: '100%', background: 'linear-gradient(90deg, #34d399 0%, #10b981 100%)', transition: 'width 0.5s ease', boxShadow: '0 0 15px rgba(52, 211, 153, 0.6)' }} />
                </div>
              </div>

              {/* 8-SEMESTER FEE TABLE */}
              <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <h3 style={{ margin: '0 0 1.2rem 0', fontSize: '1.3rem', color: '#34d399' }}>📋 Complete Degree Fee Analytics (Semesters 1 to 8)</h3>
                
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                    <thead>
                      <tr style={{ background: 'rgba(30, 41, 59, 0.8)', borderBottom: '2px solid rgba(16, 185, 129, 0.4)', color: '#cbd5e1', fontSize: '0.9rem' }}>
                        <th style={{ padding: '1rem' }}>Semester</th>
                        <th style={{ padding: '1rem', textAlign: 'right' }}>Tuition Fee</th>
                        <th style={{ padding: '1rem', textAlign: 'right' }}>Dev / Lab Fee</th>
                        <th style={{ padding: '1rem', textAlign: 'right' }}>Exam Fee</th>
                        <th style={{ padding: '1rem', textAlign: 'right' }}>Total Amount</th>
                        <th style={{ padding: '1rem', textAlign: 'center' }}>Payment Status</th>
                        <th style={{ padding: '1rem', textAlign: 'center' }}>Date / Receipt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {FEE_DATA.map((fee, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: idx % 2 === 0 ? 'transparent' : 'rgba(30, 41, 59, 0.2)' }}>
                          <td style={{ padding: '1rem', fontWeight: 700, color: '#38bdf8' }}>Semester {fee.sem}</td>
                          <td style={{ padding: '1rem', textAlign: 'right', fontFamily: 'monospace' }}>₹{fee.tuition.toLocaleString()}</td>
                          <td style={{ padding: '1rem', textAlign: 'right', fontFamily: 'monospace' }}>₹{fee.dev.toLocaleString()}</td>
                          <td style={{ padding: '1rem', textAlign: 'right', fontFamily: 'monospace' }}>₹{fee.exam.toLocaleString()}</td>
                          <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 800, color: '#f8fafc', fontFamily: 'monospace', fontSize: '1.05rem' }}>₹{fee.total.toLocaleString()}</td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            <span style={{ padding: '6px 12px', borderRadius: '20px', background: fee.status.includes('COMPLETED') ? 'rgba(16, 185, 129, 0.25)' : (fee.status.includes('PROCESSING') ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.05)'), color: fee.status.includes('COMPLETED') ? '#34d399' : (fee.status.includes('PROCESSING') ? '#fbbf24' : '#94a3b8'), fontWeight: 800, fontSize: '0.8rem' }}>
                              {fee.status}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                            <div>{fee.date}</div>
                            {fee.receipt !== '-' && <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontFamily: 'monospace' }}>{fee.receipt}</div>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STUDENT DATABASE & CAMPUS DIRECTORY */}
          {activeTab === 'database' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.8rem', margin: 0, fontWeight: 800 }}>📂 Verified Campus Student Database & Directory</h2>
                  <p style={{ color: '#94a3b8', margin: '4px 0 0 0' }}>Official institutional student records, exam register rolls, attendance eligibility, and treasury clearance status.</p>
                </div>
                <div style={{ background: 'rgba(168, 85, 247, 0.15)', border: '1px solid #a855f7', color: '#c084fc', padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700 }}>
                  🛡️ Live Cloud Sync Active
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(168, 85, 247, 0.3)', background: 'rgba(15, 23, 42, 0.7)' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid rgba(168, 85, 247, 0.4)', color: '#c084fc', fontSize: '0.9rem', textTransform: 'uppercase' }}>
                        <th style={{ padding: '1rem' }}>Student Profile</th>
                        <th style={{ padding: '1rem' }}>Exam Register No</th>
                        <th style={{ padding: '1rem' }}>Department & Batch</th>
                        <th style={{ padding: '1rem' }}>Attendance</th>
                        <th style={{ padding: '1rem' }}>Treasury Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Current Student Highlight */}
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(59, 130, 246, 0.15)', fontWeight: 600 }}>
                        <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img src={profile?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'} alt="Avatar" style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #60a5fa' }} />
                          <div>
                            <div style={{ color: '#f8fafc', fontWeight: 700 }}>{profile?.name} (You)</div>
                            <div style={{ fontSize: '0.75rem', color: '#60a5fa' }}>{profile?.email}</div>
                          </div>
                        </td>
                        <td style={{ padding: '1rem', color: '#38bdf8', fontFamily: 'monospace', fontWeight: 700 }}>{profile?.registerNo || 'REG-2026-8942'}</td>
                        <td style={{ padding: '1rem', color: '#cbd5e1' }}>{profile?.department || 'Computer Science'} ({profile?.joinYear || '2026'})</td>
                        <td style={{ padding: '1rem' }}><span style={{ padding: '4px 10px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', fontSize: '0.8rem', fontWeight: 700 }}>92% (Eligible ✅)</span></td>
                        <td style={{ padding: '1rem' }}><span style={{ padding: '4px 10px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', fontSize: '0.8rem', fontWeight: 700 }}>Paid ✅</span></td>
                      </tr>

                      {/* Mock Classmates */}
                      {[
                        { name: 'Arjun Sharma', reg: 'REG-2026-1042', dept: 'Computer Science & Eng', year: '2026', att: '88% (Eligible ✅)', attColor: '#34d399', attBg: 'rgba(16,185,129,0.2)', fee: 'Paid ✅', feeColor: '#34d399', feeBg: 'rgba(16,185,129,0.2)', photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80' },
                        { name: 'Kishore R', reg: 'REG-2026-8942', dept: 'Computer Science & Eng', year: '2026', att: '95% (Exemplary 🌟)', attColor: '#38bdf8', attBg: 'rgba(56,189,248,0.2)', fee: 'Paid ✅', feeColor: '#34d399', feeBg: 'rgba(16,185,129,0.2)', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80' },
                        { name: 'Priya Patel', reg: 'REG-2026-2051', dept: 'Electronics & Comm', year: '2026', att: '79% (Eligible ✅)', attColor: '#34d399', attBg: 'rgba(16,185,129,0.2)', fee: 'Paid ✅', feeColor: '#34d399', feeBg: 'rgba(16,185,129,0.2)', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80' },
                        { name: 'Sneha Reddy', reg: 'REG-2026-3089', dept: 'Information Technology', year: '2026', att: '94% (Exemplary 🌟)', attColor: '#38bdf8', attBg: 'rgba(56,189,248,0.2)', fee: 'Paid ✅', feeColor: '#34d399', feeBg: 'rgba(16,185,129,0.2)', photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80' },
                        { name: 'Vikram Singh', reg: 'REG-2026-4102', dept: 'Computer Science & Eng', year: '2026', att: '72% (Medical 🟡)', attColor: '#fbbf24', attBg: 'rgba(245,158,11,0.2)', fee: 'Pending ⏳', feeColor: '#fbbf24', feeBg: 'rgba(245,158,11,0.2)', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80' },
                        { name: 'Ananya Sharma', reg: 'REG-2026-5120', dept: 'Electrical & Electronics', year: '2026', att: '85% (Eligible ✅)', attColor: '#34d399', attBg: 'rgba(16,185,129,0.2)', fee: 'Paid ✅', feeColor: '#34d399', feeBg: 'rgba(16,185,129,0.2)', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80' }
                      ].map((s, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                          <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img src={s.photo} alt="Avatar" style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }} />
                            <div>
                              <div style={{ color: '#f8fafc', fontWeight: 600 }}>{s.name}</div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{s.reg.toLowerCase()}@xyzec.edu</div>
                            </div>
                          </td>
                          <td style={{ padding: '1rem', color: '#94a3b8', fontFamily: 'monospace' }}>{s.reg}</td>
                          <td style={{ padding: '1rem', color: '#cbd5e1' }}>{s.dept} ({s.year})</td>
                          <td style={{ padding: '1rem' }}><span style={{ padding: '4px 10px', borderRadius: '20px', background: s.attBg, color: s.attColor, fontSize: '0.8rem', fontWeight: 700 }}>{s.att}</span></td>
                          <td style={{ padding: '1rem' }}><span style={{ padding: '4px 10px', borderRadius: '20px', background: s.feeBg, color: s.feeColor, fontSize: '0.8rem', fontWeight: 700 }}>{s.fee}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ============================================================
          CUSTOMIZABLE PROFILE MODAL (TOP RIGHT PROFILE BUTTON)
         ============================================================ */}
      {showProfileModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0, 0, 0, 0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(8px)' }}>
          <div className="glass-panel" style={{ background: '#0f172a', border: '2px solid #3b82f6', borderRadius: '20px', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', boxShadow: '0 25px 60px rgba(0,0,0,0.9)', position: 'relative' }}>
            
            <button
              onClick={() => setShowProfileModal(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', border: '1px solid #ef4444', borderRadius: '50%', width: '36px', height: '36px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Close Modal"
            >
              ✕
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
              <span style={{ fontSize: '2.2rem' }}>👤</span>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.6rem', color: '#60a5fa' }}>Customizable Student Profile Studio</h2>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
                  Update your personal details, photo, and bio. 🔒 Register Number (User ID) is permanently locked by administration.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile}>
              {/* PHOTO STUDIO SECTION */}
              <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '1.2rem', borderRadius: '14px', border: '1px solid rgba(59, 130, 246, 0.3)', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{ width: '110px', height: '110px', borderRadius: '50%', overflow: 'hidden', border: '3px solid #38bdf8', background: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', boxShadow: '0 5px 15px rgba(56, 189, 248, 0.3)' }}>
                  {editProfile?.photoUrl ? (
                    <img src={editProfile.photoUrl} alt="Avatar Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '3rem' }}>👨‍🎓</span>
                  )}
                </div>

                <div style={{ flex: 1, minWidth: '220px' }}>
                  <label style={{ display: 'block', fontWeight: 700, color: '#38bdf8', marginBottom: '8px' }}>
                    📸 Update Profile Photo (Webcam / Upload)
                  </label>

                  {!cameraActive ? (
                    <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={startCamera}
                        style={{ padding: '0.6rem 1rem', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '1px solid #3b82f6', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                      >
                        📸 Open Camera
                      </button>
                      <label style={{ padding: '0.6rem 1rem', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid #10b981', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', margin: 0, display: 'inline-block' }}>
                        📁 Upload Photo
                        <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                      </label>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ width: '100%', maxWidth: '240px', borderRadius: '8px', overflow: 'hidden', border: '2px solid #38bdf8' }}>
                        <video ref={videoRef} autoPlay playsInline style={{ width: '100%', display: 'block' }} />
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button type="button" onClick={capturePhoto} style={{ padding: '6px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>🟢 Snap Photo</button>
                        <button type="button" onClick={stopCamera} style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                      </div>
                    </div>
                  )}
                  {cameraError && <p style={{ color: '#f87171', fontSize: '0.75rem', margin: '4px 0 0 0' }}>⚠️ {cameraError}</p>}
                </div>
              </div>

              {/* FORM FIELDS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.2rem' }}>
                
                {/* LOCKED USER ID / REGISTER NO */}
                <div className="form-group" style={{ opacity: 0.8 }}>
                  <label style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🔒 Register Number (User ID)</span>
                    <span style={{ fontSize: '0.7rem', background: 'rgba(245, 158, 11, 0.2)', padding: '2px 6px', borderRadius: '4px' }}>NON-EDITABLE</span>
                  </label>
                  <input
                    type="text"
                    value={editProfile.registerNo || editProfile.userId || ''}
                    disabled
                    style={{ background: '#020617', color: '#94a3b8', border: '1px solid rgba(245, 158, 11, 0.4)', cursor: 'not-allowed', fontWeight: 700 }}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Official college identifier cannot be altered.</span>
                </div>

                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={editProfile.name || ''}
                    onChange={(e) => setEditProfile({ ...editProfile, name: e.target.value })}
                    required
                    style={{ background: '#020617', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
                  />
                </div>

                <div className="form-group">
                  <label>Join Year *</label>
                  <input
                    type="text"
                    value={editProfile.joinYear || ''}
                    onChange={(e) => setEditProfile({ ...editProfile, joinYear: e.target.value })}
                    required
                    style={{ background: '#020617', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
                  />
                </div>

                <div className="form-group">
                  <label>Date of Birth *</label>
                  <input
                    type="date"
                    value={editProfile.dob || ''}
                    onChange={(e) => setEditProfile({ ...editProfile, dob: e.target.value })}
                    required
                    style={{ background: '#020617', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
                  />
                </div>

                <div className="form-group">
                  <label>Academic Department</label>
                  <input
                    type="text"
                    value={editProfile.department || ''}
                    onChange={(e) => setEditProfile({ ...editProfile, department: e.target.value })}
                    style={{ background: '#020617', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
                  />
                </div>

                <div className="form-group">
                  <label>Contact Email</label>
                  <input
                    type="email"
                    value={editProfile.email || ''}
                    onChange={(e) => setEditProfile({ ...editProfile, email: e.target.value })}
                    style={{ background: '#020617', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '0.8rem' }}>
                <label>Student Bio / Academic Notes</label>
                <textarea
                  rows="3"
                  value={editProfile.bio || ''}
                  onChange={(e) => setEditProfile({ ...editProfile, bio: e.target.value })}
                  style={{ width: '100%', padding: '0.8rem', background: '#020617', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }}
                />
              </div>

              {/* Hidden canvas for webcam */}
              <canvas ref={canvasRef} style={{ display: 'none' }} />

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.2rem' }}>
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  style={{ flex: 1, padding: '0.8rem', background: 'transparent', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 2, padding: '0.8rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 800, fontSize: '1.05rem', cursor: 'pointer', boxShadow: '0 5px 20px rgba(16, 185, 129, 0.4)' }}
                >
                  💾 Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
