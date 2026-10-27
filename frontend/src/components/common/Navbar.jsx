import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Briefcase,
  Search,
  FileText,
  User,
  Bookmark,
  LayoutDashboard,
  Users,
  Shield,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout, demoLogin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleDemoSwitch = async (role) => {
    try {
      await demoLogin(role);
      setRoleDropdownOpen(false);
      if (role === 'candidate') navigate('/jobs');
      else if (role === 'recruiter') navigate('/recruiter/dashboard');
      else if (role === 'admin') navigate('/admin/analytics');
    } catch (err) {
      console.error('Demo switch error:', err);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Demo Bar for Reviewers */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-brand-600/30 text-brand-300 text-[11px] font-medium border border-brand-500/40">
            Interactive Multi-Role ATS
          </span>
          <span className="hidden sm:inline text-slate-400">
            Current Persona: <strong className="text-white capitalize">{user?.role || 'Guest'}</strong> ({user?.name || 'Not signed in'})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden md:inline text-slate-400">Instant Demo Switch:</span>
          <button
            onClick={() => handleDemoSwitch('candidate')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              user?.role === 'candidate' ? 'bg-brand-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Candidate (David)
          </button>
          <button
            onClick={() => handleDemoSwitch('recruiter')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              user?.role === 'recruiter' ? 'bg-brand-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Recruiter (Sarah)
          </button>
          <button
            onClick={() => handleDemoSwitch('admin')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              user?.role === 'admin' ? 'bg-brand-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Admin (Alex)
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="h-9 w-9 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-lg shadow-sm group-hover:bg-brand-700 transition-colors">
                <Briefcase className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-slate-900 leading-none">
                  TalentPulse
                </span>
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mt-0.5">
                  ATS & Job Portal
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {/* Candidate Links */}
              {(!user || user.role === 'candidate') && (
                <>
                  <Link
                    to="/jobs"
                    className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive('/jobs')
                        ? 'text-brand-600 bg-brand-50/60 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Search className="h-4 w-4" />
                    Find Jobs
                  </Link>

                  {user && (
                    <>
                      <Link
                        to="/applications"
                        className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          isActive('/applications')
                            ? 'text-brand-600 bg-brand-50/60 font-semibold'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <FileText className="h-4 w-4" />
                        My Applications
                      </Link>
                      <Link
                        to="/saved-jobs"
                        className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          isActive('/saved-jobs')
                            ? 'text-brand-600 bg-brand-50/60 font-semibold'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <Bookmark className="h-4 w-4" />
                        Saved
                      </Link>
                      <Link
                        to="/profile"
                        className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          isActive('/profile')
                            ? 'text-brand-600 bg-brand-50/60 font-semibold'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                    </>
                  )}
                </>
              )}

              {/* Recruiter Links */}
              {user?.role === 'recruiter' && (
                <>
                  <Link
                    to="/recruiter/dashboard"
                    className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive('/recruiter/dashboard')
                        ? 'text-brand-600 bg-brand-50/60 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Overview
                  </Link>
                  <Link
                    to="/recruiter/jobs"
                    className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive('/recruiter/jobs')
                        ? 'text-brand-600 bg-brand-50/60 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Briefcase className="h-4 w-4" />
                    Manage Jobs
                  </Link>
                  <Link
                    to="/recruiter/applicants"
                    className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive('/recruiter/applicants')
                        ? 'text-brand-600 bg-brand-50/60 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Users className="h-4 w-4" />
                    Applicant Pipeline
                  </Link>
                  <Link
                    to="/jobs"
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-800"
                  >
                    Public Job Board
                  </Link>
                </>
              )}

              {/* Admin Links */}
              {user?.role === 'admin' && (
                <>
                  <Link
                    to="/admin/analytics"
                    className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive('/admin/analytics')
                        ? 'text-brand-600 bg-brand-50/60 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Platform Analytics
                  </Link>
                  <Link
                    to="/admin/jobs"
                    className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive('/admin/jobs')
                        ? 'text-brand-600 bg-brand-50/60 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Briefcase className="h-4 w-4" />
                    Job Moderation
                  </Link>
                  <Link
                    to="/admin/users"
                    className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive('/admin/users')
                        ? 'text-brand-600 bg-brand-50/60 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Shield className="h-4 w-4" />
                    User Directory
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* Right Action Buttons / User Menu */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left"
                >
                  <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 text-brand-700 font-semibold flex items-center justify-center text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left pr-1">
                    <p className="text-xs font-semibold text-slate-800 leading-tight">{user.name}</p>
                    <p className="text-[11px] text-slate-500 capitalize">{user.role}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white py-1 shadow-lg border border-slate-200 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-800">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 capitalize">
                        {user.role} workspace
                      </span>
                    </div>

                    {user.role === 'candidate' && (
                      <Link
                        to="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        <User className="h-4 w-4 text-slate-400" />
                        Candidate Profile
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                        navigate('/login');
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 text-left transition-colors"
                    >
                      <LogOut className="h-4 w-4 text-rose-500" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {(!user || user.role === 'candidate') && (
            <>
              <Link
                to="/jobs"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Find Jobs
              </Link>
              {user && (
                <>
                  <Link
                    to="/applications"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    My Applications
                  </Link>
                  <Link
                    to="/saved-jobs"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Saved Jobs
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Profile Builder
                  </Link>
                </>
              )}
            </>
          )}

          {user?.role === 'recruiter' && (
            <>
              <Link
                to="/recruiter/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Recruiter Dashboard
              </Link>
              <Link
                to="/recruiter/jobs"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Manage Job Postings
              </Link>
              <Link
                to="/recruiter/applicants"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Applicant Pipeline
              </Link>
            </>
          )}

          {user?.role === 'admin' && (
            <>
              <Link
                to="/admin/analytics"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Platform Analytics
              </Link>
              <Link
                to="/admin/jobs"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Job Moderation
              </Link>
              <Link
                to="/admin/users"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                User Directory
              </Link>
            </>
          )}

          {user && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
                navigate('/login');
              }}
              className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-rose-600 hover:bg-rose-50"
            >
              Sign Out
            </button>
          )}
        </div>
      )}
    </header>
  );
};
