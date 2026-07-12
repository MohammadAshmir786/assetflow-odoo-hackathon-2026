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

const createMaintenanceValidator = [
  body('asset')
    .notEmpty()
    .withMessage('Asset ID is required')
    .isMongoId()
    .withMessage('Invalid Asset ID format'),
  body('issueDescription')
    .notEmpty()
    .withMessage('Issue description is required')
    .trim(),
  validate,
];

const resolveMaintenanceValidator = [
  body('cost')
    .optional()
    .isNumeric()
    .withMessage('Cost must be a numeric value')
    .custom((val) => val >= 0)
    .withMessage('Cost cannot be negative'),
  body('comments')
    .optional()
    .trim(),
  validate,
];

module.exports = {
  createMaintenanceValidator,
  resolveMaintenanceValidator,
};
