const httpStatus = require("http-status");
const { TokenExpiredError } = require("jsonwebtoken");

const { Role } = require("../utiles/typings");
const AdminModel = require("../models/adminModel");
const SellerModel = require("../models/sellerModel");
const authService = require("../service/auth.service");
const { setSession } = require("../utiles/use_session");
const CustomerModel = require("../models/customerModel");
const SessionModel = require("../models/session.models");
const { sendResponse } = require("../utiles/send_response");

/**
 *
 * @class
 * @extends AuthPolicyInterface
 * @classdesc Authenticate users, admins and super admins middleware
 * @description App authentication policy controller
 * @name AuthController
 *
 */

class AuthPolicy {
  /**
   * Function representing the Authorization check for authenticated users
   * @method hasAccessToken
   * @description Authenticate users, admins and super admins middleware who has valid access_token
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction function
   * @returns {ExpressResponseInterface} {ExpressResponseInterface} Returns the Response object containing token field with the verified token assigned to the user
   * @memberof AuthPolicyInterface
   */

  static async hasAccessToken(req, res, next) {
    const access_token = req?.header("Authorization");

    const [bearer, signature] = access_token?.split(" ") || [];

    if (signature && bearer === "Bearer") {
      try {
        const token = await authService.verifyAccessToken(signature);

        const filter = {
          _id: token?.aud,
          is_deleted: false,
          is_verified: true,
          email: token?.email,
          is_account_suspended: false,
        };
        let user;

        if (token.role === Role.USER) {
          user = await CustomerModel.findOne(filter).orFail(new Error("Invalid Token"));
        }

        if (token.role === Role.VENDOR) {
          user = await SellerModel.findOne(filter).orFail(new Error("Invalid Token"));
        }

        if (token.role === Role.ADMIN) {
          user = await AdminModel.findOne({ _id: token?.aud, email: token?.email }).orFail(
            new Error("Invalid Token")
          );
        }

        const session = await SessionModel.findOne({ access_token, user_id: token?.aud }).orFail(
          new Error("Invalid Token")
        );

        setSession({ ...token, ...session?.toJSON(), ...user.toJSON(), user, session });



        return next?.();
      } catch (error) {
        const message = `${error instanceof TokenExpiredError ? "Expired" : "Invalid"} token`;
        return res
          .status(httpStatus.UNAUTHORIZED)
          .json(sendResponse({ message, status: httpStatus.UNAUTHORIZED }));
      }
    }

    return res
      .status(httpStatus.UNAUTHORIZED)
      .json(sendResponse({ message: "No Token found", status: httpStatus.UNAUTHORIZED }));
  }

  /**
   * Function representing the Authorization token refresher for unauthorized users
   * @method hasRefreshToken
   * @description Refresh users access_token middleware
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction function
   * @returns {ExpressResponseInterface} {ExpressResponseInterface} Returns the Response object containing token field with the refreshed token assigned to the user
   * @memberof AuthPolicyInterface
   */
  static async hasRefreshToken(req, res, next) {
    const { refresh_token } = req.body;

    try {
      const token = await authService.verifyRefreshToken(refresh_token);

      const filter = {
        _id: token?.aud,
        is_deleted: false,
        email: token?.email,
        is_account_suspended: false,
      };

      let user;

      if (token.role === Role.USER) {
        user = await CustomerModel.findOne(filter).orFail(new Error("Invalid Token"));
      }

      if (token.role === Role.VENDOR) {
        user = await SellerModel.findOne(filter).orFail(new Error("Invalid Token"));
      }

      if (token.role === Role.ADMIN) {
        user = await AdminModel.findOne({ _id: token?.aud, email: token?.email }).orFail(
          new Error("Invalid Token")
        );
      }

      const session = await SessionModel.findOne({
        user_id: token?.aud,
        refresh_token: { $ne: null },
      }).orFail(new Error("Invalid Token"));

      if (refresh_token !== session?.refresh_token) {
        throw new Error("Invalid Token");
      }

      setSession({ ...token, ...session?.toJSON(), ...user.toJSON(), user, session });

      return next();
    } catch (error) {
      const message = `${error instanceof TokenExpiredError ? "Expired" : "Invalid"} token`;
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json(sendResponse({ message, status: httpStatus.UNAUTHORIZED }));
    }
  }
}

/**
 * Function representing the Authorization token checker for magic link users
 * @method hasMagicLinkToken
 * @description Authenticate users who have valid magic_token from magic link
 * @param {string} magic_token - HTTP Request object
 * @returns {Promise<Object>} Returns the Response object containing token field with the refreshed token assigned to the user
 * @memberof AuthPolicyInterface
 */
hasMagicLinkToken = async (magic_token) => {
  try {
    return await authService.verifyMagicToken(magic_token);
  } catch (error) {
    throw new APIError({
      status: httpStatus.UNAUTHORIZED,
      message: `${error instanceof TokenExpiredError ? "Expired" : "Invalid"} token`,
    });
  }
};

module.exports = AuthPolicy;
