const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

// @desc    Authenticate user & generate JWT
// @route   POST /api/auth/login
// @access  Public
const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Query user and select password (excluded by default)
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ApiError(401, 'Invalid email or password'));
  }

  // Validate password input
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return next(new ApiError(401, 'Invalid email or password'));
  }

  // Generate auth token
  const token = user.generateAuthToken();

  // Create sanitized user object
  const userResponse = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  res.status(200).json(
    new ApiResponse(200, { token, user: userResponse }, 'Login successful')
  );
});

// @desc    Get all users list
// @route   GET /api/users
// @access  Private (admin, asset_manager)
const getUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json(
    new ApiResponse(200, users, 'Users retrieved successfully')
  );
});

module.exports = {
  login,
  getUsers,
};
