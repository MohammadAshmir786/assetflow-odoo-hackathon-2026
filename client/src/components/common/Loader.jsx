import React from 'react';

export const Loader = ({ size = 'md', className = '', message = 'Loading AssetFlow...' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-12 w-12 border-3',
    lg: 'h-16 w-16 border-4',
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 p-8 ${className}`}>
      <div className="relative flex items-center justify-center">
        {/* Main spinning ring */}
        <div
          className={`animate-spin rounded-full border-t-indigo-600 border-r-transparent border-b-indigo-200 border-l-transparent ${sizeClasses[size] || sizeClasses.md}`}
          role="status"
        >
          <span className="sr-only">Loading...</span>
        </div>
        {/* Pulsing glow background */}
        <div className="absolute animate-ping h-8 w-8 rounded-full bg-indigo-500 opacity-20"></div>
      </div>
      {message && (
        <p className="text-sm font-medium text-slate-500 tracking-wide animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};

export default Loader;
