const _ = require("lodash");
const dayjs = require("dayjs");
const formidable = require("formidable");
const httpStatus = require("http-status");
const cloudinary = require("cloudinary").v2;

const Seller = require("../../../models/sellerModel");
const { NotificationType, NotificationMessageType } = require("../../../utiles/typings");
const NotificationModel = require("../../../models/Notification.model");
const APIError = require("../../../utiles/api.error");
const { PlanType } = require("../../../utiles/typings");
const adminModel = require("../../../models/adminModel");
const EmailTemplate = require("../../../template/index");
const { envVariables: config } = require("../../../config");
const SellerWallet = require("../../../models/sellerWallet");
const SessionModel = require("../../../models/session.models");
const { createToken } = require("../../../utiles/tokenCreate");
const { responseReturn } = require("../../../utiles/response");
const EmailService = require("../../../service/email.service");
const { generateOTP } = require("../../../utiles/generate_otp");
const { sendResponse } = require("../../../utiles/send_response");
const PaymentService = require("../../../service/payment.service");
const cryptoRandomString = require("../../../utiles/cryptoRandomString");
const geocoder = require("../../../utiles/nodeGeocoder");

class AuthControllers {
  // SELLER SIGNUP
  seller_register = async (req, res, next) => {
    try {
      const { email, password, address, city, country, state } = req.body;

      if (password !== req.body.password_confirm) {
        return res.status(httpStatus.BAD_REQUEST).json({
          message: "Password and confirm password does not match",
        });
      }

      let seller = await Seller.findOne({ email });
      if (seller) {
        return res.status(httpStatus.BAD_REQUEST).json({
          message: "Account already registered with us",
        });
      }

      // Use Google Geocoding to get coordinates based on the address
      const fulAddress = `${address}, ${state}, ${city}, ${country}`
      const geoData = await geocoder.geocode(fulAddress);
      if (!geoData || geoData.length === 0) {
        return res.status(httpStatus.BAD_REQUEST).json({
          message: "Unable to geocode the address",
        });
      }

      const coordinates = [geoData[0].longitude, geoData[0].latitude];

      // Create the new seller with the geocoded location
      seller = new Seller({
        ...req.body,
        startLocation: {
          type: "Point",
          coordinates,
          address: address,
          city: city,
          state: state,
          country: country,
          description: "Seller start location",
        },
      });

      await seller.save();

      const code = config.IS_PRODUCTION_OR_STAGING ? generateOTP() : config.DEFAULT_OTP_CODE;
      await SessionModel.findOneAndUpdate(
        { user_id: seller._id },
        { otp: { code } },
        { upsert: true }
      );

      EmailService.sendMail({
        to: email,
        subject: "Verify Your Account",
        html: EmailTemplate.signupMessageTemplate(code),
      });

      return res.status(httpStatus.CREATED).json({
        message: "success",
        status: httpStatus.CREATED,
      });
    } catch (error) {
      next(error);
    }
  };

  // SELLER LOGIN
  seller_login = async (req, res, next) => {
    try {
      const { password, email } = req.body;

      const seller = await Seller.findOne({
        email,
        is_deleted: false,
        is_verified: true,
        is_account_suspended: false,
      });

      const sellerWalletExists = await SellerWallet.findOne({ sellerId: seller._id });

      if (!sellerWalletExists) {
        await SellerWallet.create({ sellerId: seller._id });
      }
      if (!seller || !seller.isPasswordCorrect(password)) {
        throw new APIError({
          status: httpStatus.BAD_REQUEST,
          message: "Invalid, email or password",
        });
      }

      if (!seller.is_verified) {
        const code = config.IS_PRODUCTION_OR_STAGING ? generateOTP() : config.DEFAULT_OTP_CODE;
        await SessionModel.findOneAndUpdate(
          { user_id: seller?._id },
          { otp: { code } },
          { upsert: true }
        );

        EmailService.sendMail({
          to: email,
          subject: "Verify Your Account",
          html: EmailTemplate.signupMessageTemplate(code),
        });
      }

      const session = await seller.getSession();
      await SessionModel.findOneAndUpdate(
        { user_id: seller._id },
        { ..._.pick(session, ["refresh_token", "access_token"]), otp: null }
      );

      return res.status(httpStatus.OK).json({
        status: httpStatus.OK,
        payload: session,
        message: "successful",
      });
    } catch (error) {
      next(error);
    }
  };

  // SELLER VERIFY ACCOUNT
  /**
   * Route: POST:
   * @async
   * @method verifySellerOtp
   * @description add product was a card
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof AuthControllers
   */
  verifySellerOtp = async (req, res, next) => {
    try {
      const { otp, email } = req.body;
      const seller = await Seller.findOne({ email })
        .orFail(
          new APIError({
            message: "Account does not exist",
            status: httpStatus.BAD_REQUEST,
          })
        )
        .lean();

      const session = await SessionModel.findOne({
        user_id: seller._id,
        "otp.code": otp,
      }).orFail(
        new APIError({
          status: httpStatus.BAD_REQUEST,
          message: "OTP session doesn't exist or OTP is incorrect",
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
        Seller.findOneAndUpdate({ email }, { is_verified: true }),
        SessionModel.findOneAndUpdate({ user_id: seller._id }, { otp: null }),
      ]);

      const payload = {
        user_id: seller._id,
        type: NotificationType.SIGNUP,
        title: NotificationMessageType.SIGNUP,
        message: "You have successfully signup on Palparcel",
        first_name: seller.first_name,
        last_name: seller.last_name,
      };

      await NotificationModel.createNotification(payload);

      await Promise.all([SessionModel.findOneAndUpdate({ user_id: seller._id }, { otp: null })]);

      return res
        .status(httpStatus.OK)
        .json(sendResponse({ status: httpStatus.OK, message: "Verified successfully" }));
    } catch (error) {
      next(error);
    }
  };

  // SELLER FORGOT PASSWORD
  sellerForgotPassword = async (req, res, next) => {
    try {
      const { email } = req.body;

      const seller = await Seller.findOne({ email }).orFail(
        new APIError({
          message: "Account not registered with us, please signup",
          status: httpStatus.BAD_REQUEST,
        })
      );

      const code = generateOTP();
      await SessionModel.findOneAndUpdate(
        { user_id: seller._id },
        { otp: { code } },
        { upsert: true }
      );

      const verify_token = await cryptoRandomString.cryptoRandomString(12);

      await Seller.findOneAndUpdate(
        { email },
        { verify_token: { code: verify_token, user_id: seller._id } }
      );
      EmailService.sendMail({
        to: email,
        subject: "Reset Your Password",
        html: EmailTemplate.forgotPassword(code, verify_token, String(seller._id)),
      });

      return res
        .status(httpStatus.CREATED)
        .json(sendResponse({ message: "success", status: httpStatus.CREATED }));
    } catch (error) {
      next(error);
    }
  };

  // SELLER RESET PASSWORD
  resetSellerPassword = async (req, res, next) => {
    try {
      const { password, otp, verify_token, vendor_id } = req.body;

      const session = await SessionModel.findOne({
        vendor_id,
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

      const seller = await Seller.findOneAndUpdate(
        {
          "verify_token.vendor_id": vendor_id,
          "verify_token.code": verify_token,
        },
        { password, verify_token: {} }
      ).orFail(
        new APIError({
          status: httpStatus.BAD_REQUEST,
          message: "Invalid Verification details",
        })
      );

      EmailService.sendMail({
        to: seller.email,
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

  //UPDATE SELLER
  updateSeller = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { bank } = req.body;

      if (bank) {
        const { bank_name, account_number } = bank[0];
        verifyAccountNumber(bank_name, account_number, async (error, data) => {
          if (error) {
            return next(error);
          }

          req.body.bank[0].account_name = data.account_name;

          const seller = await Seller.findOneAndUpdate(
            { _id: id },
            { ...req.body },
            { new: true }
          ).orFail(
            new APIError({
              message: "Invalid Request",
              status: httpStatus.BAD_REQUEST,
            })
          );

          const payload = _.pick(seller, [
            "email",
            "store_image",
            "first_name",
            "last_name",
            "phone_number",
            "address",
            "country",
            "state",
          ]);

          return res
            .status(httpStatus.OK)
            .json(sendResponse({ message: "success", payload, status: httpStatus.OK }));
        });
      } else {
        const seller = await Seller.findOneAndUpdate(
          { _id: id },
          { ...req.body },
          { new: true }
        ).orFail(
          new APIError({
            message: "Invalid Request",
            status: httpStatus.BAD_REQUEST,
          })
        );

        const payload = _.pick(seller, [
          "email",
          "store_image",
          "first_name",
          "last_name",
          "phone_number",
          "address",
          "country",
          "state",
        ]);

        return res
          .status(httpStatus.OK)
          .json(sendResponse({ message: "success", payload, status: httpStatus.OK }));
      }
    } catch (error) {
      return next(error);
    }
  };

  // UPLOAD STORE IMAGE
  uploadStoreImage = async (req, res, next) => {
    const { id } = req.params;

    const sellerExist = await Seller.findOne({ _id: id }).orFail(
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
          folder: "vendors",
        });

        await Seller.findOneAndUpdate({ _id: sellerExist._id }, { store_image: image_url.url });

        return res
          .status(httpStatus.OK)
          .json(sendResponse({ message: "success", status: httpStatus.OK }));
      } catch (error) {
        return next(error);
      }
    });
  };
}

getUser = async (req, res) => {
  const { id, role } = req;

  try {
    if (role === "admin") {
      const user = await adminModel.findById(id);
      responseReturn(res, 200, { userInfo: user });
    } else {
      const seller = await Seller.findById(id);
      responseReturn(res, 200, { userInfo: seller });
    }
  } catch (error) {
    responseReturn(res, 500, { error: "Internal Server Error" });
  }
};

profile_image_upload = async (req, res) => {
  const { id } = req;
  const form = formidable({ multiples: true });
  form.parse(req, async (err, _, files) => {
    cloudinary.config({
      cloud_name: process.env.cloud_name,
      api_key: process.env.api_key,
      api_secret: process.env.api_secret,
      secure: true,
    });
    const { image } = files;

    try {
      const result = await cloudinary.uploader.upload(image.filepath, {
        folder: "profile",
      });
      if (result) {
        await Seller.findByIdAndUpdate(id, {
          image: result.url,
        });
        const userInfo = await Seller.findById(id);
        responseReturn(res, 201, {
          message: "Profile Image Upload Successfully",
          userInfo,
        });
      } else {
        responseReturn(res, 404, { error: "Image Upload Failed" });
      }
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  });
};

profile_info_add = async (req, res) => {
  const { division, district, shopName, sub_district } = req.body;
  const { id } = req;

  try {
    await Seller.findByIdAndUpdate(id, {
      shopInfo: {
        shopName,
        division,
        district,
        sub_district,
      },
    });
    const userInfo = await Seller.findById(id);
    responseReturn(res, 201, {
      message: "Profile info Add Successfully",
      userInfo,
    });
  } catch (error) {
    responseReturn(res, 500, { error: error.message });
  }
};

logout = async (req, res) => {
  try {
    res.cookie("accessToken", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });
    responseReturn(res, 200, { message: "logout Success" });
  } catch (error) {
    responseReturn(res, 500, { error: error.message });
  }
};

module.exports = new AuthControllers();
