import React from 'react';

export const CandidexLogo = ({ size = 'md', showText = true, className = '' }) => {
  const iconSizes = {
    sm: 'h-7 w-7',
    md: 'h-9 w-9',
    lg: 'h-11 w-11',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className={`relative ${iconSizes[size]} shrink-0 rounded-xl bg-gradient-to-br from-brand-600 via-teal-700 to-slate-900 p-[1.5px] shadow-sm`}>
        <div className="h-full w-full rounded-[10px] bg-slate-950 flex items-center justify-center overflow-hidden">
          <svg
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-5/6 h-5/6"
          >

            <path
              d="M23 10C21.2 7.5 18.3 6 15 6C9.477 6 5 10.477 5 16C5 21.523 9.477 26 15 26C18.3 26 21.2 24.5 23 22"
              stroke="#2dd4bf"
              strokeWidth="2.8"
              strokeLinecap="round"
            />

            <path
              d="M13 16H25M25 16L19 11M25 16L19 21"
              stroke="#14b8a6"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <circle
              cx="13"
              cy="16"
              r="2"
              fill="#5eead4"
            />
          </svg>
        </div>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="text-base font-extrabold tracking-tight text-slate-900">
              Candidex
            </span>

            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase bg-brand-50 text-brand-700 border border-brand-200">
              ATS
            </span>
          </div>

          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mt-0.5">
            Candidate Experience & ATS
          </span>
        </div>
      )}
    </div>
  );
};

export default CandidexLogo;
