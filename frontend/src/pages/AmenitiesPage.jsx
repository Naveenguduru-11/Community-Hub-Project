import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { amenityService } from '../services/api';
import {
  Building2, Dumbbell, Waves, Zap, Trophy,
  PartyPopper, BedDouble, Gamepad2, ChevronLeft,
  Clock, Users, Calendar, CheckCircle, XCircle,
  AlertTriangle, Loader2, Info, Star, ChevronRight,
  Plus, Trash2, Ban, BarChart3, CreditCard, Camera, ImagePlus
} from 'lucide-react';

/* ── Amenity seed data ─────────────────────────────────────── */
const AMENITIES_SEED = [
  {
    id:'clubhouse', name:'Clubhouse', emoji:'🏢', icon:'building',
    desc:'Spacious multi-purpose hall ideal for parties, meetings and community events.',
    capacity:150, image:'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80',
    slots:[
      { id:'s1', label:'10:00 AM – 12:00 PM', price:500, guestCharge:50 },
      { id:'s2', label:'12:00 PM – 2:00 PM',  price:500, guestCharge:50 },
      { id:'s3', label:'2:00 PM – 5:00 PM',   price:800, guestCharge:50 },
      { id:'s4', label:'6:00 PM – 10:00 PM',  price:1500, guestCharge:100 },
    ],
    maintenance:[], status:'active', category:'Hall',
    operatingHours:'9:00 AM – 11:00 PM',
  },
  {
    id:'gym', name:'Gymnasium', emoji:'🏋️', icon:'dumbbell',
    desc:'Fully equipped gym with cardio machines, free weights, and dedicated yoga space.',
    capacity:30, image:'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80',
    slots:[
      { id:'s1', label:'6:00 AM – 8:00 AM',   price:0,   guestCharge:0 },
      { id:'s2', label:'8:00 AM – 10:00 AM',  price:0,   guestCharge:0 },
      { id:'s3', label:'5:00 PM – 7:00 PM',   price:0,   guestCharge:0 },
      { id:'s4', label:'7:00 PM – 9:00 PM',   price:0,   guestCharge:0 },
    ],
    maintenance:[{ start:'2026-09-05', end:'2026-09-07', reason:'Equipment servicing' }],
    status:'active', category:'Fitness',
    operatingHours:'6:00 AM – 10:00 PM',
  },
  {
    id:'pool', name:'Swimming Pool', emoji:'🏊', icon:'waves',
    desc:'Olympic-size pool with dedicated lanes, kids area, and lifeguard on duty.',
    capacity:40, image:'https://images.unsplash.com/photo-1569361116630-9c98a5a14e23?w=600&q=80',
    slots:[
      { id:'s1', label:'6:00 AM – 8:00 AM',   price:100,  guestCharge:50 },
      { id:'s2', label:'8:00 AM – 10:00 AM',  price:100,  guestCharge:50 },
      { id:'s3', label:'4:00 PM – 6:00 PM',   price:100,  guestCharge:50 },
      { id:'s4', label:'6:00 PM – 8:00 PM',   price:150,  guestCharge:50 },
    ],
    maintenance:[], status:'active', category:'Sports',
    operatingHours:'6:00 AM – 9:00 PM',
  },
  {
    id:'badminton', name:'Badminton Court', emoji:'🏸', icon:'zap',
    desc:'2 indoor badminton courts with professional flooring and lighting.',
    capacity:8, image:'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&q=80',
    slots:[
      { id:'s1', label:'6:00 AM – 7:00 AM',   price:150, guestCharge:0 },
      { id:'s2', label:'7:00 AM – 8:00 AM',   price:150, guestCharge:0 },
      { id:'s3', label:'5:00 PM – 6:00 PM',   price:200, guestCharge:0 },
      { id:'s4', label:'6:00 PM – 7:00 PM',   price:200, guestCharge:0 },
      { id:'s5', label:'7:00 PM – 8:00 PM',   price:200, guestCharge:0 },
    ],
    maintenance:[], status:'active', category:'Sports',
    operatingHours:'6:00 AM – 10:00 PM',
  },
  {
    id:'party', name:'Party Hall', emoji:'🎉', icon:'party',
    desc:'Elegant event space for birthday parties, anniversaries and celebrations.',
    capacity:80, image:'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80',
    slots:[
      { id:'s1', label:'10:00 AM – 2:00 PM',  price:2000, guestCharge:100 },
      { id:'s2', label:'3:00 PM – 7:00 PM',   price:2000, guestCharge:100 },
      { id:'s3', label:'7:00 PM – 11:00 PM',  price:3000, guestCharge:150 },
    ],
    maintenance:[], status:'active', category:'Hall',
    operatingHours:'10:00 AM – 11:00 PM',
  },
  {
    id:'tennis', name:'Tennis Court', emoji:'🎾', icon:'trophy',
    desc:'Full-size tennis court with floodlights for evening play.',
    capacity:4, image:'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=600&q=80',
    slots:[
      { id:'s1', label:'6:00 AM – 7:30 AM',  price:250, guestCharge:0 },
      { id:'s2', label:'7:30 AM – 9:00 AM',  price:250, guestCharge:0 },
      { id:'s3', label:'5:00 PM – 6:30 PM',  price:300, guestCharge:0 },
      { id:'s4', label:'6:30 PM – 8:00 PM',  price:300, guestCharge:0 },
    ],
    maintenance:[], status:'active', category:'Sports',
    operatingHours:'6:00 AM – 10:00 PM',
  },
  {
    id:'guestroom', name:'Guest Rooms', emoji:'🛏️', icon:'bed',
    desc:'2 fully furnished guest rooms for visiting family and friends of residents.',
    capacity:4, image:'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80',
    slots:[
      { id:'s1', label:'Full Day (24 hrs)',    price:1500, guestCharge:500 },
    ],
    maintenance:[], status:'active', category:'Accommodation',
    operatingHours:'24 hours (check-in 12 PM)',
  },
  {
    id:'games', name:'Games Room', emoji:'🎮', icon:'gamepad',
    desc:'Indoor games room with billiards, table tennis, chess and board games.',
    capacity:20, image:'https://images.unsplash.com/photo-1554479736-0d5a8e3e3cb3?w=600&q=80',
    slots:[
      { id:'s1', label:'10:00 AM – 1:00 PM',  price:0, guestCharge:0 },
      { id:'s2', label:'2:00 PM – 5:00 PM',   price:0, guestCharge:0 },
      { id:'s3', label:'6:00 PM – 9:00 PM',   price:0, guestCharge:0 },
    ],
    maintenance:[], status:'active', category:'Entertainment',
    operatingHours:'10:00 AM – 9:00 PM',
  },
];

const CAT_COLORS = {
  Hall:          { bg:'#ede9fe', color:'#7c3aed' },
  Fitness:       { bg:'#d1fae5', color:'#065f46' },
  Sports:        { bg:'#dbeafe', color:'#1d4ed8' },
  Entertainment: { bg:'#fef3c7', color:'#92400e' },
  Accommodation: { bg:'#fce7f3', color:'#9d174d' },
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

function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}
function fmtDate(str) {
  return new Date(str).toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
}
function isInMaintenance(amenity, dateStr) {
  return amenity.maintenance.some(m => dateStr >= m.start && dateStr <= m.end);
}
function getBookings() {
  try { return JSON.parse(localStorage.getItem('ch_amenity_bookings') || '[]'); } catch { return []; }
}
function saveBookings(b) { localStorage.setItem('ch_amenity_bookings', JSON.stringify(b)); }

/* ══════════════════════════════════════════════════════════ */
export const AmenitiesPage = () => {
  const { user } = useAuth();
  const isAdmin = ['SUPER_ADMIN','COMMUNITY_ADMIN'].includes(user?.role);
  const isGuard = user?.role === 'SECURITY_GUARD';

  const [amenities, setAmenities] = useState(AMENITIES_SEED);
  const [loadingAmenities, setLoadingAmenities] = useState(true);
  const [view, setView]     = useState('list'); // list | detail | book | confirm | mybook | admin
  const [selected, setSelected] = useState(null);
  const [bookings, setBookings] = useState(getBookings);
  const [catFilter, setCatFilter] = useState('All');
  const [tab, setTab]       = useState('upcoming'); // upcoming|completed|cancelled

  // Fetch amenities from API (fall back to seed if empty)
  useEffect(() => {
    const load = async () => {
      try {
        const res = await amenityService.getAmenities();
        const data = res.data.amenities || [];
        if (data.length > 0) setAmenities(data);
      } catch {
        // Keep AMENITIES_SEED as fallback
      } finally {
        setLoadingAmenities(false);
      }
    };
    load();
  }, []);

  const cats = ['All', ...new Set(AMENITIES_SEED.map(a=>a.category))];
  const filtered = catFilter==='All' ? amenities : amenities.filter(a=>a.category===catFilter);

  /* My bookings */
  const myBookings = bookings.filter(b => b.userId === (user?._id || 'me'));
  const tabBookings = myBookings.filter(b => {
    if (tab==='upcoming')   return ['confirmed','pending'].includes(b.status);
    if (tab==='completed')  return b.status==='completed';
    if (tab==='cancelled')  return b.status==='cancelled';
    return true;
  });

  const cancelBooking = (id) => {
    const updated = bookings.map(b => b.id===id ? {...b, status:'cancelled'} : b);
    setBookings(updated);
    saveBookings(updated);
  };

  /* Admin view */
  if (isAdmin && view === 'admin') {
    return <AdminView amenities={amenities} bookings={bookings} onBack={() => setView('list')} />;
  }

  /* Booking flow */
  if (view === 'book' && selected) {
    return <BookingForm
      amenity={selected}
      user={user}
      existingBookings={bookings}
      onBack={() => setView('detail')}
      onConfirm={(booking) => {
        const updated = [booking, ...bookings];
        setBookings(updated);
        saveBookings(updated);
        setView('confirm');
        setSelected({ ...selected, _booking: booking });
      }}
    />;
  }

  if (view === 'confirm' && selected?._booking) {
    return <BookingConfirm booking={selected._booking} amenity={selected} onDone={() => { setView('mybook'); setSelected(null); }} />;
  }

  /* Detail view */
  if (view === 'detail' && selected) {
    return <AmenityDetail
      amenity={selected}
      user={user}
      bookings={bookings}
      onBack={() => setView('list')}
      onBook={() => setView('book')}
    />;
  }

  /* My Bookings */
  if (view === 'mybook') {
    return (
      <div style={{ maxWidth:800, margin:'0 auto' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12, marginBottom:20 }}>
          <div>
            <button style={{ ...btnSecondary, marginBottom:8 }} onClick={() => setView('list')}><ChevronLeft size={16}/> Amenities</button>
            <h2 style={{ fontSize:18, fontWeight:900, color:'var(--ch-text-primary)' }}>My Bookings</h2>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:4, marginBottom:20, background:'var(--ch-card-bg)', border:'1px solid var(--ch-card-border)', borderRadius:12, padding:4 }}>
          {['upcoming','completed','cancelled'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex:1, padding:'8px 12px', borderRadius:9, border:'none', cursor:'pointer',
              fontSize:12, fontWeight:700, textTransform:'capitalize',
              background: tab===t ? '#6366f1' : 'transparent',
              color: tab===t ? '#fff' : 'var(--ch-text-muted)',
            }}>{t}</button>
          ))}
        </div>

        {tabBookings.length === 0 ? (
          <div style={{ textAlign:'center', padding:'48px 20px', background:'var(--ch-card-bg)', border:'1px solid var(--ch-card-border)', borderRadius:16 }}>
            <Calendar size={48} style={{ opacity:0.12, margin:'0 auto 12px', display:'block' }} />
            <p style={{ fontSize:14, fontWeight:700, color:'var(--ch-text-primary)', marginBottom:6 }}>No {tab} bookings</p>
            {tab==='upcoming' && <button style={btnPrimary} onClick={()=>setView('list')}><Plus size={14}/> Book an Amenity</button>}
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {tabBookings.map(b => {
              const am = amenities.find(a=>a.id===b.amenityId);
              const statusColor = { confirmed:'#d1fae5', pending:'#fef3c7', cancelled:'#fee2e2', completed:'#eff6ff' };
              const statusText  = { confirmed:'#065f46', pending:'#92400e', cancelled:'#991b1b', completed:'#1d4ed8' };
              return (
                <div key={b.id} style={{ background:'var(--ch-card-bg)', border:'1px solid var(--ch-card-border)', borderRadius:14, overflow:'hidden' }}>
                  <div style={{ display:'flex', gap:14, padding:16, alignItems:'center', flexWrap:'wrap' }}>
                    <div style={{ width:60, height:60, borderRadius:12, overflow:'hidden', flexShrink:0 }}>
                      {am?.image ? <img src={am.image} alt={am?.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                        : <div style={{ width:'100%', height:'100%', background:'#f1f5f9', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>{am?.emoji}</div>}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:14, fontWeight:800, color:'var(--ch-text-primary)' }}>{am?.name || b.amenityId}</div>
                      <div style={{ fontSize:12, color:'var(--ch-text-muted)', marginTop:2 }}>
                        📅 {fmtDate(b.date)} &nbsp; 🕐 {b.slotLabel}
                      </div>
                      <div style={{ fontSize:12, color:'var(--ch-text-muted)' }}>
                        👥 {b.guests} guest{b.guests!==1?'s':''} &nbsp;
                        {b.amount > 0 ? `💳 ₹${b.amount}` : '🆓 Free'}
                      </div>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:8, flexShrink:0 }}>
                      <span style={{ padding:'3px 10px', borderRadius:99, fontSize:11, fontWeight:800, background:statusColor[b.status], color:statusText[b.status], textTransform:'capitalize' }}>{b.status}</span>
                      <div style={{ fontSize:10, color:'var(--ch-text-xs)', fontFamily:'monospace' }}>#{b.id}</div>
                      {b.status==='confirmed' && (
                        <button onClick={()=>{ if(confirm('Cancel this booking?')) cancelBooking(b.id); }}
                          style={{ fontSize:11, fontWeight:700, color:'#ef4444', background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:8, padding:'4px 10px', cursor:'pointer' }}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  /* ── LIST VIEW ── */
  return (
    <div style={{ maxWidth:1100, margin:'0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom:20, display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 className="ch-page-title" style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ width:44, height:44, borderRadius:12, background:'linear-gradient(135deg,#3b82f6,#1d4ed8)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <Building2 size={22} color="#fff" />
            </span>
            Clubs &amp; Amenities
          </h1>
          <p className="ch-page-sub">Book community facilities quickly and easily</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button style={btnSecondary} onClick={() => setView('mybook')}>
            <Calendar size={15} /> My Bookings ({myBookings.filter(b=>b.status==='confirmed').length})
          </button>
          {isAdmin && <button style={btnPrimary} onClick={() => setView('admin')}><BarChart3 size={15}/> Admin Panel</button>}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' }}>
        {[
          { label:'Available Now',   val: amenities.filter(a=>a.status==='active').length, color:'#10b981' },
          { label:'Total Bookings',  val: myBookings.length, color:'#6366f1' },
          { label:'Upcoming',        val: myBookings.filter(b=>b.status==='confirmed').length, color:'#3b82f6' },
          { label:'Under Maintenance', val: amenities.filter(a=>isInMaintenance(a,getTodayStr())).length, color:'#f59e0b' },
        ].map(s => (
          <div key={s.label} style={{ background:'var(--ch-card-bg)', border:'1px solid var(--ch-card-border)', borderRadius:12, padding:'12px 16px', flex:1, minWidth:120, borderLeft:`3px solid ${s.color}` }}>
            <div style={{ fontSize:22, fontWeight:900, color:'var(--ch-text-primary)' }}>{s.val}</div>
            <div style={{ fontSize:11, color:'var(--ch-text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Category filter */}
      <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:8, marginBottom:20, WebkitOverflowScrolling:'touch' }}>
        {cats.map(c => (
          <button key={c} onClick={() => setCatFilter(c)} style={{
            padding:'7px 14px', borderRadius:99, border:'1px solid', whiteSpace:'nowrap',
            cursor:'pointer', fontSize:12, fontWeight:600, flexShrink:0,
            background: catFilter===c ? '#6366f1' : 'var(--ch-card-bg)',
            borderColor: catFilter===c ? '#6366f1' : 'var(--ch-card-border)',
            color: catFilter===c ? '#fff' : 'var(--ch-text-primary)',
          }}>{c}</button>
        ))}
      </div>

      {/* Amenity grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:18 }}>
        {filtered.map(am => {
          const inMaint = isInMaintenance(am, getTodayStr());
          const cc = CAT_COLORS[am.category] || { bg:'#f3f4f6', color:'#374151' };
          const todayBookings = bookings.filter(b=>b.amenityId===am.id && b.date===getTodayStr() && b.status==='confirmed').length;
          return (
            <div key={am.id} style={{
              background:'var(--ch-card-bg)', border:'1px solid var(--ch-card-border)',
              borderRadius:18, overflow:'hidden', cursor:'pointer',
              transition:'transform 0.18s, box-shadow 0.18s',
              opacity: inMaint ? 0.75 : 1,
            }}
              onClick={() => { setSelected(am); setView('detail'); }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 12px 30px rgba(0,0,0,0.10)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}
            >
              <div style={{ position:'relative', height:170, overflow:'hidden', background:'#e8eaf0' }}>
                <img src={am.image} alt={am.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.45), transparent)' }} />
                <div style={{ position:'absolute', bottom:12, left:14, color:'#fff' }}>
                  <div style={{ fontSize:24 }}>{am.emoji}</div>
                </div>
                {inMaint && (
                  <div style={{ position:'absolute', top:10, right:10, padding:'4px 10px', borderRadius:99, background:'#ef4444', color:'#fff', fontSize:11, fontWeight:800, display:'flex', alignItems:'center', gap:5 }}>
                    <Ban size={11} /> Maintenance
                  </div>
                )}
                <span style={{ position:'absolute', top:10, left:10, ...cc, padding:'3px 10px', borderRadius:99, fontSize:11, fontWeight:700 }}>
                  {am.category}
                </span>
              </div>
              <div style={{ padding:'14px 16px' }}>
                <div style={{ fontSize:15, fontWeight:800, color:'var(--ch-text-primary)', marginBottom:4 }}>{am.name}</div>
                <div style={{ fontSize:12, color:'var(--ch-text-muted)', marginBottom:10, lineHeight:1.4, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>{am.desc}</div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
                  <div style={{ display:'flex', gap:12 }}>
                    <span style={{ fontSize:12, color:'var(--ch-text-muted)' }}><Users size={12} style={{verticalAlign:'middle'}}/> {am.capacity}</span>
                    <span style={{ fontSize:12, color:'var(--ch-text-muted)' }}><Clock size={12} style={{verticalAlign:'middle'}}/> {am.slots.length} slots</span>
                  </div>
                  {am.slots.some(s=>s.price===0)
                    ? <span style={{ fontSize:12, fontWeight:800, color:'#065f46', background:'#d1fae5', padding:'2px 9px', borderRadius:99 }}>Free</span>
                    : <span style={{ fontSize:12, fontWeight:800, color:'#6366f1' }}>From ₹{Math.min(...am.slots.map(s=>s.price))}</span>
                  }
                </div>
                <button style={{ ...btnPrimary, width:'100%', justifyContent:'center', marginTop:12,
                  background: inMaint ? '#9ca3af' : '#6366f1', cursor: inMaint ? 'not-allowed' : 'pointer' }}
                  disabled={inMaint}>
                  {inMaint ? '🔴 Under Maintenance' : 'Book Now →'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ── Amenity Detail ──────────────────────────────────────── */
function AmenityDetail({ amenity, user, bookings, onBack, onBook }) {
  const inMaint = isInMaintenance(amenity, getTodayStr());
  const myUpcoming = bookings.filter(b => b.amenityId===amenity.id && b.userId===(user?._id||'me') && b.status==='confirmed');

  return (
    <div style={{ maxWidth:900, margin:'0 auto' }}>
      <button style={{ ...btnSecondary, marginBottom:16 }} onClick={onBack}><ChevronLeft size={16}/> All Amenities</button>

      {/* Hero image */}
      <div style={{ height:260, borderRadius:20, overflow:'hidden', marginBottom:20, position:'relative' }}>
        <img src={amenity.image} alt={amenity.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }} />
        <div style={{ position:'absolute', bottom:20, left:24, color:'#fff' }}>
          <div style={{ fontSize:32 }}>{amenity.emoji}</div>
          <div style={{ fontSize:22, fontWeight:900 }}>{amenity.name}</div>
          <div style={{ fontSize:13, opacity:0.85 }}>{amenity.category} · Capacity: {amenity.capacity} people</div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1.4fr) minmax(0,1fr)', gap:20 }} className="am-detail-grid">
        {/* Left */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {/* Info card */}
          <div style={{ background:'var(--ch-card-bg)', border:'1px solid var(--ch-card-border)', borderRadius:16, padding:20 }}>
            <h3 style={{ fontSize:14, fontWeight:800, color:'var(--ch-text-primary)', marginBottom:12 }}>About</h3>
            <p style={{ fontSize:13, color:'var(--ch-text-muted)', lineHeight:1.6, marginBottom:14 }}>{amenity.desc}</p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {[
                { icon:'⏰', label:'Operating Hours', val:amenity.operatingHours },
                { icon:'👥', label:'Max Capacity', val:`${amenity.capacity} people` },
                { icon:'📅', label:'Available Slots', val:`${amenity.slots.length} per day` },
                { icon:'💰', label:'Starting Price', val: amenity.slots.every(s=>s.price===0) ? 'Free' : `₹${Math.min(...amenity.slots.map(s=>s.price))}/slot` },
              ].map(r => (
                <div key={r.label} style={{ padding:'10px 12px', background:'var(--ch-body-bg)', borderRadius:10 }}>
                  <div style={{ fontSize:11, color:'var(--ch-text-muted)', marginBottom:3 }}>{r.icon} {r.label}</div>
                  <div style={{ fontSize:13, fontWeight:700, color:'var(--ch-text-primary)' }}>{r.val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Maintenance notice */}
          {amenity.maintenance.length > 0 && (
            <div style={{ background:'#fffbeb', border:'1px solid #fbbf24', borderRadius:12, padding:'12px 16px' }}>
              <div style={{ fontWeight:800, fontSize:12, color:'#92400e', marginBottom:6, display:'flex', alignItems:'center', gap:6 }}>
                <AlertTriangle size={14}/> Scheduled Maintenance
              </div>
              {amenity.maintenance.map((m,i) => (
                <div key={i} style={{ fontSize:12, color:'#92400e' }}>
                  {fmtDate(m.start)} → {fmtDate(m.end)}: {m.reason}
                </div>
              ))}
            </div>
          )}

          {/* My upcoming bookings for this amenity */}
          {myUpcoming.length > 0 && (
            <div style={{ background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:12, padding:'12px 16px' }}>
              <div style={{ fontWeight:800, fontSize:12, color:'#1d4ed8', marginBottom:8 }}>Your Upcoming Bookings</div>
              {myUpcoming.map(b => (
                <div key={b.id} style={{ fontSize:12, color:'#1d4ed8', marginBottom:4 }}>
                  📅 {fmtDate(b.date)} · {b.slotLabel} · {b.guests} guests
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Slots + Book */}
        <div>
          <div style={{ background:'var(--ch-card-bg)', border:'1px solid var(--ch-card-border)', borderRadius:16, padding:20 }}>
            <h3 style={{ fontSize:14, fontWeight:800, color:'var(--ch-text-primary)', marginBottom:14 }}>Available Slots</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:18 }}>
              {amenity.slots.map(slot => (
                <div key={slot.id} style={{
                  display:'flex', justifyContent:'space-between', alignItems:'center',
                  padding:'10px 14px', background:'var(--ch-body-bg)', borderRadius:10, gap:8,
                }}>
                  <span style={{ fontSize:13, fontWeight:600, color:'var(--ch-text-primary)' }}>
                    <Clock size={13} style={{verticalAlign:'middle', marginRight:5}} />{slot.label}
                  </span>
                  <span style={{ fontSize:13, fontWeight:800, color:'#6366f1', flexShrink:0 }}>
                    {slot.price===0 ? '🆓 Free' : `₹${slot.price}`}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ fontSize:12, color:'var(--ch-text-muted)', marginBottom:14, lineHeight:1.5 }}>
              📋 <strong>Cancellation Policy:</strong> Cancel up to 24 hours before booking for a full refund.
            </div>
            <button
              style={{ ...btnPrimary, width:'100%', justifyContent:'center', padding:'13px',
                background: inMaint ? '#9ca3af' : '#6366f1', cursor: inMaint ? 'not-allowed' : 'pointer' }}
              disabled={inMaint}
              onClick={onBook}
            >
              {inMaint ? '🔴 Under Maintenance' : '📅 Book Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Booking Form ─────────────────────────────────────────── */
function BookingForm({ amenity, user, existingBookings, onBack, onConfirm }) {
  const [date, setDate]   = useState(getTodayStr());
  const [slot, setSlot]   = useState(amenity.slots[0]);
  const [guests, setGuests] = useState(1);
  const [confirming, setConfirming] = useState(false);

  const inMaint = isInMaintenance(amenity, date);
  const slotsForDate = amenity.slots;
  const bookedSlotIds = existingBookings
    .filter(b => b.amenityId===amenity.id && b.date===date && b.status==='confirmed')
    .map(b => b.slotId);

  const guestCharge = (guests - 1) * (slot?.guestCharge || 0);
  const total = (slot?.price || 0) + guestCharge;

  const handleConfirm = async (e) => {
    e.preventDefault();
    setConfirming(true);
    await new Promise(r => setTimeout(r, 700));
    const booking = {
      id: 'BK' + Date.now().toString().slice(-6),
      amenityId: amenity.id,
      amenityName: amenity.name,
      userId: user?._id || 'me',
      userName: user?.name || 'Resident',
      date,
      slotId: slot.id,
      slotLabel: slot.label,
      guests,
      amount: total,
      status: 'confirmed',
      bookedAt: new Date().toISOString(),
    };
    onConfirm(booking);
    setConfirming(false);
  };

  return (
    <div style={{ maxWidth:520, margin:'0 auto' }}>
      <button style={{ ...btnSecondary, marginBottom:16 }} onClick={onBack}><ChevronLeft size={16}/> Back</button>
      <div style={{ background:'var(--ch-card-bg)', border:'1px solid var(--ch-card-border)', borderRadius:18, overflow:'hidden' }}>
        {/* Mini hero */}
        <div style={{ height:120, position:'relative', background:'#e8eaf0' }}>
          <img src={amenity.image} alt={amenity.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', padding:'0 20px' }}>
            <div style={{ color:'#fff' }}>
              <div style={{ fontSize:20 }}>{amenity.emoji}</div>
              <div style={{ fontSize:16, fontWeight:900 }}>{amenity.name}</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleConfirm} style={{ padding:24 }}>
          <h3 style={{ fontSize:15, fontWeight:800, color:'var(--ch-text-primary)', marginBottom:20 }}>Book your slot</h3>

          {/* Date */}
          <div style={{ marginBottom:16 }}>
            <label style={{ fontSize:11, fontWeight:700, color:'var(--ch-text-muted)', display:'block', marginBottom:5 }}>
              📅 Select Date
            </label>
            <input type="date" style={inp} required min={getTodayStr()} value={date} onChange={e=>setDate(e.target.value)} />
            {inMaint && (
              <div style={{ marginTop:6, fontSize:12, color:'#b45309', background:'#fffbeb', padding:'6px 10px', borderRadius:8, fontWeight:600 }}>
                ⚠️ This amenity is under maintenance on this date
              </div>
            )}
          </div>

          {/* Time slot */}
          <div style={{ marginBottom:16 }}>
            <label style={{ fontSize:11, fontWeight:700, color:'var(--ch-text-muted)', display:'block', marginBottom:8 }}>
              🕐 Select Time Slot
            </label>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {slotsForDate.map(s => {
                const isBooked = bookedSlotIds.includes(s.id);
                const isSel = slot?.id === s.id;
                return (
                  <button key={s.id} type="button"
                    disabled={isBooked}
                    onClick={() => setSlot(s)}
                    style={{
                      display:'flex', justifyContent:'space-between', alignItems:'center',
                      padding:'11px 16px', borderRadius:12, border:'2px solid', cursor: isBooked ? 'not-allowed' : 'pointer',
                      fontSize:13, fontWeight:600, transition:'all 0.15s',
                      borderColor: isSel ? '#6366f1' : isBooked ? '#e5e7eb' : 'var(--ch-card-border)',
                      background: isSel ? '#ede9fe' : isBooked ? '#f9fafb' : 'var(--ch-body-bg)',
                      color: isSel ? '#4f46e5' : isBooked ? '#9ca3af' : 'var(--ch-text-primary)',
                      opacity: isBooked ? 0.6 : 1,
                    }}>
                    <span>{isSel && '✓ '}{s.label}</span>
                    <span style={{ fontWeight:800 }}>{isBooked ? '🔴 Booked' : s.price===0 ? '🆓 Free' : `₹${s.price}`}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Guests */}
          <div style={{ marginBottom:20 }}>
            <label style={{ fontSize:11, fontWeight:700, color:'var(--ch-text-muted)', display:'block', marginBottom:8 }}>
              👥 Number of Guests (incl. yourself)
            </label>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <button type="button" onClick={() => setGuests(Math.max(1,guests-1))} style={{
                width:38, height:38, borderRadius:99, border:'1px solid var(--ch-card-border)',
                background:'var(--ch-body-bg)', fontSize:18, cursor:'pointer', fontWeight:800, color:'var(--ch-text-primary)',
              }}>−</button>
              <span style={{ fontSize:22, fontWeight:900, color:'var(--ch-text-primary)', minWidth:30, textAlign:'center' }}>{guests}</span>
              <button type="button" onClick={() => setGuests(Math.min(amenity.capacity, guests+1))} style={{
                width:38, height:38, borderRadius:99, border:'1px solid var(--ch-card-border)',
                background:'var(--ch-body-bg)', fontSize:18, cursor:'pointer', fontWeight:800, color:'var(--ch-text-primary)',
              }}>+</button>
              <span style={{ fontSize:12, color:'var(--ch-text-muted)' }}>Max: {amenity.capacity}</span>
            </div>
            {slot?.guestCharge > 0 && guests > 1 && (
              <div style={{ marginTop:6, fontSize:12, color:'var(--ch-text-muted)' }}>
                Additional guest charge: ₹{slot.guestCharge} × {guests-1} = ₹{guestCharge}
              </div>
            )}
          </div>

          {/* Price summary */}
          <div style={{ background:'var(--ch-body-bg)', borderRadius:12, padding:'14px 16px', marginBottom:20 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'var(--ch-text-muted)', marginBottom:10 }}>Booking Summary</div>
            <div style={{ display:'flex', flexDirection:'column', gap:6, fontSize:13 }}>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <span style={{ color:'var(--ch-text-muted)' }}>Slot charge</span>
                <span style={{ fontWeight:700 }}>{slot?.price===0 ? 'Free' : `₹${slot?.price}`}</span>
              </div>
              {guestCharge > 0 && (
                <div style={{ display:'flex', justifyContent:'space-between' }}>
                  <span style={{ color:'var(--ch-text-muted)' }}>Guest charges ({guests-1} guests)</span>
                  <span style={{ fontWeight:700 }}>₹{guestCharge}</span>
                </div>
              )}
              <div style={{ borderTop:'1px solid var(--ch-card-border)', paddingTop:8, display:'flex', justifyContent:'space-between', fontWeight:900, fontSize:15, color:'var(--ch-text-primary)' }}>
                <span>Total</span>
                <span style={{ color:'#6366f1' }}>{total===0 ? '🆓 Free' : `₹${total}`}</span>
              </div>
            </div>
          </div>

          <div style={{ fontSize:11, color:'var(--ch-text-muted)', marginBottom:16, lineHeight:1.5 }}>
            By confirming, you agree to the community amenity usage policy. Cancel up to 24 hours before for a full refund.
          </div>

          <button type="submit" disabled={confirming || inMaint || !slot} style={{
            ...btnPrimary, width:'100%', justifyContent:'center', padding:'13px', fontSize:14,
            background: (inMaint||!slot) ? '#9ca3af' : '#6366f1',
          }}>
            {confirming
              ? <><Loader2 size={16} style={{ animation:'spin 1s linear infinite' }}/> Processing…</>
              : total===0 ? <><CheckCircle size={16}/> Confirm Free Booking</> : <><CreditCard size={16}/> Confirm &amp; Pay ₹{total}</>}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ── Booking Confirmation ─────────────────────────────────── */
function BookingConfirm({ booking, amenity, onDone }) {
  return (
    <div style={{ maxWidth:480, margin:'0 auto', textAlign:'center' }}>
      <div style={{ background:'var(--ch-card-bg)', border:'1px solid var(--ch-card-border)', borderRadius:20, padding:'40px 32px' }}>
        <div style={{ width:72, height:72, borderRadius:99, background:'#d1fae5', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
          <CheckCircle size={36} color="#10b981" />
        </div>
        <h2 style={{ fontSize:20, fontWeight:900, color:'var(--ch-text-primary)', marginBottom:6 }}>Booking Confirmed!</h2>
        <p style={{ fontSize:13, color:'var(--ch-text-muted)', marginBottom:24, lineHeight:1.5 }}>
          Your booking for <strong>{amenity.name}</strong> has been confirmed. See you there!
        </p>

        <div style={{ background:'var(--ch-body-bg)', borderRadius:14, padding:'18px 20px', marginBottom:24, textAlign:'left' }}>
          {[
            { label:'Booking ID', val: '#' + booking.id },
            { label:'Amenity',   val: amenity.emoji + ' ' + amenity.name },
            { label:'Date',      val: fmtDate(booking.date) },
            { label:'Time',      val: booking.slotLabel },
            { label:'Guests',    val: booking.guests + ' person' + (booking.guests!==1?'s':'') },
            { label:'Amount',    val: booking.amount===0 ? 'Free' : '₹' + booking.amount },
            { label:'Status',    val: '✅ Confirmed' },
          ].map(r => (
            <div key={r.label} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid var(--ch-card-border)', fontSize:13 }}>
              <span style={{ color:'var(--ch-text-muted)', fontWeight:600 }}>{r.label}</span>
              <span style={{ fontWeight:700, color:'var(--ch-text-primary)' }}>{r.val}</span>
            </div>
          ))}
        </div>

        <button style={{ ...btnPrimary, width:'100%', justifyContent:'center', padding:'12px' }} onClick={onDone}>
          <Calendar size={16}/> View My Bookings
        </button>
      </div>
    </div>
  );
}

/* ── Admin Panel ─────────────────────────────────────────── */
function AdminView({ amenities, bookings, onBack }) {
  const today = getTodayStr();
  const todayBookings = bookings.filter(b=>b.date===today && b.status==='confirmed');
  const revenue = bookings.filter(b=>b.status==='confirmed').reduce((s,b)=>s+b.amount,0);
  const popular = amenities.map(a=>({ ...a, count:bookings.filter(b=>b.amenityId===a.id).length }))
    .sort((a,b)=>b.count-a.count)[0];

  const [uploadingId, setUploadingId] = useState(null);
  const [uploadToast, setUploadToast] = useState('');
  const [amenityImages, setAmenityImages] = useState({});
  const photoRef = useRef();
  const [targetAmenityId, setTargetAmenityId] = useState(null);

  const showUploadToast = (msg) => { setUploadToast(msg); setTimeout(() => setUploadToast(''), 3000); };

  const triggerUpload = (amenityId) => {
    setTargetAmenityId(amenityId);
    photoRef.current.click();
  };

  const handlePhotoUpload = async (e) => {
    const files = [...e.target.files];
    if (!files.length || !targetAmenityId) return;
    setUploadingId(targetAmenityId);
    try {
      const res = await amenityService.uploadImages(targetAmenityId, files);
      setAmenityImages(prev => ({ ...prev, [targetAmenityId]: res.data.images?.[0] }));
      showUploadToast('✅ Photos uploaded successfully!');
    } catch {
      showUploadToast('❌ Upload failed — amenity must be in the database first.');
    } finally {
      setUploadingId(null);
      e.target.value = '';
    }
  };

  return (
    <div style={{ maxWidth:900, margin:'0 auto' }}>
      <button style={{ ...btnSecondary, marginBottom:16 }} onClick={onBack}><ChevronLeft size={16}/> Back</button>
      <h2 style={{ fontSize:18, fontWeight:900, color:'var(--ch-text-primary)', marginBottom:20 }}>🏢 Amenity Admin Panel</h2>

      {/* Hidden file input */}
      <input ref={photoRef} type="file" multiple accept="image/*" style={{ display:'none' }} onChange={handlePhotoUpload} />

      {/* Upload toast */}
      {uploadToast && (
        <div style={{
          position:'fixed', bottom:24, right:24, zIndex:9999,
          padding:'12px 20px', borderRadius:12, background:'#1a1a2e', color:'#fff',
          fontSize:13, fontWeight:600, boxShadow:'0 8px 28px rgba(0,0,0,0.25)',
        }}>{uploadToast}</div>
      )}

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:14, marginBottom:24 }}>
        {[
          { label:"Total Amenities",     val:amenities.length,    color:'#6366f1', bg:'#ede9fe' },
          { label:"Today's Bookings",    val:todayBookings.length, color:'#3b82f6', bg:'#dbeafe' },
          { label:"Total Bookings",      val:bookings.length,      color:'#10b981', bg:'#d1fae5' },
          { label:"Total Revenue",       val:`₹${revenue.toLocaleString('en-IN')}`, color:'#f59e0b', bg:'#fef3c7' },
          { label:"Most Popular",        val:popular?.name || '—', color:'#ef4444', bg:'#fee2e2' },
          { label:"Cancelled",           val:bookings.filter(b=>b.status==='cancelled').length, color:'#6b7280', bg:'#f3f4f6' },
        ].map(s => (
          <div key={s.label} style={{ background:s.bg, borderRadius:14, padding:'14px 16px', borderLeft:`3px solid ${s.color}` }}>
            <div style={{ fontSize:20, fontWeight:900, color:s.color, marginBottom:2 }}>{s.val}</div>
            <div style={{ fontSize:11, color:s.color, fontWeight:700, opacity:0.75 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Amenity list with photo upload */}
      <div style={{ background:'var(--ch-card-bg)', border:'1px solid var(--ch-card-border)', borderRadius:16, marginBottom:20 }}>
        <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--ch-card-border)', fontSize:14, fontWeight:800, color:'var(--ch-text-primary)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          Amenities Overview
          <span style={{ fontSize:11, color:'var(--ch-text-muted)', fontWeight:400 }}>Click 📷 to upload cover photos</span>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr style={{ background:'var(--ch-body-bg)' }}>
                {['Photo','Amenity','Category','Capacity','Slots','Bookings','Status','Actions'].map(h=>(
                  <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontWeight:700, color:'var(--ch-text-muted)', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {amenities.map(a => {
                const bcount = bookings.filter(b=>b.amenityId===a.id).length;
                const inM = isInMaintenance(a, today);
                const coverImg = amenityImages[a._id || a.id] || a.image;
                return (
                  <tr key={a.id || a._id} style={{ borderTop:'1px solid var(--ch-card-border)' }}>
                    <td style={{ padding:'10px 16px' }}>
                      <div style={{ width:44, height:44, borderRadius:10, overflow:'hidden', background:'#f1f5f9', flexShrink:0 }}>
                        {coverImg
                          ? <img src={coverImg} alt={a.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                          : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>{a.emoji}</div>}
                      </div>
                    </td>
                    <td style={{ padding:'12px 16px', fontWeight:700, color:'var(--ch-text-primary)' }}>{a.emoji} {a.name}</td>
                    <td style={{ padding:'12px 16px', color:'var(--ch-text-muted)' }}>{a.category}</td>
                    <td style={{ padding:'12px 16px', color:'var(--ch-text-muted)' }}>{a.capacity}</td>
                    <td style={{ padding:'12px 16px', color:'var(--ch-text-muted)' }}>{a.slots.length}</td>
                    <td style={{ padding:'12px 16px', fontWeight:700, color:'#6366f1' }}>{bcount}</td>
                    <td style={{ padding:'12px 16px' }}>
                      <span style={{ padding:'2px 9px', borderRadius:99, fontSize:11, fontWeight:800,
                        background: inM ? '#fef3c7' : '#d1fae5', color: inM ? '#92400e' : '#065f46' }}>
                        {inM ? '🔴 Maintenance' : '🟢 Active'}
                      </span>
                    </td>
                    <td style={{ padding:'10px 16px' }}>
                      <button
                        onClick={() => triggerUpload(a._id || a.id)}
                        disabled={uploadingId === (a._id || a.id)}
                        style={{
                          display:'inline-flex', alignItems:'center', gap:5, padding:'5px 10px',
                          borderRadius:8, background:'#eff6ff', color:'#3b82f6', border:'1px solid #bfdbfe',
                          cursor:'pointer', fontSize:11, fontWeight:700,
                          opacity: uploadingId === (a._id || a.id) ? 0.6 : 1,
                        }}
                      >
                        {uploadingId === (a._id || a.id)
                          ? <><Loader2 size={11} style={{ animation:'spin 1s linear infinite' }}/> Uploading…</>
                          : <><Camera size={11}/> Upload Photo</>}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent bookings */}
      <div style={{ background:'var(--ch-card-bg)', border:'1px solid var(--ch-card-border)', borderRadius:16 }}>
        <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--ch-card-border)', fontSize:14, fontWeight:800, color:'var(--ch-text-primary)' }}>
          All Bookings ({bookings.length})
        </div>
        {bookings.length === 0 ? (
          <div style={{ padding:'32px', textAlign:'center', color:'var(--ch-text-muted)', fontSize:13 }}>No bookings yet</div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
              <thead>
                <tr style={{ background:'var(--ch-body-bg)' }}>
                  {['Booking ID','Resident','Amenity','Date','Slot','Guests','Amount','Status'].map(h=>(
                    <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontWeight:700, color:'var(--ch-text-muted)', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...bookings].reverse().map(b => {
                  const statusC = { confirmed:'#d1fae5', cancelled:'#fee2e2', completed:'#dbeafe' };
                  const statusT = { confirmed:'#065f46', cancelled:'#991b1b', completed:'#1d4ed8' };
                  return (
                    <tr key={b.id} style={{ borderTop:'1px solid var(--ch-card-border)' }}>
                      <td style={{ padding:'10px 14px', fontFamily:'monospace', fontSize:11, color:'var(--ch-text-muted)' }}>#{b.id}</td>
                      <td style={{ padding:'10px 14px', fontWeight:700, color:'var(--ch-text-primary)' }}>{b.userName}</td>
                      <td style={{ padding:'10px 14px', color:'var(--ch-text-muted)' }}>{b.amenityName}</td>
                      <td style={{ padding:'10px 14px', color:'var(--ch-text-muted)', whiteSpace:'nowrap' }}>{b.date}</td>
                      <td style={{ padding:'10px 14px', color:'var(--ch-text-muted)', whiteSpace:'nowrap' }}>{b.slotLabel}</td>
                      <td style={{ padding:'10px 14px', textAlign:'center', color:'var(--ch-text-muted)' }}>{b.guests}</td>
                      <td style={{ padding:'10px 14px', fontWeight:700, color:'#6366f1' }}>{b.amount===0?'Free':'₹'+b.amount}</td>
                      <td style={{ padding:'10px 14px' }}>
                        <span style={{ padding:'2px 9px', borderRadius:99, fontSize:11, fontWeight:800,
                          background:statusC[b.status]||'#f3f4f6', color:statusT[b.status]||'#374151', textTransform:'capitalize' }}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
