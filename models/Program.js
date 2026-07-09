const mongoose = require('mongoose');

const programSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    imageUrl: { type: String }, // Cloudinary URL
    order: { type: Number, default: 0 }, // controls display order on the site
    published: { type: Boolean, default: true } // unpublished = hidden from the live site
  },
  { timestamps: true }
);

module.exports = mongoose.model('Program', programSchema);
