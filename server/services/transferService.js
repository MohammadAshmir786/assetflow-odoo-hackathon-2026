const Transfer = require('../models/Transfer');
const Asset = require('../models/Asset');
const User = require('../models/User');
const Activity = require('../models/Activity');
const ApiError = require('../utils/ApiError');
const { ASSET_STATUS, TRANSFER_STATUS, ACTIVITY_ACTION } = require('../utils/constants');

/**
 * Request an asset transfer from current owner to target user
 */
const createTransfer = async (assetId, targetUserId, requestedById) => {
  // Validate asset
  const asset = await Asset.findById(assetId);
  if (!asset) {
    throw new ApiError(404, 'Asset not found');
  }

  if (asset.status !== ASSET_STATUS.ALLOCATED) {
    throw new ApiError(
      400,
      `Asset cannot be transferred. Current status is '${asset.status}' (must be '${ASSET_STATUS.ALLOCATED}').`
    );
  }

  // Validate targetUser
  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    throw new ApiError(404, 'Target user not found');
  }

  // Mark asset status as Pending Transfer
  asset.status = ASSET_STATUS.PENDING_TRANSFER;
  await asset.save();

  // Create Transfer document
  const transfer = await Transfer.create({
    asset: assetId,
    requestedBy: requestedById,
    targetUser: targetUserId,
    status: TRANSFER_STATUS.PENDING,
  });

  // Log activity
  await Activity.create({
    asset: assetId,
    user: requestedById,
    action: ACTIVITY_ACTION.STATUS_CHANGE,
    description: `Transfer request created to move asset to ${targetUser.name}`,
  });

  return transfer;
};

/**
 * Approve a transfer request (assigns asset to the targetUser and returns status back to 'Allocated')
 */
const approveTransfer = async (transferId, adminId) => {
  const transfer = await Transfer.findById(transferId);
  if (!transfer) {
    throw new ApiError(404, 'Transfer request not found');
  }

  if (transfer.status !== TRANSFER_STATUS.PENDING) {
    throw new ApiError(
      400,
      `Transfer has already been resolved (Current status: ${transfer.status})`
    );
  }

  const asset = await Asset.findById(transfer.asset);
  if (!asset) {
    throw new ApiError(404, 'Linked asset not found');
  }

  const targetUser = await User.findById(transfer.targetUser);
  if (!targetUser) {
    throw new ApiError(404, 'Target user not found');
  }

  // Update Asset holder
  asset.status = ASSET_STATUS.ALLOCATED;
  asset.currentHolder = transfer.targetUser;
  asset.allocationDate = new Date();
  await asset.save();

  // Update Transfer status
  transfer.status = TRANSFER_STATUS.APPROVED;
  transfer.actionBy = adminId;
  transfer.actionDate = new Date();
  await transfer.save();

  // Log activity
  await Activity.create({
    asset: asset._id,
    user: transfer.targetUser,
    action: ACTIVITY_ACTION.TRANSFER,
    description: `Transfer approved. Asset assigned to ${targetUser.name}`,
  });

  return transfer;
};

/**
 * Reject a transfer request (returns asset status back to 'Allocated', keeping the current owner)
 */
const rejectTransfer = async (transferId, adminId) => {
  const transfer = await Transfer.findById(transferId);
  if (!transfer) {
    throw new ApiError(404, 'Transfer request not found');
  }

  if (transfer.status !== TRANSFER_STATUS.PENDING) {
    throw new ApiError(
      400,
      `Transfer has already been resolved (Current status: ${transfer.status})`
    );
  }

  const asset = await Asset.findById(transfer.asset);
  if (!asset) {
    throw new ApiError(404, 'Linked asset not found');
  }

  // Restore asset status to Allocated
  asset.status = ASSET_STATUS.ALLOCATED;
  await asset.save();

  // Update Transfer status
  transfer.status = TRANSFER_STATUS.REJECTED;
  transfer.actionBy = adminId;
  transfer.actionDate = new Date();
  await transfer.save();

  // Log activity
  await Activity.create({
    asset: asset._id,
    user: adminId,
    action: ACTIVITY_ACTION.STATUS_CHANGE,
    description: 'Transfer request rejected. Asset remains with current holder',
  });

  return transfer;
};

/**
 * Get all transfer logs
 */
const getTransfers = async () => {
  return Transfer.find()
    .populate('asset', 'name assetTag serialNumber status')
    .populate('requestedBy', 'name email role')
    .populate('targetUser', 'name email role')
    .populate('actionBy', 'name email role');
};

module.exports = {
  createTransfer,
  approveTransfer,
  rejectTransfer,
  getTransfers,
};
