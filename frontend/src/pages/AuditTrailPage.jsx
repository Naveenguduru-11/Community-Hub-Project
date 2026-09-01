import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { auditService } from '../services/api';
import {
  Shield, Search, Filter, Download, RefreshCw,
  FileText, Vote, CheckCircle2, XCircle, Lock,
  UserPlus, LogIn, LogOut, AlertCircle, CreditCard,
  Bell, QrCode, Settings, ChevronLeft, ChevronRight
} from 'lucide-react';

const ACTION_CONFIG = {
  PROPOSAL_CREATED:        { icon: FileText,    color: '#6366f1', label: 'Proposal Created',        severity: 'info'    },
  PROPOSAL_STATUS_CHANGED: { icon: Settings,    color: '#f59e0b', label: 'Proposal Status Changed',  severity: 'warn'    },
  PROPOSAL_ACTIVATED:      { icon: Vote,        color: '#3b82f6', label: 'Proposal Activated',       severity: 'info'    },
  PROPOSAL_CLOSED:         { icon: Lock,        color: '#64748b', label: 'Proposal Closed',          severity: 'neutral' },
  PROPOSAL_DELETED:        { icon: XCircle,     color: '#ef4444', label: 'Proposal Deleted',         severity: 'danger'  },
  VOTE_CAST:               { icon: Vote,        color: '#10b981', label: 'Vote Cast',                severity: 'success' },
  VOTE_CHANGED:            { icon: Vote,        color: '#0ea5e9', label: 'Vote Changed',             severity: 'info'    },
  USER_LOGIN:              { icon: LogIn,       color: '#10b981', label: 'User Login',               severity: 'success' },
  USER_LOGOUT:             { icon: LogOut,      color: '#64748b', label: 'User Logout',              severity: 'neutral' },
  USER_REGISTERED:         { icon: UserPlus,    color: '#6366f1', label: 'User Registered',          severity: 'info'    },
  COMPLAINT_CREATED:       { icon: AlertCircle, color: '#f59e0b', label: 'Complaint Filed',          severity: 'warn'    },
  COMPLAINT_RESOLVED:      { icon: CheckCircle2,color: '#10b981', label: 'Complaint Resolved',       severity: 'success' },
  NOTICE_PUBLISHED:        { icon: Bell,        color: '#a78bfa', label: 'Notice Published',         severity: 'info'    },
  PAYMENT_RECORDED:        { icon: CreditCard,  color: '#34d399', label: 'Payment Recorded',         severity: 'success' },
  VISITOR_APPROVED:        { icon: QrCode,      color: '#0ea5e9', label: 'Visitor Approved',         severity: 'info'    },
  SETTINGS_CHANGED:        { icon: Settings,    color: '#f59e0b', label: 'Settings Changed',         severity: 'warn'    }
};

const SEVERITY_BG = {
  success: '#10b98111', warn: '#f59e0b11', danger: '#ef444411',
  info: '#6366f111', neutral: '#64748b11'
};
const SEVERITY_BORDER = {
  success: '#10b98133', warn: '#f59e0b33', danger: '#ef444433',
  info: '#6366f133', neutral: '#64748b33'
};

// Demo audit logs
const DEMO_LOGS = [
  { _id: 'a1', action: 'PROPOSAL_CREATED',    actor: { name: 'Admin Team',   role: 'COMMUNITY_ADMIN' }, metadata: { title: 'Install Solar Panels' },               timestamp: new Date(Date.now() - 2*86400000).toISOString() },
  { _id: 'a2', action: 'PROPOSAL_ACTIVATED',  actor: { name: 'Admin Team',   role: 'COMMUNITY_ADMIN' }, metadata: { title: 'Install Solar Panels' },               timestamp: new Date(Date.now() - 2*86400000 + 3600000).toISOString() },
  { _id: 'a3', action: 'VOTE_CAST',           actor: { name: 'Ravi Kumar',   role: 'RESIDENT' },        metadata: { proposalTitle: 'Install Solar Panels', option: 'Yes' }, timestamp: new Date(Date.now() - 1.5*86400000).toISOString() },
  { _id: 'a4', action: 'VOTE_CAST',           actor: { name: 'Priya Sharma', role: 'RESIDENT' },        metadata: { proposalTitle: 'Install Solar Panels', option: 'Yes' }, timestamp: new Date(Date.now() - 1.4*86400000).toISOString() },
  { _id: 'a5', action: 'VOTE_CAST',           actor: { name: 'Ajay Nair',    role: 'RESIDENT' },        metadata: { proposalTitle: 'New Visitor Policy', option: 'No'  }, timestamp: new Date(Date.now() - 1.2*86400000).toISOString() },
  { _id: 'a6', action: 'PROPOSAL_CREATED',    actor: { name: 'Admin Team',   role: 'COMMUNITY_ADMIN' }, metadata: { title: 'Monthly Community Cleanup' },           timestamp: new Date(Date.now() - 10*86400000).toISOString() },
  { _id: 'a7', action: 'PROPOSAL_CLOSED',     actor: { name: 'Admin Team',   role: 'COMMUNITY_ADMIN' }, metadata: { title: 'Monthly Community Cleanup', newStatus: 'passed' }, timestamp: new Date(Date.now() - 5*86400000).toISOString() },
  { _id: 'a8', action: 'VOTE_CHANGED',        actor: { name: 'Meena R.',     role: 'RESIDENT' },        metadata: { proposalTitle: 'Install Solar Panels', option: 'Abstain', previousOption: 'No' }, timestamp: new Date(Date.now() - 86400000).toISOString() },
  { _id: 'a9', action: 'COMPLAINT_CREATED',   actor: { name: 'Ravi Kumar',   role: 'RESIDENT' },        metadata: { subject: 'Water leakage in block B' },          timestamp: new Date(Date.now() - 3*86400000).toISOString() },
  { _id:'a10', action: 'COMPLAINT_RESOLVED',  actor: { name: 'Admin Team',   role: 'COMMUNITY_ADMIN' }, metadata: { subject: 'Water leakage in block B' },          timestamp: new Date(Date.now() - 2.5*86400000).toISOString() },
  { _id:'a11', action: 'NOTICE_PUBLISHED',    actor: { name: 'Admin Team',   role: 'COMMUNITY_ADMIN' }, metadata: { title: 'Water Supply Maintenance' },            timestamp: new Date(Date.now() - 4*86400000).toISOString() },
  { _id:'a12', action: 'USER_REGISTERED',     actor: { name: 'New Resident', role: 'RESIDENT' },        metadata: { email: 'new@example.com' },                     timestamp: new Date(Date.now() - 7*86400000).toISOString() },
  { _id:'a13', action: 'PAYMENT_RECORDED',    actor: { name: 'Priya Sharma', role: 'RESIDENT' },        metadata: { amount: '₹2,500', type: 'Maintenance' },        timestamp: new Date(Date.now() - 6*86400000).toISOString() }
];

function formatTimestamp(ts) {
  const d = new Date(ts);
  return d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

function relativeTime(ts) {
  const diff = Date.now() - new Date(ts);
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

function downloadCSV(logs) {
  const header = ['Timestamp', 'Action', 'Actor', 'Role', 'Details'];
  const rows = logs.map(l => [
    formatTimestamp(l.timestamp),
    ACTION_CONFIG[l.action]?.label || l.action,
    l.actor?.name || '—',
    l.actor?.role || '—',
    JSON.stringify(l.metadata || {}).replace(/"/g, '\'')
  ]);
  const csv = [header, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `audit-trail-${Date.now()}.csv`; a.click();
  URL.revokeObjectURL(url);
}

const ALL_ACTIONS = ['All', ...Object.keys(ACTION_CONFIG)];
const PAGE_SIZE = 10;

export const AuditTrailPage = () => {
  const { user } = useAuth();
  const [logs, setLogs]           = useState([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState(0);
  const [search, setSearch]       = useState('');
  const [actionFilter, setActionFilter] = useState('All');
  const [dateFrom, setDateFrom]   = useState('');
  const [dateTo, setDateTo]       = useState('');

  const isAdmin = user?.role === 'COMMUNITY_ADMIN' || user?.role === 'SUPER_ADMIN';

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        limit: PAGE_SIZE,
        skip: page * PAGE_SIZE
      };
      if (actionFilter !== 'All') params.action = actionFilter;
      if (search) params.actorName = search;
      if (dateFrom) params.from = dateFrom;
      if (dateTo) params.to = dateTo;

      const res = await auditService.getLogs(params);
      setLogs(res.data.logs || []);
      setTotal(res.data.total || 0);
    } catch {
      // Demo fallback
      let demo = [...DEMO_LOGS];
      if (actionFilter !== 'All') demo = demo.filter(l => l.action === actionFilter);
      if (search) demo = demo.filter(l => l.actor?.name?.toLowerCase().includes(search.toLowerCase()));
      setTotal(demo.length);
      setLogs(demo.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE));
    }
    setLoading(false);
  }, [page, search, actionFilter, dateFrom, dateTo]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);
  useEffect(() => { setPage(0); }, [search, actionFilter, dateFrom, dateTo]);

  if (!isAdmin) {
    return (
      <div className="proposals-empty" style={{ minHeight: 400 }}>
        <Shield size={48} style={{ opacity: 0.2, marginBottom: 12, color: '#ef4444' }} />
        <p style={{ fontWeight: 600 }}>Access Restricted</p>
        <p style={{ fontSize: 13, color: 'var(--ch-text-muted)' }}>Audit trail is available to Community Admins only.</p>
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="audit-page">
      {/* Header */}
      <div className="proposals-header" style={{ marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <div className="proposals-header-icon" style={{ background: '#ef444422', border: '1px solid #ef444444' }}>
              <Shield size={22} color="#f87171" />
            </div>
            <h1 className="proposals-title">Audit Trail</h1>
          </div>
          <p className="proposals-subtitle">Complete tamper-evident log of all important community actions</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="proposals-icon-btn" onClick={fetchLogs} title="Refresh" disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
          </button>
          <button
            id="audit-export-btn"
            className="ch-btn-secondary"
            onClick={() => downloadCSV(logs)}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="audit-filters">
        <div className="proposals-search" style={{ flex: 1, minWidth: 160 }}>
          <Search size={14} />
          <input
            id="audit-search"
            placeholder="Search by actor name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="proposals-filter">
          <Filter size={14} />
          <select
            id="audit-action-filter"
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
          >
            {ALL_ACTIONS.map(a => (
              <option key={a} value={a}>{a === 'All' ? 'All Actions' : (ACTION_CONFIG[a]?.label || a)}</option>
            ))}
          </select>
        </div>
        <div className="audit-date-range">
          <span style={{ fontSize: 12, color: 'var(--ch-text-muted)', whiteSpace: 'nowrap' }}>From</span>
          <input id="audit-from" type="date" className="ch-form-input" style={{ padding: '7px 10px', fontSize: 12 }} value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          <span style={{ fontSize: 12, color: 'var(--ch-text-muted)' }}>To</span>
          <input id="audit-to"   type="date" className="ch-form-input" style={{ padding: '7px 10px', fontSize: 12 }} value={dateTo}   onChange={e => setDateTo(e.target.value)}   />
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['VOTE_CAST', 'PROPOSAL_CREATED', 'COMPLAINT_CREATED', 'PAYMENT_RECORDED'].map(act => {
          const cfg = ACTION_CONFIG[act];
          const Icon = cfg.icon;
          const cnt = DEMO_LOGS.filter(l => l.action === act).length;
          return (
            <button
              key={act}
              className="audit-quick-filter"
              style={{ '--qf-color': cfg.color }}
              onClick={() => setActionFilter(actionFilter === act ? 'All' : act)}
            >
              <Icon size={12} /> {cfg.label} <span>{cnt}</span>
            </button>
          );
        })}
      </div>

      {/* Timeline */}
      {loading ? (
        <div className="proposals-empty">
          <div className="proposals-spinner" />
          <p>Loading audit logs…</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="proposals-empty">
          <Shield size={40} style={{ opacity: 0.15, marginBottom: 12 }} />
          <p>No audit logs found</p>
        </div>
      ) : (
        <div className="audit-timeline">
          {logs.map((log, idx) => {
            const cfg = ACTION_CONFIG[log.action] || { icon: FileText, color: '#6b7280', label: log.action, severity: 'neutral' };
            const Icon = cfg.icon;
            const sev  = cfg.severity || 'neutral';
            return (
              <div key={log._id || idx} className="audit-entry">
                {/* Connector line */}
                <div className="audit-entry__line" />
                {/* Icon dot */}
                <div
                  className="audit-entry__dot"
                  style={{ background: SEVERITY_BG[sev], border: `2px solid ${SEVERITY_BORDER[sev]}` }}
                >
                  <Icon size={13} style={{ color: cfg.color }} />
                </div>
                {/* Content */}
                <div className="audit-entry__content">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div>
                      <span className="audit-action-badge" style={{ background: `${cfg.color}18`, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
                        {cfg.label}
                      </span>
                      <div style={{ marginTop: 6, fontSize: 13, color: 'var(--ch-text-primary)', fontWeight: 500 }}>
                        <span style={{ color: cfg.color }}>{log.actor?.name || 'System'}</span>
                        <span style={{ color: 'var(--ch-text-muted)', fontWeight: 400 }}> ({log.actor?.role?.replace(/_/g, ' ') || 'Unknown'})</span>
                      </div>
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div className="audit-meta">
                          {Object.entries(log.metadata).filter(([, v]) => v !== null && v !== undefined).map(([k, v]) => (
                            <span key={k} className="audit-meta-chip">
                              <span style={{ color: 'var(--ch-text-muted)' }}>{k.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span> {String(v)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 11, color: 'var(--ch-text-muted)', marginBottom: 2 }}>{relativeTime(log.timestamp)}</div>
                      <div style={{ fontSize: 10, color: 'var(--ch-text-xs)' }}>{formatTimestamp(log.timestamp)}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="audit-pagination">
          <button
            id="audit-prev-page"
            className="proposals-icon-btn"
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontSize: 13, color: 'var(--ch-text-muted)' }}>
            Page {page + 1} of {totalPages} · {total} entries
          </span>
          <button
            id="audit-next-page"
            className="proposals-icon-btn"
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};
