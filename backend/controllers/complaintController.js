const mongoose = require('mongoose');
const Complaint = require('../models/Complaint');
const { emitComplaintUpdate } = require('../services/socketService');

let memoryComplaints = [];

exports.clearMemoryComplaints = () => {
  memoryComplaints = [];
};

exports.createComplaint = async (req, res, next) => {
  try {
    const { title, description, category, priority, imageUrl } = req.body;
    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected) {
      const complaint = await Complaint.create({
        title,
        description,
        category: category || 'OTHER',
        priority: priority || 'MEDIUM',
        imageUrl: imageUrl || '',
        raisedBy: req.user._id,
        villa: req.user.villa,
        community: req.user.community
      });

      const populated = await Complaint.findById(complaint._id)
        .populate('raisedBy', 'name email phone')
        .populate('villa', 'villaNumber block');

      emitComplaintUpdate(req.user.community, req.user._id, populated);
      return res.status(201).json({ success: true, complaint: populated });
    } else {
      const complaint = {
        _id: `cmp_${Date.now()}`,
        title,
        description,
        category: category || 'OTHER',
        priority: priority || 'MEDIUM',
        status: 'OPEN',
        raisedBy: { _id: req.user._id, name: req.user.name, email: req.user.email },
        villa: req.user.villa || { villaNumber: 'V-101', block: 'Phase 1' },
        assignedTo: 'Maintenance Team'
      };

      memoryComplaints.unshift(complaint);
      emitComplaintUpdate(req.user.community, req.user._id, complaint);
      return res.status(201).json({ success: true, complaint });
    }
  } catch (error) {
    next(error);
  }
};

exports.deleteComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected && mongoose.Types.ObjectId.isValid(id)) {
      await Complaint.findByIdAndDelete(id);
    } else {
      const idx = memoryComplaints.findIndex(c => c._id === id);
      if (idx > -1) memoryComplaints.splice(idx, 1);
    }

    return res.status(200).json({ success: true, message: 'Complaint ticket deleted' });
  } catch (error) {
    next(error);
  }
};

exports.getComplaints = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected) {
      const complaints = await Complaint.find()
        .populate('raisedBy', 'name phone email')
        .populate('villa', 'villaNumber block')
        .sort({ createdAt: -1 });

      return res.status(200).json({ success: true, count: complaints.length, complaints });
    } else {
      return res.status(200).json({ success: true, count: memoryComplaints.length, complaints: memoryComplaints });
    }
  } catch (error) {
    next(error);
  }
};

exports.updateComplaintStatus = async (req, res, next) => {
  try {
    const { status, assignedTo, resolutionNotes } = req.body;
    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected && mongoose.Types.ObjectId.isValid(req.params.id)) {
      const complaint = await Complaint.findByIdAndUpdate(req.params.id, {
        status,
        assignedTo,
        resolutionNotes
      }, { new: true })
        .populate('raisedBy', 'name phone email')
        .populate('villa', 'villaNumber block');

      if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

      emitComplaintUpdate(complaint.community, complaint.raisedBy._id, complaint);
      return res.status(200).json({ success: true, complaint });
    } else {
      const complaint = memoryComplaints.find(c => c._id === req.params.id);
      if (complaint) {
        complaint.status = status;
        if (assignedTo) complaint.assignedTo = assignedTo;
      }
      return res.status(200).json({ success: true, complaint });
    }
  } catch (error) {
    next(error);
  }
};
