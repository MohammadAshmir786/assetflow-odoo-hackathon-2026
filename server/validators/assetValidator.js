const { body, validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');
const { ASSET_STATUS, ASSET_CONDITION } = require('../utils/constants');

// Middleware to capture and forward validator errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => err.msg).join(', ');
    return next(new ApiError(400, errorMessages));
  }
  next();
};

const createAssetValidator = [
  body('name')
    .notEmpty()
    .withMessage('Asset name is required')
    .trim(),
  body('assetTag')
    .notEmpty()
    .withMessage('Asset tag is required')
    .trim(),
  body('category')
    .notEmpty()
    .withMessage('Asset category is required')
    .trim(),
  body('serialNumber')
    .notEmpty()
    .withMessage('Asset serial number is required')
    .trim(),
  body('condition')
    .optional()
    .isIn(Object.values(ASSET_CONDITION))
    .withMessage(`Invalid asset condition value (must be one of: ${Object.values(ASSET_CONDITION).join(', ')})`),
  body('status')
    .optional()
    .isIn(Object.values(ASSET_STATUS))
    .withMessage(`Invalid asset status value (must be one of: ${Object.values(ASSET_STATUS).join(', ')})`),
  body('acquisitionDate')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Acquisition date must be a valid ISO 8601 date'),
  body('acquisitionCost')
    .optional()
    .isNumeric()
    .withMessage('Acquisition cost must be a numeric value')
    .custom((val) => val >= 0)
    .withMessage('Acquisition cost cannot be negative'),
  validate,
];

const updateAssetValidator = [
  body('name')
    .optional()
    .notEmpty()
    .withMessage('Asset name cannot be empty')
    .trim(),
  body('assetTag')
    .optional()
    .notEmpty()
    .withMessage('Asset tag cannot be empty')
    .trim(),
  body('category')
    .optional()
    .notEmpty()
    .withMessage('Asset category cannot be empty')
    .trim(),
  body('serialNumber')
    .optional()
    .notEmpty()
    .withMessage('Asset serial number cannot be empty')
    .trim(),
  body('condition')
    .optional()
    .isIn(Object.values(ASSET_CONDITION))
    .withMessage(`Invalid asset condition value (must be one of: ${Object.values(ASSET_CONDITION).join(', ')})`),
  body('status')
    .optional()
    .isIn(Object.values(ASSET_STATUS))
    .withMessage(`Invalid asset status value (must be one of: ${Object.values(ASSET_STATUS).join(', ')})`),
  body('acquisitionDate')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Acquisition date must be a valid ISO 8601 date'),
  body('acquisitionCost')
    .optional()
    .isNumeric()
    .withMessage('Acquisition cost must be a numeric value')
    .custom((val) => val >= 0)
    .withMessage('Acquisition cost cannot be negative'),
  validate,
];

module.exports = {
  createAssetValidator,
  updateAssetValidator,
};
