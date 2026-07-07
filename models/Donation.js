const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema(
  {
    donorName: { type: String, required: true, trim: true },
    donorEmail: { type: String, trim: true, lowercase: true },
    donorPhone: { type: String, trim: true },

    amount: { type: Number, required: true },
    currency: { type: String, default: 'KES' },

    // How the donation was made
    paymentMethod: {
      type: String,
      enum: ['mpesa', 'card', 'bank_transfer', 'other'],
      required: true
    },

    // Online payments only
    txRef: { type: String, index: true },        // our own reference, generated before payment
    flwTransactionId: { type: String, index: true }, // Flutterwave's transaction id, after verification

    status: {
      type: String,
      enum: ['pending', 'successful', 'failed'],
      default: 'pending'
    },

    // For manually-logged donations (e.g. bank transfer reported by phone/email)
    loggedByAdmin: { type: Boolean, default: false },
    notes: { type: String, trim: true }
  },
  { timestamps: true } // adds createdAt / updatedAt automatically
);

module.exports = mongoose.model('Donation', donationSchema);
