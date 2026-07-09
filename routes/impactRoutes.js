const express = require('express');
const router = express.Router();
const protectAdmin = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const {
  getPublicImpact,
  getAllImpact,
  createImpactItem,
  updateImpactItem,
  deleteImpactItem
} = require('../controllers/impactController');

router.get('/', getPublicImpact);

router.get('/admin/all', protectAdmin, getAllImpact);
router.post('/admin', protectAdmin, upload.single('image'), createImpactItem);
router.put('/admin/:id', protectAdmin, upload.single('image'), updateImpactItem);
router.delete('/admin/:id', protectAdmin, deleteImpactItem);

module.exports = router;
