const express = require('express');
const router = express.Router();
const { createComplaint, getComplaints, updateComplaint, updateComplaintStatus, deleteComplaint } = require('../controllers/complaintController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.route('/')
  .post(protect, createComplaint)
  .get(protect, getComplaints);

router.route('/:id')
  .put(protect, updateComplaint)
  .delete(protect, deleteComplaint);

router.put('/:id/status', protect, authorize('COMMUNITY_ADMIN', 'SUPER_ADMIN'), updateComplaintStatus);

module.exports = router;
