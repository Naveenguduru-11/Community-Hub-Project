import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { visitorService, paymentService, complaintService, noticeService, eventService } from '../services/api';
import { VisitorPassModal } from '../components/visitors/VisitorPassModal';
import { RazorpayModal } from '../components/payments/RazorpayModal';
import { ComplaintModal } from '../components/complaints/ComplaintModal';
import {
  QrCode, CreditCard, AlertCircle, Calendar,
  Bell, Plus, Trash2, CheckCircle2, ArrowRight,
  TrendingUp, TrendingDown, Home, Clock, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

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

function StatCard({ icon: Icon, iconClass, label, value, sub, trendUp, trendLabel }) {
  return (
    <div className="ch-stat-card">
      <span className={`ch-stat-icon ${iconClass}`}><Icon size={24} /></span>
      <div className="ch-stat-body">
        <div className="ch-stat-label">{label}</div>
        <div className="ch-stat-value ch-stat-value--sm">{value}</div>
        {sub && <div className="ch-stat-sub">{sub}</div>}
        {trendLabel && (
          <div className={`ch-stat-trend ${trendUp !== undefined ? (trendUp ? 'ch-stat-trend--up' : 'ch-stat-trend--down') : 'ch-stat-trend--warn'}`}>
            {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trendLabel}
          </div>
        )}
      </div>
    </div>
  );
}

export const ResidentDashboard = () => {
  const { user } = useAuth();
  const [visitors, setVisitors] = useState([]);
  const [payments, setPayments] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [notices, setNotices] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVisitorModal, setShowVisitorModal] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [selectedBillForPayment, setSelectedBillForPayment] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [vRes, pRes, cRes, nRes, eRes] = await Promise.all([
        visitorService.getVisitors(), paymentService.getPayments(),
        complaintService.getComplaints(), noticeService.getNotices(), eventService.getEvents()
      ]);
      setVisitors(Array.from(new Map((vRes.data.visitors || []).map(v => [v._id, v])).values()));
      setPayments(Array.from(new Map((pRes.data.payments || []).map(p => [p._id, p])).values()));
      setComplaints(Array.from(new Map((cRes.data.complaints || []).map(c => [c._id, c])).values()));
      setNotices(Array.from(new Map((nRes.data.notices || []).map(n => [n._id, n])).values()));
      setEvents(Array.from(new Map((eRes.data.events || []).map(e => [e._id, e])).values()));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const pendingBill = payments.find(p => p.status === 'PENDING' || p.status === 'OVERDUE');
  const openCount = complaints.filter(c => c.status !== 'RESOLVED').length;

  // Real API data only — no hardcoded fallbacks
  const displayNotices  = notices.slice(0, 3);
  const displayVisitors = visitors.slice(0, 3);

  const handleDeleteVisitor = async (id, name) => {
    if (confirm(`Cancel guest pass for ${name}?`)) {
      try { await visitorService.deletePass(id); fetchData(); }
      catch { alert('Failed to delete'); }
    }
  };

  const handleDeleteComplaint = async (id, title) => {
    if (confirm(`Delete ticket "${title}"?`)) {
      try { await complaintService.deleteComplaint(id); fetchData(); }
      catch { alert('Failed to delete'); }
    }
  };

  const STATUS_COLORS = { INSIDE: '#10b981', PRE_APPROVED: '#6366f1', EXITED: '#9ca3af', PENDING: '#f59e0b' };
  const COMPLAINT_STATUS_COLORS = { OPEN: '#ef4444', IN_PROGRESS: '#f59e0b', RESOLVED: '#10b981' };


  return (
    <div>
      {/* ── Stat Cards ── */}
      <div className="ch-stat-grid">
        <StatCard icon={QrCode} iconClass="ch-stat-icon--green" label="Active Guest Passes" value={visitors.length} sub="Gate Pass Ready" trendUp trendLabel="All active" />
        <StatCard icon={AlertCircle} iconClass="ch-stat-icon--orange" label="Open Tickets" value={openCount} sub={openCount > 0 ? 'Awaiting resolution' : 'All clear ✓'} trendUp={openCount === 0} trendLabel={openCount > 0 ? 'In resolution' : 'No issues'} />
        <StatCard icon={CreditCard} iconClass="ch-stat-icon--blue" label="Maintenance Due" value={pendingBill ? `₹ ${Number(pendingBill.totalAmount).toLocaleString('en-IN')}` : 'Paid ✓'} sub={pendingBill ? 'Payment pending' : 'Up to date'} trendUp={!pendingBill} trendLabel={pendingBill ? 'Due soon' : 'All paid'} />
        <StatCard icon={Calendar} iconClass="ch-stat-icon--purple" label="Community Events" value={events.length} sub="Upcoming events" trendUp trendLabel="Games & Sports" />
      </div>

      {/* Pending Bill Banner */}
      {pendingBill && (
        <div style={{
          background: 'linear-gradient(135deg, #fffbeb, #fef3c7)', border: '2px solid #fcd34d',
          borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 16, marginBottom: 20
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ width: 44, height: 44, background: '#f59e0b', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <CreditCard size={22} />
            </span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 13, color: '#92400e' }}>Maintenance Payment Pending: {pendingBill.title}</div>
              <div style={{ fontSize: 11, color: '#b45309', marginTop: 2 }}>
                Amount Due: <strong>₹ {Number(pendingBill.totalAmount).toLocaleString('en-IN')}</strong>
                {pendingBill.dueDate && ` • Due: ${new Date(pendingBill.dueDate).toLocaleDateString('en-IN')}`}
              </div>
            </div>
          </div>
          <button onClick={() => setSelectedBillForPayment(pendingBill)}
            style={{ padding: '10px 20px', background: '#f59e0b', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 800, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            Pay Now
          </button>
        </div>
      )}

      {/* ── Quick Actions ── */}
      <div className="ch-section">
        <div className="ch-section-header">
          <span className="ch-section-title">Quick Actions</span>
        </div>
        <div className="ch-quick-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
          <QuickBtn icon={QrCode} label="Create Guest Pass" color="#10b981" onClick={() => setShowVisitorModal(true)} />
          <QuickBtn icon={AlertCircle} label="Raise Ticket" color="#ef4444" onClick={() => setShowComplaintModal(true)} />
          <QuickBtn icon={CreditCard} label="Pay Maintenance" color="#3b82f6" onClick={() => pendingBill && setSelectedBillForPayment(pendingBill)} />
          <QuickBtn icon={Calendar} label="View Events" color="#8b5cf6" to="/events" />
          <QuickBtn icon={Bell} label="View Notices" color="#f59e0b" to="/notices" />
        </div>
      </div>

      {/* ── Three-column cards ── */}
      <div className="ch-row-3">
        {/* My Guest Passes */}
        <div className="ch-section" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column' }}>
          <div className="ch-section-header">
            <span className="ch-section-title" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <QrCode size={15} color="#10b981" /> Active Guest Passes
            </span>
            <span style={{ fontSize: 11, background: '#d1fae5', color: '#065f46', fontWeight: 700, padding: '2px 8px', borderRadius: 99 }}>{visitors.length} total</span>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {visitors.length === 0 ? (
              <div className="ch-empty">
                <QrCode size={32} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                <p>No active guest passes</p>
              </div>
            ) : (
              visitors.slice(0, 3).map(v => (
                <div key={v._id} style={{ padding: '10px 12px', background: 'var(--ch-body-bg)', borderRadius: 12, border: '1px solid var(--ch-card-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--ch-text-primary)' }}>{v.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--ch-text-muted)', marginTop: 2 }}>
                      {v.visitorType} • Code: <strong style={{ fontFamily: 'monospace', color: '#10b981' }}>{v.passcode}</strong>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700, background: (STATUS_COLORS[v.status] || '#9ca3af') + '22', color: STATUS_COLORS[v.status] || '#9ca3af' }}>{v.status}</span>
                    <button onClick={() => handleDeleteVisitor(v._id, v.name)} style={{ color: 'var(--ch-text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <button onClick={() => setShowVisitorModal(true)} style={{ marginTop: 14, padding: '10px', background: 'var(--ch-body-bg)', border: '1px solid var(--ch-card-border)', borderRadius: 10, fontSize: 12, fontWeight: 700, color: 'var(--ch-text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Plus size={14} color="#10b981" /> Create New Visitor Pass
          </button>
        </div>

        {/* My Helpdesk Tickets */}
        <div className="ch-section" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column' }}>
          <div className="ch-section-header">
            <span className="ch-section-title" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <AlertCircle size={15} color="#f59e0b" /> My Helpdesk Tickets
            </span>
            <span style={{ fontSize: 11, background: '#fef3c7', color: '#92400e', fontWeight: 700, padding: '2px 8px', borderRadius: 99 }}>{openCount} open</span>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {complaints.length === 0 ? (
              <div className="ch-empty">
                <AlertCircle size={32} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                <p>No helpdesk tickets raised</p>
              </div>
            ) : (
              complaints.slice(0, 3).map(c => (
                <div key={c._id} style={{ padding: '10px 12px', background: 'var(--ch-body-bg)', borderRadius: 12, border: '1px solid var(--ch-card-border)', fontSize: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, color: 'var(--ch-text-primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</span>
                    <button onClick={() => handleDeleteComplaint(c._id, c.title)} style={{ color: 'var(--ch-text-muted)', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, display: 'flex' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 10, background: '#e0e7ff', color: '#3730a3', padding: '2px 7px', borderRadius: 6, fontWeight: 600 }}>{c.category || 'General'}</span>
                    <span style={{ color: 'var(--ch-text-muted)', fontSize: 11 }}>→</span>
                    <span style={{ fontSize: 10, background: (COMPLAINT_STATUS_COLORS[c.status] || '#9ca3af') + '22', color: COMPLAINT_STATUS_COLORS[c.status] || '#9ca3af', padding: '2px 7px', borderRadius: 6, fontWeight: 700 }}>
                      {c.status === 'IN_PROGRESS' ? 'In Progress' : c.status === 'RESOLVED' ? 'Resolved' : 'Open'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <button onClick={() => setShowComplaintModal(true)} style={{ marginTop: 14, padding: '10px', background: 'var(--ch-body-bg)', border: '1px solid var(--ch-card-border)', borderRadius: 10, fontSize: 12, fontWeight: 700, color: 'var(--ch-text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Plus size={14} color="#f59e0b" /> Raise New Ticket
          </button>
        </div>

        {/* Community Notices */}
        <div className="ch-section" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column' }}>
          <div className="ch-section-header">
            <span className="ch-section-title" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Bell size={15} color="#8b5cf6" /> Community Notices
            </span>
            <Link to="/notices" style={{ fontSize: 12, fontWeight: 700, color: '#6366f1', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
              View All <ChevronRight size={12} />
            </Link>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {displayNotices.length === 0 ? (
              <div className="ch-empty">
                <Bell size={28} style={{ opacity: 0.2, margin: '0 auto 8px' }} />
                <p>No community notices yet</p>
              </div>
            ) : displayNotices.map((n, i) => (
              <div key={n._id} style={{ padding: '10px 12px', background: '#f5f3ff', borderRadius: 12, border: '1px solid #ede9fe', fontSize: 12 }}>
                <div style={{ fontWeight: 700, color: 'var(--ch-text-primary)', marginBottom: 3 }}>{n.title}</div>
                <div style={{ fontSize: 11, color: 'var(--ch-text-muted)', lineHeight: 1.4 }}>{n.content}</div>
              </div>
            ))}
          </div>

          <Link to="/events" style={{ marginTop: 14, padding: '10px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, fontSize: 12, fontWeight: 700, color: '#15803d', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, textDecoration: 'none' }}>
            🎮 Host or Join Resident Games
          </Link>
        </div>
      </div>

      {/* ── CTA Banner ── */}
      {pendingBill && (
        <div className="ch-cta-banner">
          <div className="ch-cta-phone">💳</div>
          <div className="ch-cta-body">
            <div className="ch-cta-title">Pay Your Maintenance Easily</div>
            <div className="ch-cta-sub">Pay securely via UPI, Cards or Net Banking. Stay up-to-date!</div>
          </div>
          <button className="ch-cta-btn" onClick={() => setSelectedBillForPayment(pendingBill)}>
            Pay ₹ {Number(pendingBill.totalAmount).toLocaleString('en-IN')} <ArrowRight size={15} />
          </button>
          <div className="ch-cta-building">🏠</div>
        </div>
      )}

      {/* Modals */}
      <VisitorPassModal isOpen={showVisitorModal} onClose={() => setShowVisitorModal(false)} onPassCreated={fetchData} />
      <ComplaintModal isOpen={showComplaintModal} onClose={() => setShowComplaintModal(false)} onComplaintCreated={fetchData} />
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
