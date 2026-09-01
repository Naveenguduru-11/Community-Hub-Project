import React, { useState, useEffect } from 'react';
import { complaintService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ComplaintModal } from '../components/complaints/ComplaintModal';
import { AlertCircle, Plus, Trash2, ArrowRight, CheckCircle2, Clock, RefreshCw } from 'lucide-react';

const STATUS_CONFIG = {
  OPEN:        { label: 'Open',        bg: '#ef444418', text: '#f87171', border: '#ef444433', icon: AlertCircle },
  IN_PROGRESS: { label: 'In Progress', bg: '#f59e0b18', text: '#fbbf24', border: '#f59e0b33', icon: Clock },
  RESOLVED:    { label: 'Resolved',    bg: '#10b98118', text: '#34d399', border: '#10b98133', icon: CheckCircle2 },
};
const STATUS_ORDER = ['OPEN', 'IN_PROGRESS', 'RESOLVED'];

export const ComplaintsPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'COMMUNITY_ADMIN' || user?.role === 'SUPER_ADMIN';

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await complaintService.getComplaints();
      setComplaints(Array.from(new Map((res.data.complaints || []).map(c => [c._id, c])).values()));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComplaints(); }, []);

  const handleDelete = async (id, title) => {
    if (confirm(`Delete helpdesk ticket "${title}"?`)) {
      try {
        await complaintService.deleteComplaint(id);
        fetchComplaints();
      } catch { alert('Failed to delete complaint ticket'); }
    }
  };

  // Admin: update status
  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await complaintService.updateStatus(id, { status: newStatus });
      setComplaints(prev => prev.map(c => c._id === id ? { ...c, status: newStatus } : c));
    } catch { alert('Failed to update status'); }
    finally { setUpdatingId(null); }
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Maintenance Helpdesk &amp; Complaints
          </h1>
          <p className="text-xs text-slate-500">
            {isAdmin
              ? 'Manage all tickets — update status, assign priority, or close resolved issues.'
              : 'Track resolution progress for plumbing, electrical, and security tickets, or cancel active tickets.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={fetchComplaints}
            style={{
              padding: '8px 10px', background: 'var(--ch-card-bg)', border: '1px solid var(--ch-card-border)',
              borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--ch-text-muted)'
            }}
            title="Refresh"
          >
            <RefreshCw size={14} />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-500/25"
          >
            <Plus className="w-4 h-4" />
            <span>+ Raise Ticket</span>
          </button>
        </div>
      </div>

      {/* ── Summary badges (admin only) ── */}
      {isAdmin && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {STATUS_ORDER.map(s => {
            const cfg = STATUS_CONFIG[s];
            const count = complaints.filter(c => c.status === s).length;
            return (
              <div key={s} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
                borderRadius: 99, background: cfg.bg, border: `1px solid ${cfg.border}`, fontSize: 12, fontWeight: 700, color: cfg.text
              }}>
                <cfg.icon size={13} />
                {cfg.label}: {count}
              </div>
            );
          })}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
            borderRadius: 99, background: 'var(--ch-card-bg)', border: '1px solid var(--ch-card-border)',
            fontSize: 12, fontWeight: 700, color: 'var(--ch-text-muted)'
          }}>
            Total: {complaints.length}
          </div>
        </div>
      )}

      {/* ── Complaint Cards ── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--ch-text-muted)', fontSize: 13 }}>
          Loading tickets…
        </div>
      ) : complaints.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--ch-text-muted)' }}>
          <AlertCircle size={40} style={{ opacity: 0.2, margin: '0 auto 12px' }} />
          <p style={{ fontWeight: 600, fontSize: 14 }}>No tickets found</p>
          <p style={{ fontSize: 12, marginTop: 4 }}>Raise a new ticket to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {complaints.map(c => {
            const st = STATUS_CONFIG[c.status] || STATUS_CONFIG.OPEN;
            const StIcon = st.icon;
            const isUpdating = updatingId === c._id;

            return (
              <div key={c._id} className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm"
                style={{ overflow: 'hidden' }}
              >
                {/* Colour stripe */}
                <div style={{ height: 4, background: st.text, opacity: 0.7 }} />

                <div style={{ padding: '16px 20px' }}>
                  {/* Title row */}
                  <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                    <h4 className="font-bold text-slate-900 dark:text-white text-base" style={{ flex: 1, marginRight: 8 }}>
                      {c.title}
                    </h4>
                    <button
                      onClick={() => handleDelete(c._id, c.title)}
                      className="p-1 text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                      title="Delete Ticket"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-500" style={{ marginBottom: 12, lineHeight: 1.5 }}>{c.description}</p>

                  {/* Tags row */}
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold overflow-x-auto pb-1" style={{ marginBottom: 12 }}>
                    <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded flex-shrink-0">
                      V-{c.villa?.villaNumber || c.villaNumber || '—'}
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-300 flex-shrink-0" />
                    <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-1 rounded flex-shrink-0">
                      {c.category}
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-300 flex-shrink-0" />
                    <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded flex-shrink-0">
                      {c.assignedTo || 'Unassigned'}
                    </span>
                  </div>

                  {/* Status section */}
                  {isAdmin ? (
                    /* Admin: clickable status buttons */
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, color: 'var(--ch-text-muted)', fontWeight: 600, marginRight: 2 }}>Status:</span>
                      {STATUS_ORDER.map(s => {
                        const cfg = STATUS_CONFIG[s];
                        const active = c.status === s;
                        return (
                          <button
                            key={s}
                            disabled={isUpdating}
                            onClick={() => !active && handleStatusChange(c._id, s)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 5,
                              padding: '4px 11px', borderRadius: 99, fontSize: 10, fontWeight: 700,
                              cursor: active ? 'default' : 'pointer',
                              background: active ? cfg.bg : 'transparent',
                              color: active ? cfg.text : 'var(--ch-text-muted)',
                              border: `1.5px solid ${active ? cfg.border : 'var(--ch-card-border)'}`,
                              transition: 'all 0.15s',
                              opacity: isUpdating ? 0.6 : 1,
                              transform: active ? 'scale(1.04)' : 'scale(1)',
                            }}
                          >
                            <cfg.icon size={10} />
                            {cfg.label}
                            {active && <span style={{ marginLeft: 2 }}>✓</span>}
                          </button>
                        );
                      })}
                      {isUpdating && (
                        <span style={{ fontSize: 10, color: 'var(--ch-text-muted)', fontStyle: 'italic' }}>Saving…</span>
                      )}
                    </div>
                  ) : (
                    /* Resident: read-only status badge */
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        padding: '4px 11px', borderRadius: 99, fontSize: 10, fontWeight: 700,
                        background: st.bg, color: st.text, border: `1px solid ${st.border}`
                      }}>
                        <StIcon size={10} />
                        {st.label}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ComplaintModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onComplaintCreated={() => fetchComplaints()}
      />
    </div>
  );
};
