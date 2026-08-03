const express = require('express');
const router = express.Router();
const { 
  generateBills, 
  createCustomBill, 
  updateBill, 
  deleteBill, 
  createOrder, 
  verifyPayment, 
  getPayments 
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', protect, getPayments);
router.post('/generate', protect, authorize('COMMUNITY_ADMIN', 'SUPER_ADMIN'), generateBills);
router.post('/custom', protect, authorize('COMMUNITY_ADMIN', 'SUPER_ADMIN'), createCustomBill);
router.put('/:id', protect, authorize('COMMUNITY_ADMIN', 'SUPER_ADMIN'), updateBill);
router.delete('/:id', protect, authorize('COMMUNITY_ADMIN', 'SUPER_ADMIN'), deleteBill);

router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);

module.exports = router;
