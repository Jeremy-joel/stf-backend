const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

// Runs every time the server starts. It keeps a single admin account
// ALWAYS in sync with whatever ADMIN_USERNAME / ADMIN_PASSWORD currently
// are in your .env (or Render's Environment tab).
//
// This means:
// - If the account doesn't exist yet, it gets created.
// - If it already exists, its password (and username) gets updated to
//   match your current .env every time the server restarts.
// - You never need Shell/SSH access to fix a stale admin account -
//   just change the env vars and let the server restart.
const ensureAdminExists = async () => {
  try {
    const { ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;

    if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
      console.warn('ADMIN_USERNAME / ADMIN_PASSWORD not set - skipping admin sync.');
      return;
    }

    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

    // Remove any other admin accounts left over from earlier attempts,
    // so there's only ever ONE admin account, matching current .env
    await Admin.deleteMany({ username: { $ne: ADMIN_USERNAME } });

    await Admin.findOneAndUpdate(
      { username: ADMIN_USERNAME },
      { username: ADMIN_USERNAME, passwordHash },
      { upsert: true, new: true }
    );

    console.log(`Admin "${ADMIN_USERNAME}" is created/synced and ready to log in.`);
  } catch (err) {
    console.error('ensureAdminExists error:', err.message);
  }
};
module.exports = ensureAdminExists;
module.exports = ensureAdminExists;
