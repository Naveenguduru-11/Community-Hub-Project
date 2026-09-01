const mongoose = require('mongoose');
const Complaint = require('../models/Complaint');
const { emitComplaintUpdate } = require('../services/socketService');

let memoryComplaints = [];

exports.clearMemoryComplaints = () => {
  memoryComplaints = [];
};

// @desc Create New Complaint Ticket
// @route POST /api/complaints
exports.createComplaint = async (req, res, next) => {
  try {
    const { title, description, category, priority, imageUrl, villaNumber } = req.body;
    const isConnected = mongoose.connection.readyState === 1;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Please enter complaint title and description' });
    }

    if (isConnected) {
      const complaintData = {
        title,
        description,
        category: category || 'OTHER',
        priority: priority || 'MEDIUM',
        imageUrl: imageUrl || '',
        raisedBy: req.user._id,
        villaNumber: villaNumber || 'Villa 101'
      };

      if (req.user.villa) complaintData.villa = req.user.villa;
      if (req.user.community) complaintData.community = req.user.community;

      const complaint = await Complaint.create(complaintData);

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
        villa: req.user.villa || { villaNumber: villaNumber || 'V-101', block: 'Phase 1' },
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

// @desc Delete Complaint Ticket
// @route DELETE /api/complaints/:id
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

// @desc Get Complaints (Filtered by resident or community)
// @route GET /api/complaints
exports.getComplaints = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;

    let filter = {};
    if (req.user?.role === 'RESIDENT') {
      filter = { raisedBy: req.user._id };
    } else if (req.user?.community && mongoose.Types.ObjectId.isValid(req.user.community)) {
      filter = { community: req.user.community };
    }

    if (isConnected) {
      const complaints = await Complaint.find(filter)
        .populate('raisedBy', 'name phone email')
        .populate('villa', 'villaNumber block')
        .sort({ createdAt: -1 });

      const uniqueComplaints = Array.from(new Map(complaints.map(item => [item._id.toString(), item])).values());
      return res.status(200).json({ success: true, count: uniqueComplaints.length, complaints: uniqueComplaints });
    } else {
      let filtered = memoryComplaints;
      if (req.user?.role === 'RESIDENT') {
        filtered = memoryComplaints.filter(c => {
          const raisedById = c.raisedBy?._id?.toString() || c.raisedBy?.toString();
          return raisedById === req.user._id?.toString();
        });
      }
      const uniqueComplaints = Array.from(new Map(filtered.map(item => [item._id, item])).values());
      return res.status(200).json({ success: true, count: uniqueComplaints.length, complaints: uniqueComplaints });
    }
  } catch (error) {
    next(error);
  }
};


// @desc Update Complaint Status / Assignment / Resolution Notes
// @route PUT /api/complaints/:id
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
