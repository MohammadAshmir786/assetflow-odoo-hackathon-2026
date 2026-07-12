const mongoose = require('mongoose');
const { ASSET_STATUS, ASSET_CONDITION } = require('../utils/constants');

const assetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide the asset name'],
      trim: true,
    },
    assetTag: {
      type: String,
      required: [true, 'Please provide the asset tag'],
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide the asset category'],
      trim: true,
      index: true, // Index for category filters
    },
    serialNumber: {
      type: String,
      required: [true, 'Please provide the asset serial number'],
      trim: true,
    },
    condition: {
      type: String,
      enum: {
        values: Object.values(ASSET_CONDITION),
        message: '{VALUE} is not a valid condition',
      },
      default: ASSET_CONDITION.GOOD,
    },
    location: {
      type: String,
      trim: true,
      default: 'Main Office',
    },
    status: {
      type: String,
      enum: {
        values: Object.values(ASSET_STATUS),
        message: '{VALUE} is not a valid status',
      },
      default: ASSET_STATUS.AVAILABLE,
      index: true, // Index for status filters
    },
    currentHolder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    expectedReturnDate: {
      type: Date,
      default: null,
    },
    allocationDate: {
      type: Date,
      default: null,
    },
    lastReturnedDate: {
      type: Date,
      default: null,
    },
    acquisitionDate: {
      type: Date,
      default: null,
    },
    acquisitionCost: {
      type: Number,
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true, // Index for soft delete filtering
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-query middleware to automatically exclude soft-deleted assets
assetSchema.pre(/^find|^count/, function () {
  this.where({ isDeleted: { $ne: true } });
});

const Asset = mongoose.model('Asset', assetSchema);

module.exports = Asset;
