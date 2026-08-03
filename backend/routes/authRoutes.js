const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  updateProfile, 
  getAllResidents, 
  updateResidentStatus, 
  deleteResident 
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

router.get('/residents', protect, authorize('COMMUNITY_ADMIN', 'SUPER_ADMIN'), getAllResidents);
router.put('/residents/:id/status', protect, authorize('COMMUNITY_ADMIN', 'SUPER_ADMIN'), updateResidentStatus);
router.delete('/residents/:id', protect, authorize('COMMUNITY_ADMIN', 'SUPER_ADMIN'), deleteResident);

module.exports = router;
