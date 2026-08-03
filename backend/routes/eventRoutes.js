const express = require('express');
const router = express.Router();
const { createEvent, getEvents, rsvpEvent, deleteEvent } = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.route('/')
  .post(protect, authorize('COMMUNITY_ADMIN', 'SUPER_ADMIN'), createEvent)
  .get(protect, getEvents);

router.delete('/:id', protect, authorize('COMMUNITY_ADMIN', 'SUPER_ADMIN'), deleteEvent);
router.post('/:id/rsvp', protect, rsvpEvent);

module.exports = router;
