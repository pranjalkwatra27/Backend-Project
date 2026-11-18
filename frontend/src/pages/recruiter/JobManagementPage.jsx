import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, WorkModeBadge } from '../../components/common/Badge';
import { JobEditorModal } from './JobEditorModal';
import {
  Briefcase,
  Plus,
  Edit,
  Eye,
  CheckCircle,
  XCircle,
  Users,
  Search,
  Filter,
} from 'lucide-react';

export const JobManagementPage = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [editorModalOpen, setEditorModalOpen] = useState(false);
  const [jobToEdit, setJobToEdit] = useState(null);

  useEffect(() => {
    fetchRecruiterJobs();
  }, []);

  const fetchRecruiterJobs = async () => {
    setLoading(true);
    try {
      const data = await apiClient(`/jobs?recruiterId=${user.id || user._id}&status=all`);
      if (data.success) {
        setJobs(data.jobs || []);
      }
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleJobStatus = async (job) => {
    const nextStatus = job.status === 'active' ? 'closed' : 'active';
    try {
      const res = await apiClient(`/jobs/${job._id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.success) {
        setJobs((prev) =>
          prev.map((j) => (j._id === job._id ? { ...j, status: nextStatus } : j))
        );
      }
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  const handleJobSaved = (savedJob) => {
    setJobs((prev) => {
      const exists = prev.some((j) => j._id === savedJob._id);
      if (exists) {
        return prev.map((j) => (j._id === savedJob._id ? savedJob : j));
      }
      return [savedJob, ...prev];
    });
  };

  const filteredJobs = jobs.filter((j) => {
    const matchesSearch =
      j.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      j.location.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesStatus = statusFilter === 'all' || j.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Job Openings Management</h1>

          <p className="mt-1 text-xs sm:text-sm text-slate-600">
            Publish openings, calibrate salary parameters, and manage hiring pipeline statuses.
          </p>
        </div>

        <button
          onClick={() => {
            setJobToEdit(null);
            setEditorModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Create Job Opening
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="w-full sm:w-72 flex items-center px-3 gap-2 bg-slate-50 border border-slate-200 rounded-lg py-2">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by title or location..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full text-xs bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-slate-500 font-medium">Status:</span>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus-ring"
          >
            <option value="all">All Statuses ({jobs.length})</option>

            <option value="active">Active Only</option>

            <option value="closed">Closed Only</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading your job postings...</div>
        ) : filteredJobs.length === 0 ? (
          <div className="p-12 text-center">
            <Briefcase className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">No job openings match the criteria</p>

            <p className="text-[11px] text-slate-400 mt-0.5">Click "Create Job Opening" to post your first position.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="px-6 py-3.5">Position Title</th>

                  <th className="px-6 py-3.5">Department</th>

                  <th className="px-6 py-3.5">Work Mode & Location</th>

                  <th className="px-6 py-3.5">Salary Band</th>

                  <th className="px-6 py-3.5">Status</th>

                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredJobs.map((job) => (
                  <tr key={job._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {job.title}
                      <p className="text-[11px] text-slate-400 font-normal">
                        Created {new Date(job.createdAt).toLocaleDateString()}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-slate-600">{job.department || 'Engineering'}</td>

                    <td className="px-6 py-4 text-slate-600">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <WorkModeBadge mode={job.workMode} />
                        <span className="text-slate-500">{job.location}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-medium text-slate-800">
                      ₹{job.ctcRange?.min} - ₹{job.ctcRange?.max} LPA
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={job.status} />
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/recruiter/applicants?jobId=${job._id}`}
                          className="px-2.5 py-1 text-xs font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 rounded transition-colors inline-flex items-center gap-1"
                          title="View applicants pipeline"
                        >
                          <Users className="h-3.5 w-3.5" />
                          Pipeline
                        </Link>

                        <button
                          onClick={() => {
                            setJobToEdit(job);
                            setEditorModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                          title="Edit Job Details"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={() => handleToggleJobStatus(job)}
                          className={`p-1.5 rounded transition-colors ${
                            job.status === 'active'
                              ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                              : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={job.status === 'active' ? 'Close Opening' : 'Reopen Opening'}
                        >
                          {job.status === 'active' ? (
                            <XCircle className="h-3.5 w-3.5" />
                          ) : (
                            <CheckCircle className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <JobEditorModal
        isOpen={editorModalOpen}
        onClose={() => setEditorModalOpen(false)}
        jobToEdit={jobToEdit}
        onJobSaved={handleJobSaved}
      />
    </div>
  );
};
