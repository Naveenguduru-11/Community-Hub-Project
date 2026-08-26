const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  visitorType: { 
    type: String, 
    enum: ['GUEST', 'DELIVERY', 'CAB', 'SERVICE_PROVIDER', 'OTHER'], 
    default: 'GUEST' 
  },
  company: { type: String, default: '' }, // e.g. Amazon, Swiggy, Uber
  community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', required: false },
  villa: { type: mongoose.Schema.Types.ObjectId, ref: 'Villa', required: false },
  hostResident: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  passcode: { type: String, required: true }, // 6-digit access code
  qrCodeUrl: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['PRE_APPROVED', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'INSIDE', 'EXITED'], 
    default: 'PRE_APPROVED' 
  },
  entryTime: { type: Date },
  exitTime: { type: Date },
  checkedInBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  checkedOutBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  vehicleNumber: { type: String, default: '' },
  purpose: { type: String, default: 'Personal Visit' }
}, { timestamps: true });

module.exports = mongoose.model('Visitor', visitorSchema);
