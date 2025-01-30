const nodemailer = require("nodemailer");
const SMTPTransport = require("nodemailer/lib/smtp-transport");

const ErrorService = require("./error.service");
const { envVariables: config } = require("../config");

/**
 *
 * @class EmailService
 * @extends EmailServiceInterface
 * @classdesc Class representing the email service
 * @description Email message notification service class
 * @name EmailService
 * @exports EmailServiceInterface
 */

class EmailService {
  static transporter;

  static init() {
    // Generate test SMTP service account from ethereal.email
    // Only needed if we don't have a real mail account for testing in development
    if (config.NODE_ENV === "test") {
      nodemailer.createTestAccount().then(({ user, pass }) => {
        EmailService.initiateTransporter({
          secure: false,
          auth: { user, pass },
          host: "smtp.ethereal.email",
        });
      });
    }

    // Custom mailgun transport for nodemailer
    EmailService.initiateTransporter({
      service: config.EMAIL_SERVICE,
      host: config.EMAIL_HOST,
      secure: false,
      auth: {
        user: config.EMAIL_USERNAME,
        pass: config.EMAIL_PASSWORD,
      },
    });
  }

  /**
   * @async
   * @method initiateTransporter
   * @description Initiate email transporter
   * @param {SMTPTransport.Options | undefined} options - transport configuration
   * @returns {void} void
   * @memberof SmsServiceInterface
   */
  static initiateTransporter(options) {
    // create reusable transporter object using the default SMTP transport
    if (EmailService.transporter) return;
    EmailService.transporter = nodemailer.createTransport({ port: config.EMAIL_PORT, ...options });
  }

  /**
   * @async
   * @method sendMail
   * @description Send a user email message
   * @param {nodemailer.SendMailOptions} options - message object
   * @returns {Promise<SMTPTransport.SentMessageInfo>} {Promise<SMTPTransport.SentMessageInfo>}
   * @memberof SmsServiceInterface
   */
  static sendMail = async (options) => {
    try {
      const payload = { ...options, from: config.EMAIL_USERNAME };

      return await EmailService.transporter.sendMail(payload);
    } catch (error) {
      return ErrorService.reportError({
        errorData: error,
        status: error.status,
        message: `Failed sending email to ${options.to}`,
        error: `Error sending email on ${options.subject}`,
      });
    }
  };
}

module.exports = EmailService;
