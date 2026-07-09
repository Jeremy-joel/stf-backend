const express = require('express');
const router = express.Router();
const protectAdmin = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const {
  getPublicPrograms,
  getAllPrograms,
  createProgram,
  updateProgram,
  deleteProgram
} = require('../controllers/programController');

// Public - used by the live website
router.get('/', getPublicPrograms);

// Admin only
router.get('/admin/all', protectAdmin, getAllPrograms);
router.post('/admin', protectAdmin, upload.single('image'), createProgram);
router.put('/admin/:id', protectAdmin, upload.single('image'), updateProgram);
router.delete('/admin/:id', protectAdmin, deleteProgram);

module.exports = router;
