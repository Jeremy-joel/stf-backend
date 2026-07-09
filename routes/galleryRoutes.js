const express = require('express');
const router = express.Router();
const protectAdmin = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const {
  getPublicGallery,
  getAllGallery,
  uploadGalleryImage,
  updateGalleryImage,
  deleteGalleryImage
} = require('../controllers/galleryController');

router.get('/', getPublicGallery);

router.get('/admin/all', protectAdmin, getAllGallery);
router.post('/admin', protectAdmin, upload.single('image'), uploadGalleryImage);
router.put('/admin/:id', protectAdmin, upload.single('image'), updateGalleryImage);
router.delete('/admin/:id', protectAdmin, deleteGalleryImage);

module.exports = router;
