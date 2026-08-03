const mongoose = require('mongoose');
const Event = require('../models/Event');

let memoryEvents = [];

exports.clearMemoryEvents = () => {
  memoryEvents = [];
};

exports.createEvent = async (req, res, next) => {
  try {
    const { title, description, location, eventDate, startTime, endTime, category, bannerUrl } = req.body;
    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected) {
      const event = await Event.create({
        title,
        description,
        location,
        eventDate: eventDate || new Date(),
        startTime,
        endTime,
        category: category || 'SOCIAL',
        bannerUrl: bannerUrl || undefined,
        community: req.user.community,
        organizer: req.user._id
      });
      const populated = await Event.findById(event._id).populate('organizer', 'name role');
      return res.status(201).json({ success: true, event: populated });
    } else {
      const event = {
        _id: `evt_${Date.now()}`,
        title,
        description,
        location,
        eventDate: eventDate || new Date(),
        startTime,
        endTime,
        category: category || 'SOCIAL',
        bannerUrl: bannerUrl || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
        organizer: { name: req.user.name, role: req.user.role },
        attendees: []
      };
      memoryEvents.unshift(event);
      return res.status(201).json({ success: true, event });
    }
  } catch (error) {
    next(error);
  }
};

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

exports.getEvents = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected) {
      const events = await Event.find()
        .populate('organizer', 'name role')
        .populate('attendees.user', 'name avatar')
        .sort({ eventDate: 1 });

      return res.status(200).json({ success: true, count: events.length, events });
    } else {
      return res.status(200).json({ success: true, count: memoryEvents.length, events: memoryEvents });
    }
  } catch (error) {
    next(error);
  }
};

exports.rsvpEvent = async (req, res, next) => {
  try {
    const { status, guestsCount } = req.body;
    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected && mongoose.Types.ObjectId.isValid(req.params.id)) {
      const event = await Event.findById(req.params.id);
      if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

      event.attendees.push({ user: req.user._id, status: status || 'GOING', guestsCount: guestsCount || 1 });
      await event.save();
      const updated = await Event.findById(event._id).populate('attendees.user', 'name avatar');
      return res.status(200).json({ success: true, event: updated });
    } else {
      const event = memoryEvents.find(e => e._id === req.params.id) || memoryEvents[0];
      if (event) {
        event.attendees.push({ user: { _id: req.user._id, name: req.user.name }, status: status || 'GOING', guestsCount: 1 });
      }
      return res.status(200).json({ success: true, event });
    }
  } catch (error) {
    next(error);
  }
};
