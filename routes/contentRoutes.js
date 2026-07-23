const express = require('express');
const router = express.Router();
const protectAdmin = require('../middleware/authMiddleware');
const { getContent, getContentAdmin, updateContent } = require('../controllers/contentController');

// Public - the live website reads current text
router.get('/:key', getContent);

// Admin only - edit text
router.get('/admin/:key', protectAdmin, getContentAdmin);
router.put('/admin/:key', protectAdmin, updateContent);

module.exports = router;