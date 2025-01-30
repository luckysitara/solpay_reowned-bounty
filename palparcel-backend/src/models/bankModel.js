const { Schema, model } = require("mongoose");
const _ = require("lodash");

const bankSchema = new Schema(
  {
    seller_id : { type: Schema.Types.ObjectId, ref: "sellers", required: true },

    bank_name: { type: String, required: true },

    account_number: { type: String, required: true },

    account_name: { type: String, required: true },

    is_deleted: { type: Boolean, default: false },

  },

  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

module.exports = model("bank",bankSchema);
