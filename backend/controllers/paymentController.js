const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const Villa = require('../models/Villa');
const { createRazorpayOrder, verifyRazorpaySignature } = require('../services/razorpayService');
const { emitPaymentSuccess } = require('../services/socketService');

let memoryPayments = [];

exports.clearMemoryPayments = () => {
  memoryPayments = [];
};


// Generate Bulk Monthly Maintenance Bills across occupied villas
exports.generateBills = async (req, res, next) => {
  try {
    const { month, dueDate, amount } = req.body;
    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected) {
      const Villa = require('../models/Villa');
      const User = require('../models/User');

      const villas = await Villa.find().populate('owner tenant');
      const createdBills = [];

      for (const villa of villas) {
        let residentUser = villa.tenant || villa.owner;

        if (!residentUser) {
          residentUser = await User.findOne({
            role: 'RESIDENT',
            $or: [
              { villa: villa._id },
              { villaNumber: villa.villaNumber }
            ]
          });
        }

        const receiptNumber = `INV-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

        const bill = await Payment.create({
          title: `Monthly Maintenance Fee - ${month || 'August 2026'}`,
          billType: 'MAINTENANCE',
          month: month || 'August 2026',
          amount: Number(amount) || 4500,
          totalAmount: Number(amount) || 4500,
          dueDate: dueDate || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          resident: residentUser ? (residentUser._id || residentUser) : null,
          villa: villa._id,
          community: villa.community || req.user.community,
          receiptNumber,
          isAdminIssued: true
        });
        createdBills.push(bill);
      }

      return res.status(201).json({ success: true, count: createdBills.length, bills: createdBills });
    } else {
      const bill = {
        _id: `pay_${Date.now()}`,
        title: `Monthly Maintenance Fee - ${month || 'August 2026'}`,
        billType: 'MAINTENANCE',
        month: month || 'August 2026',
        amount: Number(amount) || 4500,
        totalAmount: Number(amount) || 4500,
        status: 'PENDING',
        dueDate: dueDate || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        resident: { _id: req.user._id, name: req.user.name, email: req.user.email },
        villa: { _id: 'villa_101', villaNumber: 'V-101', block: 'Phase 1 - Royal Palms' },
        receiptNumber: `INV-${Date.now()}-101`
      };
      memoryPayments.unshift(bill);
      return res.status(201).json({ success: true, bills: [bill] });
    }
  } catch (error) {
    next(error);
  }
};

// Create Custom / Other Bill (Utility, EV Charging, Event Fee, Repair Fine) - Admin feature
exports.createCustomBill = async (req, res, next) => {
  try {
    const { title, billType, month, amount, dueDate, villaId, residentId, adminNotes } = req.body;
    const receiptNumber = `INV-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected) {
      const Villa = require('../models/Villa');
      const User = require('../models/User');

      let targetVilla = null;
      if (villaId && mongoose.Types.ObjectId.isValid(villaId)) {
        targetVilla = await Villa.findById(villaId).populate('owner tenant');
      } else if (villaId) {
        targetVilla = await Villa.findOne({ villaNumber: villaId }).populate('owner tenant');
      }

      let targetResidentId = residentId;
      if (!targetResidentId && targetVilla) {
        targetResidentId = targetVilla.owner?._id || targetVilla.tenant?._id || targetVilla.owner || targetVilla.tenant;
      }

      // If villa has no direct owner link, find resident registered with this villa ID or villaNumber
      if (!targetResidentId && targetVilla) {
        const residentUser = await User.findOne({
          role: 'RESIDENT',
          $or: [
            { villa: targetVilla._id },
            { villaNumber: targetVilla.villaNumber }
          ]
        });
        if (residentUser) {
          targetResidentId = residentUser._id;
          if (!targetVilla.owner) {
            targetVilla.owner = residentUser._id;
            await targetVilla.save();
          }
        }
      }

      // If still not found, check if there is an active resident in the community
      if (!targetResidentId && req.user.role === 'RESIDENT') {
        targetResidentId = req.user._id;
      }

      const bill = await Payment.create({
        title: title || 'Custom Society Charge',
        billType: billType || 'UTILITY',
        month: month || 'August 2026',
        amount: Number(amount) || 1000,
        totalAmount: Number(amount) || 1000,
        dueDate: dueDate || new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        resident: targetResidentId || null,
        villa: targetVilla?._id || (mongoose.Types.ObjectId.isValid(villaId) ? villaId : null),
        community: targetVilla?.community || req.user.community,
        receiptNumber,
        adminNotes: adminNotes || '',
        isAdminIssued: true
      });

      const populated = await Payment.findById(bill._id)
        .populate('resident', 'name email phone')
        .populate('villa', 'villaNumber block');

      return res.status(201).json({ success: true, bill: populated });
    } else {
      let residentInfo = { _id: req.user._id, name: req.user.name, email: req.user.email };
      const bill = {
        _id: `pay_${Date.now()}`,
        title: title || 'Custom Society Charge',
        billType: billType || 'UTILITY',
        month: month || 'August 2026',
        amount: Number(amount) || 1000,
        totalAmount: Number(amount) || 1000,
        status: 'PENDING',
        dueDate: dueDate || new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        resident: residentInfo,
        villa: { _id: villaId || 'villa_101', villaNumber: 'V-101', block: 'Phase 1' },
        receiptNumber,
        adminNotes: adminNotes || ''
      };
      memoryPayments.unshift(bill);
      return res.status(201).json({ success: true, bill });
    }
  } catch (error) {
    next(error);
  }
};


// Edit Existing Bill - Admin feature (Increase/Decrease Amount & Add Notes)
exports.updateBill = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, billType, month, amount, dueDate, status, adminNotes } = req.body;
    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected && mongoose.Types.ObjectId.isValid(id)) {
      const updateData = {};
      if (title !== undefined) updateData.title = title;
      if (billType !== undefined) updateData.billType = billType;
      if (month !== undefined) updateData.month = month;
      if (amount !== undefined) {
        updateData.amount = Number(amount);
        updateData.totalAmount = Number(amount);
      }
      if (dueDate !== undefined) updateData.dueDate = dueDate;
      if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
      if (status !== undefined) {
        updateData.status = status;
        if (status === 'PAID') updateData.paidDate = new Date();
      }

      const bill = await Payment.findByIdAndUpdate(id, updateData, { new: true })
        .populate('resident', 'name email phone')
        .populate('villa', 'villaNumber block');

      return res.status(200).json({ success: true, bill });
    } else {
      const bill = memoryPayments.find(p => p._id === id);
      if (bill) {
        if (title !== undefined) bill.title = title;
        if (billType !== undefined) bill.billType = billType;
        if (month !== undefined) bill.month = month;
        if (amount !== undefined) {
          bill.amount = Number(amount);
          bill.totalAmount = Number(amount);
        }
        if (dueDate !== undefined) bill.dueDate = dueDate;
        if (adminNotes !== undefined) bill.adminNotes = adminNotes;
        if (status !== undefined) {
          bill.status = status;
          if (status === 'PAID') bill.paidDate = new Date();
        }
      }
      return res.status(200).json({ success: true, bill });
    }
  } catch (error) {
    next(error);
  }
};

// Delete Bill - Admin feature
exports.deleteBill = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected && mongoose.Types.ObjectId.isValid(id)) {
      await Payment.findByIdAndDelete(id);
    } else {
      const idx = memoryPayments.findIndex(p => p._id === id);
      if (idx > -1) memoryPayments.splice(idx, 1);
    }

    return res.status(200).json({ success: true, message: 'Bill deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.createOrder = async (req, res, next) => {
  try {
    const { paymentId, customKeyId, customKeySecret } = req.body;
    const isConnected = mongoose.connection.readyState === 1;

    let bill;
    if (isConnected && mongoose.Types.ObjectId.isValid(paymentId)) {
      bill = await Payment.findById(paymentId);
    } else {
      bill = memoryPayments.find(p => p._id === paymentId) || memoryPayments[0];
    }

    if (!bill) return res.status(404).json({ success: false, message: 'Maintenance bill record not found' });

    const order = await createRazorpayOrder(bill.totalAmount, bill.receiptNumber, customKeyId, customKeySecret);

    if (isConnected && mongoose.Types.ObjectId.isValid(bill._id)) {
      bill.razorpayOrderId = order.id;
      await bill.save();
    } else {
      bill.razorpayOrderId = order.id;
    }

    const keyIdToReturn = customKeyId || process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_key';

    return res.status(200).json({
      success: true,
      order,
      keyId: keyIdToReturn,
      bill
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, paymentId, customKeySecret } = req.body;

    const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature, customKeySecret);

    if (!isValid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Razorpay HMAC signature verification failed. Untrusted payment attempt.' 
      });
    }

    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected && mongoose.Types.ObjectId.isValid(paymentId || req.params.id)) {
      const bill = await Payment.findById(paymentId || req.params.id);
      if (!bill) return res.status(404).json({ success: false, message: 'Payment record not found' });

      bill.status = 'PAID';
      bill.paidDate = new Date();
      bill.razorpayPaymentId = razorpayPaymentId || `pay_rzp_${Date.now()}`;
      bill.razorpaySignature = razorpaySignature || 'sig_verified_hmac';
      await bill.save();

      const populated = await Payment.findById(bill._id)
        .populate('resident', 'name email phone')
        .populate('villa', 'villaNumber block');

      emitPaymentSuccess(bill.community, bill.resident, populated);
      return res.status(200).json({ success: true, message: 'Razorpay payment verified successfully', payment: populated });
    } else {
      const bill = memoryPayments.find(p => p._id === (paymentId || req.params.id)) || memoryPayments[0];
      if (bill) {
        bill.status = 'PAID';
        bill.paidDate = new Date();
        bill.razorpayPaymentId = razorpayPaymentId || `pay_rzp_${Date.now()}`;
        bill.razorpaySignature = razorpaySignature || 'sig_verified_hmac';
        emitPaymentSuccess(req.user?.community, req.user?._id, bill);
      }
      return res.status(200).json({ success: true, message: 'Razorpay payment verified successfully', payment: bill });
    }
  } catch (error) {
    next(error);
  }
};

exports.getPayments = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;

    // Residents: see bills matching their user ID, villa ID, or community broad bills
    // Admins: see all community bills
    let filter = {};
    if (req.user?.role === 'RESIDENT') {
      const orConditions = [
        { resident: req.user._id },
        { 'resident._id': req.user._id },
      ];
      if (req.user.villa && mongoose.Types.ObjectId.isValid(req.user.villa)) {
        orConditions.push({ villa: req.user.villa });
      }
      if (req.user.community && mongoose.Types.ObjectId.isValid(req.user.community)) {
        orConditions.push({ community: req.user.community, resident: null });
      }
      filter = { $or: orConditions };
    } else if (req.user?.community && mongoose.Types.ObjectId.isValid(req.user.community)) {
      filter = { community: req.user.community };
    }

    if (isConnected) {
      const payments = await Payment.find(filter)
        .populate('resident', 'name email phone villaNumber')
        .populate('villa', 'villaNumber block')
        .sort({ createdAt: -1 });

      const uniquePayments = Array.from(
        new Map(payments.map(item => [item.receiptNumber || item._id.toString(), item])).values()
      );
      return res.status(200).json({ success: true, count: uniquePayments.length, payments: uniquePayments });
    } else {
      // Memory fallback — show matching bills
      let filtered = memoryPayments;
      if (req.user?.role === 'RESIDENT') {
        filtered = memoryPayments.filter(p => {
          const residentId = p.resident?._id?.toString() || p.resident?.toString();
          const villaId = p.villa?._id?.toString() || p.villa?.toString();
          const userVillaId = req.user.villa?._id?.toString() || req.user.villa?.toString();
          return !residentId || residentId === req.user._id?.toString() || (userVillaId && villaId === userVillaId);
        });
      }
      const uniquePayments = Array.from(
        new Map(filtered.map(item => [item.receiptNumber || item._id, item])).values()
      );
      return res.status(200).json({ success: true, count: uniquePayments.length, payments: uniquePayments });
    }
  } catch (error) {
    next(error);
  }
};

// DELETE /api/payments/purge-phantom — admin only: removes all auto-seeded phantom bills from DB
exports.purgePhantomBills = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    if (isConnected) {
      const result = await Payment.deleteMany({ isAdminIssued: { $ne: true } });
      return res.json({ success: true, deleted: result.deletedCount, message: `Removed ${result.deletedCount} phantom auto-seeded bills from the database.` });
    } else {
      const before = memoryPayments.length;
      memoryPayments = memoryPayments.filter(p => p.isAdminIssued === true);
      return res.json({ success: true, deleted: before - memoryPayments.length });
    }
  } catch (error) {
    next(error);
  }
};


// GET /api/payments/summary — admin: per-resident payment summary grouped by villa
exports.getPaymentSummary = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected) {
      const filter = req.user?.community && mongoose.Types.ObjectId.isValid(req.user.community)
        ? { community: req.user.community }
        : {};

      const payments = await Payment.find(filter)
        .populate('resident', 'name email phone villaNumber avatar')
        .populate('villa', 'villaNumber block')
        .sort({ createdAt: -1 });

      // Group by resident
      const grouped = {};
      for (const p of payments) {
        const key = p.resident?._id?.toString() || p.villa?._id?.toString() || 'unknown';
        if (!grouped[key]) {
          grouped[key] = {
            resident: p.resident,
            villa: p.villa,
            bills: [],
            totalDue: 0,
            totalPaid: 0
          };
        }
        grouped[key].bills.push(p);
        if (p.status === 'PAID') {
          grouped[key].totalPaid += p.totalAmount || 0;
        } else {
          grouped[key].totalDue += p.totalAmount || 0;
        }
      }

      return res.status(200).json({
        success: true,
        summary: Object.values(grouped),
        allPayments: payments
      });
    } else {
      // Memory fallback grouped summary
      const grouped = {};
      for (const p of memoryPayments) {
        const key = p.resident?._id?.toString() || p.villa?._id?.toString() || 'unknown';
        if (!grouped[key]) {
          grouped[key] = { resident: p.resident, villa: p.villa, bills: [], totalDue: 0, totalPaid: 0 };
        }
        grouped[key].bills.push(p);
        if (p.status === 'PAID') grouped[key].totalPaid += p.totalAmount || 0;
        else grouped[key].totalDue += p.totalAmount || 0;
      }
      return res.status(200).json({ success: true, summary: Object.values(grouped), allPayments: memoryPayments });
    }
  } catch (error) {
    next(error);
  }
};
