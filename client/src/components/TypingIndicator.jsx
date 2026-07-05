// ============================================================
// Student Helpdesk Agent — Component: Typing Indicator
// ============================================================
// Animated bouncing dots shown while waiting for AI response.
// ============================================================

import React from 'react';

export default function TypingIndicator() {
  return (
    <div className="message-row assistant" style={{ animation: 'slideUp 0.3s ease' }}>
      <div className="message-avatar" title="Helpdesk Agent">
        🎓
      </div>
      <div className="typing-indicator">
        <div className="typing-dot" />
        <div className="typing-dot" />
        <div className="typing-dot" />
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
          Searching college knowledge base...
        </span>
      </div>
    </div>
  );
}
