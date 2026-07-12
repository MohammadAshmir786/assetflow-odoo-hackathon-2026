import React from 'react';

const STATUS_MAP = {
  Available:        { cls: 'badge-success',     label: 'Available' },
  Allocated:        { cls: 'badge-info',         label: 'Allocated' },
  'Under Maintenance': { cls: 'badge-maintenance', label: 'Maintenance' },
  Lost:             { cls: 'badge-danger',       label: 'Lost' },
  Retired:          { cls: 'badge-danger',       label: 'Retired' },
  Disposed:         { cls: 'badge-danger',       label: 'Disposed' },
};

export const AssetStatusBadge = ({ status }) => {
  const cfg = STATUS_MAP[status] || { cls: 'badge', label: status || '—' };
  return <span className={cfg.cls}>{cfg.label}</span>;
};

export default AssetStatusBadge;
