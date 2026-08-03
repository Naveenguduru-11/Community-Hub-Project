const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'India' }
  },
  totalVillas: { type: Number, default: 0 },
  amenities: [String],
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  contactPhone: String,
  contactEmail: String,
  bannerUrl: { type: String, default: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80' },
  maintenanceMonthlyRate: { type: Number, default: 3500 }
}, { timestamps: true });

module.exports = mongoose.model('Community', communitySchema);
