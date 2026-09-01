import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { paymentService, communityService, villaService } from '../services/api';
import { RazorpayModal } from '../components/payments/RazorpayModal';
import {
  CreditCard, CheckCircle2, AlertCircle, Plus, Edit2,
  Trash2, Settings, Receipt, Users, TrendingUp,
  TrendingDown, Clock, X, BarChart2, RefreshCw,
  ChevronDown, ChevronUp, Search, Filter, Zap, Wrench,
  Home, IndianRupee
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const STATUS_STYLE = {
  PAID:    { bg: '#10b98118', text: '#34d399', border: '#10b98144', label: 'Paid'    },
  PENDING: { bg: '#f59e0b18', text: '#fbbf24', border: '#f59e0b44', label: 'Pending' },
  OVERDUE: { bg: '#ef444418', text: '#f87171', border: '#ef444444', label: 'Overdue' },
  FAILED:  { bg: '#64748b18', text: '#94a3b8', border: '#64748b44', label: 'Failed'  },
};

const BILL_TYPE_ICON = { MAINTENANCE: Home, UTILITY: Zap, EVENT_FEE: Receipt, REPAIR_FINE: Wrench, EV_CHARGING: Zap, OTHER: Receipt, AMENITY: Home };

// Demo data used when admin has issued bills (memory fallback for UI preview)
const DEMO_SUMMARY = [
  {
    resident: { _id: 'r1', name: 'Ravi Kumar',   email: 'ravi@example.com',  villaNumber: 'V-101' },
    villa:    { villaNumber: 'V-101', block: 'Block A' },
    totalDue: 4500, totalPaid: 1500,
    bills: [
      { _id: 'b1', title: 'Monthly Maintenance Fee - August 2026', billType: 'MAINTENANCE', month: 'August 2026', totalAmount: 4500, status: 'PENDING', dueDate: new Date(Date.now() + 5*86400000), receiptNumber: 'INV-001' },
      { _id: 'b2', title: 'Clubhouse Event Fee',                   billType: 'EVENT_FEE',   month: 'August 2026', totalAmount: 1500, status: 'PAID',    dueDate: new Date(Date.now() - 2*86400000), paidDate: new Date(Date.now() - 1*86400000), receiptNumber: 'INV-002' },
    ]
  },
  {
    resident: { _id: 'r2', name: 'Priya Sharma', email: 'priya@example.com', villaNumber: 'V-102' },
    villa:    { villaNumber: 'V-102', block: 'Block A' },
    totalDue: 0, totalPaid: 6000,
    bills: [
      { _id: 'b3', title: 'Monthly Maintenance Fee - August 2026', billType: 'MAINTENANCE', month: 'August 2026', totalAmount: 4500, status: 'PAID', dueDate: new Date(Date.now() - 5*86400000), paidDate: new Date(Date.now() - 3*86400000), receiptNumber: 'INV-003', razorpayPaymentId: 'pay_rzp_001' },
      { _id: 'b4', title: 'EV Charging Station',                   billType: 'EV_CHARGING', month: 'August 2026', totalAmount: 1500, status: 'PAID', dueDate: new Date(Date.now() - 5*86400000), paidDate: new Date(Date.now() - 2*86400000), receiptNumber: 'INV-004', razorpayPaymentId: 'pay_rzp_002' },
    ]
  },
  {
    resident: { _id: 'r3', name: 'Ajay Nair',    email: 'ajay@example.com',  villaNumber: 'V-103' },
    villa:    { villaNumber: 'V-103', block: 'Block B' },
    totalDue: 5500, totalPaid: 0,
    bills: [
      { _id: 'b5', title: 'Monthly Maintenance Fee - August 2026', billType: 'MAINTENANCE', month: 'August 2026', totalAmount: 4500, status: 'OVERDUE', dueDate: new Date(Date.now() - 3*86400000), receiptNumber: 'INV-005' },
      { _id: 'b6', title: 'Water Utility Charge',                  billType: 'UTILITY',     month: 'August 2026', totalAmount: 1000, status: 'OVERDUE', dueDate: new Date(Date.now() - 3*86400000), receiptNumber: 'INV-006' },
    ]
  },
];


// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="maint-stat-card" style={{ '--sc': color }}>
      <div className="maint-stat-icon"><Icon size={18} color={color} /></div>
      <div>
        <div className="maint-stat-val">{value}</div>
        <div className="maint-stat-label">{label}</div>
        {sub && <div className="maint-stat-sub">{sub}</div>}
      </div>
    </div>
  );
}

// Resident row card in the admin payment history table
function ResidentRow({ entry, onEditBill, onDeleteBill }) {
  const [expanded, setExpanded] = useState(false);
  const hasDue = entry.totalDue > 0;

  return (
    <div className={`maint-res-row ${hasDue ? 'maint-res-row--due' : 'maint-res-row--paid'}`}>
      <div className="maint-res-row__header" onClick={() => setExpanded(e => !e)} style={{ cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="maint-res-avatar">
            {(entry.resident?.name || 'U').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ch-text-primary)' }}>
              {entry.resident?.name || 'Unknown Resident'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--ch-text-muted)' }}>
              {entry.villa?.villaNumber || entry.resident?.villaNumber || '—'} · {entry.villa?.block || ''} · {entry.resident?.email || ''}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--ch-text-muted)' }}>Balance Due</div>
            <div style={{ fontWeight: 800, fontSize: 16, color: hasDue ? '#f87171' : '#34d399' }}>
              {hasDue ? fmt(entry.totalDue) : '✓ Cleared'}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--ch-text-muted)' }}>Total Paid</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#34d399' }}>{fmt(entry.totalPaid)}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className={`maint-status-badge`} style={hasDue
              ? { background: '#ef444418', color: '#f87171', border: '1px solid #ef444433' }
              : { background: '#10b98118', color: '#34d399', border: '1px solid #10b98133' }
            }>
              {hasDue ? 'Has Balance' : 'All Paid'}
            </span>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="maint-res-bills">
          {entry.bills.map(bill => {
            const st = STATUS_STYLE[bill.status] || STATUS_STYLE.PENDING;
            const BillIcon = BILL_TYPE_ICON[bill.billType] || Receipt;
            return (
              <div key={bill._id} className="maint-bill-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: st.bg, border: `1px solid ${st.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BillIcon size={14} color={st.text} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ch-text-primary)' }}>{bill.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--ch-text-muted)' }}>
                      {bill.month} · #{bill.receiptNumber} · Due {bill.dueDate ? new Date(bill.dueDate).toLocaleDateString('en-IN') : '—'}
                      {bill.status === 'PAID' && bill.paidDate && ` · Paid ${new Date(bill.paidDate).toLocaleDateString('en-IN')}`}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--ch-text-primary)' }}>{fmt(bill.totalAmount)}</span>
                  <span className="maint-status-badge" style={{ background: st.bg, color: st.text, border: `1px solid ${st.border}` }}>{st.label}</span>
                  {bill.razorpayPaymentId && (
                    <span style={{ fontSize: 10, color: '#818cf8', background: '#6366f111', border: '1px solid #6366f133', padding: '2px 7px', borderRadius: 20, fontFamily: 'monospace' }}>
                      {bill.razorpayPaymentId}
                    </span>
                  )}
                  <button className="maint-icon-btn maint-icon-btn--edit" onClick={() => onEditBill(bill)} title="Edit">
                    <Edit2 size={12} />
                  </button>
                  <button className="maint-icon-btn maint-icon-btn--del" onClick={() => onDeleteBill(bill._id, bill.title)} title="Delete">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


// ─── Main Component ───────────────────────────────────────────────────────────
export const MaintenancePage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'COMMUNITY_ADMIN' || user?.role === 'SUPER_ADMIN';

  // Shared state
  const [payments, setPayments]           = useState([]);   // Resident: their own bills
  const [summary, setSummary]             = useState([]);   // Admin: grouped by resident
  const [allPayments, setAllPayments]     = useState([]);   // Admin: flat list
  const [villas, setVillas]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [selectedBill, setSelectedBill]   = useState(null);
  const [activeTab, setActiveTab]         = useState(isAdmin ? 'HISTORY' : 'BILLS');
  const [search, setSearch]               = useState('');
  const [filterStatus, setFilterStatus]   = useState('ALL');

  // Admin-only UI state
  const [maintenanceRate, setMaintenanceRate] = useState(4500);
  const [isEditingRate, setIsEditingRate]     = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [editingBill, setEditingBill]         = useState(null);

  // Custom bill form
  const [customForm, setCustomForm] = useState({
    title: '', billType: 'MAINTENANCE', month: `${new Date().toLocaleString('default',{month:'long'})} ${new Date().getFullYear()}`,
    amount: '', dueDate: '', villaId: '', adminNotes: ''
  });

  // Generate bills form
  const [generateForm, setGenerateForm] = useState({
    month: `${new Date().toLocaleString('default',{month:'long'})} ${new Date().getFullYear()}`,
    amount: 4500,
    dueDate: new Date(Date.now() + 15*86400000).toISOString().split('T')[0]
  });

  // Edit form
  const [editForm, setEditForm] = useState({ title:'', billType:'MAINTENANCE', month:'', amount:'', dueDate:'', status:'PENDING', adminNotes:'' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        // Admin: get full community payment summary
        try {
          const res = await paymentService.getSummary();
          setSummary(res.data.summary || []);
          setAllPayments(res.data.allPayments || []);
        } catch {
          setSummary(DEMO_SUMMARY);
          setAllPayments(DEMO_SUMMARY.flatMap(e => e.bills));
        }
        try {
          const vr = await villaService.getVillas();
          setVillas(vr.data.villas || []);
        } catch {}
      } else {
        // Resident: only their own issued bills
        try {
          const res = await paymentService.getPayments();
          setPayments(res.data.payments || []);
        } catch {
          setPayments([]);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    // When admin loads the page, silently purge any phantom auto-seeded bills from the DB
    if (isAdmin) {
      paymentService.purgePhantomBills().catch(() => {});
    }
    fetchData();
  }, [fetchData]);

  // ── Admin: manual purge phantom bills ──
  const handlePurge = async () => {
    if (!confirm('This will permanently delete all auto-seeded phantom bills (bills not issued by an admin). Continue?')) return;
    try {
      const res = await paymentService.purgePhantomBills();
      alert(`✅ Removed ${res.data.deleted} phantom bills from the database.`);
      fetchData();
    } catch { alert('Purge failed.'); }
  };

  // ── Admin: generate bulk bills ──
  const handleGenerateBills = async (e) => {
    e.preventDefault();
    try {
      const res = await paymentService.generateBills(generateForm);
      alert(`✅ Generated ${res.data.count || 0} maintenance bills successfully!`);
      setShowGenerateModal(false);
      fetchData();
    } catch { alert('Failed to generate bills. Try again.'); }
  };

  // ── Admin: custom bill ──
  const handleCustomBill = async (e) => {
    e.preventDefault();
    try {
      await paymentService.createCustomBill(customForm);
      alert('✅ Custom bill issued!');
      setShowCustomModal(false);
      setCustomForm({ title:'', billType:'MAINTENANCE', month:generateForm.month, amount:'', dueDate:'', villaId:'', adminNotes:'' });
      fetchData();
    } catch { alert('Failed to issue custom bill.'); }
  };

  // ── Admin: edit bill ──
  const handleOpenEdit = (bill) => {
    setEditingBill(bill);
    setEditForm({ title: bill.title, billType: bill.billType||'MAINTENANCE', month: bill.month, amount: bill.totalAmount, dueDate: bill.dueDate ? new Date(bill.dueDate).toISOString().split('T')[0]:'', status: bill.status, adminNotes: bill.adminNotes||'' });
  };
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      await paymentService.updateBill(editingBill._id, editForm);
      setEditingBill(null);
      fetchData();
    } catch { alert('Failed to update bill.'); }
  };

  // ── Admin: delete ──
  const handleDelete = async (id, title) => {
    if (!confirm(`Delete bill "${title}"?`)) return;
    try { await paymentService.deleteBill(id); fetchData(); } catch { alert('Failed to delete.'); }
  };

  // ── Admin: update rate ──
  const handleUpdateRate = async (e) => {
    e.preventDefault();
    try {
      const commId = user?.community?._id || user?.community || '65f1a2b3c4d5e6f7a8b9c0d1';
      await communityService.updateRate(commId, maintenanceRate);
      setIsEditingRate(false);
      alert(`✅ Rate updated to ₹${maintenanceRate}/month`);
    } catch { alert('Failed to update rate.'); }
  };

  // ─── ADMIN STATS ──────────────────────────────────────────────────────────
  const totalCollected    = allPayments.filter(p => p.status === 'PAID').reduce((s, p) => s + (p.totalAmount||0), 0);
  const totalPending      = allPayments.filter(p => p.status === 'PENDING' || p.status === 'OVERDUE').reduce((s, p) => s + (p.totalAmount||0), 0);
  const residentsCleared  = summary.filter(e => e.totalDue === 0).length;
  const residentsDue      = summary.filter(e => e.totalDue > 0).length;

  // ─── ADMIN HISTORY FILTER ────────────────────────────────────────────────
  const filteredSummary = summary.filter(e => {
    const matchSearch = !search ||
      e.resident?.name?.toLowerCase().includes(search.toLowerCase()) ||
      e.villa?.villaNumber?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'ALL' ||
      (filterStatus === 'DUE' && e.totalDue > 0) ||
      (filterStatus === 'CLEARED' && e.totalDue === 0);
    return matchSearch && matchStatus;
  });

  // ─── RESIDENT BILLS FILTER ────────────────────────────────────────────────
  const filteredBills = payments.filter(p => {
    if (activeTab === 'PENDING') return p.status === 'PENDING' || p.status === 'OVERDUE';
    if (activeTab === 'PAID')    return p.status === 'PAID';
    return true;
  });

  // ─── RESIDENT STATS ──────────────────────────────────────────────────────
  const myPending = payments.filter(p => p.status === 'PENDING' || p.status === 'OVERDUE').reduce((s,p)=>s+(p.totalAmount||0),0);
  const myPaid    = payments.filter(p => p.status === 'PAID').reduce((s,p)=>s+(p.totalAmount||0),0);

  return (
    <div className="maint-page">

      {/* ── PAGE HEADER ── */}
      <div className="maint-header">
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:4 }}>
            <div className="maint-header-icon">
              <CreditCard size={22} color="#818cf8" />
            </div>
            <div>
              <h1 className="maint-title">
                {isAdmin ? 'Maintenance & Billing Control' : 'My Maintenance Bills'}
              </h1>
              <p className="maint-subtitle">
                {isAdmin
                  ? 'Issue bills, track payments per resident, and manage the community\'s billing.'
                  : 'View bills issued by your community admin and pay online via Razorpay.'}
              </p>
            </div>
          </div>
        </div>

        {/* Admin actions */}
        {isAdmin && (
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <button className="proposals-icon-btn" onClick={fetchData} title="Refresh">
              <RefreshCw size={15} />
            </button>
            <button
              className="ch-btn-secondary"
              onClick={() => setIsEditingRate(r => !r)}
              style={{ display:'flex', alignItems:'center', gap:6 }}
            >
              <Settings size={14} /> Set Rate
            </button>
            <button
              id="generate-bills-btn"
              className="ch-btn-secondary"
              onClick={() => setShowGenerateModal(true)}
              style={{ display:'flex', alignItems:'center', gap:6 }}
            >
              <TrendingUp size={14} /> Generate Bulk Bills
            </button>
            <button
              id="custom-bill-btn"
              className="ch-btn-primary"
              onClick={() => setShowCustomModal(true)}
              style={{ display:'flex', alignItems:'center', gap:6 }}
            >
              <Plus size={14} /> Issue Custom Bill
            </button>
          </div>
        )}
      </div>

      {/* ── ADMIN: Rate editor ── */}
      {isAdmin && isEditingRate && (
        <div className="maint-rate-box">
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
            <Settings size={16} color="#fbbf24" />
            <span style={{ fontWeight:700, fontSize:14 }}>Default Monthly Maintenance Rate</span>
          </div>
          <form onSubmit={handleUpdateRate} style={{ display:'flex', gap:10, alignItems:'center' }}>
            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--ch-text-muted)', fontWeight:700 }}>₹</span>
              <input
                type="number" min={100} step={100}
                className="ch-form-input"
                style={{ paddingLeft:28, width:140 }}
                value={maintenanceRate}
                onChange={e => setMaintenanceRate(e.target.value)}
              />
            </div>
            <button type="submit" className="ch-btn-primary" style={{ padding:'8px 18px', fontSize:12 }}>Update Rate</button>
            <button type="button" className="ch-btn-secondary" style={{ padding:'8px 14px', fontSize:12 }} onClick={() => setIsEditingRate(false)}>Cancel</button>
          </form>
        </div>
      )}

      {/* ── ADMIN: Stats ── */}
      {isAdmin && (
        <div className="maint-stats-grid">
          <StatCard icon={IndianRupee}   label="Total Collected"   value={fmt(totalCollected)}  color="#10b981" sub={`${allPayments.filter(p=>p.status==='PAID').length} payments`} />
          <StatCard icon={AlertCircle}   label="Outstanding"       value={fmt(totalPending)}    color="#f59e0b" sub={`${allPayments.filter(p=>p.status==='PENDING'||p.status==='OVERDUE').length} pending`} />
          <StatCard icon={CheckCircle2}  label="Fully Cleared"     value={residentsCleared}     color="#34d399" sub="residents" />
          <StatCard icon={TrendingDown}  label="Have Balance Due"  value={residentsDue}         color="#f87171" sub="residents" />
        </div>
      )}

      {/* ── RESIDENT: Stats ── */}
      {!isAdmin && payments.length > 0 && (
        <div className="maint-stats-grid" style={{ gridTemplateColumns:'1fr 1fr' }}>
          <StatCard icon={AlertCircle}  label="Amount Due"  value={fmt(myPending)} color="#f59e0b" />
          <StatCard icon={CheckCircle2} label="Total Paid"  value={fmt(myPaid)}    color="#10b981" />
        </div>
      )}

      {/* ── TABS (Admin only) ── */}
      {isAdmin && (
        <div className="proposals-tabs" style={{ gap:6 }}>
          {[
            { key:'HISTORY', label:'Payment History', icon:Users },
            { key:'ALL',     label:'All Bills',       icon:Receipt },
          ].map(t => {
            const Icon = t.icon;
            return (
              <button key={t.key}
                className={`proposals-tab ${activeTab === t.key ? 'proposals-tab--active' : ''}`}
                onClick={() => setActiveTab(t.key)}
              >
                <Icon size={13} /> {t.label}
              </button>
            );
          })}
        </div>
      )}

      {/* ── RESIDENT BILL TABS ── */}
      {!isAdmin && (
        <div className="proposals-tabs" style={{ gap:6 }}>
          {[
            { key:'BILLS',   label:`All Bills (${payments.length})` },
            { key:'PENDING', label:`Pending (${payments.filter(p=>p.status==='PENDING'||p.status==='OVERDUE').length})` },
            { key:'PAID',    label:`Paid (${payments.filter(p=>p.status==='PAID').length})` },
          ].map(t => (
            <button key={t.key}
              className={`proposals-tab ${activeTab === t.key ? 'proposals-tab--active' : ''}`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* ════ ADMIN: PAYMENT HISTORY TAB ════ */}
      {isAdmin && activeTab === 'HISTORY' && (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {/* Search + filter bar */}
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            <div className="proposals-search" style={{ flex:1, minWidth:180 }}>
              <Search size={14} />
              <input
                id="history-search"
                placeholder="Search by resident name or villa…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {[
              { key:'ALL',     label:'All Residents' },
              { key:'DUE',     label:'Has Balance'   },
              { key:'CLEARED', label:'Fully Paid'    },
            ].map(f => (
              <button key={f.key}
                className={`proposals-tab ${filterStatus === f.key ? 'proposals-tab--active' : ''}`}
                style={{ padding:'8px 14px' }}
                onClick={() => setFilterStatus(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="proposals-empty"><div className="proposals-spinner" /><p>Loading payment history…</p></div>
          ) : filteredSummary.length === 0 ? (
            <div className="proposals-empty">
              <Users size={44} style={{ opacity:0.15, marginBottom:10 }} />
              <p style={{ fontWeight:600 }}>No billing records found</p>
              <p style={{ fontSize:12 }}>Generate bulk bills or issue a custom bill to get started.</p>
              <button className="ch-btn-primary" style={{ marginTop:14 }} onClick={() => setShowGenerateModal(true)}>
                <TrendingUp size={13} /> Generate Maintenance Bills
              </button>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {filteredSummary.map((entry, i) => (
                <ResidentRow
                  key={entry.resident?._id || i}
                  entry={entry}
                  onEditBill={handleOpenEdit}
                  onDeleteBill={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ════ ADMIN: ALL BILLS FLAT LIST TAB ════ */}
      {isAdmin && activeTab === 'ALL' && (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {loading ? (
            <div className="proposals-empty"><div className="proposals-spinner" /></div>
          ) : allPayments.length === 0 ? (
            <div className="proposals-empty">
              <Receipt size={44} style={{ opacity:0.15, marginBottom:10 }} />
              <p style={{ fontWeight:600 }}>No bills issued yet</p>
              <p style={{ fontSize:12 }}>Use "Generate Bulk Bills" or "Issue Custom Bill" to create the first invoice.</p>
            </div>
          ) : (
            <div className="maint-bills-table">
              <div className="maint-bills-table__head">
                <span>Invoice / Title</span>
                <span>Resident / Villa</span>
                <span>Month</span>
                <span>Due Date</span>
                <span>Amount</span>
                <span>Status</span>
                <span>Actions</span>
              </div>
              {allPayments.map(p => {
                const st = STATUS_STYLE[p.status] || STATUS_STYLE.PENDING;
                return (
                  <div key={p._id} className="maint-bills-table__row">
                    <div>
                      <div style={{ fontWeight:600, fontSize:12, color:'var(--ch-text-primary)' }}>{p.title}</div>
                      <div style={{ fontSize:10, color:'var(--ch-text-muted)' }}>#{p.receiptNumber}</div>
                    </div>
                    <div style={{ fontSize:12, color:'var(--ch-text-muted)' }}>
                      {p.resident?.name || '—'} · {p.villa?.villaNumber || '—'}
                    </div>
                    <div style={{ fontSize:12, color:'var(--ch-text-muted)' }}>{p.month}</div>
                    <div style={{ fontSize:12, color:'var(--ch-text-muted)' }}>
                      {p.dueDate ? new Date(p.dueDate).toLocaleDateString('en-IN') : '—'}
                    </div>
                    <div style={{ fontWeight:700, fontSize:14, color:'var(--ch-text-primary)' }}>{fmt(p.totalAmount)}</div>
                    <div>
                      <span className="maint-status-badge" style={{ background:st.bg, color:st.text, border:`1px solid ${st.border}` }}>
                        {st.label}
                      </span>
                    </div>
                    <div style={{ display:'flex', gap:6 }}>
                      <button className="maint-icon-btn maint-icon-btn--edit" onClick={() => handleOpenEdit(p)}><Edit2 size={12}/></button>
                      <button className="maint-icon-btn maint-icon-btn--del"  onClick={() => handleDelete(p._id, p.title)}><Trash2 size={12}/></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ════ RESIDENT: BILLS ════ */}
      {!isAdmin && (
        loading ? (
          <div className="proposals-empty"><div className="proposals-spinner" /><p>Loading your bills…</p></div>
        ) : filteredBills.length === 0 ? (
          <div className="proposals-empty">
            <Receipt size={48} style={{ opacity:0.15, marginBottom:12 }} />
            <p style={{ fontWeight:600, color:'var(--ch-text-primary)' }}>
              {activeTab === 'PAID' ? 'No paid bills yet' : activeTab === 'PENDING' ? 'No pending bills' : 'No bills issued to you yet'}
            </p>
            <p style={{ fontSize:13, color:'var(--ch-text-muted)', maxWidth:340, textAlign:'center' }}>
              {activeTab === 'BILLS'
                ? 'Your community admin has not issued any maintenance or custom bills to your account yet. Bills will appear here once issued.'
                : 'Nothing to show for this filter.'}
            </p>
          </div>
        ) : (
          <div className="maint-res-bills-grid">
            {filteredBills.map(p => {
              const st = STATUS_STYLE[p.status] || STATUS_STYLE.PENDING;
              const BillIcon = BILL_TYPE_ICON[p.billType] || Receipt;
              return (
                <div key={p._id} className="maint-bill-card">
                  {/* Top stripe */}
                  <div className="maint-bill-card__stripe" style={{ background: st.text }} />

                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:12 }}>
                    <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                      <div style={{ width:40, height:40, borderRadius:10, background:st.bg, border:`1px solid ${st.border}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <BillIcon size={18} color={st.text} />
                      </div>
                      <div>
                        <div style={{ fontSize:10, fontWeight:700, color:'var(--ch-text-muted)', textTransform:'uppercase', letterSpacing:'0.5px' }}>
                          {p.billType?.replace(/_/g,' ')} · #{p.receiptNumber}
                        </div>
                        <div style={{ fontWeight:700, fontSize:14, color:'var(--ch-text-primary)', marginTop:2 }}>{p.title}</div>
                      </div>
                    </div>
                    <span className="maint-status-badge" style={{ background:st.bg, color:st.text, border:`1px solid ${st.border}`, flexShrink:0 }}>
                      {st.label}
                    </span>
                  </div>

                  <div className="maint-bill-card__details">
                    <div><span>Period</span><span>{p.month}</span></div>
                    <div><span>Due Date</span><span style={{ color: p.status==='OVERDUE' ? '#f87171' : 'inherit' }}>
                      {p.dueDate ? new Date(p.dueDate).toLocaleDateString('en-IN') : '—'}
                    </span></div>
                    {p.villa?.villaNumber && <div><span>Villa</span><span>{p.villa.villaNumber}</span></div>}
                    <div className="maint-bill-card__total">
                      <span>Total Amount</span>
                      <span style={{ fontSize:22, fontWeight:900, color:'var(--ch-text-primary)' }}>{fmt(p.totalAmount)}</span>
                    </div>
                    {p.adminNotes && (
                      <div style={{ padding:'8px 10px', background:'#f59e0b11', border:'1px solid #f59e0b33', borderRadius:8, fontSize:11, color:'#fbbf24' }}>
                        📝 {p.adminNotes}
                      </div>
                    )}
                  </div>

                  {p.status === 'PAID' ? (
                    <div className="maint-bill-card__paid">
                      <CheckCircle2 size={14} />
                      <span>Paid on {p.paidDate ? new Date(p.paidDate).toLocaleDateString('en-IN') : 'verified'}</span>
                      {p.razorpayPaymentId && <span style={{ fontFamily:'monospace', fontSize:10, marginLeft:'auto' }}>{p.razorpayPaymentId}</span>}
                    </div>
                  ) : (
                    <button
                      className="maint-bill-card__paybtn"
                      onClick={() => setSelectedBill(p)}
                    >
                      <CreditCard size={15} /> Pay {fmt(p.totalAmount)} via Razorpay
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}

      {/* ════ MODALS ════ */}

      {/* Generate Bulk Bills Modal */}
      {showGenerateModal && (
        <div className="ch-modal-overlay" onClick={e => e.target===e.currentTarget && setShowGenerateModal(false)}>
          <div className="ch-modal" style={{ maxWidth:440 }}>
            <div className="ch-modal-header">
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ background:'#10b98122', padding:'6px 8px', borderRadius:8, display:'flex' }}><TrendingUp size={18} color="#34d399" /></span>
                <div>
                  <h2 className="ch-modal-title">Generate Bulk Maintenance Bills</h2>
                  <p style={{ fontSize:12, color:'var(--ch-text-muted)', marginTop:2 }}>Issues bills to all occupied villas in your community</p>
                </div>
              </div>
              <button className="ch-modal-close" onClick={() => setShowGenerateModal(false)}><X size={18}/></button>
            </div>
            <form onSubmit={handleGenerateBills} className="ch-modal-body" style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div className="ch-form-group">
                <label className="ch-form-label">Billing Month</label>
                <input id="gen-month" className="ch-form-input" placeholder="e.g. September 2026" value={generateForm.month} onChange={e => setGenerateForm(f=>({...f, month:e.target.value}))} required />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div className="ch-form-group">
                  <label className="ch-form-label">Amount (₹) per Villa</label>
                  <input id="gen-amount" type="number" min={1} className="ch-form-input" value={generateForm.amount} onChange={e => setGenerateForm(f=>({...f, amount:e.target.value}))} required />
                </div>
                <div className="ch-form-group">
                  <label className="ch-form-label">Due Date</label>
                  <input id="gen-due" type="date" className="ch-form-input" value={generateForm.dueDate} onChange={e => setGenerateForm(f=>({...f, dueDate:e.target.value}))} required />
                </div>
              </div>
              <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
                <button type="button" className="ch-btn-secondary" onClick={() => setShowGenerateModal(false)}>Cancel</button>
                <button type="submit" id="gen-submit" className="ch-btn-primary">Generate Bills</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Issue Custom Bill Modal */}
      {showCustomModal && (
        <div className="ch-modal-overlay" onClick={e => e.target===e.currentTarget && setShowCustomModal(false)}>
          <div className="ch-modal" style={{ maxWidth:520 }}>
            <div className="ch-modal-header">
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ background:'#6366f122', padding:'6px 8px', borderRadius:8, display:'flex' }}><Plus size={18} color="#818cf8" /></span>
                <div>
                  <h2 className="ch-modal-title">Issue Custom Bill</h2>
                  <p style={{ fontSize:12, color:'var(--ch-text-muted)', marginTop:2 }}>Issue a bill to a specific villa for any charge</p>
                </div>
              </div>
              <button className="ch-modal-close" onClick={() => setShowCustomModal(false)}><X size={18}/></button>
            </div>
            <form onSubmit={handleCustomBill} className="ch-modal-body" style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div className="ch-form-group">
                <label className="ch-form-label">Bill Title *</label>
                <input id="custom-title" className="ch-form-input" placeholder="e.g. EV Charging Fee – August 2026" value={customForm.title} onChange={e=>setCustomForm(f=>({...f,title:e.target.value}))} required />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div className="ch-form-group">
                  <label className="ch-form-label">Bill Type</label>
                  <select id="custom-type" className="ch-form-input ch-form-select" value={customForm.billType} onChange={e=>setCustomForm(f=>({...f,billType:e.target.value}))}>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="UTILITY">Utility (Water/Power)</option>
                    <option value="EV_CHARGING">EV Charging</option>
                    <option value="EVENT_FEE">Clubhouse / Event Fee</option>
                    <option value="REPAIR_FINE">Repair Fine</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div className="ch-form-group">
                  <label className="ch-form-label">Target Villa *</label>
                  <select id="custom-villa" className="ch-form-input ch-form-select" value={customForm.villaId} onChange={e=>setCustomForm(f=>({...f,villaId:e.target.value}))} required>
                    <option value="">Select Villa</option>
                    {villas.map(v => <option key={v._id} value={v._id}>{v.villaNumber}{v.owner?.name ? ` (${v.owner.name})` : ''}</option>)}
                    {!villas.length && <option value="villa_101">V-101 (Demo)</option>}
                  </select>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
                <div className="ch-form-group">
                  <label className="ch-form-label">Amount (₹) *</label>
                  <input id="custom-amount" type="number" min={1} className="ch-form-input" placeholder="2000" value={customForm.amount} onChange={e=>setCustomForm(f=>({...f,amount:e.target.value}))} required />
                </div>
                <div className="ch-form-group">
                  <label className="ch-form-label">Billing Month</label>
                  <input id="custom-month" className="ch-form-input" value={customForm.month} onChange={e=>setCustomForm(f=>({...f,month:e.target.value}))} />
                </div>
                <div className="ch-form-group">
                  <label className="ch-form-label">Due Date *</label>
                  <input id="custom-due" type="date" className="ch-form-input" value={customForm.dueDate} onChange={e=>setCustomForm(f=>({...f,dueDate:e.target.value}))} required />
                </div>
              </div>
              <div className="ch-form-group">
                <label className="ch-form-label">Admin Note (optional)</label>
                <input id="custom-note" className="ch-form-input" placeholder="e.g. Calculated based on 150 kWh usage" value={customForm.adminNotes} onChange={e=>setCustomForm(f=>({...f,adminNotes:e.target.value}))} />
              </div>
              <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
                <button type="button" className="ch-btn-secondary" onClick={() => setShowCustomModal(false)}>Cancel</button>
                <button type="submit" id="custom-submit" className="ch-btn-primary">Issue Bill</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Bill Modal */}
      {editingBill && (
        <div className="ch-modal-overlay" onClick={e => e.target===e.currentTarget && setEditingBill(null)}>
          <div className="ch-modal" style={{ maxWidth:480 }}>
            <div className="ch-modal-header">
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ background:'#f59e0b22', padding:'6px 8px', borderRadius:8, display:'flex' }}><Edit2 size={18} color="#fbbf24" /></span>
                <h2 className="ch-modal-title">Edit Bill</h2>
              </div>
              <button className="ch-modal-close" onClick={() => setEditingBill(null)}><X size={18}/></button>
            </div>
            <form onSubmit={handleSaveEdit} className="ch-modal-body" style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div className="ch-form-group">
                <label className="ch-form-label">Bill Title</label>
                <input className="ch-form-input" value={editForm.title} onChange={e=>setEditForm(f=>({...f,title:e.target.value}))} required />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div className="ch-form-group">
                  <label className="ch-form-label">Amount (₹)</label>
                  <input type="number" min={0} className="ch-form-input" value={editForm.amount} onChange={e=>setEditForm(f=>({...f,amount:e.target.value}))} />
                </div>
                <div className="ch-form-group">
                  <label className="ch-form-label">Status</label>
                  <select className="ch-form-input ch-form-select" value={editForm.status} onChange={e=>setEditForm(f=>({...f,status:e.target.value}))}>
                    <option value="PENDING">Pending</option>
                    <option value="PAID">Paid</option>
                    <option value="OVERDUE">Overdue</option>
                  </select>
                </div>
              </div>
              {/* Quick adjust buttons */}
              <div style={{ display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
                <span style={{ fontSize:11, color:'var(--ch-text-muted)' }}>Quick adjust:</span>
                {[+500,+100,-100,-500].map(d => (
                  <button type="button" key={d}
                    onClick={() => setEditForm(f=>({...f, amount: Math.max(0, Number(f.amount)+d)}))}
                    style={{ padding:'3px 10px', borderRadius:6, fontSize:11, fontWeight:700, border:'1px solid', cursor:'pointer',
                      background: d>0 ? '#10b98111' : '#ef444411',
                      color: d>0 ? '#34d399' : '#f87171',
                      borderColor: d>0 ? '#10b98133' : '#ef444433'
                    }}
                  >{d>0?'+':''}{d>0?'₹':'₹'}{Math.abs(d)}</button>
                ))}
              </div>
              <div className="ch-form-group">
                <label className="ch-form-label">Admin Note</label>
                <input className="ch-form-input" placeholder="Reason for change…" value={editForm.adminNotes} onChange={e=>setEditForm(f=>({...f,adminNotes:e.target.value}))} />
              </div>
              <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
                <button type="button" className="ch-btn-secondary" onClick={() => setEditingBill(null)}>Cancel</button>
                <button type="submit" className="ch-btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Razorpay Payment Modal */}
      {selectedBill && (
        <RazorpayModal
          isOpen={!!selectedBill}
          onClose={() => setSelectedBill(null)}
          bill={selectedBill}
          onPaymentSuccess={() => { setSelectedBill(null); fetchData(); }}
        />
      )}
    </div>
  );
};
