const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },

  // Property details
  villaNumber: { type: String, required: true },
  block: { type: String, default: '' },
  type: { type: String, enum: ['APARTMENT', 'VILLA', 'DUPLEX', 'PENTHOUSE', 'STUDIO'], default: 'APARTMENT' },
  bhk: { type: String, default: '3 BHK' },
  area: { type: Number, default: 0 },       // in sq ft
  floor: { type: String, default: '' },
  facing: { type: String, default: '' },    // East, West, North, South

  // Pricing
  price: { type: Number, required: true },
  priceNegotiable: { type: Boolean, default: false },
  maintenanceCharge: { type: Number, default: 0 },

  // Status
  status: { type: String, enum: ['AVAILABLE', 'RESERVED', 'SOLD'], default: 'AVAILABLE' },
  listingType: { type: String, enum: ['SALE', 'RENT'], default: 'SALE' },

  // Amenities included
  amenities: [{ type: String }],
  highlights: [{ type: String }],  // e.g. "Gated Community", "24x7 Security"

  // Images (URLs or base64)
  images: [{ type: String }],

  // Contact
  contactName:  { type: String, default: '' },
  contactPhone: { type: String, default: '' },
  contactEmail: { type: String, default: '' },

  // Relations
  villa:      { type: mongoose.Schema.Types.ObjectId, ref: 'Villa' },
  community:  { type: mongoose.Schema.Types.ObjectId, ref: 'Community' },
  postedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Visibility to residents
  visibleToResidents: { type: Boolean, default: true },

  // View/interest count
  views: { type: Number, default: 0 },
  interestedCount: { type: Number, default: 0 },

}, { timestamps: true });

module.exports = mongoose.model('Listing', listingSchema);
