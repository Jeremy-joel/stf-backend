const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Photos uploaded through the admin panel go straight to Cloudinary
// (never saved to Render's disk, which gets wiped on every restart).
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'save-the-family-foundation',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1600, crop: 'limit', quality: 'auto' }]
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 } // 8MB max per photo
});

module.exports = upload;
