import React from 'react';
import {
  Clock, Users, CheckCircle2, XCircle, AlertTriangle,
  BarChart2, ChevronRight, Trash2, PlayCircle, Lock
} from 'lucide-react';

const CATEGORY_COLORS = {
  Infrastructure: { bg: '#0ea5e922', text: '#0ea5e9', border: '#0ea5e944' },
  Rules:          { bg: '#f59e0b22', text: '#f59e0b', border: '#f59e0b44' },
  Events:         { bg: '#a78bfa22', text: '#a78bfa', border: '#a78bfa44' },
  Finance:        { bg: '#10b98122', text: '#10b981', border: '#10b98144' },
  Other:          { bg: '#6b728022', text: '#6b7280', border: '#6b728044' }
};

const STATUS_CONFIG = {
  draft:    { icon: Clock,         label: 'Draft',    bg: '#64748b22', text: '#94a3b8' },
  active:   { icon: PlayCircle,    label: 'Active',   bg: '#3b82f622', text: '#60a5fa' },
  passed:   { icon: CheckCircle2,  label: 'Passed',   bg: '#10b98122', text: '#34d399' },
  rejected: { icon: XCircle,       label: 'Rejected', bg: '#ef444422', text: '#f87171' },
  closed:   { icon: Lock,          label: 'Closed',   bg: '#64748b22', text: '#94a3b8' }
};

function timeLeft(deadline) {
  const diff = new Date(deadline) - Date.now();
  if (diff <= 0) return 'Ended';
  const days = Math.floor(diff / 86400000);
  const hrs  = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days}d ${hrs}h left`;
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hrs > 0) return `${hrs}h ${mins}m left`;
  return `${mins}m left`;
}

export const ProposalCard = ({ proposal, currentUser, onVote, onStatusChange, onDelete, onExpand }) => {
  const totalVotes = proposal.options?.reduce((s, o) => s + (o.votes?.length || 0), 0) || 0;
  const catColor   = CATEGORY_COLORS[proposal.category] || CATEGORY_COLORS.Other;
  const stCfg      = STATUS_CONFIG[proposal.status] || STATUS_CONFIG.draft;
  const StatusIcon = stCfg.icon;
  const isAdmin    = currentUser?.role === 'COMMUNITY_ADMIN' || currentUser?.role === 'SUPER_ADMIN';
  const canVote    = proposal.status === 'active' && new Date(proposal.votingDeadline) > Date.now();

  // Determine if current user has already voted
  const userId = currentUser?._id || currentUser?.id;
  let userVoteIndex = -1;
  if (userId) {
    proposal.options?.forEach((opt, i) => {
      const voteIds = (opt.votes || []).map(v => (typeof v === 'object' ? v._id || v.toString() : v));
      if (voteIds.includes(userId.toString())) userVoteIndex = i;
    });
  }

  return (
    <div className="proposal-card" style={{ '--cat-color': catColor.text }}>
      {/* Header */}
      <div className="proposal-card__header">
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="proposal-badge" style={{ background: catColor.bg, color: catColor.text, border: `1px solid ${catColor.border}` }}>
            {proposal.category}
          </span>
          <span className="proposal-badge" style={{ background: stCfg.bg, color: stCfg.text }}>
            <StatusIcon size={11} style={{ marginRight: 4 }} />
            {stCfg.label}
          </span>
          {userVoteIndex >= 0 && (
            <span className="proposal-badge" style={{ background: '#6366f122', color: '#818cf8', border: '1px solid #6366f144' }}>
              ✓ Voted: {proposal.options[userVoteIndex]?.label}
            </span>
          )}
        </div>
        {isAdmin && proposal.status === 'draft' && (
          <button className="proposal-icon-btn proposal-icon-btn--danger" onClick={() => onDelete?.(proposal._id)} title="Delete proposal">
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Title & Description */}
      <h3 className="proposal-card__title">{proposal.title}</h3>
      <p className="proposal-card__desc">{proposal.description}</p>

      {/* Vote bars */}
      <div className="proposal-card__bars">
        {proposal.options?.map((opt, i) => {
          const pct = totalVotes > 0 ? Math.round((opt.votes?.length || 0) / totalVotes * 100) : 0;
          const isUserVote = i === userVoteIndex;
          return (
            <div key={i} className="proposal-bar-row">
              <div className="proposal-bar-label">
                <span style={{ fontWeight: isUserVote ? 700 : 500 }}>{opt.label}</span>
                <span style={{ color: 'var(--ch-text-muted)', fontSize: '11px' }}>{opt.votes?.length || 0} votes · {pct}%</span>
              </div>
              <div className="proposal-bar-track">
                <div
                  className={`proposal-bar-fill ${isUserVote ? 'proposal-bar-fill--voted' : ''}`}
                  style={{ width: `${pct}%`, '--opt-color': i === 0 ? '#34d399' : i === 1 ? '#f87171' : '#94a3b8' }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Meta row */}
      <div className="proposal-card__meta">
        <span className="proposal-meta-chip">
          <Users size={12} /> {totalVotes} / {proposal.totalEligibleVoters || '—'} voters
        </span>
        <span className="proposal-meta-chip">
          <Clock size={12} /> {timeLeft(proposal.votingDeadline)}
        </span>
        <span className="proposal-meta-chip">
          <BarChart2 size={12} /> Quorum {proposal.quorumPercent}% · Pass {proposal.passThresholdPercent}%
        </span>
        {proposal.createdBy?.name && (
          <span className="proposal-meta-chip" style={{ marginLeft: 'auto' }}>
            By {proposal.createdBy.name}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="proposal-card__actions">
        {canVote && (
          <button className="proposal-btn proposal-btn--vote" onClick={() => onVote?.(proposal)}>
            {userVoteIndex >= 0 ? 'Change Vote' : 'Cast Vote'}
          </button>
        )}
        {isAdmin && proposal.status === 'draft' && (
          <button className="proposal-btn proposal-btn--activate" onClick={() => onStatusChange?.(proposal._id, 'active')}>
            <PlayCircle size={14} /> Activate
          </button>
        )}
        {isAdmin && proposal.status === 'active' && (
          <button className="proposal-btn proposal-btn--close" onClick={() => onStatusChange?.(proposal._id, 'closed')}>
            <Lock size={14} /> Close Voting
          </button>
        )}
        <button className="proposal-btn proposal-btn--ghost" onClick={() => onExpand?.(proposal)}>
          Details <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};
