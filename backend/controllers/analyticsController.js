const mongoose = require('mongoose');
const User = require('../models/User');
const Villa = require('../models/Villa');
const Visitor = require('../models/Visitor');
const Complaint = require('../models/Complaint');
const Payment = require('../models/Payment');
const Community = require('../models/Community');
const Event = require('../models/Event');
const Notice = require('../models/Notice');

const { clearMemoryVisitors } = require('./visitorController');
const { clearMemoryComplaints } = require('./complaintController');
const { clearMemoryNotices } = require('./noticeController');
const { clearMemoryPayments } = require('./paymentController');
const { clearMemoryEvents } = require('./eventController');

exports.clearAllData = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected) {
      await Promise.all([
        Visitor.deleteMany({}),
        Complaint.deleteMany({}),
        Notice.deleteMany({}),
        Payment.deleteMany({}),
        Event.deleteMany({})
      ]);
    }

    clearMemoryVisitors();
    clearMemoryComplaints();
    clearMemoryNotices();
    clearMemoryPayments();
    clearMemoryEvents();

    return res.status(200).json({ 
      success: true, 
      message: 'All dummy data wiped successfully! App is now 100% clean.' 
    });
  } catch (error) {
    next(error);
  }
};

exports.getDashboardStats = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected) {
      const [
        totalResidents,
        totalVillas,
        activeVisitors,
        openComplaints,
        payments
      ] = await Promise.all([
        User.countDocuments({ role: 'RESIDENT' }),
        Villa.countDocuments(),
        Visitor.countDocuments({ status: 'INSIDE' }),
        Complaint.countDocuments({ status: { $in: ['OPEN', 'IN_PROGRESS'] } }),
        Payment.find()
      ]);

      const totalRevenueCollected = payments.filter(p => p.status === 'PAID').reduce((sum, p) => sum + p.totalAmount, 0);
      const pendingRevenue = payments.filter(p => p.status !== 'PAID').reduce((sum, p) => sum + p.totalAmount, 0);

      return res.status(200).json({
        success: true,
        stats: {
          totalResidents,
          totalVillas,
          activeVisitors,
          openComplaints,
          totalRevenueCollected,
          pendingRevenue
        }
      });
    } else {
      return res.status(200).json({
        success: true,
        stats: {
          totalResidents: 2,
          totalVillas: 40,
          activeVisitors: 0,
          openComplaints: 0,
          totalRevenueCollected: 0,
          pendingRevenue: 0,
          totalCommunities: 1,
          upcomingEvents: 0
        }
      });
    }
  } catch (error) {
    next(error);
  }
};
