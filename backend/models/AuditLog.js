const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: [
      'PROPOSAL_CREATED',
      'PROPOSAL_STATUS_CHANGED',
      'PROPOSAL_ACTIVATED',
      'PROPOSAL_CLOSED',
      'PROPOSAL_DELETED',
      'VOTE_CAST',
      'VOTE_CHANGED',
      'USER_LOGIN',
      'USER_LOGOUT',
      'USER_REGISTERED',
      'COMPLAINT_CREATED',
      'COMPLAINT_RESOLVED',
      'NOTICE_PUBLISHED',
      'PAYMENT_RECORDED',
      'VISITOR_APPROVED',
      'SETTINGS_CHANGED'
    ]
  },
  actor: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String },
    role: { type: String },
    email: { type: String }
  },
  targetId: { type: String },
  targetModel: { type: String },
  community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community' },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  ip: { type: String, default: '' },
  userAgent: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now, immutable: true }
}, {
  timestamps: false,
  // Prevent modification after creation
  strict: true
});

auditLogSchema.index({ community: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ 'actor.userId': 1, timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
