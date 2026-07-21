const axios = require('axios');
const crypto = require('crypto');
const Donation = require('../models/Donation');

/**
 * STEP 1 (frontend calls this first)
 * Generates a unique transaction reference before opening the Paystack
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
      publicKey: process.env.PAYSTACK_PUBLIC_KEY
    });
  } catch (err) {
    console.error('initiateDonation error:', err.message);
    res.status(500).json({ message: 'Could not start donation. Please try again.' });
  }
};

/**
 * STEP 2 (frontend calls this after the Paystack popup reports success)
 * NEVER trust the frontend alone - we re-check directly with Paystack's
 * servers using our secret key before marking a donation as successful.
 */
const verifyDonation = async (req, res) => {
  try {
    const { txRef } = req.body;

    if (!txRef) {
      return res.status(400).json({ message: 'Missing transaction reference.' });
    }

    const verifyRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(txRef)}`,
      { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
    );

    const data = verifyRes.data.data;

    const donation = await Donation.findOne({ txRef });
    if (!donation) {
      return res.status(404).json({ message: 'Donation record not found.' });
    }

    // Paystack amounts are in the smallest currency unit (KES cents), hence * 100
    const isGenuine =
      data.status === 'success' &&
      data.reference === txRef &&
      data.amount >= donation.amount * 100 &&
      data.currency === 'KES';

    donation.flwTransactionId = String(data.id); // Paystack's transaction id
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
 * WEBHOOK (Paystack calls this directly from their servers)
 * Safety net in case the donor closes their browser right after paying,
 * before step 2 above gets a chance to run.
 * Set this URL in Paystack Dashboard -> Settings -> API Keys & Webhooks:
 *   https://YOUR-BACKEND-URL/api/donations/webhook
 */
const paystackWebhook = async (req, res) => {
  try {
    // Paystack signs the exact raw request body - req.rawBody is captured in server.js
    const expectedSignature = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(req.rawBody)
      .digest('hex');

    if (expectedSignature !== req.headers['x-paystack-signature']) {
      return res.status(401).end(); // reject anything not genuinely from Paystack
    }

    const event = req.body;

    if (event.event === 'charge.success') {
      const txRef = event.data.reference;
      const donation = await Donation.findOne({ txRef });
      if (donation && donation.status !== 'successful') {
        donation.status = 'successful';
        donation.flwTransactionId = String(event.data.id);
        await donation.save();
      }
    }

    res.status(200).end();
  } catch (err) {
    console.error('Webhook error:', err.message);
    res.status(200).end(); // still acknowledge receipt so Paystack doesn't keep retrying
  }
};

module.exports = { initiateDonation, verifyDonation, paystackWebhook };