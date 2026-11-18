import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { StageBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  Users,
  Search,
  Filter,
  FileText,
  ExternalLink,
  MessageSquare,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

const STAGES = ['applied', 'shortlisted', 'interview', 'offered', 'rejected'];

export const ApplicantPipelinePage = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialJobId = searchParams.get('jobId') || 'all';

  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedJobId, setSelectedJobId] = useState(initialJobId);
  const [selectedStage, setSelectedStage] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [reviewApplicant, setReviewApplicant] = useState(null);
  const [nextStage, setNextStage] = useState('');
  const [stageNote, setStageNote] = useState('');
  const [isUpdatingStage, setIsUpdatingStage] = useState(false);
  const [stageError, setStageError] = useState(null);

  const [internalNote, setInternalNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  useEffect(() => {
    fetchJobsAndApplicants();
  }, []);

  const fetchJobsAndApplicants = async () => {
    setLoading(true);
    try {
      const jobsRes = await apiClient(`/jobs?recruiterId=${user.id || user._id}&status=all`);
      const recruiterJobs = jobsRes.jobs || [];
      setJobs(recruiterJobs);

      let allApplicants = [];
      for (const j of recruiterJobs) {
        try {
          const appRes = await apiClient(`/jobs/${j._id}/applicants`);
          if (appRes.success && appRes.applicants) {
            allApplicants = [...allApplicants, ...appRes.applicants];
          }
        } catch (e) {
        }
      }
      setApplicants(allApplicants);
    } catch (err) {
      console.error('Failed to load applicant pipeline:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReview = (applicant) => {
    setReviewApplicant(applicant);
    setNextStage(applicant.stage);
    setStageNote('');
    setStageError(null);
    setInternalNote('');
  };

  const handleUpdateStage = async (e) => {
    e.preventDefault();
    if (!reviewApplicant) return;

    setIsUpdatingStage(true);
    setStageError(null);

    try {
      const res = await apiClient(`/applications/${reviewApplicant._id}/stage`, {
        method: 'PATCH',
        body: JSON.stringify({
          stage: nextStage,
          note: stageNote || `Stage transitioned to ${nextStage}`,
        }),
      });

      if (res.success) {
        const updatedApp = res.application;

        setApplicants((prev) =>
          prev.map((a) => (a._id === updatedApp._id ? { ...a, stage: updatedApp.stage, stageHistory: updatedApp.stageHistory } : a))
        );
        setReviewApplicant((prev) => ({
          ...prev,
          stage: updatedApp.stage,
          stageHistory: updatedApp.stageHistory,
        }));
      }
    } catch (err) {
      setStageError(err.message || 'Stage transition failed.');
    } finally {
      setIsUpdatingStage(false);
    }
  };

  const handleAddInternalNote = async (e) => {
    e.preventDefault();
    if (!internalNote.trim() || !reviewApplicant) return;

    setIsAddingNote(true);
    try {
      const res = await apiClient(`/applications/${reviewApplicant._id}/notes`, {
        method: 'POST',
        body: JSON.stringify({ note: internalNote.trim() }),
      });

      if (res.success) {
        setReviewApplicant((prev) => ({
          ...prev,
          recruiterNotes: res.notes,
        }));
        setApplicants((prev) =>
          prev.map((a) => (a._id === reviewApplicant._id ? { ...a, recruiterNotes: res.notes } : a))
        );
        setInternalNote('');
      }
    } catch (err) {
      alert(`Failed to add note: ${err.message}`);
    } finally {
      setIsAddingNote(false);
    }
  };

  const filteredApplicants = applicants.filter((app) => {
    const matchesJob = selectedJobId === 'all' || app.jobId === selectedJobId || app.jobId?._id === selectedJobId;
    const matchesStage = selectedStage === 'all' || app.stage === selectedStage;
    const candidateName = app.candidateId?.name?.toLowerCase() || '';
    const candidateEmail = app.candidateId?.email?.toLowerCase() || '';
    const skills = app.candidateProfile?.skills?.map((s) => s.toLowerCase()) || [];
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q || candidateName.includes(q) || candidateEmail.includes(q) || skills.some((s) => s.includes(q));

    return matchesJob && matchesStage && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Applicant Pipeline</h1>

        <p className="mt-1 text-xs sm:text-sm text-slate-600">
          Review candidate resumes, evaluate competency matches, and advance applications across hiring stages.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="w-full md:w-72 flex items-center px-3 gap-2 bg-slate-50 border border-slate-200 rounded-lg py-2">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search candidate name, email, or skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span>Job:</span>

            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus-ring"
            >
              <option value="all">All Postings ({jobs.length})</option>

              {jobs.map((j) => (
                <option key={j._id} value={j._id}>
                  {j.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span>Stage:</span>

            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus-ring capitalize"
            >
              <option value="all">All Stages</option>

              {STAGES.map((s) => (
                <option key={s} value={s} className="capitalize">
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading candidates in pipeline...</div>
        ) : filteredApplicants.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">No applicants match this criteria</p>

            <p className="text-[11px] text-slate-400 mt-0.5">Try resetting the stage filter or job selector.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="px-6 py-3.5">Candidate Name</th>

                  <th className="px-6 py-3.5">Applied Position</th>

                  <th className="px-6 py-3.5">Key Skills & Experience</th>

                  <th className="px-6 py-3.5">Pipeline Stage</th>

                  <th className="px-6 py-3.5">Applied On</th>

                  <th className="px-6 py-3.5 text-right">Review</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredApplicants.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {app.candidateId?.name || 'Candidate'}
                      <p className="text-[11px] text-slate-400 font-normal">{app.candidateId?.email}</p>
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {app.job?.title || 'Applied Role'}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {app.candidateProfile?.skills?.slice(0, 3).map((sk) => (
                          <span
                            key={sk}
                            className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium"
                          >
                            {sk}
                          </span>
                        ))}
                        <span className="text-[10px] text-slate-400 self-center">
                          {app.candidateProfile?.experienceYears || 0} yrs exp
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <StageBadge stage={app.stage} />
                    </td>

                    <td className="px-6 py-4 text-slate-500">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenReview(app)}
                        className="px-3 py-1.5 text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        Review
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={!!reviewApplicant}
        onClose={() => setReviewApplicant(null)}
        title={`Candidate Dossier: ${reviewApplicant?.candidateId?.name || 'Applicant'}`}
        maxWidth="max-w-3xl"
      >
        {reviewApplicant && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <p className="text-sm font-semibold text-slate-900">{reviewApplicant.candidateId?.name}</p>

                <p className="text-xs text-slate-500">
                  {reviewApplicant.candidateId?.email} &bull; {reviewApplicant.candidateProfile?.phone || 'No phone provided'}
                </p>

                <p className="text-xs text-slate-600 mt-1 italic">
                  "{reviewApplicant.candidateProfile?.headline || 'Candidate'}"
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                {reviewApplicant.resumeUrl && (
                  <a
                    href={reviewApplicant.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Open Resume Document
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Experience</span>

                <strong className="text-slate-800">{reviewApplicant.candidateProfile?.experienceYears || 0} Years</strong>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Expected CTC</span>

                <strong className="text-slate-800">₹{reviewApplicant.candidateProfile?.expectedCtc || 'Not specified'} LPA</strong>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Notice Period</span>

                <strong className="text-slate-800">{reviewApplicant.candidateProfile?.noticePeriod || '30 Days'}</strong>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Current Stage</span>

                <div className="mt-0.5"><StageBadge stage={reviewApplicant.stage} /></div>
              </div>
            </div>

            {reviewApplicant.coverNote && (
              <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-4 text-xs text-amber-900">
                <span className="font-semibold block mb-1">Candidate Cover Note:</span>

                <p className="italic leading-relaxed">"{reviewApplicant.coverNote}"</p>
              </div>
            )}

            {reviewApplicant.candidateProfile?.skills && (
              <div>
                <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2">
                  Skills & Technical Keywords
                </h4>

                <div className="flex flex-wrap gap-1.5">
                  {reviewApplicant.candidateProfile.skills.map((sk) => (
                    <span
                      key={sk}
                      className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium border border-slate-200"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleUpdateStage} className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center justify-between">
                <span>Update Application Stage</span>

                <span className="text-[11px] text-slate-400 font-normal">State machine enforced server-side</span>
              </h4>

              {stageError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{stageError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">New Stage</label>

                  <select
                    value={nextStage}
                    onChange={(e) => setNextStage(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2 focus-ring bg-slate-50 capitalize"
                  >
                    {STAGES.map((s) => (
                      <option key={s} value={s} className="capitalize">
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Transition Note</label>

                  <input
                    type="text"
                    value={stageNote}
                    onChange={(e) => setStageNote(e.target.value)}
                    placeholder="e.g. Cleared coding challenge with 100% score"
                    className="w-full text-xs border border-slate-200 rounded-lg p-2 focus-ring"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={isUpdatingStage || nextStage === reviewApplicant.stage}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors"
                >
                  {isUpdatingStage ? 'Saving...' : 'Confirm Stage Change'}
                </button>
              </div>
            </form>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="h-3.5 w-3.5 text-brand-600" />
                Internal Evaluation Notes ({reviewApplicant.recruiterNotes?.length || 0})
              </h4>

              {reviewApplicant.recruiterNotes && reviewApplicant.recruiterNotes.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {reviewApplicant.recruiterNotes.map((noteItem, nIdx) => (
                    <div
                      key={nIdx}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-slate-400 text-[10px]">
                        <strong className="text-slate-700">{noteItem.authorName}</strong>

                        <span>{new Date(noteItem.createdAt).toLocaleString()}</span>
                      </div>

                      <p className="text-slate-800">{noteItem.note}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No internal feedback added yet.</p>
              )}

              <form onSubmit={handleAddInternalNote} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add internal feedback note (e.g. strong system design, recommended for L5)..."
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  className="flex-1 text-xs border border-slate-200 rounded-lg p-2 focus-ring"
                />
                <button
                  type="submit"
                  disabled={isAddingNote || !internalNote.trim()}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-lg transition-colors"
                >
                  {isAddingNote ? 'Saving...' : 'Add Note'}
                </button>
              </form>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
