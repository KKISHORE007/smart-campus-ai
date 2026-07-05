// ============================================================
// Student Helpdesk Agent — React Entry Point with Recovery Shield
// ============================================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles/index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React Error Boundary Caught:", error, errorInfo);
  }

  handleReset = () => {
    localStorage.removeItem('helpdesk_student_scores');
    localStorage.removeItem('helpdesk_custom_profile');
    localStorage.removeItem('helpdesk_user');
    localStorage.removeItem('helpdesk_token');
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', background: '#020617', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'sans-serif' }}>
          <div style={{ background: 'rgba(30, 41, 59, 0.9)', border: '2px solid #ef4444', padding: '2.5rem', borderRadius: '20px', maxWidth: '600px', width: '100%', textAlign: 'center', boxShadow: '0 25px 60px rgba(0,0,0,0.9)' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🛡️</div>
            <h2 style={{ fontSize: '1.8rem', color: '#fca5a5', margin: '0 0 1rem 0' }}>Portal Recovery Shield</h2>
            <p style={{ color: '#cbd5e1', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              The portal encountered an outdated or corrupted session state in your browser cache from previous tests. Don't worry, your records are completely safe in the cloud.
            </p>
            <div style={{ background: 'rgba(0,0,0,0.5)', padding: '1rem', borderRadius: '10px', color: '#f87171', fontFamily: 'monospace', fontSize: '0.85rem', marginBottom: '1.8rem', textAlign: 'left', overflowX: 'auto', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              Error: {this.state.error?.message || 'Unknown render exception'}
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => window.location.reload()}
                style={{ padding: '0.8rem 1.5rem', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '1px solid #3b82f6', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
              >
                🔄 Retry Loading
              </button>
              <button
                onClick={this.handleReset}
                style={{ padding: '0.8rem 1.5rem', background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)', transition: 'all 0.2s' }}
              >
                🧹 Clear Old Session & Return Home
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
