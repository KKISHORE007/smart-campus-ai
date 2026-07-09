// ============================================================
// Student Helpdesk Agent — Page: Member Authentication Portal
// ============================================================
// Login and registration portal with role-based routing,
// password show/hide eye buttons (👁️ / 🙈), and complete academic
// registration fields for students (Exam Register No, Join Year, DOB).
// ============================================================

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { registerUser } from '../services/api.js';

export default function Login() {
  const { login, directLogin, institution, isAuthenticated, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role') || 'student';

  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  
  const [regData, setRegData] = useState({
    name: '',
    email: '',
    loginId: '',
    registerNo: '', // College Exam Register Number
    joinYear: '2026',
    dob: '',
    password: '',
    role: roleParam !== 'super_admin' ? roleParam : 'student',
    department: 'Computer Science & Engineering'
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate(isSuperAdmin ? '/super-admin' : '/student-dashboard', { replace: true });
    }
  }, [isAuthenticated, isSuperAdmin, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginId.trim() || !password.trim()) {
      setError('Please provide your ID and Password.');
      return;
    }

    if (roleParam === 'super_admin' && loginId.trim() !== 'stark@123') {
      setError('❌ Executive Access Denied: Super Admin credentials invalid. Only stark@123 is authorized.');
      return;
    }

    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const user = await login({
        loginId: loginId.trim(),
        password: password.trim(),
        role: roleParam,
      });

      if (user.status === 'deleted') {
        setError('❌ Access Denied: This account ID has been deleted by the Super Admin.');
        setLoading(false);
        return;
      }
      if (user.status === 'pending_approval') {
        setError('⏳ Account Approval Pending: Your account is waiting for Super Admin approval. Once approved in the Super Admin Dashboard, you can log in.');
        setLoading(false);
        return;
      }

      // Route based on role
      if (user.role === 'super_admin' || user.role === 'admin') {
        navigate('/super-admin', { replace: true });
      } else if (user.role === 'student' || roleParam === 'student') {
        navigate('/student-dashboard', { replace: true });
      } else if (user.role === 'staff' || roleParam === 'staff') {
        navigate('/staff-dashboard', { replace: true });
      } else if (user.role === 'hod' || roleParam === 'hod') {
        navigate('/hod-dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      if (err.message && (err.message.includes('Access Denied') || err.message.includes('Approval Pending') || err.message.includes('Invalid password') || err.message.includes('deleted') || err.message.includes('pending'))) {
        setError(err.message);
        setLoading(false);
        return;
      }
      if (roleParam === 'super_admin' && loginId === 'stark@123' && password === '12345678') {
        localStorage.setItem('helpdesk_token', 'demo-super-admin-jwt-token-2026');
        localStorage.setItem('helpdesk_user', JSON.stringify({
          name: 'Anthony Edward Stark',
          role: 'super_admin',
          email: 'stark@xyzec.edu',
          department: 'Executive Board',
          status: 'approved',
          loginId: 'stark@123'
        }));
        navigate('/super-admin', { replace: true });
      } else if (roleParam === 'staff') {
        // Check local storage accounts or demo accounts
        const profAccounts = JSON.parse(localStorage.getItem('helpdesk_professor_accounts') || '{}');
        const lookupKey = loginId.trim().toLowerCase();
        const foundProf = profAccounts[lookupKey];

        if (foundProf && foundProf.password === password) {
          if (foundProf.status === 'pending_approval') {
            setError('⏳ Account Approval Pending: Your details have been submitted to Super Admin. Once approved in the Admin Portal, your Professor Portal will open automatically.');
          } else {
            localStorage.setItem('helpdesk_token', 'demo-staff-jwt-token-2026');
            localStorage.setItem('helpdesk_user', JSON.stringify(foundProf));
            navigate('/staff-dashboard', { replace: true });
          }
        } else if ((loginId === 'staff.lib' || loginId === 'prof_cse') && password === 'staff12345') {
          localStorage.setItem('helpdesk_token', 'demo-staff-jwt-token-2026');
          localStorage.setItem('helpdesk_user', JSON.stringify({
            name: 'Dr. Ramesh Kumar',
            role: 'staff',
            staffType: 'class_advisor',
            section: 'A',
            advisorYear: '2nd Year',
            email: 'ramesh.cse@xyzec.edu',
            department: 'Computer Science & Engineering',
            status: 'approved',
            loginId
          }));
          navigate('/staff-dashboard', { replace: true });
        } else {
          setError('❌ Invalid Professor Username/Email or Password. Or your account has not been created.');
        }
      } else if (roleParam === 'hod') {
        // Check local storage accounts or demo accounts
        const hodAccounts = JSON.parse(localStorage.getItem('helpdesk_hod_accounts') || '{}');
        const lookupKey = loginId.trim().toLowerCase();
        const foundHod = hodAccounts[lookupKey];

        if (foundHod && foundHod.password === password) {
          if (foundHod.status === 'pending_approval') {
            setError('⏳ HOD Account Approval Pending: Your details have been submitted to Super Admin. Once approved in the Admin Portal, your HOD Portal will open automatically.');
          } else {
            localStorage.setItem('helpdesk_token', 'demo-hod-jwt-token-2026');
            localStorage.setItem('helpdesk_user', JSON.stringify(foundHod));
            navigate('/hod-dashboard', { replace: true });
          }
        } else if ((loginId === 'hod.cse' || loginId === 'hod_sharma') && password === 'hod12345') {
          localStorage.setItem('helpdesk_token', 'demo-hod-jwt-token-2026');
          localStorage.setItem('helpdesk_user', JSON.stringify({
            name: 'Dr. R. K. Sharma',
            role: 'hod',
            email: 'hod.cse@xyzec.edu',
            department: 'Computer Science & Engineering',
            status: 'approved',
            loginId
          }));
          navigate('/hod-dashboard', { replace: true });
        } else {
          setError('❌ Invalid HOD Username/Email or Password. Or your account has not been created.');
        }
      } else {
        setError(err.message || 'Invalid Login ID or Password. Please check your credentials or request membership.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      try { await registerUser(regData); } catch (e) {}

      if (regData.role === 'student') {
        const customProfile = {
          name: regData.name.trim(),
          registerNo: (regData.registerNo || regData.loginId || regData.email).trim().toUpperCase(),
          userId: (regData.registerNo || regData.loginId || regData.email).trim().toUpperCase(),
          loginId: (regData.loginId || regData.email).split('@')[0],
          joinYear: regData.joinYear || '2026',
          dob: regData.dob || '2006-01-01',
          department: regData.department || 'Computer Science & Engineering',
          role: 'student',
          photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
          status: 'approved',
          bio: `Enrolled in ${regData.department || 'Computer Science & Engineering'}, Batch of ${regData.joinYear || '2026'}.`,
          email: regData.email
        };
        directLogin(customProfile, 'demo-student-jwt-token-2026');
        navigate('/student-dashboard', { replace: true });
        return;
      }

      setSuccessMsg('⏳ Your join request has been submitted! It is currently PENDING Super Admin approval.');
      setIsRegistering(false);
      setLoginId(regData.loginId || regData.email);
      setPassword(regData.password);
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const getRoleTitle = (r) => {
    switch (r) {
      case 'super_admin': return '🛡️ Super Admin Control Center';
      case 'hod': return '🏛️ HOD Portal';
      case 'staff': return '👔 Staff Portal';
      case 'student': return '👨‍🎓 Student Portal';
      default: return '🔑 Member Login';
    }
  };

  return (
    <div className="login-container">
      <div
        className="login-card glass-panel"
        style={roleParam === 'super_admin' ? { border: '2px solid rgba(245, 158, 11, 0.5)', boxShadow: '0 10px 40px rgba(245, 158, 11, 0.2)', background: 'linear-gradient(180deg, rgba(30, 27, 24, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)' } : {}}
      >
        {/* Header */}
        <div className="login-header">
          <div className="institution-logo-large">{institution?.logo || '🎓'}</div>
          <h2 style={roleParam === 'super_admin' ? { background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } : {}}>
            {institution?.name || 'XYZ Engineering College'}
          </h2>
          <span className="portal-badge" style={roleParam === 'super_admin' ? { background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: '1px solid #f59e0b', fontWeight: 800 } : {}}>
            {roleParam === 'super_admin' ? '⚡ Executive Control Hub & Trust Access' : getRoleTitle(roleParam)}
          </span>
        </div>

        {/* Error / Success Alert */}
        {error && <div className="login-error-alert">⚠️ {error}</div>}
        {successMsg && <div className="login-success-alert" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7', padding: '1rem', borderRadius: '8px', border: '1px solid #10b981', marginBottom: '1rem', fontWeight: 600 }}>{successMsg}</div>}

        {/* Login or Register Form */}
        {!isRegistering ? (
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label>{roleParam === 'super_admin' ? 'Executive Admin ID' : (roleParam === 'staff' || roleParam === 'hod' ? 'Username OR Official Email ID' : 'Registration ID / College Email')}</label>
              <input
                type="text"
                placeholder={roleParam === 'super_admin' ? 'Enter Super Admin ID' : (roleParam === 'staff' ? 'e.g. prof_cse or ramesh.cse@xyzec.edu' : roleParam === 'hod' ? 'e.g. hod_sharma or hod.cse@xyzec.edu' : 'e.g., student@xyzec.edu or rohit.k')}
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ width: '100%', paddingRight: '45px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '10px', background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontSize: '1.2rem', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title={showPassword ? "Hide Password" : "Show Password"}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="login-submit-btn"
              style={roleParam === 'super_admin' ? { background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#0f172a', fontWeight: 800 } : {}}
              disabled={loading}
            >
              {loading ? 'Verifying Credentials...' : (roleParam === 'super_admin' ? '🛡️ Sign In to Executive Hub' : 'Sign In')}
            </button>

            {roleParam === 'student' && (
              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <Link to="/student-onboard" style={{ color: '#38bdf8', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none', display: 'inline-block', padding: '0.5rem 1rem', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '20px', border: '1px solid #38bdf8' }}>
                  ✨ New Student? Launch 2-Step Onboarding Studio ➔
                </Link>
              </div>
            )}

            {roleParam === 'staff' && (
              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <Link to="/staff-onboard" style={{ color: '#a78bfa', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none', display: 'inline-block', padding: '0.5rem 1rem', background: 'rgba(139, 92, 246, 0.15)', borderRadius: '20px', border: '1px solid #a78bfa' }}>
                  👨‍🏫 New Professor / Faculty? Feed Details & Register Account ➔
                </Link>
              </div>
            )}

            {roleParam === 'hod' && (
              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <Link to="/hod-onboard" style={{ color: '#f472b6', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none', display: 'inline-block', padding: '0.5rem 1rem', background: 'rgba(236, 72, 153, 0.15)', borderRadius: '20px', border: '1px solid #f472b6' }}>
                  🏛️ New HOD? Feed Details & Register Executive Account ➔
                </Link>
              </div>
            )}

            {roleParam !== 'super_admin' && (
              <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>New comer? </span>
                <button
                  type="button"
                  onClick={() => { setIsRegistering(true); setError(null); }}
                  style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline' }}
                >
                  Request New ID / Sign Up here ➔
                </button>
              </div>
            )}
          </form>
        ) : (
          <form onSubmit={handleRegister} className="login-form">
            <div className="form-group">
              <label>Full Name *</label>
              <input type="text" placeholder="e.g., Rohit Kumar" value={regData.name} onChange={e => setRegData({...regData, name: e.target.value})} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Exam Register No *</span>
                  <span style={{ fontSize: '0.7rem', color: '#38bdf8' }}>Exam Roll No</span>
                </label>
                <input type="text" placeholder="e.g., REG-2026-8942" value={regData.registerNo} onChange={e => setRegData({...regData, registerNo: e.target.value})} required />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Registration Email *</span>
                  <span style={{ fontSize: '0.7rem', color: '#10b981' }}>Login ID</span>
                </label>
                <input type="email" placeholder="e.g., rohit@xyzec.edu" value={regData.email} onChange={e => setRegData({...regData, email: e.target.value, loginId: e.target.value.split('@')[0]})} required />
              </div>
            </div>

            {regData.role === 'student' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>College Joining Year *</label>
                  <select value={regData.joinYear} onChange={e => setRegData({...regData, joinYear: e.target.value})} style={{ padding: '0.7rem', background: '#0f172a', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', width: '100%' }}>
                    <option value="2026">2026 (Batch of 2026-2030)</option>
                    <option value="2025">2025 (Batch of 2025-2029)</option>
                    <option value="2024">2024 (Batch of 2024-2028)</option>
                    <option value="2023">2023 (Batch of 2023-2027)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Date of Birth *</label>
                  <input type="date" value={regData.dob} onChange={e => setRegData({...regData, dob: e.target.value})} required style={{ padding: '0.7rem', background: '#0f172a', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', width: '100%' }} />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Role Requested *</label>
                <select value={regData.role} onChange={e => setRegData({...regData, role: e.target.value})} style={{ padding: '0.7rem', background: '#0f172a', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', width: '100%' }}>
                  <option value="student">👨‍🎓 Student</option>
                  <option value="staff">👔 Faculty Staff</option>
                  <option value="hod">🏛️ Head of Dept (HOD)</option>
                </select>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Department *</label>
                <input type="text" value={regData.department} onChange={e => setRegData({...regData, department: e.target.value})} required />
              </div>
            </div>

            <div className="form-group">
              <label>Create Password *</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  placeholder="Min 6 characters"
                  value={regData.password}
                  onChange={e => setRegData({...regData, password: e.target.value})}
                  required
                  minLength="6"
                  style={{ width: '100%', paddingRight: '45px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  style={{ position: 'absolute', right: '10px', background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontSize: '1.2rem', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title={showRegPassword ? "Hide Password" : "Show Password"}
                >
                  {showRegPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" className="login-submit-btn" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }} disabled={loading}>
              {loading ? 'Submitting Request...' : '🚀 Submit Join Request'}
            </button>
            <p style={{ fontSize: '0.8rem', color: '#fbbf24', textAlign: 'center', marginTop: '0.5rem' }}>
              ⚠️ Note: All new registrations require Super Admin approval before you can log in.
            </p>
            <div style={{ textAlign: 'center', marginTop: '1.2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Already have an ID? </span>
              <button
                type="button"
                onClick={() => { setIsRegistering(false); setError(null); }}
                style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline' }}
              >
                Sign In here ➔
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
