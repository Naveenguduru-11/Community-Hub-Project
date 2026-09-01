const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  title: { type: String, required: true, default: 'Monthly Maintenance Fee' },
  billType: { 
    type: String, 
    enum: ['MAINTENANCE', 'UTILITY', 'EVENT_FEE', 'REPAIR_FINE', 'EV_CHARGING', 'OTHER'], 
    default: 'MAINTENANCE' 
  },
  month: { type: String, required: true }, // e.g. "August 2026"
  amount: { type: Number, required: true },
  lateFee: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['PENDING', 'PAID', 'OVERDUE', 'FAILED'], default: 'PENDING' },
  dueDate: { type: Date, required: true },
  paidDate: { type: Date },
  resident: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  villa: { type: mongoose.Schema.Types.ObjectId, ref: 'Villa' },
  community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community' },
  razorpayOrderId: { type: String, default: '' },
  razorpayPaymentId: { type: String, default: '' },
  razorpaySignature: { type: String, default: '' },
  receiptNumber: { type: String, required: true, unique: true },
  adminNotes: { type: String, default: '' },
  isAdminIssued: { type: Boolean, default: false }  // true = explicitly issued by admin; false = legacy auto-seeded
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
