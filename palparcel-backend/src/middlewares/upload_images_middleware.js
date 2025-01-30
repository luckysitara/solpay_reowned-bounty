const formidable = require("formidable");
const cloudinary = require("cloudinary").v2;

const uploadImageMiddleware = async (req, _res, next) => {
  console.log("Function called");

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return next(err);
    }

    console.log("Parsed files:", files);

    // Check for a single image file
    const image = files.images; // Assuming 'images' is the field name
    console.log("image", image);

    if (!image) {
      return next(new Error("No image found in the request."));
    }

    try {
      cloudinary.config({
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.API_KEY,
        api_secret: process.env.API_SECRET,
        secure: true,
      });

      console.log("Before Upload");
      console.log("image.filepath", image.filepath);

      let result = await cloudinary.uploader.upload(image.filepath, {
        folder: "customers",
      });

      console.log("err", err);

      console.log("Uploaded image URL:", result.url);

      // Attach the image URL to the request object
      req.uploadedImageUrl = result.url;
      req.parsedFields = fields;

      next();
    } catch (error) {
      return next(error);
    }
  });
};

module.exports = uploadImageMiddleware;
