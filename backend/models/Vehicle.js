const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  registrationNumber: { type: String, required: true, uppercase: true },
  vehicleType: { type: String, enum: ['CAR', 'BIKE', 'EV', 'OTHER'], default: 'CAR' },
  model: { type: String, default: '' },
  color: { type: String, default: '' },
  parkingSlot: { type: String, default: '' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  villa: { type: mongoose.Schema.Types.ObjectId, ref: 'Villa' },
  community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community' }
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
