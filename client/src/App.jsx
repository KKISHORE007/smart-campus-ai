// ============================================================
// Student Helpdesk Agent — Main App Component
// ============================================================
// Sets up AuthProvider and React Router routing for:
// - / : Landing Page (First screen on website load)
// - /signin : Role Selection (Student, Staff, HOD, Super Admin)
// - /login : Authentication Portal
// - /dashboard : Empty Dashboard (Student, Staff, HOD)
// - /super-admin : Full Super Admin Dashboard (7 Modules)
// - /chat : AI Helpdesk Chat (Protected)
// - /about : System Info
// ============================================================

import React from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Header from './components/Header.jsx';
import LandingPage from './pages/LandingPage.jsx';
import RoleSelect from './pages/RoleSelect.jsx';
import Login from './pages/Login.jsx';
import EmptyDashboard from './pages/EmptyDashboard.jsx';
import SuperAdminDashboard from './pages/SuperAdminDashboard.jsx';
import Chat from './pages/Chat.jsx';
import About from './pages/About.jsx';
import StudentOnboard from './pages/StudentOnboard.jsx';
import StaffOnboard from './pages/StaffOnboard.jsx';
import HodOnboard from './pages/HodOnboard.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import StaffDashboard from './pages/StaffDashboard.jsx';
import HodDashboard from './pages/HodDashboard.jsx';
import './styles/index.css';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="loading-screen">⏳ Verifying membership credentials...</div>;
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

function SuperAdminRoute({ children }) {
  const { isAuthenticated, isSuperAdmin, loading } = useAuth();
  if (loading) return <div className="loading-screen">⏳ Verifying executive privileges...</div>;
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (!isSuperAdmin) return <Navigate to="/dashboard" replace />;
  return children;
}

function FridayButton({ location, navigate }) {
  return (
    <div
      onClick={() => navigate('/chat')}
      className={`friday-floating-btn ${location.pathname === '/' ? 'friday-home-center' : ''}`}
      title="F.R.I.D.A.Y. AI Helpdesk - Click to Open Assistant"
    >
      <img src="/friday-ai.png" alt="F.R.I.D.A.Y. AI Bot" />
      <span className="friday-tooltip">🤖 Ask F.R.I.D.A.Y.</span>
    </div>
  );
}

function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const hideHeaderRoutes = ['/', '/signin', '/login', '/dashboard', '/super-admin', '/student-onboard', '/staff-onboard', '/hod-onboard', '/student-dashboard', '/staff-dashboard', '/hod-dashboard'];
  const shouldHideHeader = hideHeaderRoutes.includes(location.pathname);

  return (
    <div className="app-container">
      {!shouldHideHeader && <Header />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<RoleSelect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/student-onboard" element={<StudentOnboard />} />
        <Route path="/staff-onboard" element={<StaffOnboard />} />
        <Route path="/hod-onboard" element={<HodOnboard />} />
        <Route
          path="/student-dashboard"
          element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff-dashboard"
          element={
            <ProtectedRoute>
              <StaffDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hod-dashboard"
          element={
            <ProtectedRoute>
              <HodDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <EmptyDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super-admin"
          element={
            <SuperAdminRoute>
              <SuperAdminDashboard />
            </SuperAdminRoute>
          }
        />
        <Route path="/chat" element={<Chat />} />
        <Route path="/admin" element={<Navigate to="/super-admin" replace />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Floating F.R.I.D.A.Y. AI Bot Button */}
      {location.pathname !== '/chat' && (
        <FridayButton location={location} navigate={navigate} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppLayout />
    </AuthProvider>
  );
}
