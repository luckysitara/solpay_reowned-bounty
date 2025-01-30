const messageTemplate = require("./email.form.template");
const waitlistMessageTemplate = require("./waitlist.form.template");
const userForgotPasswordMessageTemplate = require("./forgot_password.form");
const successMessageTemplate = require("./success.form");
const {adminMessageTemplate, sellerMessageTemplate} = require("./product.form")

/**
 * @typedef {Object} OtpInterface
 * @property {string} [message]
 * @property {string} [url_path]
 * @property {string|number} [otp]
 * @property {string} [verify_token]
 */

/**
 * @function signupMessageTemplate
 * @param {OtpInterface} p
 * @returns {string}
 */
const signupMessageTemplate = (code) => {
  const message = "Use the following OTP to verify your account";
  return messageTemplate(code, message);
};

/**
 * @function waitlistMessageTemplate
 * @param {vendor_name} string
 * @returns {string}
 */
const joinedWaitingListMessage = (vendor_name) => {
  return waitlistMessageTemplate(vendor_name);
};

/**
 * @function newOtpMessageTemplate
 * @param {OtpInterface} p
 * @returns {string}
 */
const newOtpMessageTemplate = (p) => {
  return messageTemplate({ ...p, message: "reset password process " });
};

/**
 * @function forgotPassword
 * @param {OtpInterface} p
 * @returns {string}
 */
const forgotPassword = (otp, verify_token, user_id) => {
  const message = "Your reset password details";
  const url_path = "/reset-password";
  return userForgotPasswordMessageTemplate(otp, message, url_path, verify_token, user_id);
};

/**
 * @function successMessage
 * @param {message} string
 * @returns {string}
 */
const successMessage = (message) => {
  return successMessageTemplate(message);
};

/**
 * @function adminNotificationMessage
 * @param {message} string
 * @returns {string}
 */
const adminNotificationMessage = ( product, seller ) => {
  return adminMessageTemplate( product, seller );
};

/**
 * @function sellerNotificationMessage
 * @param {message} string
 * @returns {string}
 */
const sellerNotificationMessage = (product) => {
  return sellerMessageTemplate(product);
};

module.exports = {
  forgotPassword,
  successMessage,
  adminNotificationMessage,
  sellerNotificationMessage,
  signupMessageTemplate,
  newOtpMessageTemplate,
  joinedWaitingListMessage,
};
