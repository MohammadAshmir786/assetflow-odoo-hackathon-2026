const Maintenance = require('../models/Maintenance');
const Asset = require('../models/Asset');
const Activity = require('../models/Activity');
const ApiError = require('../utils/ApiError');
const { ASSET_STATUS, MAINTENANCE_STATUS, ACTIVITY_ACTION } = require('../utils/constants');

/**
 * Create a new maintenance request
 */
const createRequest = async (assetId, issueDescription, requestedById) => {
  const asset = await Asset.findById(assetId);
  if (!asset) {
    throw new ApiError(404, 'Asset not found');
  }

  // Create maintenance document in Pending status
  const maintenance = await Maintenance.create({
    asset: assetId,
    requestedBy: requestedById,
    issueDescription,
    status: MAINTENANCE_STATUS.PENDING,
  });

  return maintenance;
};

/**
 * Approve a maintenance request (transitions asset status to 'Under Maintenance' and clears assignments)
 */
const approveRequest = async (maintenanceId, adminId) => {
  const maintenance = await Maintenance.findById(maintenanceId);
  if (!maintenance) {
    throw new ApiError(404, 'Maintenance request not found');
  }

  if (maintenance.status !== MAINTENANCE_STATUS.PENDING) {
    throw new ApiError(
      400,
      `Request has already been processed (Current status: ${maintenance.status})`
    );
  }

  const asset = await Asset.findById(maintenance.asset);
  if (!asset) {
    throw new ApiError(404, 'Linked asset not found');
  }

  // Transition request to Approved and Asset to Under Maintenance
  maintenance.status = MAINTENANCE_STATUS.APPROVED;
  maintenance.actionBy = adminId;
  await maintenance.save();

  asset.status = ASSET_STATUS.MAINTENANCE;
  // Clear current allocation when entering maintenance
  asset.currentHolder = null;
  asset.expectedReturnDate = null;
  asset.allocationDate = null;
  await asset.save();

  // Log activity
  await Activity.create({
    asset: asset._id,
    user: adminId,
    action: ACTIVITY_ACTION.STATUS_CHANGE,
    description: 'Maintenance request approved. Asset marked as Under Maintenance',
  });

  return maintenance;
};

/**
 * Start the maintenance task
 */
const startMaintenance = async (maintenanceId, adminId) => {
  const maintenance = await Maintenance.findById(maintenanceId);
  if (!maintenance) {
    throw new ApiError(404, 'Maintenance request not found');
  }

  if (maintenance.status !== MAINTENANCE_STATUS.APPROVED) {
    throw new ApiError(
      400,
      `Maintenance cannot be started (Current status must be Approved. Current: ${maintenance.status})`
    );
  }

  maintenance.status = MAINTENANCE_STATUS.IN_PROGRESS;
  maintenance.startDate = new Date();
  maintenance.actionBy = adminId;
  await maintenance.save();

  return maintenance;
};

/**
 * Resolve a maintenance task (transitions asset status back to 'Available')
 */
const resolveMaintenance = async (maintenanceId, cost, comments, adminId) => {
  const maintenance = await Maintenance.findById(maintenanceId);
  if (!maintenance) {
    throw new ApiError(404, 'Maintenance request not found');
  }

  if (maintenance.status !== MAINTENANCE_STATUS.IN_PROGRESS) {
    throw new ApiError(
      400,
      `Maintenance cannot be resolved (Current status must be In Progress. Current: ${maintenance.status})`
    );
  }

  const asset = await Asset.findById(maintenance.asset);
  if (!asset) {
    throw new ApiError(404, 'Linked asset not found');
  }

  // Transition request to Resolved and Asset back to Available
  maintenance.status = MAINTENANCE_STATUS.RESOLVED;
  maintenance.completionDate = new Date();
  maintenance.cost = cost || 0;
  if (comments) maintenance.comments = comments;
  maintenance.actionBy = adminId;
  await maintenance.save();

  asset.status = ASSET_STATUS.AVAILABLE;
  await asset.save();

  // Log activity
  await Activity.create({
    asset: asset._id,
    user: adminId,
    action: ACTIVITY_ACTION.STATUS_CHANGE,
    description: `Asset maintenance resolved. Cost: $${maintenance.cost}. Status returned to Available`,
  });

  return maintenance;
};

/**
 * Reject a maintenance request
 */
const rejectRequest = async (maintenanceId, comments, adminId) => {
  const maintenance = await Maintenance.findById(maintenanceId);
  if (!maintenance) {
    throw new ApiError(404, 'Maintenance request not found');
  }

  if (maintenance.status !== MAINTENANCE_STATUS.PENDING) {
    throw new ApiError(
      400,
      `Request has already been processed (Current status: ${maintenance.status})`
    );
  }

  maintenance.status = MAINTENANCE_STATUS.REJECTED;
  if (comments) maintenance.comments = comments;
  maintenance.actionBy = adminId;
  await maintenance.save();

  return maintenance;
};

/**
 * Get all maintenance requests
 */
const getMaintenances = async () => {
  return Maintenance.find()
    .populate('asset', 'name assetTag serialNumber status')
    .populate('requestedBy', 'name email role')
    .populate('actionBy', 'name email role');
};

module.exports = {
  createRequest,
  approveRequest,
  startMaintenance,
  resolveMaintenance,
  rejectRequest,
  getMaintenances,
};
