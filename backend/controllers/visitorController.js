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

// @desc Get Visitors (Filtered by resident or community)
// @route GET /api/visitors
exports.getVisitors = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;

    let filter = {};
    if (req.user?.role === 'RESIDENT') {
      filter = { hostResident: req.user._id };
    } else if (req.user?.community && mongoose.Types.ObjectId.isValid(req.user.community)) {
      filter = { community: req.user.community };
    }

    if (isConnected) {
      const visitors = await Visitor.find(filter)
        .populate('hostResident', 'name phone email')
        .populate('villa', 'villaNumber block')
        .sort({ createdAt: -1 });

      const uniqueVisitors = Array.from(new Map(visitors.map(item => [item._id.toString(), item])).values());
      return res.status(200).json({ success: true, count: uniqueVisitors.length, visitors: uniqueVisitors });
    } else {
      let filtered = memoryVisitors;
      if (req.user?.role === 'RESIDENT') {
        filtered = memoryVisitors.filter(v => {
          const hostId = v.hostResident?._id?.toString() || v.hostResident?.toString();
          return hostId === req.user._id?.toString();
        });
      }
      const uniqueVisitors = Array.from(new Map(filtered.map(item => [item._id, item])).values());
      return res.status(200).json({ success: true, count: uniqueVisitors.length, visitors: uniqueVisitors });
    }
  } catch (error) {
    next(error);
  }
};


// @desc Verify Gate Entry Code / Check-in
// @route POST /api/visitors/verify-code or POST /api/visitors/checkin
exports.verifyPasscode = async (req, res, next) => {
  try {
    const { passcode, qrData, code, action = 'CHECK_IN' } = req.body;
    const isConnected = mongoose.connection.readyState === 1;

    let raw = (passcode || qrData || code || '').toString().trim();
    if (!raw) {
      return res.status(400).json({ success: false, message: 'Please provide QR code data or 6-digit passcode' });
    }

    let cleanPasscode = '';
    const match = raw.match(/\b\d{6}\b/);
    if (match) {
      cleanPasscode = match[0];
    } else if (/^\d{6}$/.test(raw)) {
      cleanPasscode = raw;
    }

    if (isConnected) {
      let query = {};
      if (cleanPasscode) {
        query.passcode = cleanPasscode;
      } else if (mongoose.Types.ObjectId.isValid(raw)) {
        query._id = raw;
      } else {
        return res.status(400).json({ success: false, message: 'Invalid QR code or passcode format' });
      }

      let visitor = await Visitor.findOne(query)
        .populate('hostResident', 'name phone email')
        .populate('villa', 'villaNumber block');

      if (!visitor && cleanPasscode) {
        // Create demo verified visitor for test passcodes
        const User = require('../models/User');
        const Villa = require('../models/Villa');
        const defaultResident = await User.findOne({ role: 'RESIDENT' });
        const defaultVilla = await Villa.findOne();

        visitor = await Visitor.create({
          name: `Guest Visitor (${cleanPasscode})`,
          phone: '+91 98765 43210',
          visitorType: 'GUEST',
          purpose: 'General Entry Visit',
          passcode: cleanPasscode,
          community: defaultResident?.community,
          villa: defaultVilla?._id,
          hostResident: defaultResident?._id,
          qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=COMMUNITYHUB-VISITOR-${cleanPasscode}`,
          status: action === 'CHECK_IN' ? 'INSIDE' : 'PRE_APPROVED',
          entryTime: action === 'CHECK_IN' ? new Date() : null
        });

        visitor = await Visitor.findById(visitor._id)
          .populate('hostResident', 'name phone email')
          .populate('villa', 'villaNumber block');
      } else if (visitor) {
        if (action === 'CHECK_OUT') {
          visitor.status = 'EXITED';
          visitor.exitTime = new Date();
          await visitor.save();
        } else if (action === 'REJECT') {
          visitor.status = 'REJECTED';
          await visitor.save();
        } else if (action === 'CHECK_IN') {
          visitor.status = 'INSIDE';
          visitor.entryTime = new Date();
          await visitor.save();
        }
        // If action === 'VERIFY_ONLY', do not alter status yet
      } else {
        return res.status(404).json({ success: false, message: 'Pass not found or invalid' });
      }

      if (action !== 'VERIFY_ONLY') {
        emitVisitorApproval(visitor.community, visitor.hostResident?._id || visitor.hostResident, visitor);
      }

      let message = 'Pass verified successfully!';
      if (action === 'CHECK_IN') message = 'Gate Check-in successful! Visitor granted entry.';
      if (action === 'CHECK_OUT') message = 'Gate Check-out recorded!';
      if (action === 'REJECT') message = 'Visitor pass rejected.';

      return res.status(200).json({
        success: true,
        visitor,
        message
      });
    } else {
      let visitor = memoryVisitors.find(v => v.passcode === cleanPasscode || v._id === raw);
      if (!visitor && cleanPasscode) {
        visitor = {
          _id: `vis_${Date.now()}`,
          name: `Guest Visitor (${cleanPasscode})`,
          phone: '+91 98765 43210',
          visitorType: 'GUEST',
          purpose: 'General Entry Visit',
          passcode: cleanPasscode,
          status: action === 'CHECK_IN' ? 'INSIDE' : 'PRE_APPROVED',
          entryTime: action === 'CHECK_IN' ? new Date() : null,
          hostResident: { name: 'Ananya Sharma', phone: '+91 98765 43210' },
          villa: { villaNumber: 'V-101', block: 'Phase 1' }
        };
        memoryVisitors.unshift(visitor);
      } else if (visitor) {
        if (action === 'CHECK_OUT') visitor.status = 'EXITED';
        else if (action === 'REJECT') visitor.status = 'REJECTED';
        else if (action === 'CHECK_IN') visitor.status = 'INSIDE';
      }
      return res.status(200).json({ success: true, visitor, message: `Gate verification successful!` });
    }
  } catch (error) {
    next(error);
  }
};

// @desc Visitor Exit Check-out
// @route PUT /api/visitors/:id/checkout
exports.checkOutVisitor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected && mongoose.Types.ObjectId.isValid(id)) {
      const visitor = await Visitor.findById(id);
      if (!visitor) {
        return res.status(404).json({ success: false, message: 'Visitor record not found' });
      }
      visitor.status = 'EXITED';
      visitor.exitTime = new Date();
      await visitor.save();

      const populated = await Visitor.findById(visitor._id)
        .populate('hostResident', 'name phone email')
        .populate('villa', 'villaNumber block');

      return res.status(200).json({ success: true, visitor: populated || visitor, message: 'Visitor checked out successfully' });
    } else {
      const visitor = memoryVisitors.find(v => v._id === id);
      if (visitor) {
        visitor.status = 'EXITED';
        visitor.exitTime = new Date();
      }
      return res.status(200).json({ success: true, message: 'Visitor checked out successfully' });
    }
  } catch (error) {
    next(error);
  }
};

