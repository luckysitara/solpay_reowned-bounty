const Admin = require("../models/adminModel")
require('dotenv').config();

const createAdmin = async () => {
    try {
      const email = process.env.ADMIN_EMAIL;
      const password = process.env.ADMIN_PASSWORD;

      const existingAdmin = await Admin.findOne({ email });
      if (existingAdmin) {
        console.log('Admin already exists');
        return;
      }

      const admin = new Admin({ email, password, is_verified: true });
      await admin.save();
      console.log('Admin created successfully');
    } catch (error) {
      console.error('Error creating admin:', error);
    }
  };

  module.exports = createAdmin;