const mongoose = require('mongoose');
const Villa = require('../models/Villa');

const memoryVillas = [];

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
      const uniqueVillas = Array.from(new Map(villas.map(item => [item.villaNumber || item._id.toString(), item])).values());
      return res.status(200).json({ success: true, count: uniqueVillas.length, villas: uniqueVillas });
    } else {
      const uniqueVillas = Array.from(new Map(memoryVillas.map(item => [item.villaNumber || item._id, item])).values());
      return res.status(200).json({ success: true, count: uniqueVillas.length, villas: uniqueVillas });
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
