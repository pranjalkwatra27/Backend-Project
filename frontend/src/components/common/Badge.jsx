import React from 'react';

export const StageBadge = ({ stage }) => {
  const styles = {
    applied: 'bg-slate-100 text-slate-700 border-slate-300',
    shortlisted: 'bg-amber-50 text-amber-700 border-amber-300',
    interview: 'bg-blue-50 text-blue-700 border-blue-300',
    offered: 'bg-emerald-50 text-emerald-700 border-emerald-300',
    rejected: 'bg-rose-50 text-rose-700 border-rose-300',
  };

  const labels = {
    applied: 'Applied',
    shortlisted: 'Shortlisted',
    interview: 'In Interview',
    offered: 'Offer Extended',
    rejected: 'Not Selected',
  };

  const currentStyle = styles[stage] || styles.applied;
  const currentLabel = labels[stage] || stage;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${currentStyle}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {currentLabel}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const styles = {
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    closed: 'bg-slate-100 text-slate-600 border-slate-200',
    draft: 'bg-amber-50 text-amber-700 border-amber-200',
    pending_approval: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  const labels = {
    active: 'Active Opening',
    closed: 'Closed',
    draft: 'Draft',
    pending_approval: 'Pending Approval',
  };

  const currentStyle = styles[status] || styles.active;
  const currentLabel = labels[status] || status;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${currentStyle}`}
    >
      {currentLabel}
    </span>
  );
};

export const WorkModeBadge = ({ mode }) => {
  const styles = {
    Remote: 'bg-violet-50 text-violet-700 border-violet-200',
    Hybrid: 'bg-sky-50 text-sky-700 border-sky-200',
    'On-site': 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
        styles[mode] || styles['On-site']
      }`}
    >
      {mode}
    </span>
  );
};
