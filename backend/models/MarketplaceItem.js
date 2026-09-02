const mongoose = require('mongoose');

const marketplaceItemSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category: {
    type: String,
    enum: ['furniture','electronics','appliances','kitchen','computers','vehicles',
           'books','sports','kids','decor','clothing','services','other'],
    default: 'other'
  },
  price:     { type: Number, required: true, min: 0 },
  condition: { type: String, enum: ['New','Like New','Good','Used'], default: 'Good' },
  status:    { type: String, enum: ['Available','Reserved','Sold'], default: 'Available' },

  // Images stored as Cloudinary URLs or base64 data URIs
  images: [{ type: String }],

  // Seller info
  seller:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sellerName:  { type: String, default: '' },
  location:    { type: String, default: '' },  // e.g. "Tower B, Floor 3"

  // Community scope
  community:   { type: mongoose.Schema.Types.ObjectId, ref: 'Community' },

  // Engagement
  views: { type: Number, default: 0 },

  // Contact
  contactPhone: { type: String, default: '' },
  contactEmail: { type: String, default: '' },
}, { timestamps: true });

marketplaceItemSchema.index({ community: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('MarketplaceItem', marketplaceItemSchema);
