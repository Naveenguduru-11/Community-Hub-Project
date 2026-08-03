import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { eventService } from '../services/api';
import { Calendar, Clock, MapPin, Users, Plus, Trash2, X, ShieldAlert, Sparkles } from 'lucide-react';

export const EventsPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'COMMUNITY_ADMIN' || user?.role === 'SUPER_ADMIN';

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    eventDate: '',
    startTime: '18:00',
    endTime: '21:00',
    category: 'SOCIAL',
    bannerUrl: ''
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await eventService.getEvents();
      setEvents(res.data.events);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await eventService.createEvent(formData);
      alert('Community event created and published successfully!');
      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        location: '',
        eventDate: '',
        startTime: '18:00',
        endTime: '21:00',
        category: 'SOCIAL',
        bannerUrl: ''
      });
      fetchEvents();
    } catch (err) {
      alert('Failed to create event');
    }
  };

  const handleDeleteEvent = async (id, title) => {
    if (confirm(`Delete community event "${title}"?`)) {
      try {
        await eventService.deleteEvent(id);
        fetchEvents();
      } catch (err) {
        alert('Failed to delete event');
      }
    }
  };

  const handleRSVP = async (eventId, status) => {
    try {
      await eventService.rsvp(eventId, { status, guestsCount: 2 });
      fetchEvents();
    } catch (err) {
      alert('RSVP update failed');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>Community Events & Celebrations</span>
            <span className="text-xs bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-2.5 py-0.5 rounded-full font-bold">
              {isAdmin ? 'Admin Management Mode' : 'Resident Portal'}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isAdmin 
              ? 'Community Admins & Super Admins can publish events and manage RSVPs.' 
              : 'Official events organized by Community Management. Residents can RSVP below.'}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Community Event</span>
          </button>
        )}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map(ev => (
          <div key={ev._id} className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
            <div>
              <div className="relative">
                <img
                  src={ev.bannerUrl || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80'}
                  alt={ev.title}
                  className="w-full h-48 object-cover"
                />
                {isAdmin && (
                  <button
                    onClick={() => handleDeleteEvent(ev._id, ev.title)}
                    className="absolute top-3 right-3 p-2 bg-slate-900/80 hover:bg-red-600 text-white rounded-xl backdrop-blur-md transition-colors"
                    title="Delete Event"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full uppercase">
                    {ev.category}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(ev.eventDate).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{ev.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{ev.description}</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-700 text-xs space-y-1">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>{ev.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>{ev.startTime} - {ev.endTime}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 pt-0">
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-4">
                <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                  <Users className="w-4 h-4 text-emerald-500" />
                  {ev.attendees?.length || 0} Attending
                </span>
                <button
                  onClick={() => handleRSVP(ev._id, 'GOING')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                >
                  RSVP Going
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Admin Event Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                Create Community Event
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Diwali Cultural Fest & Garba"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Describe event highlights, rules, food stalls..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Location / Venue</label>
                  <input
                    type="text"
                    required
                    placeholder="Clubhouse Hall A"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Event Date</label>
                  <input
                    type="date"
                    required
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="SOCIAL">Social / Gathering</option>
                    <option value="FESTIVAL">Festival</option>
                    <option value="SPORTS">Sports Tournament</option>
                    <option value="MEETING">Society Meeting</option>
                    <option value="WORKSHOP">Workshop</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Banner Image URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={formData.bannerUrl}
                  onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white font-semibold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-purple-500/25"
                >
                  Publish Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
