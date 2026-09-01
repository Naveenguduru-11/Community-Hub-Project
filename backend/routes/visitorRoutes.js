const express = require('express');
const router = express.Router();
const { 
  createVisitorPass, 
  getVisitors, 
  deleteVisitorPass, 
  verifyPasscode,
  checkOutVisitor 
} = require('../controllers/visitorController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createVisitorPass)
  .get(protect, getVisitors);

router.post('/checkin', protect, verifyPasscode);
router.put('/:id/checkout', protect, checkOutVisitor);
router.post('/verify-code', protect, verifyPasscode);
router.delete('/:id', protect, deleteVisitorPass);

module.exports = router;

