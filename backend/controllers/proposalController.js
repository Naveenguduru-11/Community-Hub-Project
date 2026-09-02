const mongoose = require('mongoose');
const Proposal = require('../models/Proposal');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');

// In-memory fallback store
let memoryProposals = [];
let memoryAuditLogs = [];

exports.clearMemoryProposals = () => { memoryProposals = []; };
exports.clearMemoryAuditLogs = () => { memoryAuditLogs = []; };

// ─── Shared audit logger ────────────────────────────────────────────────────
const logAudit = async (action, actor, targetId, targetModel, community, metadata, req) => {
  const entry = {
    action,
    actor: {
      userId: actor._id || actor.userId,
      name: actor.name,
      role: actor.role,
      email: actor.email
    },
    targetId: targetId ? targetId.toString() : null,
    targetModel,
    community: community || null,
    metadata,
    ip: req?.ip || '',
    userAgent: req?.headers?.['user-agent'] || '',
    timestamp: new Date()
  };

  const isConnected = mongoose.connection.readyState === 1;
  if (isConnected) {
    try { await AuditLog.create(entry); } catch (e) { console.error('Audit log error:', e.message); }
  } else {
    memoryAuditLogs.unshift({ _id: `aud_${Date.now()}_${Math.random()}`, ...entry });
    if (memoryAuditLogs.length > 500) memoryAuditLogs.length = 500;
  }
};
exports.logAudit = logAudit;

// ─── GET /api/proposals ──────────────────────────────────────────────────────
exports.getProposals = async (req, res, next) => {
  try {
    const { status, category } = req.query;
    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected) {
      const filter = {};
      if (req.user.community) filter.community = req.user.community;
      if (status) filter.status = status;
      if (category) filter.category = category;

      const proposals = await Proposal.find(filter)
        .populate('createdBy', 'name role avatar')
        .sort({ createdAt: -1 });

      return res.json({ success: true, count: proposals.length, proposals });
    } else {
      let list = [...memoryProposals];
      if (status) list = list.filter(p => p.status === status);
      if (category) list = list.filter(p => p.category === category);
      return res.json({ success: true, count: list.length, proposals: list });
    }
  } catch (error) { next(error); }
};

// ─── GET /api/proposals/:id ──────────────────────────────────────────────────
exports.getProposalById = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected && mongoose.Types.ObjectId.isValid(req.params.id)) {
      const proposal = await Proposal.findById(req.params.id)
        .populate('createdBy', 'name role avatar')
        .populate('result.closedBy', 'name role');
      if (!proposal) return res.status(404).json({ success: false, message: 'Proposal not found' });
      return res.json({ success: true, proposal });
    } else {
      const proposal = memoryProposals.find(p => p._id === req.params.id);
      if (!proposal) return res.status(404).json({ success: false, message: 'Proposal not found' });
      return res.json({ success: true, proposal });
    }
  } catch (error) { next(error); }
};

// ─── POST /api/proposals ─────────────────────────────────────────────────────
exports.createProposal = async (req, res, next) => {
  try {
    const {
      title, description, category,
      votingDeadline, quorumPercent, passThresholdPercent,
      options, status
    } = req.body;

    if (!title || !description || !votingDeadline) {
      return res.status(400).json({ success: false, message: 'Title, description and votingDeadline are required' });
    }

    const isConnected = mongoose.connection.readyState === 1;

    // Count eligible voters
    let eligibleCount = 0;
    if (isConnected && req.user.community) {
      eligibleCount = await User.countDocuments({
        community: req.user.community,
        role: { $in: ['RESIDENT', 'COMMUNITY_ADMIN'] }
      });
    }

    const proposalStatus = status === 'active' ? 'active' : 'draft';

    const proposalData = {
      title,
      description,
      category: category || 'Other',
      status: proposalStatus,
      createdBy: req.user._id || req.user.id,
      community: req.user.community,
      votingDeadline: new Date(votingDeadline),
      quorumPercent: quorumPercent || 50,
      passThresholdPercent: passThresholdPercent || 50,
      options: options && options.length > 0
        ? options.map(o => ({ label: o, votes: [] }))
        : [{ label: 'Yes', votes: [] }, { label: 'No', votes: [] }, { label: 'Abstain', votes: [] }],
      totalEligibleVoters: eligibleCount || 10
    };

    let proposal;
    if (isConnected) {
      proposal = await Proposal.create(proposalData);
      proposal = await Proposal.findById(proposal._id).populate('createdBy', 'name role avatar');
    } else {
      proposal = {
        _id: `prop_${Date.now()}`,
        ...proposalData,
        createdBy: { _id: req.user._id, name: req.user.name, role: req.user.role },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      memoryProposals.unshift(proposal);
    }

    await logAudit('PROPOSAL_CREATED', req.user, proposal._id, 'Proposal', req.user.community, { title, status: proposalStatus }, req);

    return res.status(201).json({ success: true, proposal });
  } catch (error) { next(error); }
};

// ─── POST /api/proposals/:id/vote ────────────────────────────────────────────
exports.castVote = async (req, res, next) => {
  try {
    const { optionIndex } = req.body;
    if (optionIndex === undefined || optionIndex === null) {
      return res.status(400).json({ success: false, message: 'optionIndex is required' });
    }

    const isConnected = mongoose.connection.readyState === 1;
    const userId = req.user._id?.toString() || req.user.id?.toString();

    if (isConnected && mongoose.Types.ObjectId.isValid(req.params.id)) {
      const proposal = await Proposal.findById(req.params.id);
      if (!proposal) return res.status(404).json({ success: false, message: 'Proposal not found' });
      if (proposal.status !== 'active') return res.status(400).json({ success: false, message: 'Voting is not open for this proposal' });
      if (new Date() > proposal.votingDeadline) return res.status(400).json({ success: false, message: 'Voting deadline has passed' });
      if (!proposal.eligibleRoles.includes(req.user.role)) return res.status(403).json({ success: false, message: 'You are not eligible to vote on this proposal' });
      if (optionIndex < 0 || optionIndex >= proposal.options.length) return res.status(400).json({ success: false, message: 'Invalid option' });

      // Check if already voted
      let alreadyVotedIndex = -1;
      proposal.options.forEach((opt, i) => {
        if (opt.votes.map(v => v.toString()).includes(userId)) alreadyVotedIndex = i;
      });

      const action = alreadyVotedIndex >= 0 ? 'VOTE_CHANGED' : 'VOTE_CAST';

      // Remove previous vote
      if (alreadyVotedIndex >= 0) {
        proposal.options[alreadyVotedIndex].votes = proposal.options[alreadyVotedIndex].votes.filter(v => v.toString() !== userId);
      }

      // Add new vote
      proposal.options[optionIndex].votes.push(req.user._id);
      await proposal.save();

      await logAudit(action, req.user, proposal._id, 'Proposal', proposal.community,
        { proposalTitle: proposal.title, option: proposal.options[optionIndex].label, previousOption: alreadyVotedIndex >= 0 ? proposal.options[alreadyVotedIndex]?.label : null }, req);

      const updated = await Proposal.findById(proposal._id).populate('createdBy', 'name role avatar');
      return res.json({ success: true, proposal: updated, action });
    } else {
      // Memory fallback
      const proposal = memoryProposals.find(p => p._id === req.params.id);
      if (!proposal) return res.status(404).json({ success: false, message: 'Proposal not found' });
      if (proposal.status !== 'active') return res.status(400).json({ success: false, message: 'Voting is not open' });

      let alreadyVotedIndex = -1;
      proposal.options.forEach((opt, i) => {
        if (opt.votes.includes(userId)) alreadyVotedIndex = i;
      });

      const action = alreadyVotedIndex >= 0 ? 'VOTE_CHANGED' : 'VOTE_CAST';
      if (alreadyVotedIndex >= 0) {
        proposal.options[alreadyVotedIndex].votes = proposal.options[alreadyVotedIndex].votes.filter(v => v !== userId);
      }
      proposal.options[optionIndex].votes.push(userId);

      await logAudit(action, req.user, proposal._id, 'Proposal', proposal.community,
        { proposalTitle: proposal.title, option: proposal.options[optionIndex].label }, req);

      return res.json({ success: true, proposal, action });
    }
  } catch (error) { next(error); }
};

// ─── PUT /api/proposals/:id/status ──────────────────────────────────────────
exports.updateProposalStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['draft', 'active', 'closed', 'passed', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected && mongoose.Types.ObjectId.isValid(req.params.id)) {
      const proposal = await Proposal.findById(req.params.id);
      if (!proposal) return res.status(404).json({ success: false, message: 'Proposal not found' });

      const previousStatus = proposal.status;
      proposal.status = status;

      // If closing, compute result
      if (status === 'closed' || status === 'passed' || status === 'rejected') {
        const totalVotes = proposal.options.reduce((sum, o) => sum + o.votes.length, 0);
        const quorumReached = proposal.totalEligibleVoters > 0
          ? (totalVotes / proposal.totalEligibleVoters) * 100 >= proposal.quorumPercent
          : false;

        let winningOption = null;
        let maxVotes = -1;
        proposal.options.forEach(opt => {
          if (opt.votes.length > maxVotes) { maxVotes = opt.votes.length; winningOption = opt.label; }
        });

        // Auto determine pass/reject if closing
        if (status === 'closed') {
          const yesOpt = proposal.options.find(o => o.label.toLowerCase() === 'yes');
          if (quorumReached && yesOpt) {
            const yesPercent = totalVotes > 0 ? (yesOpt.votes.length / totalVotes) * 100 : 0;
            proposal.status = yesPercent >= proposal.passThresholdPercent ? 'passed' : 'rejected';
          } else {
            proposal.status = 'rejected';
          }
        }

        proposal.result = {
          winningOption,
          totalVotesCast: totalVotes,
          quorumReached,
          closedAt: new Date(),
          closedBy: req.user._id
        };
      }

      await proposal.save();

      await logAudit('PROPOSAL_STATUS_CHANGED', req.user, proposal._id, 'Proposal', proposal.community,
        { previousStatus, newStatus: proposal.status, title: proposal.title }, req);

      const updated = await Proposal.findById(proposal._id).populate('createdBy', 'name role avatar').populate('result.closedBy', 'name role');
      return res.json({ success: true, proposal: updated });
    } else {
      const proposal = memoryProposals.find(p => p._id === req.params.id);
      if (!proposal) return res.status(404).json({ success: false, message: 'Proposal not found' });
      const previousStatus = proposal.status;
      proposal.status = status;
      proposal.updatedAt = new Date();
      await logAudit('PROPOSAL_STATUS_CHANGED', req.user, proposal._id, 'Proposal', null, { previousStatus, newStatus: status }, req);
      return res.json({ success: true, proposal });
    }
  } catch (error) { next(error); }
};

// ─── DELETE /api/proposals/:id ───────────────────────────────────────────────
exports.deleteProposal = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected && mongoose.Types.ObjectId.isValid(req.params.id)) {
      const proposal = await Proposal.findById(req.params.id);
      if (!proposal) return res.status(404).json({ success: false, message: 'Proposal not found' });
      if (proposal.status !== 'draft' && req.user.role !== 'SUPER_ADMIN') {
        return res.status(400).json({ success: false, message: 'Only draft proposals can be deleted' });
      }
      await logAudit('PROPOSAL_DELETED', req.user, proposal._id, 'Proposal', proposal.community, { title: proposal.title }, req);
      await Proposal.findByIdAndDelete(req.params.id);
    } else {
      const idx = memoryProposals.findIndex(p => p._id === req.params.id);
      if (idx > -1) {
        await logAudit('PROPOSAL_DELETED', req.user, memoryProposals[idx]._id, 'Proposal', null, { title: memoryProposals[idx].title }, req);
        memoryProposals.splice(idx, 1);
      }
    }
    return res.json({ success: true, message: 'Proposal deleted' });
  } catch (error) { next(error); }
};

// ─── GET /api/audit ──────────────────────────────────────────────────────────
exports.getAuditLogs = async (req, res, next) => {
  try {
    const { action, actorName, from, to, limit = 100, skip = 0 } = req.query;
    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected) {
      const filter = {};
      if (req.user.community) filter.community = req.user.community;
      if (action) filter.action = action;
      if (actorName) filter['actor.name'] = { $regex: actorName, $options: 'i' };
      if (from || to) {
        filter.timestamp = {};
        if (from) filter.timestamp.$gte = new Date(from);
        if (to) filter.timestamp.$lte = new Date(to);
      }

      const [logs, total] = await Promise.all([
        AuditLog.find(filter).sort({ timestamp: -1 }).limit(Number(limit)).skip(Number(skip)),
        AuditLog.countDocuments(filter)
      ]);
      return res.json({ success: true, total, count: logs.length, logs });
    } else {
      let logs = [...memoryAuditLogs];
      if (action) logs = logs.filter(l => l.action === action);
      if (actorName) logs = logs.filter(l => l.actor?.name?.toLowerCase().includes(actorName.toLowerCase()));
      return res.json({ success: true, total: logs.length, count: logs.length, logs: logs.slice(Number(skip), Number(skip) + Number(limit)) });
    }
  } catch (error) { next(error); }
};

// Export memory store for analytics clear
exports.getMemoryAuditLogs = () => memoryAuditLogs;

// ── POST /api/proposals/:id/attachments — upload photos/docs ─────────────────
exports.uploadAttachments = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { uploadImages } = require('../services/imageService');
    const isConnected = mongoose.connection.readyState === 1;

    let attachments = [];
    if (req.files && req.files.length > 0) {
      const urls = await uploadImages(
        req.files.map(f => ({ buffer: f.buffer, mimetype: f.mimetype })),
        'communityhub/proposals'
      );
      attachments = req.files.map((f, i) => ({
        url: urls[i],
        name: f.originalname,
        type: f.mimetype.startsWith('image/') ? 'image' : 'document'
      }));
    } else if (req.body.attachments) {
      attachments = Array.isArray(req.body.attachments)
        ? req.body.attachments
        : [req.body.attachments];
    }

    if (isConnected && mongoose.Types.ObjectId.isValid(id)) {
      const proposal = await Proposal.findByIdAndUpdate(
        id,
        { $push: { attachments: { $each: attachments } } },
        { new: true }
      );
      return res.json({ success: true, attachments: proposal.attachments });
    }

    // In-memory fallback
    const p = memoryProposals.find(p => p._id === id || p._id?.toString() === id);
    if (p) {
      p.attachments = [...(p.attachments || []), ...attachments];
      return res.json({ success: true, attachments: p.attachments });
    }
    return res.json({ success: true, attachments });
  } catch (err) { next(err); }
};
