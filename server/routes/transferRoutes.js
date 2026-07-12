const express = require('express');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { createTransferValidator } = require('../validators/transferValidator');
const {
  create,
  approve,
  reject,
  list,
} = require('../controllers/transferController');

const router = express.Router();

// GET all transfers
router.get('/', auth, list);

// POST request a new transfer
router.post('/', auth, createTransferValidator, create);

// PATCH approve/reject transfers (restricted to admin & asset_manager)
router.patch('/:id/approve', auth, authorize('admin', 'asset_manager'), approve);
router.patch('/:id/reject', auth, authorize('admin', 'asset_manager'), reject);

module.exports = router;
