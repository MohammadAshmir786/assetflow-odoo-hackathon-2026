const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: [true, 'Activity must be linked to an asset'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Activity must be linked to a performing user'],
    },
    action: {
      type: String,
      enum: {
        values: ['Allocation', 'Return', 'Status Change', 'Creation'],
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
    },
  },
  {
    timestamps: false, // We use timestamp field explicitly
  }
);

const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;
