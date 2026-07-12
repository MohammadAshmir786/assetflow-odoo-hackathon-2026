import React from 'react';

export const SectionCard = ({ title, subtitle, headerActions, children, className = '' }) => (
  <div className={`card ${className}`}>
    {(title || subtitle || headerActions) && (
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
        <div>
          {title && <h3 className="text-base font-bold text-slate-800 tracking-tight">{title}</h3>}
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {headerActions && <div>{headerActions}</div>}
      </div>
    )}
    <div>{children}</div>
  </div>
);

export default SectionCard;
