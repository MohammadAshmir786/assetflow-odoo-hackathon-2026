import React from 'react';
import { FiInbox } from 'react-icons/fi';

export const EmptyState = ({
  title = 'No records found',
  description = 'There are no active records in this view right now.',
  actionLabel,
  onAction,
  icon: Icon = FiInbox,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-10 border border-dashed border-slate-200 rounded-2xl bg-white shadow-sm ${className}`}>
      <div className="flex items-center justify-center h-14 w-14 rounded-full bg-slate-50 text-slate-400 mb-4 border border-slate-100">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-800 tracking-tight">{title}</h3>
      <p className="mt-2 text-sm text-slate-500 max-w-sm leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-6 px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-200 shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-95"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
