const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

// In-Memory User Cache (Starts Completely Empty - 100% Fresh Website)
let memoryUsers = [];

exports.clearAllUsers = () => {
  memoryUsers = [];
};

exports.getMemoryUser = (id) => {
  return memoryUsers.find(u => u._id === id);
};

exports.getMemoryUsers = () => {
  return memoryUsers;
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
      const uniqueResidents = Array.from(new Map(residents.map(item => [item.email.toLowerCase(), item])).values());
      return res.status(200).json({ success: true, count: uniqueResidents.length, residents: uniqueResidents });
    } else {
      const residents = memoryUsers.filter(u => u.role === 'RESIDENT');
      const uniqueResidents = Array.from(new Map(residents.map(item => [item.email.toLowerCase(), item])).values());
      return res.status(200).json({ success: true, count: uniqueResidents.length, residents: uniqueResidents });
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

// @desc Register User (Clean Registration for Any Role)
// @route POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, communityName, villaNumber, buildingBlock, floorNumber } = req.body;
    const isConnected = mongoose.connection.readyState === 1;

    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanVillaNumber = villaNumber ? villaNumber.trim() : '';
    const cleanBlock = buildingBlock ? buildingBlock.trim() : '';
    const cleanFloor = floorNumber ? floorNumber.trim() : '';

    if (isConnected) {
      const userExists = await User.findOne({ email: normalizedEmail });
      if (userExists) {
        return res.status(400).json({ success: false, message: 'User already exists with this email address' });
      }

      const Villa = require('../models/Villa');
      const Community = require('../models/Community');

      let communityDoc = await Community.findOne();
      let villaDoc;

      if (cleanVillaNumber) {
        villaDoc = await Villa.findOne({ villaNumber: cleanVillaNumber });
        if (!villaDoc) {
          villaDoc = await Villa.create({
            villaNumber: cleanVillaNumber,
            block: cleanBlock || 'Phase 1',
            sizeSqFt: 3000,
            bedrooms: 3,
            community: communityDoc?._id,
            occupancyStatus: 'OWNER_OCCUPIED'
          });
        }
      }

      const user = await User.create({
        name,
        email,
        password,
        phone: phone || '',
        role: role || 'RESIDENT',
        buildingBlock: cleanBlock,
        floorNumber: cleanFloor,
        villaNumber: cleanVillaNumber,
        community: communityDoc?._id,
        villa: villaDoc?._id,
        status: 'ACTIVE'
      });

      if (villaDoc && !villaDoc.owner) {
        villaDoc.owner = user._id;
        await villaDoc.save();
      }

      const token = generateToken(user._id);
      const populatedUser = await User.findById(user._id).populate('community').populate('villa');

      return res.status(201).json({
        success: true,
        token,
        user: populatedUser || {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          buildingBlock: user.buildingBlock,
          floorNumber: user.floorNumber,
          villaNumber: user.villaNumber,
          status: user.status || 'ACTIVE',
          community: user.community,
          villa: user.villa,
          avatar: user.avatar
        }
      });
    } else {
      const existing = memoryUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        return res.status(400).json({ success: false, message: 'User already exists with this email address' });
      }

      const validId = new mongoose.Types.ObjectId().toString();

      const newUser = {
        _id: validId,
        name,
        email,
        password,
        phone: phone || '',
        role: role || 'RESIDENT',
        buildingBlock: cleanBlock,
        floorNumber: cleanFloor,
        villaNumber: cleanVillaNumber,
        status: 'ACTIVE',
        community: { _id: `comm_${Date.now()}`, name: communityName || 'Greenfield Heights', code: 'GHVE-2026' },
        villa: cleanVillaNumber ? { _id: `villa_${Date.now()}`, villaNumber: cleanVillaNumber, block: cleanBlock || 'Phase 1' } : null,
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

    const normalizedEmail = email.toLowerCase().trim();
    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected) {
      const user = await User.findOne({ email: normalizedEmail }).select('+password').populate('community').populate('villa');
      if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({ success: false, message: 'Invalid credentials. Account not found or wrong password.' });
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
          buildingBlock: user.buildingBlock,
          floorNumber: user.floorNumber,
          villaNumber: user.villaNumber,
          status: user.status || 'ACTIVE',
          community: user.community,
          villa: user.villa,
          avatar: user.avatar,
          familyMembers: user.familyMembers,
          emergencyContact: user.emergencyContact
        }
      });
    } else {
      const user = memoryUsers.find(u => u.email.toLowerCase() === normalizedEmail);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Account not found. Please register first or check your email address.' });
      }

      if (user.password !== password && !user.password.startsWith('$2a$')) {
        return res.status(401).json({ success: false, message: 'Invalid credentials. Wrong password.' });
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

    // Try DB first (most accurate, has full populated data)
    if (isConnected && mongoose.Types.ObjectId.isValid(req.user._id)) {
      const user = await User.findById(req.user._id).populate('community').populate('villa');
      if (user) return res.status(200).json({ success: true, user });
    }

    // Try in-memory fallback
    const memUser = memoryUsers.find(u => u._id === req.user._id?.toString());
    if (memUser) return res.status(200).json({ success: true, user: memUser });

    // Final fallback: the middleware already validated the JWT and set req.user
    // Return it as-is so the session is never lost on a DB hiccup
    if (req.user) return res.status(200).json({ success: true, user: req.user });

    return res.status(401).json({ success: false, message: 'Session expired or user not found' });
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
