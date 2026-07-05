// ============================================================
// Student Helpdesk Agent — Component: Header & Branding
// ============================================================
// Glassmorphism navigation bar displaying college branding
// (XYZ Engineering College), live AI RAG status, and user profile.
// ============================================================

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSystemHealth } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Header() {
  const { user, institution, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [health, setHealth] = useState({
    status: 'up',
    database: { status: 'offline_fallback', mode: 'In-Memory Mock Store' },
    ai_service: { mode: 'Offline Vector/Keyword Search' },
  });

  useEffect(() => {
    async function checkHealth() {
      try {
        const data = await getSystemHealth();
        if (data) setHealth(data);
      } catch (err) {
        console.warn('Backend health check warning:', err.message);
      }
    }
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const isOnline = health && health.status === 'up';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="app-header glass-panel">
      {/* Brand & Institution Info */}
      <div className="header-brand">
        <span className="brand-logo">{institution?.logo || '🎓'}</span>
        <div className="brand-details">
          <h1>{institution?.name || 'XYZ Engineering College'}</h1>
          <span className="brand-subtitle">
            24/7 Digital AI Campus Companion ({institution?.code || 'XYZ-EC'}) • RAG 2.0
          </span>
        </div>
      </div>

      {/* Center Nav Links */}
      <nav className="header-nav">
        <Link to="/" className="nav-link">💬 Helpdesk Chat</Link>
        <Link to="/about" className="nav-link">ℹ️ System Architecture</Link>
        {isAdmin && (
          <Link to="/admin" className="nav-link admin-nav-link">
            🛡️ Admin Panel
          </Link>
        )}
      </nav>

      {/* Right Action & User Profile */}
      <div className="header-status">
        <div className="status-indicator">
          <span className={`status-dot ${isOnline ? 'online' : 'offline'}`}></span>
          <div className="status-text">
            <span className="status-label">{isOnline ? 'AI Helpdesk Active' : 'Offline Mode'}</span>
            <span className="status-mode">Scope: {institution?.code || 'XYZ-EC'}</span>
          </div>
        </div>

        {isAuthenticated ? (
          <div className="user-profile-badge">
            <span className="user-role-tag">{isAdmin ? 'ADMIN' : 'STUDENT'}</span>
            <span className="user-name">{user?.name?.split(' ')[0] || 'User'}</span>
            <button onClick={handleLogout} className="btn-logout-small" title="Sign Out">🚪</button>
          </div>
        ) : (
          <Link to="/login" className="btn-login">🔑 Sign In</Link>
        )}
      </div>
    </header>
  );
}
