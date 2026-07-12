const express = require('express');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const {
  createAssetValidator,
  updateAssetValidator,
} = require('../validators/assetValidator');
const {
  createAsset,
  getAllAssets,
  getAssetById,
  updateAsset,
  deleteAsset,
  allocate,
  returnAsset,
} = require('../controllers/assetController');

const router = express.Router();

// GET all assets (Supports search, filter, and pagination)
router.get('/', auth, getAllAssets);

// GET a single asset by database ID
router.get('/:id', auth, getAssetById);

// POST create a new asset
router.post('/', auth, authorize('admin', 'asset_manager'), createAssetValidator, createAsset);

// PUT update an existing asset
router.put('/:id', auth, authorize('admin', 'asset_manager'), updateAssetValidator, updateAsset);

// DELETE soft-delete an asset
router.delete('/:id', auth, authorize('admin', 'asset_manager'), deleteAsset);

// Allocation System Sub-Routes
router.post('/:id/allocate', auth, authorize('admin', 'asset_manager'), allocate);
router.post('/:id/return', auth, authorize('admin', 'asset_manager'), returnAsset);

module.exports = router;
