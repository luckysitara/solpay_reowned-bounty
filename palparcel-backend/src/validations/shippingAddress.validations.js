const { Joi } = require("celebrate");

module.exports = {
  addShippingAddress: {
    body: Joi.object().keys({
      full_name: Joi.string(),
      first_name: Joi.string().required(),
      last_name: Joi.string().required(),
      phone_number: Joi.string().required(),
      delivery_address: Joi.string().required(),
      state: Joi.string().required(),
      city: Joi.string().required(),
      country: Joi.string().required(),
      additional_note: Joi.string().optional(),
    }),
  },

  updateShippingAddress: {
    body: Joi.object().keys({
      full_name: Joi.string(),
      first_name: Joi.string().required(),
      last_name: Joi.string().required(),
      phone_number: Joi.string().required(),
      delivery_address: Joi.string().required(),
      state: Joi.string().required(),
      city: Joi.string().required(),
      country: Joi.string().required(),
      additional_note: Joi.string().optional(),
    }),
  },
};
