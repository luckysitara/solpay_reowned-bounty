const OS = require("node:os");
const dotenv = require("dotenv");
const path = require("node:path");
const { Joi } = require("celebrate");

const { createFolder } = require("../utiles/create_folders");

dotenv.config();

const envVarsSchema = Joi.object({
  PORT: Joi.number().default(5001),

  GOOGLE_MAPS_API_KEY: Joi.string(),

  ADMIN_EMAIL: Joi.string(),

  ADMIN_PASSWORD: Joi.string(),

  BASE_RATE: Joi.number().default(100),

  EMAIL_PORT: Joi.number().default(587),

  PER_KM_RATE: Joi.number().default(0.5),

  BANKS_KEY_VALUE: Joi.string().required(),

  STRIPE_SECRET_KEY: Joi.string().required(),

  EMAIL_SERVICE: Joi.string().default("gmail"),

  // MONTHLY_SUBSCRIPTION_PAGE: Joi.string().required(),

  // QUARTERLY_SUBSCRIPTION_PAGE: Joi.string().required(),

  // ANNUALLY_SUBSCRIPTION_PAGE: Joi.string().required(),

  CATEGORY_ONE_PRICE: Joi.number().default(50000),

  CATEGORY_TWO_PRICE: Joi.number().default(150000),

  ENABLE_NGROK_SERVER: Joi.boolean().default(false),

  STRIPE_VERSION: Joi.string().default("2023-08-16"),

  EMAIL_HOST: Joi.string().default("smtp.gmail.com"),

  COMMISSION_PRODUCT_COUNT: Joi.number().default(20),

  EMAIL_PASSWORD: Joi.string().default("scwlryaenoaijvyr"),

  EMAIL_USERNAME: Joi.string().default("iniyealakeret1@gmail.com"),

  NODE_ENV: Joi.string()
    .valid("development", "staging", "production", "test")
    .default("development"),

  DEBUG_DATA_BASE: Joi.boolean().when("NODE_ENV", {
    is: Joi.string().equal("development"),
    then: Joi.boolean().default(true),
    otherwise: Joi.boolean().default(false),
  }),

  ACCESS_TOKEN_SECRET: Joi.string().required(),

  MAGIC_TOKEN_SECRET: Joi.string().required(),

  MAGIC_TOKEN_EXPIRY: Joi.string().required(),

  PAY_STACK_SECRET_KEY: Joi.string().required(),

  OTP_MIN_NUMBER: Joi.number().default(100000),

  OTP_MAX_NUMBER: Joi.number().default(900000),

  REFRESH_TOKEN_SECRET: Joi.string().required(),

  DEFAULT_OTP_CODE: Joi.string().default("000000"),

  ACCESS_TOKEN_EXPIRY: Joi.string().default("30d"),

  REFRESH_TOKEN_EXPIRY: Joi.string().default("1yr"),

  BCRYPT_ROUND: Joi.string().default("10").required(),

  TRACKING_MIN_NUMBER: Joi.number().default(100000000000),

  TRACKING_MAX_NUMBER: Joi.number().default(900000000000),

  PALPARCEL_USER_PORTAL_CLIENT: Joi.string().default("http://localhost:3000/auth"),

  DEFAULT_USER_AVATAR: Joi.string().default(
    "https://ik.imagekit.io/9uxcqwdur/tr:q-70,r-max,f-webp,bg-%23ffffff/user-avatar/large_0B7n2waoa.webp"
  ),

  IS_PRODUCTION_OR_STAGING: Joi.boolean().when("NODE_ENV", {
    is: Joi.string().equal("production", "staging"),
    then: Joi.boolean().default(true),
    otherwise: Joi.boolean().default(false),
  }),

  DATA_BASE_URL: Joi.string().default(process.env.DB_URL).description("Database host name"),
})
  .unknown()
  .required();

const { error, value: envVariables } = envVarsSchema.validate(process.env, { abortEarly: false });
const nodePersistDir = createFolder(path.join(OS.tmpdir(), "node-persist"));

if (error) throw new Error(`Config validation error: ${error.message}`);

if (
  envVariables.NODE_ENV !== "production" &&
  envVariables.NODE_ENV !== "staging" &&
  envVariables.NODE_ENV !== "development" &&
  envVariables.NODE_ENV !== "test"
) {
  console.error(
    `NODE_ENV is set to ${envVariables.NODE_ENV}, but only production, staging, development and test environments are valid.`
  );
  process.exit(1);
}

module.exports = { envVariables, nodePersistDir };
