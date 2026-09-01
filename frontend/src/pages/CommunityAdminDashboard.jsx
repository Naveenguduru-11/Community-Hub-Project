import React, { useState, useEffect } from 'react';
import { analyticsService, complaintService, paymentService, noticeService, authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { RazorpayModal } from '../components/payments/RazorpayModal';
import {
  Building2, Users, IndianRupee, AlertCircle,
  UserPlus, MessageSquarePlus, UserCheck, Megaphone,
  CreditCard, FileBarChart, Bell, Car,
  CheckCircle2, ArrowRight, TrendingUp, TrendingDown,
  Trash2, X, Plus, Loader2
} from 'lucide-react';

/* ── Helpers ─────────────────────────────────────────────── */
const inp = {
  padding: '9px 14px', borderRadius: 10,
  border: '1px solid var(--ch-card-border)',
  background: 'var(--ch-body-bg)', color: 'var(--ch-text-primary)',
  fontSize: 13, fontFamily: 'inherit', width: '100%', outline: 'none',
};
const ModalOverlay = ({ children }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
    {children}
  </div>
);
const ModalBox = ({ children, maxWidth = 440 }) => (
  <div style={{ background: 'var(--ch-card-bg)', borderRadius: 18, padding: 28, width: '100%', maxWidth, boxShadow: '0 24px 64px rgba(0,0,0,0.22)', maxHeight: '90vh', overflowY: 'auto' }}>
    {children}
  </div>
);

/* ── SVG Donut Chart ──────────────────────────────────────── */
function DonutChart({ segments, size = 110, strokeWidth = 18 }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const cx = size / 2, cy = size / 2;
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="ch-donut-svg" style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} />
      {segments.map((seg, i) => {
        const dash = (seg.value / total) * circ;
        const gap = circ - dash;
        const el = <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={seg.color} strokeWidth={strokeWidth} strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-offset} strokeLinecap="round" />;
        offset += dash;
        return el;
      })}
    </svg>
  );
}

/* ── Quick Action Button ─────────────────────────────────── */
function QuickBtn({ icon: Icon, label, color, onClick, to }) {
  const inner = (
    <>
      <span className="ch-quick-icon" style={{ background: color + '22' }}>
        <Icon size={20} style={{ color }} />
      </span>
      <span className="ch-quick-label">{label}</span>
    </>
  );
  if (to) return <Link to={to} className="ch-quick-btn">{inner}</Link>;
  return <button className="ch-quick-btn" onClick={onClick}>{inner}</button>;
}

/* ── Stat Card ───────────────────────────────────────────── */
function StatCard({ icon: Icon, iconClass, label, value, sub, trendUp, trendLabel }) {
  return (
    <div className="ch-stat-card">
      <span className={`ch-stat-icon ${iconClass}`}><Icon size={24} /></span>
      <div className="ch-stat-body">
        <div className="ch-stat-label">{label}</div>
        <div className="ch-stat-value ch-stat-value--sm">{value}</div>
        {sub && <div className="ch-stat-sub">{sub}</div>}
        {trendLabel && (
          <div className={`ch-stat-trend ${trendUp ? 'ch-stat-trend--up' : 'ch-stat-trend--down'}`}>
            {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trendLabel}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════ */
export const CommunityAdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  /* ── State ── */
  const [stats, setStats]             = useState(null);
  const [complaints, setComplaints]   = useState([]);
  const [payments, setPayments]       = useState([]);
  const [notices, setNotices]         = useState([]);
  const [residents, setResidents]     = useState([]);
  const [loading, setLoading]         = useState(true);

  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [showBillModal, setShowBillModal]     = useState(false);
  const [showResidentModal, setShowResidentModal] = useState(false);
  const [selectedBillForPayment, setSelectedBillForPayment] = useState(null);
  const [residentTab, setResidentTab] = useState('list'); // 'list' | 'add'
  const [deleting, setDeleting]       = useState(null);
  const [addLoading, setAddLoading]   = useState(false);

  const [noticeForm, setNoticeForm] = useState({ title: '', content: '', category: 'GENERAL', priority: 'NORMAL' });
  const [billForm, setBillForm]     = useState({ month: 'August 2026', amount: 4500, adminNotes: 'Standard monthly maintenance fee' });
  const [genLoading, setGenLoading] = useState(false);
  const [newResident, setNewResident] = useState({
    name: '', email: '', password: 'password123',
    role: 'RESIDENT', phone: '', villaNumber: ''
  });

  /* ── Fetch ── */
  const fetchData = async () => {
    setLoading(true);
    try {
      const [sRes, cRes, pRes, nRes] = await Promise.all([
        analyticsService.getStats(),
        complaintService.getComplaints(),
        paymentService.getPayments(),
        noticeService.getNotices(),
      ]);
      setStats(sRes.data.stats || {});
      setComplaints(Array.from(new Map((cRes.data.complaints || []).map(c => [c._id, c])).values()));
      setPayments(Array.from(new Map((pRes.data.payments || []).map(p => [p._id, p])).values()));
      setNotices(Array.from(new Map((nRes.data.notices || []).map(n => [n._id, n])).values()));
    } catch (err) { console.error('Admin dashboard error:', err); }
    finally { setLoading(false); }
  };

  const fetchResidents = async () => {
    try {
      const res = await authService.getAllResidents();
      setResidents(Array.from(new Map((res.data.residents || res.data.users || []).map(r => [r._id, r])).values()));
    } catch (err) { console.error('Residents fetch error:', err); }
  };

  useEffect(() => { fetchData(); }, []);

  /* ── Handlers ── */
  const handlePublishNotice = async (e) => {
    e.preventDefault();
    try {
      await noticeService.createNotice(noticeForm);
      setShowNoticeModal(false);
      setNoticeForm({ title: '', content: '', category: 'GENERAL', priority: 'NORMAL' });
      fetchData();
    } catch { alert('Failed to publish notice'); }
  };

  const handleGenerateBills = async (e) => {
    e.preventDefault();
    setGenLoading(true);
    try {
      await paymentService.generateBills({ month: billForm.month, amount: Number(billForm.amount), adminNotes: billForm.adminNotes });
      alert(`Bills of ₹${billForm.amount} generated for ${billForm.month}!`);
      setShowBillModal(false);
      fetchData();
    } catch (err) { alert(err.response?.data?.message || 'Failed to generate bills'); }
    finally { setGenLoading(false); }
  };

  const handleOpenResidentModal = () => {
    setShowResidentModal(true);
    setResidentTab('list');
    fetchResidents();
  };

  const handleAddResident = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    try {
      await authService.register(newResident);
      setNewResident({ name: '', email: '', password: 'password123', role: 'RESIDENT', phone: '', villaNumber: '' });
      setResidentTab('list');
      fetchResidents();
      fetchData();
    } catch (err) { alert(err.response?.data?.message || 'Failed to add resident'); }
    finally { setAddLoading(false); }
  };

  const handleDeleteResident = async (id, name) => {
    if (!confirm(`Remove ${name} from the community?`)) return;
    setDeleting(id);
    try {
      await authService.deleteResident(id);
      setResidents(prev => prev.filter(r => r._id !== id));
      fetchData();
    } catch (err) { alert(err.response?.data?.message || 'Failed to remove resident'); }
    finally { setDeleting(null); }
  };

  /* ── Derived (real data only, no fake fallbacks) ── */
  const totalVillas    = stats?.totalVillas    || 0;
  const totalResidents = stats?.totalResidents || 0;
  const pendingRevenue = stats?.pendingRevenue || 0;
  const paidRevenue    = stats?.totalRevenueCollected || 0;
  const overdueRevenue = stats?.overdueRevenue || 0;
  const totalRevenue   = paidRevenue + pendingRevenue + overdueRevenue;
  const paidPct        = totalRevenue ? Math.round((paidRevenue    / totalRevenue) * 100) : 0;
  const pendingPct     = totalRevenue ? Math.round((pendingRevenue / totalRevenue) * 100) : 0;
  const overduePct     = Math.max(0, 100 - paidPct - pendingPct);

  const openCount         = complaints.filter(c => c.status === 'OPEN').length;
  const inProgCount       = complaints.filter(c => c.status === 'IN_PROGRESS').length;
  const resolvedCount     = complaints.filter(c => c.status === 'RESOLVED').length;
  const totalComplaintCount = complaints.length;
  const openComplaints    = openCount + inProgCount;

  // Recent payments: only those with valid villa numbers, deduplicated
  const recentPayments = payments
    .filter(p => p.villa?.villaNumber && String(p.villa.villaNumber).length > 1)
    .slice(0, 4);

  const recentNotices = notices.slice(0, 3);

  const NOTICE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6'];
  const NOTICE_ICONS  = ['📢', '🔧', '🎉', '📋'];
  const ROLE_COLORS   = { RESIDENT: '#10b981', COMMUNITY_ADMIN: '#6366f1', SECURITY_GUARD: '#f59e0b' };

  function fmtINR(n) { return '₹ ' + Number(n || 0).toLocaleString('en-IN'); }
  function timeAgo(date) {
    if (!date) return '';
    const diff = (Date.now() - new Date(date)) / 1000;
    if (diff < 3600) return `${Math.round(diff / 60)} mins ago`;
    if (diff < 86400) return `${Math.round(diff / 3600)} hrs ago`;
    return `${Math.round(diff / 86400)} days ago`;
  }

  /* ══════════════════════════════════════════════════════════ */
  return (
    <div>
      {/* ── Stat Cards ── */}
      <div className="ch-stat-grid">
        <StatCard icon={Building2}   iconClass="ch-stat-icon--purple" label="Total Apartments"  value={loading ? '…' : totalVillas}    sub="Active Units"        trendUp trendLabel="Community villas" />
        <StatCard icon={Users}       iconClass="ch-stat-icon--green"  label="Total Residents"   value={loading ? '…' : totalResidents} sub="Registered residents" trendUp trendLabel="Active members" />
        <StatCard icon={IndianRupee} iconClass="ch-stat-icon--orange" label="Pending Dues"      value={loading ? '…' : fmtINR(pendingRevenue)} sub="Awaiting collection" trendUp={false} trendLabel="Pending payments" />
        <StatCard icon={AlertCircle} iconClass="ch-stat-icon--blue"   label="Open Complaints"   value={loading ? '…' : openComplaints} sub="Requires Attention"  trendUp={openComplaints === 0} trendLabel={openComplaints === 0 ? 'All resolved' : 'Needs attention'} />
      </div>

      {/* ── Quick Actions + Announcements ── */}
      <div className="ch-row-2">
        {/* Quick Actions */}
        <div className="ch-section">
          <div className="ch-section-header">
            <span className="ch-section-title">Quick Actions</span>
          </div>
          <div className="ch-quick-grid">
            <QuickBtn icon={UserPlus}         label="Add Resident"         color="#6366f1" onClick={handleOpenResidentModal} />
            <QuickBtn icon={MessageSquarePlus} label="New Complaint"       color="#ef4444" to="/complaints" />
            <QuickBtn icon={UserCheck}        label="Add Visitor"          color="#10b981" to="/visitors" />
            <QuickBtn icon={Megaphone}        label="Create Announcement"  color="#8b5cf6" onClick={() => setShowNoticeModal(true)} />
            <QuickBtn icon={Car}              label="Add Vehicle"          color="#f59e0b" to="/vehicles" />
            <QuickBtn icon={CreditCard}       label="Generate Bills"       color="#3b82f6" onClick={() => setShowBillModal(true)} />
            <QuickBtn icon={FileBarChart}     label="Residents Directory"  color="#06b6d4" to="/residents-directory" />
            <QuickBtn icon={Bell}             label="Send Notification"    color="#ec4899" onClick={() => setShowNoticeModal(true)} />
          </div>
        </div>

        {/* Recent Announcements */}
        <div className="ch-section">
          <div className="ch-section-header">
            <span className="ch-section-title">Recent Announcements</span>
            <Link to="/notices" className="ch-view-all">View All</Link>
          </div>
          {loading ? (
            <div className="ch-empty"><Loader2 size={24} style={{ animation: 'spin 1s linear infinite', opacity: 0.4 }} /><p>Loading…</p></div>
          ) : recentNotices.length === 0 ? (
            <div className="ch-empty">
              <Megaphone size={30} style={{ opacity: 0.25, margin: '0 auto 8px' }} />
              <p>No announcements yet</p>
              <button onClick={() => setShowNoticeModal(true)} style={{ marginTop: 8, padding: '7px 16px', background: '#6366f1', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                Create First Announcement
              </button>
            </div>
          ) : (
            <div>
              {recentNotices.map((n, i) => (
                <div key={n._id} className="ch-announce-item">
                  <span className="ch-announce-icon" style={{ background: NOTICE_COLORS[i % NOTICE_COLORS.length] + '22' }}>
                    <span style={{ fontSize: 16 }}>{NOTICE_ICONS[i % NOTICE_ICONS.length]}</span>
                  </span>
                  <div className="ch-announce-body">
                    <div className="ch-announce-title">{n.title}</div>
                    <div className="ch-announce-desc">{n.content}</div>
                  </div>
                  <div className="ch-announce-meta">
                    <span className="ch-announce-time">{timeAgo(n.createdAt)}</span>
                    {i === 0 && <span className="ch-badge-new">New</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Three-column: Dues + Payments + Complaints ── */}
      <div className="ch-row-3">
        {/* Maintenance Dues Overview */}
        <div className="ch-section" style={{ marginBottom: 0 }}>
          <div className="ch-section-header">
            <span className="ch-section-title">Maintenance Dues</span>
            <Link to="/residents-directory" className="ch-view-all">View Details</Link>
          </div>
          {totalRevenue === 0 && !loading ? (
            <div className="ch-empty"><IndianRupee size={26} style={{ opacity: 0.2, margin: '0 auto 6px' }} /><p>No billing data yet</p></div>
          ) : (
            <div className="ch-donut-wrap">
              <DonutChart size={110} strokeWidth={18} segments={[
                { value: paidPct,    color: '#10b981' },
                { value: pendingPct, color: '#f59e0b' },
                { value: overduePct, color: '#ef4444' },
              ]} />
              <div className="ch-donut-legend">
                <div className="ch-legend-row"><span className="ch-legend-label"><span className="ch-legend-dot" style={{ background: '#10b981' }} />Paid</span><span className="ch-legend-value">{fmtINR(paidRevenue)} ({paidPct}%)</span></div>
                <div className="ch-legend-row"><span className="ch-legend-label"><span className="ch-legend-dot" style={{ background: '#f59e0b' }} />Pending</span><span className="ch-legend-value">{fmtINR(pendingRevenue)} ({pendingPct}%)</span></div>
                <div className="ch-legend-row"><span className="ch-legend-label"><span className="ch-legend-dot" style={{ background: '#ef4444' }} />Overdue</span><span className="ch-legend-value">{fmtINR(overdueRevenue)} ({overduePct}%)</span></div>
                <div className="ch-donut-total"><div className="ch-donut-total-label">Total</div><div className="ch-donut-total-value">{fmtINR(totalRevenue)}</div></div>
              </div>
            </div>
          )}
        </div>

        {/* Recent Payments */}
        <div className="ch-section" style={{ marginBottom: 0 }}>
          <div className="ch-section-header">
            <span className="ch-section-title">Recent Payments</span>
            <button className="ch-view-all">View All</button>
          </div>
          {loading ? (
            <div className="ch-empty"><Loader2 size={22} style={{ animation: 'spin 1s linear infinite', opacity: 0.4 }} /></div>
          ) : recentPayments.length === 0 ? (
            <div className="ch-empty">
              <CheckCircle2 size={26} style={{ opacity: 0.2, margin: '0 auto 6px' }} />
              <p>No payments recorded yet</p>
            </div>
          ) : (
            <table className="ch-table">
              <thead>
                <tr><th></th><th>Unit</th><th>Amount</th><th>Date</th></tr>
              </thead>
              <tbody>
                {recentPayments.map(p => (
                  <tr key={p._id}>
                    <td><CheckCircle2 size={16} color="#10b981" /></td>
                    <td className="ch-payment-unit">{p.villa?.villaNumber}</td>
                    <td className="ch-payment-amount">₹ {Number(p.totalAmount || 0).toLocaleString('en-IN')}</td>
                    <td className="ch-payment-date">{new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Complaint Status */}
        <div className="ch-section" style={{ marginBottom: 0 }}>
          <div className="ch-section-header">
            <span className="ch-section-title">Complaint Status</span>
            <Link to="/complaints" className="ch-view-all">View Details</Link>
          </div>
          {totalComplaintCount === 0 && !loading ? (
            <div className="ch-empty"><AlertCircle size={26} style={{ opacity: 0.2, margin: '0 auto 6px' }} /><p>No complaints filed</p></div>
          ) : (
            <div className="ch-donut-wrap">
              <DonutChart size={110} strokeWidth={18} segments={[
                { value: openCount,     color: '#ef4444' },
                { value: inProgCount,   color: '#f59e0b' },
                { value: resolvedCount, color: '#10b981' },
              ]} />
              <div className="ch-donut-legend">
                <div className="ch-legend-row"><span className="ch-legend-label"><span className="ch-legend-dot" style={{ background: '#ef4444' }} />Open</span><span className="ch-legend-value">{openCount} ({totalComplaintCount ? Math.round(openCount / totalComplaintCount * 100) : 0}%)</span></div>
                <div className="ch-legend-row"><span className="ch-legend-label"><span className="ch-legend-dot" style={{ background: '#f59e0b' }} />In Progress</span><span className="ch-legend-value">{inProgCount} ({totalComplaintCount ? Math.round(inProgCount / totalComplaintCount * 100) : 0}%)</span></div>
                <div className="ch-legend-row"><span className="ch-legend-label"><span className="ch-legend-dot" style={{ background: '#10b981' }} />Resolved</span><span className="ch-legend-value">{resolvedCount} ({totalComplaintCount ? Math.round(resolvedCount / totalComplaintCount * 100) : 0}%)</span></div>
                <div className="ch-donut-total"><div className="ch-donut-total-label">Total</div><div className="ch-donut-total-value">{totalComplaintCount}</div></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── CTA Banner ── */}
      <div className="ch-cta-banner">
        <div className="ch-cta-phone">💳</div>
        <div className="ch-cta-body">
          <div className="ch-cta-title">Make Payments Easy</div>
          <div className="ch-cta-sub">Collect maintenance dues securely via UPI, Cards or Net Banking.</div>
        </div>
        <button className="ch-cta-btn" onClick={() => {
          const pending = payments.find(p => p.status === 'PENDING' || p.status === 'OVERDUE');
          if (pending) setSelectedBillForPayment(pending);
          else alert('No pending payments found.');
        }}>
          Make a Payment <ArrowRight size={15} />
        </button>
        <div className="ch-cta-building">🏢</div>
      </div>

      {/* ════════════════════════════════════════════════════════ */}
      {/* ── MODALS ────────────────────────────────────────────── */}

      {/* Manage Residents Modal */}
      {showResidentModal && (
        <ModalOverlay>
          <ModalBox maxWidth={560}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--ch-text-primary)' }}>
                {residentTab === 'list' ? 'Community Members' : 'Add New Resident / Admin'}
              </h3>
              <button onClick={() => setShowResidentModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ch-text-muted)', display: 'flex' }}>
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {['list', 'add'].map(tab => (
                <button key={tab} onClick={() => setResidentTab(tab)} style={{
                  flex: 1, padding: '8px', borderRadius: 10, border: '1px solid var(--ch-card-border)',
                  background: residentTab === tab ? '#6366f1' : 'var(--ch-body-bg)',
                  color: residentTab === tab ? '#fff' : 'var(--ch-text-primary)',
                  fontWeight: 700, fontSize: 12, cursor: 'pointer'
                }}>
                  {tab === 'list' ? `👥 All Members (${residents.length})` : '➕ Add Member'}
                </button>
              ))}
            </div>

            {/* List Tab */}
            {residentTab === 'list' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {residents.length === 0 ? (
                  <div className="ch-empty">
                    <Users size={28} style={{ opacity: 0.2, margin: '0 auto 8px' }} />
                    <p>No members registered yet</p>
                    <button onClick={() => setResidentTab('add')} style={{ marginTop: 8, padding: '7px 16px', background: '#6366f1', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                      Add First Member
                    </button>
                  </div>
                ) : residents.map(r => (
                  <div key={r._id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px', background: 'var(--ch-body-bg)',
                    borderRadius: 12, border: '1px solid var(--ch-card-border)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: (ROLE_COLORS[r.role] || '#9ca3af') + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                        {r.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--ch-text-primary)' }}>{r.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--ch-text-muted)' }}>{r.email}</div>
                        {r.villa?.villaNumber && (
                          <div style={{ fontSize: 11, fontWeight: 600, color: '#6366f1' }}>Unit {r.villa.villaNumber}</div>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      <span style={{
                        padding: '2px 9px', borderRadius: 99, fontSize: 10, fontWeight: 700,
                        background: (ROLE_COLORS[r.role] || '#9ca3af') + '22',
                        color: ROLE_COLORS[r.role] || '#9ca3af'
                      }}>
                        {r.role === 'COMMUNITY_ADMIN' ? 'Admin' : r.role === 'SECURITY_GUARD' ? 'Guard' : 'Resident'}
                      </span>
                      {r._id !== user?._id && (
                        <button onClick={() => handleDeleteResident(r._id, r.name)} disabled={deleting === r._id}
                          style={{ width: 30, height: 30, borderRadius: 8, background: '#fff1f2', border: '1px solid #fca5a5', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                          {deleting === r._id ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={13} />}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Tab */}
            {residentTab === 'add' && (
              <form onSubmit={handleAddResident} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--ch-text-muted)', display: 'block', marginBottom: 5 }}>Full Name *</label>
                    <input style={inp} required placeholder="e.g. Ravi Kumar" value={newResident.name} onChange={e => setNewResident({ ...newResident, name: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--ch-text-muted)', display: 'block', marginBottom: 5 }}>Email *</label>
                    <input style={inp} type="email" required placeholder="user@community.com" value={newResident.email} onChange={e => setNewResident({ ...newResident, email: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--ch-text-muted)', display: 'block', marginBottom: 5 }}>Phone</label>
                    <input style={inp} placeholder="+91 98765 43210" value={newResident.phone} onChange={e => setNewResident({ ...newResident, phone: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--ch-text-muted)', display: 'block', marginBottom: 5 }}>Villa / Unit No.</label>
                    <input style={inp} placeholder="e.g. A-101" value={newResident.villaNumber} onChange={e => setNewResident({ ...newResident, villaNumber: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--ch-text-muted)', display: 'block', marginBottom: 5 }}>Role *</label>
                    <select style={inp} value={newResident.role} onChange={e => setNewResident({ ...newResident, role: e.target.value })}>
                      <option value="RESIDENT">Resident</option>
                      <option value="COMMUNITY_ADMIN">Community Admin</option>
                      <option value="SECURITY_GUARD">Security Guard</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--ch-text-muted)', display: 'block', marginBottom: 5 }}>Default Password *</label>
                    <input style={inp} type="text" required value={newResident.password} onChange={e => setNewResident({ ...newResident, password: e.target.value })} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button type="button" onClick={() => setResidentTab('list')}
                    style={{ flex: 1, padding: '10px 0', borderRadius: 10, background: 'var(--ch-body-bg)', border: '1px solid var(--ch-card-border)', color: 'var(--ch-text-primary)', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={addLoading}
                    style={{ flex: 1, padding: '10px 0', borderRadius: 10, background: '#6366f1', border: 'none', color: '#fff', fontWeight: 800, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    {addLoading ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Adding…</> : <><Plus size={14} /> Add Member</>}
                  </button>
                </div>
              </form>
            )}
          </ModalBox>
        </ModalOverlay>
      )}

      {/* Notice / Announcement Modal */}
      {showNoticeModal && (
        <ModalOverlay>
          <ModalBox>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--ch-text-primary)' }}>Publish Community Announcement</h3>
              <button onClick={() => setShowNoticeModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ch-text-muted)', display: 'flex' }}><X size={20} /></button>
            </div>
            <form onSubmit={handlePublishNotice} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input type="text" required placeholder="Notice title…" value={noticeForm.title}
                onChange={e => setNoticeForm({ ...noticeForm, title: e.target.value })} style={inp} />
              <textarea required rows={4} placeholder="Notice content…" value={noticeForm.content}
                onChange={e => setNoticeForm({ ...noticeForm, content: e.target.value })}
                style={{ ...inp, resize: 'vertical' }} />
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setShowNoticeModal(false)} style={{ flex: 1, padding: '10px 0', borderRadius: 10, background: 'var(--ch-body-bg)', border: '1px solid var(--ch-card-border)', color: 'var(--ch-text-primary)', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '10px 0', borderRadius: 10, background: '#6366f1', border: 'none', color: '#fff', fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>Broadcast Notice</button>
              </div>
            </form>
          </ModalBox>
        </ModalOverlay>
      )}

      {/* Generate Bills Modal */}
      {showBillModal && (
        <ModalOverlay>
          <ModalBox maxWidth={380}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--ch-text-primary)' }}>Generate Monthly Bills</h3>
              <button onClick={() => setShowBillModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ch-text-muted)', display: 'flex' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleGenerateBills} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--ch-text-muted)', display: 'block', marginBottom: 5 }}>Amount per villa (₹)</label>
                <input type="number" min="100" required value={billForm.amount}
                  onChange={e => setBillForm({ ...billForm, amount: e.target.value })} style={inp} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--ch-text-muted)', display: 'block', marginBottom: 5 }}>Billing Month</label>
                <select value={billForm.month} onChange={e => setBillForm({ ...billForm, month: e.target.value })} style={inp}>
                  <option>August 2026</option><option>September 2026</option><option>October 2026</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setShowBillModal(false)} style={{ flex: 1, padding: '10px 0', borderRadius: 10, background: 'var(--ch-body-bg)', border: '1px solid var(--ch-card-border)', color: 'var(--ch-text-primary)', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={genLoading} style={{ flex: 1, padding: '10px 0', borderRadius: 10, background: '#6366f1', border: 'none', color: '#fff', fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>
                  {genLoading ? 'Generating…' : `Dispatch ₹${billForm.amount}`}
                </button>
              </div>
            </form>
          </ModalBox>
        </ModalOverlay>
      )}

      {/* Razorpay Payment Modal */}
      {selectedBillForPayment && (
        <RazorpayModal
          isOpen={!!selectedBillForPayment}
          onClose={() => setSelectedBillForPayment(null)}
          bill={selectedBillForPayment}
          onPaymentSuccess={() => { setSelectedBillForPayment(null); fetchData(); }}
        />
      )}
    </div>
  );
};
