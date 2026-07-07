// Run this ONCE to create your first admin login: npm run seed:admin
// It reads ADMIN_USERNAME and ADMIN_PASSWORD from your .env file.

require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const Admin = require('../models/Admin');
const mongoose = require('mongoose');

(async () => {
  await connectDB();

  const { ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
    console.error('Set ADMIN_USERNAME and ADMIN_PASSWORD in your .env file first.');
    process.exit(1);
  }

  const existing = await Admin.findOne({ username: ADMIN_USERNAME });
  if (existing) {
    console.log(`Admin "${ADMIN_USERNAME}" already exists. Nothing to do.`);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await Admin.create({ username: ADMIN_USERNAME, passwordHash });

  console.log(`Admin account "${ADMIN_USERNAME}" created successfully.`);
  console.log('You can now log in at /admin/login.html');
  mongoose.connection.close();
})();
