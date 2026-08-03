const mongoose = require('mongoose');

const villaSchema = new mongoose.Schema({
  villaNumber: { type: String, required: true },
  block: { type: String, default: 'Phase 1' },
  sizeSqFt: { type: Number, default: 2400 },
  bedrooms: { type: Number, default: 3 },
  community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  occupancyStatus: { 
    type: String, 
    enum: ['OWNER_OCCUPIED', 'TENANT_OCCUPIED', 'VACANT'], 
    default: 'VACANT' 
  },
  parkingSpots: { type: Number, default: 2 }
}, { timestamps: true });

villaSchema.index({ villaNumber: 1, community: 1 }, { unique: true });

module.exports = mongoose.model('Villa', villaSchema);
