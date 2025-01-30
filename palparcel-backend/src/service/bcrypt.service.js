const bcrypt = require("bcryptjs");
const { envVariables: config } = require("../config");

/**
 *
 * @class BcryptService
 * @classdesc Class representing user password encryption and decryption service
 * @description User password encryption and decryption service class
 * @name BcryptService
 * @exports BcryptService
 */

class BcryptService {
  /**
   * @method hashPassword
   * @param {string} password - user registration password
   * @returns {Promise<string>} Returns the signed encrypted user password
   */
  static async hashPassword(password) {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hash(password, salt);
  }

  /**
   * @method hashPin
   * @param {string} transactionPin- user transaction pin
   * @returns {Promise<string>} Returns the signed encrypted user pin
   */
  static async hashPin(transactionPin) {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hash(transactionPin, salt);
  }

  /**
   * @method comparePassword
   * @param {string} password - user registered password
   * @param {string} hash - user encrypted registration password
   * @returns {boolean} Returns boolean if the both the registration password and encrypted password matches after decrypting it
   */
  static comparePassword(password, hash) {
    return bcrypt.compareSync(password, hash);
  }

  /**
   * @method comparePin
   * @param {string} transactionPin - user registered pin
   * @param {string} hash - user encrypted registration pin
   * @returns {boolean} Returns boolean if the both the transaction pin and encrypted pin matches after decrypting it
   */
  static comparePassword(transactionPin, hash) {
    return bcrypt.compareSync(transactionPin, hash);
  }
}

module.exports = BcryptService;
