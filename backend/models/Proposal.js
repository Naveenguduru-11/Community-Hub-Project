const mongoose = require('mongoose');

const voteOptionSchema = new mongoose.Schema({
  label: { type: String, required: true },
  votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { _id: true });

const proposalSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  category: {
    type: String,
    enum: ['Infrastructure', 'Rules', 'Events', 'Finance', 'Other'],
    default: 'Other'
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'closed', 'passed', 'rejected'],
    default: 'draft'
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community' },
  votingDeadline: { type: Date, required: true },
  quorumPercent: { type: Number, default: 50, min: 1, max: 100 },
  passThresholdPercent: { type: Number, default: 50, min: 1, max: 100 },
  options: {
    type: [voteOptionSchema],
    default: [
      { label: 'Yes', votes: [] },
      { label: 'No', votes: [] },
      { label: 'Abstain', votes: [] }
    ]
  },
  eligibleRoles: {
    type: [String],
    default: ['RESIDENT', 'COMMUNITY_ADMIN']
  },
  totalEligibleVoters: { type: Number, default: 0 },
  result: {
    winningOption: { type: String },
    totalVotesCast: { type: Number },
    quorumReached: { type: Boolean },
    closedAt: { type: Date },
    closedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }
}, { timestamps: true });

proposalSchema.index({ community: 1, status: 1, votingDeadline: -1 });

module.exports = mongoose.model('Proposal', proposalSchema);
