const express = require('express');
const router = express.Router();
const {
  getItems, getItem,
  createItem, updateItem, deleteItem,
  uploadItemImages
} = require('../controllers/marketplaceController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

// All authenticated residents can browse
router.get('/',    protect, getItems);
router.get('/:id', protect, getItem);

// Any resident can post an item
router.post('/',    protect, upload.array('images', 10), createItem);
router.put('/:id',  protect, upload.array('images', 10), updateItem);

// Delete — item owner or admin
router.delete('/:id', protect, deleteItem);

// Upload images to existing item
router.post('/:id/images', protect, upload.array('images', 10), uploadItemImages);

module.exports = router;
