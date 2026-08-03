const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['PLUMBING', 'ELECTRICAL', 'SECURITY', 'NOISE', 'CLEANING', 'INTERCOM', 'OTHER'], 
    default: 'OTHER' 
  },
  priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM' },
  status: { 
    type: String, 
    enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'], 
    default: 'OPEN' 
  },
  raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  villa: { type: mongoose.Schema.Types.ObjectId, ref: 'Villa', required: true },
  community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', required: true },
  assignedTo: { type: String, default: 'Maintenance Team' },
  imageUrl: { type: String, default: '' },
  resolutionNotes: { type: String, default: '' },
  resolvedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);
