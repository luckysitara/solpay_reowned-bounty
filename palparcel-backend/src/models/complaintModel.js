const { Schema, model } = require("mongoose");

const complainSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: "products" },
  sellerId: { type: Schema.Types.ObjectId, ref: "sellers" },
  userId: { type: Schema.Types.ObjectId, ref: "customers" },
  adminId: { type: Schema.Types.ObjectId, ref: "admins"},
  description: {
    type: String,
    required: true,
  },
  adminResponse: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ['open', 'resolved'],
    default: 'open'
  },
  complaint_type: {
    type: String,
    enum: ['technical', 'billing', 'general'],
    required: true,
  },
  dateSubmitted: {
    type: Date,
    default: Date.now
  }
});

module.exports = model("Complains", complainSchema);
