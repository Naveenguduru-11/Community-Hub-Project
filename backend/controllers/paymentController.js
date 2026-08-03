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
      const villas = await Villa.find({ 
        occupancyStatus: { $in: ['OWNER_OCCUPIED', 'TENANT_OCCUPIED'] } 
      }).populate('owner tenant');

      const createdBills = [];
      for (const villa of villas) {
        const residentUser = villa.tenant || villa.owner;
        const receiptNumber = `INV-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

        const bill = await Payment.create({
          title: `Monthly Maintenance Fee - ${month || 'August 2026'}`,
          billType: 'MAINTENANCE',
          month: month || 'August 2026',
          amount: amount || 4500,
          totalAmount: amount || 4500,
          dueDate: dueDate || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          resident: residentUser ? residentUser._id : null,
          villa: villa._id,
          community: villa.community,
          receiptNumber
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
        amount: amount || 4500,
        totalAmount: amount || 4500,
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
    const { title, billType, month, amount, dueDate, villaId, residentId } = req.body;
    const receiptNumber = `INV-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected && mongoose.Types.ObjectId.isValid(villaId)) {
      const bill = await Payment.create({
        title: title || 'Custom Society Charge',
        billType: billType || 'UTILITY',
        month: month || 'August 2026',
        amount: Number(amount) || 1000,
        totalAmount: Number(amount) || 1000,
        dueDate: dueDate || new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        resident: residentId || req.user._id,
        villa: villaId,
        community: req.user.community,
        receiptNumber
      });

      const populated = await Payment.findById(bill._id)
        .populate('resident', 'name email phone')
        .populate('villa', 'villaNumber block');

      return res.status(201).json({ success: true, bill: populated });
    } else {
      const bill = {
        _id: `pay_${Date.now()}`,
        title: title || 'Custom Society Charge',
        billType: billType || 'UTILITY',
        month: month || 'August 2026',
        amount: Number(amount) || 1000,
        totalAmount: Number(amount) || 1000,
        status: 'PENDING',
        dueDate: dueDate || new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        resident: { _id: req.user._id, name: req.user.name, email: req.user.email },
        villa: { _id: villaId || 'villa_101', villaNumber: 'V-101', block: 'Phase 1' },
        receiptNumber
      };
      memoryPayments.unshift(bill);
      return res.status(201).json({ success: true, bill });
    }
  } catch (error) {
    next(error);
  }
};

// Edit Existing Bill - Admin feature
exports.updateBill = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, billType, month, amount, dueDate, status } = req.body;
    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected && mongoose.Types.ObjectId.isValid(id)) {
      const updateData = {};
      if (title) updateData.title = title;
      if (billType) updateData.billType = billType;
      if (month) updateData.month = month;
      if (amount) {
        updateData.amount = Number(amount);
        updateData.totalAmount = Number(amount);
      }
      if (dueDate) updateData.dueDate = dueDate;
      if (status) {
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
        if (title) bill.title = title;
        if (billType) bill.billType = billType;
        if (month) bill.month = month;
        if (amount) {
          bill.amount = Number(amount);
          bill.totalAmount = Number(amount);
        }
        if (dueDate) bill.dueDate = dueDate;
        if (status) {
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

    if (isConnected) {
      const payments = await Payment.find()
        .populate('resident', 'name email phone')
        .populate('villa', 'villaNumber block')
        .sort({ createdAt: -1 });

      return res.status(200).json({ success: true, count: payments.length, payments });
    } else {
      return res.status(200).json({ success: true, count: memoryPayments.length, payments: memoryPayments });
    }
  } catch (error) {
    next(error);
  }
};
