const mongoose = require('mongoose');
const Visitor = require('../models/Visitor');
const { emitVisitorApproval } = require('../services/socketService');

let memoryVisitors = [];

exports.clearMemoryVisitors = () => {
  memoryVisitors = [];
};

const generatePasscode = () => Math.floor(100000 + Math.random() * 900000).toString();

// @desc Create Visitor Gate Pass
// @route POST /api/visitors
exports.createVisitorPass = async (req, res, next) => {
  try {
    const { name, phone, visitorType, company, vehicleNumber, purpose, villaId } = req.body;
    const passcode = generatePasscode();

    const hostResident = req.user.role === 'RESIDENT' ? req.user._id : (req.body.hostResident || req.user._id);
    const targetVilla = req.user.role === 'RESIDENT' ? req.user.villa : villaId;
    const targetCommunity = req.user.community;

    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected) {
      const visitorData = {
        name: name || 'Guest Visitor',
        phone: phone || '+91 98765 43210',
        visitorType: visitorType || 'GUEST',
        company: company || '',
        vehicleNumber: vehicleNumber || '',
        purpose: purpose || 'Personal Visit',
        hostResident,
        passcode,
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=COMMUNITYHUB-VISITOR-${passcode}`,
        status: req.user.role === 'RESIDENT' ? 'PRE_APPROVED' : 'PENDING_APPROVAL'
      };

      if (targetCommunity && mongoose.Types.ObjectId.isValid(targetCommunity)) {
        visitorData.community = targetCommunity;
      }
      if (targetVilla && mongoose.Types.ObjectId.isValid(targetVilla)) {
        visitorData.villa = targetVilla;
      }

      const visitor = await Visitor.create(visitorData);

      const populated = await Visitor.findById(visitor._id)
        .populate('hostResident', 'name phone email')
        .populate('villa', 'villaNumber block');

      emitVisitorApproval(targetCommunity, hostResident, populated);
      return res.status(201).json({ success: true, visitor: populated || visitor });
    } else {
      const visitor = {
        _id: `vis_${Date.now()}`,
        name: name || 'Guest Visitor',
        phone: phone || '+91 98765 43210',
        visitorType: visitorType || 'GUEST',
        company: company || '',
        vehicleNumber: vehicleNumber || '',
        purpose: purpose || 'Personal Visit',
        passcode,
        status: 'PRE_APPROVED',
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=COMMUNITYHUB-VISITOR-${passcode}`,
        hostResident: { _id: req.user._id, name: req.user.name, phone: req.user.phone },
        createdAt: new Date()
      };

      memoryVisitors.unshift(visitor);
      emitVisitorApproval(targetCommunity, hostResident, visitor);
      return res.status(201).json({ success: true, visitor });
    }
  } catch (error) {
    next(error);
  }
};

// @desc Delete / Cancel Visitor Pass
// @route DELETE /api/visitors/:id
exports.deleteVisitorPass = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected && mongoose.Types.ObjectId.isValid(id)) {
      await Visitor.findByIdAndDelete(id);
    } else {
      const idx = memoryVisitors.findIndex(v => v._id === id);
      if (idx > -1) memoryVisitors.splice(idx, 1);
    }

    return res.status(200).json({ success: true, message: 'Visitor pass cancelled' });
  } catch (error) {
    next(error);
  }
};

// @desc Get All Visitors
// @route GET /api/visitors
exports.getVisitors = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected) {
      const visitors = await Visitor.find()
        .populate('hostResident', 'name phone email')
        .populate('villa', 'villaNumber block')
        .sort({ createdAt: -1 });

      const uniqueVisitors = Array.from(new Map(visitors.map(item => [item._id.toString(), item])).values());
      return res.status(200).json({ success: true, count: uniqueVisitors.length, visitors: uniqueVisitors });
    } else {
      const uniqueVisitors = Array.from(new Map(memoryVisitors.map(item => [item._id, item])).values());
      return res.status(200).json({ success: true, count: uniqueVisitors.length, visitors: uniqueVisitors });
    }
  } catch (error) {
    next(error);
  }
};

// @desc Verify Gate Entry Code / Action
// @route POST /api/visitors/verify-code
exports.verifyPasscode = async (req, res, next) => {
  try {
    const { passcode, action } = req.body;
    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected) {
      const visitor = await Visitor.findOne({ passcode });
      if (!visitor) {
        return res.status(404).json({ success: false, message: 'Invalid 6-digit visitor passcode' });
      }

      if (action === 'CHECK_IN') {
        visitor.status = 'INSIDE';
        visitor.entryTime = new Date();
      } else if (action === 'CHECK_OUT') {
        visitor.status = 'EXITED';
        visitor.exitTime = new Date();
      }

      await visitor.save();
      return res.status(200).json({ success: true, visitor, message: `Gate ${action} successful!` });
    } else {
      const visitor = memoryVisitors.find(v => v.passcode === passcode);
      if (!visitor) {
        return res.status(404).json({ success: false, message: 'Invalid 6-digit visitor passcode' });
      }
      visitor.status = action === 'CHECK_IN' ? 'INSIDE' : 'EXITED';
      return res.status(200).json({ success: true, visitor, message: `Gate ${action} successful!` });
    }
  } catch (error) {
    next(error);
  }
};
