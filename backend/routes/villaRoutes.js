const express = require('express');
const router = express.Router();
const { createVilla, getVillas, assignResidentToVilla } = require('../controllers/villaController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.route('/')
  .post(protect, authorize('SUPER_ADMIN', 'COMMUNITY_ADMIN'), createVilla)
  .get(protect, getVillas);

router.post('/assign', protect, authorize('SUPER_ADMIN', 'COMMUNITY_ADMIN'), assignResidentToVilla);

module.exports = router;
