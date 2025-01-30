const { Schema, model } = require("mongoose");
const CartPaginate = require("mongoose-paginate-v2");
const CartAggregatePaginate = require("mongoose-aggregate-paginate-v2");

const cardSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "customers", required: true },

    productId: { type: Schema.Types.ObjectId, ref: "products", required: true },

    quantity: {
      type: Number,
      required: true,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

cardSchema.plugin(CartPaginate);
cardSchema.plugin(CartAggregatePaginate);

module.exports = model("cart", cardSchema);
