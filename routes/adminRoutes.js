const express = require('express');
const router = express.Router();
const protectAdmin = require('../middleware/authMiddleware');
const {
  loginAdmin,
  getDonations,
  getStats,
  addManualDonation,
  updateDonation,
  deleteDonation,
  exportCSV
} = require('../controllers/adminController');

// Public (this IS the login endpoint)
router.post('/login', loginAdmin);

// Everything below requires a valid admin login token
router.use(protectAdmin);

router.get('/donations', getDonations);
router.get('/stats', getStats);
router.post('/donations', addManualDonation);
router.put('/donations/:id', updateDonation);
router.delete('/donations/:id', deleteDonation);
router.get('/export', exportCSV);

module.exports = router;
