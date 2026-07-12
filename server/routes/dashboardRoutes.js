const express = require('express');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { getStats } = require('../controllers/dashboardController');

const router = express.Router();

// Dashboard stats endpoint (private, restricted to admin and asset_manager)
router.get('/stats', auth, authorize('admin', 'asset_manager'), getStats);

module.exports = router;
