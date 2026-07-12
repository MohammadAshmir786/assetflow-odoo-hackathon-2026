const jwt = require('jsonwebtoken');
const config = require('../config/env');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/User');

const auth = catchAsync(async (req, res, next) => {
  let token;

  // Check for Authorization header in Request
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ApiError(401, 'Authentication failed. Access token is missing.'));
  }

  // Verify JWT token.
  // Note: if token verification fails, it throws a JsonWebTokenError or TokenExpiredError,
  // which is caught by catchAsync and mapped to a 401 in the global error handler.
  const decoded = jwt.verify(token, config.jwt.secret);

  // Retrieve user matching token metadata
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new ApiError(401, 'The user associated with this token could not be found.'));
  }

  // Attach user to the request object
  req.user = user;
  next();
});

module.exports = auth;
