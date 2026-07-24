const express = require('express');
const router = express.Router();
const protectAdmin = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const {
  getPublicTeam,
  getAllTeam,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember
} = require('../controllers/teamController');

router.get('/', getPublicTeam);

router.get('/admin/all', protectAdmin, getAllTeam);
router.post('/admin', protectAdmin, upload.single('photo'), createTeamMember);
router.put('/admin/:id', protectAdmin, upload.single('photo'), updateTeamMember);
router.delete('/admin/:id', protectAdmin, deleteTeamMember);

module.exports = router;