import React, { useState, useRef } from 'react';
import { X, FileText, Tag, Calendar, BarChart2, Users, AlertCircle, ImagePlus } from 'lucide-react';

const CATEGORIES = ['Infrastructure', 'Rules', 'Events', 'Finance', 'Other'];

export const NewProposalModal = ({ onClose, onSubmit, loading }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Other',
    votingDeadline: '',
    quorumPercent: 50,
    passThresholdPercent: 50,
    customOptions: '',
    status: 'draft'
  });
  const [attachments, setAttachments] = useState([]); // [{file, preview, name}]
  const [errors, setErrors] = useState({});
  const fileRef = useRef();

  const addFiles = (files) => {
    const remaining = 5 - attachments.length;
    const valid = [...files].slice(0, remaining).filter(f => f.type.startsWith('image/'));
    valid.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAttachments(prev => [...prev, { file, preview: e.target.result, name: file.name }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.votingDeadline) e.votingDeadline = 'Deadline is required';
    else if (new Date(form.votingDeadline) <= Date.now()) e.votingDeadline = 'Deadline must be in the future';
    if (form.quorumPercent < 1 || form.quorumPercent > 100) e.quorumPercent = '1–100%';
    if (form.passThresholdPercent < 1 || form.passThresholdPercent > 100) e.passThresholdPercent = '1–100%';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const options = form.customOptions
      ? form.customOptions.split(',').map(s => s.trim()).filter(Boolean)
      : [];
    onSubmit({ ...form, options }, attachments.map(a => a.file));
  };

  // Min datetime for the deadline picker = now + 1 hour
  const minDate = new Date(Date.now() + 3600000).toISOString().slice(0, 16);

  return (
    <div className="ch-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="ch-modal" style={{ maxWidth: 560, width: '100%' }}>
        {/* Header */}
        <div className="ch-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ background: '#6366f122', borderRadius: 8, padding: '6px 8px', display: 'flex' }}>
              <FileText size={18} color="#818cf8" />
            </span>
            <div>
              <h2 className="ch-modal-title">New Proposal</h2>
              <p style={{ color: 'var(--ch-text-muted)', fontSize: 12, marginTop: 2 }}>Create a community proposal for residents to vote on</p>
            </div>
          </div>
          <button className="ch-modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="ch-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Title */}
          <div className="ch-form-group">
            <label className="ch-form-label">Title *</label>
            <input
              id="proposal-title"
              className={`ch-form-input ${errors.title ? 'ch-form-input--error' : ''}`}
              placeholder="e.g. Install CCTV at main gate"
              value={form.title}
              onChange={e => set('title', e.target.value)}
            />
            {errors.title && <span className="ch-form-error">{errors.title}</span>}
          </div>

          {/* Description */}
          <div className="ch-form-group">
            <label className="ch-form-label">Description *</label>
            <textarea
              id="proposal-description"
              className={`ch-form-input ch-form-textarea ${errors.description ? 'ch-form-input--error' : ''}`}
              placeholder="Explain the proposal in detail, including rationale and expected impact..."
              rows={4}
              value={form.description}
              onChange={e => set('description', e.target.value)}
            />
            {errors.description && <span className="ch-form-error">{errors.description}</span>}
          </div>

          {/* Category + Deadline */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="ch-form-group">
              <label className="ch-form-label"><Tag size={12} style={{ marginRight: 4 }} />Category</label>
              <select id="proposal-category" className="ch-form-input ch-form-select" value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="ch-form-group">
              <label className="ch-form-label"><Calendar size={12} style={{ marginRight: 4 }} />Voting Deadline *</label>
              <input
                id="proposal-deadline"
                type="datetime-local"
                className={`ch-form-input ${errors.votingDeadline ? 'ch-form-input--error' : ''}`}
                min={minDate}
                value={form.votingDeadline}
                onChange={e => set('votingDeadline', e.target.value)}
              />
              {errors.votingDeadline && <span className="ch-form-error">{errors.votingDeadline}</span>}
            </div>
          </div>

          {/* Thresholds */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="ch-form-group">
              <label className="ch-form-label"><Users size={12} style={{ marginRight: 4 }} />Quorum % (min voters)</label>
              <input
                id="proposal-quorum"
                type="number" min={1} max={100}
                className={`ch-form-input ${errors.quorumPercent ? 'ch-form-input--error' : ''}`}
                value={form.quorumPercent}
                onChange={e => set('quorumPercent', Number(e.target.value))}
              />
            </div>
            <div className="ch-form-group">
              <label className="ch-form-label"><BarChart2 size={12} style={{ marginRight: 4 }} />Pass Threshold %</label>
              <input
                id="proposal-threshold"
                type="number" min={1} max={100}
                className={`ch-form-input ${errors.passThresholdPercent ? 'ch-form-input--error' : ''}`}
                value={form.passThresholdPercent}
                onChange={e => set('passThresholdPercent', Number(e.target.value))}
              />
            </div>
          </div>

          {/* Photo Attachments */}
          <div className="ch-form-group">
            <label className="ch-form-label">📷 Supporting Photos <span style={{ color: 'var(--ch-text-muted)', fontWeight: 400 }}>(optional, up to 5)</span></label>
            <div
              onClick={() => attachments.length < 5 && fileRef.current.click()}
              style={{
                border: '2px dashed var(--ch-card-border)',
                borderRadius: 10, padding: '14px 12px',
                textAlign: 'center', cursor: attachments.length < 5 ? 'pointer' : 'default',
                background: 'var(--ch-body-bg)',
              }}
            >
              <ImagePlus size={22} style={{ opacity: 0.35, margin: '0 auto 6px', display: 'block' }} />
              <p style={{ fontSize: 12, color: 'var(--ch-text-muted)', margin: 0 }}>
                {attachments.length >= 5
                  ? 'Max 5 photos reached'
                  : <><span style={{ color: '#6366f1', fontWeight: 700 }}>Click to upload</span> photos ({attachments.length}/5)</>}
              </p>
              <input ref={fileRef} type="file" multiple accept="image/*" style={{ display: 'none' }}
                onChange={e => addFiles(e.target.files)} />
            </div>
            {attachments.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                {attachments.map((a, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={a.preview} alt={a.name}
                      style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, border: '2px solid var(--ch-card-border)' }} />
                    <button type="button"
                      onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                      style={{
                        position: 'absolute', top: -6, right: -6, width: 18, height: 18,
                        borderRadius: '50%', background: '#ef4444', border: '2px solid #fff',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0
                      }}>
                      <X size={9} color="#fff" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Custom options */}
          <div className="ch-form-group">
            <label className="ch-form-label">Custom Vote Options <span style={{ color: 'var(--ch-text-muted)', fontWeight: 400 }}>(optional, comma-separated)</span></label>
            <input
              id="proposal-options"
              className="ch-form-input"
              placeholder="Leave blank for Yes, No, Abstain"
              value={form.customOptions}
              onChange={e => set('customOptions', e.target.value)}
            />
            <span style={{ fontSize: 11, color: 'var(--ch-text-muted)', marginTop: 4, display: 'block' }}>e.g. Option A, Option B, Option C</span>
          </div>

          {/* Status toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, background: 'var(--ch-nav-hover-bg)', border: '1px solid var(--ch-card-border)' }}>
            <AlertCircle size={16} color="#f59e0b" />
            <span style={{ fontSize: 13, color: 'var(--ch-text-muted)', flex: 1 }}>
              Publish immediately and open for voting?
            </span>
            <label className="proposal-toggle">
              <input
                id="proposal-publish-toggle"
                type="checkbox"
                checked={form.status === 'active'}
                onChange={e => set('status', e.target.checked ? 'active' : 'draft')}
              />
              <span className="proposal-toggle__track" />
            </label>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
            <button type="button" className="ch-btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" id="proposal-submit-btn" className="ch-btn-primary" disabled={loading}>
              {loading ? 'Creating…' : form.status === 'active' ? 'Create & Publish' : 'Save as Draft'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
