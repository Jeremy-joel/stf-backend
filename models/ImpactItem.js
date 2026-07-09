const mongoose = require('mongoose');

const impactItemSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true }, // e.g. "Children Supported"
    imageUrl: { type: String },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ImpactItem', impactItemSchema);
