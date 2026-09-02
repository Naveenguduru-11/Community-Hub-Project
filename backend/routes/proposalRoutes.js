const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  getProposals,
  getProposalById,
  createProposal,
  castVote,
  updateProposalStatus,
  deleteProposal,
  uploadAttachments
} = require('../controllers/proposalController');

// All routes require authentication
router.use(protect);

// Any community member can view proposals
router.get('/', getProposals);
router.get('/:id', getProposalById);

// Residents and Admins can vote
router.post('/:id/vote', authorize('RESIDENT', 'COMMUNITY_ADMIN'), castVote);

// Upload photos/attachments to a proposal
router.post('/:id/attachments', upload.array('attachments', 5), uploadAttachments);

// Admin+ can create, modify status, delete
router.post('/', authorize('COMMUNITY_ADMIN'), createProposal);
router.put('/:id/status', authorize('COMMUNITY_ADMIN'), updateProposalStatus);
router.delete('/:id', authorize('COMMUNITY_ADMIN'), deleteProposal);

module.exports = router;

