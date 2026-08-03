const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  location: { type: String, required: true }, // e.g. "Clubhouse Hall B"
  eventDate: { type: Date, required: true },
  startTime: { type: String, required: true }, // e.g. "18:00"
  endTime: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['FESTIVAL', 'SPORTS', 'MEETING', 'WORKSHOP', 'SOCIAL'], 
    default: 'SOCIAL' 
  },
  community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', required: true },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bannerUrl: { type: String, default: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80' },
  attendees: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['GOING', 'MAYBE', 'DECLINED'], default: 'GOING' },
    guestsCount: { type: Number, default: 1 }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
