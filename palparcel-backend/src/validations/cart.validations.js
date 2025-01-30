const { Joi, Segments } = require("celebrate");

module.exports = {
  addToCart: {
    [Segments.BODY]: Joi.object().keys({
      quantity: Joi.number().required(),

      productId: Joi.string().required(),
    }),
  },

  queryParams: {
    [Segments.QUERY]: Joi.object().keys({
      page: Joi.number().default(1),

      limit: Joi.number().default(10),
    }),
  },

  ids: {
    [Segments.QUERY]: Joi.object().keys({
      cart_id: Joi.string(),

      cart_id: Joi.string(),

      wishlist_id: Joi.string(),
    }),
  },
};
