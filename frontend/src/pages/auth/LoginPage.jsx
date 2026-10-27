import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, AlertCircle, ArrowRight, UserCheck, Shield } from 'lucide-react';
import { KuvoraLogo } from '../../components/common/KuvoraLogo';

export const LoginPage = () => {
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const user = await login(email, password);
      if (user.role === 'recruiter') navigate('/recruiter/dashboard');
      else if (user.role === 'admin') navigate('/admin/analytics');
      else navigate('/jobs');
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async (role) => {
    setLoading(true);
    setError(null);
    try {
      const user = await demoLogin(role);
      if (role === 'recruiter') navigate('/recruiter/dashboard');
      else if (role === 'admin') navigate('/admin/analytics');
      else navigate('/jobs');
    } catch (err) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <KuvoraLogo size="lg" showText={false} className="justify-center mb-3" />
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Sign in to Kuvora</h2>
        <p className="mt-1.5 text-xs text-slate-600">
          Or{' '}
          <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10 space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus-ring"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus-ring"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Quick Demo Credentials Box */}
          <div className="pt-4 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block text-center mb-3">
              1-Click Demo Evaluation Sign-in
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoSignIn('candidate')}
                className="p-2 text-center text-[11px] font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
              >
                Candidate (David)
              </button>
              <button
                type="button"
                onClick={() => handleDemoSignIn('recruiter')}
                className="p-2 text-center text-[11px] font-medium text-brand-700 bg-brand-50/50 hover:bg-brand-50 border border-brand-200 rounded-lg transition-colors"
              >
                Recruiter (Sarah)
              </button>
              <button
                type="button"
                onClick={() => handleDemoSignIn('admin')}
                className="p-2 text-center text-[11px] font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
              >
                Admin (Alex)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
