const express = require('express');
const router = express.Router();
const protectAdmin = require('../middleware/authMiddleware');
const { submitMessage, getMessages, markAsRead, deleteMessage } = require('../controllers/contactController');

// Public - the website's contact form
router.post('/', submitMessage);

// Admin only
router.get('/admin/all', protectAdmin, getMessages);
router.put('/admin/:id/read', protectAdmin, markAsRead);
router.delete('/admin/:id', protectAdmin, deleteMessage);

module.exports = router;
