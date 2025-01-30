const { Schema, model } = require("mongoose");
const SubscriptionPaginate = require("mongoose-paginate-v2");
const SubscriptionAggregatePaginate = require("mongoose-aggregate-paginate-v2");

const SubscriptionSchema = new Schema(
  {
    sellerId: { type: Schema.Types.ObjectId, ref: "sellers" },

    amount: {
      default: 0,
      type: Schema.Types.Number,
    },

    interval: {
      trim: true,
      minlength: 1,
      default: null,
      type: Schema.Types.String,
    },

    payment_reference: {
      trim: true,
      minlength: 1,
      default: null,
      type: Schema.Types.String,
    },

    next_payment_date: {
      trim: true,
      minlength: 1,
      default: null,
      type: Schema.Types.String,
    },

    cron_expression: {
      trim: true,
      minlength: 1,
      default: null,
      type: Schema.Types.String,
    },

    created_date: {
      trim: true,
      minlength: 1,
      default: null,
      type: Schema.Types.String,
    },

    customer_code: {
      trim: true,
      minlength: 1,
      type: Schema.Types.String,
    },

    authorization: {
      default: {},

      bin: { trim: true, type: Schema.Types.String, default: null },

      bank: { trim: true, type: Schema.Types.String, default: null },

      brand: { trim: true, type: Schema.Types.String, default: null },

      last4: { trim: true, type: Schema.Types.String, default: null },

      exp_year: { trim: true, type: Schema.Types.String, default: null },

      exp_month: { trim: true, type: Schema.Types.String, default: null },

      card_type: { trim: true, type: Schema.Types.String, default: null },

      account_name: { trim: true, type: Schema.Types.String, default: null },

      country_code: { trim: true, type: Schema.Types.String, default: null },

      authorization_code: { trim: true, type: Schema.Types.String, default: null },
    },
  },
  { timestamps: true }
);

SubscriptionSchema.plugin(SubscriptionPaginate);
SubscriptionSchema.plugin(SubscriptionAggregatePaginate);

module.exports = model("subscriptions", SubscriptionSchema);
