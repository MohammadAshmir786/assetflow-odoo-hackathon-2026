import React from 'react';
import { FiRefreshCw } from 'react-icons/fi';

export const RefreshButton = ({ onClick, refreshing, lastUpdated }) => {
  const fmt = (iso) => {
    if (!iso) return 'Never';
    try { return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }); }
    catch { return 'Never'; }
  };
  return (
    <div className="flex items-center space-x-2.5">
      {lastUpdated && <span className="text-[10px] sm:text-xs text-slate-400 font-medium">Updated: {fmt(lastUpdated)}</span>}
      <button onClick={onClick} disabled={refreshing} className="btn-secondary py-1.5 px-3 flex items-center space-x-1.5 cursor-pointer disabled:opacity-75">
        <FiRefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-indigo-600' : ''}`} />
        <span className="text-xs font-bold">{refreshing ? 'Syncing…' : 'Sync'}</span>
      </button>
    </div>
  );
};

export default RefreshButton;
