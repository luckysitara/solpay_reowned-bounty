const { Joi, Segments } = require("celebrate");

const { Role, Status } = require("../utiles/typings");

module.exports = {
  registerCustomer: {
    [Segments.BODY]: Joi.object().keys({
      role: Joi.string().valid(Role.USER),

      billing_address: Joi.string().min(1).max(500),

      shipping_address: Joi.string().min(1).max(500),

      password: Joi.string()
        .min(8)
        .max(40)
        .pattern(
          new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!#%*?&])[A-Za-z\\d@$!#%*?&]{8,}$")
        )
        .messages({
          "string.pattern.base":
            "Password must contain one uppercase, one lowercase, one number, one special character, and length of 8 ",
        })
        .required(),

      full_name: Joi.string().min(1).max(500),

      first_name: Joi.string().min(1).max(500).required(),

      last_name: Joi.string().min(1).max(500).required(),

      email: Joi.string().email().lowercase().required(),

      phone_number: Joi.string().min(6).max(20).required(),

      gender: Joi.string(),

      country: Joi.string().required(),

      state: Joi.string().required(),

      city: Joi.string().required(),

      delivery_address: Joi.string().required(),
    }),
  },

  registerSeller: {
    [Segments.BODY]: Joi.object().keys({
      role: Joi.string().valid(Role.VENDOR),

      status: Joi.string().valid(Status.PENDING),

      business_reg_number: Joi.string().min(1).max(500).optional().allow(""), //optional

      address: Joi.string().min(1).max(500),

      country: Joi.string().min(1).max(500),

      state: Joi.string().min(1).max(500),

      plan_type: Joi.string().min(1).max(500),

      password: Joi.string().required(),

      password_confirm: Joi.string().valid(Joi.ref("password")).required(),

      first_name: Joi.string().min(1).max(500).required(),

      last_name: Joi.string().min(1).max(500).required(),

      email: Joi.string().email().lowercase().required(),

      city: Joi.string().min(1).max(500),

      website: Joi.string().uri().min(1).max(500),

      store_name: Joi.string().required(),

      phone_number: Joi.string().min(11).max(20).required(),

      description: Joi.string().required(),

      business_type: Joi.string(),

      operation_type: Joi.string(),
    }),
  },

  signup: {
    [Segments.BODY]: Joi.object().keys({
      name: Joi.string().min(6).max(20).required(),
      password: Joi.string().min(6).max(20).required(),
      email: Joi.string().email().lowercase().required(),
      role: Joi.string().valid(Role.USER, Role.ADMIN, Role.VENDOR).default(Role.USER),
    }),
  },

  signin: {
    [Segments.BODY]: Joi.object().keys({
      password: Joi.string().required(),
      email: Joi.string().email().required(),
    }),
  },

  verifyOtp: {
    [Segments.BODY]: Joi.object().keys({
      otp: Joi.string().required(),
      email: Joi.string().required(),
    }),
  },

  forgotPassword: {
    [Segments.BODY]: Joi.object().keys({
      email: Joi.string().required(),
    }),
  },

  resetPassword: {
    [Segments.BODY]: Joi.object().keys({
      otp: Joi.string().min(1).max(6).required(),

      user_id: Joi.string().lowercase().required(),

      verify_token: Joi.string().lowercase().required(),

      password: Joi.string()
        .min(8)
        .max(40)
        .pattern(new RegExp("^(?=.*[A-Za-z])(?=.*\\d)(?=.*[!@#$%^&*])[A-Za-z\\d!@#$%^&*]{8,}$"))
        .messages({
          "string.pattern.base":
            "Password must contain one uppercase, one lowercase, one number, one special character, and length of 8 ",
        })
        .required(),
    }),
  },

  changePassword: {
    [Segments.BODY]: Joi.object().keys({
      password: Joi.string().required(),

      new_password: Joi.string()
        .min(8)
        .max(40)
        .pattern(
          new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!#%*?&])[A-Za-z\\d@$!#%*?&]{8,}$")
        )
        .messages({
          "string.pattern.base":
            "Password must contain one uppercase, one lowercase, one number, one special character, and length of 8 ",
        })
        .required(),
    }),
  },

  refreshToken: {
    [Segments.BODY]: Joi.object().keys({
      refresh_token: Joi.string().required(),
    }),
  },
};
