const assetService = require('../services/assetService');
const Asset = require('../models/Asset');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');
const mongoose = require('mongoose');

// @desc    Create a new asset
// @route   POST /api/assets
// @access  Private (admin, asset_manager)
const createAsset = catchAsync(async (req, res, next) => {
  const { assetTag } = req.body;

  // Protect against duplicate assetTag
  const existingAsset = await Asset.findOne({ assetTag });
  if (existingAsset) {
    return next(new ApiError(400, `An active asset with assetTag '${assetTag}' already exists`));
  }

  const asset = await Asset.create(req.body);

  res.status(201).json(
    new ApiResponse(201, asset, 'Asset created successfully')
  );
});

// @desc    Get all assets with paginated filters
// @route   GET /api/assets
// @access  Private (admin, asset_manager, employee)
const getAllAssets = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const { search, status, category } = req.query;

  const skip = (page - 1) * limit;
  const query = {};

  // Apply search query across multiple fields (name, assetTag, serialNumber)
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { assetTag: { $regex: search, $options: 'i' } },
      { serialNumber: { $regex: search, $options: 'i' } },
    ];
  }

  // Filter by status
  if (status) {
    query.status = status;
  }

  // Filter by category
  if (category) {
    query.category = category;
  }

  const totalAssets = await Asset.countDocuments(query);
  const assets = await Asset.find(query)
    .skip(skip)
    .limit(limit)
    .populate('currentHolder', 'name email role');

  const totalPages = Math.ceil(totalAssets / limit);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        assets,
        page,
        limit,
        totalAssets,
        totalPages,
      },
      'Assets retrieved successfully'
    )
  );
});

// @desc    Get a single asset by id
// @route   GET /api/assets/:id
// @access  Private (admin, asset_manager, employee)
const getAssetById = catchAsync(async (req, res, next) => {
  const assetId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(assetId)) {
    return next(new ApiError(400, 'Invalid Asset ID format'));
  }

  const asset = await Asset.findById(assetId).populate('currentHolder', 'name email role');
  if (!asset) {
    return next(new ApiError(404, 'Asset not found'));
  }

  res.status(200).json(
    new ApiResponse(200, asset, 'Asset retrieved successfully')
  );
});

// @desc    Update an existing asset
// @route   PUT /api/assets/:id
// @access  Private (admin, asset_manager)
const updateAsset = catchAsync(async (req, res, next) => {
  const assetId = req.params.id;
  const { assetTag } = req.body;

  if (!mongoose.Types.ObjectId.isValid(assetId)) {
    return next(new ApiError(400, 'Invalid Asset ID format'));
  }

  const asset = await Asset.findById(assetId);
  if (!asset) {
    return next(new ApiError(404, 'Asset not found'));
  }

  // Enforce duplicate assetTag checks if changed
  if (assetTag && assetTag !== asset.assetTag) {
    const duplicate = await Asset.findOne({ assetTag });
    if (duplicate) {
      return next(new ApiError(400, `Asset tag '${assetTag}' is already in use`));
    }
  }

  // Update provided fields
  Object.keys(req.body).forEach((key) => {
    // Avoid overriding system allocation fields directly via PUT CRUD unless intended
    if (!['currentHolder', 'allocationDate', 'expectedReturnDate', 'isDeleted', 'deletedAt'].includes(key)) {
      asset[key] = req.body[key];
    }
  });

  const updatedAsset = await asset.save();

  res.status(200).json(
    new ApiResponse(200, updatedAsset, 'Asset updated successfully')
  );
});

// @desc    Soft-delete an asset
// @route   DELETE /api/assets/:id
// @access  Private (admin, asset_manager)
const deleteAsset = catchAsync(async (req, res, next) => {
  const assetId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(assetId)) {
    return next(new ApiError(400, 'Invalid Asset ID format'));
  }

  const asset = await Asset.findById(assetId);
  if (!asset) {
    return next(new ApiError(404, 'Asset not found'));
  }

  // Rename assetTag to free up unique constraint for future new entries
  asset.assetTag = `${asset.assetTag}_deleted_${Date.now()}`;
  asset.isDeleted = true;
  asset.deletedAt = new Date();

  await asset.save();

  res.status(200).json(
    new ApiResponse(200, null, 'Asset deleted successfully')
  );
});

// Existing allocation controllers:
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
  createAsset,
  getAllAssets,
  getAssetById,
  updateAsset,
  deleteAsset,
  allocate,
  returnAsset,
};
