const { Schema, model } = require("mongoose");
//const {objectId} = Schema.Types;

const shippingAddressSchema = new Schema(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: "customers",
      required: true,
    },

    full_name: { type: String, required: false },

    first_name: { type: String, required: true },

    last_name: { type: String, required: true },

    phone_number: { type: String, required: true },

    delivery_address: { type: String, required: true },

    state: { type: String, required: true },

    city: { type: String, required: true },

    country: { type: String, require: true },

    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [longitude, latitude]
      },
  
  },
     
   { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

module.exports = model("shippingAdresses", shippingAddressSchema);
