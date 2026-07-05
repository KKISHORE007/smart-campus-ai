// ============================================================
// Student Helpdesk Agent — Page: Head of Department (HOD) Dashboard
// ============================================================
// Features:
// 1. Department Analytics & Academic Performance Overview
// 2. Faculty Workload & Course Allocation (Semesters 1 to 8)
// 3. Student & Faculty Join Request Approvals
// 4. Department Notices & Broadcasts
// 5. F.R.I.D.A.Y. Executive AI Assistant Button
// ============================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function HodDashboard() {
  const { user, logout, institution } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'workload' | 'approvals' | 'notices'
  const [successMsg, setSuccessMsg] = useState(null);

  // Faculty Workload state
  const [facultyList, setFacultyList] = useState([
    { id: 1, name: 'Prof. Anita Desai', designation: 'Senior Assistant Professor', courses: ['Data Structures & Algorithms (Sem 2)', 'Python Programming Lab (Sem 2)'], workload: '16 hrs/wk', status: 'Active' },
    { id: 2, name: 'Dr. S. K. Raman', designation: 'Professor', courses: ['Database Management Systems (Sem 3)', 'Big Data Analytics (Sem 7)'], workload: '14 hrs/wk', status: 'Active' },
    { id: 3, name: 'Prof. Rajesh Khanna', designation: 'Associate Professor', courses: ['Operating Systems (Sem 4)', 'Cloud Computing (Sem 6)'], workload: '18 hrs/wk', status: 'Active' },
    { id: 4, name: 'Dr. Meenakshi Sundaram', designation: 'Assistant Professor', courses: ['Artificial Intelligence (Sem 5)', 'Deep Learning (Sem 7)'], workload: '15 hrs/wk', status: 'On Leave (This Week)' },
  ]);

  // Approval requests
  const [pendingRequests, setPendingRequests] = useState([
    { id: 'REQ-101', name: 'Rohit Kumar', role: 'Student', identifier: 'rohit.k@xyzec.edu', dept: 'Computer Science & Engineering', date: '2026-07-04', status: 'Pending' },
    { id: 'REQ-102', name: 'Dr. Kiran Bedi', role: 'Staff / Faculty', identifier: 'kiran.b@xyzec.edu', dept: 'Computer Science & Engineering', date: '2026-07-03', status: 'Pending' },
    { id: 'REQ-103', name: 'Sneha Verma', role: 'Student', identifier: 'REG-2026-0042', dept: 'Computer Science & Engineering', date: '2026-07-05', status: 'Pending' },
  ]);

  const handleApprove = (reqId, name) => {
    setPendingRequests(pendingRequests.filter(r => r.id !== reqId));
    setSuccessMsg(`✅ Approved membership for ${name}! Account is now active.`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleReject = (reqId, name) => {
    setPendingRequests(pendingRequests.filter(r => r.id !== reqId));
    setSuccessMsg(`❌ Rejected request from ${name}.`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // Notices state
  const [notices, setNotices] = useState([
    { id: 1, title: 'Mandatory Submission of Internal Test 2 Scores by July 10th', target: 'All Faculty', date: '2026-07-02', priority: 'High 🔴' },
    { id: 2, title: 'Semester 7 Major Project Project Synopsis Presentation Schedule', target: 'Final Year Students', date: '2026-06-29', priority: 'Medium 🟡' },
    { id: 3, title: 'Department Advisory Committee (DAC) Meeting with Industry Experts', target: 'Senior Faculty & HOD', date: '2026-06-25', priority: 'Normal 🟢' },
  ]);
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeTarget, setNewNoticeTarget] = useState('All Students & Faculty');

  const handlePostNotice = (e) => {
    e.preventDefault();
    if (!newNoticeTitle.trim()) return;
    const newNotice = {
      id: Date.now(),
      title: newNoticeTitle.trim(),
      target: newNoticeTarget,
      date: new Date().toISOString().split('T')[0],
      priority: 'High 🔴'
    };
    setNotices([newNotice, ...notices]);
    setNewNoticeTitle('');
    setSuccessMsg(`📢 Broadcasted department notice to "${newNoticeTarget}"!`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-amber-500/20 sticky top-0 z-50 px-6 py-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🏛️</span>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-200 bg-clip-text text-transparent">
              Head of Department (HOD) Executive Suite
            </h1>
            <p className="text-xs text-slate-400">
              {institution?.name || 'XYZ Engineering College'} • {user?.department || 'Computer Science & Engineering'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-amber-300">{user?.name || 'Dr. Alok Verma'}</p>
            <p className="text-xs text-amber-400 font-mono">👑 Department Chair & HOD</p>
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
          <div className="bg-slate-900/60 border border-amber-500/20 rounded-2xl p-4 shadow-lg backdrop-blur-sm">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">HOD Controls</h2>
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('analytics')}
                className={`w-full text-left px-4 py-3 rounded-xl font-medium transition flex items-center gap-3 ${
                  activeTab === 'analytics'
                    ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <span className="text-xl">📈</span>
                <div>
                  <div className="text-sm">Department Analytics</div>
                  <div className="text-[10px] opacity-80">Academic & Placement Stats</div>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('workload')}
                className={`w-full text-left px-4 py-3 rounded-xl font-medium transition flex items-center gap-3 ${
                  activeTab === 'workload'
                    ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <span className="text-xl">👨‍🏫</span>
                <div>
                  <div className="text-sm">Faculty Course Allocation</div>
                  <div className="text-[10px] opacity-80">Semesters 1 to 8 Workload</div>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('approvals')}
                className={`w-full text-left px-4 py-3 rounded-xl font-medium transition flex items-center gap-3 ${
                  activeTab === 'approvals'
                    ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <span className="text-xl">✅</span>
                <div className="flex-1 flex justify-between items-center">
                  <div>
                    <div className="text-sm">Member Approvals</div>
                    <div className="text-[10px] opacity-80">Students & Staff Join Requests</div>
                  </div>
                  {pendingRequests.length > 0 && (
                    <span className="bg-rose-500 text-white font-bold text-xs px-2 py-0.5 rounded-full">{pendingRequests.length}</span>
                  )}
                </div>
              </button>

              <button
                onClick={() => setActiveTab('notices')}
                className={`w-full text-left px-4 py-3 rounded-xl font-medium transition flex items-center gap-3 ${
                  activeTab === 'notices'
                    ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <span className="text-xl">📢</span>
                <div>
                  <div className="text-sm">Notice Broadcasts</div>
                  <div className="text-[10px] opacity-80">Post Department Circulars</div>
                </div>
              </button>
            </nav>
          </div>

          <div className="bg-gradient-to-br from-amber-950/40 to-slate-900/80 border border-amber-500/20 rounded-2xl p-4 text-center">
            <span className="text-3xl block mb-2">📊</span>
            <h3 className="text-sm font-semibold text-amber-200">Department Status</h3>
            <p className="text-xs text-slate-400 mt-1">
              Currently managing 480 Students across 4 batches and 24 Faculty members.
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

          {/* Tab 1: Analytics */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-900/80 border border-amber-500/20 p-5 rounded-2xl">
                  <span className="text-2xl block mb-2">👨‍🎓</span>
                  <p className="text-xs text-slate-400 font-semibold uppercase">Total Enrolled Students</p>
                  <h3 className="text-3xl font-extrabold text-white mt-1">482</h3>
                  <span className="text-xs text-emerald-400">↑ 12% from last batch</span>
                </div>
                <div className="bg-slate-900/80 border border-amber-500/20 p-5 rounded-2xl">
                  <span className="text-2xl block mb-2">👨‍🏫</span>
                  <p className="text-xs text-slate-400 font-semibold uppercase">Faculty & Professors</p>
                  <h3 className="text-3xl font-extrabold text-white mt-1">24</h3>
                  <span className="text-xs text-amber-400">1:20 Faculty-Student Ratio</span>
                </div>
                <div className="bg-slate-900/80 border border-amber-500/20 p-5 rounded-2xl">
                  <span className="text-2xl block mb-2">🏆</span>
                  <p className="text-xs text-slate-400 font-semibold uppercase">Department Pass Rate</p>
                  <h3 className="text-3xl font-extrabold text-emerald-400 mt-1">94.8%</h3>
                  <span className="text-xs text-slate-400">Autumn Semester Exam</span>
                </div>
                <div className="bg-slate-900/80 border border-amber-500/20 p-5 rounded-2xl">
                  <span className="text-2xl block mb-2">💼</span>
                  <p className="text-xs text-slate-400 font-semibold uppercase">Placement Offers</p>
                  <h3 className="text-3xl font-extrabold text-cyan-400 mt-1">315</h3>
                  <span className="text-xs text-emerald-400">Highest Package: 42 LPA</span>
                </div>
              </div>

              {/* Semester Enrollment Breakdown */}
              <div className="bg-slate-900/80 border border-amber-500/20 rounded-2xl p-6 shadow-xl backdrop-blur-md">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span>📊</span> Student Enrollment Across B.Tech Semesters (1 to 8)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { year: '1st Year (Sem 1 & 2)', count: '128 Students', color: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300' },
                    { year: '2nd Year (Sem 3 & 4)', count: '120 Students', color: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300' },
                    { year: '3rd Year (Sem 5 & 6)', count: '118 Students', color: 'border-amber-500/30 bg-amber-500/10 text-amber-300' },
                    { year: '4th Year (Sem 7 & 8)', count: '116 Students', color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' },
                  ].map((batch, i) => (
                    <div key={i} className={`p-4 rounded-xl border ${batch.color} font-semibold text-center`}>
                      <div className="text-xs opacity-80">{batch.year}</div>
                      <div className="text-xl font-bold mt-1 text-white">{batch.count}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Faculty Workload */}
          {activeTab === 'workload' && (
            <div className="bg-slate-900/80 border border-amber-500/20 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>👨‍🏫</span> Faculty Course Allocation & Workload
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Assign teaching subjects across B.Tech Semesters 1 to 8 and monitor weekly lecture hours.</p>
                </div>
                <button onClick={() => alert('Opening Course Allocation Wizard...')} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-xl text-xs transition">
                  + Assign New Course
                </button>
              </div>

              <div className="space-y-4">
                {facultyList.map((fac) => (
                  <div key={fac.id} className="bg-slate-950/40 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-amber-500/40 transition">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h4 className="text-base font-bold text-white">{fac.name}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded font-semibold ${fac.status.includes('Leave') ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                          {fac.status}
                        </span>
                      </div>
                      <p className="text-xs text-amber-300 font-medium">{fac.designation}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {fac.courses.map((c, idx) => (
                          <span key={idx} className="bg-slate-800 text-slate-200 text-xs px-3 py-1 rounded-lg border border-slate-700">
                            📚 {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                      <div className="text-right">
                        <span className="text-[11px] font-semibold text-slate-400 block uppercase">Weekly Load</span>
                        <span className="text-lg font-mono font-bold text-cyan-400">{fac.workload}</span>
                      </div>
                      <button onClick={() => alert(`Editing workload for ${fac.name}...`)} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg text-xs font-semibold transition">
                        ⚙️ Modify
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Member Approvals */}
          {activeTab === 'approvals' && (
            <div className="bg-slate-900/80 border border-amber-500/20 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-6 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>✅</span> Department Member Registration Requests ({pendingRequests.length})
                </h2>
                <p className="text-xs text-slate-400 mt-1">Review and authorize pending student and faculty sign-up requests for your department.</p>
              </div>

              {pendingRequests.length === 0 ? (
                <p className="text-sm text-slate-400 italic bg-slate-950/60 p-8 rounded-xl text-center">
                  🎉 All clean! There are no pending registration requests waiting for departmental approval.
                </p>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map((req) => (
                    <div key={req.id} className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono font-bold px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
                            {req.id}
                          </span>
                          <h4 className="font-bold text-white text-base">{req.name}</h4>
                          <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-medium">
                            {req.role}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">ID / Email: <span className="font-mono text-cyan-400">{req.identifier}</span></p>
                        <p className="text-[11px] text-slate-400">Requested Dept: {req.dept} • Submitted on {req.date}</p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <button
                          onClick={() => handleApprove(req.id, req.name)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-500/20"
                        >
                          ✅ Approve Access
                        </button>
                        <button
                          onClick={() => handleReject(req.id, req.name)}
                          className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 font-bold text-xs rounded-xl transition"
                        >
                          ❌ Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Notices */}
          {activeTab === 'notices' && (
            <div className="bg-slate-900/80 border border-amber-500/20 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-6 animate-fade-in">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>📢</span> Broadcast Department Circulars & Notices
              </h2>
              <form onSubmit={handlePostNotice} className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Circular / Notice Content</label>
                  <input
                    type="text"
                    value={newNoticeTitle}
                    onChange={(e) => setNewNoticeTitle(e.target.value)}
                    placeholder="e.g. Schedule for Semester 6 Mini Project Evaluation and Demonstration"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="w-full md:w-64">
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Target Audience</label>
                  <select
                    value={newNoticeTarget}
                    onChange={(e) => setNewNoticeTarget(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    {['All Students & Faculty', 'All Faculty & Staff', 'All Students (Sem 1 to 8)', 'Final Year Students Only'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full md:w-auto px-6 py-2 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-extrabold rounded-xl text-sm transition shrink-0 shadow-lg shadow-amber-500/20"
                >
                  📢 Broadcast Now
                </button>
              </form>

              <div className="space-y-3">
                {notices.map((ntc) => (
                  <div key={ntc.id} className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 flex items-center justify-between hover:border-amber-500/40 transition">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {ntc.priority}
                        </span>
                        <span className="text-xs font-semibold text-amber-400">Target: {ntc.target}</span>
                      </div>
                      <h4 className="font-bold text-white text-sm">{ntc.title}</h4>
                      <p className="text-[11px] text-slate-400">Broadcasted on {ntc.date}</p>
                    </div>
                    <button onClick={() => alert('Notice archived')} className="text-slate-500 hover:text-slate-300 text-xs px-3 py-1 bg-slate-900 rounded border border-slate-800">
                      🗑️ Archive
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
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-tr from-amber-500 via-yellow-400 to-orange-400 rounded-full shadow-2xl flex items-center justify-center cursor-pointer hover:scale-110 transition duration-300 z-50 border-2 border-white/20 group"
        title="Open F.R.I.D.A.Y. Executive AI Assistant"
      >
        <span className="text-2xl animate-pulse">🤖</span>
        <span className="absolute -top-10 right-0 bg-slate-900 text-amber-300 text-[11px] font-bold px-3 py-1 rounded-full border border-amber-500/30 shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition duration-200">
          Executive AI Support ➔
        </span>
      </div>
    </div>
  );
}
