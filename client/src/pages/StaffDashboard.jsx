// ============================================================
// Student Helpdesk Agent — Page: Professor / Staff Dashboard
// ============================================================
// Features:
// 1. Mark Posting Portal (Internal Test 1, 2, 3 & Semester Exams)
//    - Directly syncs with Student Dashboard via localStorage!
// 2. Course Materials & Syllabus Management
// 3. Daily Attendance Tracker
// 4. F.R.I.D.A.Y. AI Faculty Assistant Button
// ============================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function StaffDashboard() {
  const { user, logout, institution } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('scores'); // 'scores' | 'materials' | 'attendance' | 'ai'
  const [successMsg, setSuccessMsg] = useState(null);

  // Mark Posting Portal State
  const [selectedSemester, setSelectedSemester] = useState('Semester 1');
  const [selectedSubject, setSelectedSubject] = useState('Data Structures & Algorithms');
  const [studentRegisterNo, setStudentRegisterNo] = useState('REG-2026-0001');
  const [studentName, setStudentName] = useState('Arjun Sharma');
  
  const [marks, setMarks] = useState({
    test1: '42',
    test2: '45',
    test3: '48',
    semesterResult: '88',
    grade: 'A+'
  });

  const [postedScoresList, setPostedScoresList] = useState([]);

  // Load existing posted scores from localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('helpdesk_student_scores') || '{}');
      const list = [];
      Object.keys(saved).forEach(reg => {
        Object.keys(saved[reg]).forEach(sem => {
          Object.keys(saved[reg][sem]).forEach(sub => {
            list.push({
              registerNo: reg,
              semester: sem,
              subject: sub,
              ...saved[reg][sem][sub]
            });
          });
        });
      });
      setPostedScoresList(list);
    } catch (e) {}
  }, []);

  const handleSaveMarks = (e) => {
    e.preventDefault();
    try {
      const regKey = studentRegisterNo.trim().toUpperCase();
      const saved = JSON.parse(localStorage.getItem('helpdesk_student_scores') || '{}');
      if (!saved[regKey]) saved[regKey] = {};
      if (!saved[regKey][selectedSemester]) saved[regKey][selectedSemester] = {};

      saved[regKey][selectedSemester][selectedSubject] = {
        studentName: studentName.trim(),
        test1: Number(marks.test1) || 0,
        test2: Number(marks.test2) || 0,
        test3: Number(marks.test3) || 0,
        semesterResult: Number(marks.semesterResult) || 0,
        grade: marks.grade || 'A',
        updatedBy: user?.name || 'Professor',
        updatedAt: new Date().toLocaleDateString()
      };

      localStorage.setItem('helpdesk_student_scores', JSON.stringify(saved));
      
      // Update local view list
      const list = [];
      Object.keys(saved).forEach(reg => {
        Object.keys(saved[reg]).forEach(sem => {
          Object.keys(saved[reg][sem]).forEach(sub => {
            list.push({
              registerNo: reg,
              semester: sem,
              subject: sub,
              ...saved[reg][sem][sub]
            });
          });
        });
      });
      setPostedScoresList(list);
      setSuccessMsg(`✅ Successfully published ${selectedSubject} scores for ${studentName} (${regKey}) to Student Dashboard!`);
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      alert('Failed to save scores: ' + err.message);
    }
  };

  // Materials state
  const [materials, setMaterials] = useState([
    { id: 1, title: 'Lecture Note 01: Complexity Analysis & Big-O Notation', subject: 'Data Structures & Algorithms', uploadedDate: '2026-07-01', size: '2.4 MB' },
    { id: 2, title: 'Lab Assignment 02: Binary Search Trees & AVL Trees', subject: 'Data Structures & Algorithms', uploadedDate: '2026-07-03', size: '1.1 MB' },
    { id: 3, title: 'Course Syllabus & Grading Policy (Autumn 2026)', subject: 'General Engineering', uploadedDate: '2026-06-28', size: '850 KB' },
  ]);
  const [newMatTitle, setNewMatTitle] = useState('');
  const [newMatSub, setNewMatSub] = useState('Data Structures & Algorithms');

  const handleUploadMaterial = (e) => {
    e.preventDefault();
    if (!newMatTitle.trim()) return;
    const newMat = {
      id: Date.now(),
      title: newMatTitle.trim(),
      subject: newMatSub,
      uploadedDate: new Date().toISOString().split('T')[0],
      size: (Math.random() * 3 + 0.5).toFixed(1) + ' MB'
    };
    setMaterials([newMat, ...materials]);
    setNewMatTitle('');
    setSuccessMsg(`✅ Uploaded "${newMat.title}" to student library portal!`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // Attendance state
  const [attendanceList, setAttendanceList] = useState([
    { regNo: 'REG-2026-0001', name: 'Arjun Sharma', present: true },
    { regNo: 'REG-2026-0002', name: 'Priya Patel', present: true },
    { regNo: 'REG-2026-0003', name: 'Vikram Singh', present: false },
    { regNo: 'REG-2026-0004', name: 'Ananya Nair', present: true },
    { regNo: 'REG-2026-0005', name: 'Rohan Gupta', present: true },
  ]);

  const toggleAttendance = (regNo) => {
    setAttendanceList(attendanceList.map(item => item.regNo === regNo ? { ...item, present: !item.present } : item));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-indigo-500/20 sticky top-0 z-50 px-6 py-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <span className="text-3xl">👨‍🏫</span>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 via-cyan-400 to-teal-300 bg-clip-text text-transparent">
              Professor & Faculty Portal
            </h1>
            <p className="text-xs text-slate-400">
              {institution?.name || 'XYZ Engineering College'} • {user?.department || 'Computer Science & Engineering'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-indigo-300">{user?.name || 'Prof. Anita Desai'}</p>
            <p className="text-xs text-emerald-400 font-mono">🟢 Authorized Faculty Member</p>
          </div>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/40 border border-rose-500/30 text-rose-300 rounded-lg text-sm font-medium transition duration-200 flex items-center gap-2"
          >
            <span>🚪</span> Sign Out
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Sidebar Navigation */}
        <aside className="md:col-span-1 space-y-2">
          <div className="bg-slate-900/60 border border-indigo-500/20 rounded-2xl p-4 shadow-lg backdrop-blur-sm">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">Faculty Menu</h2>
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('scores')}
                className={`w-full text-left px-4 py-3 rounded-xl font-medium transition flex items-center gap-3 ${
                  activeTab === 'scores'
                    ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md shadow-indigo-500/20 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <span className="text-xl">📊</span>
                <div>
                  <div className="text-sm">Mark Posting Portal</div>
                  <div className="text-[10px] opacity-80">Test 1, 2, 3 & Semester Exams</div>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('materials')}
                className={`w-full text-left px-4 py-3 rounded-xl font-medium transition flex items-center gap-3 ${
                  activeTab === 'materials'
                    ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md shadow-indigo-500/20 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <span className="text-xl">📚</span>
                <div>
                  <div className="text-sm">Course Materials</div>
                  <div className="text-[10px] opacity-80">Upload Syllabus & Notes</div>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('attendance')}
                className={`w-full text-left px-4 py-3 rounded-xl font-medium transition flex items-center gap-3 ${
                  activeTab === 'attendance'
                    ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md shadow-indigo-500/20 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <span className="text-xl">📅</span>
                <div>
                  <div className="text-sm">Attendance Register</div>
                  <div className="text-[10px] opacity-80">Mark Daily Class Presence</div>
                </div>
              </button>
            </nav>
          </div>

          <div className="bg-gradient-to-br from-indigo-950/60 to-purple-950/60 border border-indigo-500/20 rounded-2xl p-4 text-center">
            <span className="text-3xl block mb-2">🎓</span>
            <h3 className="text-sm font-semibold text-indigo-200">Student Live Sync</h3>
            <p className="text-xs text-slate-400 mt-1">
              Any marks you post here instantly appear in the Student Dashboard score tab!
            </p>
          </div>
        </aside>

        {/* Content Area */}
        <main className="md:col-span-3 space-y-6">
          {successMsg && (
            <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 p-4 rounded-xl flex items-center justify-between shadow-lg animate-fade-in">
              <span>{successMsg}</span>
              <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-white">✕</button>
            </div>
          )}

          {/* Tab 1: Mark Posting Portal */}
          {activeTab === 'scores' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-slate-900/80 border border-indigo-500/20 rounded-2xl p-6 shadow-xl backdrop-blur-md">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <span>📊</span> Post & Publish Student Examination Scores
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Enter internal test results (Test 1, 2, 3) and semester results. Automatically published to student portal.
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 rounded-full text-xs font-semibold">
                    Live Database Sync
                  </span>
                </div>

                <form onSubmit={handleSaveMarks} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Student Register Number</label>
                    <input
                      type="text"
                      value={studentRegisterNo}
                      onChange={(e) => setStudentRegisterNo(e.target.value)}
                      placeholder="e.g. REG-2026-0001 or K"
                      required
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Student Full Name</label>
                    <input
                      type="text"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="e.g. Arjun Sharma"
                      required
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Select Semester (1 to 8)</label>
                    <select
                      value={selectedSemester}
                      onChange={(e) => setSelectedSemester(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                    >
                      {['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Subject / Course Name</label>
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                    >
                      {[
                        'Data Structures & Algorithms',
                        'Database Management Systems',
                        'Operating Systems & Kernel',
                        'Computer Networks & Protocols',
                        'Software Engineering & DevOps',
                        'Engineering Mathematics III',
                        'Artificial Intelligence & RAG',
                        'Cloud Computing & Docker'
                      ].map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-5 gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                    <div>
                      <label className="block text-[11px] font-medium text-cyan-400 mb-1">Internal Test 1 (Max 50)</label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={marks.test1}
                        onChange={(e) => setMarks({ ...marks, test1: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-center font-bold text-white focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-cyan-400 mb-1">Internal Test 2 (Max 50)</label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={marks.test2}
                        onChange={(e) => setMarks({ ...marks, test2: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-center font-bold text-white focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-cyan-400 mb-1">Internal Test 3 (Max 50)</label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={marks.test3}
                        onChange={(e) => setMarks({ ...marks, test3: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-center font-bold text-white focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-indigo-400 mb-1">Semester Exam (Max 100)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={marks.semesterResult}
                        onChange={(e) => setMarks({ ...marks, semesterResult: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-center font-bold text-indigo-300 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-emerald-400 mb-1">Final Grade</label>
                      <select
                        value={marks.grade}
                        onChange={(e) => setMarks({ ...marks, grade: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-center font-bold text-emerald-400 focus:border-emerald-500"
                      >
                        {['O', 'A+', 'A', 'B+', 'B', 'C', 'P', 'F'].map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="md:col-span-2 flex justify-end mt-2">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 via-cyan-600 to-teal-500 hover:from-indigo-500 hover:to-teal-400 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/25 transition duration-200 flex items-center gap-2"
                    >
                      <span>💾 Save & Publish Scores to Student Portal ➔</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Published Scores Table */}
              <div className="bg-slate-900/80 border border-indigo-500/20 rounded-2xl p-6 shadow-xl backdrop-blur-md">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span>📋</span> Recently Published Examination Scores ({postedScoresList.length})
                </h3>
                {postedScoresList.length === 0 ? (
                  <p className="text-sm text-slate-400 italic bg-slate-950/60 p-6 rounded-xl text-center">
                    No scores published yet. Use the form above to post internal test marks and semester results!
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase bg-slate-950/50">
                          <th className="py-3 px-4">Register No</th>
                          <th className="py-3 px-4">Student Name</th>
                          <th className="py-3 px-4">Semester</th>
                          <th className="py-3 px-4">Subject</th>
                          <th className="py-3 px-4 text-center">Test 1</th>
                          <th className="py-3 px-4 text-center">Test 2</th>
                          <th className="py-3 px-4 text-center">Test 3</th>
                          <th className="py-3 px-4 text-center">Sem Final</th>
                          <th className="py-3 px-4 text-center">Grade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-sm">
                        {postedScoresList.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/40 transition">
                            <td className="py-3 px-4 font-mono font-bold text-cyan-400">{item.registerNo}</td>
                            <td className="py-3 px-4 font-medium text-white">{item.studentName}</td>
                            <td className="py-3 px-4 text-slate-300">{item.semester}</td>
                            <td className="py-3 px-4 text-indigo-300 font-medium">{item.subject}</td>
                            <td className="py-3 px-4 text-center text-slate-300">{item.test1}/50</td>
                            <td className="py-3 px-4 text-center text-slate-300">{item.test2}/50</td>
                            <td className="py-3 px-4 text-center text-slate-300">{item.test3}/50</td>
                            <td className="py-3 px-4 text-center font-bold text-amber-400">{item.semesterResult}/100</td>
                            <td className="py-3 px-4 text-center">
                              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-bold text-xs">
                                {item.grade}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Course Materials */}
          {activeTab === 'materials' && (
            <div className="bg-slate-900/80 border border-indigo-500/20 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-6 animate-fade-in">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>📚</span> Course Materials & Syllabus Repository
              </h2>
              <form onSubmit={handleUploadMaterial} className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Document Title / Topic</label>
                  <input
                    type="text"
                    value={newMatTitle}
                    onChange={(e) => setNewMatTitle(e.target.value)}
                    placeholder="e.g. Lecture Note 04: Graph Algorithms & Dijkstra's Shortest Path"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="w-full md:w-64">
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Subject</label>
                  <select
                    value={newMatSub}
                    onChange={(e) => setNewMatSub(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    {['Data Structures & Algorithms', 'Database Management Systems', 'Operating Systems & Kernel', 'General Engineering'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full md:w-auto px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition shrink-0"
                >
                  📤 Upload Document
                </button>
              </form>

              <div className="space-y-3">
                {materials.map((mat) => (
                  <div key={mat.id} className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 flex items-center justify-between hover:border-indigo-500/40 transition">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📄</span>
                      <div>
                        <h4 className="font-semibold text-slate-200 text-sm">{mat.title}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">{mat.subject} • Uploaded on {mat.uploadedDate} • {mat.size}</p>
                      </div>
                    </div>
                    <button onClick={() => alert(`Downloading ${mat.title}...`)} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-xs font-medium transition">
                      ⬇️ Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Attendance Register */}
          {activeTab === 'attendance' && (
            <div className="bg-slate-900/80 border border-indigo-500/20 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>📅</span> Daily Classroom Attendance Tracker
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Click present/absent button to toggle student attendance for today's lecture.</p>
                </div>
                <span className="text-xs font-mono bg-slate-800 text-slate-300 px-3 py-1 rounded-lg border border-slate-700">
                  Date: {new Date().toLocaleDateString()}
                </span>
              </div>

              <div className="space-y-3">
                {attendanceList.map((item) => (
                  <div key={item.regNo} className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${item.present ? 'bg-emerald-500 shadow-md shadow-emerald-500/50' : 'bg-rose-500 shadow-md shadow-rose-500/50'}`} />
                      <div>
                        <span className="text-xs font-mono text-cyan-400 font-bold">{item.regNo}</span>
                        <h4 className="font-semibold text-white text-sm">{item.name}</h4>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleAttendance(item.regNo)}
                      className={`px-4 py-1.5 rounded-lg font-bold text-xs transition duration-200 ${
                        item.present
                          ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                          : 'bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30'
                      }`}
                    >
                      {item.present ? '✅ Present' : '❌ Absent'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Floating F.R.I.D.A.Y. Bot Button */}
      <div
        onClick={() => navigate('/chat')}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-tr from-indigo-600 via-cyan-500 to-teal-400 rounded-full shadow-2xl flex items-center justify-center cursor-pointer hover:scale-110 transition duration-300 z-50 border-2 border-white/20 group"
        title="Open F.R.I.D.A.Y. Faculty AI Assistant"
      >
        <span className="text-2xl animate-pulse">🤖</span>
        <span className="absolute -top-10 right-0 bg-slate-900 text-cyan-300 text-[11px] font-bold px-3 py-1 rounded-full border border-cyan-500/30 shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition duration-200">
          Faculty AI Support ➔
        </span>
      </div>
    </div>
  );
}
