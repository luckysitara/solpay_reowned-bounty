const { Joi, Segments } = require("celebrate");

module.exports = {
  updateSeller: {

    [Segments.PARAMS]: Joi.object().keys({
      id: Joi.string(),
    }),

    [Segments.BODY]: Joi.object().keys({

      full_name: Joi.string(),

      phone_number: Joi.string(),

      store_image: Joi.string(),

      email: Joi.string().email(),

      address: Joi.string(),

      country: Joi.string(),

      state: Joi.string(),
    }),
  },

  uploadStoreImage: {
    [Segments.BODY]: Joi.object().keys({
      store_image: Joi.string(),
    }),
  },
};
