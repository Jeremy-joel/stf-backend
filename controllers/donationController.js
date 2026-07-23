const axios = require('axios');
const crypto = require('crypto');
const Donation = require('../models/Donation');

/**
 * STEP 1 (only used if you have a custom donation form on your site)
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
 * STEP 2 (only used alongside the custom form above)
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

    const isGenuine =
      data.status === 'success' &&
      data.reference === txRef &&
      data.amount >= donation.amount * 100 &&
      data.currency === 'KES';

    donation.flwTransactionId = String(data.id);
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
 * This is now the MAIN way donations get logged, since donations happen on
 * Paystack's own hosted page (paystack.shop) rather than a form on our site.
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
      const data = event.data;
      const txRef = data.reference;

      let donation = await Donation.findOne({ txRef });

      if (donation) {
        // A donation we already had a pending record for (custom form flow, if used)
        if (donation.status !== 'successful') {
          donation.status = 'successful';
          donation.flwTransactionId = String(data.id);
          await donation.save();
        }
      } else {
        // No existing record - this donation came straight from the Paystack
        // hosted payment page, so we create the record directly from the webhook.
        const channelMap = {
          mobile_money: 'mpesa',
          card: 'card',
          bank: 'bank_transfer',
          bank_transfer: 'bank_transfer',
          eft: 'bank_transfer'
        };

        // Paystack's hosted page doesn't collect a name field by default,
        // so donors who don't add one via custom fields show as "Anonymous Donor".
        const customName = data.metadata?.custom_fields?.find(
          (f) => /name/i.test(f.variable_name || f.display_name || '')
        )?.value;

        await Donation.create({
          donorName: customName || 'Anonymous Donor',
          donorEmail: data.customer?.email || '',
          amount: data.amount / 100, // Paystack sends amount in cents
          paymentMethod: channelMap[data.channel] || 'other',
          txRef,
          flwTransactionId: String(data.id),
          status: 'successful'
        });
      }
    }

    res.status(200).end();
  } catch (err) {
    console.error('Webhook error:', err.message);
    res.status(200).end(); // still acknowledge receipt so Paystack doesn't keep retrying
  }
};

module.exports = { initiateDonation, verifyDonation, paystackWebhook };