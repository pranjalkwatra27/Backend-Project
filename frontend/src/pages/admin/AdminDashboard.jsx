import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';
import { StatusBadge } from '../../components/common/Badge';
import {
  Shield,
  BarChart3,
  Briefcase,
  Users,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  TrendingUp,
  Award,
} from 'lucide-react';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics');

  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  const [adminJobs, setAdminJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [jobStatusFilter, setJobStatusFilter] = useState('all');

  const [adminUsers, setAdminUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userRoleFilter, setUserRoleFilter] = useState('all');

  useEffect(() => {
    if (activeTab === 'analytics') fetchAnalytics();
    else if (activeTab === 'jobs') fetchAdminJobs();
    else if (activeTab === 'users') fetchAdminUsers();
  }, [activeTab]);

  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const data = await apiClient('/admin/analytics');
      if (data.success) {
        setAnalytics(data.analytics);
      }
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const fetchAdminJobs = async (status = jobStatusFilter) => {
    setLoadingJobs(true);
    try {
      const data = await apiClient(`/admin/jobs?status=${status}`);
      if (data.success) {
        setAdminJobs(data.jobs || []);
      }
    } catch (err) {
      console.error('Failed to load admin jobs:', err);
    } finally {
      setLoadingJobs(false);
    }
  };

  const fetchAdminUsers = async (role = userRoleFilter) => {
    setLoadingUsers(true);
    try {
      const data = await apiClient(`/admin/users?role=${role}`);
      if (data.success) {
        setAdminUsers(data.users || []);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleUpdateJobStatus = async (jobId, newStatus) => {
    try {
      const res = await apiClient(`/admin/jobs/${jobId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.success) {
        setAdminJobs((prev) =>
          prev.map((j) => (j._id === jobId ? { ...j, status: newStatus } : j))
        );
      }
    } catch (err) {
      alert(`Moderation action failed: ${err.message}`);
    }
  };

  const handleToggleUserStatus = async (userId, currentActive) => {
    try {
      const res = await apiClient(`/admin/users/${userId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !currentActive }),
      });
      if (res.success) {
        setAdminUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, isActive: !currentActive } : u))
        );
      }
    } catch (err) {
      alert(`User status change failed: ${err.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Shield className="h-6 w-6 text-brand-600" />
            Platform Administration
          </h1>

          <p className="mt-1 text-xs sm:text-sm text-slate-600">
            System governance, multi-tenant moderation, and aggregation metrics derived from MongoDB Atlas.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto border border-slate-200">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'analytics'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Analytics
          </button>

          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'jobs'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Briefcase className="h-3.5 w-3.5" />
            Job Moderation
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'users'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            User Directory
          </button>
        </div>
      </div>

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {loadingAnalytics ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading platform metrics...</div>
          ) : analytics ? (
            <>

              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                  <span className="text-[11px] font-medium text-slate-500">Registered Users</span>

                  <p className="text-xl font-bold text-slate-900 mt-1">{analytics.summary.totalUsers}</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                  <span className="text-[11px] font-medium text-slate-500">Total Jobs</span>

                  <p className="text-xl font-bold text-slate-900 mt-1">{analytics.summary.totalJobs}</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                  <span className="text-[11px] font-medium text-slate-500">Active Postings</span>

                  <p className="text-xl font-bold text-emerald-600 mt-1">{analytics.summary.activeJobs}</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                  <span className="text-[11px] font-medium text-slate-500">Applications Handled</span>

                  <p className="text-xl font-bold text-slate-900 mt-1">{analytics.summary.totalApplications}</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm col-span-2 lg:col-span-1">
                  <span className="text-[11px] font-medium text-slate-500">Placement Offer Rate</span>

                  <p className="text-xl font-bold text-brand-600 mt-1">{analytics.summary.placementRate}</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center justify-between">
                  <span>Recruitment Funnel Pipeline (MongoDB Aggregation)</span>

                  <span className="text-[11px] font-normal text-slate-400">Total: {analytics.summary.totalApplications} candidacies</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { key: 'applied', label: '1. Applied', color: 'bg-slate-100 text-slate-800' },
                    { key: 'shortlisted', label: '2. Shortlisted', color: 'bg-amber-50 text-amber-800' },
                    { key: 'interview', label: '3. Interviewing', color: 'bg-blue-50 text-blue-800' },
                    { key: 'offered', label: '4. Offer Given', color: 'bg-emerald-50 text-emerald-800' },
                    { key: 'rejected', label: 'Archived/Rejected', color: 'bg-rose-50 text-rose-800' },
                  ].map((stg) => {
                    const count = analytics.funnel[stg.key] || 0;
                    return (
                      <div key={stg.key} className={`p-4 rounded-xl border border-slate-200/80 ${stg.color}`}>
                        <span className="text-[11px] font-medium block">{stg.label}</span>

                        <p className="text-2xl font-bold mt-1">{count}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3">
                  <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                    Work Mode Distribution
                  </h4>

                  <div className="space-y-2">
                    {analytics.workModes.map((wm) => (
                      <div key={wm.name} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
                        <span className="text-slate-700 font-medium">{wm.name} Openings</span>

                        <span className="font-semibold text-slate-900">{wm.value} jobs</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3">
                  <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                    User Accounts by Role
                  </h4>

                  <div className="space-y-2">
                    {analytics.userRoles.map((ur) => (
                      <div key={ur.role} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
                        <span className="capitalize text-slate-700 font-medium">{ur.role}s</span>

                        <span className="font-semibold text-slate-900">{ur.count} accounts</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}

      {activeTab === 'jobs' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Filter by Status:</span>

            <select
              value={jobStatusFilter}
              onChange={(e) => {
                const newStatus = e.target.value;
                setJobStatusFilter(newStatus);
                fetchAdminJobs(newStatus);
              }}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus-ring"
            >
              <option value="all">All Jobs ({adminJobs.length})</option>

              <option value="active">Active</option>

              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="px-6 py-3.5">Job Title</th>

                    <th className="px-6 py-3.5">Company / Recruiter</th>

                    <th className="px-6 py-3.5">Location</th>

                    <th className="px-6 py-3.5">Status</th>

                    <th className="px-6 py-3.5 text-right">Moderation Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {adminJobs.map((j) => (
                    <tr key={j._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-900">{j.title}</td>

                      <td className="px-6 py-4 text-slate-600">
                        {j.company?.name}
                        <p className="text-[11px] text-slate-400 font-normal">{j.recruiterId?.email}</p>
                      </td>

                      <td className="px-6 py-4 text-slate-600">{j.location}</td>

                      <td className="px-6 py-4">
                        <StatusBadge status={j.status} />
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {j.status !== 'active' ? (
                            <button
                              onClick={() => handleUpdateJobStatus(j._id, 'active')}
                              className="px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded transition-colors"
                            >
                              Approve / Publish
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateJobStatus(j._id, 'closed')}
                              className="px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded transition-colors"
                            >
                              Close / Revoke
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Filter by Role:</span>

            <select
              value={userRoleFilter}
              onChange={(e) => {
                const newRole = e.target.value;
                setUserRoleFilter(newRole);
                fetchAdminUsers(newRole);
              }}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus-ring capitalize"
            >
              <option value="all">All Roles ({adminUsers.length})</option>

              <option value="candidate">Candidate</option>

              <option value="recruiter">Recruiter</option>

              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="px-6 py-3.5">User</th>

                    <th className="px-6 py-3.5">Email</th>

                    <th className="px-6 py-3.5">Assigned Role</th>

                    <th className="px-6 py-3.5">Account Status</th>

                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {adminUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-900">{u.name}</td>

                      <td className="px-6 py-4 text-slate-600">{u.email}</td>

                      <td className="px-6 py-4 capitalize font-medium text-slate-700">{u.role}</td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                            u.isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {u.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleToggleUserStatus(u._id, u.isActive)}
                          className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                            u.isActive
                              ? 'text-rose-600 hover:bg-rose-50 border border-slate-200'
                              : 'text-emerald-600 hover:bg-emerald-50 border border-slate-200'
                          }`}
                        >
                          {u.isActive ? 'Deactivate' : 'Reactivate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
