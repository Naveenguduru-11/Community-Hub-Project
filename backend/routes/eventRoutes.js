const express = require('express');
const router = express.Router();
const { createEvent, getEvents, rsvpEvent, deleteEvent } = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createEvent) // Residents & Admins can host events/games
  .get(protect, getEvents);

router.delete('/:id', protect, deleteEvent);
router.post('/:id/rsvp', protect, rsvpEvent);
router.post('/:id/join', protect, rsvpEvent);

module.exports = router;
