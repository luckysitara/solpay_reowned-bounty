const httpStatus = require("http-status");
const APIError = require("../../utiles/api.error");
const adminModel = require("../../models/adminModel");
const { sendResponse } = require("../../utiles/send_response");
const { generateOTP } = require("../../utiles/generate_otp");
const SessionModel = require("../../models/session.models");
const _ = require("lodash");
const dayjs = require("dayjs");
const EmailTemplate = require("../../template/index");
const { getSession } = require("../../utiles/use_session");
const EmailService = require("../../service/email.service");
const cryptoRandomString = import("crypto-random-string");

class adminAuthControllers {
  /**
   * Route: POST: /auth/admin/signup
   * @async
   * @method registerAdmin
   * @description signup admin account
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof adminAuthController
   */
  admin_signup = async (req, res, next) => {
    try {
      const { email } = req.body;

      if (!email) {
        throw new APIError({
          status: httpStatus.BAD_REQUEST,
          message: "Email and password are required",
        });
      }
      const adminEmail = process.env.ADMIN_EMAIL;

      const admin = await adminModel.findOneAndUpdate({ email: adminEmail }, { is_verified: true });

      if (!admin) {
        throw new APIError({
          status: httpStatus.UNAUTHORIZED,
          message: "Admin already exists",
        });
      }

      await SessionModel.findOneAndUpdate({ user_id: admin?._id }, { upsert: true, new: true });

      EmailService.sendMail({
        to: adminEmail,
        subject: "Proceed to login",
        html: EmailTemplate.successMessage(),
      });

      return res
        .status(httpStatus.CREATED)
        .json(sendResponse({ message: "success", status: httpStatus.CREATED }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Route: POST: /auth/admin/signin
   * @async
   * @method signinAdmin
   * @description signin to admin account
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof adminAuthController
   */
  admin_login = async (req, res, next) => {
    try {
      const { password, email } = req.body;

      const admin = await adminModel
        .findOne({
          email,
          is_deleted: false,
          is_verified: true,
          is_account_suspended: false,
        })
        .orFail(
          new APIError({
            status: httpStatus.BAD_REQUEST,
            message: "Invalid",
          })
        );

      const isCorrect = admin.isPasswordCorrect(password);

      if (!isCorrect) {
        throw new APIError({
          status: httpStatus.BAD_REQUEST,
          message: "Invalid, email or password",
        });
      }

      const session = await admin.getSession();

      await SessionModel.findOneAndUpdate(
        { user_id: admin._id },
        { ..._.pick(session, ["refresh_token", "access_token"]), otp: null },
        { upsert: true, new: true }
      );

      return res
        .status(httpStatus.OK)
        .json(sendResponse({ status: httpStatus.OK, payload: session, message: "successful" }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Route: POST: /auth/admin/forgot-password
   * @async
   * @method forgotAdminPassword
   * @description reset admin password
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof adminAuthController
   */

  forgotAdminPassword = async (req, res, next) => {
    try {
      const { email } = req.body;

      const admin = await adminModel.findOne({ email }).orFail(
        new APIError({
          message: "Account not registered with us, please signup",
          status: httpStatus.BAD_REQUEST,
        })
      );

      const code = generateOTP();

      await SessionModel.findOneAndUpdate(
        { user_id: admin._id },
        { otp: { code } },
        { upsert: true }
      );

      const verify_token = await cryptoRandomString.cryptoRandomString(12);

      await adminModel.findOneAndUpdate(
        { email },
        { verify_token: { code: verify_token, user_id: admin._id } },
        { upsert: true }
      );

      EmailService.sendMail({
        to: email,
        subject: "Reset Your Password",
        html: EmailTemplate.forgotPassword(code, verify_token, String(admin._id)),
      });

      return res
        .status(httpStatus.CREATED)
        .json(sendResponse({ message: "success", status: httpStatus.CREATED }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Route: POST: /auth/admin/reset-password
   * @async
   * @method resetAdminPassword
   * @description reset admin password
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof adminAuthController
   */

  resetAdminPassword = async (req, res, next) => {
    try {
      const { password, otp, verify_token, user_id } = req.body;

      const session = await SessionModel.findOne({
        user_id,
        "otp.code": otp,
      }).orFail(
        new APIError({
          status: httpStatus.BAD_REQUEST,
          message: "Account does not exist",
        })
      );

      const otpTime = session.otp.expire_at.valueOf();
      const currentTime = dayjs().valueOf();

      if (otpTime < currentTime) {
        throw new APIError({
          status: httpStatus.BAD_REQUEST,
          message: "Incorrect or Expired OTP",
        });
      }

      const admin = await adminModel
        .findOneAndUpdate(
          {
            "verify_token.user_id": user_id,
            "verify_token.code": verify_token,
          },
          { password, verify_token: null }
        )
        .orFail(
          new APIError({
            status: httpStatus.BAD_REQUEST,
            message: "Invalid Verification details",
          })
        );

      EmailService.sendMail({
        to: admin.email,
        subject: "Password reset successful",
        html: EmailTemplate.successMessage("Your password has been reset successfully"),
      });

      return res
        .status(httpStatus.OK)
        .json(sendResponse({ message: "Password reset successful", status: httpStatus.OK }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Route: POST: /auth/admin/change-password
   * @async
   * @method changeAdminPassword
   * @description reset admin password
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof adminAuthController
   */

  changeAdminPassword = async (req, res, next) => {
    try {
      const { user } = getSession();
      const { password, new_password } = req.body;

      const admin = await adminModel
        .findOne({
          email: user.email,
          is_deleted: false,
          is_verified: true,
          is_account_suspended: false,
        })
        .orFail(
          new APIError({
            status: httpStatus.BAD_REQUEST,
            message: "Invalid, email or password",
          })
        );

      const isCorrect = admin.isPasswordCorrect(password);

      if (!isCorrect) {
        throw new APIError({
          status: httpStatus.BAD_REQUEST,
          message: "Invalid, email or password",
        });
      }

      await adminModel.findOneAndUpdate({ _id: admin._id }, { password: new_password }).orFail(
        new APIError({
          status: httpStatus.BAD_REQUEST,
          message: "Cannot change password",
        })
      );

      EmailService.sendMail({
        to: admin.email,
        subject: "Password reset successful",
        html: EmailTemplate.successMessage("Your password has been reset successfully"),
      });

      return res
        .status(httpStatus.OK)
        .json(sendResponse({ message: "Password reset successful", status: httpStatus.OK }));
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new adminAuthControllers();
