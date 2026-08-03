const mongoose = require('mongoose');
const Villa = require('../models/Villa');

const memoryVillas = [
  { _id: 'villa_101', villaNumber: 'V-101', block: 'Phase 1 - Royal Palms', sizeSqFt: 3200, bedrooms: 4, occupancyStatus: 'OWNER_OCCUPIED', owner: { name: 'Aarav Mehta' } },
  { _id: 'villa_102', villaNumber: 'V-102', block: 'Phase 1 - Royal Palms', sizeSqFt: 2800, bedrooms: 3, occupancyStatus: 'OWNER_OCCUPIED', owner: { name: 'Ananya Reddy' } },
  { _id: 'villa_103', villaNumber: 'V-103', block: 'Phase 2 - Magnolia Lane', sizeSqFt: 3500, bedrooms: 4, occupancyStatus: 'VACANT' }
];

exports.createVilla = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    if (isConnected) {
      const villa = await Villa.create(req.body);
      return res.status(201).json({ success: true, villa });
    } else {
      const villa = { _id: `villa_${Date.now()}`, ...req.body };
      memoryVillas.push(villa);
      return res.status(201).json({ success: true, villa });
    }
  } catch (error) {
    next(error);
  }
};

exports.getVillas = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    if (isConnected) {
      const villas = await Villa.find().populate('owner tenant', 'name email phone');
      return res.status(200).json({ success: true, count: villas.length, villas });
    } else {
      return res.status(200).json({ success: true, count: memoryVillas.length, villas: memoryVillas });
    }
  } catch (error) {
    next(error);
  }
};

exports.assignResidentToVilla = async (req, res, next) => {
  try {
    const { villaId, residentId, occupancyType } = req.body;
    const isConnected = mongoose.connection.readyState === 1;
    if (isConnected) {
      const villa = await Villa.findByIdAndUpdate(villaId, { owner: residentId, occupancyStatus: occupancyType }, { new: true });
      return res.status(200).json({ success: true, villa });
    } else {
      const villa = memoryVillas.find(v => v._id === villaId) || memoryVillas[0];
      return res.status(200).json({ success: true, villa });
    }
  } catch (error) {
    next(error);
  }
};
