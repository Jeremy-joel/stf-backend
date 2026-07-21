const express = require('express');
const router = express.Router();
const {
  initiateDonation,
  verifyDonation,
  paystackWebhook
} = require('../controllers/donationController');

router.post('/initiate', initiateDonation);
router.post('/verify', verifyDonation);
router.post('/webhook', paystackWebhook);

module.exports = router;