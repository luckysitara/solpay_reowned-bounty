const jwt = require("jsonwebtoken");

const { envVariables: config } = require("../config");

/**
 *
 * @class AuthService
 * @extends AuthServiceInterface
 * @classdesc Class representing the auth service
 * @description User authentication service class
 * @name ErrorService
 * @exports AuthServiceInterface
 */

class AuthService {
  /**
   * @method issueAccessToken
   * @param {Partial<UserInterface>} payload - user payload object
   * @returns {Promise<string>} Returns the signed encrypted user issued object as string
   */
  static issueAccessToken({ id, role, email }) {
    return new Promise((resolve, reject) =>
      jwt.sign(
        { email, role },
        config.ACCESS_TOKEN_SECRET,
        { expiresIn: config.ACCESS_TOKEN_EXPIRY, issuer: "PalParcel.com", audience: id },
        (error, access_token) => {
          if (error) return reject(error);
          return resolve(`Bearer ${access_token}`);
        }
      )
    );
  }

  /**
   * @method issueRefreshToken
   * @param {Partial<UserInterface>} payload - user payload object
   * @returns {Promise<string>} Returns the a newly signed encrypted user issued object as string
   */
  static issueRefreshToken({ id, role, email }) {
    return new Promise((resolve, reject) =>
      jwt.sign(
        { email, role },
        config.REFRESH_TOKEN_SECRET,
        { expiresIn: config.REFRESH_TOKEN_EXPIRY, issuer: "PalParcel.com", audience: id },
        (error, refresh_token) => {
          if (error) return reject(error);
          resolve(`Bearer ${refresh_token}`);
        }
      )
    );
  }

  /**
   * @method issueMagicToken
   * @param {string} id - user id
   * @returns {Promise<Object>} Returns the a newly signed encrypted user issued object as string
   */
  static issueMagicToken = (id) => {
    return new Promise((resolve, reject) => {
      jwt.sign(
        {},
        config.MAGIC_TOKEN_SECRET,
        { expiresIn: config.MAGIC_TOKEN_EXPIRY, issuer: "palparcel.com", audience: id },
        (error, magic_token) => {
          if (error) return reject(error);
          resolve({ magic_token: magic_token });
        }
      );
    });
  };

  /**
   * @method verifyAccessToken
   * @param {string} access_token - user token issued string
   * @returns {Promise<JwtPayload | undefined>} Returns the verified decrypted user issued object
   */
  static verifyAccessToken(access_token) {
    return new Promise((resolve, reject) =>
      jwt.verify(access_token, config.ACCESS_TOKEN_SECRET, (error, decoded) => {
        if (error) return reject(error);
        return resolve(decoded);
      })
    );
  }

  /**
   * @method verifyRefreshToken
   * @param {string} refresh_token - user refresh token issued string
   * @returns {Promise<JwtPayload | undefined>} Returns the verified decrypted user issued object
   */
  static verifyRefreshToken(refresh_token) {
    return new Promise((resolve, reject) =>
      jwt.verify(refresh_token, config.REFRESH_TOKEN_SECRET, (error, decoded) => {
        if (error) return reject(error);
        return resolve(decoded);
      })
    );
  }

  /**
   * @method verifyMagicToken
   * @param {string} verify_token - user verify_token token issued string
   * @returns {Promise<Object | undefined>} Returns the verified decrypted user issued object
   */
  verifyMagicToken = (verify_token) => {
    return new Promise((resolve, reject) => {
      jwt.verify(verify_token, config.MAGIC_TOKEN_SECRET, (error, decoded) => {
        if (error) return reject(error);
        return resolve(decoded);
      });
    });
  };
}

module.exports = AuthService;
