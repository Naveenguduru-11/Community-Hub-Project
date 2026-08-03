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

      if (isConnected && isValidObjectId) {
        req.user = await User.findById(decoded.id).select('-password');
      }

      if (!req.user) {
        const { getMemoryUser } = require('../controllers/authController');
        req.user = getMemoryUser(decoded.id) || {
          _id: decoded.id,
          name: 'Aarav Mehta',
          email: 'resident@greenfield.com',
          role: 'RESIDENT',
          community: { _id: '65f1a2b3c4d5e6f7a8b9c0d1', name: 'Greenfield Heights & Villa Enclave', code: 'GHVE-2026' },
          villa: { _id: '65f1a2b3c4d5e6f7a8b9c0d2', villaNumber: 'V-101', block: 'Phase 1 - Royal Palms' },
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80'
        };
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
