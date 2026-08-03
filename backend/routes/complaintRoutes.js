const express = require('express');
const router = express.Router();
const { createComplaint, getComplaints, updateComplaintStatus, deleteComplaint } = require('../controllers/complaintController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.route('/')
  .post(protect, createComplaint)
  .get(protect, getComplaints);

router.delete('/:id', protect, deleteComplaint);
router.put('/:id/status', protect, authorize('COMMUNITY_ADMIN', 'SUPER_ADMIN'), updateComplaintStatus);

module.exports = router;
