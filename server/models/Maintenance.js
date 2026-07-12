const mongoose = require('mongoose');
const { MAINTENANCE_STATUS } = require('../utils/constants');

const maintenanceSchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: [true, 'Please provide the asset requiring maintenance'],
      index: true, // Index for asset lookup
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide the user requesting maintenance'],
      index: true,
    },
    issueDescription: {
      type: String,
      required: [true, 'Please provide the description of the maintenance issue'],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: Object.values(MAINTENANCE_STATUS),
        message: '{VALUE} is not a valid maintenance status',
      },
      default: MAINTENANCE_STATUS.PENDING,
      index: true, // Index for status filtering
    },
    cost: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      default: null,
    },
    completionDate: {
      type: Date,
      default: null,
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
  },
  {
    timestamps: true,
  }
);

const Maintenance = mongoose.model('Maintenance', maintenanceSchema);

module.exports = Maintenance;
