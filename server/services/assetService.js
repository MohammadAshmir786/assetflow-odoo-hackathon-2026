const Asset = require('../models/Asset');
const User = require('../models/User');
const Activity = require('../models/Activity');
const ApiError = require('../utils/ApiError');

/**
 * Allocate an asset to a user
 * @param {string} assetId 
 * @param {string} userId 
 * @param {string|Date} expectedReturnDate 
 * @param {string} operatorId 
 */
const allocateAsset = async (assetId, userId, expectedReturnDate, operatorId) => {
  // Validate User exists
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Validate Asset exists
  const asset = await Asset.findById(assetId);
  if (!asset) {
    throw new ApiError(404, 'Asset not found');
  }

  // Validate status is 'Available'
  if (asset.status !== 'Available') {
    throw new ApiError(
      400,
      `Asset cannot be allocated. Current status is '${asset.status}' (must be 'Available').`
    );
  }

  // Validate expectedReturnDate if provided
  let returnDate = null;
  if (expectedReturnDate) {
    returnDate = new Date(expectedReturnDate);
    if (isNaN(returnDate.getTime())) {
      throw new ApiError(400, 'Invalid expected return date');
    }
    if (returnDate <= new Date()) {
      throw new ApiError(400, 'Expected return date must be in the future');
    }
  }

  // Perform allocation updates
  asset.status = 'Allocated';
  asset.currentHolder = userId;
  asset.allocationDate = new Date();
  asset.expectedReturnDate = returnDate;

  await asset.save();

  // Log activity
  await Activity.create({
    asset: assetId,
    user: userId,
    action: 'Allocation',
    description: `Asset allocated to ${user.name} (${user.email}). Expected return: ${
      returnDate ? returnDate.toISOString().split('T')[0] : 'N/A'
    }`,
  });

  return asset;
};

/**
 * Return an allocated asset to inventory
 * @param {string} assetId 
 * @param {string} operatorId 
 */
const returnAsset = async (assetId, operatorId) => {
  // Validate Asset exists
  const asset = await Asset.findById(assetId);
  if (!asset) {
    throw new ApiError(404, 'Asset not found');
  }

  // Validate asset is currently 'Allocated'
  if (asset.status !== 'Allocated') {
    throw new ApiError(
      400,
      `Asset cannot be returned. Current status is '${asset.status}' (must be 'Allocated').`
    );
  }

  const previousHolderId = asset.currentHolder;

  // Perform return updates
  asset.status = 'Available';
  asset.currentHolder = null;
  asset.allocationDate = null;
  asset.expectedReturnDate = null;
  asset.lastReturnedDate = new Date();

  await asset.save();

  // Log activity
  await Activity.create({
    asset: assetId,
    user: previousHolderId || operatorId,
    action: 'Return',
    description: 'Asset returned and marked as Available',
  });

  return asset;
};

/**
 * Aggregate and fetch dashboard statistics
 */
const getDashboardStats = async () => {
  const now = new Date();

  // MongoDB Facet Aggregation to count status elements and overdue allocations in one query
  const statsAggregation = await Asset.aggregate([
    {
      $facet: {
        total: [{ $count: 'count' }],
        statusCounts: [
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
            },
          },
        ],
        overdue: [
          {
            $match: {
              status: 'Allocated',
              expectedReturnDate: { $lt: now },
            },
          },
          { $count: 'count' },
        ],
      },
    },
  ]);

  const rawStats = statsAggregation[0] || {};

  // Extract counts from facet arrays with fallbacks to 0
  const totalAssets = rawStats.total?.[0]?.count || 0;
  
  const statusCounts = rawStats.statusCounts || [];
  const availableAssets = statusCounts.find((s) => s._id === 'Available')?.count || 0;
  const allocatedAssets = statusCounts.find((s) => s._id === 'Allocated')?.count || 0;
  const underMaintenance = statusCounts.find((s) => s._id === 'Under Maintenance')?.count || 0;
  const pendingTransfers = statusCounts.find((s) => s._id === 'Pending Transfer')?.count || 0;

  const overdueReturns = rawStats.overdue?.[0]?.count || 0;

  // Retrieve 5 most recent activities populated with asset & user details
  const recentActivities = await Activity.find()
    .sort({ timestamp: -1 })
    .limit(5)
    .populate('asset', 'name serialNumber')
    .populate('user', 'name email role');

  return {
    totalAssets,
    availableAssets,
    allocatedAssets,
    underMaintenance,
    pendingTransfers,
    overdueReturns,
    recentActivities,
  };
};

module.exports = {
  allocateAsset,
  returnAsset,
  getDashboardStats,
};
