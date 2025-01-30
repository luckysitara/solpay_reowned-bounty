const mongoose = require("mongoose");
const formidable = require("formidable");
const httpStatus = require("http-status");
const cloudinary = require("cloudinary").v2;
const { envVariables: config } = require("../../../config");
const APIError = require("../../../utiles/api.error");

const EmailTemplate = require("../../../template/index");
const SellerModel = require("../../../models/sellerModel");
const productModel = require("../../../models/productModel");
const { getSession } = require("../../../utiles/use_session");
const EmailService = require("../../../service/email.service");
const { responseReturn } = require("../../../utiles/response");
const { sendResponse } = require("../../../utiles/send_response");
const { PlanType } = require("../../../utiles/typings");

class productController {
  /**
   * Route: POST: /products/vendors
   * @async
   * @method add_product
   * @description add product
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof productController
   */
  add_product = async (req, res, next) => {
    const { user } = getSession();

    const seller = await SellerModel.findOne({ _id: user._id, is_verified: true }).orFail(
      new APIError({
        status: httpStatus.BAD_REQUEST,
        message: "Invalid Request",
      })
    );

    // check the plan type
    // if plan_type is COMMISSION, check for product length

    if (seller.plan_type === PlanType.COMMISSION) {
      const productCount = await productModel.countDocuments({ sellerId: seller._id });
      if (productCount > config.COMMISSION_PRODUCT_COUNT) {
        throw new APIError({
          status: httpStatus.BAD_REQUEST,
          message: "You have exceeded your maximum product upload",
        });
      }
    }

    const form = formidable({ multiples: true });

    form.parse(req, async (err, field, files) => {
      let { name, category, description, price, variation, ...rest } = field;
      const { images } = files;
      name = name.trim();

      cloudinary.config({
        cloud_name: process.env.cloud_name,
        api_key: process.env.api_key,
        api_secret: process.env.api_secret,
        secure: true,
      });

      try {
        let allImageUrl = [];
        for (let i = 0; i < images.length; i++) {
          const result = await cloudinary.uploader.upload(images[i].filepath, {
            folder: "products",
          });
          allImageUrl = [...allImageUrl, result.url];
        }

        const product = await productModel.create({
          sellerId: user._id,
          name,
          vendor_name: user.full_name,
          category: category.trim(),
          description: description.trim(),
          price: parseInt(price),
          variation: variation ? JSON.parse(variation) : {},
          images: allImageUrl,
          ...rest,
        });

        return res.status(httpStatus.OK).json(
          sendResponse({
            payload: product,
            status: httpStatus.OK,
            message: "Product Created Successfully",
          })
        );
      } catch (error) {
        next(error);
      }
    });
  };

  /// end method

  /**
   * Route: POST: /products/vendors
   * @async
   * @method sendForApproval
   * @description send product for approval
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof productController
   */

  sendForApproval = async (req, res, next) => {
    try {
      const { id } = req.params;
      const product = await productModel.findOne({ _id: id });

      if (!product) {
        responseReturn(res, 404, { error: "Product not found" });
      }

      const sellerId = new mongoose.Types.ObjectId(product.sellerId);

      const seller = await SellerModel.findOne({ _id: sellerId, is_verified: true }).orFail(
        new APIError({
          status: httpStatus.BAD_REQUEST,
          message: "Invalid Request",
        })
      );

      // check the plan type
      // if plan_type is COMMISSION, check for product length

      if (seller.plan_type === PlanType.COMMISSION) {
        const productCount = await productModel.countDocuments({ sellerId: seller._id });
        if (productCount > config.COMMISSION_PRODUCT_COUNT) {
          throw new APIError({
            status: httpStatus.BAD_REQUEST,
            message: "You have exceeded your maximum product upload",
          });
        }
      }

      const updatedProduct = await productModel.findOneAndUpdate(
        { _id: id },
        { isAddedToInventory: false, isSentForApproval: true },
        { new: true }
      );
      // change email to admin email
      // Also send email to seller to notify him of the email
      EmailService.sendMail({
        to: "nancyasiuloka@gmail.com",
        subject: "Product Approval",
        html: EmailTemplate.adminNotificationMessage(product, seller),
      });

      EmailService.sendMail({
        to: "nancyasiuloka@gmail.com",
        subject: "Product Approval",
        html: EmailTemplate.sellerNotificationMessage(product),
      });

      return res.status(httpStatus.OK).json(
        sendResponse({
          status: httpStatus.OK,
          payload: updatedProduct,
          message: "Product sent for approval successfully",
        })
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Route: POST: /products/vendors
   * @async
   * @method addToInventory
   * @description add product to inventory
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof productController
   */
  addProductsToInventory = async (req, res, next) => {
    const { user } = getSession();

    const form = formidable({ multiples: true });

    form.parse(req, async (err, field, files) => {
      let { name, category, description, price, variation, ...rest } = field;
      const { images } = files;

      if (!images) {
        responseReturn(res, 500, { error: "Please select an image" });
      }
      name = name.trim();

      cloudinary.config({
        cloud_name: process.env.cloud_name,
        api_key: process.env.api_key,
        api_secret: process.env.api_secret,
        secure: true,
      });

      try {
        let allImageUrl = [];
        for (let i = 0; i < images.length; i++) {
          const result = await cloudinary.uploader.upload(images[i].filepath, {
            folder: "products",
          });
          allImageUrl = [...allImageUrl, result.url];
        }

        const product = await productModel.create({
          sellerId: user._id,
          name,
          category: category.trim(),
          description: description.trim(),
          price: parseInt(price),
          variation: variation ? JSON.parse(variation) : {},
          images: allImageUrl,
          isAddedToInventory: true,
          ...rest,
        });

        responseReturn(res, 201, {
          message: "Product Added to Inventory Successfully",
          data: {
            product,
          },
        });
      } catch (error) {
        next(error);
      }
    });
  };

  // End Method

  /**
   * Route: GET: /products/vendors
   * @async
   * @method getAllInventoryProducts
   * @description get all inventory products
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof productController
   */
  getAllInventoryProducts = async (req, res, next) => {
    try {
      const { user } = getSession();
      const products = await productModel.find({ sellerId: user._id, isAddedToInventory: true });

      responseReturn(res, 200, {
        message: "All Inventory Products fetched successfully",
        results: products.length,
        data: {
          products,
        },
      });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };

  // End Method
  /**
   * Route: GET: /products/vendors
   * @async
   * @method getInventoryProduct
   * @description get inventory product
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof productController
   */
  getInventoryProduct = async (req, res, next) => {
    try {
      const { user } = getSession();
      const product_id = req.params.product_id;
      const product = await productModel
        .findOne({
          sellerId: user._id,
          product_id,
          isAddedToInventory: true,
        })
        .orFail(
          new APIError({
            message: "Product not found",
            status: httpStatus.BAD_REQUEST,
          })
        );
      responseReturn(res, 200, {
        message: "Product fetched successfully",
        data: {
          product,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Route: GET: /products/vendors
   * @async
   * @method products_get
   * @description get all product
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof productController
   */
  products_get = async (req, res, next) => {
    const { page, searchValue, parPage } = req.query;
    const { user } = getSession();

    const skipPage = parseInt(parPage) * (parseInt(page) - 1);

    try {
      if (searchValue) {
        const products = await productModel
          .find({
            $text: { $search: searchValue },
            sellerId: user._id,
          })
          .skip(skipPage)
          .limit(parPage)
          .sort({ createdAt: -1 });
        const totalProduct = await productModel
          .find({
            $text: { $search: searchValue },
            sellerId: user._id,
          })
          .countDocuments();
        responseReturn(res, 200, { products, totalProduct });
      } else {
        const products = await productModel
          .find({ sellerId: user._id })
          .skip(skipPage)
          .limit(parPage)
          .sort({ createdAt: -1 });
        const totalProduct = await productModel.find({ sellerId: user._id }).countDocuments();
        responseReturn(res, 200, {
          message: "All Products fetched successfully",
          results: products.length,
          data: {
            products,
            totalProduct,
          },
        });
      }
    } catch (error) {
      next(error);
    }
  };

  // End Method

  /**
   * Route: GET: /products/vendors
   * @async
   * @method product_get
   * @description get one product
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof productController
   */
  product_get = async (req, res, next) => {
    const { productId } = req.params;
    try {
      const product = await productModel.findById(productId);
      responseReturn(res, 200, {
        message: "Product fetched successfully",
        data: {
          product,
        },
      });
    } catch (error) {
      next(error);
    }
  };
  // End Method
  /**
   * Route: PATCH: /products/vendors
   * @async
   * @method product_update
   * @description update a product
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof productController
   */
  product_update = async (req, res, next) => {
    try {
      const { productId } = req.params;
      let { name, price, sizes, weight, quality, ...rest } = req.body;

      if (name) {
        name = name.trim();
      }

      const product = await productModel.findOne({ _id: productId });
      if (!product) {
        return responseReturn(res, 404, { error: "Product not found" });
      }

      const updatedProduct = await productModel.findOneAndUpdate(
        { _id: productId },
        {
          name,
          price,
          sizes,
          weight,
          quality,
          ...rest,
        },
        { new: true }
      );

      responseReturn(res, 200, {
        message: "Product Updated Successfully",
        product: updatedProduct,
      });
    } catch (error) {
      next(error);
    }
  };

  // End Method

  /**
   * Route: DELETE: /products/vendors
   * @async
   * @method product_delete
   * @description delete a product
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof productController
   */
  product_delete = async (req, res, next) => {
    const { productId } = req.params;
    try {
      await productModel.findByIdAndDelete(productId);
      responseReturn(res, 200, { message: "Product Deleted Successfully" });
    } catch (error) {
      next(error);
    }
  };

  // End Method

  product_image_update = async (req, res) => {
    const form = formidable({ multiples: true });

    form.parse(req, async (err, field, files) => {
      const { oldImage, productId } = field;
      console.log(oldImage, productId, files);
      const { newImage } = files;

      if (err) {
        responseReturn(res, 400, { error: err.message });
      } else {
        try {
          cloudinary.config({
            cloud_name: process.env.cloud_name,
            api_key: process.env.api_key,
            api_secret: process.env.api_secret,
            secure: true,
          });

          const result = await cloudinary.uploader.upload(newImage.filepath, {
            folder: "products",
          });

          if (result) {
            let { images } = await productModel.findById(productId);
            const index = images.findIndex((img) => img === oldImage);
            images[index] = result.url;
            await productModel.findByIdAndUpdate(productId, { images });

            const product = await productModel.findById(productId);
            responseReturn(res, 200, {
              product,
              message: "Product Image Updated Successfully",
            });
          } else {
            responseReturn(res, 404, { error: "Image Upload Failed" });
          }
        } catch (error) {
          responseReturn(res, 404, { error: error.message });
        }
      }
    });
  };
  // End Method
}

module.exports = new productController();
