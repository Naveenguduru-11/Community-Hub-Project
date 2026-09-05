const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Vehicle = require('../models/Vehicle');
const { protect } = require('../middleware/authMiddleware');

// In-memory fallback if DB is temporarily disconnected
let memoryVehicles = [
  {
    _id: 'veh_demo_1',
    registrationNumber: 'TS 08 GB 1234',
    vehicleType: 'CAR',
    model: 'Honda City',
    color: 'White',
    parkingSlot: 'P-102',
    owner: { name: 'Resident Member', phone: '+91 9876543210' },
    villa: { villaNumber: 'V-102', block: 'A' },
    createdAt: new Date()
  },
  {
    _id: 'veh_demo_2',
    registrationNumber: 'TS 09 XY 5678',
    vehicleType: 'BIKE',
    model: 'Royal Enfield Classic',
    color: 'Matte Black',
    parkingSlot: 'B-04',
    owner: { name: 'Resident Member', phone: '+91 9876543210' },
    villa: { villaNumber: 'V-102', block: 'A' },
    createdAt: new Date()
  }
];

// GET /api/vehicles & /api/auth/vehicles
router.get('/', protect, async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    if (isConnected) {
      const query = req.user.role === 'RESIDENT'
        ? { owner: req.user._id }
        : { community: req.user.community };
      const vehicles = await Vehicle.find(query)
        .populate('owner', 'name phone')
        .populate('villa', 'villaNumber block')
        .sort({ createdAt: -1 });

      const mapped = vehicles.map(v => ({
        _id: v._id,
        id: v._id,
        registrationNumber: v.registrationNumber,
        vehicleNumber: v.registrationNumber,
        vehicleType: v.vehicleType,
        model: v.model,
        color: v.color,
        parkingSlot: v.parkingSlot,
        owner: v.owner,
        villa: v.villa,
        ownerName: v.owner?.name,
        ownerVilla: v.villa?.villaNumber,
        createdAt: v.createdAt
      }));
      return res.status(200).json({ success: true, count: mapped.length, vehicles: mapped, data: mapped });
    } else {
      return res.status(200).json({ success: true, count: memoryVehicles.length, vehicles: memoryVehicles, data: memoryVehicles });
    }
  } catch (error) {
    next(error);
  }
});

// POST /api/vehicles & /api/auth/vehicles
router.post('/', protect, async (req, res, next) => {
  try {
    const regNum = (req.body.registrationNumber || req.body.vehicleNumber || '').toUpperCase().trim();
    const { vehicleType = 'CAR', model = '', color = '', make = '', parkingSlot = '' } = req.body;

    if (!regNum) {
      return res.status(400).json({ success: false, message: 'Registration or Vehicle Number is required' });
    }

    const fullModel = make && model ? `${make} ${model}` : (model || make || 'Standard');
    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected) {
      const vehicle = await Vehicle.create({
        registrationNumber: regNum,
        vehicleType: ['CAR', 'BIKE', 'EV', 'OTHER'].includes(vehicleType.toUpperCase()) ? vehicleType.toUpperCase() : 'CAR',
        model: fullModel,
        color: color || 'Standard',
        parkingSlot: parkingSlot || 'Auto-Assigned',
        owner: req.user._id,
        villa: req.user.villa || undefined,
        community: req.user.community || undefined
      });

      const populated = await Vehicle.findById(vehicle._id)
        .populate('owner', 'name phone')
        .populate('villa', 'villaNumber block');

      const result = {
        _id: populated._id,
        id: populated._id,
        registrationNumber: populated.registrationNumber,
        vehicleNumber: populated.registrationNumber,
        vehicleType: populated.vehicleType,
        model: populated.model,
        color: populated.color,
        parkingSlot: populated.parkingSlot,
        ownerName: populated.owner?.name || req.user.name,
        ownerVilla: populated.villa?.villaNumber,
        createdAt: populated.createdAt
      };
      return res.status(201).json({ success: true, vehicle: result, data: result });
    } else {
      const newVeh = {
        _id: `veh_${Date.now()}`,
        id: `veh_${Date.now()}`,
        registrationNumber: regNum,
        vehicleNumber: regNum,
        vehicleType: vehicleType.toUpperCase(),
        model: fullModel,
        color: color || 'Standard',
        parkingSlot: parkingSlot || 'Auto-Assigned',
        owner: { name: req.user.name, phone: req.user.phone },
        ownerName: req.user.name,
        ownerVilla: 'V-102',
        createdAt: new Date()
      };
      memoryVehicles.unshift(newVeh);
      return res.status(201).json({ success: true, vehicle: newVeh, data: newVeh });
    }
  } catch (error) {
    next(error);
  }
});

// DELETE /api/vehicles/:id
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const { id } = req.params;
    const isConnected = mongoose.connection.readyState === 1;
    if (isConnected && mongoose.Types.ObjectId.isValid(id)) {
      await Vehicle.findByIdAndDelete(id);
    } else {
      memoryVehicles = memoryVehicles.filter(v => v._id !== id && v.id !== id);
    }
    return res.status(200).json({ success: true, message: 'Vehicle removed successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
