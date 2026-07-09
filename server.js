require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const ensureAdminExists = require('./utils/ensureAdmin');

const donationRoutes = require('./routes/donationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const programRoutes = require('./routes/programRoutes');
const impactRoutes = require('./routes/impactRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const contactRoutes = require('./routes/contactRoutes');

const app = express();
const start = async () => {
  await connectDB();
  await ensureAdminExists();

  app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
  app.use(express.json());

  app.use('/api/donations', donationRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/programs', programRoutes);
  app.use('/api/impact', impactRoutes);
  app.use('/api/gallery', galleryRoutes);
  app.use('/api/contact', contactRoutes);

  app.use('/admin', express.static(path.join(__dirname, 'public/admin')));

  app.get('/', (req, res) => {
    res.send('Save the Family Foundation backend is running.');
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};
start();
