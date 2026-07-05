// ============================================================
// Student Helpdesk Agent — Page: Role Dashboard Router
// ============================================================
// Redirects /dashboard or any general member login directly to their
// full interactive dashboard (Student, Staff, HOD, or Super Admin).
// Eliminates "Under Construction" placeholders forever.
// ============================================================

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import StudentDashboard from './StudentDashboard.jsx';
import StaffDashboard from './StaffDashboard.jsx';
import HodDashboard from './HodDashboard.jsx';

export default function EmptyDashboard() {
  const { user } = useAuth();

  if (user?.role === 'super_admin' || user?.role === 'admin') {
    return <Navigate to="/super-admin" replace />;
  }
  if (user?.role === 'staff' || user?.role === 'faculty') {
    return <StaffDashboard />;
  }
  if (user?.role === 'hod') {
    return <HodDashboard />;
  }
  // Default for students or any general member login: render full StudentDashboard!
  return <StudentDashboard />;
}
