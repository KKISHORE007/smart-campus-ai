// ============================================================
// Student Helpdesk Agent — Page: Chat Interface
// ============================================================
// Branded helpdesk chat page with college header banner,
// message bubbles, RAG citations, and session management.
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Sidebar from '../components/Sidebar.jsx';
import ChatMessage from '../components/ChatMessage.jsx';
import TypingIndicator from '../components/TypingIndicator.jsx';
import {
  sendMessage,
  getChatHistory,
  getStudentSessions,
  deleteSession as apiDeleteSession,
} from '../services/api.js';

export default function Chat() {
  const { user, institution } = useAuth();
  const location = useLocation();

  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);

  const studentId = user?.userId || 'STU-XYZ-001';

  // Load student sessions on mount or when user changes
  useEffect(() => {
    loadSessions();
  }, [studentId]);

  // Handle incoming quick question from About page navigation
  useEffect(() => {
    if (location.state && location.state.quickQuery) {
      const q = location.state.quickQuery;
      window.history.replaceState({}, document.title); // Clear navigation state
      handleSend(q);
    }
  }, [location]);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadSessions = async () => {
    try {
      const res = await getStudentSessions(studentId);
      if (res && res.sessions) {
        setSessions(res.sessions);
        if (res.sessions.length > 0 && !activeSessionId) {
          selectSession(res.sessions[0].sessionId);
        } else if (res.sessions.length === 0 && !activeSessionId) {
          startNewChat();
        }
      }
    } catch (err) {
      console.warn('Could not load sessions from server, running offline mode:', err.message);
      if (!activeSessionId) startNewChat();
    }
  };

  const selectSession = async (sessionId) => {
    setActiveSessionId(sessionId);
    setError(null);
    try {
      const res = await getChatHistory(sessionId);
      if (res && res.messages) {
        setMessages(res.messages);
      } else {
        setMessages([]);
      }
    } catch (err) {
      setError('Failed to load conversation history.');
    }
  };

  const startNewChat = () => {
    const newId = 'sess-' + Math.random().toString(36).substring(2, 9);
    setActiveSessionId(newId);
    setMessages([
      {
        role: 'assistant',
        content: `Welcome Arjun! I am your **${institution?.name || 'XYZ Engineering College'} AI Helpdesk Advisor**. How can I assist you today with academic rules, fee payments, library timings, or hostel regulations?`,
        sources: ['XYZ-EC Official Student Handbook 2025-2026'],
        suggestions: [
          'What is the complete B.Tech fee structure and late fine?',
          'What happens if my attendance drops below 75%?',
          'What is the procedure to clear online No Dues for TC?',
        ],
        timestamp: new Date(),
      },
    ]);
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      await apiDeleteSession(sessionId);
      const updated = sessions.filter((s) => s.sessionId !== sessionId);
      setSessions(updated);
      if (activeSessionId === sessionId) {
        if (updated.length > 0) {
          selectSession(updated[0].sessionId);
        } else {
          startNewChat();
        }
      }
    } catch (err) {
      setError('Could not delete session.');
    }
  };

  const handleSend = async (messageText) => {
    const textToSend = typeof messageText === 'string' ? messageText : input;
    if (!textToSend || !textToSend.trim()) return;

    const userMsg = { role: 'user', content: textToSend.trim(), timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const res = await sendMessage(
        studentId,
        textToSend.trim(),
        activeSessionId,
        user?.role || 'student',
        user?.name || 'Member'
      );
      if (res && res.success) {
        const aiMsg = {
          role: 'assistant',
          content: res.response,
          sources: res.sources || [],
          suggestions: res.suggestions || [],
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);
        
        // Refresh session list in background
        getStudentSessions(studentId).then((r) => {
          if (r?.sessions) setSessions(r.sessions);
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error connecting to helpdesk agent.');
      const errorMsg = {
        role: 'assistant',
        content: '⚠️ **Network or Backend Error**: Could not connect to the RAG processing pipeline. Please check if your backend server is running on port 5000.',
        sources: [],
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-layout">
      {/* Sidebar Drawer */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={selectSession}
        onNewChat={startNewChat}
        onDeleteSession={handleDeleteSession}
        onQuickQuestion={(q) => handleSend(q)}
      />

      {/* Main Chat Area */}
      <main className="chat-main">
        {/* Institution Branding Banner */}
        <div className="institution-banner glass-panel">
          <div className="banner-content">
            <span className="banner-icon">🏛️</span>
            <div>
              <strong>Official Helpdesk for {institution?.name || 'XYZ Engineering College'} ({institution?.code || 'XYZ-EC'})</strong>
              <p>Powered by Antigravity RAG 2.0 • Real-time policy citations from uploaded institutional archives.</p>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="chat-messages custom-scrollbar">
          {messages.length === 0 ? (
            <div className="empty-chat-state">
              <div className="welcome-card glass-panel">
                <span className="welcome-icon">{institution?.logo || '🎓'}</span>
                <h2>Welcome to {institution?.code || 'XYZ-EC'} Digital Helpdesk</h2>
                <p>
                  I am specialized in answering academic and administrative queries for **{institution?.name || 'XYZ Engineering College'}**. Ask anything about syllabus, attendance condonation, library fines, hostel curfew, or placement eligibility!
                </p>
                <div className="quick-start-buttons">
                  <button onClick={() => handleSend(`What is the fee breakdown for B.Tech at ${institution?.code || 'XYZ-EC'}?`)}>
                    💰 Check Fee Structure
                  </button>
                  <button onClick={() => handleSend(`What happens if my attendance drops below 75% at ${institution?.code || 'XYZ-EC'}?`)}>
                    📊 Attendance Policy
                  </button>
                  <button onClick={() => handleSend(`What is the process to get my Transfer Certificate and clear No Dues?`)}>
                    📜 TC & No Dues Process
                  </button>
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <ChatMessage
                key={idx}
                message={msg}
                onSuggestionClick={(q) => handleSend(q)}
              />
            ))
          )}

          {loading && <TypingIndicator />}
          {error && <div className="chat-error-toast">⚠️ {error}</div>}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Box */}
        <div className="chat-input-container">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="chat-input-box glass-panel"
          >
            <textarea
              rows={1}
              placeholder={`Ask a question about ${institution?.name || 'XYZ Engineering College'} policies, exams, or campus rules...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              className="chat-textarea"
            />
            <button
              type="submit"
              className="btn-send"
              disabled={loading || !input.trim()}
              title="Send Query"
            >
              <span>🚀</span>
            </button>
          </form>
          <div className="chat-input-disclaimer">
            <span>🔒 All answers are strictly scoped to official {institution?.code || 'XYZ-EC'} archives. Verify critical dates with department offices.</span>
          </div>
        </div>
      </main>
    </div>
  );
}
