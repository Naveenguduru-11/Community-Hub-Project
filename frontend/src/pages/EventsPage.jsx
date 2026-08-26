import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { eventService } from '../services/api';
import { 
  Calendar, Clock, MapPin, Users, Plus, Trash2, X, 
  Gamepad2, Trophy, Phone, UserCheck, CheckCircle2, Sparkles, User, MessageSquare 
} from 'lucide-react';

export const EventsPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'COMMUNITY_ADMIN' || user?.role === 'SUPER_ADMIN';

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEventForJoin, setSelectedEventForJoin] = useState(null);
  const [viewAttendeesEvent, setViewAttendeesEvent] = useState(null);

  // Form state for creating a new Game / Event
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    location: '',
    eventDate: '',
    startTime: '18:00',
    endTime: '20:00',
    category: 'GAMES',
    maxParticipants: 10,
    bannerUrl: ''
  });

  // Form state for joining a Game / Event (Name & Phone required)
  const [joinForm, setJoinForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    status: 'GOING',
    guestsCount: 0
  });

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await eventService.getEvents();
      setEvents(res.data.events || []);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await eventService.createEvent(createForm);
      alert('Game / Event successfully posted to community hub!');
      setShowCreateModal(false);
      setCreateForm({
        title: '',
        description: '',
        location: '',
        eventDate: '',
        startTime: '18:00',
        endTime: '20:00',
        category: 'GAMES',
        maxParticipants: 10,
        bannerUrl: ''
      });
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create game / event');
    }
  };

  const handleOpenJoinModal = (ev) => {
    setSelectedEventForJoin(ev);
    setJoinForm({
      name: user?.name || '',
      phone: user?.phone || '',
      status: 'GOING',
      guestsCount: 0
    });
  };

  const handleExecuteJoinGame = async (e) => {
    e.preventDefault();
    if (!joinForm.name || !joinForm.phone) {
      alert('Please enter both your Full Name and Mobile Number to join.');
      return;
    }

    try {
      await eventService.joinGame(selectedEventForJoin._id, joinForm);
      alert(`🎉 You have joined "${selectedEventForJoin.title}" successfully!`);
      setSelectedEventForJoin(null);
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to join game');
    }
  };

  const handleDeleteEvent = async (id, title) => {
    if (confirm(`Delete event/game "${title}"?`)) {
      try {
        await eventService.deleteEvent(id);
        fetchEvents();
      } catch (err) {
        alert('Failed to delete event');
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-indigo-800/50">
        <div>
          <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-300 text-xs px-3 py-1 rounded-full font-bold mb-2 border border-purple-500/30">
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Resident Sports, Games & Community Events</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Community Play & Gatherings</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Host games (Badminton, Cricket, Chess), invite neighbors, request to play, and join matches. Name & Mobile Number are required to join.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-500/30 transition-all flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Host a Game / Event</span>
        </button>
      </div>

      {/* Inline Section: Create Game / Event (Resident & Admin) */}
      {showCreateModal && (
        <div className="bg-slate-900 text-white rounded-3xl p-6 border border-purple-500/50 shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span>Host a New Game or Community Event</span>
            </h3>
            <button onClick={() => setShowCreateModal(false)} className="text-xs text-slate-400 hover:text-white px-2.5 py-1 bg-slate-800 rounded-lg">
              Close Form
            </button>
          </div>

          <form onSubmit={handleCreateEvent} className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-6 space-y-1">
              <label className="block text-xs font-semibold text-slate-300">Game / Event Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Sunday Badminton Doubles Match / Cricket Tournament"
                value={createForm.title}
                onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-3 space-y-1">
              <label className="block text-xs font-semibold text-slate-300">Category</label>
              <select
                value={createForm.category}
                onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl"
              >
                <option value="GAMES">Indoor Games (Chess, Carrom, E-sports)</option>
                <option value="SPORTS">Outdoor Sports (Badminton, Cricket, Tennis)</option>
                <option value="SOCIAL">Social Gathering / Tea Party</option>
                <option value="FESTIVAL">Festival Celebration</option>
                <option value="WORKSHOP">Workshop / Hobby Club</option>
              </select>
            </div>

            <div className="md:col-span-3 space-y-1">
              <label className="block text-xs font-semibold text-slate-300">Max Players / Limit</label>
              <input
                type="number"
                min="2"
                max="100"
                value={createForm.maxParticipants}
                onChange={(e) => setCreateForm({ ...createForm, maxParticipants: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl font-bold text-amber-400"
              />
            </div>

            <div className="md:col-span-4 space-y-1">
              <label className="block text-xs font-semibold text-slate-300">Location / Court Venue</label>
              <input
                type="text"
                required
                placeholder="e.g. Clubhouse Court 1 / Community Turf"
                value={createForm.location}
                onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl"
              />
            </div>

            <div className="md:col-span-4 space-y-1">
              <label className="block text-xs font-semibold text-slate-300">Event Date</label>
              <input
                type="date"
                required
                value={createForm.eventDate}
                onChange={(e) => setCreateForm({ ...createForm, eventDate: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl"
              />
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="block text-xs font-semibold text-slate-300">Start Time</label>
              <input
                type="time"
                value={createForm.startTime}
                onChange={(e) => setCreateForm({ ...createForm, startTime: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl"
              />
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="block text-xs font-semibold text-slate-300">End Time</label>
              <input
                type="time"
                value={createForm.endTime}
                onChange={(e) => setCreateForm({ ...createForm, endTime: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl"
              />
            </div>

            <div className="md:col-span-12 space-y-1">
              <label className="block text-xs font-semibold text-slate-300">Description & Game Rules</label>
              <textarea
                rows="2"
                placeholder="Describe match details, equipment needed, team guidelines..."
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl"
              />
            </div>

            <div className="md:col-span-12 flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-500/25 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Publish Game / Event</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Events & Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map(ev => {
          const attendeeCount = ev.attendees?.length || 0;
          const isOrganizer = user && (ev.organizer?._id === user._id || ev.organizerName === user.name);

          return (
            <div key={ev._id} className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
              <div>
                <div className="relative">
                  <img
                    src={ev.bannerUrl || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80'}
                    alt={ev.title}
                    className="w-full h-44 object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-slate-950/80 text-white px-3 py-1 rounded-full text-[11px] font-bold backdrop-blur-md border border-slate-700/80 flex items-center gap-1.5">
                    <Gamepad2 className="w-3.5 h-3.5 text-purple-400" />
                    <span>Hosted by {ev.organizer?.name || ev.organizerName || 'Resident'}</span>
                  </div>

                  {(isAdmin || isOrganizer) && (
                    <button
                      onClick={() => handleDeleteEvent(ev._id, ev.title)}
                      className="absolute top-3 right-3 p-2 bg-slate-900/80 hover:bg-red-600 text-white rounded-xl backdrop-blur-md transition-colors"
                      title="Cancel Game / Event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold font-mono tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300">
                      {ev.category}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-purple-500" />
                      {new Date(ev.eventDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{ev.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{ev.description}</p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 text-xs space-y-2">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                      <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                      <span>{ev.location}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>{ev.startTime} - {ev.endTime}</span>
                      </div>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {attendeeCount} / {ev.maxParticipants || 20} Joined
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0 space-y-3">
                {/* Joined Attendees Preview Badge Row */}
                {attendeeCount > 0 && (
                  <div className="bg-purple-50 dark:bg-purple-950/40 p-3 rounded-2xl border border-purple-100 dark:border-purple-800/50 flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Users className="w-4 h-4 text-purple-500 shrink-0" />
                      <div className="truncate text-xs font-semibold text-purple-900 dark:text-purple-200">
                        <span>Joined: </span>
                        <strong>{ev.attendees.map(a => a.name).join(', ')}</strong>
                      </div>
                    </div>
                    <button
                      onClick={() => setViewAttendeesEvent(ev)}
                      className="text-[11px] font-bold text-purple-600 dark:text-purple-300 underline shrink-0 ml-2"
                    >
                      View List
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenJoinModal(ev)}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
                  >
                    <Gamepad2 className="w-4 h-4" />
                    <span>Join Game / RSVP</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal / Panel: Join Game (Requires Name & Mobile Number) */}
      {selectedEventForJoin && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-emerald-500/50 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-white text-base">Join Game / RSVP</h3>
              </div>
              <button onClick={() => setSelectedEventForJoin(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-xs space-y-1">
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">Game Details:</span>
              <h4 className="font-extrabold text-sm text-white">{selectedEventForJoin.title}</h4>
              <p className="text-slate-400">📍 {selectedEventForJoin.location} • ⏰ {selectedEventForJoin.startTime}</p>
            </div>

            <form onSubmit={handleExecuteJoinGame} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-200">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={joinForm.name}
                    onChange={(e) => setJoinForm({ ...joinForm, name: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm font-semibold text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-200">
                  Mobile Phone Number <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={joinForm.phone}
                    onChange={(e) => setJoinForm({ ...joinForm, phone: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm font-semibold text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-400">Required so game organizers/players can contact you.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Participation Status</label>
                  <select
                    value={joinForm.status}
                    onChange={(e) => setJoinForm({ ...joinForm, status: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl font-bold text-emerald-400"
                  >
                    <option value="GOING">Playing (Confirmed)</option>
                    <option value="INTERESTED">Interested / Bench</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Extra Guests</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    value={joinForm.guestsCount}
                    onChange={(e) => setJoinForm({ ...joinForm, guestsCount: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedEventForJoin(null)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/25"
                >
                  Confirm & Join Match
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Joined Participants List */}
      {viewAttendeesEvent && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-purple-500/50 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  <span>Joined Players & Contact Roster</span>
                </h3>
                <span className="text-xs text-slate-400">{viewAttendeesEvent.title}</span>
              </div>
              <button onClick={() => setViewAttendeesEvent(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
              {!viewAttendeesEvent.attendees?.length ? (
                <p className="text-xs text-slate-400 py-4 text-center">No participants joined yet.</p>
              ) : (
                viewAttendeesEvent.attendees.map((att, i) => (
                  <div key={i} className="p-3 bg-slate-850 bg-slate-800/80 rounded-2xl border border-slate-700/70 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-purple-600/30 text-purple-300 font-bold flex items-center justify-center text-xs">
                        #{i + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{att.name}</h4>
                        <a
                          href={`tel:${att.phone}`}
                          className="text-[11px] text-blue-400 hover:underline flex items-center gap-1 font-semibold mt-0.5"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{att.phone}</span>
                        </a>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="px-2.5 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full font-bold text-[10px]">
                        {att.status || 'GOING'}
                      </span>
                      {att.guestsCount > 0 && (
                        <span className="block text-[10px] text-slate-400 mt-0.5">+ {att.guestsCount} Guest(s)</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-slate-800 text-right">
              <button
                onClick={() => setViewAttendeesEvent(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl"
              >
                Close Roster
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
