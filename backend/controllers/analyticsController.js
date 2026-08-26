const mongoose = require('mongoose');
const User = require('../models/User');
const Villa = require('../models/Villa');
const Visitor = require('../models/Visitor');
const Complaint = require('../models/Complaint');
const Payment = require('../models/Payment');
const Community = require('../models/Community');
const Event = require('../models/Event');
const Notice = require('../models/Notice');

const { clearAllResidents, getMemoryUsers } = require('./authController');
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
        User.deleteMany({ role: 'RESIDENT' }),
        Visitor.deleteMany({}),
        Complaint.deleteMany({}),
        Notice.deleteMany({}),
        Payment.deleteMany({}),
        Event.deleteMany({})
      ]);
    }

    clearAllResidents();
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
          totalResidents: 0,
          totalVillas: 0,
          activeVisitors: 0,
          openComplaints: 0,
          totalRevenueCollected: 0,
          pendingRevenue: 0,
          totalCommunities: 0,
          upcomingEvents: 0
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc Get Live Database Explorer Dump (Inspecting Database)
// @route GET /api/analytics/database
exports.getDatabaseExplorerData = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    const dbName = isConnected ? (mongoose.connection.db?.databaseName || 'communityhub') : 'communityhub_resilient_store';

    let users = [], villas = [], communities = [], visitors = [], complaints = [], notices = [], payments = [], events = [];

    if (isConnected) {
      [users, villas, communities, visitors, complaints, notices, payments, events] = await Promise.all([
        User.find().select('-password').lean(),
        Villa.find().lean(),
        Community.find().lean(),
        Visitor.find().lean(),
        Complaint.find().lean(),
        Notice.find().lean(),
        Payment.find().lean(),
        Event.find().lean()
      ]);
    } else {
      users = getMemoryUsers().map(({ password, ...u }) => u);
    }

    return res.status(200).json({
      success: true,
      dbInfo: {
        databaseName: dbName,
        connectionState: isConnected ? 'CONNECTED' : 'RESILIENT_IN_MEMORY',
        connectionUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/communityhub',
        connectedAt: new Date()
      },
      collections: {
        users: { name: 'users', count: users.length, documents: users },
        villas: { name: 'villas', count: villas.length, documents: villas },
        communities: { name: 'communities', count: communities.length, documents: communities },
        visitors: { name: 'visitors', count: visitors.length, documents: visitors },
        complaints: { name: 'complaints', count: complaints.length, documents: complaints },
        notices: { name: 'notices', count: notices.length, documents: notices },
        payments: { name: 'payments', count: payments.length, documents: payments },
        events: { name: 'events', count: events.length, documents: events }
      }
    });
  } catch (error) {
    next(error);
  }
};
