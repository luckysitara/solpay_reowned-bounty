const settingsController = require("../controllers/seller/settings/settings.controller");
const router = require("express").Router();

router
.route("/seller/update-profile")
.patch(settingsController.updateProfile);

router
.route('/seller/update-notification')
.put(settingsController.updateNotificationSettings);

router
.route("/update-password")
.patch(settingsController.updatePassword);

router
.route("/update-pin")
.put(settingsController.updateTransactionPin);

router
.route('/activity-logs')
.get(settingsController.getActivityLog);


router
.route("/:id/create-sub-role")
.post(settingsController.createSubRole);

router
.route("/seller/:subRoleId/update")
.put(settingsController.updateSubRole);

router
.route("/seller/:subRoleId/update")
.put(settingsController.manageSubRoleStatus);


module.exports = router;