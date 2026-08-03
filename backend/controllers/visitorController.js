const mongoose = require('mongoose');
const Visitor = require('../models/Visitor');
const { emitVisitorApproval } = require('../services/socketService');

let memoryVisitors = [];

exports.clearMemoryVisitors = () => {
  memoryVisitors = [];
};

const generatePasscode = () => Math.floor(100000 + Math.random() * 900000).toString();

exports.createVisitorPass = async (req, res, next) => {
  try {
    const { name, phone, visitorType, company, vehicleNumber, purpose, villaId } = req.body;
    const passcode = generatePasscode();

    const hostResident = req.user.role === 'RESIDENT' ? req.user._id : req.body.hostResident;
    const targetVilla = req.user.role === 'RESIDENT' ? req.user.villa : villaId;
    const targetCommunity = req.user.community;

    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected && mongoose.Types.ObjectId.isValid(hostResident)) {
      const visitor = await Visitor.create({
        name,
        phone,
        visitorType: visitorType || 'GUEST',
        company: company || '',
        vehicleNumber: vehicleNumber || '',
        purpose: purpose || 'Personal Visit',
        community: targetCommunity,
        villa: targetVilla,
        hostResident,
        passcode,
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=COMMUNITYHUB-VISITOR-${passcode}`,
        status: req.user.role === 'RESIDENT' ? 'PRE_APPROVED' : 'PENDING_APPROVAL'
      });

      const populated = await Visitor.findById(visitor._id)
        .populate('hostResident', 'name phone email')
        .populate('villa', 'villaNumber block');

      emitVisitorApproval(targetCommunity, hostResident, populated);
      return res.status(201).json({ success: true, visitor: populated });
    } else {
      const visitor = {
        _id: `vis_${Date.now()}`,
        name,
        phone,
        visitorType: visitorType || 'GUEST',
        company: company || '',
        vehicleNumber: vehicleNumber || '',
        purpose: purpose || 'Personal Visit',
        passcode,
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=COMMUNITYHUB-VISITOR-${passcode}`,
        status: 'PRE_APPROVED',
        hostResident: { _id: req.user._id, name: req.user.name, phone: req.user.phone },
        villa: req.user.villa || { villaNumber: 'V-101', block: 'Phase 1' }
      };

      memoryVisitors.unshift(visitor);
      emitVisitorApproval(targetCommunity, hostResident, visitor);
      return res.status(201).json({ success: true, visitor });
    }
  } catch (error) {
    next(error);
  }
};

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

    return res.status(200).json({ success: true, message: 'Visitor pass deleted' });
  } catch (error) {
    next(error);
  }
};

exports.checkInVisitor = async (req, res, next) => {
  try {
    const { passcode } = req.body;
    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected) {
      const visitor = await Visitor.findOne({ 
        passcode, 
        status: { $in: ['PRE_APPROVED', 'APPROVED'] }
      });

      if (!visitor) {
        return res.status(404).json({ success: false, message: 'Invalid passcode' });
      }

      visitor.status = 'INSIDE';
      visitor.entryTime = new Date();
      await visitor.save();

      const populated = await Visitor.findById(visitor._id)
        .populate('hostResident', 'name phone')
        .populate('villa', 'villaNumber block');

      return res.status(200).json({ success: true, visitor: populated });
    } else {
      const visitor = memoryVisitors.find(v => v.passcode === passcode);
      if (!visitor) return res.status(404).json({ success: false, message: 'Invalid passcode' });
      visitor.status = 'INSIDE';
      visitor.entryTime = new Date();
      return res.status(200).json({ success: true, visitor });
    }
  } catch (error) {
    next(error);
  }
};

exports.checkOutVisitor = async (req, res, next) => {
  try {
    const { visitorId } = req.params;
    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected && mongoose.Types.ObjectId.isValid(visitorId)) {
      const visitor = await Visitor.findById(visitorId);
      if (!visitor) return res.status(404).json({ success: false, message: 'Visitor not found' });

      visitor.status = 'EXITED';
      visitor.exitTime = new Date();
      await visitor.save();

      const populated = await Visitor.findById(visitor._id)
        .populate('hostResident', 'name phone')
        .populate('villa', 'villaNumber block');

      return res.status(200).json({ success: true, visitor: populated });
    } else {
      const visitor = memoryVisitors.find(v => v._id === visitorId);
      if (visitor) {
        visitor.status = 'EXITED';
        visitor.exitTime = new Date();
      }
      return res.status(200).json({ success: true, visitor });
    }
  } catch (error) {
    next(error);
  }
};

exports.getVisitors = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected) {
      const visitors = await Visitor.find()
        .populate('hostResident', 'name phone')
        .populate('villa', 'villaNumber block')
        .sort({ createdAt: -1 });

      return res.status(200).json({ success: true, count: visitors.length, visitors });
    } else {
      return res.status(200).json({ success: true, count: memoryVisitors.length, visitors: memoryVisitors });
    }
  } catch (error) {
    next(error);
  }
};
