const { Joi, Segments } = require("celebrate");

module.exports = {
  orderId: {
    [Segments.PARAMS]: Joi.object().keys({
      order_id: Joi.string(),
    }),
  },

  getAllOrders: {
    [Segments.QUERY]: Joi.object().keys({
      page: Joi.number().default(1),

      limit: Joi.number().default(10),
    }),
  },

  createOrder: {
    [Segments.BODY]: Joi.object().keys({
      shipping_fee: Joi.number().required(),

      delivery_option: Joi.string().required(),

      shipping_address: Joi.string().required(),
    }),
  },
};
