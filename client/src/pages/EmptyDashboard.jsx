// ============================================================
// Student Helpdesk Agent — Page: Empty Dashboard (Student/Staff/HOD)
// ============================================================
// Basic dashboard layout for Student, Staff, and HOD roles with
// "Coming Soon" message as feature distribution is handled later.
// ============================================================

import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function EmptyDashboard() {
  const { user, institution, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    window.history.pushState(null, null, window.location.pathname);
    const handlePopState = (e) => {
      const confirmSignout = window.confirm('Do you want to sign out of your Member Portal and return to the Home Page?');
      if (confirmSignout) {
        logout();
        navigate('/', { replace: true });
      } else {
        window.history.pushState(null, null, window.location.pathname);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [logout, navigate]);

  const getRoleTitle = (role) => {
    switch (role) {
      case 'hod': return 'Head of Department (HOD) Portal';
      case 'staff': return 'Faculty & Staff Portal';
      case 'student': return 'Student Academic Portal';
      default: return 'Member Dashboard';
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'hod': return 'badge-hod';
      case 'staff': return 'badge-staff';
      case 'student': return 'badge-student';
      default: return 'badge-general';
    }
  };

  return (
    <div className="empty-dashboard-container">
      {/* Dashboard Navbar */}
      <header className="dashboard-top-bar glass-panel">
        <div className="dash-brand">
          <span className="logo-icon">{institution?.logo || '🎓'}</span>
          <div className="brand-text">
            <h1>{institution?.name || 'XYZ Engineering College'}</h1>
            <span className={`role-badge-small ${getRoleBadgeColor(user?.role)}`}>
              {getRoleTitle(user?.role)}
            </span>
          </div>
        </div>
        <div className="dash-nav-actions">
          <button onClick={() => { logout(); navigate('/'); }} className="btn-logout">
            🚪 Logout ({user?.name || 'Member'})
          </button>
        </div>
      </header>

      {/* Main Empty Layout with Coming Soon */}
      <main className="empty-content-area">
        <div className="coming-soon-card glass-panel">
          <div className="coming-soon-icon">🚧</div>
          <h2>{getRoleTitle(user?.role)} — Under Construction</h2>
          <p className="coming-soon-subtitle">
            All management features are currently centralized in the <strong>Super Admin Dashboard</strong>.
          </p>
          <div className="coming-soon-box">
            <p>
              ⚡ <strong>Status:</strong> Feature distribution across Student, Staff, and HOD roles is scheduled for the next release.
            </p>
            <p>
              For immediate academic queries, timetable checks, fee breakdowns, and attendance policy answers, please use our 24/7 AI Helpdesk Assistant!
            </p>
          </div>

          <div className="empty-actions">
            <Link to="/chat" className="btn-launch-ai">
              🚀 Launch 24/7 AI Helpdesk Assistant
            </Link>
            {user?.role !== 'super_admin' && (
              <Link to="/signin" className="btn-switch-role">
                🔄 Switch to Super Admin Demo (stark@123)
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
