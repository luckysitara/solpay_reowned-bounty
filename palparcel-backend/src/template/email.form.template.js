const { envVariables: config } = require("../config");

/**
 * @typedef {Object} OtpInterface
 * @property {string} [message]
 * @property {string|number} [otp]
 */

/**
 * @function messageTemplate
 * @param {OtpInterface} params
 * @returns {string}
 */
const messageTemplate = (otp, message) => `
  <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
    <div style="margin:50px auto;width:70%;padding:20px 0">
      <div style="border-bottom:1px solid #eee">
        <a href="${config.PALPARCEL_USER_PORTAL_CLIENT}" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">TechGeneHQ, Inc.</a>
      </div>
      <p style="font-size:1.1em">Hi There,</p>
      <p>Thank you for choosing Palparcel. ${message}. OTP is valid for 5 minutes</p>
      <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
      <p style="font-size:0.9em;">Regards,<br />Palparcel</p>
      <hr style="border:none;border-top:1px solid #eee" />
      <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
        <p>FPalparcel </p>
        <p>Lagos state</p>
        <p>Nigeria</p>
      </div>
    </div>
  </div>
`;

module.exports = messageTemplate;
