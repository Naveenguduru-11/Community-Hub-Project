const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const ID_SUPERADMIN = '65f1a2b3c4d5e6f7a8b9c001';
const ID_ADMIN = '65f1a2b3c4d5e6f7a8b9c002';
const ID_RESIDENT1 = '65f1a2b3c4d5e6f7a8b9c003';
const ID_GUARD = '65f1a2b3c4d5e6f7a8b9c004';

// In-Memory User Cache
let memoryUsers = [
  {
    _id: ID_SUPERADMIN,
    name: 'Eleanor Vance (Super Admin)',
    email: 'superadmin@communityhub.com',
    password: '$2a$10$abcdefghijklmnopqrstuvwxyz123456',
    phone: '+91 90000 11111',
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80'
  },
  {
    _id: ID_ADMIN,
    name: 'Rajesh Sharma (Admin)',
    email: 'admin@greenfield.com',
    password: '$2a$10$abcdefghijklmnopqrstuvwxyz123456',
    phone: '+91 98765 11223',
    role: 'COMMUNITY_ADMIN',
    status: 'ACTIVE',
    community: { _id: '65f1a2b3c4d5e6f7a8b9c0d1', name: 'Greenfield Heights & Villa Enclave', code: 'GHVE-2026' },
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80'
  },
  {
    _id: ID_RESIDENT1,
    name: 'Aarav Mehta',
    email: 'resident@greenfield.com',
    password: '$2a$10$abcdefghijklmnopqrstuvwxyz123456',
    phone: '+91 91234 56789',
    role: 'RESIDENT',
    status: 'ACTIVE',
    community: { _id: '65f1a2b3c4d5e6f7a8b9c0d1', name: 'Greenfield Heights & Villa Enclave', code: 'GHVE-2026' },
    villa: { _id: '65f1a2b3c4d5e6f7a8b9c0d2', villaNumber: 'V-101', block: 'Phase 1 - Royal Palms' },
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    familyMembers: [
      { _id: 'fam_1', name: 'Priya Mehta', relation: 'Spouse', phone: '+91 91234 56790', age: 32 }
    ]
  },
  {
    _id: ID_GUARD,
    name: 'Vikram Singh (Security Chief)',
    email: 'guard@greenfield.com',
    password: '$2a$10$abcdefghijklmnopqrstuvwxyz123456',
    phone: '+91 99887 76655',
    role: 'SECURITY_GUARD',
    status: 'ACTIVE',
    community: { _id: '65f1a2b3c4d5e6f7a8b9c0d1', name: 'Greenfield Heights & Villa Enclave', code: 'GHVE-2026' },
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
  }
];

exports.getMemoryUser = (id) => {
  return memoryUsers.find(u => u._id === id);
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_community_hub_jwt_key_2026', {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// @desc Get All Resident Members (Admin Only)
// @route GET /api/auth/residents
exports.getAllResidents = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected) {
      const residents = await User.find({ role: 'RESIDENT' })
        .populate('community')
        .populate('villa')
        .select('-password');
      return res.status(200).json({ success: true, count: residents.length, residents });
    } else {
      const residents = memoryUsers.filter(u => u.role === 'RESIDENT');
      return res.status(200).json({ success: true, count: residents.length, residents });
    }
  } catch (error) {
    next(error);
  }
};

// @desc Update Resident Status (Admin Only)
// @route PUT /api/auth/residents/:id/status
exports.updateResidentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected && mongoose.Types.ObjectId.isValid(id)) {
      const user = await User.findByIdAndUpdate(id, { status }, { new: true }).select('-password');
      return res.status(200).json({ success: true, user });
    } else {
      const user = memoryUsers.find(u => u._id === id);
      if (user) {
        user.status = status || 'ACTIVE';
      }
      return res.status(200).json({ success: true, user });
    }
  } catch (error) {
    next(error);
  }
};

// @desc Delete Resident Member (Admin Only)
// @route DELETE /api/auth/residents/:id
exports.deleteResident = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected && mongoose.Types.ObjectId.isValid(id)) {
      await User.findByIdAndDelete(id);
    } else {
      const idx = memoryUsers.findIndex(u => u._id === id);
      if (idx > -1) memoryUsers.splice(idx, 1);
    }

    return res.status(200).json({ success: true, message: 'Resident member removed successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc Register User
// @route POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, communityId, villaId } = req.body;
    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected) {
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ success: false, message: 'User already exists with this email' });
      }

      const user = await User.create({
        name,
        email,
        password,
        phone,
        role: role || 'RESIDENT',
        community: communityId || null,
        villa: villaId || null
      });

      const token = generateToken(user._id);

      return res.status(201).json({
        success: true,
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          status: user.status || 'ACTIVE',
          community: user.community,
          villa: user.villa,
          avatar: user.avatar
        }
      });
    } else {
      const existing = memoryUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        return res.status(400).json({ success: false, message: 'User already exists with this email' });
      }

      const validId = new mongoose.Types.ObjectId().toString();

      const newUser = {
        _id: validId,
        name,
        email,
        password,
        phone,
        role: role || 'RESIDENT',
        status: 'ACTIVE',
        community: { _id: '65f1a2b3c4d5e6f7a8b9c0d1', name: 'Greenfield Heights & Villa Enclave', code: 'GHVE-2026' },
        villa: { _id: '65f1a2b3c4d5e6f7a8b9c0d2', villaNumber: 'V-101', block: 'Phase 1 - Royal Palms' },
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
        familyMembers: []
      };

      memoryUsers.push(newUser);
      const token = generateToken(newUser._id);

      return res.status(201).json({
        success: true,
        token,
        user: newUser
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc Login User
// @route POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected) {
      const user = await User.findOne({ email }).select('+password').populate('community').populate('villa');
      if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const token = generateToken(user._id);

      return res.status(200).json({
        success: true,
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          status: user.status || 'ACTIVE',
          community: user.community,
          villa: user.villa,
          avatar: user.avatar,
          familyMembers: user.familyMembers,
          emergencyContact: user.emergencyContact
        }
      });
    } else {
      let user = memoryUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        const roleByEmail = {
          'superadmin@communityhub.com': 'SUPER_ADMIN',
          'admin@greenfield.com': 'COMMUNITY_ADMIN',
          'resident@greenfield.com': 'RESIDENT',
          'guard@greenfield.com': 'SECURITY_GUARD'
        };

        if (roleByEmail[email.toLowerCase()]) {
          user = memoryUsers.find(u => u.role === roleByEmail[email.toLowerCase()]);
        }
      }

      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const token = generateToken(user._id);

      return res.status(200).json({
        success: true,
        token,
        user
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc Get Current Logged In User
// @route GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected && mongoose.Types.ObjectId.isValid(req.user._id)) {
      const user = await User.findById(req.user._id).populate('community').populate('villa');
      if (user) return res.status(200).json({ success: true, user });
    }

    const user = memoryUsers.find(u => u._id === req.user._id) || memoryUsers.find(u => u.role === req.user.role) || memoryUsers[2];
    return res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc Update User Profile
// @route PUT /api/auth/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      phone: req.body.phone,
      emergencyContact: req.body.emergencyContact,
      familyMembers: req.body.familyMembers
    };

    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected && mongoose.Types.ObjectId.isValid(req.user._id)) {
      const user = await User.findByIdAndUpdate(req.user._id, fieldsToUpdate, {
        new: true,
        runValidators: true
      }).populate('community').populate('villa');

      if (user) return res.status(200).json({ success: true, user });
    }

    const user = memoryUsers.find(u => u._id === req.user._id);
    if (user) {
      Object.assign(user, fieldsToUpdate);
    }
    return res.status(200).json({ success: true, user: user || req.user });
  } catch (error) {
    next(error);
  }
};
