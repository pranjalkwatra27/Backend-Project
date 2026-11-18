import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { StageBadge, WorkModeBadge } from '../../components/common/Badge';
import {
  FileText,
  Clock,
  Building,
  MapPin,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Download,
  ExternalLink,
} from 'lucide-react';

const PIPELINE_STAGES = ['applied', 'shortlisted', 'interview', 'offered'];

export const MyApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const data = await apiClient('/applications/me');
      if (data.success) {
        setApplications(data.applications || []);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStageIndex = (stage) => {
    if (stage === 'rejected') return -1;
    return PIPELINE_STAGES.indexOf(stage);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Application Pipeline Tracker
        </h1>

        <p className="mt-1.5 text-sm text-slate-600">
          Monitor your candidacies in real-time as hiring managers advance your status through recruitment stages.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm animate-pulse h-40"></div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm animate-pulse h-40"></div>
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No active applications yet</h3>

          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            You haven't submitted any job applications yet. Explore openings and apply with your verified resume.
          </p>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 text-xs font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors shadow-sm"
          >
            Browse Openings
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {applications.map((app) => {
            const job = app.jobId;
            const currentIndex = getStageIndex(app.stage);
            const isRejected = app.stage === 'rejected';

            return (
              <div
                key={app._id}
                className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:border-slate-300 transition-all space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-semibold text-slate-900">{job?.title || 'Position'}</h3>
                      <StageBadge stage={app.stage} />
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-2">
                      <Building className="h-3.5 w-3.5 text-slate-400" />
                      <span>{job?.company?.name || 'Company'}</span>
                      &bull;
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span>{job?.location}</span>
                    </p>
                  </div>

                  <div className="text-left sm:text-right text-xs text-slate-500">
                    <p className="flex items-center sm:justify-end gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      Applied: {new Date(app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="mt-0.5 text-slate-700 font-medium">
                      ₹{job?.ctcRange?.min} - ₹{job?.ctcRange?.max} LPA
                    </p>
                  </div>
                </div>

                <div className="py-2">
                  <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">
                    Hiring Stage Progress
                  </p>

                  {isRejected ? (
                    <div className="bg-rose-50 border border-rose-200 rounded-lg p-3.5 text-xs text-rose-800 flex items-center gap-2.5">
                      <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
                      <div>
                        <strong className="font-semibold">Application Closed:</strong> The recruitment team decided not to move forward with this position. Your profile remains active for future opportunities.
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="grid grid-cols-4 gap-2">
                        {PIPELINE_STAGES.map((stg, idx) => {
                          const isCompleted = currentIndex >= idx;
                          const isCurrent = currentIndex === idx;

                          return (
                            <div key={stg} className="flex flex-col items-center text-center">
                              <div
                                className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold mb-1.5 transition-colors ${
                                  isCurrent
                                    ? 'bg-brand-600 text-white ring-4 ring-brand-100 shadow-sm'
                                    : isCompleted
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                                }`}
                              >
                                {isCompleted && !isCurrent ? (
                                  <CheckCircle2 className="h-4 w-4" />
                                ) : (
                                  idx + 1
                                )}
                              </div>
                              <span
                                className={`text-[11px] font-medium capitalize ${
                                  isCurrent
                                    ? 'text-brand-700 font-semibold'
                                    : isCompleted
                                    ? 'text-slate-800'
                                    : 'text-slate-400'
                                }`}
                              >
                                {stg}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="absolute top-4 left-[12%] right-[12%] h-0.5 bg-slate-200 -z-0">
                        <div
                          className="h-full bg-emerald-500 transition-all duration-300"
                          style={{
                            width: `${(Math.max(0, currentIndex) / (PIPELINE_STAGES.length - 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-lg p-3.5 text-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-500">
                    <span>
                      Resume Attached:{' '}
                      <strong className="text-slate-700 font-medium">{app.resumeFilename || 'resume.pdf'}</strong>
                    </span>
                    {app.resumeUrl && (
                      <a
                        href={app.resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-600 hover:text-brand-800 font-medium inline-flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Preview Document
                      </a>
                    )}
                  </div>

                  {app.coverNote && (
                    <div className="text-slate-600 pt-1 border-t border-slate-200/60">
                      <span className="text-slate-400">Your note: </span>
                      <span className="italic">"{app.coverNote}"</span>
                    </div>
                  )}

                  {app.stageHistory && app.stageHistory.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/60">
                      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        Timeline Updates
                      </p>
                      <div className="space-y-1">
                        {app.stageHistory.map((hist, hIdx) => (
                          <div key={hIdx} className="flex items-center justify-between text-[11px] text-slate-500">
                            <span className="capitalize text-slate-700">
                              &bull; {hist.stage}: {hist.note || 'Status updated'}
                            </span>
                            <span>{new Date(hist.changedAt).toLocaleDateString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
