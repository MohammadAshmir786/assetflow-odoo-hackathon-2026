const express = require('express');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { getUsers } = require('../controllers/authController');

const router = express.Router();

// Define user retrieval route (private, restricted to admin and asset_manager)
router.get('/', auth, authorize('admin', 'asset_manager'), getUsers);

module.exports = router;
