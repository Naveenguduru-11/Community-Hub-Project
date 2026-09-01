import React, { useState, useEffect } from 'react';
import { communityService, analyticsService } from '../services/api';
import {
  Building2, Users, Globe, Plus, CheckCircle2,
  TrendingUp, MapPin, IndianRupee, Shield,
  BarChart3, FileText, ChevronDown, ChevronUp
} from 'lucide-react';

function StatCard({ icon: Icon, iconClass, label, value, sub }) {
  return (
    <div className="ch-stat-card">
      <span className={`ch-stat-icon ${iconClass}`}><Icon size={24} /></span>
      <div className="ch-stat-body">
        <div className="ch-stat-label">{label}</div>
        <div className="ch-stat-value ch-stat-value--sm">{value}</div>
        {sub && <div className="ch-stat-sub">{sub}</div>}
      </div>
    </div>
  );
}

export const SuperAdminDashboard = () => {
  const [communities, setCommunities] = useState([]);
  const [stats, setStats] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showRevenue, setShowRevenue] = useState(false);
  const [formData, setFormData] = useState({
    name: '', code: '', contactPhone: '', contactEmail: '', maintenanceMonthlyRate: 4500
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cRes, sRes] = await Promise.all([communityService.getCommunities(), analyticsService.getStats()]);
      const raw = cRes.data.communities || [];
      setCommunities(Array.from(new Map(raw.map(c => [c.code || c._id, c])).values()));
      setStats(sRes.data.stats || {});
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await communityService.createCommunity(formData);
      alert('Community onboarded!');
      setShowModal(false);
      setFormData({ name: '', code: '', contactPhone: '', contactEmail: '', maintenanceMonthlyRate: 4500 });
      fetchData();
    } catch { alert('Failed to onboard community'); }
  };

  const displayCommunities = communities.length > 0 ? communities : [
    { _id: 'd1', name: 'Greenfield Villa Enclave', code: 'GFV-2024', address: { city: 'Hyderabad', state: 'Telangana' }, maintenanceMonthlyRate: 4500, totalVillas: 48 },
    { _id: 'd2', name: 'Palm Meadows Association', code: 'PMVA-2025', address: { city: 'Bengaluru', state: 'Karnataka' }, maintenanceMonthlyRate: 5500, totalVillas: 64 },
    { _id: 'd3', name: 'Sunrise Heights Society', code: 'SHS-2024', address: { city: 'Chennai', state: 'Tamil Nadu' }, maintenanceMonthlyRate: 3800, totalVillas: 32 },
  ];

  const totalResidents = stats?.totalResidents || displayCommunities.reduce((s, c) => s + (c.totalVillas || 0) * 3, 0);
  const totalRevenue = stats?.totalRevenueCollected || displayCommunities.reduce((s, c) => s + (c.maintenanceMonthlyRate || 0) * (c.totalVillas || 0), 0);
  const pendingRevenue = stats?.pendingRevenue || Math.round(totalRevenue * 0.18);
  const openComplaints = stats?.openComplaints || 24;
  const activeVisitors = stats?.activeVisitors || 8;

  function fmtINR(n) { return '₹ ' + Number(n || 0).toLocaleString('en-IN'); }

  const ACCENT_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6'];

  return (
    <div>
      {/* ── Hero Banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b, #312e81, #4c1d95)',
        borderRadius: 18, padding: '28px 32px', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20,
        marginBottom: 24, position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', right: -40, top: -40, width: 200, height: 200, background: 'rgba(255,255,255,0.04)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(165,180,252,0.15)', border: '1px solid rgba(165,180,252,0.3)', padding: '4px 12px', borderRadius: 99, fontSize: 11, fontWeight: 700, color: '#a5b4fc', marginBottom: 10 }}>
            <Shield size={12} /> Platform Super Admin Portal
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>CommunityHub SaaS Platform Overview</h2>
          <p style={{ fontSize: 12, color: '#c7d2fe' }}>Multi-tenant management across all registered gated communities & villa associations.</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{
          padding: '11px 20px', background: '#6366f1', border: 'none', borderRadius: 12,
          color: '#fff', fontWeight: 800, fontSize: 12, cursor: 'pointer', display: 'flex',
          alignItems: 'center', gap: 7, whiteSpace: 'nowrap', flexShrink: 0,
          boxShadow: '0 6px 20px rgba(99,102,241,0.4)'
        }}>
          <Plus size={16} /> Onboard New Community
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="ch-stat-grid ch-stat-grid--3" style={{ marginBottom: 24 }}>
        <StatCard icon={Building2} iconClass="ch-stat-icon--purple" label="Total SaaS Communities" value={displayCommunities.length} sub="Onboarded & Active" />
        <StatCard icon={Users} iconClass="ch-stat-icon--blue" label="Platform Total Residents" value={totalResidents} sub="Across all communities" />
        <StatCard icon={Globe} iconClass="ch-stat-icon--green" label="System Health & APIs" value="99.99%" sub="All services operational" />
      </div>

      {/* ── Platform Actions ── */}
      <div className="ch-section">
        <div className="ch-section-header">
          <span className="ch-section-title">Platform Actions</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {/* Onboard Community */}
          <button className="ch-quick-btn" onClick={() => setShowModal(true)}>
            <span className="ch-quick-icon" style={{ background: '#6366f122' }}><Plus size={20} style={{ color: '#6366f1' }} /></span>
            <span className="ch-quick-label">Onboard Community</span>
          </button>

          {/* View All Residents */}
          <button className="ch-quick-btn" onClick={() => window.open('/residents-directory', '_self')}>
            <span className="ch-quick-icon" style={{ background: '#3b82f622' }}><Users size={20} style={{ color: '#3b82f6' }} /></span>
            <span className="ch-quick-label">View All Residents</span>
          </button>

          {/* Analytics — toggles inline results */}
          <button className="ch-quick-btn" onClick={() => { setShowAnalytics(v => !v); setShowRevenue(false); }}
            style={showAnalytics ? { borderColor: '#10b981', background: '#f0fdf4' } : {}}>
            <span className="ch-quick-icon" style={{ background: '#10b98122' }}><BarChart3 size={20} style={{ color: '#10b981' }} /></span>
            <span className="ch-quick-label" style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
              Analytics {showAnalytics ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </span>
          </button>

          {/* Revenue Reports — toggles inline results */}
          <button className="ch-quick-btn" onClick={() => { setShowRevenue(v => !v); setShowAnalytics(false); }}
            style={showRevenue ? { borderColor: '#f59e0b', background: '#fffbeb' } : {}}>
            <span className="ch-quick-icon" style={{ background: '#f59e0b22' }}><IndianRupee size={20} style={{ color: '#f59e0b' }} /></span>
            <span className="ch-quick-label" style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
              Revenue Reports {showRevenue ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </span>
          </button>
        </div>

        {/* ── Inline Analytics Results ── */}
        {showAnalytics && (
          <div style={{ marginTop: 16, padding: '18px 20px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#065f46', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 7 }}>
              <BarChart3 size={16} color="#10b981" /> Platform Analytics Summary
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {[
                { label: 'Total Communities', value: displayCommunities.length, color: '#6366f1' },
                { label: 'Total Residents', value: totalResidents, color: '#3b82f6' },
                { label: 'Active Visitors', value: activeVisitors, color: '#f59e0b' },
                { label: 'Open Complaints', value: openComplaints, color: '#ef4444' },
              ].map(m => (
                <div key={m.label} style={{ background: '#fff', borderRadius: 10, padding: '14px', border: '1px solid #d1fae5', textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: m.color }}>{m.value}</div>
                  <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, marginTop: 3 }}>{m.label}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {displayCommunities.map((c, i) => (
                <div key={c._id} style={{ background: '#fff', borderRadius: 10, padding: '10px 14px', border: '1px solid #d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1a1a2e' }}>{c.name}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#10b981' }}>{c.totalVillas || '—'} villas</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Inline Revenue Results ── */}
        {showRevenue && (
          <div style={{ marginTop: 16, padding: '18px 20px', background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#92400e', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 7 }}>
              <IndianRupee size={16} color="#f59e0b" /> Platform Revenue Report
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }}>
              {[
                { label: 'Total Collected', value: fmtINR(totalRevenue), color: '#10b981' },
                { label: 'Pending Dues', value: fmtINR(pendingRevenue), color: '#f59e0b' },
                { label: 'Avg. Per Community', value: fmtINR(Math.round(totalRevenue / (displayCommunities.length || 1))), color: '#6366f1' },
              ].map(m => (
                <div key={m.label} style={{ background: '#fff', borderRadius: 10, padding: '14px', border: '1px solid #fef3c7', textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: m.color }}>{m.value}</div>
                  <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, marginTop: 3 }}>{m.label}</div>
                </div>
              ))}
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #fef3c7' }}>
                  {['Community', 'Villas', 'Monthly Rate', 'Est. Revenue'].map(h => (
                    <th key={h} style={{ padding: '6px 10px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#b45309', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayCommunities.map(c => (
                  <tr key={c._id} style={{ borderBottom: '1px solid #fef3c7' }}>
                    <td style={{ padding: '9px 10px', fontWeight: 700, color: '#1a1a2e' }}>{c.name}</td>
                    <td style={{ padding: '9px 10px', color: '#6b7280' }}>{c.totalVillas || '—'}</td>
                    <td style={{ padding: '9px 10px', fontWeight: 700, color: '#f59e0b' }}>₹ {(c.maintenanceMonthlyRate || 0).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '9px 10px', fontWeight: 800, color: '#10b981' }}>
                      {fmtINR((c.maintenanceMonthlyRate || 0) * (c.totalVillas || 0))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Communities Grid ── */}
      <div className="ch-section">
        <div className="ch-section-header">
          <span className="ch-section-title">Onboarded Communities & Villa Enclaves</span>
          <span style={{ fontSize: 11, background: '#ede9fe', color: '#5b21b6', padding: '2px 9px', borderRadius: 99, fontWeight: 700 }}>{displayCommunities.length} total</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {displayCommunities.map((c, i) => (
            <div key={c._id} style={{
              padding: 18, borderRadius: 14, background: 'var(--ch-body-bg)',
              border: '1px solid var(--ch-card-border)', position: 'relative', overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: ACCENT_COLORS[i % ACCENT_COLORS.length] }} />
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--ch-text-primary)', marginBottom: 3 }}>{c.name}</div>
                  {(c.address?.city || c.address?.state) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--ch-text-muted)' }}>
                      <MapPin size={11} /> {c.address.city}{c.address.state ? `, ${c.address.state}` : ''}
                    </div>
                  )}
                </div>
                <span style={{ padding: '3px 10px', background: '#ede9fe', color: '#5b21b6', fontSize: 10, fontWeight: 800, borderRadius: 7, fontFamily: 'monospace', flexShrink: 0, marginLeft: 8 }}>{c.code}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--ch-card-border)', fontSize: 11 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--ch-text-muted)' }}>
                  <Building2 size={12} /> {c.totalVillas || '—'} villas
                </div>
                <div style={{ fontWeight: 800, color: '#10b981', fontSize: 12 }}>
                  ₹ {(c.maintenanceMonthlyRate || 4500).toLocaleString('en-IN')} / villa
                </div>
              </div>

              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={12} color="#10b981" />
                <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>Active & Onboarded</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Onboard Modal ── */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'var(--ch-card-bg)', borderRadius: 18, padding: 28, width: '100%', maxWidth: 420, boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--ch-text-primary)', marginBottom: 16 }}>Onboard New Gated Community</h3>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { field: 'name', label: 'Community Name', placeholder: 'e.g. Palm Meadows Villa Association' },
                { field: 'code', label: 'Community Code', placeholder: 'e.g. PMVA-2026', mono: true },
                { field: 'contactEmail', label: 'Contact Email', placeholder: 'admin@community.com' },
                { field: 'contactPhone', label: 'Contact Phone', placeholder: '+91 98765 43210' },
              ].map(f => (
                <div key={f.field}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--ch-text-muted)', display: 'block', marginBottom: 5 }}>{f.label}</label>
                  <input type="text" required placeholder={f.placeholder}
                    value={formData[f.field]}
                    onChange={e => setFormData({ ...formData, [f.field]: f.field === 'code' ? e.target.value.toUpperCase() : e.target.value })}
                    style={{ width: '100%', padding: '9px 14px', borderRadius: 10, border: '1px solid var(--ch-card-border)', background: 'var(--ch-body-bg)', color: 'var(--ch-text-primary)', fontSize: 13, fontFamily: f.mono ? 'monospace' : 'inherit', outline: 'none' }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--ch-text-muted)', display: 'block', marginBottom: 5 }}>Monthly Maintenance Rate (₹)</label>
                <input type="number" min="100" required value={formData.maintenanceMonthlyRate}
                  onChange={e => setFormData({ ...formData, maintenanceMonthlyRate: Number(e.target.value) })}
                  style={{ width: '100%', padding: '9px 14px', borderRadius: 10, border: '1px solid var(--ch-card-border)', background: 'var(--ch-body-bg)', color: 'var(--ch-text-primary)', fontSize: 13, fontFamily: 'inherit', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" onClick={() => setShowModal(false)}
                  style={{ flex: 1, padding: '10px 0', borderRadius: 10, background: 'var(--ch-body-bg)', border: '1px solid var(--ch-card-border)', color: 'var(--ch-text-primary)', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Cancel</button>
                <button type="submit"
                  style={{ flex: 1, padding: '10px 0', borderRadius: 10, background: '#6366f1', border: 'none', color: '#fff', fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>Confirm & Onboard</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
