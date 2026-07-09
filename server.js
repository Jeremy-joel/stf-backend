require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const ensureAdminExists = require('./utils/ensureAdmin');

const donationRoutes = require('./routes/donationRoutes');
const adminRoutes = require('./routes/adminRoutes');
<<<<<<< HEAD
const programRoutes = require('./routes/programRoutes');
const impactRoutes = require('./routes/impactRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const contactRoutes = require('./routes/contactRoutes');
=======
>>>>>>> 497b9f89e2c8b50f389907668775ef4f447b0cc9

const app = express();

const start = async () => {
  await connectDB();
<<<<<<< HEAD
  await ensureAdminExists(); // creates/syncs your admin login automatically
=======
  await ensureAdminExists(); // creates your admin login automatically if it doesn't exist yet
>>>>>>> 497b9f89e2c8b50f389907668775ef4f447b0cc9

  app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
  app.use(express.json());

  // API routes
  app.use('/api/donations', donationRoutes);
  app.use('/api/admin', adminRoutes);
<<<<<<< HEAD
  app.use('/api/programs', programRoutes);
  app.use('/api/impact', impactRoutes);
  app.use('/api/gallery', galleryRoutes);
  app.use('/api/contact', contactRoutes);

  // Serves the admin dashboard as plain static files
=======

  // Serves the admin dashboard (login.html / dashboard.html) as plain static files
>>>>>>> 497b9f89e2c8b50f389907668775ef4f447b0cc9
  app.use('/admin', express.static(path.join(__dirname, 'public/admin')));

  app.get('/', (req, res) => {
    res.send('Save the Family Foundation backend is running.');
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

<<<<<<< HEAD
start();
=======
start();
>>>>>>> 497b9f89e2c8b50f389907668775ef4f447b0cc9
