const mongoose = require('mongoose');
const { ACTIVITY_ACTION } = require('../utils/constants');

const activitySchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: [true, 'Activity must be linked to an asset'],
      index: true, // Index for asset lookup
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Activity must be linked to a performing user'],
    },
    action: {
      type: String,
      enum: {
        values: Object.values(ACTIVITY_ACTION),
        message: '{VALUE} is not a valid action',
      },
      required: [true, 'Activity action is required'],
    },
    description: {
      type: String,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: -1, // Descending index for fast recent activities lookups
    },
  },
  {
    timestamps: false,
  }
);

const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;
