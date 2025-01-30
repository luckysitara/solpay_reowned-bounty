const _ = require("lodash");

/**
 *
 * @class NotificationService]
 * @classdesc Class representing the notification service
 * @description Notification message service class
 * @name NotificationService
 * @exports NotificationService
 */

class NotificationService {
  /**
   * @method createNotificationMessage
   * @description create notification messages
   * @param {CreateNotificationParams} payload - message object
   * @returns {CreateNotificationReturnType}
   */

  static createNotificationMessage(payload) {
    const { product, ...rest } = payload;

    const data = {
      ...rest,
      product_id: product ? product._id : null,
      avatar_id: product ? product.sellerId : null,
    };
    return data;
  }
}

module.exports = NotificationService;
