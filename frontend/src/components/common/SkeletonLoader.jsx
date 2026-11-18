import React from 'react';

export const CardSkeleton = () => (
  <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm animate-pulse space-y-4">
    <div className="flex justify-between items-start">
      <div className="space-y-2 w-3/4">
        <div className="h-5 bg-slate-200 rounded w-2/3"></div>

        <div className="h-4 bg-slate-100 rounded w-1/3"></div>
      </div>

      <div className="h-6 w-16 bg-slate-100 rounded-full"></div>
    </div>

    <div className="flex gap-2">
      <div className="h-5 w-20 bg-slate-100 rounded"></div>

      <div className="h-5 w-24 bg-slate-100 rounded"></div>

      <div className="h-5 w-28 bg-slate-100 rounded"></div>
    </div>

    <div className="h-4 bg-slate-100 rounded w-full"></div>

    <div className="h-4 bg-slate-100 rounded w-4/5"></div>
  </div>
);

export const TableRowSkeleton = () => (
  <tr className="animate-pulse border-b border-slate-100">
    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
    <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-24"></div></td>
    <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-20"></div></td>
    <td className="px-6 py-4"><div className="h-6 bg-slate-200 rounded-full w-24"></div></td>
    <td className="px-6 py-4 text-right"><div className="h-8 bg-slate-100 rounded w-16 ml-auto"></div></td>
  </tr>
);
