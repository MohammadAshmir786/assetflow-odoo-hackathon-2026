const express = require('express');
const { loginValidator } = require('../validators/authValidator');
const { login } = require('../controllers/authController');

const router = express.Router();

// Define login endpoint
router.post('/login', loginValidator, login);

module.exports = router;
