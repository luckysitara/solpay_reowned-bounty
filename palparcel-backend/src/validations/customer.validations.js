const { Joi, Segments } = require("celebrate");

module.exports = {
  updateCustomer: {
    [Segments.BODY]: Joi.object().keys({
      //note: Joi.string(),

      //state: Joi.string(),

      //country: Joi.string(),

      full_name: Joi.string(),

      first_name: Joi.string(),

      last_name: Joi.string(),

      phone_number: Joi.string(),

      gender: Joi.string(),

      // delivery_address: Joi.string(),
    }),
  },

  uploadCustomerImage: {
    [Segments.BODY]: Joi.object().keys({
      image_url: Joi.string(),
    }),
  },

  deleteAddress: {
    [Segments.BODY]: Joi.object().keys({
      delivery_address: Joi.string().required(),
    }),
  },
};
