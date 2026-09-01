const mongoose = require('mongoose');
const Notice = require('../models/Notice');
const { emitNoticePublished } = require('../services/socketService');

let memoryNotices = [];

exports.clearMemoryNotices = () => {
  memoryNotices = [];
};


exports.createNotice = async (req, res, next) => {
  try {
    const { title, content, category, priority } = req.body;
    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected) {
      const notice = await Notice.create({
        title,
        content,
        category: category || 'GENERAL',
        priority: priority || 'NORMAL',
        community: req.user.community,
        author: req.user._id
      });

      const populated = await Notice.findById(notice._id).populate('author', 'name role');
      emitNoticePublished(req.user.community, populated);
      return res.status(201).json({ success: true, notice: populated });
    } else {
      const notice = {
        _id: `not_${Date.now()}`,
        title,
        content,
        category: category || 'GENERAL',
        priority: priority || 'NORMAL',
        author: { name: req.user.name, role: req.user.role },
        createdAt: new Date()
      };
      memoryNotices.unshift(notice);
      emitNoticePublished(req.user.community, notice);
      return res.status(201).json({ success: true, notice });
    }
  } catch (error) {
    next(error);
  }
};

exports.getNotices = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected) {
      const notices = await Notice.find().populate('author', 'name role').sort({ createdAt: -1 });
      const uniqueNotices = Array.from(new Map(notices.map(item => [item._id.toString(), item])).values());
      return res.status(200).json({ success: true, count: uniqueNotices.length, notices: uniqueNotices });
    } else {
      const uniqueNotices = Array.from(new Map(memoryNotices.map(item => [item._id, item])).values());
      return res.status(200).json({ success: true, count: uniqueNotices.length, notices: uniqueNotices });
    }
  } catch (error) {
    next(error);
  }
};

exports.deleteNotice = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected) {
      await Notice.findByIdAndDelete(req.params.id);
    } else {
      const idx = memoryNotices.findIndex(n => n._id === req.params.id);
      if (idx > -1) memoryNotices.splice(idx, 1);
    }
    return res.status(200).json({ success: true, message: 'Notice deleted' });
  } catch (error) {
    next(error);
  }
};

exports.updateNotice = async (req, res, next) => {
  try {
    const { title, content, category, priority } = req.body;
    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected && mongoose.Types.ObjectId.isValid(req.params.id)) {
      const notice = await Notice.findByIdAndUpdate(
        req.params.id,
        { title, content, category, priority },
        { new: true, runValidators: true }
      ).populate('author', 'name role');

      if (!notice) return res.status(404).json({ success: false, message: 'Notice not found' });
      return res.status(200).json({ success: true, notice });
    } else {
      const notice = memoryNotices.find(n => n._id === req.params.id);
      if (notice) {
        if (title) notice.title = title;
        if (content) notice.content = content;
        if (category) notice.category = category;
        if (priority) notice.priority = priority;
        notice.updatedAt = new Date();
      }
      return res.status(200).json({ success: true, notice });
    }
  } catch (error) {
    next(error);
  }
};
