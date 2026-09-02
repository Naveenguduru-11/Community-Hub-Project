import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { proposalService } from '../services/api';
import { ProposalCard } from '../components/proposals/ProposalCard';
import { NewProposalModal } from '../components/proposals/NewProposalModal';
import { VoteModal } from '../components/proposals/VoteModal';
import {
  Vote, Plus, RefreshCw, Search, Filter,
  CheckCircle2, Clock, PlayCircle, XCircle, FileText, Lock
} from 'lucide-react';

const TABS = [
  { key: 'all',      label: 'All',      icon: FileText  },
  { key: 'active',   label: 'Active',   icon: PlayCircle },
  { key: 'draft',    label: 'Drafts',   icon: Clock     },
  { key: 'passed',   label: 'Passed',   icon: CheckCircle2 },
  { key: 'rejected', label: 'Rejected', icon: XCircle   },
  { key: 'closed',   label: 'Closed',   icon: Lock      }
];

const CATEGORIES = ['All', 'Infrastructure', 'Rules', 'Events', 'Finance', 'Other'];

// Locally seeded demo proposals (used when API is unreachable)
const DEMO_PROPOSALS = [
  {
    _id: 'demo_1',
    title: 'Install Solar Panels on Rooftop',
    description: 'Proposal to install 50kW solar panels across the community rooftop to reduce electricity costs by an estimated 35% annually. Initial investment of ₹12L to be recovered in 3 years.',
    category: 'Infrastructure',
    status: 'active',
    createdBy: { name: 'Admin Team', role: 'COMMUNITY_ADMIN' },
    votingDeadline: new Date(Date.now() + 5 * 86400000).toISOString(),
    quorumPercent: 60,
    passThresholdPercent: 55,
    options: [
      { label: 'Yes', votes: ['r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7'] },
      { label: 'No', votes: ['r8', 'r9'] },
      { label: 'Abstain', votes: ['r10'] }
    ],
    totalEligibleVoters: 45,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    _id: 'demo_2',
    title: 'New Visitor Registration Policy',
    description: 'Introduce mandatory digital registration for all visitors via the app, replacing the existing manual logbook. Visitors must show OTP at gate; guards verify digitally.',
    category: 'Rules',
    status: 'active',
    createdBy: { name: 'Admin Team', role: 'COMMUNITY_ADMIN' },
    votingDeadline: new Date(Date.now() + 3 * 86400000).toISOString(),
    quorumPercent: 50,
    passThresholdPercent: 50,
    options: [
      { label: 'Yes', votes: ['r1', 'r2', 'r3'] },
      { label: 'No', votes: ['r4', 'r5', 'r6', 'r7', 'r8'] },
      { label: 'Abstain', votes: [] }
    ],
    totalEligibleVoters: 45,
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    _id: 'demo_3',
    title: 'Monthly Community Cleanup Drive',
    description: 'Organize a monthly community cleanup on the first Sunday of every month. Volunteers to receive recognition points redeemable at community events.',
    category: 'Events',
    status: 'passed',
    createdBy: { name: 'Admin Team', role: 'COMMUNITY_ADMIN' },
    votingDeadline: new Date(Date.now() - 5 * 86400000).toISOString(),
    quorumPercent: 40,
    passThresholdPercent: 50,
    options: [
      { label: 'Yes', votes: ['r1','r2','r3','r4','r5','r6','r7','r8','r9','r10','r11','r12'] },
      { label: 'No', votes: ['r13', 'r14'] },
      { label: 'Abstain', votes: ['r15'] }
    ],
    totalEligibleVoters: 45,
    result: { winningOption: 'Yes', totalVotesCast: 15, quorumReached: true, closedAt: new Date(Date.now() - 5 * 86400000).toISOString() },
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString()
  },
  {
    _id: 'demo_4',
    title: 'Gym Expansion Budget Allocation',
    description: 'Allocate ₹2.5L from the community fund to expand the gym with new equipment including treadmills, weight rack, and air conditioning upgrades.',
    category: 'Finance',
    status: 'draft',
    createdBy: { name: 'Admin Team', role: 'COMMUNITY_ADMIN' },
    votingDeadline: new Date(Date.now() + 10 * 86400000).toISOString(),
    quorumPercent: 50,
    passThresholdPercent: 60,
    options: [
      { label: 'Yes', votes: [] },
      { label: 'No', votes: [] },
      { label: 'Abstain', votes: [] }
    ],
    totalEligibleVoters: 45,
    createdAt: new Date().toISOString()
  }
];

export const ProposalsPage = () => {
  const { user } = useAuth();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [category, setCategory]   = useState('All');
  const [search, setSearch]       = useState('');
  const [showCreate, setShowCreate]   = useState(false);
  const [voteProposal, setVoteProposal] = useState(null);
  const [toast, setToast]         = useState(null);

  const isAdmin = user?.role === 'COMMUNITY_ADMIN' || user?.role === 'SUPER_ADMIN';

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchProposals = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeTab !== 'all') params.status = activeTab;
      if (category !== 'All') params.category = category;
      const res = await proposalService.getProposals(params);
      setProposals(res.data.proposals || []);
    } catch {
      // Use demo data on API failure
      let demo = [...DEMO_PROPOSALS];
      if (activeTab !== 'all') demo = demo.filter(p => p.status === activeTab);
      if (category !== 'All') demo = demo.filter(p => p.category === category);
      setProposals(demo);
    }
    setLoading(false);
  }, [activeTab, category]);

  useEffect(() => { fetchProposals(); }, [fetchProposals]);

  const handleCreate = async (formData, attachmentFiles) => {
    setActionLoading(true);
    try {
      const res = await proposalService.createProposal(formData);
      // Upload attachments if provided
      if (attachmentFiles && attachmentFiles.length > 0) {
        try {
          await proposalService.uploadAttachments(res.data.proposal._id, attachmentFiles);
        } catch (uploadErr) {
          console.warn('Attachment upload failed:', uploadErr);
        }
      }
      setShowCreate(false);
      showToast('Proposal created successfully!');
      fetchProposals();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to create proposal', 'error');
    }
    setActionLoading(false);
  };

  const handleVote = async (proposalId, optionIndex) => {
    setActionLoading(true);
    try {
      const res = await proposalService.castVote(proposalId, optionIndex);
      // Update in local state
      setProposals(prev => prev.map(p => p._id === proposalId ? res.data.proposal : p));
      showToast('Your vote has been recorded!');
      setActionLoading(false);
      return true;
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to cast vote', 'error');
      setActionLoading(false);
      return false;
    }
  };

  const handleStatusChange = async (proposalId, status) => {
    setActionLoading(true);
    try {
      const res = await proposalService.updateStatus(proposalId, status);
      setProposals(prev => prev.map(p => p._id === proposalId ? res.data.proposal : p));
      const labels = { active: 'Proposal activated!', closed: 'Voting closed & result computed!', passed: 'Proposal passed!', rejected: 'Proposal rejected.' };
      showToast(labels[res.data.proposal.status] || 'Status updated!');
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to update status', 'error');
    }
    setActionLoading(false);
  };

  const handleDelete = async (proposalId) => {
    if (!window.confirm('Delete this draft proposal?')) return;
    try {
      await proposalService.deleteProposal(proposalId);
      setProposals(prev => prev.filter(p => p._id !== proposalId));
      showToast('Proposal deleted.');
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to delete', 'error');
    }
  };

  // Filter by search
  const filtered = proposals.filter(p =>
    !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase())
  );

  // Stats
  const stats = {
    total:    proposals.length,
    active:   proposals.filter(p => p.status === 'active').length,
    passed:   proposals.filter(p => p.status === 'passed').length,
    rejected: proposals.filter(p => p.status === 'rejected').length
  };

  return (
    <div className="proposals-page">
      {/* Toast */}
      {toast && (
        <div className={`proposals-toast proposals-toast--${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
          {toast.msg}
        </div>
      )}

      {/* Page Header */}
      <div className="proposals-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <div className="proposals-header-icon">
              <Vote size={22} color="#818cf8" />
            </div>
            <h1 className="proposals-title">Community Proposals</h1>
          </div>
          <p className="proposals-subtitle">Participate in community decisions through transparent voting</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button className="proposals-icon-btn" onClick={fetchProposals} title="Refresh" disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
          </button>
          {isAdmin && (
            <button id="new-proposal-btn" className="ch-btn-primary" onClick={() => setShowCreate(true)}>
              <Plus size={16} /> New Proposal
            </button>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="proposals-stats">
        {[
          { label: 'Total Proposals', val: stats.total,    color: '#6366f1' },
          { label: 'Active Voting',   val: stats.active,   color: '#3b82f6' },
          { label: 'Passed',          val: stats.passed,   color: '#10b981' },
          { label: 'Rejected',        val: stats.rejected, color: '#ef4444' }
        ].map(s => (
          <div key={s.label} className="proposals-stat-card" style={{ '--stat-color': s.color }}>
            <div className="proposals-stat-val">{s.val}</div>
            <div className="proposals-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs + Filters */}
      <div className="proposals-toolbar">
        <div className="proposals-tabs">
          {TABS.map(t => {
            const Icon = t.icon;
            const count = t.key === 'all' ? proposals.length : proposals.filter(p => p.status === t.key).length;
            return (
              <button
                key={t.key}
                className={`proposals-tab ${activeTab === t.key ? 'proposals-tab--active' : ''}`}
                onClick={() => setActiveTab(t.key)}
              >
                <Icon size={14} /> {t.label}
                {count > 0 && <span className="proposals-tab-count">{count}</span>}
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <div className="proposals-search">
            <Search size={14} />
            <input
              id="proposals-search"
              placeholder="Search proposals…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="proposals-filter">
            <Filter size={14} />
            <select
              id="proposals-category-filter"
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="proposals-empty">
          <div className="proposals-spinner" />
          <p>Loading proposals…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="proposals-empty">
          <Vote size={48} style={{ opacity: 0.2, marginBottom: 12 }} />
          <p style={{ fontWeight: 600, color: 'var(--ch-text-primary)' }}>No proposals found</p>
          <p style={{ fontSize: 13 }}>
            {isAdmin ? 'Create the first proposal to start community voting.' : 'No active proposals right now.'}
          </p>
          {isAdmin && (
            <button className="ch-btn-primary" style={{ marginTop: 16 }} onClick={() => setShowCreate(true)}>
              <Plus size={14} /> Create Proposal
            </button>
          )}
        </div>
      ) : (
        <div className="proposals-grid">
          {filtered.map(p => (
            <ProposalCard
              key={p._id}
              proposal={p}
              currentUser={user}
              onVote={setVoteProposal}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              onExpand={setVoteProposal}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreate && (
        <NewProposalModal
          onClose={() => setShowCreate(false)}
          onSubmit={handleCreate}
          loading={actionLoading}
        />
      )}
      {voteProposal && (
        <VoteModal
          proposal={voteProposal}
          currentUser={user}
          onClose={() => setVoteProposal(null)}
          onVote={handleVote}
          loading={actionLoading}
        />
      )}
    </div>
  );
};
