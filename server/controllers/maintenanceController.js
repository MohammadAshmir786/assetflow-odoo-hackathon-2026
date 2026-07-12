const maintenanceService = require('../services/maintenanceService');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

// @desc    Create a new maintenance request
// @route   POST /api/maintenance
// @access  Private (all roles)
const createRequest = catchAsync(async (req, res, next) => {
  const { asset, issueDescription } = req.body;
  const requestedById = req.user ? req.user._id : null;

  const maintenance = await maintenanceService.createRequest(
    asset,
    issueDescription,
    requestedById
  );

  res.status(201).json(
    new ApiResponse(201, maintenance, 'Maintenance request created successfully')
  );
});

// @desc    Approve a maintenance request
// @route   PATCH /api/maintenance/:id/approve
// @access  Private (admin, asset_manager)
const approveRequest = catchAsync(async (req, res, next) => {
  const adminId = req.user ? req.user._id : null;

  const maintenance = await maintenanceService.approveRequest(req.params.id, adminId);

  res.status(200).json(
    new ApiResponse(200, maintenance, 'Maintenance request approved successfully')
  );
});

// @desc    Start maintenance task
// @route   PATCH /api/maintenance/:id/start
// @access  Private (admin, asset_manager)
const startMaintenance = catchAsync(async (req, res, next) => {
  const adminId = req.user ? req.user._id : null;

  const maintenance = await maintenanceService.startMaintenance(req.params.id, adminId);

  res.status(200).json(
    new ApiResponse(200, maintenance, 'Maintenance task started successfully')
  );
});

// @desc    Resolve maintenance task
// @route   PATCH /api/maintenance/:id/resolve
// @access  Private (admin, asset_manager)
const resolveMaintenance = catchAsync(async (req, res, next) => {
  const { cost, comments } = req.body;
  const adminId = req.user ? req.user._id : null;

  const maintenance = await maintenanceService.resolveMaintenance(
    req.params.id,
    cost,
    comments,
    adminId
  );

  res.status(200).json(
    new ApiResponse(200, maintenance, 'Maintenance task resolved successfully')
  );
});

// @desc    Reject a maintenance request
// @route   PATCH /api/maintenance/:id/reject
// @access  Private (admin, asset_manager)
const rejectRequest = catchAsync(async (req, res, next) => {
  const { comments } = req.body;
  const adminId = req.user ? req.user._id : null;

  const maintenance = await maintenanceService.rejectRequest(
    req.params.id,
    comments,
    adminId
  );

  res.status(200).json(
    new ApiResponse(200, maintenance, 'Maintenance request rejected successfully')
  );
});

// @desc    Get all maintenance requests
// @route   GET /api/maintenance
// @access  Private (all roles)
const listRequests = catchAsync(async (req, res, next) => {
  const requests = await maintenanceService.getMaintenances();

  res.status(200).json(
    new ApiResponse(200, requests, 'Maintenance requests retrieved successfully')
  );
});

module.exports = {
  createRequest,
  approveRequest,
  startMaintenance,
  resolveMaintenance,
  rejectRequest,
  listRequests,
};
