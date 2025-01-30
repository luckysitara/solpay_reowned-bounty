const { Schema, model } = require("mongoose");

const { envVariables: config } = require("../config");
const BcryptService = require("../service/bcrypt.service");
const _ = require("lodash");
const dayjs = require("dayjs");
const { Role, Country } = require("../utiles/typings");
const AuthService = require("../service/auth.service");

const adminSchema = new Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: Role.ADMIN,
    },

    gender: { type: String, default: null },

    is_deleted: { type: Boolean, default: false },

    is_verified: { type: Boolean, default: false },

    country: { type: String, default: Country.NIGERIA },

    is_account_suspended: { type: Boolean, default: false },

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

/**
 * pre-save hooks
 */
adminSchema.pre("save", async function (next) {
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
adminSchema.pre("findOneAndUpdate", async function (next) {
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
adminSchema.methods = {
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

    const admin = { ...rest, id: String(id), role };

    const [access_token, refresh_token] =
      await Promise.all([
        AuthService.issueAccessToken(admin),
        AuthService.issueRefreshToken(admin),
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
      admin: { ...admin, is_verified: true},
    };
  },
};

module.exports = model("admins", adminSchema);
