import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';

// Page Imports
import { JobSearchPage } from './pages/candidate/JobSearchPage';
import { MyApplicationsPage } from './pages/candidate/MyApplicationsPage';
import { ProfilePage } from './pages/candidate/ProfilePage';
import { SavedJobsPage } from './pages/candidate/SavedJobsPage';

import { RecruiterDashboard } from './pages/recruiter/RecruiterDashboard';
import { JobManagementPage } from './pages/recruiter/JobManagementPage';
import { ApplicantPipelinePage } from './pages/recruiter/ApplicantPipelinePage';

import { AdminDashboard } from './pages/admin/AdminDashboard';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Protected Route Guard
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-6 w-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If unauthorized for this specific role, redirect to appropriate home
    if (user.role === 'recruiter') return <Navigate to="/recruiter/dashboard" replace />;
    if (user.role === 'admin') return <Navigate to="/admin/analytics" replace />;
    return <Navigate to="/jobs" replace />;
  }

  return children;
};

// Root Redirect Helper
const HomeRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user?.role === 'recruiter') return <Navigate to="/recruiter/dashboard" replace />;
  if (user?.role === 'admin') return <Navigate to="/admin/analytics" replace />;
  return <Navigate to="/jobs" replace />;
};

export const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Root */}
              <Route path="/" element={<HomeRedirect />} />

              {/* Public & Candidate Job Search */}
              <Route path="/jobs" element={<JobSearchPage />} />

              {/* Candidate Protected Routes */}
              <Route
                path="/applications"
                element={
                  <ProtectedRoute allowedRoles={['candidate']}>
                    <MyApplicationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute allowedRoles={['candidate']}>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/saved-jobs"
                element={
                  <ProtectedRoute allowedRoles={['candidate']}>
                    <SavedJobsPage />
                  </ProtectedRoute>
                }
              />

              {/* Recruiter Protected Routes */}
              <Route
                path="/recruiter/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                    <RecruiterDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter/jobs"
                element={
                  <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                    <JobManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter/applicants"
                element={
                  <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                    <ApplicantPipelinePage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Protected Routes */}
              <Route
                path="/admin/analytics"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/jobs"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/jobs" replace />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
