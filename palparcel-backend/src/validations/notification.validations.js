const { Joi, Segments } = require("celebrate");

module.exports = {
  /**
   * @description Validate notification params
   * @param {param} req - Request property object gotten from the request
   * @returns {NotificationInterface} {NotificationInterface} Returns the Request object after validating join challenge inputs from req.body
   */
  createNotification: {
    [Segments.BODY]: Joi.object().keys({
      message: Joi.string(),
    }),
  },

  /**
   * @description Validate notification params
   * @param {param} req - Request property object gotten from the request
   * @returns {NotificationInterface} {NotificationInterface} Returns the Request object after validating join challenge inputs from req.body
   */
  idParam: {
    [Segments.PARAMS]: Joi.object().keys({
      id: Joi.string().required(),
    }),
  },

  /**
   * @description Validate getting a all clients inputs
   * @param {query} param.page - page number
   * @property {query} param.limit - limit size
   * @returns {ClientInterface} {ClientInterface} Returns the Request object after validating get all client inputs from req.query and req.params
   */

  getNotifications: {
    [Segments.QUERY]: Joi.object().keys({
      page: Joi.number().default(1),

      limit: Joi.number().default(10),
    }),
  },
};
