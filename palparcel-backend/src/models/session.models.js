const dayjs = require("dayjs");
const { Schema, model } = require("mongoose");

const { envVariables: config } = require("../config");

const SessionSchema = new Schema(
  {
    access_token: { type: String, default: null },

    refresh_token: { type: String, default: null },

    user_id: { type: Schema.Types.ObjectId, required: true, ref: "customers" },

    vendor_id: { type: Schema.Types.ObjectId, required: true, ref: "sellers" },

    otp: {
      type: {
        code: {
          type: String,
          required: true,
        },
        expire_at: {
          type: Schema.Types.Date,
          default: () => dayjs().add(2, "hour"),
        },
      },
      default: null,
    },

    created_at: {
      type: Date,
      default: Date.now,
      expires: config.REFRESH_TOKEN_EXPIRY,
    },
  },

  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

module.exports = model("session", SessionSchema);
