import React from 'react';

export const DashboardSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="flex justify-between items-center">
      <div><div className="h-8 w-64 bg-slate-200 rounded-lg" /><div className="h-4 w-96 bg-slate-200 rounded mt-2" /></div>
      <div className="h-9 w-24 bg-slate-200 rounded-lg" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="card p-5 flex items-center space-x-4">
          <div className="h-12 w-12 rounded-xl bg-slate-200 flex-shrink-0" />
          <div className="flex-1 space-y-2"><div className="h-3 w-16 bg-slate-200 rounded" /><div className="h-6 w-12 bg-slate-200 rounded" /></div>
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="card lg:col-span-2 h-96 flex flex-col">
        <div className="border-b border-slate-100 pb-4 mb-4"><div className="h-5 w-48 bg-slate-200 rounded" /><div className="h-3 w-72 bg-slate-200 rounded mt-1.5" /></div>
        <div className="flex-1 flex items-center justify-center"><div className="h-48 w-48 rounded-full bg-slate-200" /></div>
      </div>
      <div className="space-y-6">
        <div className="card"><div className="h-5 w-32 bg-slate-200 rounded mb-4" /><div className="space-y-2"><div className="h-10 bg-slate-200 rounded-xl" /><div className="h-10 bg-slate-200 rounded-xl" /><div className="h-10 bg-slate-200 rounded-xl" /></div></div>
        <div className="card"><div className="h-5 w-36 bg-slate-200 rounded mb-4" /><div className="space-y-3"><div className="h-12 bg-slate-200 rounded-xl" /><div className="h-12 bg-slate-200 rounded-xl" /></div></div>
      </div>
    </div>
  </div>
);

export default DashboardSkeleton;
