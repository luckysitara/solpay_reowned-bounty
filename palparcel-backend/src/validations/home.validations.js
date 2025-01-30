const { Joi, Segments } = require("celebrate");

module.exports = {
  searchProducts: {
    [Segments.QUERY]: Joi.object().keys({
      page: Joi.number().default(1),

      limit: Joi.number().default(10),
    }),

    [Segments.BODY]: Joi.object().keys({
      key_word: Joi.string().required(),
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

  submitProductReview: {
    [Segments.PARAMS]: Joi.object().keys({
      product_id: Joi.string().required(),
    }),

    [Segments.BODY]: Joi.object().keys({
      rating: Joi.number().min(1).max(5).required(),

      review: Joi.string().required(),

      full_name: Joi.string().required(),
    }),
  },

  replyReview: {
    [Segments.PARAMS]: Joi.object().keys({
      review_id: Joi.string().required(),
    }),

    [Segments.BODY]: Joi.object().keys({
      response: Joi.string().required(),
    }),
  },

  getAllProductReview: {
    [Segments.PARAMS]: Joi.object().keys({
      product_id: Joi.string().required(),
    }),

    [Segments.QUERY]: Joi.object().keys({
      page: Joi.number().default(1),

      limit: Joi.number().default(10),
    }),
  },

  getProductByPriceRange: {
    [Segments.QUERY]: Joi.object().keys({
      page: Joi.number().default(1),

      limit: Joi.number().default(10),
    }),

    [Segments.BODY]: Joi.object().keys({
      minPrice: Joi.number().required().default(0),

      maxPrice: Joi.number().required().default(0),
    }),
  },
};
