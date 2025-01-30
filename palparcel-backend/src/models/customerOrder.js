const { Schema, model } = require("mongoose");
const CustomerOrderPaginate = require("mongoose-paginate-v2");
const CustomerOrderAggregatePaginate = require("mongoose-aggregate-paginate-v2");

const { Status } = require("../utiles/typings");

const customerOrder = new Schema(
  {
    customerId: { type: Schema.ObjectId, required: true, ref: "customers" },

    products: { type: Array, required: true },

    price: { type: Number, required: true },

    payment_status: {
      type: String,
      enum: [Status.PENDING, Status.PAID, Status.UNPAID, Status.CANCELLED, Status.SUCCESS],
      default: Status.PENDING,
    },

    commission_fee: { type: Number, default: 0 },

    shipping_fee: { type: Number, required: true },

    delivery_option: { type: String, required: true },

    shippingInfo: { type: Object, required: true },

    is_deleted: { type: Schema.Types.Boolean, default: false },

    tracking_id: { type: String, required: true },

    payment_reference: { type: String, default: null },

    order_checkout_url: { type: String, default: null },

    delivery_status: {
      type: String,
      enum: [Status.PENDING, Status.SHIPPED, Status.DELIVERED, Status.CANCELLED],
      default: Status.PENDING,
    },

    order_status: {
      type: [String],
      enum: [Status.PENDING, Status.PLACED, Status.CONFIRMED, Status.SHIPPED, Status.DELIVERED],
      default: [Status.PENDING],
    },

    date: { type: String, required: true },
  },

  { timestamps: true }
);

customerOrder.plugin(CustomerOrderPaginate);
customerOrder.plugin(CustomerOrderAggregatePaginate);

module.exports = model("customerOrders", customerOrder);
