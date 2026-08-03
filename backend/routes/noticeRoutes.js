const express = require('express');
const router = express.Router();
const { createNotice, getNotices, deleteNotice } = require('../controllers/noticeController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.route('/')
  .post(protect, authorize('COMMUNITY_ADMIN', 'SUPER_ADMIN'), createNotice)
  .get(protect, getNotices);

router.delete('/:id', protect, authorize('COMMUNITY_ADMIN', 'SUPER_ADMIN'), deleteNotice);

module.exports = router;
