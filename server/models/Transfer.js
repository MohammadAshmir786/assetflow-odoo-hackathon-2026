const mongoose = require('mongoose');
const { TRANSFER_STATUS } = require('../utils/constants');

const transferSchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: [true, 'Please provide the asset to transfer'],
      index: true, // Index for asset queries
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide the user requesting the transfer'],
      index: true,
    },
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide the target user for the transfer'],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: Object.values(TRANSFER_STATUS),
        message: '{VALUE} is not a valid transfer status',
      },
      default: TRANSFER_STATUS.PENDING,
      index: true, // Index for filter by status
    },
    comments: {
      type: String,
      trim: true,
    },
    actionBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    actionDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Transfer = mongoose.model('Transfer', transferSchema);

module.exports = Transfer;
