const router = require("express").Router();
const { celebrate: validate } = require("celebrate");

const { isAdmin } = require("../middlewares/is_admin_middleware");
const NotificationController = require("../controllers/notification.controller");
const NotificationValidation = require("../validations/notification.validations");

router
  .route("/customer")
  .get(
    [validate(NotificationValidation.getNotifications, { abortEarly: false })],
    NotificationController.getCustomerNotifications
  )

router
  .route("/seller")
  .get(
    [validate(NotificationValidation.getNotifications, { abortEarly: false })],
    NotificationController.getSellerNotifications
  )

  .post(
    [validate(NotificationValidation.createNotification, { abortEarly: false }), isAdmin],
    NotificationController.sendNotificationToCustomers
  );

router.route("/customer/mark-read").put(NotificationController.markAllNotificationsAsRead);

router
  .route("/customer/mark-read/:id")
  .put(
    [validate(NotificationValidation.idParam, { abortEarly: false })],
    NotificationController.markNotificationsAsRead
  );

router
  .route("/delete/:id")
  .delete(
    NotificationController.deleteNotifications
  );

module.exports = router;
