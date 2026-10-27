import React from 'react';

export const KuvoraLogo = ({ size = 'md', showText = true, className = '' }) => {
  const iconSizes = {
    sm: 'h-7 w-7',
    md: 'h-9 w-9',
    lg: 'h-11 w-11',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Bespoke Geometric Emblem */}
      <div className={`relative ${iconSizes[size]} shrink-0 rounded-xl bg-gradient-to-br from-brand-600 via-teal-700 to-slate-900 p-[1.5px] shadow-sm`}>
        <div className="h-full w-full rounded-[10px] bg-slate-950 flex items-center justify-center overflow-hidden">
          <svg
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-5/6 h-5/6"
          >
            {/* Geometric K/Nexus mark */}
            <path
              d="M7 6V26"
              stroke="#2dd4bf"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            <path
              d="M24 7L13 16L24 25"
              stroke="#14b8a6"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx="13"
              cy="16"
              r="2.5"
              fill="#5eead4"
              className="animate-pulse"
            />
            <path
              d="M17 12.5L25 6"
              stroke="#99f6e4"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="2 2"
              opacity="0.6"
            />
          </svg>
        </div>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="text-base font-extrabold tracking-tight text-slate-900">
              Kuvora
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase bg-brand-50 text-brand-700 border border-brand-200">
              ATS
            </span>
          </div>
          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mt-0.5">
            Talent Cloud & ATS
          </span>
        </div>
      )}
    </div>
  );
};

export default KuvoraLogo;
