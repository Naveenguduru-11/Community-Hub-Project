const mongoose = require('mongoose');
const Community = require('../models/Community');

const memoryCommunities = [];

exports.createCommunity = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    if (isConnected) {
      const community = await Community.create(req.body);
      return res.status(201).json({ success: true, community });
    } else {
      const community = { _id: `comm_${Date.now()}`, ...req.body };
      memoryCommunities.push(community);
      return res.status(201).json({ success: true, community });
    }
  } catch (error) {
    next(error);
  }
};

exports.updateCommunityRate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { maintenanceMonthlyRate } = req.body;
    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected && mongoose.Types.ObjectId.isValid(id)) {
      const community = await Community.findByIdAndUpdate(id, { maintenanceMonthlyRate: Number(maintenanceMonthlyRate) }, { new: true });
      return res.status(200).json({ success: true, community });
    } else {
      const community = memoryCommunities.find(c => c._id === id) || memoryCommunities[0];
      if (community) {
        community.maintenanceMonthlyRate = Number(maintenanceMonthlyRate);
      }
      return res.status(200).json({ success: true, community });
    }
  } catch (error) {
    next(error);
  }
};

exports.getCommunities = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    if (isConnected) {
      const communities = await Community.find().populate('admin', 'name email phone');
      return res.status(200).json({ success: true, count: communities.length, communities });
    } else {
      return res.status(200).json({ success: true, count: memoryCommunities.length, communities: memoryCommunities });
    }
  } catch (error) {
    next(error);
  }
};

exports.getCommunityById = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    if (isConnected) {
      const community = await Community.findById(req.params.id);
      return res.status(200).json({ success: true, community });
    } else {
      return res.status(200).json({ success: true, community: memoryCommunities[0] });
    }
  } catch (error) {
    next(error);
  }
};
