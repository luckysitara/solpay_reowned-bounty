const _ = require("lodash");
const dayjs = require("dayjs");
const { Schema, model } = require("mongoose");
const CustomerPaginate = require("mongoose-paginate-v2");
const CustomerAggregatePaginate = require("mongoose-aggregate-paginate-v2");

const cartModel = require("../models/cardModel");
const { envVariables: config } = require("../config");
const { Role, Country } = require("../utiles/typings");
const AuthService = require("../service/auth.service");
const BcryptService = require("../service/bcrypt.service");
const NotificationModel = require("../models/Notification.model");
const shippingAddressModel = require("./shippingAddressModel"); // Import the new shippingAddress model

const customerSchema = new Schema(
  {
    state: { type: String, default: null },

    note: { type: String, default: null },

    gender: { type: String, default: null },

    email: { type: String, required: true },

    country: { type: String, default: null },

    image_url: { type: String, default: null },

    role: { type: String, default: Role.USER },

    full_name: { type: String, required: false },

    first_name: { type: String, required: true },

    last_name: { type: String, required: true },

    is_deleted: { type: Boolean, default: false },

    phone_number: { type: String, required: true },

    is_verified: { type: Boolean, default: false },

    billing_address: { type: Array, default: [] },

    country: { type: String, default: Country.NIGERIA },

    is_account_suspended: { type: Boolean, default: false },

    password: { type: String, required: true, select: true },

    verify_token: {
      type: {
        code: {
          type: String,
          required: true,
        },
        user_id: {
          required: true,
          type: Schema.Types.ObjectId,
        },
        expire_at: {
          type: Date,
          default: () => dayjs().add(5, "minute").toDate(),
        },
      },
      default: null,
    },
  },

  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

// Add reference to the shipping addresses
customerSchema.virtual("shipping_addresses", {
  ref: "shippingAddresses",
  localField: "_id",
  foreignField: "customer",
  justOne: false,
});

/**
 * pre-save hooks
 */
customerSchema.pre("save", async function (next) {
  const data = this.toObject();
  const password = `${data.password}`;

  if (!password) {
    const error = new Error("Password is required.");
    return next(error);
  }

  try {
    const encrypted_password = await BcryptService.hashPassword(password);
    this.password = encrypted_password;

    next();
  } catch (error) {
    next(error);
  }
});

/**
 * pre-update hooks
 */
customerSchema.pre("findOneAndUpdate", async function (next) {
  const update = { ...this.getUpdate() };

  // If update does not contain password then return
  if (!update.password) return next();

  try {
    update.password = await BcryptService.hashPassword(update.password);
    this.setUpdate(update);

    next();
  } catch (error) {
    next(error);
  }
});

// /**
//  * methods
//  */
customerSchema.methods = {
  isPasswordCorrect(password) {
    const { password: userPassword } = this.toObject();
    return BcryptService.comparePassword(password, userPassword);
  },

  async getSession() {
    const {
      _id: id,
      role,
      ...rest
    } = _.omit(this.toObject(), [
      "__v",
      "password",
      "is_deleted",
      "is_verified",
      "verify_token",
      "is_account_suspended",
    ]);

    const customer = { ...rest, id: String(id), role };

    const [access_token, refresh_token, cart_item_count, unread_notification_count] =
      await Promise.all([
        AuthService.issueAccessToken(customer),
        AuthService.issueRefreshToken(customer),
        cartModel.countDocuments({ userId: customer.id }),
        NotificationModel.countDocuments({ is_seen: false, user_id: customer.id }),
      ]);

    const date = dayjs();
    const issued_at = date.unix(); // convert to unix timestamp
    const token_expiry = config.ACCESS_TOKEN_EXPIRY.replace(/\D/g, ""); // Matching for the numbers
    const expires_in = date.add(Number(token_expiry), "day").unix(); // convert to unix timestamp;
    const expires_at = dayjs(expires_in * 1000).toISOString();

    return {
      issued_at,
      expires_at,
      expires_in,
      access_token,
      refresh_token,
      customer: { ...customer, unread_notification_count, is_verified: true, cart_item_count },
    };
  },
};

customerSchema.plugin(CustomerPaginate);
customerSchema.plugin(CustomerAggregatePaginate);

module.exports = model("customers", customerSchema);
