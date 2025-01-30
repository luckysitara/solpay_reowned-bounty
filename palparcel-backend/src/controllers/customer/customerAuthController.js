const _ = require("lodash");
const dayjs = require("dayjs");
const formidable = require("formidable");
const httpStatus = require("http-status");
const cloudinary = require("cloudinary").v2;

const APIError = require("../../utiles/api.error");
const EmailTemplate = require("../../template/index");
const { envVariables: config } = require("../../config");
const { getSession } = require("../../utiles/use_session");
const EmailService = require("../../service/email.service");
const customerModel = require("../../models/customerModel");
const SessionModel = require("../../models/session.models");
const { generateOTP } = require("../../utiles/generate_otp");
const { sendResponse } = require("../../utiles/send_response");
const NotificationModel = require("../../models/Notification.model");
const cryptoRandomString = require("../../utiles/cryptoRandomString");
const { NotificationType, NotificationMessageType } = require("../../utiles/typings");
const ShippingAddress = require("../../models/shippingAddressModel");
const { geocodeAddress } = require("../../service/geocodingService");

class CustomerAuthController {
  /**
   * Route: POST: /auth/customer/signup
   * @async
   * @method registerCustomer
   * @description signup customers account
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof CustomerAuthController
   */
  registerCustomer = async (req, res, next) => {
    try {
      const {
        email,
        full_name,
        first_name,
        last_name,
        phone_number,
        country,
        state,
        city,
        delivery_address,
      } = req.body;

      let customer = await customerModel.findOne({ email });

      if (customer) {
        throw new APIError({
          status: httpStatus.BAD_REQUEST,
          message: "Account already registered with us",
        });
      }

      // Geocode the customer's address
      const fullAddress = `${delivery_address}, ${city}, ${state}, ${country}`;
      const { latitude, longitude } = await geocodeAddress(fullAddress);

      // Ensure latitude and longitude are present
      if (!latitude || !longitude) {
        throw new APIError({
          status: httpStatus.BAD_REQUEST,
          message: "Unable to geocode the provided address",
        });
      }

      // Create customer with geolocation data.
      customer = await customerModel.create({
        ...req.body,
        coordinates: { type: "Point", coordinates: [longitude, latitude] },
      });

      const code = config.IS_PRODUCTION_OR_STAGING ? generateOTP() : config.DEFAULT_OTP_CODE;

      await SessionModel.findOneAndUpdate(
        { user_id: customer._id },
        { otp: { code } },
        { upsert: true, new: true }
      );

      EmailService.sendMail({
        to: email,
        subject: "Verify Your Account",
        html: EmailTemplate.signupMessageTemplate(code),
      });

      // Create and save default shipping address
      const newAddress = new ShippingAddress({
        customer: customer._id,
        full_name,
        first_name,
        last_name,
        phone_number,
        delivery_address,
        state,
        city,
        country,
        coordinates: { type: "Point", coordinates: [longitude, latitude] },
      });

      await newAddress.save();

      return res
        .status(httpStatus.CREATED)
        .json(sendResponse({ message: "success", status: httpStatus.CREATED }));
    } catch (error) {
      next(error);
    }
  };

  // End Method

  /**
   * Route: POST: /auth/customer/signin
   * @async
   * @method signinCustomer
   * @description signin to customers account
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof CustomerAuthController
   */

  signinCustomer = async (req, res, next) => {
    try {
      const { password, email } = req.body;

      const customer = await customerModel
        .findOne({
          email,
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

      const isCorrect = customer.isPasswordCorrect(password);

      if (!isCorrect) {
        throw new APIError({
          status: httpStatus.BAD_REQUEST,
          message: "Invalid, email or password",
        });
      }

      if (!customer.is_verified) {
        const code = config.IS_PRODUCTION_OR_STAGING ? generateOTP() : config.DEFAULT_OTP_CODE;

        await SessionModel.findOneAndUpdate(
          { user_id: customer._id },
          { otp: { code } },
          { upsert: true }
        );

        EmailService.sendMail({
          to: email,
          subject: "Verify Your Account",
          html: EmailTemplate.signupMessageTemplate(code),
        });

        throw new APIError({
          status: httpStatus.BAD_REQUEST,
          message: "verify your account",
        });
      }

      const session = await customer.getSession();

      // Log the token expiry and access token
      console.log("ACCESS_TOKEN_EXPIRY:", config.ACCESS_TOKEN_EXPIRY);
      console.log("Generated Access Token:", session.access_token);

      await SessionModel.findOneAndUpdate(
        { user_id: customer._id },
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
   * Route: POST: /auth/customer/verify-otp
   * @async
   * @method verifyCustomerOtp
   * @description verify customers otp
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof CustomerAuthController
   */

  verifyCustomerOtp = async (req, res, next) => {
    try {
      const { otp, email } = req.body;

      const customer = await customerModel.findOne({ email }).orFail(
        new APIError({
          message: "Account does not exist",
          status: httpStatus.BAD_REQUEST,
        })
      );

      const session = await SessionModel.findOne({
        user_id: customer._id,
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

      await Promise.all([
        customerModel.findOneAndUpdate({ email }, { is_verified: true }),
        SessionModel.findOneAndUpdate({ user_id: customer._id }, { otp: null }),
      ]);

      const payload = {
        user_id: customer._id,
        type: NotificationType.SIGNUP,
        title: NotificationMessageType.SIGNUP,
        message: "You have successfully signup on Palparcel",
        full_name: customer.full_name,
      };

      await NotificationModel.createNotification(payload);

      return res
        .status(httpStatus.OK)
        .json(sendResponse({ status: httpStatus.OK, message: "Verified successfully" }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Route: POST: /auth/customer/forgot-password
   * @async
   * @method forgotCustomerPassword
   * @description reset customer password
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof CustomerAuthController
   */

  forgotCustomerPassword = async (req, res, next) => {
    try {
      const { email } = req.body;

      const customer = await customerModel.findOne({ email }).orFail(
        new APIError({
          message: "Account not registered with us, please signup",
          status: httpStatus.BAD_REQUEST,
        })
      );

      const code = config.IS_PRODUCTION_OR_STAGING ? generateOTP() : config.DEFAULT_OTP_CODE;

      await SessionModel.findOneAndUpdate(
        { user_id: customer._id },
        { otp: { code } },
        { upsert: true }
      );

      const verify_token = await cryptoRandomString.cryptoRandomString(12);

      await customerModel.findOneAndUpdate(
        { email },
        { verify_token: { code: verify_token, user_id: customer._id } },
        { upsert: true }
      );

      EmailService.sendMail({
        to: email,
        subject: "Reset Your Password",
        html: EmailTemplate.forgotPassword(code, verify_token, String(customer._id)),
      });

      return res
        .status(httpStatus.CREATED)
        .json(sendResponse({ message: "success", status: httpStatus.CREATED }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Route: POST: /auth/customer/reset-password
   * @async
   * @method resetCustomerPassword
   * @description reset customer password
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof CustomerAuthController
   */

  resetCustomerPassword = async (req, res, next) => {
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

      const customer = await customerModel
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
        to: customer.email,
        subject: "Password reset successful",
        html: EmailTemplate.successMessage("Your password has been reset successfully"),
      });

      return res
        .status(httpStatus.CREATED)
        .json(sendResponse({ message: "Password reset successful", status: httpStatus.OK }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Route: POST: /auth/customer/change-password
   * @async
   * @method changeCustomerPassword
   * @description reset customer password
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof CustomerAuthController
   */

  changeCustomerPassword = async (req, res, next) => {
    try {
      const { user } = getSession();
      const { password, new_password } = req.body;

      const customer = await customerModel
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

      const isCorrect = customer.isPasswordCorrect(password);

      if (!isCorrect) {
        throw new APIError({
          status: httpStatus.BAD_REQUEST,
          message: "Invalid, email or password",
        });
      }

      await customerModel
        .findOneAndUpdate({ _id: customer._id }, { password: new_password })
        .orFail(
          new APIError({
            status: httpStatus.BAD_REQUEST,
            message: "Cannot change password",
          })
        );

      EmailService.sendMail({
        to: customer.email,
        subject: "Password reset successful",
        html: EmailTemplate.successMessage("Your password has been reset successfully"),
      });

      return res
        .status(httpStatus.CREATED)
        .json(sendResponse({ message: "Password reset successful", status: httpStatus.OK }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Route: POST: /auth/customer/refresh-token
   * @async
   * @method refreshToken
   * @description refresh user expired access token
   * @param {Request} _req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof CustomerAuthController
   */
  refreshToken = async (_req, res, next) => {
    try {
      const { user } = getSession();
      const session = await user.getSession();

      return res
        .status(httpStatus.OK)
        .json(sendResponse({ payload: session, message: "success", status: httpStatus.OK }));
    } catch (error) {
      return next(error);
    }
  };

  /**
   * Route: POST: /auth/signout
   * @async
   * @method signout
   * @description invalidates a user session
   * @param {Request} _req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof CustomerAuthController
   */
  signout = async (_req, res, next) => {
    try {
      const { user_id } = getSession();

      await SessionModel.findOneAndUpdate({ user_id }, { access_token: null, refresh_token: null });

      return res
        .status(httpStatus.OK)
        .json(sendResponse({ message: "success", status: httpStatus.OK }));
    } catch (error) {
      return next(error);
    }
  };

  /**
   * Route: POST: /auth/signout
   * @async
   * @method deleteAddress
   * @description invalidates a user session
   * @param {Request} _req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof CustomerAuthController
   */
  deleteAddress = async (req, res, next) => {
    try {
      const { user } = getSession();
      const { delivery_address } = req.body;

      await customerModel
        .findOneAndUpdate(
          { _id: user._id, billing_address: { $elemMatch: { $eq: delivery_address } } },
          { $pull: { billing_address: delivery_address } }
        )
        .orFail(
          new APIError({
            status: httpStatus.BAD_REQUEST,
            message: "Cannot delete address",
          })
        );

      return res
        .status(httpStatus.OK)
        .json(sendResponse({ message: "success", status: httpStatus.OK }));
    } catch (error) {
      return next(error);
    }
  };

  /**
   * Route: POST: /auth/customer/update-customer
   * @async
   * @method updateCustomer
   * @description invalidates a user session
   * @param {Request} _req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof CustomerAuthController
   */
  updateCustomer = async (req, res, next) => {
    const { user } = getSession();

    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return next(err);
      }

      const {
        full_name,
        first_name,
        last_name,
        phone_number,
        gender,
        country,
        state,
        city,
        delivery_address,
      } = fields;
      const image = files.images;
      let image_url = "";

      try {
        cloudinary.config({
          cloud_name: process.env.cloud_name,
          api_key: process.env.api_key,
          api_secret: process.env.api_secret,
          secure: true,
        });

        if (!image) {
          image_url = user.image_url || "";
        } else {
          const updatedImageUrl = await cloudinary.uploader.upload(image.filepath, {
            folder: "customers",
          });
          image_url = updatedImageUrl.url;
        }

        // Geocode the customer's address
        const fullAddress = `${delivery_address}, ${city}, ${state}, ${country}`;
        const { latitude, longitude } = await geocodeAddress(fullAddress);

        // Ensure latitude and longitude are present
        if (!latitude || !longitude) {
          throw new APIError({
            status: httpStatus.BAD_REQUEST,
            message: "Unable to geocode the provided address",
          });
        }

        const customer = await customerModel
          .findOneAndUpdate(
            { _id: user._id },
            {
              full_name,
              first_name,
              last_name,
              phone_number,
              gender,
              image_url,
              coordinates: { type: "Point", coordinates: [longitude, latitude] },
            },
            { upsert: true, new: true }
          )
          .orFail(
            new APIError({
              message: "cannot update details",
              status: httpStatus.NOT_MODIFIED,
            })
          );

        const payload = _.pick(customer, [
          "full_name",
          "first_name",
          "last_name",
          "phone_number",
          "gender",
          "image_url",
          "coordinates",
        ]);

        return res
          .status(httpStatus.OK)
          .json(sendResponse({ message: "success", payload, status: httpStatus.OK }));
      } catch (error) {
        return next(error);
      }
    });
  };

  /**
   * Route: POST: /auth/customer/upload-image
   * @async
   * @method uploadCustomerImage
   * @description invalidates a user session
   * @param {Request} _req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof CustomerAuthController
   */
  uploadCustomerImage = async (req, res, next) => {
    const { user } = getSession();

    const customerExist = await customerModel.findOne({ _id: user._id }).orFail(
      new APIError({
        message: "Invalid Request",
        status: httpStatus.BAD_REQUEST,
      })
    );

    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return next(err);
      }

      const image = files.images;

      if (!image) {
        return next(new Error("No image found in the request."));
      }

      try {
        cloudinary.config({
          cloud_name: process.env.cloud_name,
          api_key: process.env.api_key,
          api_secret: process.env.api_secret,
          secure: true,
        });

        let image_url = await cloudinary.uploader.upload(image.filepath, {
          folder: "customers",
        });

        await customerModel.findOneAndUpdate(
          { _id: customerExist._id },
          { image_url: image_url.url },
          { upsert: true }
        );

        return res
          .status(httpStatus.OK)
          .json(sendResponse({ message: "success", status: httpStatus.OK }));
      } catch (error) {
        return next(error);
      }
    });
  };

  /**
   * Route: GET: /customer/customer-profile
   * @async
   * @method getCustomerProfile
   * @description invalidates a user session
   * @param {Request} _req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof CustomerAuthController
   */
  getCustomerProfile = async (_req, res, next) => {
    try {
      const { user } = getSession();

      const customer = await customerModel.findOne({ _id: user._id }).orFail(
        new APIError({
          message: "Invalid Request",
          status: httpStatus.BAD_REQUEST,
        })
      );

      const payload = _.pick(customer, [
        "role",
        "note",
        "email",
        "state",
        "gender",
        "country",
        "image_url",
        "full_name",
        "is_verified",
        "phone_number",
        "shipping_address",
        "billing_address",
      ]);

      return res
        .status(httpStatus.OK)
        .json(sendResponse({ message: "success", payload, status: httpStatus.OK }));
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = new CustomerAuthController();
