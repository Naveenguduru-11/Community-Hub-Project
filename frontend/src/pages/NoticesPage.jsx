import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { noticeService } from '../services/api';
import { Bell, Plus, Trash2, X, Pencil, CheckCircle2 } from 'lucide-react';

const EMPTY_FORM = { title: '', content: '', category: 'GENERAL', priority: 'NORMAL' };

const priorityConfig = {
  NORMAL:  { label: 'Normal',  color: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' },
  HIGH:    { label: 'High',    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  URGENT:  { label: 'URGENT',  color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
};

const categoryEmoji = {
  GENERAL:     '📢',
  MAINTENANCE: '🔧',
  SECURITY:    '🔒',
  EVENT:       '🎉',
  RULES:       '📜',
};

export const NoticesPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'COMMUNITY_ADMIN';

  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state: null = closed | 'create' | 'edit'
  const [modalMode, setModalMode] = useState(null);
  const [editingNotice, setEditingNotice] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

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

  useEffect(() => { fetchNotices(); }, []);

  /* ── Open create modal ── */
  const openCreate = () => {
    setFormData(EMPTY_FORM);
    setEditingNotice(null);
    setModalMode('create');
    setSuccessMsg('');
  };

  /* ── Open edit modal pre-filled ── */
  const openEdit = (n) => {
    setFormData({
      title: n.title,
      content: n.content,
      category: n.category,
      priority: n.priority,
    });
    setEditingNotice(n);
    setModalMode('edit');
    setSuccessMsg('');
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingNotice(null);
    setFormData(EMPTY_FORM);
    setSuccessMsg('');
  };

  /* ── Submit: create or update ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modalMode === 'create') {
        await noticeService.createNotice(formData);
        setSuccessMsg('Notice published successfully!');
      } else {
        await noticeService.updateNotice(editingNotice._id, formData);
        setSuccessMsg('Notice updated successfully!');
      }
      await fetchNotices();
      setTimeout(closeModal, 1200);
    } catch (err) {
      alert(modalMode === 'create' ? 'Failed to publish notice' : 'Failed to update notice');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (confirm(`Delete notice "${title}"?`)) {
      try {
        await noticeService.deleteNotice(id);
        fetchNotices();
      } catch {
        alert('Failed to delete notice');
      }
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            Community Notice Board
            {isAdmin && (
              <span className="text-xs bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-2.5 py-0.5 rounded-full font-bold">
                Admin Access
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Official circulars, maintenance alerts, and society announcements.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Publish Notice</span>
          </button>
        )}
      </div>

      {/* Notice List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-16 text-slate-400 text-sm">Loading notices...</div>
        ) : notices.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm">No notices published yet.</div>
        ) : (
          notices.map(n => {
            const pCfg = priorityConfig[n.priority] || priorityConfig.NORMAL;
            const emoji = categoryEmoji[n.category] || '📢';
            return (
              <div key={n._id} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">

                {/* Top row: category badge + date + admin actions */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full uppercase flex items-center gap-1.5">
                    <span>{emoji}</span>
                    <span>{n.category}</span>
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">
                      {new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>

                    {isAdmin && (
                      <>
                        {/* Edit button */}
                        <button
                          onClick={() => openEdit(n)}
                          className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-lg transition-colors"
                          title="Edit Notice"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        {/* Delete button */}
                        <button
                          onClick={() => handleDelete(n._id, n.title)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                          title="Delete Notice"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{n.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{n.content}</p>

                <div className="border-t border-slate-100 dark:border-slate-700/60 pt-3 flex items-center justify-between text-xs text-slate-400">
                  <span>Published by: <span className="font-semibold text-slate-600 dark:text-slate-300">{n.author?.name || 'Community Admin'}</span></span>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${pCfg.color}`}>
                    {pCfg.label} Priority
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700">

            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
                {modalMode === 'create' ? (
                  <><Bell className="w-5 h-5 text-purple-500" /> Publish Notice Circular</>
                ) : (
                  <><Pencil className="w-5 h-5 text-purple-500" /> Edit Notice</>
                )}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Success flash */}
            {successMsg && (
              <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Notice Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scheduled Water Supply Shutdown"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Notice Content</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Enter complete circular text, instructions, dates..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="GENERAL">📢 General</option>
                    <option value="MAINTENANCE">🔧 Maintenance</option>
                    <option value="SECURITY">🔒 Security</option>
                    <option value="EVENT">🎉 Event</option>
                    <option value="RULES">📜 Rules/Bylaws</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="NORMAL">Normal Priority</option>
                    <option value="HIGH">⚠️ High Priority</option>
                    <option value="URGENT">🚨 URGENT Alert</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-semibold rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-bold rounded-xl text-xs shadow-lg shadow-purple-500/25 transition-all"
                >
                  {saving
                    ? (modalMode === 'create' ? 'Publishing...' : 'Saving...')
                    : (modalMode === 'create' ? 'Publish Notice' : 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
