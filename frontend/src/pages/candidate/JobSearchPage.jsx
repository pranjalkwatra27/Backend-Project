import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { WorkModeBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { CardSkeleton } from '../../components/common/SkeletonLoader';
import {
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  Filter,
  X,
  Upload,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const COMMON_SKILLS = [
  'React',
  'Node.js',
  'TypeScript',
  'JavaScript',
  'Express',
  'MongoDB',
  'Python',
  'Tailwind CSS',
  'Docker',
  'AWS',
];

export const JobSearchPage = () => {
  const { user, isJobSaved, toggleSavedJob } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalJobs, setTotalJobs] = useState(0);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [workMode, setWorkMode] = useState('All');
  const [minExp, setMinExp] = useState('');
  const [ctcMin, setCtcMin] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [sortBy, setSortBy] = useState('newest');

  // Selected job for detail view & apply modal
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [coverNote, setCoverNote] = useState('');
  const [selectedResumeUrl, setSelectedResumeUrl] = useState('');
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applyStatus, setApplyStatus] = useState(null); // { type: 'success' | 'error', message: '' }

  // Fetch candidate profile for resumes if candidate
  useEffect(() => {
    if (user && user.role === 'candidate') {
      apiClient('/profile/me')
        .then((res) => {
          if (res.profile) {
            setCandidateProfile(res.profile);
            if (res.profile.resumes && res.profile.resumes.length > 0) {
              setSelectedResumeUrl(res.profile.resumes[0].url);
            }
          }
        })
        .catch(() => {});
    }
  }, [user]);

  // Load jobs with filters
  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('q', searchQuery.trim());
      if (locationFilter.trim()) params.append('location', locationFilter.trim());
      if (workMode !== 'All') params.append('workMode', workMode);
      if (minExp !== '') params.append('minExp', minExp);
      if (ctcMin !== '') params.append('ctcMin', ctcMin);
      if (selectedSkills.length > 0) params.append('skills', selectedSkills.join(','));
      params.append('sort', sortBy);
      params.append('status', 'active');

      const data = await apiClient(`/jobs?${params.toString()}`);
      if (data.success) {
        setJobs(data.jobs || []);
        setTotalJobs(data.total || 0);
      }
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [workMode, minExp, ctcMin, selectedSkills, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!selectedResumeUrl) {
      setApplyStatus({
        type: 'error',
        message: 'Please upload or select a resume before submitting your application.',
      });
      return;
    }

    setIsApplying(true);
    setApplyStatus(null);

    try {
      const res = await apiClient('/applications', {
        method: 'POST',
        body: JSON.stringify({
          jobId: selectedJob._id,
          resumeUrl: selectedResumeUrl,
          coverNote,
        }),
      });

      if (res.success) {
        setApplyStatus({
          type: 'success',
          message: 'Application submitted successfully! Track progress in "My Applications".',
        });
        setTimeout(() => {
          setApplyModalOpen(false);
          setApplyStatus(null);
          setCoverNote('');
        }, 2200);
      }
    } catch (err) {
      setApplyStatus({
        type: 'error',
        message: err.message || 'Failed to submit application. You may have already applied.',
      });
    } finally {
      setIsApplying(false);
    }
  };

  const handleBookmark = async (e, jobId) => {
    e.stopPropagation();
    if (!user) {
      alert('Please sign in to save job postings.');
      return;
    }
    try {
      await toggleSavedJob(jobId);
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header & Search Bar */}
      <div className="mb-8">
        <div className="max-w-3xl">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Explore Curated Job Openings
          </h1>
          <p className="mt-1.5 text-sm text-slate-600">
            Discover roles with transparent salaries, verified hiring managers, and direct pipeline tracking.
          </p>
        </div>

        {/* Search Bar Container */}
        <form
          onSubmit={handleSearchSubmit}
          className="mt-6 bg-white border border-slate-200 rounded-xl p-2 shadow-sm flex flex-col md:flex-row gap-2"
        >
          <div className="flex-1 flex items-center px-3 gap-2 border-b md:border-b-0 md:border-r border-slate-200 py-2">
            <Search className="h-5 w-5 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Job title, keywords, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
          </div>

          <div className="flex-1 flex items-center px-3 gap-2 py-2">
            <MapPin className="h-5 w-5 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="City, region, or 'Remote'..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors shrink-0 flex items-center justify-center gap-2"
          >
            <Search className="h-4 w-4" />
            Search
          </button>
        </form>
      </div>

      {/* Main Grid: Filters Sidebar + Job Listings */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Filter Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Filter className="h-4 w-4 text-brand-600" />
                Refine Filters
              </h2>
              {(workMode !== 'All' || minExp !== '' || ctcMin !== '' || selectedSkills.length > 0) && (
                <button
                  onClick={() => {
                    setWorkMode('All');
                    setMinExp('');
                    setCtcMin('');
                    setSelectedSkills([]);
                  }}
                  className="text-xs text-brand-600 hover:text-brand-800 font-medium"
                >
                  Reset all
                </button>
              )}
            </div>

            {/* Work Mode */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Work Mode
              </label>
              <div className="space-y-1.5">
                {['All', 'Remote', 'Hybrid', 'On-site'].map((mode) => (
                  <label
                    key={mode}
                    className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer hover:text-slate-900"
                  >
                    <input
                      type="radio"
                      name="workMode"
                      checked={workMode === mode}
                      onChange={() => setWorkMode(mode)}
                      className="text-brand-600 focus:ring-brand-500 rounded border-slate-300"
                    />
                    <span>{mode}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Minimum Experience */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Max Min Experience (Years)
              </label>
              <select
                value={minExp}
                onChange={(e) => setMinExp(e.target.value)}
                className="w-full text-xs text-slate-700 border border-slate-200 rounded-lg p-2 focus-ring bg-slate-50"
              >
                <option value="">Any Experience</option>
                <option value="0">Freshers / Entry Level (0 yrs)</option>
                <option value="2">Up to 2 Years</option>
                <option value="4">Up to 4 Years</option>
                <option value="6">Up to 6 Years</option>
              </select>
            </div>

            {/* Minimum CTC Band */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Minimum CTC (LPA)
              </label>
              <select
                value={ctcMin}
                onChange={(e) => setCtcMin(e.target.value)}
                className="w-full text-xs text-slate-700 border border-slate-200 rounded-lg p-2 focus-ring bg-slate-50"
              >
                <option value="">Any Salary Band</option>
                <option value="10">₹10 LPA+</option>
                <option value="15">₹15 LPA+</option>
                <option value="20">₹20 LPA+</option>
                <option value="30">₹30 LPA+</option>
              </select>
            </div>

            {/* Required Skills Chips */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Filter by Skills
              </label>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_SKILLS.map((skill) => {
                  const isSelected = selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                        isSelected
                          ? 'bg-brand-600 text-white border-brand-600'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        {/* Right Job Listings */}
        <main className="lg:col-span-3 space-y-4">
          {/* Controls Bar */}
          <div className="flex items-center justify-between pb-2 text-xs text-slate-500">
            <span>
              Showing <strong className="text-slate-900 font-semibold">{jobs.length}</strong> of{' '}
              <strong className="text-slate-900 font-semibold">{totalJobs}</strong> available roles
            </span>

            <div className="flex items-center gap-2">
              <span>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs text-slate-700 bg-white border border-slate-200 rounded-md px-2 py-1 focus-ring"
              >
                <option value="newest">Most Recent</option>
                <option value="salary_high">Highest Salary</option>
                <option value="experience_low">Entry / Least Exp</option>
              </select>
            </div>
          </div>

          {/* Job Cards */}
          {loading ? (
            <div className="space-y-4">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
              <Briefcase className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-800">No matching jobs found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Try widening your search terms, clearing specific skill filters, or adjusting the work mode criteria.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setLocationFilter('');
                  setWorkMode('All');
                  setMinExp('');
                  setCtcMin('');
                  setSelectedSkills([]);
                }}
                className="mt-4 px-4 py-2 text-xs font-medium text-brand-600 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            jobs.map((job) => {
              const saved = isJobSaved(job._id);
              return (
                <div
                  key={job._id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between gap-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      {/* Company Logo or Initial */}
                      <div className="h-11 w-11 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-bold flex items-center justify-center text-sm shrink-0">
                        {job.company.name.charAt(0)}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3
                            onClick={() => setSelectedJob(job)}
                            className="text-base font-semibold text-slate-900 hover:text-brand-600 cursor-pointer transition-colors"
                          >
                            {job.title}
                          </h3>
                          <WorkModeBadge mode={job.workMode} />
                        </div>
                        <p className="text-xs font-medium text-slate-600 mt-0.5">
                          {job.company.name} &bull; <span className="text-slate-500">{job.location}</span>
                        </p>
                      </div>
                    </div>

                    {/* Bookmark Button */}
                    <button
                      onClick={(e) => handleBookmark(e, job._id)}
                      className={`p-2 rounded-lg border transition-colors ${
                        saved
                          ? 'border-brand-200 bg-brand-50 text-brand-600'
                          : 'border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                      }`}
                      title={saved ? 'Remove bookmark' : 'Save job'}
                      aria-label="Bookmark job"
                    >
                      <Bookmark className={`h-4 w-4 ${saved ? 'fill-brand-600' : ''}`} />
                    </button>
                  </div>

                  {/* Highlights (Salary, Experience, Department) */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 border-y border-slate-100 py-2.5">
                    <span className="flex items-center gap-1 font-medium text-slate-800">
                      <DollarSign className="h-3.5 w-3.5 text-slate-400" />₹{job.ctcRange.min} - ₹
                      {job.ctcRange.max} LPA
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                      {job.minExp === 0 ? 'Fresher friendly' : `${job.minExp}+ yrs exp`}
                    </span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      Posted {new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  {/* Skills & Action Buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-1.5">
                      {job.skills.slice(0, 5).map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 bg-slate-50 text-slate-600 rounded text-[11px] font-medium border border-slate-200"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.skills.length > 5 && (
                        <span className="px-1.5 py-0.5 text-slate-400 text-[11px]">
                          +{job.skills.length - 5} more
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedJob(job)}
                        className="px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => {
                          setSelectedJob(job);
                          setApplyModalOpen(true);
                        }}
                        className="px-4 py-1.5 text-xs font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                      >
                        Apply Now
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </main>
      </div>

      {/* Job Details Modal */}
      <Modal
        isOpen={!!selectedJob && !applyModalOpen}
        onClose={() => setSelectedJob(null)}
        title={selectedJob?.title || 'Job Overview'}
        maxWidth="max-w-3xl"
      >
        {selectedJob && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <p className="text-sm font-semibold text-slate-800">{selectedJob.company.name}</p>
                <p className="text-xs text-slate-500">{selectedJob.location} &bull; {selectedJob.workMode}</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-sm font-bold text-slate-900">
                  ₹{selectedJob.ctcRange.min} - ₹{selectedJob.ctcRange.max} LPA
                </p>
                <p className="text-xs text-slate-500">Experience: {selectedJob.minExp}+ Years</p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">
                About the Role
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {selectedJob.description}
              </p>
            </div>

            {/* Requirements */}
            {selectedJob.requirements && selectedJob.requirements.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">
                  Key Requirements
                </h4>
                <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600">
                  {selectedJob.requirements.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Skills */}
            <div>
              <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">
                Target Technologies
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedJob.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium border border-slate-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Modal Bottom CTA */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedJob(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
              >
                Close
              </button>
              <button
                onClick={() => setApplyModalOpen(true)}
                className="px-5 py-2 text-xs font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition-colors"
              >
                Proceed to Apply
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Quick Apply Modal */}
      <Modal
        isOpen={applyModalOpen}
        onClose={() => {
          setApplyModalOpen(false);
          setApplyStatus(null);
        }}
        title={`Apply for ${selectedJob?.title}`}
        maxWidth="max-w-xl"
      >
        {selectedJob && (
          <form onSubmit={handleApplySubmit} className="space-y-5">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs text-slate-600">
              Applying to <strong className="text-slate-900 font-semibold">{selectedJob.company.name}</strong> as{' '}
              <strong className="text-slate-900 font-semibold">{user?.name || 'Candidate'}</strong> (
              {user?.email || 'Sign in required'}).
            </div>

            {/* Resume Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-2">
                Select Resume for Submission *
              </label>
              {candidateProfile?.resumes && candidateProfile.resumes.length > 0 ? (
                <div className="space-y-2">
                  {candidateProfile.resumes.map((resItem) => (
                    <label
                      key={resItem.filename}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedResumeUrl === resItem.url
                          ? 'border-brand-500 bg-brand-50/40 text-brand-900'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="resumeOption"
                          value={resItem.url}
                          checked={selectedResumeUrl === resItem.url}
                          onChange={() => setSelectedResumeUrl(resItem.url)}
                          className="text-brand-600 focus:ring-brand-500"
                        />
                        <span className="text-xs font-medium">{resItem.originalName}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {new Date(resItem.uploadedAt).toLocaleDateString()}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="border border-dashed border-slate-300 rounded-lg p-4 text-center">
                  <Upload className="h-6 w-6 text-slate-400 mx-auto mb-1.5" />
                  <p className="text-xs text-slate-600">No resumes found on your profile.</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Please visit the <a href="/profile" className="text-brand-600 underline">Profile Builder</a> to upload a verified PDF/DOCX resume first.
                  </p>
                </div>
              )}
            </div>

            {/* Cover Note */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Note to Hiring Team (Optional)
              </label>
              <textarea
                rows={4}
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
                placeholder="Briefly highlight why your experience is a great fit for this specific position..."
                className="w-full text-xs text-slate-900 border border-slate-200 rounded-lg p-3 focus-ring placeholder:text-slate-400"
              />
            </div>

            {/* Status alerts */}
            {applyStatus && (
              <div
                className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                  applyStatus.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {applyStatus.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0" />
                )}
                <span>{applyStatus.message}</span>
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setApplyModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isApplying || !selectedResumeUrl}
                className="px-5 py-2 text-xs font-medium text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors flex items-center gap-2"
              >
                {isApplying ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
