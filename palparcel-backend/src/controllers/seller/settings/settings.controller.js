const { responseReturn } = require("../../../utiles/response");
const sellerModel = require("../../../models/sellerModel");
const sellerWallet = require("../../../models/sellerWallet");
const bankModel = require ("../../../models/bankModel")
const User = require("../../../models/customerModel");
const { getSession } = require("../../../utiles/use_session");
const ActivityLog = require("../../../models/activityLog.model");
const _ = require("lodash");
const {
  mongo: { ObjectId },
} = require("mongoose");

class settingsController {
  /**
   * Route: PATCH: /update/
   * @async
   * @method updateProfile
   * @description update profile
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof settingsController
   */
  updateProfile = async (req, res, next) => {
    try {
      const { user } = getSession();

      const updateData = _.pick(req.body, [
        "first_name",
        "last_name",
        "email",
        "phone_number",
        "address",
        "website",
        "business_reg_number",
        "store_name",
        "store_image",
        "operation_type",
        "description",
        "plan_type"
      ]);

      const bankUpdateData = _.pick(req.body, [
        "bank_name",
        "account_number",
        "account_name",
      ]);

      const updatedSeller = await sellerModel.findOneAndUpdate(
        { _id: user._id },
        updateData,
        { new: true }
      );

      if (!updatedSeller) {
        return res.status(404).json({ message: "Seller not found" });
      }

      // Update or create bank details if provided
      if (Object.keys(bankUpdateData).length > 0) {
        const updatedBank = await bankModel.findOneAndUpdate(
          { seller_id: user._id },
          bankUpdateData,
          { new: true, upsert: true }
        );

        if (!updatedBank) {
          return res.status(400).json({ message: "Bank details update failed" });
        }
      }


      responseReturn(res, 200, {
        message: "Profile updated successfully",
        data: {
          updatedSeller,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Route: PUT: /update/
   * @async
   * @method updateNotificationSettings
   * @description update notification
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof settingsController
   */
  updateNotificationSettings = async (req, res, next) => {
    try {
      const { user_id } = getSession();

      const { notifications } = req.body;

      if (!Array.isArray(notifications) || notifications.length === 0) {
        return res.status(400).json({ message: "Invalid notification settings" });
      }

      const updateNotification = await sellerModel.findOneAndUpdate(
        { _id: user_id },
        { $set: { notifications: notifications } },
        { new: true }
      );

      responseReturn(res, 200, {
        message: "Notification settings updated successfully",
        data: {
          updateNotification,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Route: PATCH: /update/
   * @async
   * @method updatePassword
   * @description update password
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof settingsController
   */
  updatePassword = async (req, res, next) => {
    try {
      const { user_id } = getSession();
      const seller = await sellerModel.findOne({ _id: user_id }).select("+password");

      if (!seller) {
        return res.status(404).json({ message: "Seller not found" });
      }

      const isPasswordCorrect = await seller.isPasswordCorrect(
        req.body.passwordCurrent,
        seller.password
      );

      if (!isPasswordCorrect) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      seller.password = req.body.password;
      seller.passwordConfirm = req.body.passwordConfirm;
      await seller.save();

      responseReturn(res, 200, {
        message: "Password updated successfully",
        data: {
          seller,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Route: PUT: /update/
   * @async
   * @method updateTransactionPin
   * @description update pin
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof settingsController
   */
  updateTransactionPin = async (req, res, next) => {
    try {
      const { user_id } = getSession();
      const { transactionPin } = req.body;

      if (!transactionPin || typeof transactionPin !== "string" || transactionPin.length < 4) {
        return res.status(400).json({ message: "Invalid transaction pin" });
      }

      const setPin = await sellerWallet.findOneAndUpdate({ sellerId: user_id }, { transactionPin });

      responseReturn(res, 200, {
        message: "Transaction pin updated successfully",
        data: {
          setPin,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Route: GET: /get-logs/
   * @async
   * @method getActivityLog
   * @description get activity logs
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof settingsController
   */
  getActivityLog = async (req, res, next) => {
    try {
      const { user_id } = getSession();

      const logs = await ActivityLog.find({ _id: user_id });
      responseReturn(res, 200, {
        message: "Activity logs fetched successfully",
        data: {
          logs,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /////////////***** NOT DONE YET  ****/////
  createSubRole = async (req, res) => {
    const id = req.params.id;
    const { subRoleData } = req.body;

    try {
      const seller = await sellerModel.findById(id);
      if (!seller) {
        return res.status(404).json({ message: "Seller not found" });
      }

      const user = new User({
        full_name: subRoleData.user.full_name,
        email: subRoleData.user.email,
        password: subRoleData.user.password,
        role: "SUB_VENDOR",
        phone_number: subRoleData.user.phone_number,
      });

      await user.save();

      const subRole = {
        name: subRoleData.name,
        permissions: subRoleData.permissions,
        userId: user._id,
      };

      seller.sub_roles.push(subRole);
      await user.save();

      const filteredUserDetails = {
        full_name: user.full_name,
        email: user.email,
        password: subRoleData.user.password,
        phone_number: user.phone_number,
        sub_roles: [subRole],
      };

      responseReturn(res, 201, {
        message: "Sub-role created successfully",
        data: filteredUserDetails,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  updateSubRole = async (req, res) => {
    const { id } = getSession();
    const { subRoleId } = req.params;
    const updateData = req.body;

    try {
      const seller = await sellerModel.findById(id);
      if (!seller) {
        return res.status(404).json({ message: "Seller not found" });
      }

      const subRole = seller.sub_roles.id(subRoleId);
      if (!subRole) {
        return res.status(404).json({ message: "Sub-role not found" });
      }

      Object.assign(subRole, updateData);
      await seller.save();

      responseReturn(res, 200, {
        message: "Sub-role updated successfully",
        data: {
          seller,
        },
      });
    } catch (error) {
      res.status = (500).json({ message: error.message });
    }
  };

  manageSubRoleStatus = async (req, res) => {
    const { id } = getSession();
    const { subRoleId } = req.params;
    const { action } = req.body;

    try {
      const seller = await sellerModel.findById(id);
      if (!seller) {
        return res.status(404).json({ message: "Seller not found" });
      }

      const subRole = seller.sub_roles.id(subRoleId);
      if (!subRole) {
        return res.status(404).json({ message: "Sub-role not found" });
      }

      if (action === "activate") {
        subRole.is_active = true;
      } else if (action === "suspend") {
        subRole.is_suspended = true;
      } else if (action === "deactivate") {
        subRole.is_active = false;
      }

      await seller.save();
      responseReturn(res, 200, {
        message: "Sub-role status updated successfully",
        data: {
          seller,
        },
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
}

module.exports = new settingsController();
