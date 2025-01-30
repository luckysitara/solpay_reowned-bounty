const { Schema, model } = require("mongoose");
const _ = require("lodash");
const dayjs = require("dayjs");

const AuthService = require("../service/auth.service");
const BcryptService = require("../service/bcrypt.service");
const { envVariables: config } = require("../config/index");
const { Role, Status, PlanType } = require("../utiles/typings");

const subRoleSchema = new Schema(
  {
    name: { type: String, required: true },

    permissions: { type: [String], required: true },

    is_active: { type: Boolean, default: true },

    is_suspended: { type: Boolean, default: false },

    action: { type: String, enum: ["activate", "suspend", "deactivate"] },

    userId: { type: Schema.Types.ObjectId, ref: "customers", required: true },
  },
  { timestamps: true }
);

const sellerSchema = new Schema(
  {
    first_name: { type: String, required: true },

    last_name: { type: String, required: true },

    email: { type: String, required: true },

    plan_type: {
      type: String,
      default: PlanType.NONE,
      enum: [PlanType.COMMISSION, PlanType.SUBSCRIPTION, PlanType.NONE],
    },

    password: { type: String, required: true, select: true },

    password_confirm: { type: String, required: true, select: false },

    role: { type: String, default: Role.VENDOR },

    website: { type: String, default: null },

    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      city: String,
      state: String,
      country: String,
      description: String,
    },
    business_reg_number: { type: String, default: null },

    address: { type: String, required: true },

    country: { type: String, required: true },

    state: { type: String, required: true },

    city: { type: String, required: true },

    store_name: { type: String, required: true },

    store_image: { type: String, default: null },

    phone_number: { type: String, default: null, required: true },

    business_type: {
      type: String,
      enum: ["individual business", "registered business"],
      default: null,
    },

    operation_type: { type: String, enum: ["Online store", "Physical store", "Both"], default: null },

    status: { type: String, default: Status.PENDING },

    description: { type: String, default: null },

    is_verified: {
      type: Boolean,
      default: false,
    },

    is_deleted: { type: Boolean, default: false },

    is_account_suspended: { type: Boolean, default: false },

    notifications: [
      {
        type: {
          type: String,
          enum: ["email", "sms", "push"],
          required: true,
        },
        is_enabled: {
          type: Boolean,
          default: false,
        },
      },
    ],

    payment: { type: String, default: "inactive" },

    next_payment_date: { default: null, type: Schema.Types.String },

    has_paid_subscription: { default: false, type: Schema.Types.Boolean },

    payment_gateway: {
      default: {},

      plan: { trim: true, type: Schema.Types.String, default: null },

      customer_code: { trim: true, type: Schema.Types.String, default: null },

      subscription_code: { trim: true, type: Schema.Types.String, default: null },
    },

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

    sub_roles: [subRoleSchema],
  },

  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

sellerSchema.index({ startLocation: '2dsphere'})

sellerSchema.pre("save", async function (next) {
  const data = this.toObject();
  const password = `${data.password}`;

  if (!password) {
    const error = new Error("Password is required.");
    return next(error);
  }

  try {
    const encrypted_password = await BcryptService.hashPassword(password);
    this.password = encrypted_password;
    this.password_confirm = undefined;

    next();
  } catch (error) {
    next(error);
  }
});

/**
 * pre-update hooks
 */
sellerSchema.pre("findOneAndUpdate", async function (next) {
  const update = { ...this.getUpdate() };

  // If update does not contain password then return
  if (!update.password) return next();

  try {
    update.password = await BcryptService.hashPassword(update.password);
    update.password_confirm = undefined;
    this.setUpdate(update);

    next();
  } catch (error) {
    next(error);
  }
});

// /**
//  * methods
//  */
sellerSchema.methods = {
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
      "password_confirm",
      "is_verified",
      "is_account_suspended",
      "is_deleted",
      "verify_token",
    ]);

    const seller = { ...rest, id: String(id), role };

    const [access_token, refresh_token] = await Promise.all([
      AuthService.issueAccessToken(seller),
      AuthService.issueRefreshToken(seller),
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
      seller: { ...seller, is_verified: true },
    };
  },
};

sellerSchema.pre(/^find/, function (next) {
  // this points to the current Query
  this.find({ active: { $ne: false } });
  next();
});



module.exports = model("sellers", sellerSchema);
