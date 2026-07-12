const { body, validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

// Middleware to capture and forward validator errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => err.msg).join(', ');
    return next(new ApiError(400, errorMessages));
  }
  next();
};

const createTransferValidator = [
  body('asset')
    .notEmpty()
    .withMessage('Asset ID is required')
    .isMongoId()
    .withMessage('Invalid Asset ID format'),
  body('targetUser')
    .notEmpty()
    .withMessage('Target User ID is required')
    .isMongoId()
    .withMessage('Invalid Target User ID format'),
  body('comments')
    .optional()
    .trim(),
  validate,
];

module.exports = {
  createTransferValidator,
};
