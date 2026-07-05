// ============================================================
// Student Helpdesk Agent — Component: Sidebar & FAQ Drawer
// ============================================================
// Displays logged-in student profile, college logo, session
// history manager, and 6 quick institution-scoped FAQ buttons.
// ============================================================

import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Sidebar({
  sessions = [],
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onQuickQuestion,
}) {
  const { user, institution } = useAuth();

  const QUICK_FAQS = [
    { label: '💰 Fee Structure & Deadlines', query: `What is the complete fee breakdown for B.Tech at ${institution?.code || 'XYZ-EC'} and what is the late fine?` },
    { label: '📊 75% Attendance Rules', query: `What happens if my attendance drops below 75% at ${institution?.code || 'XYZ-EC'} due to illness?` },
    { label: '🏆 CGPA Calculation Formula', query: `How is CGPA calculated under our 10-point grading system and how do I convert to percentage?` },
    { label: '📚 Library Timings & Books', query: `What are the central library working hours and how many books can undergraduate students issue?` },
    { label: '📜 TC & Digital No Dues', query: `What is the step-by-step procedure to get my Transfer Certificate and clear online No Dues?` },
    { label: '🚫 Anti-Ragging Helpline', query: `What is the punishment for ragging and what is the 24x7 confidential emergency helpline?` },
  ];

  return (
    <aside className="chat-sidebar glass-panel">
      {/* Logged-in User Profile Card */}
      <div className="sidebar-section student-card">
        <div className="student-header">
          <span className="student-avatar">👤</span>
          <div className="student-info">
            <h3>{user?.name || 'Arjun Sharma'}</h3>
            <span className="student-id">{user?.userId || 'STU-XYZ-001'}</span>
          </div>
        </div>
        <div className="student-meta">
          <span className="meta-tag">🏛️ {institution?.code || 'XYZ-EC'}</span>
          <span className="meta-tag">📘 {user?.department || 'CSE'} (Yr {user?.year || 3})</span>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="sidebar-section">
        <button onClick={onNewChat} className="btn-new-chat">
          <span>✨</span> Start New Inquiry
        </button>
      </div>

      {/* Instant FAQ Lookup */}
      <div className="sidebar-section faq-section">
        <h4 className="section-title">⚡ Instant College FAQs ({institution?.code || 'XYZ-EC'})</h4>
        <div className="faq-grid">
          {QUICK_FAQS.map((faq, idx) => (
            <button
              key={idx}
              onClick={() => onQuickQuestion(faq.query)}
              className="faq-chip"
              title={faq.query}
            >
              {faq.label}
            </button>
          ))}
        </div>
      </div>

      {/* Session History List */}
      <div className="sidebar-section history-section">
        <div className="history-header">
          <h4 className="section-title">🗂️ Conversation Archives</h4>
          <span className="session-count">{sessions.length}</span>
        </div>
        <div className="session-list custom-scrollbar">
          {sessions.length === 0 ? (
            <div className="no-sessions">No previous conversations recorded. Ask a question to begin!</div>
          ) : (
            sessions.map((sess) => (
              <div
                key={sess.sessionId}
                className={`session-item ${sess.sessionId === activeSessionId ? 'active' : ''}`}
                onClick={() => onSelectSession(sess.sessionId)}
              >
                <div className="session-info">
                  <span className="session-title">
                    {sess.title || 'General College Inquiry'}
                  </span>
                  <span className="session-date">
                    {new Date(sess.updatedAt || Date.now()).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(sess.sessionId);
                  }}
                  className="btn-delete-session"
                  title="Delete conversation"
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer Branding */}
      <div className="sidebar-footer">
        <p>🔒 Strictly scoped to {institution?.name || 'XYZ Engineering College'} regulations.</p>
      </div>
    </aside>
  );
}
