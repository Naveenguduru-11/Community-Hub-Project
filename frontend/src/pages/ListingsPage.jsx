import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { listingService } from '../services/api';
import {
  Home, Plus, Edit2, Trash2, X, Search, Eye, Heart,
  Phone, Mail, MapPin, IndianRupee, Maximize2, BedDouble,
  CheckCircle2, Clock, Tag, Star, TrendingUp, Building2,
  Filter, RefreshCw, Share2, ChevronRight, Zap, Shield, Camera, ImagePlus
} from 'lucide-react';

// ─── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) => {
  if (!n) return '₹0';
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(1)} L`;
  return `₹${n.toLocaleString('en-IN')}`;
};

const STATUS_CFG = {
  AVAILABLE: { bg: '#10b98118', text: '#34d399', border: '#10b98144', label: 'Available', dot: '#10b981' },
  RESERVED:  { bg: '#f59e0b18', text: '#fbbf24', border: '#f59e0b44', label: 'Reserved',  dot: '#f59e0b' },
  SOLD:      { bg: '#ef444418', text: '#f87171', border: '#ef444444', label: 'Sold',       dot: '#ef4444' },
};

const TYPE_CFG = {
  APARTMENT:  { label: 'Apartment',  color: '#6366f1' },
  VILLA:      { label: 'Villa',      color: '#10b981' },
  DUPLEX:     { label: 'Duplex',     color: '#f59e0b' },
  PENTHOUSE:  { label: 'Penthouse',  color: '#a78bfa' },
  STUDIO:     { label: 'Studio',     color: '#38bdf8' },
};

const AMENITY_ICONS = {
  'Swimming Pool': '🏊', 'Gym': '🏋️', 'Clubhouse': '🏛️', 'Park': '🌳',
  'Security': '🛡️', '24x7 Security': '🛡️', 'Power Backup': '⚡',
  'Covered Parking': '🚗', 'Garden': '🌿', 'Children\'s Play Area': '🛝',
  'Concierge': '🎩', 'Spa': '💆', 'Smart Home': '🏠', 'Private Lift': '🛗',
  'Private Terrace': '🌇', 'Pool': '🏊', 'Home Automation': '📱',
};

const DEFAULT_AMENITIES = ['Swimming Pool','Gym','Clubhouse','24x7 Security','Power Backup','Covered Parking','Garden','Children\'s Play Area','Park'];

const BLANK_FORM = {
  title: '', description: '', villaNumber: '', block: '', type: 'APARTMENT',
  bhk: '3 BHK', area: '', floor: '', facing: 'East',
  price: '', priceNegotiable: false, maintenanceCharge: '',
  status: 'AVAILABLE', listingType: 'SALE',
  amenities: [], highlights: '',
  contactName: '', contactPhone: '', contactEmail: '',
  visibleToResidents: true
};

// ─── Property Card ──────────────────────────────────────────────────────────
function PropertyCard({ listing, isAdmin, onEdit, onDelete, onInterest, interested }) {
  const st = STATUS_CFG[listing.status] || STATUS_CFG.AVAILABLE;
  const tp = TYPE_CFG[listing.type] || TYPE_CFG.APARTMENT;

  return (
    <div className="listing-card">
      {/* Cover image or color band */}
      <div className="listing-card__band" style={{
        background: listing.images?.[0]
          ? 'transparent'
          : `linear-gradient(135deg, ${tp.color}33, ${tp.color}11)`,
        position: 'relative', overflow: 'hidden'
      }}>
        {listing.images?.[0] ? (
          <img
            src={listing.images[0]}
            alt={listing.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div className="listing-card__band-inner">
            <Building2 size={40} color={tp.color} style={{ opacity: 0.4 }} />
          </div>
        )}
        {listing.images?.length > 1 && (
          <span style={{
            position: 'absolute', bottom: 8, right: 8, fontSize: 10, fontWeight: 700,
            background: 'rgba(0,0,0,0.6)', color: '#fff', borderRadius: 6, padding: '2px 7px',
          }}>📷 {listing.images.length}</span>
        )}
        {/* Badges */}
        <div className="listing-card__badges">
          <span className="listing-badge" style={{ background: tp.color + '22', color: tp.color, border: `1px solid ${tp.color}44` }}>
            {tp.label}
          </span>
          <span className="listing-badge listing-badge--sale">
            {listing.listingType === 'RENT' ? 'For Rent' : 'For Sale'}
          </span>
        </div>
        <div className="listing-card__status-dot">
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: st.dot, display: 'inline-block' }} />

          <span style={{ fontSize: 11, fontWeight: 700, color: st.text }}>{st.label}</span>
        </div>
      </div>

      <div className="listing-card__body">
        {/* Villa number chip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ch-text-muted)', fontFamily: 'monospace',
            background: 'var(--ch-nav-hover-bg)', padding: '2px 8px', borderRadius: 20, border: '1px solid var(--ch-card-border)' }}>
            {listing.villaNumber}{listing.block ? ` · ${listing.block}` : ''}
          </span>
          {listing.priceNegotiable && (
            <span style={{ fontSize: 10, color: '#fbbf24', background: '#f59e0b11', border: '1px solid #f59e0b33', padding: '2px 6px', borderRadius: 20, fontWeight: 700 }}>
              Negotiable
            </span>
          )}
        </div>

        <h3 className="listing-card__title">{listing.title}</h3>
        <p className="listing-card__desc">{listing.description}</p>

        {/* Key specs */}
        <div className="listing-card__specs">
          <div className="listing-spec"><BedDouble size={13} />{listing.bhk}</div>
          {listing.area > 0 && <div className="listing-spec"><Maximize2 size={13} />{listing.area.toLocaleString()} sq ft</div>}
          {listing.floor && <div className="listing-spec"><Building2 size={13} />{listing.floor}</div>}
          {listing.facing && <div className="listing-spec"><MapPin size={13} />{listing.facing}</div>}
        </div>

        {/* Amenities */}
        {listing.amenities?.length > 0 && (
          <div className="listing-card__amenities">
            {listing.amenities.slice(0, 5).map(a => (
              <span key={a} className="listing-amenity-chip">
                {AMENITY_ICONS[a] || '✓'} {a}
              </span>
            ))}
            {listing.amenities.length > 5 && (
              <span className="listing-amenity-chip">+{listing.amenities.length - 5} more</span>
            )}
          </div>
        )}

        {/* Highlights */}
        {listing.highlights?.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
            {listing.highlights.slice(0, 3).map(h => (
              <span key={h} style={{ fontSize: 10, fontWeight: 700, color: '#818cf8',
                background: '#6366f111', border: '1px solid #6366f133', padding: '2px 7px', borderRadius: 20 }}>
                ⭐ {h}
              </span>
            ))}
          </div>
        )}

        {/* Price */}
        <div className="listing-card__price-row">
          <div>
            <div style={{ fontSize: 10, color: 'var(--ch-text-muted)', fontWeight: 600, marginBottom: 2 }}>
              {listing.listingType === 'RENT' ? 'Monthly Rent' : 'Sale Price'}
            </div>
            <div className="listing-card__price">{fmt(listing.price)}</div>
            {listing.maintenanceCharge > 0 && (
              <div style={{ fontSize: 11, color: 'var(--ch-text-muted)' }}>
                +₹{listing.maintenanceCharge.toLocaleString('en-IN')}/mo maintenance
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ textAlign: 'right', fontSize: 11, color: 'var(--ch-text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Eye size={12} /> {listing.views || 0} views</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Heart size={12} /> {listing.interestedCount || 0} interested</div>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="listing-card__contact">
          {listing.contactPhone && (
            <a href={`tel:${listing.contactPhone}`} className="listing-contact-btn listing-contact-btn--phone">
              <Phone size={12} /> {listing.contactPhone}
            </a>
          )}
          {listing.contactEmail && (
            <a href={`mailto:${listing.contactEmail}`} className="listing-contact-btn listing-contact-btn--email">
              <Mail size={12} /> Contact
            </a>
          )}
        </div>

        {/* Actions */}
        <div className="listing-card__actions">
          {isAdmin ? (
            <>
              <button className="listing-btn listing-btn--edit" onClick={() => onEdit(listing)}>
                <Edit2 size={12} /> Edit
              </button>
              <button className="listing-btn listing-btn--del" onClick={() => onDelete(listing._id, listing.title)}>
                <Trash2 size={12} /> Remove
              </button>
              <div style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--ch-text-muted)' }}>
                {listing.visibleToResidents
                  ? <span style={{ color: '#34d399' }}>● Visible to residents</span>
                  : <span style={{ color: '#f87171' }}>● Hidden</span>}
              </div>
            </>
          ) : (
            <>
              <button
                className={`listing-btn ${interested ? 'listing-btn--interested' : 'listing-btn--interest'}`}
                onClick={() => !interested && onInterest(listing._id)}
                disabled={interested || listing.status === 'SOLD'}
              >
                <Heart size={12} fill={interested ? 'currentColor' : 'none'} />
                {interested ? 'Interested ✓' : 'I\'m Interested'}
              </button>
              <a href={`tel:${listing.contactPhone}`} className="listing-btn listing-btn--call">
                <Phone size={12} /> Call Now
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export const ListingsPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'COMMUNITY_ADMIN';

  const [listings, setListings]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState('');
  const [filterType, setFilterType]       = useState('ALL');
  const [filterStatus, setFilterStatus]   = useState('ALL');
  const [filterListingType, setFilterListingType] = useState('ALL');
  const [showForm, setShowForm]           = useState(false);
  const [editingListing, setEditingListing] = useState(null);
  const [form, setForm]                   = useState(BLANK_FORM);
  const [interested, setInterested]       = useState(new Set());
  const [toast, setToast]                 = useState(null);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [imageFiles, setImageFiles]       = useState([]); // [{file, preview}]
  const imgFileRef = useRef();

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listingService.getListings();
      setListings(res.data.listings || []);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  // Filtered listings
  const filtered = listings.filter(l => {
    const matchSearch = !search ||
      l.title?.toLowerCase().includes(search.toLowerCase()) ||
      l.villaNumber?.toLowerCase().includes(search.toLowerCase()) ||
      l.block?.toLowerCase().includes(search.toLowerCase()) ||
      l.bhk?.toLowerCase().includes(search.toLowerCase());
    const matchType    = filterType    === 'ALL' || l.type === filterType;
    const matchStatus  = filterStatus  === 'ALL' || l.status === filterStatus;
    const matchListing = filterListingType === 'ALL' || l.listingType === filterListingType;
    return matchSearch && matchType && matchStatus && matchListing;
  });

  // Stats
  const totalAvailable = listings.filter(l => l.status === 'AVAILABLE').length;
  const totalSold      = listings.filter(l => l.status === 'SOLD').length;
  const totalReserved  = listings.filter(l => l.status === 'RESERVED').length;
  const totalViews     = listings.reduce((s, l) => s + (l.views || 0), 0);

  // Open form
  const openCreate = () => {
    setEditingListing(null);
    setForm({ ...BLANK_FORM, contactName: user?.name || '', contactEmail: user?.email || '' });
    setSelectedAmenities([]);
    setImageFiles([]);
    setShowForm(true);
  };

  const openEdit = (listing) => {
    setEditingListing(listing);
    setForm({
      title: listing.title, description: listing.description || '',
      villaNumber: listing.villaNumber, block: listing.block || '',
      type: listing.type, bhk: listing.bhk, area: listing.area,
      floor: listing.floor || '', facing: listing.facing || '',
      price: listing.price, priceNegotiable: listing.priceNegotiable,
      maintenanceCharge: listing.maintenanceCharge || '',
      status: listing.status, listingType: listing.listingType,
      amenities: listing.amenities || [], highlights: (listing.highlights || []).join(', '),
      contactName: listing.contactName || '', contactPhone: listing.contactPhone || '',
      contactEmail: listing.contactEmail || '', visibleToResidents: listing.visibleToResidents !== false
    });
    setSelectedAmenities(listing.amenities || []);
    setImageFiles([]);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        amenities: selectedAmenities,
        highlights: form.highlights ? form.highlights.split(',').map(h => h.trim()).filter(Boolean) : []
      };
      let savedId;
      if (editingListing) {
        await listingService.updateListing(editingListing._id, payload);
        savedId = editingListing._id;
        showToast('Listing updated successfully!');
      } else {
        const res = await listingService.createListing(payload);
        savedId = res.data.listing?._id;
        showToast('Listing posted successfully!');
      }
      // Upload images if any
      if (imageFiles.length > 0 && savedId) {
        try {
          await listingService.uploadImages(savedId, imageFiles.map(i => i.file));
        } catch (err) {
          console.warn('Image upload failed:', err);
        }
      }
      setShowForm(false);
      fetchListings();
    } catch {
      showToast('Failed to save listing. Try again.', 'error');
    }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Remove listing "${title}"?`)) return;
    try {
      await listingService.deleteListing(id);
      showToast('Listing removed.');
      fetchListings();
    } catch { showToast('Failed to remove listing.', 'error'); }
  };

  const handleInterest = async (id) => {
    try {
      await listingService.expressInterest(id);
      setInterested(prev => new Set([...prev, id]));
      setListings(ls => ls.map(l => l._id === id ? { ...l, interestedCount: (l.interestedCount || 0) + 1 } : l));
      showToast('Your interest has been noted! The admin will contact you.');
    } catch { showToast('Could not register interest.', 'error'); }
  };

  const toggleAmenity = (a) => {
    setSelectedAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  };

  return (
    <div className="listings-page">

      {/* Header */}
      <div className="listings-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="listings-header-icon">
            <Home size={22} color="#818cf8" />
          </div>
          <div>
            <h1 className="listings-title">
              {isAdmin ? 'Property Listings — Manage & Sell' : 'Available Properties for Sale / Rent'}
            </h1>
            <p className="listings-subtitle">
              {isAdmin
                ? 'Post available apartments, villas, and units for sale or rent. Listings are visible to all residents.'
                : 'Browse properties in your community available for sale or rent. Express interest to get connected.'}
            </p>
          </div>
        </div>
        {isAdmin && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="proposals-icon-btn" onClick={fetchListings} title="Refresh"><RefreshCw size={15} /></button>
            <button id="post-listing-btn" className="ch-btn-primary" onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Plus size={14} /> Post New Listing
            </button>
          </div>
        )}
      </div>

      {/* Admin stats */}
      {isAdmin && (
        <div className="listings-stats">
          <div className="listings-stat" style={{ '--sc': '#10b981' }}>
            <CheckCircle2 size={18} color="#10b981" />
            <div><div className="listings-stat-val">{totalAvailable}</div><div className="listings-stat-label">Available</div></div>
          </div>
          <div className="listings-stat" style={{ '--sc': '#f59e0b' }}>
            <Clock size={18} color="#f59e0b" />
            <div><div className="listings-stat-val">{totalReserved}</div><div className="listings-stat-label">Reserved</div></div>
          </div>
          <div className="listings-stat" style={{ '--sc': '#ef4444' }}>
            <Tag size={18} color="#ef4444" />
            <div><div className="listings-stat-val">{totalSold}</div><div className="listings-stat-label">Sold</div></div>
          </div>
          <div className="listings-stat" style={{ '--sc': '#818cf8' }}>
            <Eye size={18} color="#818cf8" />
            <div><div className="listings-stat-val">{totalViews}</div><div className="listings-stat-label">Total Views</div></div>
          </div>
        </div>
      )}

      {/* Resident notice banner */}
      {!isAdmin && (
        <div className="listings-resident-banner">
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Shield size={18} color="#818cf8" />
            <div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>Community-Verified Listings</div>
              <div style={{ fontSize: 12, color: 'var(--ch-text-muted)' }}>
                All properties listed here are managed by your community administrator. Click "I'm Interested" and the admin will contact you directly.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="listings-filters">
        <div className="proposals-search" style={{ flex: 1, minWidth: 180 }}>
          <Search size={14} />
          <input id="listing-search" placeholder="Search by villa, block, BHK…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="proposals-filter">
          <Filter size={13} />
          <select id="listing-filter-type" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="ALL">All Types</option>
            <option value="APARTMENT">Apartment</option>
            <option value="VILLA">Villa</option>
            <option value="DUPLEX">Duplex</option>
            <option value="PENTHOUSE">Penthouse</option>
            <option value="STUDIO">Studio</option>
          </select>
        </div>
        <div className="proposals-filter">
          <select id="listing-filter-listing-type" value={filterListingType} onChange={e => setFilterListingType(e.target.value)}>
            <option value="ALL">Sale & Rent</option>
            <option value="SALE">For Sale</option>
            <option value="RENT">For Rent</option>
          </select>
        </div>
        {isAdmin && (
          <div className="proposals-filter">
            <select id="listing-filter-status" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="ALL">All Status</option>
              <option value="AVAILABLE">Available</option>
              <option value="RESERVED">Reserved</option>
              <option value="SOLD">Sold</option>
            </select>
          </div>
        )}
      </div>

      {/* Listings grid */}
      {loading ? (
        <div className="proposals-empty">
          <div className="proposals-spinner" />
          <p>Loading property listings…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="proposals-empty">
          <Home size={48} style={{ opacity: 0.12, marginBottom: 12 }} />
          <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--ch-text-primary)' }}>
            {listings.length === 0 ? 'No properties listed yet' : 'No listings match your filters'}
          </p>
          <p style={{ fontSize: 13, color: 'var(--ch-text-muted)', maxWidth: 340, textAlign: 'center' }}>
            {isAdmin
              ? 'Click "Post New Listing" to add an available apartment or villa for sale or rent.'
              : 'No properties are currently listed. Check back soon!'}
          </p>
          {isAdmin && (
            <button className="ch-btn-primary" style={{ marginTop: 16 }} onClick={openCreate}>
              <Plus size={13} /> Post First Listing
            </button>
          )}
        </div>
      ) : (
        <div className="listings-grid">
          {filtered.map(l => (
            <PropertyCard
              key={l._id}
              listing={l}
              isAdmin={isAdmin}
              onEdit={openEdit}
              onDelete={handleDelete}
              onInterest={handleInterest}
              interested={interested.has(l._id)}
            />
          ))}
        </div>
      )}

      {/* ── POST / EDIT LISTING MODAL ── */}
      {showForm && (
        <div className="ch-modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="ch-modal listings-modal">
            <div className="ch-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ background: '#6366f122', padding: '7px 9px', borderRadius: 10, display: 'flex' }}>
                  <Home size={18} color="#818cf8" />
                </span>
                <div>
                  <h2 className="ch-modal-title">{editingListing ? 'Edit Listing' : 'Post New Property Listing'}</h2>
                  <p style={{ fontSize: 12, color: 'var(--ch-text-muted)', margin: 0 }}>
                    {editingListing ? 'Update property details below' : 'Fill in the property details to post a listing visible to all residents'}
                  </p>
                </div>
              </div>
              <button className="ch-modal-close" onClick={() => setShowForm(false)}><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className="ch-modal-body listings-form">
              {/* Section: Photos */}
              <div className="listings-form-section">
                <div className="listings-form-section-label">📷 Property Photos</div>
                <div className="ch-form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="ch-form-label">Upload Photos (up to 10) — first photo is the cover</label>
                  <div
                    onClick={() => imageFiles.length < 10 && imgFileRef.current.click()}
                    style={{
                      border: '2px dashed var(--ch-card-border)', borderRadius: 12,
                      padding: '16px', textAlign: 'center',
                      cursor: imageFiles.length < 10 ? 'pointer' : 'default',
                      background: 'var(--ch-body-bg)', transition: 'all 0.2s',
                    }}
                  >
                    <Camera size={24} style={{ opacity: 0.35, margin: '0 auto 6px', display: 'block' }} />
                    <p style={{ fontSize: 12, color: 'var(--ch-text-muted)', margin: 0 }}>
                      {imageFiles.length >= 10
                        ? 'Max 10 photos reached'
                        : <><span style={{ color: '#6366f1', fontWeight: 700 }}>Click to upload</span> property photos ({imageFiles.length}/10)</>}
                    </p>
                    <input
                      ref={imgFileRef} type="file" multiple accept="image/*" style={{ display: 'none' }}
                      onChange={e => {
                        const remaining = 10 - imageFiles.length;
                        const files = [...e.target.files].slice(0, remaining).filter(f => f.type.startsWith('image/'));
                        files.forEach(file => {
                          const reader = new FileReader();
                          reader.onload = ev => setImageFiles(prev => [...prev, { file, preview: ev.target.result }]);
                          reader.readAsDataURL(file);
                        });
                      }}
                    />
                  </div>
                  {imageFiles.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                      {imageFiles.map((img, i) => (
                        <div key={i} style={{ position: 'relative', width: 72, height: 72 }}>
                          <img src={img.preview} alt="" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 10, border: `2px solid ${i===0 ? '#6366f1' : 'var(--ch-card-border)'}` }} />
                          {i === 0 && <span style={{ position:'absolute', bottom:2, left:2, fontSize:9, fontWeight:800, background:'#6366f1', color:'#fff', borderRadius:4, padding:'1px 4px' }}>Cover</span>}
                          <button type="button"
                            onClick={() => setImageFiles(prev => prev.filter((_, idx) => idx !== i))}
                            style={{ position:'absolute', top:-6, right:-6, width:20, height:20, borderRadius:'50%', background:'#ef4444', border:'2px solid #fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', padding:0 }}>
                            <X size={10} color="#fff" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {editingListing?.images?.length > 0 && (
                    <div style={{ marginTop: 8, fontSize: 12, color: 'var(--ch-text-muted)' }}>
                      ℹ️ Existing photos: {editingListing.images.length} — new uploads will be added
                    </div>
                  )}
                </div>
              </div>

              {/* Section: Basic */}
              <div className="listings-form-section">
                <div className="listings-form-section-label">📋 Basic Information</div>
                <div className="ch-form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="ch-form-label">Listing Title *</label>
                  <input id="form-title" className="ch-form-input" placeholder="e.g. Spacious 3 BHK Corner Villa with Lake View"
                    value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                </div>
                <div className="ch-form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="ch-form-label">Description</label>
                  <textarea className="ch-form-input" rows={3} placeholder="Describe the property — layout, condition, unique features…"
                    style={{ resize: 'vertical', minHeight: 72 }}
                    value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
              </div>


              {/* Section: Property Details */}
              <div className="listings-form-section">
                <div className="listings-form-section-label">🏠 Property Details</div>
                <div className="ch-form-group">
                  <label className="ch-form-label">Villa / Unit No *</label>
                  <input id="form-villa" className="ch-form-input" placeholder="e.g. V-207"
                    value={form.villaNumber} onChange={e => setForm(f => ({ ...f, villaNumber: e.target.value }))} required />
                </div>
                <div className="ch-form-group">
                  <label className="ch-form-label">Block / Tower</label>
                  <input className="ch-form-input" placeholder="e.g. Block B"
                    value={form.block} onChange={e => setForm(f => ({ ...f, block: e.target.value }))} />
                </div>
                <div className="ch-form-group">
                  <label className="ch-form-label">Property Type</label>
                  <select className="ch-form-input ch-form-select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                    <option value="APARTMENT">Apartment</option>
                    <option value="VILLA">Villa</option>
                    <option value="DUPLEX">Duplex</option>
                    <option value="PENTHOUSE">Penthouse</option>
                    <option value="STUDIO">Studio</option>
                  </select>
                </div>
                <div className="ch-form-group">
                  <label className="ch-form-label">Configuration (BHK)</label>
                  <select className="ch-form-input ch-form-select" value={form.bhk} onChange={e => setForm(f => ({ ...f, bhk: e.target.value }))}>
                    {['Studio','1 BHK','1.5 BHK','2 BHK','2.5 BHK','3 BHK','3.5 BHK','4 BHK','4+ BHK'].map(b =>
                      <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="ch-form-group">
                  <label className="ch-form-label">Area (sq ft)</label>
                  <input type="number" min={0} className="ch-form-input" placeholder="e.g. 1850"
                    value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))} />
                </div>
                <div className="ch-form-group">
                  <label className="ch-form-label">Floor</label>
                  <input className="ch-form-input" placeholder="e.g. 3rd Floor"
                    value={form.floor} onChange={e => setForm(f => ({ ...f, floor: e.target.value }))} />
                </div>
                <div className="ch-form-group">
                  <label className="ch-form-label">Facing</label>
                  <select className="ch-form-input ch-form-select" value={form.facing} onChange={e => setForm(f => ({ ...f, facing: e.target.value }))}>
                    {['East','West','North','South','North-East','North-West','South-East','South-West','All Sides'].map(d =>
                      <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              {/* Section: Pricing */}
              <div className="listings-form-section">
                <div className="listings-form-section-label">💰 Pricing</div>
                <div className="ch-form-group">
                  <label className="ch-form-label">Listing Type</label>
                  <select className="ch-form-input ch-form-select" value={form.listingType} onChange={e => setForm(f => ({ ...f, listingType: e.target.value }))}>
                    <option value="SALE">For Sale</option>
                    <option value="RENT">For Rent</option>
                  </select>
                </div>
                <div className="ch-form-group">
                  <label className="ch-form-label">{form.listingType === 'RENT' ? 'Monthly Rent (₹) *' : 'Sale Price (₹) *'}</label>
                  <input id="form-price" type="number" min={1} className="ch-form-input" placeholder="e.g. 8500000"
                    value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required />
                </div>
                <div className="ch-form-group">
                  <label className="ch-form-label">Maintenance (₹/mo)</label>
                  <input type="number" min={0} className="ch-form-input" placeholder="e.g. 4500"
                    value={form.maintenanceCharge} onChange={e => setForm(f => ({ ...f, maintenanceCharge: e.target.value }))} />
                </div>
                <div className="ch-form-group">
                  <label className="ch-form-label">Status</label>
                  <select className="ch-form-input ch-form-select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                    <option value="AVAILABLE">Available</option>
                    <option value="RESERVED">Reserved</option>
                    <option value="SOLD">Sold</option>
                  </select>
                </div>
                <div className="ch-form-group" style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 24 }}>
                  <label className="proposal-toggle" title="Price negotiable">
                    <input type="checkbox" checked={form.priceNegotiable} onChange={e => setForm(f => ({ ...f, priceNegotiable: e.target.checked }))} />
                    <span className="proposal-toggle__track" />
                  </label>
                  <span style={{ fontSize: 13, color: 'var(--ch-text-muted)' }}>Price Negotiable</span>
                </div>
                <div className="ch-form-group" style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 24 }}>
                  <label className="proposal-toggle" title="Visible to residents">
                    <input type="checkbox" checked={form.visibleToResidents} onChange={e => setForm(f => ({ ...f, visibleToResidents: e.target.checked }))} />
                    <span className="proposal-toggle__track" />
                  </label>
                  <span style={{ fontSize: 13, color: 'var(--ch-text-muted)' }}>Visible to Residents</span>
                </div>
              </div>

              {/* Section: Amenities */}
              <div className="listings-form-section" style={{ gridColumn: '1/-1' }}>
                <div className="listings-form-section-label">🏊 Amenities</div>
                <div className="listings-amenity-grid">
                  {DEFAULT_AMENITIES.map(a => (
                    <button key={a} type="button"
                      onClick={() => toggleAmenity(a)}
                      className={`listings-amenity-toggle ${selectedAmenities.includes(a) ? 'listings-amenity-toggle--on' : ''}`}
                    >
                      {AMENITY_ICONS[a] || '✓'} {a}
                    </button>
                  ))}
                </div>
                <div className="ch-form-group" style={{ marginTop: 10 }}>
                  <label className="ch-form-label">Key Highlights (comma-separated)</label>
                  <input className="ch-form-input" placeholder="e.g. Corner Villa, Vastu Compliant, Ready to Move"
                    value={form.highlights} onChange={e => setForm(f => ({ ...f, highlights: e.target.value }))} />
                </div>
              </div>

              {/* Section: Contact */}
              <div className="listings-form-section">
                <div className="listings-form-section-label">📞 Contact Details</div>
                <div className="ch-form-group">
                  <label className="ch-form-label">Contact Name</label>
                  <input className="ch-form-input" placeholder="Property Manager"
                    value={form.contactName} onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))} />
                </div>
                <div className="ch-form-group">
                  <label className="ch-form-label">Contact Phone</label>
                  <input className="ch-form-input" placeholder="+91 9876543210"
                    value={form.contactPhone} onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))} />
                </div>
                <div className="ch-form-group">
                  <label className="ch-form-label">Contact Email</label>
                  <input type="email" className="ch-form-input" placeholder="sales@community.in"
                    value={form.contactEmail} onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))} />
                </div>
              </div>

              {/* Submit */}
              <div style={{ gridColumn: '1/-1', display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid var(--ch-card-border)' }}>
                <button type="button" className="ch-btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" id="form-submit" className="ch-btn-primary">
                  {editingListing ? 'Save Changes' : 'Post Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`proposals-toast proposals-toast--${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle2 size={15} /> : <X size={15} />}
          {toast.msg}
        </div>
      )}
    </div>
  );
};
