const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');
const config = require('../config/env');

const errorHandler = (err, req, res, next) => {
  let error = err;

  // Normalize non-ApiError exceptions
  if (!(error instanceof ApiError)) {
    let statusCode = error.statusCode || 500;
    let message = error.message || 'Internal Server Error';

    // Handle mongoose validation / cast errors
    if (error instanceof mongoose.Error.CastError) {
      statusCode = 400;
      message = `Invalid path value for ${error.path}`;
    } else if (error instanceof mongoose.Error.ValidationError) {
      statusCode = 400;
      message = Object.values(error.errors).map((el) => el.message).join(', ');
    } else if (error.name === 'JsonWebTokenError') {
      statusCode = 401;
      message = 'Invalid token. Please log in again.';
    } else if (error.name === 'TokenExpiredError') {
      statusCode = 401;
      message = 'Your token has expired. Please log in again.';
    }

    error = new ApiError(statusCode, message, false, err.stack);
  }

  const response = {
    success: false,
    message: error.message,
    ...(config.env === 'development' && { stack: error.stack }),
  };

  // Log non-operational (unexpected) or development errors
  if (config.env === 'development' || !error.isOperational) {
    console.error('Error Intercepted:', err);
  }

  res.status(error.statusCode).json(response);
};

module.exports = errorHandler;
