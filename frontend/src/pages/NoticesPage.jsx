import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { noticeService } from '../services/api';
import { Bell, Plus, Trash2, X, Sparkles, AlertTriangle } from 'lucide-react';

export const NoticesPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'COMMUNITY_ADMIN';

  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'GENERAL',
    priority: 'NORMAL'
  });

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await noticeService.getNotices();
      setNotices(res.data.notices || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    try {
      await noticeService.createNotice(formData);
      alert('Community notice circular published live across all screens!');
      setShowModal(false);
      setFormData({ title: '', content: '', category: 'GENERAL', priority: 'NORMAL' });
      fetchNotices();
    } catch (err) {
      alert('Failed to publish notice');
    }
  };

  const handleDeleteNotice = async (id, title) => {
    if (confirm(`Delete circular notice "${title}"?`)) {
      try {
        await noticeService.deleteNotice(id);
        fetchNotices();
      } catch (err) {
        alert('Failed to delete notice');
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>Community Notice Board</span>
            {isAdmin && (
              <span className="text-xs bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-2.5 py-0.5 rounded-full font-bold">
                Publishing Access Active
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Official circulars, water/power maintenance alerts, and society announcements.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Publish Notice Circular</span>
          </button>
        )}
      </div>

      {/* Notice List */}
      <div className="space-y-4">
        {notices.map(n => (
          <div key={n._id} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full uppercase">
                {n.category}
              </span>
              
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">
                  {new Date(n.createdAt).toLocaleDateString()}
                </span>
                {isAdmin && (
                  <button
                    onClick={() => handleDeleteNotice(n._id, n.title)}
                    className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                    title="Delete Notice"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{n.title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{n.content}</p>

            <div className="border-t border-slate-100 dark:border-slate-700/60 pt-3 flex items-center justify-between text-xs text-slate-400">
              <span>Published by: {n.author?.name || 'Super Admin / Community Admin'}</span>
              <span className="font-semibold text-purple-600 dark:text-purple-400">Priority: {n.priority}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Publish Notice Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
                <Bell className="w-5 h-5 text-purple-500" />
                Publish Society Notice Circular
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNotice} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Notice Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scheduled Water Supply Shutdown / Annual General Body Meeting"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Notice Circular Content</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Enter complete circular text, instructions, dates..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="GENERAL">General Notice</option>
                    <option value="MAINTENANCE">Maintenance Alert</option>
                    <option value="SECURITY">Security Warning</option>
                    <option value="EVENT">Event Circular</option>
                    <option value="RULES">Society Bylaws/Rules</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="NORMAL">Normal Priority</option>
                    <option value="HIGH">High Priority</option>
                    <option value="URGENT">URGENT Alert</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white font-semibold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-purple-500/25"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
