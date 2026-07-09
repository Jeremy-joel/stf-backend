const axios = require('axios');
const crypto = require('crypto');
const Donation = require('../models/Donation');

/**
 * STEP 1 (frontend calls this first)
 * Generates a unique transaction reference before opening the Flutterwave
 * payment popup, and saves a "pending" donation record.
 */
const initiateDonation = async (req, res) => {
  try {
    const { donorName, donorEmail, donorPhone, amount, paymentMethod } = req.body;

    if (!donorName || !amount || !paymentMethod) {
      return res.status(400).json({ message: 'Name, amount and payment method are required.' });
    }

    const txRef = `SFF-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

    const donation = await Donation.create({
      donorName,
      donorEmail,
      donorPhone,
      amount,
      paymentMethod,
      txRef,
      status: 'pending'
    });

    res.status(201).json({
      message: 'Donation initiated',
      txRef: donation.txRef,
      publicKey: process.env.FLW_PUBLIC_KEY
    });
  } catch (err) {
    console.error('initiateDonation error:', err.message);
    res.status(500).json({ message: 'Could not start donation. Please try again.' });
  }
};

/**
 * STEP 2 (frontend calls this after the Flutterwave popup reports success)
 * NEVER trust the frontend alone - we re-check directly with Flutterwave's
 * servers using our secret key before marking a donation as successful.
 */
const verifyDonation = async (req, res) => {
  try {
    const { transactionId, txRef } = req.body;

    if (!transactionId || !txRef) {
      return res.status(400).json({ message: 'Missing transaction details.' });
    }

    const verifyRes = await axios.get(
      `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
      { headers: { Authorization: `Bearer ${process.env.FLW_SECRET_KEY}` } }
    );

    const data = verifyRes.data.data;

    const donation = await Donation.findOne({ txRef });
    if (!donation) {
      return res.status(404).json({ message: 'Donation record not found.' });
    }

    const isGenuine =
      data.status === 'successful' &&
      data.tx_ref === txRef &&
      data.amount >= donation.amount &&
      data.currency === 'KES';

    donation.flwTransactionId = String(transactionId);
    donation.status = isGenuine ? 'successful' : 'failed';
    await donation.save();

    if (!isGenuine) {
      return res.status(400).json({ message: 'Payment could not be verified.' });
    }

    res.json({ message: 'Payment verified. Thank you for your donation!', donation });
  } catch (err) {
    console.error('verifyDonation error:', err.message);
    res.status(500).json({ message: 'Verification failed. If money was deducted, contact us with your reference.' });
  }
};

/**
 * WEBHOOK (Flutterwave calls this directly from their servers)
 * This is a safety net in case the donor closes their browser right after
 * paying, before step 2 above gets a chance to run.
 * Set this URL in your Flutterwave Dashboard -> Settings -> Webhooks:
 *   https://YOUR-BACKEND-URL/api/donations/webhook
 */
const flutterwaveWebhook = async (req, res) => {
  try {
    const signature = req.headers['verif-hash'];
    if (!signature || signature !== process.env.FLW_SECRET_HASH) {
      return res.status(401).end(); // reject anything not genuinely from Flutterwave
    }

    const payload = req.body;

    if (payload.status === 'successful') {
      const donation = await Donation.findOne({ txRef: payload.txRef || payload.tx_ref });
      if (donation && donation.status !== 'successful') {
        donation.status = 'successful';
        donation.flwTransactionId = String(payload.id || payload.transaction_id);
        await donation.save();
      }
    }

    res.status(200).end();
  } catch (err) {
    console.error('Webhook error:', err.message);
    res.status(200).end(); // still acknowledge receipt so Flutterwave doesn't keep retrying
  }
};

module.exports = { initiateDonation, verifyDonation, flutterwaveWebhook };
