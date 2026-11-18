import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { StageBadge, StatusBadge } from '../../components/common/Badge';
import {
  Briefcase,
  Users,
  UserCheck,
  Award,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
  ChevronRight,
} from 'lucide-react';

export const RecruiterDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const jobsRes = await apiClient(`/jobs?recruiterId=${user.id || user._id}&status=all`);
      const recruiterJobs = jobsRes.jobs || [];
      setJobs(recruiterJobs);

      let allApplicants = [];
      for (const job of recruiterJobs) {
        try {
          const appRes = await apiClient(`/jobs/${job._id}/applicants`);
          if (appRes.success && appRes.applicants) {
            allApplicants = [...allApplicants, ...appRes.applicants];
          }
        } catch (e) {
        }
      }
      setApplicants(allApplicants);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeJobsCount = jobs.filter((j) => j.status === 'active').length;
  const inInterviewCount = applicants.filter((a) => a.stage === 'interview').length;
  const offersCount = applicants.filter((a) => a.stage === 'offered').length;
  const totalApplicantsCount = applicants.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Hiring Workspace</h1>

          <p className="mt-1 text-xs sm:text-sm text-slate-600">
            Welcome back, <strong className="text-slate-800">{user?.name}</strong> &bull;{' '}

            {user?.company?.name || 'Recruitment Operations'}
          </p>
        </div>

        <Link
          to="/recruiter/jobs"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Create New Job Opening
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Active Openings</span>

            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Briefcase className="h-4 w-4" />
            </div>
          </div>

          <p className="text-2xl font-bold text-slate-900 mt-2">{activeJobsCount}</p>

          <p className="text-[11px] text-slate-500 mt-1">{jobs.length} total openings posted</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Applicants</span>

            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </div>

          <p className="text-2xl font-bold text-slate-900 mt-2">{totalApplicantsCount}</p>

          <p className="text-[11px] text-slate-500 mt-1">Across all posted positions</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">In Active Interviews</span>

            <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>

          <p className="text-2xl font-bold text-slate-900 mt-2">{inInterviewCount}</p>

          <p className="text-[11px] text-slate-500 mt-1">Technical & cultural rounds</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Offers Extended</span>

            <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Award className="h-4 w-4" />
            </div>
          </div>

          <p className="text-2xl font-bold text-slate-900 mt-2">{offersCount}</p>

          <p className="text-[11px] text-slate-500 mt-1">Ready for candidate acceptance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Users className="h-4 w-4 text-brand-600" />
              Recent Candidates in Pipeline
            </h2>

            <Link
              to="/recruiter/applicants"
              className="text-xs font-medium text-brand-600 hover:text-brand-800 flex items-center gap-1"
            >
              Full Pipeline
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading applicant pipeline...</div>
          ) : applicants.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No applications received yet. Share your job links to start receiving resumes.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-medium">
                    <th className="pb-3 font-semibold">Candidate</th>

                    <th className="pb-3 font-semibold">Applied Role</th>

                    <th className="pb-3 font-semibold">Stage</th>

                    <th className="pb-3 font-semibold">Date</th>

                    <th className="pb-3 text-right font-semibold">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {applicants.slice(0, 6).map((app) => (
                    <tr key={app._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 font-medium text-slate-800">
                        {app.candidateId?.name || 'Candidate'}
                        <p className="text-[11px] text-slate-400 font-normal">{app.candidateId?.email}</p>
                      </td>

                      <td className="py-3 text-slate-600">{app.job?.title || 'Open Position'}</td>

                      <td className="py-3">
                        <StageBadge stage={app.stage} />
                      </td>

                      <td className="py-3 text-slate-500">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-3 text-right">
                        <Link
                          to={`/recruiter/applicants?jobId=${app.jobId}`}
                          className="px-2.5 py-1 text-xs font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 rounded transition-colors"
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-brand-600" />
              Your Openings ({jobs.length})
            </h2>

            <Link
              to="/recruiter/jobs"
              className="text-xs font-medium text-brand-600 hover:text-brand-800"
            >
              Manage
            </Link>
          </div>

          <div className="space-y-3">
            {jobs.slice(0, 5).map((job) => (
              <div
                key={job._id}
                className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-semibold text-slate-900">{job.title}</p>

                  <p className="text-[11px] text-slate-500">
                    {job.location} &bull; ₹{job.ctcRange?.min}-₹{job.ctcRange?.max} LPA
                  </p>
                </div>

                <StatusBadge status={job.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
