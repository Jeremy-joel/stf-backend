const mongoose = require('mongoose');

// One flexible model for editable page text. Each "key" is a section of
// your website (e.g. "who-we-are", "about", "get-involved"), and "data"
// holds whatever fields that section needs, as plain text.
const siteContentSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    data: { type: mongoose.Schema.Types.Mixed, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SiteContent', siteContentSchema);