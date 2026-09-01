const { getAuditLogs } = require('./proposalController');

// Re-export from proposalController — keeps audit logic centralized
exports.getAuditLogs = getAuditLogs;
