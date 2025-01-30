const Role = {
  USER: "user",
  ADMIN: "admin",
  VENDOR: "vendor",
};

const Country = {
  GHANA: "ghana",
  KENYA: "kenya",
  NIGERIA: "nigeria",
  SOUTH_AFRICA: "south africa",
};

const PlanType = {
  COMMISSION: "Commission",
  SUBSCRIPTION: "Subscription",
  NONE: "None"
};

const CommissionRate = {
  CATEGORY_ONE: 0.1,
  CATEGORY_TWO: 0.07,
  CATEGORY_THREE: 0.05,
};

const SubscriptionInterval = {
  MONTHLY: "monthly",
  ANNUALLY: "annually",
  QUARTERLY: "quarterly",
};

const SubscriptionName = {
  MONTHLY: "monthly subscription",
  ANNUALLY: "annual subscription",
  QUARTERLY: "quarterly subscription",
};

const SubscriptionAmount = {
  MONTHLY: 14900,
  QUARTERLY: 39900,
  ANNUALLY: 150900,
};

const Status = {
  PAID: "paid",
  FAILED: "failed",
  UNPAID: "unpaid",
  SUCCESS: "success",
  PENDING: "pending",
  APPROVED: "approved",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
  PLACED: "order placed",
  PROCESSING: "processing",
  SHIPPED: "order shipped",
  CONFIRMED: "order confirmed",
  DELIVERED: "order delivered",
};

const NotificationType = {
  SIGNUP: "SIGNUP",
  SHIPPED: "SHIPPED",
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
  ADMIN_MESSAGE: "ADMIN_MESSAGE",
  WISH_LIST_ACCEPTED: "WISH_LIST_ACCEPTED",
};

const NotificationMessageType = {
  SIGNUP: "Signup successful",
  SHIPPED: "product is shipped",
  PENDING: "product is pending",
  APPROVED: "product is approved",
  DELIVERED: "product is delivered",
  CANCELLED: "product is cancelled",
  WISH_LIST_ACCEPTED: "Wish List accepted",
  ADMIN_MESSAGE: "You have a new notification",
};
const NotificationService = {
  Sms_Notification: "Enabled Sms Notification",
  Push_Notification: "Enabled Push Notification",
  Mail_Notification: "Enabled Email Notification"
};

module.exports = {
  Role,
  Status,
  Country,
  PlanType,
  CommissionRate,
  SubscriptionName,
  NotificationType,
  SubscriptionAmount,
  SubscriptionInterval,
  NotificationMessageType,
  NotificationService
};
