const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  location: { type: String, required: true }, // e.g. "Clubhouse Court 1"
  eventDate: { type: Date, required: true },
  startTime: { type: String, required: true }, // e.g. "18:00"
  endTime: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['GAMES', 'SPORTS', 'FESTIVAL', 'MEETING', 'WORKSHOP', 'SOCIAL'], 
    default: 'GAMES' 
  },
  maxParticipants: { type: Number, default: 20 },
  community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community' },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  organizerName: { type: String, default: 'Resident' },
  bannerUrl: { type: String, default: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80' },
  attendees: [{
    _id: { type: String, default: () => `att_${Date.now()}_${Math.floor(Math.random()*1000)}` },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    status: { type: String, enum: ['GOING', 'INTERESTED', 'DECLINED'], default: 'GOING' },
    guestsCount: { type: Number, default: 0 },
    joinedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
