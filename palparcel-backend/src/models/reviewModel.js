const { Schema, model } = require("mongoose");
const ReviewPaginate = require("mongoose-paginate-v2");
const ReviewAggregatePaginate = require("mongoose-aggregate-paginate-v2");

const reviewSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "customers", required: true },

    product_id: { type: Schema.Types.ObjectId, ref: "products", required: true },

    vendor_id: { type: Schema.Types.ObjectId, ref: "sellers" },

    full_name: {
      type: String,
      // required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    review: {
      type: String,
      // required: true,
    },
    response: {
      type: String,
      default: null,
    },
    replied_at: { type: Date, default: null },
  },
  { timestamps: true }
);

reviewSchema.plugin(ReviewPaginate);
reviewSchema.plugin(ReviewAggregatePaginate);

module.exports = model("reviews", reviewSchema);
