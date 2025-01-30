const router = require("express").Router();
const adminAuthControllers = require("../controllers/admin/adminAuthController");

router
.route("/admin-signup")
.post(adminAuthControllers.admin_signup)

router
.route("/admin-login")
.post(adminAuthControllers.admin_login)

router
.route("/admin-forgot-password")
.post(adminAuthControllers.forgotAdminPassword)

router
.route("/admin-reset-password")
.post(adminAuthControllers.resetAdminPassword)

router
.route("/admin-update-password")
.post(adminAuthControllers.changeAdminPassword)


module.exports = router;