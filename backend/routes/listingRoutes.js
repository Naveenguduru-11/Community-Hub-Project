const express = require('express');
const router = express.Router();
const {
  getListings, getListing,
  createListing, updateListing, deleteListing,
  expressInterest, uploadListingImages
} = require('../controllers/listingController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

// All authenticated users can view listings
router.get('/',     protect, getListings);
router.get('/:id',  protect, getListing);

// Only Super Admin (and Community Admin) can create/edit/delete
router.post('/',    protect, authorize('SUPER_ADMIN', 'COMMUNITY_ADMIN'), upload.array('images', 10), createListing);
router.put('/:id',  protect, authorize('SUPER_ADMIN', 'COMMUNITY_ADMIN'), upload.array('images', 10), updateListing);
router.delete('/:id', protect, authorize('SUPER_ADMIN', 'COMMUNITY_ADMIN'), deleteListing);

// Upload photos to existing listing
router.post('/:id/images', protect, authorize('SUPER_ADMIN', 'COMMUNITY_ADMIN'), upload.array('images', 10), uploadListingImages);

// Any resident can express interest
router.post('/:id/interest', protect, expressInterest);

module.exports = router;

