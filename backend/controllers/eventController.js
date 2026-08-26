const mongoose = require('mongoose');
const Event = require('../models/Event');

let memoryEvents = [];

exports.clearMemoryEvents = () => {
  memoryEvents = [];
};

// @desc Create New Event or Game Request (Resident & Admin)
// @route POST /api/events
exports.createEvent = async (req, res, next) => {
  try {
    const { title, description, location, eventDate, startTime, endTime, category, maxParticipants, bannerUrl } = req.body;
    const isConnected = mongoose.connection.readyState === 1;

    if (!title || !location || !eventDate) {
      return res.status(400).json({ success: false, message: 'Please provide event title, location, and date' });
    }

    if (isConnected) {
      const event = await Event.create({
        title,
        description: description || 'Community game / gathering organized by resident member.',
        location,
        eventDate: eventDate || new Date(),
        startTime: startTime || '18:00',
        endTime: endTime || '20:00',
        category: category || 'GAMES',
        maxParticipants: maxParticipants ? Number(maxParticipants) : 20,
        bannerUrl: bannerUrl || undefined,
        community: req.user.community,
        organizer: req.user._id,
        organizerName: req.user.name
      });
      const populated = await Event.findById(event._id).populate('organizer', 'name role');
      return res.status(201).json({ success: true, event: populated });
    } else {
      const event = {
        _id: `evt_${Date.now()}`,
        title,
        description: description || 'Community game / gathering organized by resident member.',
        location,
        eventDate: eventDate || new Date(),
        startTime: startTime || '18:00',
        endTime: endTime || '20:00',
        category: category || 'GAMES',
        maxParticipants: maxParticipants ? Number(maxParticipants) : 20,
        bannerUrl: bannerUrl || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
        organizer: { name: req.user.name, role: req.user.role },
        organizerName: req.user.name,
        attendees: []
      };
      memoryEvents.unshift(event);
      return res.status(201).json({ success: true, event });
    }
  } catch (error) {
    next(error);
  }
};

// @desc Delete Event / Game
// @route DELETE /api/events/:id
exports.deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected && mongoose.Types.ObjectId.isValid(id)) {
      await Event.findByIdAndDelete(id);
    } else {
      const idx = memoryEvents.findIndex(e => e._id === id);
      if (idx > -1) memoryEvents.splice(idx, 1);
    }

    return res.status(200).json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc Get All Events & Games
// @route GET /api/events
exports.getEvents = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected) {
      const events = await Event.find()
        .populate('organizer', 'name role')
        .populate('attendees.user', 'name avatar')
        .sort({ eventDate: 1 });

      const uniqueEvents = Array.from(new Map(events.map(item => [item._id.toString(), item])).values());
      return res.status(200).json({ success: true, count: uniqueEvents.length, events: uniqueEvents });
    } else {
      const uniqueEvents = Array.from(new Map(memoryEvents.map(item => [item._id, item])).values());
      return res.status(200).json({ success: true, count: uniqueEvents.length, events: uniqueEvents });
    }
  } catch (error) {
    next(error);
  }
};

// @desc Join Game / RSVP (Requires Name and Phone Number)
// @route POST /api/events/:id/join
exports.rsvpEvent = async (req, res, next) => {
  try {
    const { name, phone, status, guestsCount } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name and Mobile Phone Number are strictly required to join a game or event.' 
      });
    }

    const isConnected = mongoose.connection.readyState === 1;

    const attendeeRecord = {
      _id: `att_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      user: req.user._id,
      name,
      phone,
      status: status || 'GOING',
      guestsCount: Number(guestsCount) || 0,
      joinedAt: new Date()
    };

    if (isConnected && mongoose.Types.ObjectId.isValid(req.params.id)) {
      const event = await Event.findById(req.params.id);
      if (!event) return res.status(404).json({ success: false, message: 'Event / Game not found' });

      event.attendees.push(attendeeRecord);
      await event.save();
      const updated = await Event.findById(event._id).populate('attendees.user', 'name avatar');
      return res.status(200).json({ success: true, event: updated, message: 'Joined game successfully!' });
    } else {
      const event = memoryEvents.find(e => e._id === req.params.id) || memoryEvents[0];
      if (event) {
        if (!event.attendees) event.attendees = [];
        event.attendees.push(attendeeRecord);
      }
      return res.status(200).json({ success: true, event, message: 'Joined game successfully!' });
    }
  } catch (error) {
    next(error);
  }
};
