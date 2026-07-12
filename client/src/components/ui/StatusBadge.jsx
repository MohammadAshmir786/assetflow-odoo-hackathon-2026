import React from 'react';

const MAP = {
  success: 'badge-success', warning: 'badge-warning',
  danger: 'badge-danger', maintenance: 'badge-maintenance',
  info: 'badge-info', default: 'badge bg-slate-50 text-slate-700 border-slate-200',
};

export const StatusBadge = ({ label, type = 'default' }) => (
  <span className={MAP[type] || MAP.default}>{label}</span>
);

export default StatusBadge;
