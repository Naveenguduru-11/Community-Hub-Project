const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_community_hub_jwt_key_2026');

      const isConnected = mongoose.connection.readyState === 1;
      const isValidObjectId = mongoose.Types.ObjectId.isValid(decoded.id);

      // Try DB first
      if (isConnected && isValidObjectId) {
        req.user = await User.findById(decoded.id).select('-password');
      }

      // Try in-memory fallback (no hardcoded data)
      if (!req.user) {
        const { getMemoryUser } = require('../controllers/authController');
        const memUser = getMemoryUser(decoded.id);
        if (memUser) req.user = memUser;
      }

      // If still not found, reject — do not invent a fake user
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
      }

      return next();
    } catch (error) {
      console.error('JWT Auth Error:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, invalid token' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, missing token' });
  }
};

module.exports = { protect };
