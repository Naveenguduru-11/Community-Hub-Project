const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { getAuditLogs } = require('../controllers/auditController');

// Audit trail is admin-only
router.get('/', protect, authorize('COMMUNITY_ADMIN'), getAuditLogs);

module.exports = router;
