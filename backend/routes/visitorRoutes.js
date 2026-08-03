const express = require('express');
const router = express.Router();
const { createVisitorPass, checkInVisitor, checkOutVisitor, getVisitors, deleteVisitorPass } = require('../controllers/visitorController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.route('/')
  .post(protect, createVisitorPass)
  .get(protect, getVisitors);

router.delete('/:id', protect, deleteVisitorPass);
router.post('/checkin', protect, authorize('SECURITY_GUARD', 'COMMUNITY_ADMIN', 'SUPER_ADMIN'), checkInVisitor);
router.put('/:visitorId/checkout', protect, authorize('SECURITY_GUARD', 'COMMUNITY_ADMIN', 'SUPER_ADMIN'), checkOutVisitor);

module.exports = router;
