const mongoose = require('mongoose');
const Amenity = require('../models/Amenity');
const AmenityBooking = require('../models/AmenityBooking');
const { uploadImage, uploadImages, deleteImage } = require('../services/imageService');

/* ─────────────────────────────────────────────────────────────────────────
 *  AMENITY CRUD
 * ───────────────────────────────────────────────────────────────────────── */

/* ── GET /api/amenities ──────────────────────────────────────────────── */
exports.getAmenities = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    if (isConnected) {
      const filter = {};
      if (req.user?.community) filter.community = req.user.community;
      const amenities = await Amenity.find(filter).sort({ name: 1 });
      return res.json({ success: true, count: amenities.length, amenities });
    }
    return res.json({ success: true, count: 0, amenities: [] });
  } catch (err) { next(err); }
};

/* ── GET /api/amenities/:id ──────────────────────────────────────────── */
exports.getAmenity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isConnected = mongoose.connection.readyState === 1;
    if (isConnected && mongoose.Types.ObjectId.isValid(id)) {
      const amenity = await Amenity.findById(id);
      if (!amenity) return res.status(404).json({ success: false, message: 'Amenity not found' });
      return res.json({ success: true, amenity });
    }
    return res.status(404).json({ success: false, message: 'Amenity not found' });
  } catch (err) { next(err); }
};

/* ── POST /api/amenities ─────────────────────────────────────────────── */
exports.createAmenity = async (req, res, next) => {
  try {
    const { name, description, category, emoji, capacity, operatingHours,
            slots, maintenance, status } = req.body;
    const isConnected = mongoose.connection.readyState === 1;

    let imageUrl = req.body.image || '';
    let galleryUrls = req.body.images || [];

    // Handle file upload
    if (req.file) {
      imageUrl = await uploadImage(req.file.buffer, req.file.mimetype, 'communityhub/amenities');
    }
    if (req.files && req.files.length > 0) {
      galleryUrls = await uploadImages(
        req.files.map(f => ({ buffer: f.buffer, mimetype: f.mimetype })),
        'communityhub/amenities'
      );
      if (!imageUrl && galleryUrls.length > 0) imageUrl = galleryUrls[0];
    }

    const data = {
      name, description: description || '',
      category: category || 'Other',
      emoji: emoji || '🏢',
      capacity: Number(capacity) || 0,
      operatingHours: operatingHours || '9:00 AM – 10:00 PM',
      slots: typeof slots === 'string' ? JSON.parse(slots) : (slots || []),
      maintenance: typeof maintenance === 'string' ? JSON.parse(maintenance) : (maintenance || []),
      status: status || 'active',
      image: imageUrl,
      images: galleryUrls,
      community: req.user?.community,
    };

    if (isConnected) {
      const amenity = await Amenity.create(data);
      return res.status(201).json({ success: true, amenity });
    }
    return res.status(503).json({ success: false, message: 'Database not connected' });
  } catch (err) { next(err); }
};

/* ── PUT /api/amenities/:id ──────────────────────────────────────────── */
exports.updateAmenity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isConnected = mongoose.connection.readyState === 1;
    const updates = { ...req.body };

    // Parse JSON fields if sent as strings
    if (typeof updates.slots === 'string') updates.slots = JSON.parse(updates.slots);
    if (typeof updates.maintenance === 'string') updates.maintenance = JSON.parse(updates.maintenance);

    // Handle file upload
    if (req.file) {
      updates.image = await uploadImage(req.file.buffer, req.file.mimetype, 'communityhub/amenities');
    }

    if (isConnected && mongoose.Types.ObjectId.isValid(id)) {
      const amenity = await Amenity.findByIdAndUpdate(id, updates, { new: true });
      return res.json({ success: true, amenity });
    }
    return res.status(503).json({ success: false, message: 'Database not connected' });
  } catch (err) { next(err); }
};

/* ── DELETE /api/amenities/:id ───────────────────────────────────────── */
exports.deleteAmenity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isConnected = mongoose.connection.readyState === 1;
    if (isConnected && mongoose.Types.ObjectId.isValid(id)) {
      const amenity = await Amenity.findById(id);
      if (amenity) {
        await deleteImage(amenity.image);
        await Promise.all((amenity.images || []).map(url => deleteImage(url)));
        await Amenity.findByIdAndDelete(id);
        // Also cancel all bookings
        await AmenityBooking.updateMany({ amenity: id }, { status: 'cancelled' });
      }
    }
    return res.json({ success: true, message: 'Amenity deleted' });
  } catch (err) { next(err); }
};

/* ── POST /api/amenities/:id/images ─────────────────────────────────── */
exports.uploadAmenityImages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isConnected = mongoose.connection.readyState === 1;
    let imageUrls = [];

    if (req.files && req.files.length > 0) {
      imageUrls = await uploadImages(
        req.files.map(f => ({ buffer: f.buffer, mimetype: f.mimetype })),
        'communityhub/amenities'
      );
    } else if (req.body.images) {
      imageUrls = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    }

    if (isConnected && mongoose.Types.ObjectId.isValid(id)) {
      const updates = { $push: { images: { $each: imageUrls } } };
      // Set primary image if none set
      const existing = await Amenity.findById(id);
      if (existing && !existing.image && imageUrls.length > 0) {
        updates.$set = { image: imageUrls[0] };
      }
      const amenity = await Amenity.findByIdAndUpdate(id, updates, { new: true });
      return res.json({ success: true, image: amenity.image, images: amenity.images });
    }
    return res.json({ success: true, images: imageUrls });
  } catch (err) { next(err); }
};

/* ─────────────────────────────────────────────────────────────────────────
 *  BOOKING CRUD
 * ───────────────────────────────────────────────────────────────────────── */

/* ── GET /api/amenities/:id/bookings ─────────────────────────────────── */
exports.getBookings = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isConnected = mongoose.connection.readyState === 1;
    if (isConnected && mongoose.Types.ObjectId.isValid(id)) {
      const { date } = req.query;
      const filter = { amenity: id };
      if (date) filter.date = date;
      const bookings = await AmenityBooking.find(filter)
        .populate('user', 'name email villa')
        .sort({ date: 1, slotId: 1 });
      return res.json({ success: true, count: bookings.length, bookings });
    }
    return res.json({ success: true, count: 0, bookings: [] });
  } catch (err) { next(err); }
};

/* ── GET /api/amenities/my-bookings ─────────────────────────────────── */
exports.getMyBookings = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    if (isConnected) {
      const bookings = await AmenityBooking.find({ user: req.user._id })
        .populate('amenity', 'name emoji image')
        .sort({ date: -1 });
      return res.json({ success: true, count: bookings.length, bookings });
    }
    return res.json({ success: true, count: 0, bookings: [] });
  } catch (err) { next(err); }
};

/* ── POST /api/amenities/:id/bookings ────────────────────────────────── */
exports.createBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date, slotId, slotLabel, guestCount, notes } = req.body;
    const isConnected = mongoose.connection.readyState === 1;

    if (!isConnected) {
      return res.status(503).json({ success: false, message: 'Server database is not connected. Please try again shortly.' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: `Invalid amenity ID "${id}". Please refresh the page and try again.` });
    }

    const amenity = await Amenity.findById(id);
    if (!amenity) return res.status(404).json({ success: false, message: 'Amenity not found' });

    // Check for slot conflict on the same date
    const conflict = await AmenityBooking.findOne({
      amenity: id, date, slotId, status: { $ne: 'cancelled' }
    });
    if (conflict) {
      return res.status(409).json({ success: false, message: 'This slot is already booked for that date.' });
    }

    // Calculate price
    const slot = amenity.slots.find(s => s._id.toString() === slotId || s.label === slotLabel);
    const guests = Number(guestCount) || 0;
    const totalAmount = slot ? (slot.price + (guests * (slot.guestCharge || 0))) : 0;

    const booking = await AmenityBooking.create({
      amenity: id,
      amenityName: amenity.name,
      user: req.user._id,
      community: req.user.community,
      date, slotId,
      slotLabel: slotLabel || slot?.label || '',
      guestCount: guests,
      totalAmount,
      notes: notes || '',
      status: 'confirmed',
    });

    const populated = await AmenityBooking.findById(booking._id)
      .populate('user', 'name email')
      .populate('amenity', 'name emoji');

    return res.status(201).json({ success: true, booking: populated });
  } catch (err) { next(err); }
};

/* ── PUT /api/amenities/bookings/:bookingId/status ───────────────────── */
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;
    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected && mongoose.Types.ObjectId.isValid(bookingId)) {
      const booking = await AmenityBooking.findByIdAndUpdate(
        bookingId, { status }, { new: true }
      ).populate('user', 'name email');
      return res.json({ success: true, booking });
    }
    return res.status(404).json({ success: false, message: 'Booking not found' });
  } catch (err) { next(err); }
};
