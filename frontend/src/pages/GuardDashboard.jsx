import React, { useState, useEffect } from 'react';
import { visitorService } from '../services/api';
import { CheckInModal } from '../components/visitors/CheckInModal';
import { useSocket } from '../context/SocketContext';
import {
  Shield, QrCode, Key, LogIn, Truck,
  ShieldAlert, CheckCircle2, Camera,
  User, Clock, TrendingUp
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

function QuickBtn({ icon: Icon, label, color, onClick, danger }) {
  return (
    <button className="ch-quick-btn" onClick={onClick}
      style={danger ? { borderColor: '#fca5a5', background: '#fff1f2' } : {}}>
      <span className="ch-quick-icon" style={{ background: color + '22' }}>
        <Icon size={20} style={{ color }} />
      </span>
      <span className="ch-quick-label" style={danger ? { color: '#ef4444' } : {}}>{label}</span>
    </button>
  );
}

const STATUS_META = {
  INSIDE:       { label: 'Inside', bg: '#fef3c7', color: '#92400e' },
  PRE_APPROVED: { label: 'Pre-Approved', bg: '#d1fae5', color: '#065f46' },
  EXITED:       { label: 'Exited', bg: '#f1f5f9', color: '#475569' },
  default:      { label: 'Unknown', bg: '#f1f5f9', color: '#475569' },
};

const TYPE_COLORS = { GUEST: '#6366f1', DELIVERY: '#3b82f6', WORKER: '#f59e0b', OTHER: '#9ca3af' };

export const GuardDashboard = () => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const { triggerSOS } = useSocket();

  const fetchVisitors = async () => {
    setLoading(true);
    try {
      const res = await visitorService.getVisitors();
      setVisitors(res.data.visitors || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchVisitors(); }, []);

  const handleCheckout = async (id) => {
    if (confirm('Confirm visitor exit check-out?')) {
      try { await visitorService.checkOut(id); fetchVisitors(); }
      catch { alert('Check-out failed'); }
    }
  };

  const activeInside   = visitors.filter(v => v.status === 'INSIDE');
  const deliveries     = visitors.filter(v => v.visitorType === 'DELIVERY');
  const preApproved    = visitors.filter(v => v.status === 'PRE_APPROVED');
  const displayVisitors = visitors; // real data only — no hardcoded fallbacks


  return (
    <div>
      {/* ── Gate Control Hero ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a, #1e293b)',
        borderRadius: 18, padding: '24px 28px', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20,
        marginBottom: 24
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Shield size={28} color="#fbbf24" />
          </div>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(251,191,36,0.15)', padding: '3px 10px', borderRadius: 99, fontSize: 10, fontWeight: 700, color: '#fbbf24', marginBottom: 6, fontFamily: 'monospace' }}>
              Gate 1 Controller • Active Duty
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 3 }}>Gate Security Portal</h2>
            <p style={{ fontSize: 12, color: '#94a3b8' }}>Scan QR codes, verify passcodes, and manage visitor entry/exit.</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <button onClick={() => setShowCheckInModal(true)} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '11px 20px',
            background: '#f59e0b', border: 'none', borderRadius: 12, color: '#0f172a',
            fontWeight: 800, fontSize: 13, cursor: 'pointer', boxShadow: '0 6px 20px rgba(245,158,11,0.4)'
          }}>
            <Camera size={18} /> 📷 Open Camera QR Scanner
          </button>
          <button onClick={() => {
            if (confirm('🚨 BROADCAST EMERGENCY SOS TO ALL RESIDENTS & ADMINS?')) {
              triggerSOS('GATE_BREACH_ALERT', 'Main Entrance Gate 1');
            }
          }} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '11px 16px',
            background: '#ef4444', border: 'none', borderRadius: 12, color: '#fff',
            fontWeight: 800, fontSize: 12, cursor: 'pointer', animation: 'sosPulse 2s infinite'
          }}>
            <ShieldAlert size={16} /> TRIGGER SOS
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="ch-stat-grid ch-stat-grid--3" style={{ marginBottom: 24 }}>
        <StatCard icon={LogIn}       iconClass="ch-stat-icon--orange" label="Visitors Inside Premises" value={activeInside.length}  sub="Currently inside" />
        <StatCard icon={Truck}       iconClass="ch-stat-icon--blue"   label="Deliveries Logged Today" value={deliveries.length}    sub="Packages & deliveries" />
        <StatCard icon={CheckCircle2} iconClass="ch-stat-icon--green" label="Pre-Approved Passes"    value={preApproved.length}  sub="Awaiting entry" />
      </div>

      {/* ── Quick Actions ── */}
      <div className="ch-section">
        <div className="ch-section-header">
          <span className="ch-section-title">Quick Actions</span>
        </div>
        <div className="ch-quick-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <QuickBtn icon={Camera} label="Scan QR / Check-In" color="#f59e0b" onClick={() => setShowCheckInModal(true)} />
          <QuickBtn icon={Key} label="Verify Passcode" color="#6366f1" onClick={() => setShowCheckInModal(true)} />
          <QuickBtn icon={ShieldAlert} label="Trigger SOS Alert" color="#ef4444" danger onClick={() => {
            if (confirm('🚨 BROADCAST EMERGENCY SOS?')) triggerSOS('GATE_BREACH_ALERT', 'Main Entrance Gate 1');
          }} />
        </div>
      </div>

      {/* ── Quick Passcode Bar ── */}
      <div style={{
        background: '#fffbeb', border: '2px solid #fcd34d', borderRadius: 14,
        padding: '18px 22px', marginBottom: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16
      }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 13, color: '#92400e', display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
            <Key size={15} color="#f59e0b" /> Quick 6-Digit Passcode Gate Check-In
          </div>
          <p style={{ fontSize: 12, color: '#b45309' }}>Enter visitor's 6-digit pre-approved passcode or scan QR to grant instant entry.</p>
        </div>
        <button onClick={() => setShowCheckInModal(true)} style={{
          padding: '10px 18px', background: '#f59e0b', border: 'none', borderRadius: 10,
          color: '#0f172a', fontWeight: 800, fontSize: 12, cursor: 'pointer', display: 'flex',
          alignItems: 'center', gap: 7, whiteSpace: 'nowrap', flexShrink: 0
        }}>
          <Camera size={15} /> Verify Passcode & Scan QR
        </button>
      </div>

      {/* ── Gate Movement Logs ── */}
      <div className="ch-section">
        <div className="ch-section-header">
          <span className="ch-section-title">Gate Movement Logs</span>
          <span style={{ fontSize: 11, color: 'var(--ch-text-muted)' }}>Live entry & exit for current shift</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--ch-card-border)' }}>
                {['Visitor', 'Visiting Villa', 'Type', 'Passcode', 'Entry Time', 'Status', 'Action'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: 'var(--ch-text-muted)', textTransform: 'uppercase', letterSpacing: 0.4 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayVisitors.length === 0 ? (
                <tr><td colSpan={7}><div className="ch-empty"><p>No visitor logs for this shift</p></div></td></tr>
              ) : displayVisitors.map(v => {
                const sm = STATUS_META[v.status] || STATUS_META.default;
                return (
                  <tr key={v._id} style={{ borderBottom: '1px solid var(--ch-card-border)' }}>
                    <td style={{ padding: '12px', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 10, background: '#f0f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <User size={15} color="#6366f1" />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--ch-text-primary)' }}>{v.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--ch-text-muted)' }}>{v.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ fontWeight: 700, color: '#6366f1' }}>{v.villa?.villaNumber || '—'}</span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ padding: '3px 9px', background: (TYPE_COLORS[v.visitorType] || '#9ca3af') + '22', color: TYPE_COLORS[v.visitorType] || '#9ca3af', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>
                        {v.visitorType}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontFamily: 'monospace', fontWeight: 700, color: 'var(--ch-text-primary)', fontSize: 13 }}>{v.passcode}</td>
                    <td style={{ padding: '12px', color: 'var(--ch-text-muted)' }}>
                      {v.entryTime ? new Date(v.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (
                        <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Not checked in</span>
                      )}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ padding: '4px 10px', background: sm.bg, color: sm.color, borderRadius: 99, fontSize: 10, fontWeight: 700 }}>{sm.label}</span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {v.status === 'INSIDE' ? (
                        <button onClick={() => handleCheckout(v._id)} style={{ padding: '5px 12px', background: '#ef4444', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>Check-Out</button>
                      ) : v.status === 'PRE_APPROVED' ? (
                        <button onClick={() => setShowCheckInModal(true)} style={{ padding: '5px 12px', background: '#f59e0b', border: 'none', borderRadius: 8, color: '#0f172a', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>Check-In</button>
                      ) : (
                        <span style={{ fontSize: 11, color: '#9ca3af' }}>Completed</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {displayVisitors.length === 0 && (
            <div className="ch-empty"><p>No visitor logs for this shift</p></div>
          )}
        </div>
      </div>

      <CheckInModal isOpen={showCheckInModal} onClose={() => setShowCheckInModal(false)} onCheckInSuccess={fetchVisitors} />
    </div>
  );
};
