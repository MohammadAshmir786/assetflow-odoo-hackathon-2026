const transferService = require('../services/transferService');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

// @desc    Request a new asset transfer
// @route   POST /api/transfers
// @access  Private (all roles)
const create = catchAsync(async (req, res, next) => {
  const { asset, targetUser } = req.body;
  const requestedById = req.user ? req.user._id : null;

  const transfer = await transferService.createTransfer(asset, targetUser, requestedById);

  res.status(201).json(
    new ApiResponse(201, transfer, 'Transfer request created successfully')
  );
});

// @desc    Approve an asset transfer request
// @route   PATCH /api/transfers/:id/approve
// @access  Private (admin, asset_manager)
const approve = catchAsync(async (req, res, next) => {
  const adminId = req.user ? req.user._id : null;

  const transfer = await transferService.approveTransfer(req.params.id, adminId);

  res.status(200).json(
    new ApiResponse(200, transfer, 'Transfer request approved successfully')
  );
});

// @desc    Reject an asset transfer request
// @route   PATCH /api/transfers/:id/reject
// @access  Private (admin, asset_manager)
const reject = catchAsync(async (req, res, next) => {
  const adminId = req.user ? req.user._id : null;

  const transfer = await transferService.rejectTransfer(req.params.id, adminId);

  res.status(200).json(
    new ApiResponse(200, transfer, 'Transfer request rejected successfully')
  );
});

// @desc    Get all transfers list
// @route   GET /api/transfers
// @access  Private (all roles)
const list = catchAsync(async (req, res, next) => {
  const transfers = await transferService.getTransfers();

  res.status(200).json(
    new ApiResponse(200, transfers, 'Transfer requests retrieved successfully')
  );
});

module.exports = {
  create,
  approve,
  reject,
  list,
};
