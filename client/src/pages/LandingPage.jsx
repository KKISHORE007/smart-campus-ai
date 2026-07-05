// ============================================================
// Student Helpdesk Agent — Page: Landing Page (Fixed Non-Scrolling)
// ============================================================
// - Fixed height (100vh), zero scrollbars
// - Full screen background image carousel (2s auto advance)
// - Invisible left/right click zones for slide navigation
// - Thin top taskbar: Logo left, Authentication right
// - Interactive bottom slide bar: Public Broadcasts & Fee Structure drawer
// ============================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getPublicInfo } from '../services/api.js';

const DEFAULT_SLIDES = [
  { id: 'slide-1', url: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1400&q=80', title: 'XYZ Engineering College Campus', subtitle: 'Excellence in Engineering & Innovation Since 1998' },
  { id: 'slide-2', url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1400&q=80', title: 'AI & Robotics Innovation Center', subtitle: 'State-of-the-art NVIDIA GPU clusters for student projects' },
  { id: 'slide-3', url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1400&q=80', title: 'Collaborative Learning Spaces', subtitle: '24/7 Digital Library and student research hubs' },
  { id: 'slide-4', url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1400&q=80', title: 'Annual InnoVision Tech Fest', subtitle: 'Over 400 teams competing for innovation grants' }
];

export default function LandingPage() {
  const { institution: authInst, isAuthenticated, isSuperAdmin, user, logout } = useAuth();
  const navigate = useNavigate();

  const [institution, setInstitution] = useState(authInst || null);
  const [announcements, setAnnouncements] = useState([]);
  const [feeStructure, setFeeStructure] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Drawer state: null (closed), 'announcements' (notices), or 'fees' (fee structure)
  const [activeBottomTab, setActiveBottomTab] = useState(null);

  // Push F.R.I.D.A.Y. bot to back when Updates drawer is open
  useEffect(() => {
    if (activeBottomTab) {
      document.body.classList.add('drawer-open');
    } else {
      document.body.classList.remove('drawer-open');
    }
    return () => document.body.classList.remove('drawer-open');
  }, [activeBottomTab]);

  const slides = (institution?.heroCarouselImages && institution.heroCarouselImages.length > 0)
    ? institution.heroCarouselImages
    : DEFAULT_SLIDES;

  // Fetch live public info (carousel slides & announcements)
  useEffect(() => {
    getPublicInfo()
      .then((data) => {
        if (data.institution) setInstitution(data.institution);
        if (data.announcements) setAnnouncements(data.announcements);
        if (data.feeStructure) setFeeStructure(data.feeStructure);
      })
      .catch((err) => console.warn('Could not fetch public info, using defaults:', err.message));
  }, []);

  // 2-Second Auto Sliding Carousel
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 2000); // Exactly 2 seconds delay as requested
    return () => clearInterval(timer);
  }, [slides.length]);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };
  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#0f172a', color: 'white', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* FULL SCREEN CAROUSEL BACKGROUND */}
      {slides.map((slide, index) => (
        <div
          key={slide.id || index}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `url(${slide.url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: index === currentSlide ? 1 : 0,
            transition: 'opacity 0.8s ease-in-out',
            zIndex: 1
          }}
        >
          {/* Dark Overlay for Text Readability */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(180deg, rgba(15,23,42,0.8) 0%, rgba(15,23,42,0.35) 50%, rgba(15,23,42,0.9) 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2rem', textAlign: 'center', zIndex: 2 }}>
            <h1 style={{ fontSize: '3.8rem', fontWeight: 900, textShadow: '0 4px 20px rgba(0,0,0,0.8)', margin: '0 0 1rem 0', maxWidth: '1100px', lineHeight: 1.1 }}>
              {slide.title || institution?.name || 'XYZ Engineering College'}
            </h1>
            <p style={{ fontSize: '1.5rem', color: '#e2e8f0', textShadow: '0 2px 10px rgba(0,0,0,0.8)', maxWidth: '850px', margin: '0', fontWeight: 500 }}>
              {slide.subtitle || institution?.motto || 'Excellence in Engineering & Innovation Since 1998'}
            </p>
          </div>
        </div>
      ))}

      {/* INVISIBLE CLICK ZONES FOR CAROUSEL (LEFT / RIGHT) */}
      <div
        onClick={handlePrevSlide}
        style={{ position: 'absolute', top: 0, left: 0, width: '20%', height: '100%', zIndex: 5, cursor: 'pointer' }}
      />
      <div
        onClick={handleNextSlide}
        style={{ position: 'absolute', top: 0, right: 0, width: '20%', height: '100%', zIndex: 5, cursor: 'pointer' }}
      />

      {/* 1. THIN SLEEK TOP NAVBAR */}
      <nav style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '60px', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 2rem', background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        {/* Top Left: College Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <span style={{ fontSize: '1.6rem' }}>{institution?.logo || '🎓'}</span>
          <div>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white', letterSpacing: '0.5px' }}>
              {institution?.name || 'XYZ Engineering College'}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '8px', borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '8px' }}>
              {institution?.code || 'XYZ-EC'}
            </span>
          </div>
        </div>

        {/* Top Right: Authentication & Super Admin */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          {!isAuthenticated && (
            <button
              onClick={() => navigate('/login?role=super_admin')}
              style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.5)', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Access Super Admin Control Center"
            >
              🛡️ Super Admin
            </button>
          )}

          {isAuthenticated ? (
            <>
              <button
                onClick={() => navigate(isSuperAdmin ? '/super-admin' : '/dashboard')}
                style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: 'white', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
              >
                ⚡ Dashboard ({user?.role?.replace('_', ' ').toUpperCase()})
              </button>
              <button
                onClick={() => { logout(); navigate('/'); }}
                style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
              >
                🚪 Sign Out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/signin')}
                style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 10px rgba(59, 130, 246, 0.3)' }}
              >
                🔑 Sign In (Roles)
              </button>
              <button
                onClick={() => navigate('/login')}
                style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
              >
                🚀 Login Portal
              </button>
            </>
          )}
        </div>
      </nav>

      {/* 2. BOTTOM SLIDE BAR / DRAWER TRIGGER */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', zIndex: activeBottomTab ? 9999 : 15 }}>
        
        {/* Bottom Drawer Content Sheet (When Opened) */}
        <div style={{
          maxHeight: activeBottomTab ? '70vh' : '0px',
          overflow: 'hidden',
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(25px)',
          borderTop: activeBottomTab ? '2px solid #3b82f6' : 'none',
          transition: 'max-height 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: '0 -15px 40px rgba(0,0,0,0.7)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 50
        }}>
          {activeBottomTab && (
            <div style={{ padding: '1.5rem 3rem', display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '70vh' }}>
              
              {/* Drawer Header & Tabs */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    onClick={() => setActiveBottomTab('announcements')}
                    style={{ padding: '0.7rem 1.5rem', borderRadius: '12px', border: 'none', background: activeBottomTab === 'announcements' ? '#3b82f6' : 'rgba(255,255,255,0.05)', color: 'white', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}
                  >
                    📢 Public Broadcasts ({announcements.length})
                  </button>
                  <button
                    onClick={() => setActiveBottomTab('fees')}
                    style={{ padding: '0.7rem 1.5rem', borderRadius: '12px', border: 'none', background: activeBottomTab === 'fees' ? '#10b981' : 'rgba(255,255,255,0.05)', color: 'white', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}
                  >
                    💰 Institutional Fee Structure ({feeStructure.length})
                  </button>
                </div>
                <button
                  onClick={() => setActiveBottomTab(null)}
                  style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', border: '1px solid #ef4444', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  ⬇️ Close Updates
                </button>
              </div>

              {/* Drawer Body (Scrollable inside drawer only) */}
              <div style={{ flex: 1, overflowY: 'auto', paddingRight: '1rem' }}>
                
                {/* TAB 1: ANNOUNCEMENTS */}
                {activeBottomTab === 'announcements' && (
                  <div>
                    <h3 style={{ color: '#60a5fa', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>📢</span> Campus Noticeboard & Administrative Alerts (Fed by Super Admin)
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                      {announcements && announcements.length > 0 ? (
                        announcements.map((item) => (
                          <div key={item.id} style={{ background: 'rgba(30, 41, 59, 0.8)', borderLeft: `4px solid ${item.priority === 'urgent' ? '#ef4444' : item.priority === 'high' ? '#f59e0b' : '#3b82f6'}`, padding: '1.2rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8' }}>
                              <span>📅 {item.date}</span>
                              <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '8px', fontWeight: 600 }}>
                                Target: {(item.targetRole || 'All Campus').toUpperCase()}
                              </span>
                            </div>
                            <h4 style={{ margin: '0.3rem 0 0 0', fontSize: '1.1rem', color: 'white' }}>{item.title}</h4>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.5 }}>{item.content}</p>
                          </div>
                        ))
                      ) : (
                        <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(30,41,59,0.5)', borderRadius: '12px', gridColumn: '1 / -1' }}>
                          <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>No immediate announcements broadcasted by Super Admin.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 2: FEE STRUCTURE */}
                {activeBottomTab === 'fees' && (
                  <div>
                    <h3 style={{ color: '#34d399', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>💰</span> Official Institutional Fee Schedule & Course Names (Fed by Super Admin)
                    </h3>
                    <div style={{ background: 'rgba(30, 41, 59, 0.8)', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
                        <thead>
                          <tr style={{ background: 'rgba(0,0,0,0.4)', color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <th style={{ padding: '1rem' }}>Academic Program / Course Name</th>
                            <th style={{ padding: '1rem' }}>Tuition Fee (Per Sem)</th>
                            <th style={{ padding: '1rem' }}>Development Fee</th>
                            <th style={{ padding: '1rem' }}>Exam & Library Fee</th>
                            <th style={{ padding: '1rem', color: '#34d399' }}>Total Semester Payable</th>
                            <th style={{ padding: '1rem' }}>Official Due Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {feeStructure && feeStructure.length > 0 ? (
                            feeStructure.map((fee, idx) => (
                              <tr key={fee.id || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '1rem', fontWeight: 700, color: 'white' }}>{fee.program}</td>
                                <td style={{ padding: '1rem', color: '#cbd5e1' }}>{fee.tuitionFee}</td>
                                <td style={{ padding: '1rem', color: '#cbd5e1' }}>{fee.developmentFee}</td>
                                <td style={{ padding: '1rem', color: '#cbd5e1' }}>{fee.examFee || '₹5,000'}</td>
                                <td style={{ padding: '1rem', fontWeight: 800, color: '#34d399' }}>{fee.totalSemester}</td>
                                <td style={{ padding: '1rem' }}>
                                  <span style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>
                                    📅 {fee.dueDate || '15 July 2026'}
                                  </span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                                No fee schedules feeded by Super Admin yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}
        </div>

        {/* Transparent Bottom Bar (Left: Contact, Center: Updates, Right: Address & Map) */}
        <div style={{ position: 'absolute', bottom: '12px', left: 0, width: '100%', display: activeBottomTab ? 'none' : 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1.5rem', zIndex: 10, pointerEvents: 'none' }}>
          
          {/* 1. Left side: Email & Phone */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', background: 'rgba(15, 23, 42, 0.75)', padding: '5px 16px', borderRadius: '20px', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)', pointerEvents: 'auto', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
            <a href={`mailto:${institution?.contactEmail || 'helpdesk@xyzec.edu'}`} style={{ color: '#93c5fd', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', transition: 'color 0.2s' }}>
              <span>📧</span> {institution?.contactEmail || 'helpdesk@xyzec.edu'}
            </a>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
            <a href={`tel:${institution?.contactPhone || '+91 98765 43210'}`} style={{ color: '#93c5fd', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', transition: 'color 0.2s' }}>
              <span>📞</span> {institution?.contactPhone || '+91 98765 43210'}
            </a>
          </div>

          {/* Center: Persistent Compact Updates Button */}
          <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'auto' }}>
            <button
              onClick={() => setActiveBottomTab(activeBottomTab ? null : 'announcements')}
              style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.35) 0%, rgba(29, 78, 216, 0.45) 100%)',
                border: '1px solid rgba(96, 165, 250, 0.5)',
                color: 'white',
                padding: '4px 18px',
                borderRadius: '16px',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                backdropFilter: 'blur(12px)'
              }}
            >
              <span>{activeBottomTab ? '⬇️ Close Updates' : '⬆️ Updates'}</span>
              {!activeBottomTab && (
                <span style={{ background: '#3b82f6', color: 'white', padding: '1px 7px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 800 }}>
                  {(announcements.length || 0) + (feeStructure.length || 0)}
                </span>
              )}
            </button>
          </div>

          {/* 2. Right side: Address & View Map (expandable without clipping) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(15, 23, 42, 0.75)', padding: '5px 16px', borderRadius: '20px', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)', pointerEvents: 'auto', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
            <span style={{ color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>📍</span> {institution?.address || 'Knowledge Campus, Tech Valley, Bangalore 560001'}
            </span>
            <a
              href={institution?.locationUrl || 'https://maps.google.com/?q=XYZ+Engineering+College'}
              target="_blank"
              rel="noopener noreferrer"
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)', transition: 'transform 0.2s', whiteSpace: 'nowrap' }}
            >
              <span>🗺️</span> View Map
            </a>
          </div>

        </div>
      </div>

    </div>
  );
}
