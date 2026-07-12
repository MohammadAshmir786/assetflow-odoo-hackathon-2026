import React from 'react';

export const AssetTableSkeleton = ({ rows = 6 }) => (
  <div className="animate-pulse">
    {/* Desktop table */}
    <div className="hidden md:block card overflow-hidden p-0 border border-slate-200">
      <table className="data-table">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            {['Asset', 'Category', 'Tag', 'Status', 'Location', 'Holder', ''].map((h, i) => (
              <th key={i} className="px-5 py-3.5">
                <div className="h-3 w-16 bg-slate-200 rounded" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {[...Array(rows)].map((_, i) => (
            <tr key={i}>
              <td className="px-5 py-4"><div className="h-4 w-36 bg-slate-200 rounded" /></td>
              <td className="px-5 py-4"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
              <td className="px-5 py-4"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
              <td className="px-5 py-4"><div className="h-5 w-20 bg-slate-200 rounded-full" /></td>
              <td className="px-5 py-4"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
              <td className="px-5 py-4"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
              <td className="px-5 py-4"><div className="h-4 w-16 bg-slate-200 rounded" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Mobile cards */}
    <div className="md:hidden space-y-3">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="card p-4 space-y-3">
          <div className="flex justify-between">
            <div className="h-4 w-40 bg-slate-200 rounded" />
            <div className="h-5 w-20 bg-slate-200 rounded-full" />
          </div>
          <div className="h-3 w-28 bg-slate-200 rounded" />
          <div className="h-3 w-24 bg-slate-200 rounded" />
        </div>
      ))}
    </div>
  </div>
);

export default AssetTableSkeleton;
