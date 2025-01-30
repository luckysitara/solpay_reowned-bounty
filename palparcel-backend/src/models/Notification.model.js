const _ = require("lodash");
const { Schema, model, default: mongoose } = require("mongoose");
const NotificationPaginate = require("mongoose-paginate-v2");
const NotificationAggregatePaginate = require("mongoose-aggregate-paginate-v2");
const NotificationService = require("../service/notification.service");
const { NotificationType } = require("../utiles/typings");

const NotificationSchema = new Schema(
  {
    title: {
      trim: true,
      type: String,
      minlength: 1,
      default: null,
      maxlength: 255,
    },

    message: {
      trim: true,
      type: String,
      minlength: 1,
      default: null,
      maxlength: 255,
    },

    full_name: {
      trim: true,
      type: String,
      minlength: 1,
      default: null,
      maxlength: 255,
    },

    type: {
      trim: true,
      type: String,
      default: NotificationType.SIGNUP,
      enum: [
        NotificationType.SIGNUP,
        NotificationType.SHIPPED,
        NotificationType.PENDING,
        NotificationType.APPROVED,
        NotificationType.DELIVERED,
        NotificationType.CANCELLED,
        NotificationType.WISH_LIST_ACCEPTED,
      ],
    },

    notification_service: {
      type: String,
      enum: ["email", "sms", "push"],
    },

    is_seen: { type: Boolean, default: false },

    is_disabled: { type: Boolean, default: false },

    is_product_deleted: { type: Boolean, default: false },

    sender_id: { type: Schema.Types.ObjectId, ref: "admins", default: null },

    seller_id: { type: Schema.Types.ObjectId, ref: "sellers", default: null },

    user_id: { type: Schema.Types.ObjectId, ref: "customers", required: true },

    product_id: { type: Schema.Types.ObjectId, ref: "products", default: null },

    order_id: { type: Schema.Types.ObjectId, ref: "customerOrders", default: null },
  },
  { timestamps: true }
);

NotificationSchema.statics = {
  async createNotification(payload) {
    const notifications = [payload].flat();

    const data = notifications.map((notification) => {
      return NotificationService.createNotificationMessage({
        ...notification,
      });
    });

    return this.insertMany(data);
  },
};

NotificationSchema.plugin(NotificationPaginate);
NotificationSchema.plugin(NotificationAggregatePaginate);

module.exports = model("notifications", NotificationSchema);
