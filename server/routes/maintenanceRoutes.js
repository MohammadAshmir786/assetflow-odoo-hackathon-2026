const express = require('express');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const {
  createMaintenanceValidator,
  resolveMaintenanceValidator,
} = require('../validators/maintenanceValidator');
const {
  createRequest,
  approveRequest,
  startMaintenance,
  resolveMaintenance,
  rejectRequest,
  listRequests,
} = require('../controllers/maintenanceController');

const router = express.Router();

// GET all maintenance requests
router.get('/', auth, listRequests);

// POST request new maintenance (employees can request)
router.post('/', auth, createMaintenanceValidator, createRequest);

// PATCH routes to transition state (restricted to admin & asset_manager)
router.patch('/:id/approve', auth, authorize('admin', 'asset_manager'), approveRequest);
router.patch('/:id/start', auth, authorize('admin', 'asset_manager'), startMaintenance);
router.patch('/:id/resolve', auth, authorize('admin', 'asset_manager'), resolveMaintenanceValidator, resolveMaintenance);
router.patch('/:id/reject', auth, authorize('admin', 'asset_manager'), rejectRequest);

module.exports = router;
