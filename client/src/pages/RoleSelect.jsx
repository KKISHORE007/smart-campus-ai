// ============================================================
// Student Helpdesk Agent — Page: Role Selection (Sign In)
// ============================================================
// Sign In page displaying four roles: Student, Staff, HOD,
// and Super Admin. User selects their role before entering credentials.
// ============================================================

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function RoleSelect() {
  const { institution, isAuthenticated, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(isSuperAdmin ? '/super-admin' : '/dashboard', { replace: true });
    }
  }, [isAuthenticated, isSuperAdmin, navigate]);

  const ROLES = [
    {
      id: 'student',
      title: 'Student Portal',
      icon: '👨‍🎓',
      badge: 'Undergraduate & PG',
      desc: 'Access academic syllabus, fee schedules, library rules, AI campus advisor, and 8-semester grading.',
      colorClass: 'role-student',
      isHighlight: true,
      path: '/student-onboard',
      btnText: 'Proceed to Student Portal ➔'
    },
    {
      id: 'staff',
      title: 'Professor Portal',
      icon: '👨‍🏫',
      badge: 'Faculty & Class Advisors',
      desc: 'Grading dashboard, internal test marks posting, class advisor section cohorts, and attendance analytics.',
      colorClass: 'role-student',
      isHighlight: true,
      path: '/staff-onboard',
      btnText: 'Proceed to Professor Portal ➔'
    },
    {
      id: 'hod',
      title: 'HOD Portal',
      icon: '🏛️',
      badge: 'Executive Leadership',
      desc: 'Departmental curriculum oversight, faculty review, 8-semester grading analytics, and fee approvals.',
      colorClass: 'role-student',
      isHighlight: true,
      path: '/hod-onboard',
      btnText: 'Proceed to HOD Portal ➔'
    },
  ];

  const handleSelectRole = (role) => {
    if (role.isLocked) {
      alert(`⏳ ${role.title} is scheduled for the next development phase!`);
      return;
    }
    if (role.path) {
      navigate(role.path);
    } else {
      navigate(`/login?role=${role.id}`);
    }
  };

  return (
    <div className="role-select-container">
      <div className="role-select-header">
        <div className="role-logo">{institution?.logo || '🎓'}</div>
        <h1>Select Your Institutional Role</h1>
        <p>Welcome to {institution?.name || 'XYZ Engineering College'} Sign In Portal. Choose your member role to proceed.</p>
      </div>

      <div className="roles-grid">
        {ROLES.map((role) => (
          <div
            key={role.id}
            className={`role-card glass-panel ${role.isHighlight ? 'highlight-card' : ''}`}
            onClick={() => handleSelectRole(role)}
            style={role.isLocked ? { background: 'linear-gradient(145deg, #020617 0%, #0f172a 100%)', border: '1px solid #1e293b', opacity: 0.85, cursor: 'not-allowed' } : { cursor: 'pointer' }}
          >
            {role.isHighlight && <div className="highlight-ribbon" style={{ background: '#3b82f6' }}>⭐ ACTIVE DASHBOARD</div>}
            {role.isLocked && <div className="highlight-ribbon" style={{ background: '#334155', color: '#94a3b8' }}>🔒 IN PROGRESS</div>}
            <div className="role-card-top">
              <span className="role-icon">{role.icon}</span>
              <span className={`role-badge ${role.colorClass}`} style={role.isLocked ? { background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid #334155' } : {}}>
                {role.badge}
              </span>
            </div>
            <h2 style={role.isLocked ? { color: '#94a3b8' } : {}}>{role.title}</h2>
            <p style={role.isLocked ? { color: '#64748b' } : {}}>{role.desc}</p>
            <button
              className="btn-role-select"
              style={role.isLocked ? { background: 'rgba(255,255,255,0.05)', color: '#64748b', border: '1px solid #1e293b' } : { background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
            >
              {role.isLocked ? '🔒 Dashboard Next Release' : (role.btnText || 'Proceed to Portal ➔')}
            </button>
          </div>
        ))}
      </div>

      <div className="role-select-footer">
        <p>🔒 System verifies registered membership before authorizing access.</p>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/login?role=student')}
            style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 600, background: 'rgba(56, 189, 248, 0.1)', padding: '0.6rem 1.2rem', borderRadius: '20px', border: '1px solid #38bdf8', cursor: 'pointer' }}
          >
            🔑 Existing Student Login ➔
          </button>
          <button
            onClick={() => navigate('/login?role=staff')}
            style={{ color: '#a78bfa', textDecoration: 'none', fontWeight: 600, background: 'rgba(139, 92, 246, 0.15)', padding: '0.6rem 1.2rem', borderRadius: '20px', border: '1px solid #a78bfa', cursor: 'pointer' }}
          >
            👨‍🏫 Existing Professor Login ➔
          </button>
          <button
            onClick={() => navigate('/login?role=hod')}
            style={{ color: '#f472b6', textDecoration: 'none', fontWeight: 600, background: 'rgba(236, 72, 153, 0.15)', padding: '0.6rem 1.2rem', borderRadius: '20px', border: '1px solid #f472b6', cursor: 'pointer' }}
          >
            🏛️ Existing HOD Login ➔
          </button>
        </div>
      </div>
    </div>
  );
}
