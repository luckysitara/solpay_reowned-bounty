const { Schema, model } = require("mongoose");

const WaitingListSchema = new Schema(
  {
    full_name: {
      type: String,
      required: true,
    },

    email_address: {
      type: String,
      required: true,
    },

    country: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
    },

    state: {
      type: String,
      required: true,
    },

    phone_number: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = model("waitinglist", WaitingListSchema);
