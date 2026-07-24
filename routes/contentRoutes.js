const express = require('express');
const router = express.Router();
const protectAdmin = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const { getContent, getContentAdmin, updateContent, updateContentImage } = require('../controllers/contentController');

// Public - the live website reads current text
router.get('/:key', getContent);

// Admin only - edit text and images
router.get('/admin/:key', protectAdmin, getContentAdmin);
router.put('/admin/:key', protectAdmin, updateContent);
router.put('/admin/:key/image', protectAdmin, upload.single('image'), updateContentImage);

module.exports = router;