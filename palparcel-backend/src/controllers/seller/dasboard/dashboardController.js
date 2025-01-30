const { responseReturn } = require("../../../utiles/response");
const productModel = require("../../../models/productModel");
const sellerWallet = require("../../../models/sellerWallet");
const Seller = require("../../../models/sellerModel");
const authOrder = require("../../../models/authOrder");
const bannerModel = require("../../../models/bannerModel");
const cryptoRandomString = require("../../../utiles/cryptoRandomString");
const PaymentService = require("../../../service/payment.service");
const { PlanType } = require("../../../utiles/typings");
const _ = require("lodash")
const {
  mongo: { ObjectId },
} = require("mongoose");
const cloudinary = require("cloudinary").v2;
const formidable = require("formidable");
const { getSession } = require("../../../utiles/use_session");

class dashboardController {
  /** SELLER DASHBOARD */
  /**
   * Route: GET: /dashboard/vendors
   * @async
   * @method get_seller_dashboard_data
   * @description get dashboard data
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof dashboardController
   */
  get_seller_dashboard_data = async (req, res, next) => {
    try {
      const { user } = getSession();
      const seller = await Seller.findById(user._id);

      // Check if the seller has a plan type
      if (seller.plan_type === PlanType.NONE) {
        return res.status(400).json({
          message: "Please select a plan type",
        });
      }

      const totalSale = await sellerWallet.aggregate([
        {
          $match: {
            sellerId: {
              $eq: user._id,
            },
          },
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" },
          },
        },
      ]);

      const totalProduct = await productModel
        .find({
          sellerId: new ObjectId(user._id),
        })
        .countDocuments();

      const totalOrder = await authOrder
        .find({
          sellerId: new ObjectId(user._id),
        })
        .countDocuments();

      const totalPendingOrder = await authOrder
        .find({
          $and: [
            {
              sellerId: {
                $eq: new ObjectId(user._id),
              },
            },
            {
              delivery_status: {
                $eq: "pending",
              },
            },
          ],
        })
        .countDocuments();

      const recentOrders = await authOrder
        .find({
          sellerId: new ObjectId(user._id),
        })
        .limit(5);

      responseReturn(res, 200, {
        totalProduct,
        totalOrder,
        totalPendingOrder,
        recentOrders,
        totalSale: totalSale.length > 0 ? totalSale[0].totalAmount : 0,
      });
    } catch (error) {
      next(error);
    }
  };
  //end Method

   /**  SELECT PLAN TYPE */
  /**
   * Route: POST: /dashboard/PLAN TYPE
   * @async
   * @method select_plan_type
   * @description select plan type
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof dashboardController
   */
  select_plan_type = async (req, res, next) => {
    try {
      const { user_id } = getSession();
      const { plan_type } = req.body;

      if (!plan_type || ![PlanType.COMMISSION, PlanType.SUBSCRIPTION].includes(plan_type)) {
        return res.status(400).json({
          message: "Select a pricing model",
        });
      }

      const seller = await Seller.findOne({ _id: user_id });

      if (!seller) {
        return res.status(404).json({ message: "Seller not found" });
      }

      seller.plan_type = plan_type;
      await seller.save();

      // Add payment gateway customer code if required
      const sellerDetails = _.pick(seller, [
        "first_name",
        "last_name",
        "phone_number",
        "email",
        "_id",
      ]);
      const response = await PaymentService.createSubscriptionCustomer(sellerDetails);

      await Seller.findOneAndUpdate(
        { email: seller.email, _id: seller._id },
        {
          $set: { "payment_gateway.customer_code": response.customer_code },
        },
        { new: true }
      );

      responseReturn(res, 200, {
        message: `Plan type ${plan_type} selected successfully`,
        plan_type: seller.plan_type,
      });
    } catch (error) {
      next(error);
    }
  };

  //////////////////////////////////////////////
  ///////////////NOT IN USE ///////////////////
  add_banner = async (req, res) => {
    const form = formidable({ multiples: true });
    form.parse(req, async (err, field, files) => {
      const { productId } = field;
      const { mainban } = files;

      cloudinary.config({
        cloud_name: process.env.cloud_name,
        api_key: process.env.api_key,
        api_secret: process.env.api_secret,
        secure: true,
      });

      try {
        const { slug } = await productModel.findById(productId);
        const result = await cloudinary.uploader.upload(mainban.filepath, {
          folder: "banners",
        });
        const banner = await bannerModel.create({
          productId,
          banner: result.url,
          link: slug,
        });
        responseReturn(res, 200, { banner, message: "Banner Add Success" });
      } catch (error) {
        responseReturn(res, 500, { error: error.message });
      }
    });
  };
  //end Method

  get_banner = async (req, res) => {
    const { productId } = req.params;
    try {
      const banner = await bannerModel.findOne({
        productId: new ObjectId(productId),
      });
      responseReturn(res, 200, { banner });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };
  //end Method

  update_banner = async (req, res) => {
    const { bannerId } = req.params;
    const form = formidable({});

    form.parse(req, async (err, _, files) => {
      const { mainban } = files;

      cloudinary.config({
        cloud_name: process.env.cloud_name,
        api_key: process.env.api_key,
        api_secret: process.env.api_secret,
        secure: true,
      });

      try {
        let banner = await bannerModel.findById(bannerId);
        let temp = banner.banner.split("/");
        temp = temp[temp.length - 1];
        const imageName = temp.split(".")[0];
        await cloudinary.uploader.destroy(imageName);

        const { url } = await cloudinary.uploader.upload(mainban.filepath, {
          folder: "banners",
        });

        await bannerModel.findByIdAndUpdate(bannerId, {
          banner: url,
        });

        banner = await bannerModel.findById(bannerId);
        responseReturn(res, 200, { banner, message: "Banner Updated Success" });
      } catch (error) {
        responseReturn(res, 500, { error: error.message });
      }
    });
  };
  //end Method

  get_banners = async (req, res) => {
    try {
      const banners = await bannerModel.aggregate([
        {
          $sample: {
            size: 5,
          },
        },
      ]);
      responseReturn(res, 200, { banners });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };
  //end Method
}

module.exports = new dashboardController();
