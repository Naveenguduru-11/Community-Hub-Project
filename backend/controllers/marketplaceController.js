const mongoose = require('mongoose');
const MarketplaceItem = require('../models/MarketplaceItem');
const { uploadImages, deleteImage } = require('../services/imageService');

/* ── In-memory fallback ─────────────────────────────────────────────────── */
let memItems = [];

/* ── GET /api/marketplace ─────────────────────────────────────────────── */
exports.getItems = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    if (isConnected) {
      const filter = {};
      if (req.query.status) filter.status = req.query.status;
      if (req.query.category && req.query.category !== 'all') filter.category = req.query.category;
      if (req.user?.community) filter.community = req.user.community;
      const items = await MarketplaceItem.find(filter)
        .populate('seller', 'name email')
        .sort({ createdAt: -1 });
      return res.json({ success: true, count: items.length, items });
    }
    return res.json({ success: true, count: memItems.length, items: memItems });
  } catch (err) { next(err); }
};

/* ── GET /api/marketplace/:id ─────────────────────────────────────────── */
exports.getItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isConnected = mongoose.connection.readyState === 1;
    if (isConnected && mongoose.Types.ObjectId.isValid(id)) {
      const item = await MarketplaceItem.findByIdAndUpdate(
        id, { $inc: { views: 1 } }, { new: true }
      ).populate('seller', 'name email');
      if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
      return res.json({ success: true, item });
    }
    const item = memItems.find(i => i._id === id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    item.views = (item.views || 0) + 1;
    return res.json({ success: true, item });
  } catch (err) { next(err); }
};

/* ── POST /api/marketplace ────────────────────────────────────────────── */
exports.createItem = async (req, res, next) => {
  try {
    const { title, description, category, price, condition, location,
            contactPhone, contactEmail, images: b64Images, image } = req.body;

    const isConnected = mongoose.connection.readyState === 1;

    // Handle file uploads if multipart or base64 images
    let imageUrls = [];
    if (Array.isArray(b64Images)) {
      imageUrls = [...b64Images];
    } else if (image) {
      imageUrls = [image];
    }
    if (req.files && req.files.length > 0) {
      const uploaded = await uploadImages(
        req.files.map(f => ({ buffer: f.buffer, mimetype: f.mimetype })),
        'communityhub/marketplace'
      );
      imageUrls = [...imageUrls, ...uploaded];
    }

    // Normalize category
    let cat = (category || 'other').toString().toLowerCase().trim();
    const validCats = ['furniture','electronics','appliances','kitchen','computers','vehicles',
                       'books','sports','kids','decor','clothing','services','other'];
    if (!validCats.includes(cat)) {
      cat = 'other';
    }

    // Normalize condition
    let cond = 'Good';
    const rawCond = (condition || '').toString().toUpperCase().replace(/[\s_-]+/g, '');
    if (rawCond === 'NEW') cond = 'New';
    else if (rawCond === 'LIKENEW') cond = 'Like New';
    else if (rawCond === 'USED' || rawCond === 'FAIR' || rawCond === 'POOR') cond = 'Used';
    else cond = 'Good';

    const data = {
      title: title || 'Item for Sale',
      description: description || '',
      category: cat,
      price: Number(price) || 0,
      condition: cond,
      status: 'Available',
      images: imageUrls,
      seller: req.user?._id,
      sellerName: req.user?.name || '',
      location: location || (req.user?.villa ? `Villa ${req.user.villa}` : ''),
      community: req.user?.community,
      contactPhone: contactPhone || req.user?.phone || '',
      contactEmail: contactEmail || req.user?.email || '',
    };

    if (isConnected) {
      const item = await MarketplaceItem.create(data);
      const populated = await MarketplaceItem.findById(item._id).populate('seller', 'name email');
      return res.status(201).json({ success: true, item: populated });
    }
    const item = { _id: `mp_${Date.now()}`, ...data, views: 0, createdAt: new Date() };
    memItems.unshift(item);
    return res.status(201).json({ success: true, item });
  } catch (err) { next(err); }
};

/* ── PUT /api/marketplace/:id ─────────────────────────────────────────── */
exports.updateItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isConnected = mongoose.connection.readyState === 1;
    const updates = req.body;

    // Handle file uploads if multipart
    if (req.files && req.files.length > 0) {
      const newUrls = await uploadImages(
        req.files.map(f => ({ buffer: f.buffer, mimetype: f.mimetype })),
        'communityhub/marketplace'
      );
      updates.images = [...(updates.images || []), ...newUrls];
    }

    if (isConnected && mongoose.Types.ObjectId.isValid(id)) {
      const item = await MarketplaceItem.findByIdAndUpdate(id, updates, { new: true })
        .populate('seller', 'name email');
      return res.json({ success: true, item });
    }
    const idx = memItems.findIndex(i => i._id === id);
    if (idx > -1) Object.assign(memItems[idx], updates);
    return res.json({ success: true, item: memItems[idx] });
  } catch (err) { next(err); }
};

/* ── DELETE /api/marketplace/:id ─────────────────────────────────────── */
exports.deleteItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isConnected = mongoose.connection.readyState === 1;
    if (isConnected && mongoose.Types.ObjectId.isValid(id)) {
      const item = await MarketplaceItem.findById(id);
      if (item) {
        // Clean up images from Cloudinary if applicable
        await Promise.all((item.images || []).map(url => deleteImage(url)));
        await MarketplaceItem.findByIdAndDelete(id);
      }
    } else {
      memItems = memItems.filter(i => i._id !== id);
    }
    return res.json({ success: true, message: 'Item removed' });
  } catch (err) { next(err); }
};

/* ── POST /api/marketplace/:id/images ───────────────────────────────── */
exports.uploadItemImages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isConnected = mongoose.connection.readyState === 1;

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = await uploadImages(
        req.files.map(f => ({ buffer: f.buffer, mimetype: f.mimetype })),
        'communityhub/marketplace'
      );
    } else if (req.body.images) {
      // Accept base64 strings from JSON body
      imageUrls = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    }

    if (isConnected && mongoose.Types.ObjectId.isValid(id)) {
      const item = await MarketplaceItem.findByIdAndUpdate(
        id, { $push: { images: { $each: imageUrls } } }, { new: true }
      );
      return res.json({ success: true, images: item.images });
    }
    const item = memItems.find(i => i._id === id);
    if (item) item.images = [...(item.images || []), ...imageUrls];
    return res.json({ success: true, images: item?.images || imageUrls });
  } catch (err) { next(err); }
};
