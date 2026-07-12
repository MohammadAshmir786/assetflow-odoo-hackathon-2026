const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide the asset name'],
      trim: true,
    },
    serialNumber: {
      type: String,
      required: [true, 'Please provide the asset serial number'],
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: [
          'Available',
          'Allocated',
          'Under Maintenance',
          'Lost',
          'Retired',
          'Pending Transfer',
        ],
        message: '{VALUE} is not a valid status',
      },
      default: 'Available',
    },
    currentHolder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    allocationDate: {
      type: Date,
      default: null,
    },
    expectedReturnDate: {
      type: Date,
      default: null,
    },
    lastReturnedDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Asset = mongoose.model('Asset', assetSchema);

module.exports = Asset;
