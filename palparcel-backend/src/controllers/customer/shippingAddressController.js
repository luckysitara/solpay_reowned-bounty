const ShippingAddress = require("../../models/shippingAddressModel");
const { getSession } = require("../../utiles/use_session");
const { geocodeAddress } = require("../../service/geocodingService");

/**
 * ShippingAddressController handles operations related to shipping addresses,
 * including adding, retrieving, updating, and deleting addresses.
 */
class ShippingAddressController {
  /**
   * Add a new shipping address for the logged-in customer.
   * @param {Object} req - The request object containing user details and address data.
   * @param {Object} res - The response object used to send back the result.
   */
  async addShippingAddress(req, res) {
    try {
      const { user } = getSession(req); // Changed to accept req as an argument
      const addressData = req.body; // Extract address data from req.body

      // Geocode the address
      const fullAddress = `${addressData.delivery_address}, ${addressData.city}, ${addressData.state}, ${addressData.country}`;
      const { latitude, longitude } = await geocodeAddress(fullAddress);

      const newAddress = new ShippingAddress({
        customer: user._id,
        ...addressData, // Spread operator to simplify assignment
        coordinates: { type: "Point", coordinates: [longitude, latitude] },
      });

      await newAddress.save();
      res.status(201).json({ success: true, message: "Shipping address added successfully", data: newAddress });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get all shipping addresses for the logged-in customer.
   * @param {Object} req - The request object containing user details.
   * @param {Object} res - The response object used to send back the result.
   */
  async getShippingAddresses(req, res) {
    try {
      const { user } = getSession(req); // Changed to accept req as an argument
      const addresses = await ShippingAddress.find({ customer: user._id });
      res.status(200).json({ success: true, data: addresses });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Update an existing shipping address by its ID.
   * @param {Object} req - The request object containing user details and updated address data.
   * @param {Object} res - The response object used to send back the result.
   */
  async updateShippingAddress(req, res) {
    try {
      const { id } = req.params;
      const addressData = req.body; // Extract address data from req.body

      // Geocode the address
      const fullAddress = `${addressData.delivery_address}, ${addressData.city}, ${addressData.state}, ${addressData.country}`;
      const { latitude, longitude } = await geocodeAddress(fullAddress);

      const updatedAddress = await ShippingAddress.findByIdAndUpdate(
        id,
        {
          $set: {
            ...addressData, // Spread operator to simplify assignment
            coordinates: { type: "Point", coordinates: [longitude, latitude] },
          },
        },
        { new: true }
      );

      if (!updatedAddress) {
        return res.status(404).json({ success: false, message: "Shipping address not found" });
      }

      res.status(200).json({
        success: true,
        message: "Shipping address updated successfully",
        data: updatedAddress,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Delete a shipping address by its ID.
   * @param {Object} req - The request object containing the address ID.
   * @param {Object} res - The response object used to send back the result.
   */
  async deleteShippingAddress(req, res) {
    try {
      const { id } = req.params;
      const deletedAddress = await ShippingAddress.findByIdAndDelete(id);
      if (!deletedAddress) {
        return res.status(404).json({ success: false, message: "Shipping address not found" });
      }
      res.status(200).json({ success: true, message: "Shipping address deleted successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get a single shipping address by its ID.
   * @param {Object} req - The request object containing the address ID.
   * @param {Object} res - The response object used to send back the result.
   */
  async getShippingAddressById(req, res) {
    try {
      const { id } = req.params;
      const address = await ShippingAddress.findById(id);
      if (!address) {
        return res.status(404).json({ success: false, message: "Shipping address not found" });
      }
      res.status(200).json({ success: true, data: address });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new ShippingAddressController();

