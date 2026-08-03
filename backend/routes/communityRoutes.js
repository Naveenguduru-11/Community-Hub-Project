const express = require('express');
const router = express.Router();
const { createCommunity, getCommunities, getCommunityById, updateCommunityRate } = require('../controllers/communityController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.route('/')
  .post(protect, authorize('SUPER_ADMIN'), createCommunity)
  .get(protect, getCommunities);

router.route('/:id')
  .get(protect, getCommunityById);

router.put('/:id/rate', protect, authorize('COMMUNITY_ADMIN', 'SUPER_ADMIN'), updateCommunityRate);

module.exports = router;
