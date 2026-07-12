/**
 * Mapping status values to standard Tailwind CSS class definitions.
 */

export const STATUS_CLASSES = {
  // Asset statuses
  Available: 'badge-success',
  Allocated: 'badge-info',
  'Under Maintenance': 'badge-maintenance',
  Lost: 'badge-danger',
  Retired: 'badge-danger',
  Disposed: 'badge-danger',
  
  // Transfer / Maintenance statuses
  Pending: 'badge-warning',
  Approved: 'badge-info',
  'In Progress': 'badge-maintenance',
  Resolved: 'badge-success',
  Rejected: 'badge-danger',
};

export const getStatusClass = (status) => {
  return STATUS_CLASSES[status] || 'badge bg-slate-50 text-slate-700 border-slate-200';
};
