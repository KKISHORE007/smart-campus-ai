// ============================================================
// Student Helpdesk Agent — Page: Head of Department (HOD) Onboarding Wizard
// ============================================================
// Step 1: Detail Feeding Page
//         - Name (Original full name)
//         - Mail ID (email)
//         - Joining Date
//         - Department
//         - Date of Birth
//         - Profile Picture (Camera & Local Storage Upload)
// Step 2: Account Credentials
//         - Username (Any desired username, distinct from real name)
//         - Password & Confirm Password
// Note: HOD can log in with username OR email ID.
// ============================================================

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { registerUser } from '../services/api.js';

export default function HodOnboard() {
  const { directLogin, institution } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 | 2 | 'submitted'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Step 1 Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().split('T')[0]);
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [dob, setDob] = useState('');
  const [photoUrl, setPhotoUrl] = useState(null);

  // Webcam States
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraError, setCameraError] = useState(null);

  // Step 2 Security States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Intercept Chrome Browser Back Button
  useEffect(() => {
    window.history.pushState(null, null, window.location.pathname);
    const handlePopState = (e) => {
      e.preventDefault();
      if (step === 2) {
        setStep(1);
        window.history.pushState(null, null, window.location.pathname);
      } else {
        navigate('/signin', { replace: true });
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      stopCamera();
    };
  }, [step, navigate]);

  // Webcam controls
  const startCamera = async () => {
    setCameraError(null);
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 100);
    } catch (err) {
      setCameraError('⚠️ Camera permission denied or device unavailable.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((t) => t.stop());
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

  const validateStep1 = () => {
    setError(null);
    if (!name.trim() || !email.trim() || !joiningDate || !dob) {
      setError('⚠️ Please fill in all required fields: Full Name, Mail ID, Joining Date, and Date of Birth.');
      return false;
    }
    if (!email.includes('@')) {
      setError('⚠️ Please enter a valid Email ID.');
      return false;
    }
    return true;
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (validateStep1()) {
      setStep(2);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmitRegistration = async (e) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError('⚠️ Please choose a Username.');
      return;
    }
    if (username.trim().toLowerCase() === name.trim().toLowerCase()) {
      setError('⚠️ Username should be distinct from your original Name.');
      return;
    }
    if (!password || password.length < 6) {
      setError('⚠️ Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('⚠️ Passwords do not match.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const newHodUser = {
        id: `HOD-${Date.now()}`,
        name: name.trim(),
        username: username.trim(),
        email: email.trim(),
        loginId: username.trim(),
        joiningDate,
        dob,
        department,
        role: 'hod',
        photoUrl: photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
        password,
        status: 'pending_approval',
        createdAt: new Date().toLocaleDateString('en-GB')
      };

      try {
        registerUser(newHodUser);
      } catch (e) {}

      try {
        // Save to pending approvals queue for Super Admin
        const pendingQueue = JSON.parse(localStorage.getItem('helpdesk_pending_hods') || '[]');
        pendingQueue.push(newHodUser);
        localStorage.setItem('helpdesk_pending_hods', JSON.stringify(pendingQueue));

        // Also register credentials mapping so HOD can log in via username OR email once approved
        const hodAccounts = JSON.parse(localStorage.getItem('helpdesk_hod_accounts') || '{}');
        hodAccounts[username.trim().toLowerCase()] = newHodUser;
        hodAccounts[email.trim().toLowerCase()] = newHodUser;
        localStorage.setItem('helpdesk_hod_accounts', JSON.stringify(hodAccounts));
      } catch (err) {}

      setLoading(false);
      setStep('submitted');
    }, 900);
  };

  return (
    <div
      className="onboard-container"
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at 50% 10%, #311042 0%, #09090b 100%)',
        color: '#f8fafc',
        padding: '2rem 1rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: "'Inter', sans-serif"
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '740px',
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(236, 72, 153, 0.35)',
          borderRadius: '24px',
          padding: '2.5rem',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(20px)'
        }}
      >
        {/* HEADER BRANDING */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.8rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '2.4rem' }}>🏛️</div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Head of Department (HOD) Registration
              </h1>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8' }}>
                Department Executive Leadership Detail Feeding
              </p>
            </div>
          </div>
          {step !== 'submitted' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(236, 72, 153, 0.15)', border: '1px solid rgba(236, 72, 153, 0.4)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, color: '#fbcfe8' }}>
              Step {step} of 2
            </div>
          )}
        </div>

        {/* ERROR BANNER */}
        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>{error}</span>
          </div>
        )}

        {/* SUBMITTED APPROVAL NOTICE */}
        {step === 'submitted' && (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⏳</div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f472b6', marginBottom: '1rem' }}>
              HOD Account Submitted for Super Admin Approval!
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '1rem', lineHeight: 1.6, maxWidth: '560px', margin: '0 auto 2rem auto' }}>
              Your executive HOD details have been fed and sent to the <strong>Super Admin Executive Board</strong>. Once approved in the Admin Portal, your HOD Portal will automatically unlock.
            </p>
            <div style={{ background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(236, 72, 153, 0.3)', padding: '1.2rem', borderRadius: '14px', maxWidth: '480px', margin: '0 auto 2rem auto', textAlign: 'left', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#94a3b8' }}>Official Full Name:</span>
                <strong style={{ color: 'white' }}>{name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#94a3b8' }}>Username (Login):</span>
                <strong style={{ color: '#f472b6' }}>{username}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#94a3b8' }}>Email ID (Login):</span>
                <strong style={{ color: '#f472b6' }}>{email}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Department:</span>
                <strong style={{ color: '#34d399' }}>{department}</strong>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Link
                to="/login"
                style={{ padding: '0.9rem 2rem', borderRadius: '12px', background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', color: 'white', fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 15px rgba(236, 72, 153, 0.4)' }}
              >
                Go to HOD Login Portal →
              </Link>
            </div>
          </div>
        )}

        {/* STEP 1: DETAIL FEEDING PAGE */}
        {step === 1 && (
          <form onSubmit={handleNextStep}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#fbcfe8', marginBottom: '6px' }}>
                  ORIGINAL FULL NAME *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. R. K. Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', fontSize: '0.95rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#fbcfe8', marginBottom: '6px' }}>
                  OFFICIAL MAIL ID *
                </label>
                <input
                  type="email"
                  placeholder="e.g. hod.cse@xyzec.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', fontSize: '0.95rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#fbcfe8', marginBottom: '6px' }}>
                  JOINING DATE *
                </label>
                <input
                  type="date"
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', fontSize: '0.95rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#fbcfe8', marginBottom: '6px' }}>
                  DATE OF BIRTH *
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', fontSize: '0.95rem' }}
                />
              </div>
            </div>

            {/* DEPARTMENT SELECTION */}
            <div style={{ marginBottom: '1.8rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#fbcfe8', marginBottom: '6px' }}>
                DEPARTMENT OF LEADERSHIP *
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', color: 'white', fontSize: '0.95rem', cursor: 'pointer' }}
              >
                <option value="Computer Science & Engineering">Computer Science & Engineering (CSE)</option>
                <option value="Information Technology">Information Technology (IT)</option>
                <option value="Electronics & Communication">Electronics & Communication (ECE)</option>
                <option value="Electrical & Electronics">Electrical & Electronics (EEE)</option>
                <option value="Mechanical Engineering">Mechanical Engineering (MECH)</option>
              </select>
            </div>

            {/* PROFILE PICTURE STUDIO */}
            <div style={{ marginBottom: '2rem', background: 'rgba(30, 41, 59, 0.4)', padding: '1.2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#fbcfe8', marginBottom: '10px' }}>
                PROFILE PICTURE (OPTIONAL / CAMERA OR LOCAL STORAGE)
              </label>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', flexWrap: 'wrap' }}>
                {photoUrl ? (
                  <div style={{ position: 'relative' }}>
                    <img
                      src={photoUrl}
                      alt="HOD Photo"
                      style={{ width: '84px', height: '84px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #f472b6' }}
                    />
                    <button
                      type="button"
                      onClick={() => setPhotoUrl(null)}
                      style={{ position: 'absolute', top: 0, right: 0, background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', fontWeight: 700 }}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div style={{ width: '84px', height: '84px', borderRadius: '50%', background: 'rgba(15, 23, 42, 0.8)', border: '2px dashed rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                    🏛️
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={startCamera}
                    style={{ padding: '0.7rem 1.2rem', borderRadius: '10px', background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    📸 Take Camera Photo
                  </button>

                  <label
                    style={{ padding: '0.7rem 1.2rem', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', color: 'white', fontWeight: 700, cursor: 'pointer', display: 'inline-block' }}
                  >
                    📁 Upload from Local Storage
                    <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>

              {cameraActive && (
                <div style={{ marginTop: '1.2rem', background: '#020617', padding: '1.5rem', borderRadius: '18px', border: '2px solid #f472b6', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.6)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '12px', color: '#fbcfe8', fontWeight: 800, fontSize: '0.9rem' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', display: 'inline-block', boxShadow: '0 0 10px #ef4444' }} />
                    LIVE CAMERA FEED — Position your face clearly inside the frame
                  </div>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                      width: '100%',
                      maxWidth: '440px',
                      minHeight: '280px',
                      borderRadius: '14px',
                      background: '#0f172a',
                      border: '2px solid rgba(255,255,255,0.2)',
                      transform: 'scaleX(-1)'
                    }}
                  />
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                  <div style={{ marginTop: '14px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button
                      type="button"
                      onClick={capturePhoto}
                      style={{ padding: '0.8rem 1.8rem', borderRadius: '10px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)' }}
                    >
                      📸 Snap & Save Photo
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      style={{ padding: '0.8rem 1.4rem', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', border: '1px solid #ef4444', fontWeight: 700, cursor: 'pointer' }}
                    >
                      ✕ Close Camera
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ACTION BUTTONS */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Link to="/login" style={{ color: '#94a3b8', fontWeight: 600, textDecoration: 'none' }}>
                ← Already have an account? Sign In
              </Link>

              <button
                type="submit"
                style={{ padding: '0.9rem 2.2rem', borderRadius: '12px', background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)', color: 'white', border: 'none', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 18px rgba(236, 72, 153, 0.4)' }}
              >
                Next: Create Login Credentials →
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: USERNAME & PASSWORD CREDENTIALS */}
        {step === 2 && (
          <form onSubmit={handleSubmitRegistration}>
            <div style={{ background: 'rgba(236, 72, 153, 0.12)', border: '1px solid rgba(236, 72, 153, 0.35)', padding: '1rem 1.2rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.88rem', color: '#fbcfe8' }}>
              📌 <strong>Important Note:</strong> Your <em>Username</em> can be anything you wish and must be distinct from your original Name. You can log in using either your <strong>Username</strong> OR your <strong>Email ID</strong> with the password you create here.
            </div>

            <div style={{ marginBottom: '1.3rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#fbcfe8', marginBottom: '6px' }}>
                CHOOSE USERNAME (ANY UNIQUE ID) *
              </label>
              <input
                type="text"
                placeholder="e.g. hod_cse_sharma or leader_sharma"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', fontSize: '0.95rem' }}
              />
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>May be anything as your wish (Distinct from Name)</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#fbcfe8', marginBottom: '6px' }}>
                  PASSWORD *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', fontSize: '0.95rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>

                {/* LIVE PASSWORD STRENGTH METER */}
                {password && (
                  <div style={{ marginTop: '0.6rem', background: 'rgba(2, 6, 23, 0.6)', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(244, 114, 182, 0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                      <span style={{ color: '#cbd5e1' }}>Password Strength:</span>
                      <strong style={{ color: strength.color }}>{strength.label}</strong>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${strength.percentage}%`, height: '100%', background: strength.color, transition: 'all 0.3s ease' }} />
                    </div>
                    <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.2rem', fontSize: '0.73rem', color: '#94a3b8' }}>
                      <li style={{ color: password.length >= 8 ? '#10b981' : '#94a3b8' }}>At least 8 characters</li>
                      <li style={{ color: /[A-Z]/.test(password) && /[0-9]/.test(password) ? '#10b981' : '#94a3b8' }}>Contains uppercase letter & number</li>
                      <li style={{ color: /[^A-Za-z0-9]/.test(password) ? '#10b981' : '#94a3b8' }}>Contains symbol (@, #, $, !, etc.)</li>
                    </ul>
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#fbcfe8', marginBottom: '6px' }}>
                  CONFIRM PASSWORD *
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Re-enter Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', fontSize: '0.95rem' }}
                />
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{ padding: '0.8rem 1.5rem', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', fontWeight: 700, cursor: 'pointer' }}
              >
                ← Back to Details
              </button>

              <button
                type="submit"
                disabled={loading}
                style={{ padding: '0.9rem 2.2rem', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', fontWeight: 800, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 18px rgba(16, 185, 129, 0.4)' }}
              >
                {loading ? 'Submitting to Super Admin...' : '✅ Submit Registration & Request Approval'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
