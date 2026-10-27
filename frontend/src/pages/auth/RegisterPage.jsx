import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';
import { CandidexLogo } from '../../components/common/CandidexLogo';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('candidate');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        company: role === 'recruiter' ? { name: companyName.trim() || 'Hiring Company' } : undefined,
      };

      const user = await register(payload);
      if (user.role === 'recruiter') navigate('/recruiter/dashboard');
      else navigate('/jobs');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <CandidexLogo size="lg" showText={false} className="justify-center mb-3" />
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Create your Candidex account</h2>
        <p className="mt-1.5 text-xs text-slate-600">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
            Sign in here
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

          {/* Role Selector Pill */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">I want to:</label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setRole('candidate')}
                className={`py-2 text-xs font-semibold rounded-lg transition-colors ${
                  role === 'candidate' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Apply for Jobs
              </button>
              <button
                type="button"
                onClick={() => setRole('recruiter')}
                className={`py-2 text-xs font-semibold rounded-lg transition-colors ${
                  role === 'recruiter' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Hire Candidates
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. David Chen"
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus-ring"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus-ring"
              />
            </div>

            {role === 'recruiter' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Organization *</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Stripe, Linear, Razorpay"
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus-ring"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password * (min 6 chars)</label>
              <input
                type="password"
                required
                minLength={6}
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
              {loading ? 'Creating Account...' : 'Complete Registration'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
