const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

// Runs every time the server starts. If the admin account from .env
// doesn't exist yet in the database, it creates it automatically.
// This means we never need Shell/SSH access to run a seed script manually -
// useful on free hosting tiers (like Render's free plan) that don't include Shell.
const ensureAdminExists = async () => {
  try {
    const { ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;

    if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
      console.warn('ADMIN_USERNAME / ADMIN_PASSWORD not set - skipping admin auto-create.');
      return;
    }

    const existing = await Admin.findOne({ username: ADMIN_USERNAME });
    if (existing) {
      console.log(`Admin "${ADMIN_USERNAME}" already exists.`);
      return;
    }

    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await Admin.create({ username: ADMIN_USERNAME, passwordHash });
    console.log(`Admin account "${ADMIN_USERNAME}" auto-created on startup.`);
  } catch (err) {
    console.error('ensureAdminExists error:', err.message);
  }
};

module.exports = ensureAdminExists;