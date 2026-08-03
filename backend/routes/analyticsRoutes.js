const express = require('express');
const router = express.Router();
const { getDashboardStats, clearAllData } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, getDashboardStats);
router.post('/clear-data', protect, clearAllData);

module.exports = router;
