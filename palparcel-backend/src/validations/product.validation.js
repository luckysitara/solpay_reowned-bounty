const { Joi, Segments } = require("celebrate");
const { size } = require("lodash");

module.exports = {

  addProduct: { [Segments.BODY]: Joi.object().keys({
        name: Joi.string().required(),
        category: Joi.string().required(),
        description: Joi.string(),
        price: Joi.number().required(),
        discount: Joi.number().required(),
        images: Joi.array().items(Joi.string()),
        sizes: Joi.array().items(Joi.string()),
        colors: Joi.array().items(Joi.string()).required(),
        weight: Joi.string(),
        quality: Joi.string(),
        dimension: Joi.array().items(Joi.string()),
        customization: Joi.boolean(),
        rating: Joi.number(),
        isAddedToInventory: Joi.boolean(),
        number_of_times_sold: Joi.number(),
    }),
  },

  addProductToInventory: {[Segments.BODY]: Joi.object().keys({
        name: Joi.string().required(),
        category: Joi.string().required(),
        description: Joi.string(),
        price: Joi.number().required(),
        discount: Joi.number().required(),
        images: Joi.array().items(Joi.string()),
        sizes: Joi.array().items(Joi.string()),
        colors: Joi.array().items(Joi.string()).required(),
        weight: Joi.string(),
        quality: Joi.string(),
        dimension: Joi.array().items(Joi.string()),
        customization: Joi.boolean(),
        rating: Joi.number(),
        isAddedToInventory: Joi.boolean(),
        number_of_times_sold: Joi.number(),
      }),
    },

  updateProduct: {
    [Segments.PARAMS]: Joi.object().keys({
      id: Joi.string(),
    }),

    [Segments.BODY]: Joi.object().keys({
       name: Joi.string(),
        category: Joi.string(),
        description: Joi.string(),
        price: Joi.number(),
        discount: Joi.number(),
        images: Joi.array().items(Joi.string()),
        sizes: Joi.array().items(Joi.string()),
        colors: Joi.array().items(Joi.string()),
        weight: Joi.string(),
        quality: Joi.string(),
        dimension: Joi.array().items(Joi.string()),
        customization: Joi.boolean(),
        rating: Joi.number(),
      }),
    },


};
