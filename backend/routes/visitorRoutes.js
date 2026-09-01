const express = require('express');
const router = express.Router();
const { createVisitorPass, getVisitors, deleteVisitorPass, verifyPasscode } = require('../controllers/visitorController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.route('/')
  .post(protect, createVisitorPass)
  .get(protect, getVisitors);

router.delete('/:id', protect, deleteVisitorPass);
router.post('/verify-code', protect, verifyPasscode);

module.exports = router;
