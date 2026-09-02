const mongoose = require('mongoose');

const amenityBookingSchema = new mongoose.Schema({
  amenity:     { type: mongoose.Schema.Types.ObjectId, ref: 'Amenity', required: true },
  amenityName: { type: String, default: '' },
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  community:   { type: mongoose.Schema.Types.ObjectId, ref: 'Community' },

  date:      { type: String, required: true },  // YYYY-MM-DD
  slotId:    { type: String, required: true },
  slotLabel: { type: String, default: '' },

  guestCount:  { type: Number, default: 0, min: 0 },
  totalAmount: { type: Number, default: 0 },

  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },

  notes: { type: String, default: '' },
}, { timestamps: true });

amenityBookingSchema.index({ amenity: 1, date: 1, slotId: 1 });
amenityBookingSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('AmenityBooking', amenityBookingSchema);
