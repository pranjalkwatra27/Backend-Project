import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { WorkModeBadge } from '../../components/common/Badge';
import { Bookmark, Briefcase, MapPin, DollarSign, Trash2, ArrowRight } from 'lucide-react';

export const SavedJobsPage = () => {
  const { toggleSavedJob } = useAuth();
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    setLoading(true);
    try {
      const data = await apiClient('/profile/saved-jobs');
      if (data.success) {
        setSavedJobs(data.savedJobs || []);
      }
    } catch (err) {
      console.error('Failed to load saved jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (jobId) => {
    try {
      await toggleSavedJob(jobId);
      setSavedJobs((prev) => prev.filter((j) => j._id !== jobId));
    } catch (err) {
      console.error('Failed to remove bookmark:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Saved Job Openings</h1>
        <p className="mt-1.5 text-sm text-slate-600">
          Bookmarked opportunities you want to research or prepare application notes for.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 h-32 animate-pulse"></div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 h-32 animate-pulse"></div>
        </div>
      ) : savedJobs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <Bookmark className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No bookmarked jobs</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Click the bookmark icon on any job card in the job search page to save it for later.
          </p>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 text-xs font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors shadow-sm"
          >
            Explore Jobs
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {savedJobs.map((job) => (
            <div
              key={job._id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-semibold text-slate-900">{job.title}</h3>
                  <WorkModeBadge mode={job.workMode} />
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  {job.company?.name} &bull; <span className="text-slate-500">{job.location}</span>
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-600 mt-2">
                  <span className="font-medium text-slate-800">
                    ₹{job.ctcRange?.min} - ₹{job.ctcRange?.max} LPA
                  </span>
                  <span>{job.minExp}+ yrs exp</span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => handleRemove(job._id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-slate-200"
                  title="Remove bookmark"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <Link
                  to="/jobs"
                  className="px-4 py-2 text-xs font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                >
                  View in Search
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
