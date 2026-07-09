// ============================================================
// Student Helpdesk Agent — Page: 2-Step Student Onboarding Wizard
// ============================================================
// Step 1: Personal, Academic & Identification Info
//         - Full Name
//         - College Exam Register Number (Roll No) [Different from Login ID]
//         - Registration ID / College Email [Login ID]
//         - College Joining Year & Date of Birth
//         - Academic Department
//         + Profile Picture Studio (Webcam Live Capture & File Upload)
// Step 2: Security Credentials & ID Verification
//         - Password & Confirm Password with Show/Hide Eye Toggle Buttons (👁️ / 🙈)
//         - Live Password Strength Meter
// Navigates directly to Student Dashboard upon completion.
// ============================================================

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { registerUser } from '../services/api.js';

export default function StudentOnboard() {
  const { login, directLogin, institution } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 | 2
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Step 1 Form States (Separate Exam Register No & Registration Login ID)
  const [name, setName] = useState('');
  const [registerNo, setRegisterNo] = useState(''); // College Exam Register Number (Roll No)
  const [loginId, setLoginId] = useState('');       // Registration ID / College Email (Login ID)
  const [joinYear, setJoinYear] = useState('2026');
  const [dob, setDob] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [photoUrl, setPhotoUrl] = useState(null);

  // Webcam States
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraError, setCameraError] = useState(null);

  // Step 2 Security States
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password Strength Calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: 'None', color: '#64748b', percentage: 0 };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 1:
      case 2:
        return { score, label: 'Weak ⚠️', color: '#ef4444', percentage: 33 };
      case 3:
      case 4:
        return { score, label: 'Good 🟡', color: '#f59e0b', percentage: 66 };
      case 5:
        return { score, label: 'Strong / Unbreakable 🛡️', color: '#10b981', percentage: 100 };
      default:
        return { score: 0, label: 'Too Short', color: '#ef4444', percentage: 15 };
    }
  };

  const strength = getPasswordStrength(password);

  // Handle Camera Start / Stop
  const startCamera = async () => {
    setCameraError(null);
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setCameraError('Unable to access camera. Please allow webcam permission or use File Upload.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 320;
      canvas.height = video.videoHeight || 240;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');
      setPhotoUrl(dataUrl);
      stopCamera();
    }
  };

  // Handle File Upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Clean up camera on unmount
  useEffect(() => {
    return () => stopCamera();
  }, []);

  const handleStep1Next = (e) => {
    e.preventDefault();
    if (!name.trim() || !registerNo.trim() || !loginId.trim() || !dob) {
      setError('Please fill in all mandatory fields: Name, Exam Register Number, Registration ID, and Date of Birth.');
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleCompleteRegistration = async (e) => {
    e.preventDefault();
    if (!password) {
      setError('Please create a strong password for your account.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match! Please verify both fields.');
      return;
    }
    if (strength.score < 2) {
      setError('Please choose a stronger password (min 6 characters with numbers/letters).');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Build profile object
      const customProfile = {
        name: name.trim(),
        registerNo: registerNo.trim().toUpperCase(), // Exam Roll Number
        userId: registerNo.trim().toUpperCase(),     // Primary locked identifier
        loginId: loginId.trim(),                     // Registration Email / Login ID
        joinYear,
        dob,
        department,
        role: 'student',
        photoUrl: photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', // Default clean avatar
        status: 'pending_approval',
        password,
        bio: `Enrolled in ${department}, Batch of ${joinYear}. Exam Roll No: ${registerNo.trim().toUpperCase()}.`,
        email: loginId.includes('@') ? loginId.trim() : `${loginId.trim()}@xyzec.edu`,
        phone: '+91 98765 43210'
      };

      // Save to backend database
      try {
        await registerUser(customProfile);
      } catch (e) {
        console.warn('Backend registration note:', e.message);
      }

      // Save to pending students queue
      const pendingStudents = JSON.parse(localStorage.getItem('helpdesk_pending_students') || '[]');
      pendingStudents.push(customProfile);
      localStorage.setItem('helpdesk_pending_students', JSON.stringify(pendingStudents));

      // Also register into local accounts dictionary with pending_approval status
      const accounts = JSON.parse(localStorage.getItem('helpdesk_student_accounts') || '{}');
      accounts[customProfile.loginId.toLowerCase()] = customProfile;
      accounts[customProfile.email.toLowerCase()] = customProfile;
      accounts[customProfile.registerNo.toLowerCase()] = customProfile;
      localStorage.setItem('helpdesk_student_accounts', JSON.stringify(accounts));

      setStep('submitted');
    } catch (err) {
      setError('Failed to create account: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" style={{ padding: '2rem 1rem', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="login-card glass-panel" style={{ maxWidth: '700px', width: '100%', border: '1px solid rgba(59, 130, 246, 0.4)', boxShadow: '0 15px 45px rgba(15, 23, 42, 0.8)' }}>
        
        {/* Header */}
        <div className="login-header" style={{ marginBottom: '1.5rem' }}>
          <div className="institution-logo-large">{institution?.logo || '🎓'}</div>
          <h2 style={{ fontSize: '1.8rem', background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Student Portal Onboarding
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: '0.4rem 0' }}>
            {step === 1 ? 'Step 1 of 2: Academic Profile, Exam No & Registration ID' : 'Step 2 of 2: Security Password & Account Setup'}
          </p>
          
          {/* Progress Bar */}
          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden', marginTop: '1rem' }}>
            <div style={{ width: step === 1 ? '50%' : '100%', height: '100%', background: 'linear-gradient(90deg, #3b82f6 0%, #10b981 100%)', transition: 'width 0.3s ease' }} />
          </div>
        </div>

        {error && <div className="login-error-alert" style={{ marginBottom: '1.5rem' }}>⚠️ {error}</div>}

        {/* STEP 1 FORM */}
        {step === 1 && (
          <form onSubmit={handleStep1Next} className="login-form">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              
              <div className="form-group">
                <label>Full Student Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Rohit Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Exam Register Number *</span>
                  <span style={{ fontSize: '0.75rem', color: '#38bdf8' }}>Exam Roll No</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., REG-2026-8942 (College Exam Roll No)"
                  value={registerNo}
                  onChange={(e) => setRegisterNo(e.target.value)}
                  required
                />
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Your official semester examination roll number.</span>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Registration ID / Email *</span>
                  <span style={{ fontSize: '0.75rem', color: '#10b981' }}>Portal Login ID</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., rohit@xyzec.edu or rohit.k"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  required
                />
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Your unique email/ID used to sign in to the portal.</span>
              </div>

              <div className="form-group">
                <label>College Joining Year *</label>
                <select
                  value={joinYear}
                  onChange={(e) => setJoinYear(e.target.value)}
                  style={{ padding: '0.8rem', background: '#0f172a', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', width: '100%' }}
                >
                  <option value="2026">2026 (Batch of 2026-2030)</option>
                  <option value="2025">2025 (Batch of 2025-2029)</option>
                  <option value="2024">2024 (Batch of 2024-2028)</option>
                  <option value="2023">2023 (Batch of 2023-2027)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Date of Birth *</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                  style={{ padding: '0.8rem', background: '#0f172a', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', width: '100%' }}
                />
              </div>

              <div className="form-group">
                <label>Academic Department *</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  style={{ width: '100%', padding: '0.8rem', background: '#0f172a', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }}
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering (CSE)</option>
                  <option value="Artificial Intelligence & Data Science">Artificial Intelligence & Data Science (AI&DS)</option>
                  <option value="Electronics & Communication Engineering">Electronics & Communication Engineering (ECE)</option>
                  <option value="Mechanical & Robotics Engineering">Mechanical & Robotics Engineering (MRE)</option>
                </select>
              </div>

            </div>

            {/* PHOTO STUDIO SECTION */}
            <div style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1.2rem', marginTop: '1rem' }}>
              <label style={{ display: 'block', color: '#38bdf8', fontWeight: 700, marginBottom: '0.8rem', fontSize: '1rem' }}>
                📸 Profile Picture Studio (Webcam / File Upload)
              </label>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center', justifyContent: 'center' }}>
                {/* Photo Preview / Canvas */}
                <div style={{ width: '120px', height: '120px', borderRadius: '50%', border: '3px solid #3b82f6', overflow: 'hidden', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', boxShadow: '0 5px 15px rgba(59,130,246,0.3)' }}>
                  {photoUrl ? (
                    <img src={photoUrl} alt="Profile Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '3rem' }}>👨‍🎓</span>
                  )}
                  {photoUrl && (
                    <button
                      type="button"
                      onClick={() => setPhotoUrl(null)}
                      style={{ position: 'absolute', bottom: 2, right: 2, background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 'bold' }}
                      title="Remove Photo"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Controls */}
                <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {!cameraActive ? (
                    <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={startCamera}
                        style={{ flex: 1, padding: '0.7rem 1rem', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '1px solid #3b82f6', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.2s' }}
                      >
                        📸 Open Webcam
                      </button>
                      <label style={{ flex: 1, padding: '0.7rem 1rem', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid #10b981', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', textAlign: 'center', margin: 0 }}>
                        📁 Upload Photo
                        <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                      </label>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ position: 'relative', width: '100%', maxWidth: '280px', borderRadius: '8px', overflow: 'hidden', border: '2px solid #38bdf8' }}>
                        <video ref={videoRef} autoPlay playsInline style={{ width: '100%', display: 'block' }} />
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          onClick={capturePhoto}
                          style={{ flex: 1, padding: '0.6rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
                        >
                          🟢 Snap Photo
                        </button>
                        <button
                          type="button"
                          onClick={stopCamera}
                          style={{ padding: '0.6rem 1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                  {cameraError && <p style={{ color: '#f87171', fontSize: '0.8rem', margin: 0 }}>⚠️ {cameraError}</p>}
                  <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0 }}>
                    💡 Photo is saved locally and editable anytime from your Profile Dashboard.
                  </p>
                </div>
              </div>
            </div>

            {/* Hidden Canvas for capture */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            <button
              type="submit"
              className="login-submit-btn"
              style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', marginTop: '1.5rem', padding: '1rem', fontSize: '1.05rem' }}
            >
              Next Step: Security & Password Setup ➔
            </button>

            <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <Link to="/login?role=student" style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
                🔑 Already created your Student ID? Direct Login here ➔
              </Link>
            </div>
          </form>
        )}

        {/* STEP 2 FORM */}
        {step === 2 && (
          <form onSubmit={handleCompleteRegistration} className="login-form">
            {/* Summary Card */}
            <div style={{ background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #38bdf8', background: '#0f172a' }}>
                {photoUrl ? <img src={photoUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>👨‍🎓</span>}
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <h4 style={{ margin: 0, color: 'white', fontSize: '1.1rem' }}>{name}</h4>
                <p style={{ margin: '2px 0 0 0', color: '#38bdf8', fontSize: '0.85rem' }}>Exam Roll No: <strong>{registerNo}</strong> • Batch of {joinYear}</p>
                <p style={{ margin: '2px 0 0 0', color: '#34d399', fontSize: '0.85rem' }}>Login ID: <strong>{loginId}</strong></p>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{ background: 'transparent', border: '1px solid #60a5fa', color: '#60a5fa', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
              >
                ✏️ Edit Info
              </button>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Create Security Password *</span>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Min 6 chars</span>
              </label>
              
              {/* PASSWORD FIELD WITH EYE BUTTON */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 6 characters (Letters, numbers, symbols)"
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
              
              {/* LIVE PASSWORD STRENGTH METER */}
              {password && (
                <div style={{ marginTop: '0.6rem', background: 'rgba(0,0,0,0.3)', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                    <span style={{ color: '#cbd5e1' }}>Password Strength:</span>
                    <strong style={{ color: strength.color }}>{strength.label}</strong>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${strength.percentage}%`, height: '100%', background: strength.color, transition: 'all 0.3s ease' }} />
                  </div>
                  <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.2rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                    <li style={{ color: password.length >= 8 ? '#10b981' : '#94a3b8' }}>At least 8 characters</li>
                    <li style={{ color: /[A-Z]/.test(password) && /[0-9]/.test(password) ? '#10b981' : '#94a3b8' }}>Contains uppercase letter & numbers</li>
                    <li style={{ color: /[^A-Za-z0-9]/.test(password) ? '#10b981' : '#94a3b8' }}>Contains symbol (@, #, $, !, etc.)</li>
                  </ul>
                </div>
              )}
            </div>

            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label>Confirm Security Password *</label>
              
              {/* CONFIRM PASSWORD FIELD WITH EYE BUTTON */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter your password to confirm"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={{ width: '100%', paddingRight: '45px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ position: 'absolute', right: '10px', background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontSize: '1.2rem', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title={showConfirmPassword ? "Hide Confirm Password" : "Show Confirm Password"}
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{ flex: 1, padding: '0.9rem', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
              >
                ⬅️ Back
              </button>
              <button
                type="submit"
                className="login-submit-btn"
                style={{ flex: 2, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', margin: 0 }}
                disabled={loading}
              >
                {loading ? 'Creating Student Account...' : '🚀 Submit Registration for Approval'}
              </button>
            </div>
          </form>
        )}

        {step === 'submitted' && (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>⏳</div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fbbf24', margin: '0 0 1rem 0' }}>
              Registration Submitted for Super Admin Approval!
            </h3>
            <p style={{ color: '#cbd5e1', lineHeight: 1.6, maxWidth: '520px', margin: '0 auto 1.5rem auto', fontSize: '0.95rem' }}>
              Your Student Portal account has been registered under <strong>Waiting for Approval</strong> status. You cannot access the Student Portal until the Executive Super Admin verifies and approves your membership.
            </p>
            <div style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.4)', padding: '1rem', borderRadius: '12px', marginBottom: '1.8rem', color: '#fcd34d', fontSize: '0.88rem' }}>
              🔒 Security Enforcement: Unverified self-registrations require manual activation in the Super Admin Executive Board.
            </div>
            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '0.9rem 2rem',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white',
                border: 'none',
                fontWeight: 800,
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              Return to Login Page ➔
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
