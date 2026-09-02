const mongoose = require('mongoose');
const Listing = require('../models/Listing');

let memListings = [
  {
    _id: 'lst_demo1',
    title: 'Spacious 3 BHK Corner Villa — Premium Lake View',
    description: 'A beautifully designed 3 BHK corner villa with unobstructed lake views from the master bedroom. Vastu-compliant, east-facing, fully modular kitchen, Italian marble flooring throughout.',
    villaNumber: 'V-207', block: 'Block B', type: 'VILLA', bhk: '3 BHK', area: 1850, floor: 'Ground + 1', facing: 'East',
    price: 8500000, priceNegotiable: true, maintenanceCharge: 4500,
    status: 'AVAILABLE', listingType: 'SALE',
    amenities: ['Swimming Pool', 'Clubhouse', 'Gym', 'Children\'s Play Area', 'Garden', '24x7 Security'],
    highlights: ['Corner Villa', 'Lake View', 'Vastu Compliant', 'Ready to Move'],
    images: [],
    contactName: 'Property Manager', contactPhone: '+91 9876543210', contactEmail: 'sales@communityhub.in',
    visibleToResidents: true, views: 42, interestedCount: 7, createdAt: new Date(Date.now() - 3*86400000)
  },
  {
    _id: 'lst_demo2',
    title: 'Brand New 2 BHK Apartment — Ready to Move',
    description: 'Compact yet luxurious 2 BHK apartment on the 3rd floor. Perfect for young families or working professionals. Modern fittings, power backup, covered parking included.',
    villaNumber: 'V-315', block: 'Block C', type: 'APARTMENT', bhk: '2 BHK', area: 1100, floor: '3rd Floor', facing: 'West',
    price: 4900000, priceNegotiable: false, maintenanceCharge: 3500,
    status: 'AVAILABLE', listingType: 'SALE',
    amenities: ['Power Backup', 'Covered Parking', 'Gym', 'Security', 'Park'],
    highlights: ['Ready to Move', 'Power Backup', 'Covered Parking'],
    images: [],
    contactName: 'Property Manager', contactPhone: '+91 9876543210', contactEmail: 'sales@communityhub.in',
    visibleToResidents: true, views: 28, interestedCount: 4, createdAt: new Date(Date.now() - 7*86400000)
  },
  {
    _id: 'lst_demo3',
    title: 'Penthouse 4 BHK — Panoramic City View',
    description: 'The crown jewel of the community — a sprawling penthouse on the top floor with 360-degree views. Private terrace garden, 4 premium bedrooms, home automation system pre-installed.',
    villaNumber: 'V-PHT01', block: 'Tower A', type: 'PENTHOUSE', bhk: '4 BHK', area: 3200, floor: 'Top Floor (12th)', facing: 'All Sides',
    price: 22000000, priceNegotiable: true, maintenanceCharge: 8000,
    status: 'RESERVED', listingType: 'SALE',
    amenities: ['Private Terrace', 'Pool', 'Spa', 'Concierge', 'Private Lift', 'Smart Home'],
    highlights: ['Penthouse', 'Private Terrace', 'Smart Home', 'Panoramic View'],
    images: [],
    contactName: 'Property Manager', contactPhone: '+91 9876543210', contactEmail: 'sales@communityhub.in',
    visibleToResidents: true, views: 115, interestedCount: 3, createdAt: new Date(Date.now() - 14*86400000)
  },
];

// ── GET /api/listings — all (residents see visibleToResidents:true) ──────────
exports.getListings = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    const isAdmin = req.user?.role === 'SUPER_ADMIN' || req.user?.role === 'COMMUNITY_ADMIN';

    if (isConnected) {
      const filter = isAdmin ? {} : { visibleToResidents: true, status: { $ne: 'SOLD' } };
      const listings = await Listing.find(filter)
        .populate('postedBy', 'name email')
        .sort({ createdAt: -1 });
      return res.json({ success: true, count: listings.length, listings });
    } else {
      const filtered = isAdmin ? memListings : memListings.filter(l => l.visibleToResidents && l.status !== 'SOLD');
      return res.json({ success: true, count: filtered.length, listings: filtered });
    }
  } catch (err) { next(err); }
};

// ── GET /api/listings/:id ─────────────────────────────────────────────────────
exports.getListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected && mongoose.Types.ObjectId.isValid(id)) {
      const listing = await Listing.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true })
        .populate('postedBy', 'name email');
      if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
      return res.json({ success: true, listing });
    } else {
      const listing = memListings.find(l => l._id === id);
      if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
      listing.views = (listing.views || 0) + 1;
      return res.json({ success: true, listing });
    }
  } catch (err) { next(err); }
};

// ── POST /api/listings — super admin create ───────────────────────────────────
exports.createListing = async (req, res, next) => {
  try {
    const { title, description, villaNumber, block, type, bhk, area, floor, facing,
            price, priceNegotiable, maintenanceCharge, status, listingType,
            amenities, highlights, images, contactName, contactPhone, contactEmail,
            visibleToResidents, community } = req.body;

    const isConnected = mongoose.connection.readyState === 1;

    const data = {
      title, description: description || '',
      villaNumber, block: block || '',
      type: type || 'APARTMENT', bhk: bhk || '3 BHK',
      area: Number(area) || 0, floor: floor || '', facing: facing || '',
      price: Number(price), priceNegotiable: !!priceNegotiable,
      maintenanceCharge: Number(maintenanceCharge) || 0,
      status: status || 'AVAILABLE', listingType: listingType || 'SALE',
      amenities: amenities || [], highlights: highlights || [],
      images: images || [],
      contactName: contactName || req.user?.name || '',
      contactPhone: contactPhone || '', contactEmail: contactEmail || req.user?.email || '',
      visibleToResidents: visibleToResidents !== false,
      community: community || req.user?.community,
      postedBy: req.user?._id
    };

    if (isConnected) {
      const listing = await Listing.create(data);
      const populated = await Listing.findById(listing._id).populate('postedBy', 'name email');
      return res.status(201).json({ success: true, listing: populated });
    } else {
      const listing = { _id: `lst_${Date.now()}`, ...data, views: 0, interestedCount: 0, createdAt: new Date() };
      memListings.unshift(listing);
      return res.status(201).json({ success: true, listing });
    }
  } catch (err) { next(err); }
};

// ── PUT /api/listings/:id — super admin update ────────────────────────────────
exports.updateListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isConnected = mongoose.connection.readyState === 1;
    const updates = req.body;

    if (isConnected && mongoose.Types.ObjectId.isValid(id)) {
      const listing = await Listing.findByIdAndUpdate(id, updates, { new: true })
        .populate('postedBy', 'name email');
      return res.json({ success: true, listing });
    } else {
      const idx = memListings.findIndex(l => l._id === id);
      if (idx > -1) Object.assign(memListings[idx], updates);
      return res.json({ success: true, listing: memListings[idx] });
    }
  } catch (err) { next(err); }
};

// ── DELETE /api/listings/:id — super admin delete ─────────────────────────────
exports.deleteListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected && mongoose.Types.ObjectId.isValid(id)) {
      await Listing.findByIdAndDelete(id);
    } else {
      memListings = memListings.filter(l => l._id !== id);
    }
    return res.json({ success: true, message: 'Listing removed' });
  } catch (err) { next(err); }
};

// ── POST /api/listings/:id/interest — resident expresses interest ─────────────
exports.expressInterest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected && mongoose.Types.ObjectId.isValid(id)) {
      const listing = await Listing.findByIdAndUpdate(id, { $inc: { interestedCount: 1 } }, { new: true });
      return res.json({ success: true, interestedCount: listing?.interestedCount });
    } else {
      const listing = memListings.find(l => l._id === id);
      if (listing) listing.interestedCount = (listing.interestedCount || 0) + 1;
      return res.json({ success: true, interestedCount: listing?.interestedCount });
    }
  } catch (err) { next(err); }
};

// ── POST /api/listings/:id/images — upload photos ───────────────────────────
exports.uploadListingImages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { uploadImages } = require('../services/imageService');
    const isConnected = mongoose.connection.readyState === 1;

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = await uploadImages(
        req.files.map(f => ({ buffer: f.buffer, mimetype: f.mimetype })),
        'communityhub/listings'
      );
    } else if (req.body.images) {
      imageUrls = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    }

    if (isConnected && mongoose.Types.ObjectId.isValid(id)) {
      const listing = await Listing.findByIdAndUpdate(
        id, { $push: { images: { $each: imageUrls } } }, { new: true }
      );
      return res.json({ success: true, images: listing.images });
    }
    const item = memListings.find(l => l._id === id);
    if (item) item.images = [...(item.images || []), ...imageUrls];
    return res.json({ success: true, images: item?.images || imageUrls });
  } catch (err) { next(err); }
};
