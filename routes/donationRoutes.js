const express = require('express');
const router = express.Router();
const {
  initiateDonation,
  verifyDonation,
  flutterwaveWebhook
} = require('../controllers/donationController');

router.post('/initiate', initiateDonation);
router.post('/verify', verifyDonation);
router.post('/webhook', flutterwaveWebhook);

module.exports = router;
