const { Schema, model } = require("mongoose");
const ProductPaginate = require("mongoose-paginate-v2");
const ProductAggregatePaginate = require("mongoose-aggregate-paginate-v2");

const productSchema = new Schema(
  {
    sellerId: { type: Schema.Types.ObjectId, ref: "sellers", required: true },

    name: {
      type: String,
      required: true,
    },

    vendor_name: { type: String, default: null },

    category: { type: String, required: true },

    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    quantity: {
      type: String,
      default: null,
    },
    variation: {
      size: {
        type: [String],
        default: [],
      },
      color: {
        type: [String],
        default: [],
      },
      quantity: {
        type: [Number],
        default: [],
      },
      customization: {
        type: Boolean,
        default: false,
      },
    },
    weight: {
      type: String,
      default: null,
    },
    isAddedToInventory: {
      type: Boolean,
      default: false,
    },
    dimension: {
      type: [String],
      default: [],
    },
    id_number: {
      type: String,
      default: null,
    },
    number_of_times_sold: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      required: true,
    },
    images: {
      type: Array,
      required: true,
    },
    isSentForApproval: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Adjusted text index (removed 'brand' since it is not in the schema)
productSchema.index(
  {
    name: "text",
    category: "text",
    vendor_name: "text",
    description: "text",
  },
  {
    weights: {
      name: 5,
      category: 4,
      vendor_name: 7,
      description: 2,
    },
  }
);

productSchema.plugin(ProductPaginate);
productSchema.plugin(ProductAggregatePaginate);

module.exports = model("products", productSchema);
