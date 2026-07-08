require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const ensureAdminExists = require('./utils/ensureAdmin');

const donationRoutes = require('./routes/donationRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

const start = async () => {
  await connectDB();
  await ensureAdminExists(); // creates your admin login automatically if it doesn't exist yet

  app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
  app.use(express.json());

  // API routes
  app.use('/api/donations', donationRoutes);
  app.use('/api/admin', adminRoutes);

  // Serves the admin dashboard (login.html / dashboard.html) as plain static files
  app.use('/admin', express.static(path.join(__dirname, 'public/admin')));

  app.get('/', (req, res) => {
    res.send('Save the Family Foundation backend is running.');
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

start();