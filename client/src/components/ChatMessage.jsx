// ============================================================
// Student Helpdesk Agent — Component: Chat Message
// ============================================================
// Renders individual message bubbles (user vs assistant) with
// React Markdown, expandable RAG sources, and timestamp.
// ============================================================

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

export default function ChatMessage({ message }) {
  const { role, content, timestamp, sources = [] } = message;
  const isUser = role === 'user';
  const [showSources, setShowSources] = useState(false);

  const formattedTime = new Date(timestamp || Date.now()).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`message-row ${isUser ? 'user' : 'assistant'}`}>
      <div className="message-avatar" title={isUser ? 'You (Student)' : 'Official Helpdesk AI'}>
        {isUser ? '👤' : '🎓'}
      </div>

      <div className="message-content">
        {isUser ? (
          <div>{content}</div>
        ) : (
          <ReactMarkdown>{content}</ReactMarkdown>
        )}

        {/* RAG Citations Pill */}
        {!isUser && sources && sources.length > 0 && (
          <div className="sources-container">
            <div
              className="sources-title"
              style={{ cursor: 'pointer', userSelect: 'none' }}
              onClick={() => setShowSources(!showSources)}
            >
              <span>📚 Cited College Records ({sources.length})</span>
              <span style={{ fontSize: '0.7rem' }}>{showSources ? '▼' : '▶'}</span>
            </div>

            {showSources && (
              <div className="sources-list" style={{ marginTop: '0.4rem', animation: 'fadeIn 0.2s ease' }}>
                {sources.map((src, idx) => (
                  <span key={idx} className="source-tag" title="Official Policy Document">
                    📄 {src}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        <div
          style={{
            fontSize: '0.7rem',
            color: isUser ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)',
            textAlign: isUser ? 'right' : 'left',
            marginTop: '0.5rem',
          }}
        >
          {formattedTime}
        </div>
      </div>
    </div>
  );
}
