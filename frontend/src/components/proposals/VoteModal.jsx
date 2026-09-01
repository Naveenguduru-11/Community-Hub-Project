import React, { useState } from 'react';
import { X, Vote, CheckCircle2, AlertCircle } from 'lucide-react';

const OPTION_PALETTES = [
  { bg: '#10b98122', border: '#10b98166', text: '#34d399', fill: '#10b981' },  // green
  { bg: '#ef444422', border: '#ef444466', text: '#f87171', fill: '#ef4444' },  // red
  { bg: '#6366f122', border: '#6366f166', text: '#818cf8', fill: '#6366f1' },  // indigo
  { bg: '#f59e0b22', border: '#f59e0b66', text: '#fbbf24', fill: '#f59e0b' },  // amber
  { bg: '#0ea5e922', border: '#0ea5e966', text: '#38bdf8', fill: '#0ea5e9' },  // sky
];

export const VoteModal = ({ proposal, currentUser, onClose, onVote, loading }) => {
  const userId = currentUser?._id || currentUser?.id;
  // Find current vote
  let initialIndex = -1;
  proposal.options?.forEach((opt, i) => {
    const voteIds = (opt.votes || []).map(v => (typeof v === 'object' ? (v._id || v) : v).toString());
    if (voteIds.includes(userId?.toString())) initialIndex = i;
  });

  const [selected, setSelected] = useState(initialIndex);
  const [confirmed, setConfirmed] = useState(false);

  const totalVotes = proposal.options?.reduce((s, o) => s + (o.votes?.length || 0), 0) || 0;

  const handleSubmit = async () => {
    if (selected < 0) return;
    const success = await onVote(proposal._id, selected);
    if (success) setConfirmed(true);
  };

  if (confirmed) {
    return (
      <div className="ch-modal-overlay">
        <div className="ch-modal" style={{ maxWidth: 400, textAlign: 'center', padding: '48px 32px' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#10b98122', border: '2px solid #10b98166', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <CheckCircle2 size={32} color="#34d399" />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--ch-text-primary)', marginBottom: 8 }}>Vote Recorded!</h2>
          <p style={{ color: 'var(--ch-text-muted)', fontSize: 14, marginBottom: 24 }}>
            You voted <strong style={{ color: '#818cf8' }}>{proposal.options[selected]?.label}</strong> on<br />"{proposal.title}"
          </p>
          <button className="ch-btn-primary" onClick={onClose} style={{ width: '100%' }}>Done</button>
        </div>
      </div>
    );
  }

  return (
    <div className="ch-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="ch-modal" style={{ maxWidth: 480, width: '100%' }}>
        {/* Header */}
        <div className="ch-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ background: '#6366f122', borderRadius: 8, padding: '6px 8px', display: 'flex' }}>
              <Vote size={18} color="#818cf8" />
            </span>
            <div>
              <h2 className="ch-modal-title">Cast Your Vote</h2>
              <p style={{ color: 'var(--ch-text-muted)', fontSize: 12, marginTop: 2 }}>
                {totalVotes} votes cast · {proposal.totalEligibleVoters || '—'} eligible voters
              </p>
            </div>
          </div>
          <button className="ch-modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="ch-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Proposal context */}
          <div style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--ch-nav-hover-bg)', border: '1px solid var(--ch-card-border)' }}>
            <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--ch-text-primary)', marginBottom: 4 }}>{proposal.title}</p>
            <p style={{ fontSize: 12, color: 'var(--ch-text-muted)', lineHeight: 1.5 }}>{proposal.description}</p>
          </div>

          {initialIndex >= 0 && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '10px 12px', background: '#6366f111', borderRadius: 8, border: '1px solid #6366f133' }}>
              <AlertCircle size={14} color="#818cf8" />
              <span style={{ fontSize: 12, color: '#818cf8' }}>
                You previously voted <strong>{proposal.options[initialIndex]?.label}</strong>. Selecting a new option will change your vote.
              </span>
            </div>
          )}

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {proposal.options?.map((opt, i) => {
              const pal = OPTION_PALETTES[i % OPTION_PALETTES.length];
              const pct = totalVotes > 0 ? Math.round((opt.votes?.length || 0) / totalVotes * 100) : 0;
              const isSelected = selected === i;
              const wasPrevious = initialIndex === i;
              return (
                <button
                  key={i}
                  id={`vote-option-${i}`}
                  onClick={() => setSelected(i)}
                  className="vote-option-btn"
                  style={{
                    borderColor: isSelected ? pal.fill : 'var(--ch-card-border)',
                    background: isSelected ? pal.bg : 'var(--ch-card-bg)',
                    boxShadow: isSelected ? `0 0 0 2px ${pal.fill}44` : 'none',
                    transform: isSelected ? 'translateY(-1px)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 14, color: isSelected ? pal.text : 'var(--ch-text-primary)' }}>
                      {opt.label}
                      {wasPrevious && <span style={{ fontSize: 11, marginLeft: 6, color: '#818cf8' }}>(your vote)</span>}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, color: 'var(--ch-text-muted)' }}>{opt.votes?.length || 0} · {pct}%</span>
                      <div style={{
                        width: 18, height: 18, borderRadius: '50%',
                        border: `2px solid ${isSelected ? pal.fill : 'var(--ch-card-border)'}`,
                        background: isSelected ? pal.fill : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s'
                      }}>
                        {isSelected && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                      </div>
                    </div>
                  </div>
                  {/* Mini bar */}
                  <div style={{ height: 4, borderRadius: 9999, background: 'var(--ch-nav-hover-bg)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: pal.fill, borderRadius: 9999, transition: 'width 0.4s ease' }} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
            <button className="ch-btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
            <button
              id="vote-submit-btn"
              className="ch-btn-primary"
              onClick={handleSubmit}
              disabled={selected < 0 || loading}
              style={{ opacity: selected < 0 ? 0.5 : 1 }}
            >
              {loading ? 'Submitting…' : initialIndex >= 0 ? 'Change Vote' : 'Submit Vote'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
