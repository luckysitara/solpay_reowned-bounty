const { Schema, model } = require("mongoose");

const activityLogSchema = new Schema(
    {
      user_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Seller',
      },
      action: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
      description: {
        type: String,
        required: true,
      },
    },
    { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
  );

  module.exports = model('ActivityLog', activityLogSchema);