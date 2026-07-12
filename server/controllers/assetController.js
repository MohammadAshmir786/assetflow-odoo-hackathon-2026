const assetService = require('../services/assetService');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');
const mongoose = require('mongoose');

// @desc    Allocate an asset to a user
// @route   POST /api/assets/:id/allocate
// @access  Private (admin, asset_manager)
const allocate = catchAsync(async (req, res, next) => {
  const assetId = req.params.id;
  const { userId, expectedReturnDate } = req.body;

  if (!userId) {
    return next(new ApiError(400, 'User ID is required for allocation'));
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return next(new ApiError(400, 'Invalid User ID format'));
  }

  if (!mongoose.Types.ObjectId.isValid(assetId)) {
    return next(new ApiError(400, 'Invalid Asset ID format'));
  }

  // Operator ID comes from request object populated by auth middleware
  const operatorId = req.user ? req.user._id : null;

  const updatedAsset = await assetService.allocateAsset(
    assetId,
    userId,
    expectedReturnDate,
    operatorId
  );

  res.status(200).json(
    new ApiResponse(200, updatedAsset, 'Asset allocated successfully')
  );
});

// @desc    Return an allocated asset
// @route   POST /api/assets/:id/return
// @access  Private (admin, asset_manager)
const returnAsset = catchAsync(async (req, res, next) => {
  const assetId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(assetId)) {
    return next(new ApiError(400, 'Invalid Asset ID format'));
  }

  const operatorId = req.user ? req.user._id : null;

  const updatedAsset = await assetService.returnAsset(assetId, operatorId);

  res.status(200).json(
    new ApiResponse(200, updatedAsset, 'Asset returned successfully')
  );
});

module.exports = {
  allocate,
  returnAsset,
};
