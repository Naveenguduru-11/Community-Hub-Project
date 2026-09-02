import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { marketplaceService } from '../services/api';
import {
  Search, Plus, X, Heart, Flag, MessageCircle, Tag,
  Filter, SortAsc, Package, ChevronDown, ChevronLeft,
  Edit3, Trash2, CheckCircle, Clock, AlertCircle,
  Camera, Star, TrendingUp, ShoppingBag, Loader2, Eye,
  Upload, ImagePlus, XCircle
} from 'lucide-react';

/* ── Constants ──────────────────────────────────────────────── */
const CATEGORIES = [
  { id:'all',        label:'All',           emoji:'🏠' },
  { id:'furniture',  label:'Furniture',     emoji:'🛋️' },
  { id:'electronics',label:'Electronics',   emoji:'📱' },
  { id:'appliances', label:'Appliances',    emoji:'🏠' },
  { id:'kitchen',    label:'Kitchen',       emoji:'🍳' },
  { id:'computers',  label:'Computers',     emoji:'💻' },
  { id:'vehicles',   label:'Vehicles',      emoji:'🚗' },
  { id:'books',      label:'Books',         emoji:'📚' },
  { id:'sports',     label:'Sports',        emoji:'⚽' },
  { id:'kids',       label:'Kids & Baby',   emoji:'🧸' },
  { id:'decor',      label:'Home Decor',    emoji:'🖼️' },
  { id:'clothing',   label:'Clothing',      emoji:'👕' },
  { id:'services',   label:'Services',      emoji:'🔧' },
  { id:'other',      label:'Other',         emoji:'📦' },
];

const CONDITIONS = ['All', 'New', 'Like New', 'Good', 'Used'];
const SORT_OPTIONS = [
  { value:'newest',    label:'Newest First' },
  { value:'price_asc', label:'Price: Low → High' },
  { value:'price_desc',label:'Price: High → Low' },
];

const STATUS_STYLE = {
  Available: { bg:'#d1fae5', color:'#065f46' },
  Sold:      { bg:'#fee2e2', color:'#991b1b' },
  Reserved:  { bg:'#fef3c7', color:'#92400e' },
};

const inp = {
  padding:'9px 12px', borderRadius:10, border:'1px solid var(--ch-card-border)',
  background:'var(--ch-body-bg)', color:'var(--ch-text-primary)',
  fontSize:13, fontFamily:'inherit', width:'100%', outline:'none', boxSizing:'border-box',
};
const btnPrimary = {
  display:'inline-flex', alignItems:'center', gap:7, padding:'10px 18px',
  borderRadius:10, background:'#6366f1', color:'#fff',
  fontWeight:700, fontSize:13, border:'none', cursor:'pointer',
};
const btnSecondary = {
  display:'inline-flex', alignItems:'center', gap:7, padding:'9px 16px',
  borderRadius:10, background:'var(--ch-body-bg)', color:'var(--ch-text-primary)',
  fontWeight:600, fontSize:13, border:'1px solid var(--ch-card-border)', cursor:'pointer',
};
const cardS = {
  background:'var(--ch-card-bg)', border:'1px solid var(--ch-card-border)',
  borderRadius:16, overflow:'hidden', cursor:'pointer',
  transition:'transform 0.18s, box-shadow 0.18s',
};

function timeAgo(iso) {
  if (!iso) return '';
  const d = (Date.now() - new Date(iso)) / 1000;
  if (d < 3600) return `${Math.round(d/60)}m ago`;
  if (d < 86400) return `${Math.round(d/3600)}h ago`;
  return `${Math.round(d/86400)}d ago`;
}

/* ── Image Uploader Component ─────────────────────────────── */
function ImageUploader({ images, onChange, max = 5 }) {
  const fileRef = useRef();
  const [dragging, setDragging] = useState(false);

  const addFiles = (files) => {
    const remaining = max - images.length;
    const valid = [...files].slice(0, remaining).filter(f => f.type.startsWith('image/'));
    if (!valid.length) return;
    valid.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        onChange(prev => [...prev, { file, preview: e.target.result }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const removeImage = (i) => onChange(prev => prev.filter((_, idx) => idx !== i));

  return (
    <div>
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => images.length < max && fileRef.current.click()}
        style={{
          border: `2px dashed ${dragging ? '#6366f1' : 'var(--ch-card-border)'}`,
          borderRadius: 12, padding: '20px 16px',
          textAlign: 'center', cursor: images.length < max ? 'pointer' : 'default',
          background: dragging ? '#f0f0ff' : 'var(--ch-body-bg)',
          transition: 'all 0.2s',
        }}
      >
        <ImagePlus size={28} style={{ opacity: 0.4, margin: '0 auto 8px', display: 'block' }} />
        <p style={{ fontSize: 12, color: 'var(--ch-text-muted)', margin: 0 }}>
          {images.length >= max
            ? `Max ${max} photos reached`
            : <>Drop photos here or <span style={{ color: '#6366f1', fontWeight: 700 }}>browse</span> ({images.length}/{max})</>}
        </p>
        <input
          ref={fileRef} type="file" multiple accept="image/*" style={{ display: 'none' }}
          onChange={e => addFiles(e.target.files)}
        />
      </div>
      {images.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
          {images.map((img, i) => (
            <div key={i} style={{ position: 'relative', width: 72, height: 72 }}>
              <img
                src={img.preview || img}
                alt=""
                style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 10, border: '2px solid var(--ch-card-border)' }}
              />
              {i === 0 && (
                <span style={{
                  position: 'absolute', bottom: 2, left: 2, fontSize: 9, fontWeight: 800,
                  background: '#6366f1', color: '#fff', borderRadius: 4, padding: '1px 4px'
                }}>Cover</span>
              )}
              <button
                type="button"
                onClick={() => removeImage(i)}
                style={{
                  position: 'absolute', top: -6, right: -6, width: 20, height: 20,
                  borderRadius: '50%', background: '#ef4444', border: '2px solid #fff',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0
                }}
              >
                <X size={10} color="#fff" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════ */
export const MarketplacePage = () => {
  const { user } = useAuth();
  const [listings, setListings]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [view, setView]             = useState('browse'); // browse | detail | sell | my
  const [selected, setSelected]     = useState(null);
  const [cat, setCat]               = useState('all');
  const [condition, setCondition]   = useState('All');
  const [sort, setSort]             = useState('newest');
  const [search, setSearch]         = useState('');
  const [maxPrice, setMaxPrice]     = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast]           = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  /* ── Fetch from API ── */
  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await marketplaceService.getItems();
      setListings(res.data.items || []);
    } catch (err) {
      console.error('Marketplace fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  /* ── Filtered / sorted ── */
  const filtered = listings
    .filter(l => {
      if (cat !== 'all' && l.category !== cat) return false;
      if (condition !== 'All' && l.condition !== condition) return false;
      if (maxPrice && l.price > Number(maxPrice)) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!l.title?.toLowerCase().includes(q) && !l.description?.toLowerCase().includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sort === 'price_asc') return a.price - b.price;
      if (sort === 'price_desc') return b.price - a.price;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const myListings = listings.filter(l =>
    l.seller?._id === user?._id || l.seller === user?._id
  );

  /* ── Detail view ── */
  if (view === 'detail' && selected) {
    return (
      <DetailView
        item={selected}
        user={user}
        onBack={() => { setView('browse'); setSelected(null); }}
        onStatusChange={async (id, status) => {
          try {
            await marketplaceService.updateItem(id, { status });
            fetchListings();
            setSelected(prev => ({ ...prev, status }));
            showToast(`Status updated to ${status}`);
          } catch { showToast('Failed to update status'); }
        }}
        onDelete={async (id) => {
          try {
            await marketplaceService.deleteItem(id);
            fetchListings();
            setView('browse'); setSelected(null);
            showToast('Listing deleted');
          } catch { showToast('Failed to delete'); }
        }}
      />
    );
  }

  /* ── Sell form ── */
  if (view === 'sell') {
    return (
      <SellForm
        user={user}
        onBack={() => setView('browse')}
        onSave={async (data, files) => {
          try {
            await marketplaceService.createItem(data, files);
            await fetchListings();
            setView('my');
            showToast('🎉 Listing published!');
          } catch (err) {
            showToast('Failed to publish. Try again.');
          }
        }}
      />
    );
  }

  /* ── My Listings ── */
  if (view === 'my') {
    return (
      <MyListings
        listings={myListings}
        user={user}
        loading={loading}
        onBack={() => setView('browse')}
        onNew={() => setView('sell')}
        onOpen={(item) => { setSelected(item); setView('detail'); }}
        onStatusChange={async (id, status) => {
          try {
            await marketplaceService.updateItem(id, { status });
            fetchListings();
            showToast('Status updated');
          } catch { showToast('Failed'); }
        }}
        onDelete={async (id) => {
          try {
            await marketplaceService.deleteItem(id);
            fetchListings();
            showToast('Deleted');
          } catch { showToast('Failed'); }
        }}
      />
    );
  }

  /* ── Browse view ── */
  return (
    <div style={{ maxWidth:1100, margin:'0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom:20 }}>
        <h1 className="ch-page-title" style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{
            width:44, height:44, borderRadius:12,
            background:'linear-gradient(135deg,#f59e0b,#ef4444)',
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
          }}>
            <ShoppingBag size={22} color="#fff" />
          </span>
          Community Marketplace
        </h1>
        <p className="ch-page-sub">Buy &amp; sell within your community — safe, trusted, local</p>
      </div>

      {/* Action bar */}
      <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap' }}>
        <div style={{ flex:1, minWidth:200, position:'relative' }}>
          <Search size={15} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--ch-text-muted)' }} />
          <input
            style={{ ...inp, paddingLeft:36 }}
            placeholder="Search listings…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button style={btnSecondary} onClick={() => setShowFilters(v=>!v)}>
          <Filter size={15} /> Filters {showFilters ? '▲':'▼'}
        </button>
        <button style={btnSecondary} onClick={() => setView('my')}>
          <Package size={15} /> My Listings ({myListings.length})
        </button>
        <button style={btnPrimary} onClick={() => setView('sell')}>
          <Plus size={15} /> Sell Item
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div style={{
          background:'var(--ch-card-bg)', border:'1px solid var(--ch-card-border)',
          borderRadius:14, padding:'16px 20px', marginBottom:16,
          display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:12,
        }}>
          <div>
            <label style={{ fontSize:11, fontWeight:700, color:'var(--ch-text-muted)', display:'block', marginBottom:5 }}>Condition</label>
            <select style={inp} value={condition} onChange={e=>setCondition(e.target.value)}>
              {CONDITIONS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize:11, fontWeight:700, color:'var(--ch-text-muted)', display:'block', marginBottom:5 }}>Max Price (₹)</label>
            <input style={inp} type="number" placeholder="e.g. 50000" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize:11, fontWeight:700, color:'var(--ch-text-muted)', display:'block', marginBottom:5 }}>Sort By</label>
            <select style={inp} value={sort} onChange={e=>setSort(e.target.value)}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div style={{ display:'flex', alignItems:'flex-end' }}>
            <button style={{ ...btnSecondary, width:'100%', justifyContent:'center' }}
              onClick={() => { setCat('all'); setCondition('All'); setMaxPrice(''); setSort('newest'); setSearch(''); }}>
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Category chips */}
      <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:8, marginBottom:20, WebkitOverflowScrolling:'touch' }}>
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setCat(c.id)} style={{
            display:'flex', alignItems:'center', gap:5, padding:'7px 14px',
            borderRadius:99, border:'1px solid', whiteSpace:'nowrap', cursor:'pointer', fontSize:12, fontWeight:600,
            background: cat===c.id ? '#6366f1' : 'var(--ch-card-bg)',
            borderColor: cat===c.id ? '#6366f1' : 'var(--ch-card-border)',
            color: cat===c.id ? '#fff' : 'var(--ch-text-primary)',
            flexShrink:0,
          }}>
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      {/* Stats strip */}
      <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' }}>
        {[
          { label:'Total Listings', val: listings.filter(l=>l.status!=='Sold').length, color:'#6366f1' },
          { label:'Available',      val: listings.filter(l=>l.status==='Available').length, color:'#10b981' },
          { label:'Sold',           val: listings.filter(l=>l.status==='Sold').length, color:'#ef4444' },
          { label:'My Listings',    val: myListings.length, color:'#f59e0b' },
        ].map(s => (
          <div key={s.label} style={{
            background:'var(--ch-card-bg)', border:'1px solid var(--ch-card-border)',
            borderRadius:12, padding:'10px 16px', flex:1, minWidth:100, borderLeft:`3px solid ${s.color}`,
          }}>
            <div style={{ fontSize:20, fontWeight:900, color:'var(--ch-text-primary)' }}>{s.val}</div>
            <div style={{ fontSize:11, color:'var(--ch-text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Results count */}
      <div style={{ fontSize:12, color:'var(--ch-text-muted)', marginBottom:14, fontWeight:600 }}>
        {loading ? 'Loading listings…' : `Showing ${filtered.length} listing${filtered.length !== 1 ? 's' : ''}`}
        {search && ` for "${search}"`}
        {cat !== 'all' && ` in ${CATEGORIES.find(c=>c.id===cat)?.label}`}
      </div>

      {/* Loading */}
      {loading ? (
        <div style={{ textAlign:'center', padding:'60px 20px' }}>
          <Loader2 size={36} style={{ animation:'spin 1s linear infinite', opacity:0.4, margin:'0 auto 12px', display:'block' }} />
          <p style={{ color:'var(--ch-text-muted)', fontSize:14 }}>Loading marketplace…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign:'center', padding:'60px 20px',
          background:'var(--ch-card-bg)', border:'1px solid var(--ch-card-border)', borderRadius:16,
        }}>
          <ShoppingBag size={48} style={{ opacity:0.12, margin:'0 auto 12px', display:'block' }} />
          <p style={{ fontSize:15, fontWeight:700, color:'var(--ch-text-primary)', marginBottom:6 }}>No listings found</p>
          <p style={{ fontSize:13, color:'var(--ch-text-muted)', marginBottom:16 }}>
            {search ? `No results for "${search}"` : 'Nothing in this category yet.'}
          </p>
          <button style={btnPrimary} onClick={() => setView('sell')}>
            <Plus size={14} /> Be the first to sell!
          </button>
        </div>
      ) : (
        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))',
          gap:16,
        }}>
          {filtered.map(item => (
            <ListingCard
              key={item._id}
              item={item}
              isMine={item.seller?._id === user?._id || item.seller === user?._id}
              onOpen={() => { setSelected(item); setView('detail'); }}
            />
          ))}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position:'fixed', bottom:24, right:24, zIndex:9000,
          padding:'12px 20px', borderRadius:12, background:'#1a1a2e', color:'#fff',
          fontSize:13, fontWeight:600, boxShadow:'0 8px 28px rgba(0,0,0,0.25)',
        }}>{toast}</div>
      )}
    </div>
  );
};

/* ── Listing Card ─────────────────────────────────────────── */
function ListingCard({ item, isMine, onOpen }) {
  const [hover, setHover] = useState(false);
  const ss = STATUS_STYLE[item.status] || STATUS_STYLE.Available;
  return (
    <div
      style={{ ...cardS, transform: hover ? 'translateY(-3px)' : 'none', boxShadow: hover ? '0 12px 32px rgba(0,0,0,0.10)' : 'none' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onOpen}
    >
      {/* Image */}
      <div style={{ position:'relative', height:180, overflow:'hidden', background:'#f1f5f9' }}>
        {item.images?.[0] ? (
          <img src={item.images[0]} alt={item.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
        ) : (
          <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Package size={40} style={{ opacity:0.2 }} />
          </div>
        )}
        {/* Photo count badge */}
        {item.images?.length > 1 && (
          <span style={{
            position:'absolute', bottom:8, right:8, fontSize:10, fontWeight:700,
            background:'rgba(0,0,0,0.6)', color:'#fff', borderRadius:6, padding:'2px 6px',
          }}>
            📷 {item.images.length}
          </span>
        )}
        <span style={{
          position:'absolute', top:10, left:10, padding:'3px 10px', borderRadius:99,
          fontSize:11, fontWeight:800, ...ss,
        }}>{item.status}</span>
        {isMine && (
          <span style={{
            position:'absolute', bottom:8, left:10, padding:'2px 8px', borderRadius:99,
            fontSize:10, fontWeight:800, background:'#6366f1', color:'#fff',
          }}>Yours</span>
        )}
      </div>

      {/* Info */}
      <div style={{ padding:'12px 14px' }}>
        <div style={{ fontSize:13, fontWeight:700, color:'var(--ch-text-primary)', marginBottom:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {item.title}
        </div>
        <div style={{ fontSize:18, fontWeight:900, color:'#6366f1', marginBottom:6 }}>
          ₹{(item.price||0).toLocaleString('en-IN')}
        </div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:4 }}>
          <span style={{
            fontSize:11, fontWeight:600, padding:'2px 9px', borderRadius:99,
            background:'#f0f0ff', color:'#6366f1',
          }}>{item.condition}</span>
          <span style={{ fontSize:11, color:'var(--ch-text-muted)' }}>{item.location}</span>
        </div>
        <div style={{ marginTop:8, fontSize:11, color:'var(--ch-text-muted)', display:'flex', alignItems:'center', gap:10 }}>
          <span>{timeAgo(item.createdAt)}</span>
          <span><Eye size={11} style={{ verticalAlign:'middle' }} /> {item.views || 0}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Detail View ─────────────────────────────────────────── */
function DetailView({ item, user, onBack, onStatusChange, onDelete }) {
  const isMine = item.seller?._id === user?._id || item.seller === user?._id;
  const ss = STATUS_STYLE[item.status] || STATUS_STYLE.Available;
  const [imgIdx, setImgIdx] = useState(0);

  return (
    <div style={{ maxWidth:860, margin:'0 auto' }}>
      <button style={{ ...btnSecondary, marginBottom:16 }} onClick={onBack}>
        <ChevronLeft size={16} /> Back to Marketplace
      </button>

      <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1.2fr) minmax(0,1fr)', gap:20 }} className="mp-detail-grid">
        {/* Left: Image gallery */}
        <div>
          <div style={{ borderRadius:16, overflow:'hidden', background:'#f1f5f9', aspectRatio:'4/3' }}>
            {item.images?.length > 0
              ? <img src={item.images[imgIdx]} alt={item.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              : <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}><Package size={60} style={{ opacity:0.15 }} /></div>
            }
          </div>
          {/* Thumbnail strip */}
          {item.images?.length > 1 && (
            <div style={{ display:'flex', gap:6, marginTop:8, flexWrap:'wrap' }}>
              {item.images.map((img, i) => (
                <img
                  key={i} src={img} alt=""
                  onClick={() => setImgIdx(i)}
                  style={{
                    width:56, height:56, objectFit:'cover', borderRadius:8, cursor:'pointer',
                    border: `2px solid ${imgIdx===i ? '#6366f1' : 'var(--ch-card-border)'}`,
                  }}
                />
              ))}
            </div>
          )}
          {/* Stats */}
          <div style={{ display:'flex', gap:12, marginTop:12 }}>
            <div style={{ flex:1, padding:'10px 14px', background:'var(--ch-card-bg)', border:'1px solid var(--ch-card-border)', borderRadius:10, textAlign:'center' }}>
              <div style={{ fontSize:16, fontWeight:800, color:'var(--ch-text-primary)' }}>{item.views || 0}</div>
              <div style={{ fontSize:11, color:'var(--ch-text-muted)' }}>Views</div>
            </div>
            <div style={{ flex:1, padding:'10px 14px', background:'var(--ch-card-bg)', border:'1px solid var(--ch-card-border)', borderRadius:10, textAlign:'center' }}>
              <div style={{ fontSize:11, fontWeight:700, padding:'2px 0', ...ss }}>{item.status}</div>
              <div style={{ fontSize:11, color:'var(--ch-text-muted)' }}>Status</div>
            </div>
          </div>
        </div>

        {/* Right: Info */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div style={{ background:'var(--ch-card-bg)', border:'1px solid var(--ch-card-border)', borderRadius:16, padding:20 }}>
            <div style={{ display:'flex', gap:8, marginBottom:10, flexWrap:'wrap' }}>
              <span style={{ ...ss, padding:'3px 10px', borderRadius:99, fontSize:11, fontWeight:800 }}>{item.status}</span>
              <span style={{ background:'#f0f0ff', color:'#6366f1', padding:'3px 10px', borderRadius:99, fontSize:11, fontWeight:700 }}>{item.condition}</span>
              <span style={{ background:'var(--ch-body-bg)', color:'var(--ch-text-muted)', padding:'3px 10px', borderRadius:99, fontSize:11, fontWeight:600 }}>
                {CATEGORIES.find(c=>c.id===item.category)?.emoji} {CATEGORIES.find(c=>c.id===item.category)?.label}
              </span>
            </div>
            <h2 style={{ fontSize:18, fontWeight:900, color:'var(--ch-text-primary)', marginBottom:6, lineHeight:1.3 }}>{item.title}</h2>
            <div style={{ fontSize:28, fontWeight:900, color:'#6366f1', marginBottom:12 }}>
              ₹{(item.price||0).toLocaleString('en-IN')}
            </div>
            <p style={{ fontSize:13, color:'var(--ch-text-muted)', lineHeight:1.6, marginBottom:12 }}>{item.description}</p>
            <div style={{ display:'flex', flexDirection:'column', gap:6, fontSize:12 }}>
              {item.location && <div><span style={{ fontWeight:700, color:'var(--ch-text-primary)' }}>📍 Location:</span> <span style={{ color:'var(--ch-text-muted)' }}>{item.location}</span></div>}
              <div><span style={{ fontWeight:700, color:'var(--ch-text-primary)' }}>👤 Seller:</span> <span style={{ color:'var(--ch-text-muted)' }}>{item.sellerName || item.seller?.name}</span></div>
              <div><span style={{ fontWeight:700, color:'var(--ch-text-primary)' }}>🕒 Posted:</span> <span style={{ color:'var(--ch-text-muted)' }}>{new Date(item.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span></div>
              {item.contactPhone && <div><span style={{ fontWeight:700, color:'var(--ch-text-primary)' }}>📞 Phone:</span> <span style={{ color:'var(--ch-text-muted)' }}>{item.contactPhone}</span></div>}
            </div>
          </div>

          {/* Buyer actions */}
          {!isMine && (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <button style={{ ...btnPrimary, justifyContent:'center', padding:'12px', fontSize:14 }}>
                <MessageCircle size={17} /> Contact Seller
              </button>
              <button style={{ ...btnSecondary, justifyContent:'center', padding:'11px', fontSize:14 }}>
                💰 Make an Offer
              </button>
              <button style={{ ...btnSecondary, justifyContent:'center', color:'#ef4444', borderColor:'#fca5a5' }}>
                <Flag size={14} /> Report
              </button>
            </div>
          )}

          {/* Seller actions */}
          {isMine && (
            <div style={{ background:'var(--ch-card-bg)', border:'1px solid var(--ch-card-border)', borderRadius:14, padding:16 }}>
              <div style={{ fontSize:12, fontWeight:800, color:'var(--ch-text-muted)', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.5px' }}>Manage Listing</div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {['Available','Reserved','Sold'].map(s => (
                  <button key={s} onClick={() => onStatusChange(item._id, s)} style={{
                    display:'flex', alignItems:'center', gap:8, padding:'9px 14px',
                    borderRadius:10, cursor:'pointer', fontSize:13, fontWeight:700,
                    border: `1px solid ${item.status===s ? (STATUS_STYLE[s].color) : 'var(--ch-card-border)'}`,
                    background: item.status===s ? STATUS_STYLE[s].bg : 'var(--ch-body-bg)',
                    color: item.status===s ? STATUS_STYLE[s].color : 'var(--ch-text-muted)',
                  }}>
                    {item.status===s && <CheckCircle size={14} />}
                    Mark as {s}
                  </button>
                ))}
                <button onClick={() => { if(window.confirm('Delete this listing?')) onDelete(item._id); }}
                  style={{ ...btnSecondary, justifyContent:'center', color:'#ef4444', borderColor:'#fca5a5', marginTop:4 }}>
                  <Trash2 size={14} /> Delete Listing
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Sell Form (with photo upload) ────────────────────────── */
function SellForm({ user, onBack, onSave }) {
  const [form, setForm] = useState({
    title:'', category:'furniture', price:'', condition:'Good',
    description:'', location: '',
    contactPhone:'', contactEmail: user?.email || '',
  });
  const [images, setImages] = useState([]); // [{file, preview}]
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.price) { setError('Title and price are required.'); return; }
    setSaving(true);
    setError('');
    try {
      const files = images.map(i => i.file);
      await onSave({ ...form, price: Number(form.price) }, files);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to publish listing.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth:660, margin:'0 auto' }}>
      <button style={{ ...btnSecondary, marginBottom:16 }} onClick={onBack}>
        <ChevronLeft size={16} /> Back
      </button>
      <div style={{ background:'var(--ch-card-bg)', border:'1px solid var(--ch-card-border)', borderRadius:18, padding:28 }}>
        <h2 style={{ fontSize:17, fontWeight:900, color:'var(--ch-text-primary)', marginBottom:20 }}>
          📦 List an Item for Sale
        </h2>
        {error && (
          <div style={{ background:'#fee2e2', border:'1px solid #fca5a5', borderRadius:10, padding:'10px 14px', marginBottom:14, fontSize:13, color:'#991b1b' }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>

            {/* Photos upload */}
            <div style={{ gridColumn:'1/-1' }}>
              <label style={{ fontSize:11, fontWeight:700, color:'var(--ch-text-muted)', display:'block', marginBottom:5 }}>
                📷 Photos (up to 5)
              </label>
              <ImageUploader images={images} onChange={setImages} max={5} />
            </div>

            <div style={{ gridColumn:'1/-1' }}>
              <label style={{ fontSize:11, fontWeight:700, color:'var(--ch-text-muted)', display:'block', marginBottom:5 }}>Item Title *</label>
              <input style={inp} required placeholder="e.g. Wooden dining table" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
            </div>
            <div>
              <label style={{ fontSize:11, fontWeight:700, color:'var(--ch-text-muted)', display:'block', marginBottom:5 }}>Category *</label>
              <select style={inp} value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
                {CATEGORIES.filter(c=>c.id!=='all').map(c=><option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize:11, fontWeight:700, color:'var(--ch-text-muted)', display:'block', marginBottom:5 }}>Price (₹) *</label>
              <input style={inp} required type="number" min="0" placeholder="0" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} />
            </div>
            <div>
              <label style={{ fontSize:11, fontWeight:700, color:'var(--ch-text-muted)', display:'block', marginBottom:5 }}>Condition *</label>
              <select style={inp} value={form.condition} onChange={e=>setForm({...form,condition:e.target.value})}>
                {['New','Like New','Good','Used'].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize:11, fontWeight:700, color:'var(--ch-text-muted)', display:'block', marginBottom:5 }}>Location / Block</label>
              <input style={inp} placeholder="e.g. Tower B, Floor 3" value={form.location} onChange={e=>setForm({...form,location:e.target.value})} />
            </div>
            <div>
              <label style={{ fontSize:11, fontWeight:700, color:'var(--ch-text-muted)', display:'block', marginBottom:5 }}>Contact Phone</label>
              <input style={inp} placeholder="+91 9999999999" value={form.contactPhone} onChange={e=>setForm({...form,contactPhone:e.target.value})} />
            </div>
            <div>
              <label style={{ fontSize:11, fontWeight:700, color:'var(--ch-text-muted)', display:'block', marginBottom:5 }}>Contact Email</label>
              <input style={inp} type="email" placeholder="your@email.com" value={form.contactEmail} onChange={e=>setForm({...form,contactEmail:e.target.value})} />
            </div>
            <div style={{ gridColumn:'1/-1' }}>
              <label style={{ fontSize:11, fontWeight:700, color:'var(--ch-text-muted)', display:'block', marginBottom:5 }}>Description *</label>
              <textarea style={{ ...inp, minHeight:100, resize:'vertical' }} required
                placeholder="Describe the item — age, condition details, reason for selling, included accessories…"
                value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
            </div>
          </div>
          <div style={{ marginTop:6, padding:'12px 14px', borderRadius:10, background:'#eff6ff', border:'1px solid #bfdbfe', fontSize:12, color:'#1d4ed8' }}>
            ℹ️ Your contact details will be shared only with interested buyers. Listings are visible only to community residents.
          </div>
          <div style={{ display:'flex', gap:10, marginTop:20 }}>
            <button type="button" style={{ ...btnSecondary, flex:1, justifyContent:'center' }} onClick={onBack}>Cancel</button>
            <button type="submit" disabled={saving} style={{ ...btnPrimary, flex:1, justifyContent:'center' }}>
              {saving
                ? <><Loader2 size={15} style={{ animation:'spin 1s linear infinite' }} /> Publishing…</>
                : <><CheckCircle size={15} /> Publish Listing</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── My Listings ─────────────────────────────────────────── */
function MyListings({ listings, user, loading, onBack, onNew, onOpen, onStatusChange, onDelete }) {
  return (
    <div style={{ maxWidth:800, margin:'0 auto' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12, marginBottom:20 }}>
        <div>
          <button style={{ ...btnSecondary, marginBottom:8 }} onClick={onBack}><ChevronLeft size={16}/> Browse</button>
          <h2 style={{ fontSize:18, fontWeight:900, color:'var(--ch-text-primary)' }}>My Listings</h2>
          <p style={{ fontSize:13, color:'var(--ch-text-muted)' }}>Manage your items for sale</p>
        </div>
        <button style={btnPrimary} onClick={onNew}><Plus size={15}/> New Listing</button>
      </div>

      {listings.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 20px', background:'var(--ch-card-bg)', border:'1px solid var(--ch-card-border)', borderRadius:16 }}>
          <Package size={48} style={{ opacity:0.12, margin:'0 auto 12px', display:'block' }} />
          <p style={{ fontSize:15, fontWeight:700, color:'var(--ch-text-primary)', marginBottom:6 }}>You haven't listed anything yet</p>
          <p style={{ fontSize:13, color:'var(--ch-text-muted)', marginBottom:16 }}>Start selling items to your community neighbours!</p>
          <button style={btnPrimary} onClick={onNew}><Plus size={14}/> Create Your First Listing</button>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {listings.map(item => {
            const ss = STATUS_STYLE[item.status] || STATUS_STYLE.Available;
            return (
              <div key={item._id} style={{
                background:'var(--ch-card-bg)', border:'1px solid var(--ch-card-border)',
                borderRadius:14, padding:16, display:'flex', alignItems:'center', gap:14, flexWrap:'wrap',
              }}>
                <div style={{ width:70, height:70, borderRadius:12, overflow:'hidden', background:'#f1f5f9', flexShrink:0 }}>
                  {item.images?.[0]
                    ? <img src={item.images[0]} alt={item.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    : <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}><Package size={22} style={{ opacity:0.2 }} /></div>
                  }
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'var(--ch-text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.title}</div>
                  <div style={{ fontSize:16, fontWeight:900, color:'#6366f1' }}>₹{(item.price||0).toLocaleString('en-IN')}</div>
                  <div style={{ display:'flex', gap:8, marginTop:4, flexWrap:'wrap', alignItems:'center' }}>
                    <span style={{ ...ss, padding:'2px 9px', borderRadius:99, fontSize:11, fontWeight:800 }}>{item.status}</span>
                    <span style={{ fontSize:11, color:'var(--ch-text-muted)' }}><Eye size={11} style={{verticalAlign:'middle'}}/> {item.views||0} views</span>
                    <span style={{ fontSize:11, color:'var(--ch-text-muted)' }}>{timeAgo(item.createdAt)}</span>
                    {item.images?.length > 0 && <span style={{ fontSize:11, color:'var(--ch-text-muted)' }}>📷 {item.images.length} photo{item.images.length>1?'s':''}</span>}
                  </div>
                </div>
                <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                  <button style={btnSecondary} onClick={() => onOpen(item)}><Eye size={14}/></button>
                  <select style={{ ...inp, width:'auto', padding:'8px 12px' }}
                    value={item.status}
                    onChange={e => onStatusChange(item._id, e.target.value)}>
                    {['Available','Reserved','Sold'].map(s=><option key={s}>{s}</option>)}
                  </select>
                  <button onClick={() => { if(window.confirm('Delete?')) onDelete(item._id); }}
                    style={{ ...btnSecondary, color:'#ef4444', borderColor:'#fca5a5' }}>
                    <Trash2 size={14}/>
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
