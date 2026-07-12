import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

export const ErrorMessage = ({ message = 'An unexpected error occurred.', onRetry, className = '' }) => {
  return (
    <div className={`p-4 rounded-xl border border-red-200 bg-red-50 text-red-800 shadow-sm ${className}`}>
      <div className="flex items-start space-x-3">
        <FiAlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-red-900">System Error</h3>
          <p className="mt-1 text-xs text-red-700 leading-relaxed">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white transition-all duration-200 shadow-sm shadow-red-600/20"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
