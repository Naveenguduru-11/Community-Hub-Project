const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  label:       { type: String, required: true },
  price:       { type: Number, default: 0 },
  guestCharge: { type: Number, default: 0 },
}, { _id: true });

const maintenanceSchema = new mongoose.Schema({
  start:  { type: String },  // ISO date string YYYY-MM-DD
  end:    { type: String },
  reason: { type: String, default: '' },
}, { _id: false });

const amenitySchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category:    { type: String, enum: ['Hall','Fitness','Sports','Kids','Other'], default: 'Other' },
  emoji:       { type: String, default: '🏢' },
  capacity:    { type: Number, default: 0 },
  operatingHours: { type: String, default: '6:00 AM – 10:00 PM' },

  // Primary cover image + optional gallery
  image:  { type: String, default: '' },  // Cloudinary URL or base64
  images: [{ type: String }],             // Gallery

  // Booking slots
  slots: { type: [slotSchema], default: [] },

  // Maintenance windows
  maintenance: { type: [maintenanceSchema], default: [] },

  status: {
    type: String,
    enum: ['active', 'maintenance', 'closed'],
    default: 'active'
  },

  community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community' },
}, { timestamps: true });

amenitySchema.index({ community: 1, status: 1 });

module.exports = mongoose.model('Amenity', amenitySchema);
