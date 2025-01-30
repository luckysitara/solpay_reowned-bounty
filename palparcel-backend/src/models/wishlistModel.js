const { Schema, model } = require("mongoose");
const WishListPaginate = require("mongoose-paginate-v2");
const WishListAggregatePaginate = require("mongoose-aggregate-paginate-v2");

const wishlistSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "customers", required: true },

    product_id: { type: Schema.Types.ObjectId, ref: "products", required: true },

    wish_list_name: {
      type: String,
      default: null,
    },

    item_link_id: {
      type: String,
      default: null,
    },

    item_share_link: {
      type: String,
      default: null,
    },

    general_link_id: {
      type: String,
      default: null,
    },

    general_share_link: {
      type: String,
      default: null,
    },

    slug: {
      type: String,
      required: true,
    },

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

wishlistSchema.plugin(WishListPaginate);
wishlistSchema.plugin(WishListAggregatePaginate);

module.exports = model("wishlists", wishlistSchema);
