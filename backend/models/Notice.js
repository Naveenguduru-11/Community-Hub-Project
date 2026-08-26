const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['GENERAL', 'URGENT', 'MAINTENANCE', 'SECURITY', 'EVENT'], 
    default: 'GENERAL' 
  },
  priority: { type: String, enum: ['NORMAL', 'IMPORTANT', 'CRITICAL'], default: 'NORMAL' },
  community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', required: false },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  attachmentUrl: { type: String, default: '' },
  expiresAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Notice', noticeSchema);
