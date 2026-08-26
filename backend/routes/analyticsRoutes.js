const express = require('express');
const router = express.Router();
const { getDashboardStats, clearAllData, getDatabaseExplorerData } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, getDashboardStats);
router.get('/database', protect, getDatabaseExplorerData);
router.post('/clear-data', protect, clearAllData);

module.exports = router;
