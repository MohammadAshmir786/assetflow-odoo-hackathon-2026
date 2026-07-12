const assetService = require('../services/assetService');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

// @desc    Get dashboard metrics and activity log
// @route   GET /api/dashboard/stats
// @access  Private (admin, asset_manager)
const getStats = catchAsync(async (req, res, next) => {
  const stats = await assetService.getDashboardStats();

  res.status(200).json(
    new ApiResponse(200, stats, 'Dashboard statistics retrieved successfully')
  );
});

module.exports = {
  getStats,
};
