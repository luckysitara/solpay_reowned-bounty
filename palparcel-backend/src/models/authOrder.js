const { Schema, model } = require("mongoose");

const { Status } = require("../utiles/typings");

const authSchema = new Schema(
  {
    orderId: {
      type: Schema.ObjectId,
      required: true,
    },

    sellerId: {
      type: Schema.ObjectId,
      required: true,
    },

    products: {
      type: Array,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    payment_reference: {
      type: String,
      default: null,
    },

    shipping_fee: {
      type: Number,
      required: true,
    },

    delivery_option: {
      type: String,
      required: true,
    },

    payment_status: {
      type: String,
      required: true,
      default: Status.PENDING,
      enum: [Status.PENDING, Status.SHIPPED, Status.DELIVERED],
    },

    shippingInfo: {
      type: String,
      required: true,
    },

    tracking_id: {
      type: String,
      required: true,
    },

    delivery_status: {
      type: String,
      required: true,
      default: Status.PENDING,
      enum: [Status.PENDING, Status.SHIPPED, Status.DELIVERED, Status.CANCELLED],
    },

    date: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = model("authorOrders", authSchema);
