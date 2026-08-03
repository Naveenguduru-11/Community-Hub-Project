const User = require('../models/User');
const Vehicle = require('../models/Vehicle');

exports.addFamilyMember = async (req, res, next) => {
  try {
    const { name, relation, phone, age } = req.body;
    const user = await User.findById(req.user._id);
    user.familyMembers.push({ name, relation, phone, age });
    await user.save();
    res.status(200).json({ success: true, familyMembers: user.familyMembers });
  } catch (error) {
    next(error);
  }
};

exports.removeFamilyMember = async (req, res, next) => {
  try {
    const { memberId } = req.params;
    const user = await User.findById(req.user._id);
    user.familyMembers = user.familyMembers.filter(m => m._id.toString() !== memberId);
    await user.save();
    res.status(200).json({ success: true, familyMembers: user.familyMembers });
  } catch (error) {
    next(error);
  }
};

exports.registerVehicle = async (req, res, next) => {
  try {
    const { registrationNumber, vehicleType, model, color, parkingSlot } = req.body;
    const vehicle = await Vehicle.create({
      registrationNumber,
      vehicleType,
      model,
      color,
      parkingSlot,
      owner: req.user._id,
      villa: req.user.villa,
      community: req.user.community
    });
    res.status(201).json({ success: true, vehicle });
  } catch (error) {
    next(error);
  }
};

exports.getVehicles = async (req, res, next) => {
  try {
    const query = req.user.role === 'RESIDENT' 
      ? { owner: req.user._id } 
      : { community: req.user.community };
    const vehicles = await Vehicle.find(query).populate('owner', 'name phone').populate('villa', 'villaNumber block');
    res.status(200).json({ success: true, count: vehicles.length, vehicles });
  } catch (error) {
    next(error);
  }
};
