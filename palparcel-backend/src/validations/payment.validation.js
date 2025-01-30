const { Joi, Segments } = require("celebrate");

const { SubscriptionInterval, SubscriptionAmount } = require("../utiles/typings");

module.exports = {
  subscribe: {
    [Segments.BODY]: Joi.object().keys({
      amount: Joi.number()
        .valid(
          SubscriptionAmount.MONTHLY,
          SubscriptionAmount.ANNUALLY,
          SubscriptionAmount.QUARTERLY
        )
        .required(),

      subscription_name: Joi.string().required(),

      subscription_interval: Joi.string()
        .valid(
          SubscriptionInterval.MONTHLY,
          SubscriptionInterval.ANNUALLY,
          SubscriptionInterval.QUARTERLY
        )
        .required(),
    }),
  },

  getSubscriptions: {
    [Segments.QUERY]: Joi.object().keys({
      page: Joi.number().default(1),

      limit: Joi.number().default(10),
    }),
  },
};
