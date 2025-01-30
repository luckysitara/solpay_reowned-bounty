const { Schema, model } = require("mongoose");

const commentSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: "products" },
  vendorId: { type: Schema.Types.ObjectId, ref: "sellers" },
  response: {
    type: String,
    default: null,
  },
  // is_seen: {
  //   type: Boolean,
  //   default: false,
  // },
  isHidden: {
    type: Boolean,
    default: false,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: null,
  },
  replied_at: {
    type: Date,
    default: null,
  },
  seen_at: {
    type: Date,
    default: null,
  },
});

module.exports = model("Comment", commentSchema);
