const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['VISITOR_ARRIVED', 'COMPLAINT_UPDATE', 'NOTICE_POSTED', 'PAYMENT_RECEIVED', 'EMERGENCY_SOS'], 
    required: true 
  },
  read: { type: Boolean, default: false },
  link: { type: String, default: '' },
  metadata: { type: Object, default: {} }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
