const express = require('express');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { allocate, returnAsset } = require('../controllers/assetController');

const router = express.Router();

// Allocation endpoint (private, restricted to admin and asset_manager)
router.post('/:id/allocate', auth, authorize('admin', 'asset_manager'), allocate);

// Return endpoint (private, restricted to admin and asset_manager)
router.post('/:id/return', auth, authorize('admin', 'asset_manager'), returnAsset);

module.exports = router;
