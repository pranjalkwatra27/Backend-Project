import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  Upload,
  Briefcase,
  GraduationCap,
  FileText,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  ExternalLink,
  Award,
} from 'lucide-react';

export const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState([]);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [experienceYears, setExperienceYears] = useState(0);
  const [expectedCtc, setExpectedCtc] = useState(0);
  const [currentCtc, setCurrentCtc] = useState(0);
  const [noticePeriod, setNoticePeriod] = useState('30 Days');
  const [portfolioLinks, setPortfolioLinks] = useState({ github: '', linkedin: '', portfolio: '' });

  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await apiClient('/profile/me');
      if (data.success && data.profile) {
        const p = data.profile;
        setProfile(p);
        setHeadline(p.headline || '');
        setBio(p.bio || '');
        setPhone(p.phone || '');
        setLocation(p.location || '');
        setSkills(p.skills || []);
        setExperienceYears(p.experienceYears || 0);
        setExpectedCtc(p.expectedCtc || 0);
        setCurrentCtc(p.currentCtc || 0);
        setNoticePeriod(p.noticePeriod || '30 Days');
        setPortfolioLinks(p.portfolioLinks || { github: '', linkedin: '', portfolio: '' });
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkillInput.trim() && !skills.includes(newSkillInput.trim())) {
      setSkills([...skills, newSkillInput.trim()]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);
    try {
      const res = await apiClient('/profile/me', {
        method: 'PUT',
        body: JSON.stringify({
          headline,
          bio,
          phone,
          location,
          skills,
          experienceYears: Number(experienceYears),
          expectedCtc: Number(expectedCtc),
          currentCtc: Number(currentCtc),
          noticePeriod,
          portfolioLinks,
        }),
      });

      if (res.success) {
        setProfile(res.profile);
        setStatusMessage({ type: 'success', text: 'Candidate profile updated successfully!' });
        await refreshUser();
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to save profile updates.' });
    } finally {
      setSaving(false);
    }
  };

  const handleResumeFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setUploadError('Document size exceeds 2MB limit. Please upload a smaller PDF/DOCX file.');
      return;
    }

    setUploadingResume(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await apiClient('/uploads/resume', {
        method: 'POST',
        body: formData,
      });

      if (res.success) {
        await fetchProfile();
        setStatusMessage({ type: 'success', text: 'Resume uploaded and linked to profile!' });
      }
    } catch (err) {
      setUploadError(err.message || 'Failed to upload document.');
    } finally {
      setUploadingResume(false);
    }
  };

  const completionScore = profile?.profileCompletionScore || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Candidate Profile Builder</h1>

          <p className="mt-1 text-xs sm:text-sm text-slate-600">
            A comprehensive profile enhances your ranking score in recruiter candidate search pipelines.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-lg p-3.5 shrink-0">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-12 h-12 -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="4"
                className="text-slate-200"
                fill="transparent"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="4"
                className="text-brand-600 transition-all duration-500"
                strokeDasharray={125.6}
                strokeDashoffset={125.6 - (125.6 * completionScore) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            <span className="absolute text-xs font-bold text-slate-900">{completionScore}%</span>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-800">Profile Completion</p>

            <p className="text-[11px] text-slate-500">
              {completionScore >= 80 ? 'Optimized for Recruiters' : 'Add skills & resume to reach 100%'}
            </p>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`mb-6 p-4 rounded-xl text-xs flex items-center gap-2.5 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSaveProfile} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
            <h2 className="text-sm font-semibold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <User className="h-4 w-4 text-brand-600" />
              General Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Professional Headline *
                </label>

                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Senior Full-Stack Engineer | React, Node.js & Cloud"
                  className="w-full text-xs text-slate-900 border border-slate-200 rounded-lg p-2.5 focus-ring"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number</label>

                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full text-xs text-slate-900 border border-slate-200 rounded-lg p-2.5 focus-ring"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Current Location</label>

                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Bangalore, India"
                  className="w-full text-xs text-slate-900 border border-slate-200 rounded-lg p-2.5 focus-ring"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">Executive Bio</label>

                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Detail your engineering background, major systems architected, and career goals..."
                  className="w-full text-xs text-slate-900 border border-slate-200 rounded-lg p-3 focus-ring"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Experience (Yrs)</label>

                <input
                  type="number"
                  min="0"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  className="w-full text-xs text-slate-900 border border-slate-200 rounded-lg p-2 focus-ring"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Current CTC (LPA)</label>

                <input
                  type="number"
                  min="0"
                  value={currentCtc}
                  onChange={(e) => setCurrentCtc(e.target.value)}
                  className="w-full text-xs text-slate-900 border border-slate-200 rounded-lg p-2 focus-ring"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Expected CTC (LPA)</label>

                <input
                  type="number"
                  min="0"
                  value={expectedCtc}
                  onChange={(e) => setExpectedCtc(e.target.value)}
                  className="w-full text-xs text-slate-900 border border-slate-200 rounded-lg p-2 focus-ring"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Notice Period</label>

                <select
                  value={noticePeriod}
                  onChange={(e) => setNoticePeriod(e.target.value)}
                  className="w-full text-xs text-slate-900 border border-slate-200 rounded-lg p-2 focus-ring bg-white"
                >
                  <option value="Immediate">Immediate</option>

                  <option value="15 Days">15 Days</option>

                  <option value="30 Days">30 Days</option>

                  <option value="60 Days">60 Days</option>

                  <option value="90 Days">90 Days</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Core Competencies & Skills (Indexed)
              </label>

              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="e.g. Next.js, Redux, PostgreSQL..."
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  className="flex-1 text-xs border border-slate-200 rounded-lg p-2 focus-ring"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-3.5 py-2 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {skills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-brand-50 text-brand-700 border border-brand-200"
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(s)}
                      className="hover:text-brand-900"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3">
              <label className="block text-xs font-semibold text-slate-800">Portfolio & Social Presence</label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <input
                    type="url"
                    placeholder="GitHub URL"
                    value={portfolioLinks.github || ''}
                    onChange={(e) => setPortfolioLinks({ ...portfolioLinks, github: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2 focus-ring"
                  />
                </div>

                <div>
                  <input
                    type="url"
                    placeholder="LinkedIn URL"
                    value={portfolioLinks.linkedin || ''}
                    onChange={(e) => setPortfolioLinks({ ...portfolioLinks, linkedin: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2 focus-ring"
                  />
                </div>

                <div>
                  <input
                    type="url"
                    placeholder="Personal Website"
                    value={portfolioLinks.portfolio || ''}
                    onChange={(e) => setPortfolioLinks({ ...portfolioLinks, portfolio: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2 focus-ring"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors"
              >
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
            <h2 className="text-sm font-semibold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <FileText className="h-4 w-4 text-brand-600" />
              Verified Resumes
            </h2>

            <div className="border-2 border-dashed border-slate-300 rounded-xl p-5 text-center hover:border-brand-500 transition-colors bg-slate-50">
              <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-800">Upload Updated Resume</p>

              <p className="text-[11px] text-slate-500 mt-0.5">PDF or DOCX format, up to 2MB</p>

              <label className="mt-3 inline-block cursor-pointer px-3.5 py-1.5 text-xs font-medium text-brand-600 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors">
                <span>{uploadingResume ? 'Uploading...' : 'Choose Document'}</span>

                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeFileUpload}
                  disabled={uploadingResume}
                  className="hidden"
                />
              </label>

              {uploadError && <p className="text-[11px] text-rose-600 mt-2">{uploadError}</p>}
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Stored Documents ({profile?.resumes?.length || 0})
              </p>

              {profile?.resumes && profile.resumes.length > 0 ? (
                <div className="space-y-2.5">
                  {profile.resumes.map((resItem, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs"
                    >
                      <div className="truncate pr-2">
                        <p className="font-medium text-slate-800 truncate">{resItem.originalName}</p>

                        <p className="text-[10px] text-slate-400">
                          {new Date(resItem.uploadedAt).toLocaleDateString()} &bull;{' '}
                          {Math.round((resItem.size || 0) / 1024)} KB
                        </p>
                      </div>

                      <a
                        href={resItem.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-white rounded border border-transparent hover:border-slate-200 transition-colors"
                        title="Stream signed document"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No resumes attached to this profile yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
