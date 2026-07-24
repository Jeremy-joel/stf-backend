const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    position: { type: String, required: true, trim: true },
    bio: { type: String, trim: true },
    photoUrl: { type: String },
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('TeamMember', teamMemberSchema);