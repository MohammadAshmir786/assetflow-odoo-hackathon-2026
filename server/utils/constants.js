const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'asset_manager',
  EMPLOYEE: 'employee',
};

const ASSET_STATUS = {
  AVAILABLE: 'Available',
  ALLOCATED: 'Allocated',
  MAINTENANCE: 'Under Maintenance',
  LOST: 'Lost',
  RETIRED: 'Retired',
  PENDING_TRANSFER: 'Pending Transfer',
};

const ASSET_CONDITION = {
  NEW: 'New',
  GOOD: 'Good',
  FAIR: 'Fair',
  POOR: 'Poor',
  BROKEN: 'Broken',
};

const ACTIVITY_ACTION = {
  ALLOCATION: 'Allocation',
  RETURN: 'Return',
  STATUS_CHANGE: 'Status Change',
  CREATION: 'Creation',
  TRANSFER: 'Transfer',
};

const TRANSFER_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

const MAINTENANCE_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  REJECTED: 'Rejected',
};

module.exports = {
  ROLES,
  ASSET_STATUS,
  ASSET_CONDITION,
  ACTIVITY_ACTION,
  TRANSFER_STATUS,
  MAINTENANCE_STATUS,
};
