const express = require('express');
const router = express.Router();
const {
  getAmenities, getAmenity, createAmenity, updateAmenity, deleteAmenity,
  uploadAmenityImages,
  getBookings, getMyBookings, createBooking, updateBookingStatus, cancelBooking
} = require('../controllers/amenityController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

// ── Amenity CRUD ─────────────────────────────────────────────────────
router.get('/',    protect, getAmenities);
router.get('/my-bookings', protect, getMyBookings);
router.get('/:id', protect, getAmenity);

// Admin only: create/edit/delete amenities
router.post('/',
  protect, authorize('SUPER_ADMIN', 'COMMUNITY_ADMIN'),
  upload.array('images', 10), createAmenity);

router.put('/:id',
  protect, authorize('SUPER_ADMIN', 'COMMUNITY_ADMIN'),
  upload.single('image'), updateAmenity);

router.delete('/:id',
  protect, authorize('SUPER_ADMIN', 'COMMUNITY_ADMIN'),
  deleteAmenity);

// Upload photos to amenity gallery
router.post('/:id/images',
  protect, authorize('SUPER_ADMIN', 'COMMUNITY_ADMIN'),
  upload.array('images', 10), uploadAmenityImages);

// ── Booking Routes ───────────────────────────────────────────────────
router.get('/:id/bookings',           protect, getBookings);
router.post('/:id/bookings',          protect, createBooking);

// Any authenticated resident can cancel their OWN booking
router.put('/bookings/:bookingId/cancel', protect, cancelBooking);

// Admins can change any booking status
router.put('/bookings/:bookingId/status',
  protect, authorize('SUPER_ADMIN', 'COMMUNITY_ADMIN'),
  updateBookingStatus);

module.exports = router;
