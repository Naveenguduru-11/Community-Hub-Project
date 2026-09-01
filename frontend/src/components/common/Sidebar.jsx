import React, { useEffect, useCallback, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, Home, Shield, QrCode,
  AlertCircle, Bell, CreditCard, Calendar, Car,
  Settings, Building2, Headphones, Truck, BellRing,
  Vote, Tag, X, UserCheck, Wrench, LogOut, ShoppingBag, Dumbbell
} from 'lucide-react';

/* ── Navigation configs per role ──────────────────────────── */
const NAV_CONFIG = {
  SUPER_ADMIN: [
    { label: 'Dashboard',             path: '/',                    icon: LayoutDashboard },
    { label: 'Communities',           path: '/communities',         icon: Building2 },
    { label: 'Apartments',            path: '/villas',              icon: Home },
    { label: 'Property Listings',     path: '/listings',            icon: Tag },
    { label: 'Residents',             path: '/residents-directory', icon: Users },
    { label: 'Maintenance & Billing', path: '/maintenance',         icon: CreditCard },
    { label: 'Complaints',            path: '/complaints',          icon: AlertCircle },
    { label: 'Vehicles',              path: '/vehicles',            icon: Car },
    { label: 'Visitors',              path: '/visitors',            icon: QrCode },
    { label: 'Announcements',         path: '/notices',             icon: BellRing },
    { label: 'Marketplace',           path: '/marketplace',         icon: ShoppingBag },
    { label: 'Clubs & Amenities',     path: '/amenities',           icon: Dumbbell },
    { label: 'Proposals & Voting',    path: '/proposals',           icon: Vote },
    { label: 'Audit Trail',           path: '/audit-trail',         icon: Shield },
    { label: 'Profile',               path: '/profile',             icon: Settings },
  ],
  COMMUNITY_ADMIN: [
    { label: 'Dashboard',             path: '/',                    icon: LayoutDashboard },
    { label: 'Apartments',            path: '/villas',              icon: Home },
    { label: 'Residents',             path: '/residents-directory', icon: Users },
    { label: 'Maintenance & Billing', path: '/maintenance',         icon: CreditCard },
    { label: 'Complaints',            path: '/complaints',          icon: AlertCircle },
    { label: 'Vehicles',              path: '/vehicles',            icon: Car },
    { label: 'Visitors',              path: '/visitors',            icon: QrCode },
    { label: 'Announcements',         path: '/notices',             icon: BellRing },
    { label: 'Marketplace',           path: '/marketplace',         icon: ShoppingBag },
    { label: 'Clubs & Amenities',     path: '/amenities',           icon: Dumbbell },
    { label: 'Proposals & Voting',    path: '/proposals',           icon: Vote },
    { label: 'Audit Trail',           path: '/audit-trail',         icon: Shield },
    { label: 'Property Listings',     path: '/listings',            icon: Tag },
    { label: 'Profile',               path: '/profile',             icon: Settings },
  ],
  RESIDENT: [
    { label: 'Dashboard',               path: '/',            icon: LayoutDashboard },
    { label: 'Guest & Visitor Passes',  path: '/visitors',    icon: UserCheck },
    { label: 'Helpdesk & Tickets',      path: '/complaints',  icon: Wrench },
    { label: 'Maintenance Payments',    path: '/maintenance', icon: CreditCard },
    { label: 'Community Events',        path: '/events',      icon: Calendar },
    { label: 'Notice Board',            path: '/notices',     icon: Bell },
    { label: 'Marketplace',             path: '/marketplace', icon: ShoppingBag },
    { label: 'Clubs & Amenities',       path: '/amenities',   icon: Dumbbell },
    { label: 'Proposals & Voting',      path: '/proposals',   icon: Vote },
    { label: 'Properties for Sale',     path: '/listings',    icon: Tag },
    { label: 'My Vehicles',             path: '/vehicles',    icon: Car },
    { label: 'Profile Settings',        path: '/profile',     icon: Settings },
  ],
  SECURITY_GUARD: [
    { label: 'Dashboard',        path: '/',           icon: LayoutDashboard },
    { label: 'Gate Security',    path: '/security',   icon: Shield },
    { label: 'Visitor Logs',     path: '/visitors',   icon: QrCode },
    { label: 'Deliveries',       path: '/visitors',   icon: Truck },
    { label: 'Amenity Bookings', path: '/amenities',  icon: Dumbbell },
    { label: 'Notice Board',     path: '/notices',    icon: Bell },
    { label: 'Profile',          path: '/profile',    icon: Settings },
  ],
};

const ROLE_LABEL = {
  SUPER_ADMIN:    'Super Admin',
  COMMUNITY_ADMIN:'Community Admin',
  RESIDENT:       'Resident',
  SECURITY_GUARD: 'Security Guard',
};

/* ── Detect mobile via matchMedia ── */
function useIsMobile() {
  const [mobile, setMobile] = useState(
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 768px)').matches : false
  );
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const fn = (e) => setMobile(e.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);
  return mobile;
}

/* ══════════════════════════════════════════════════════════ */
export const Sidebar = ({ isOpen = false, onClose = () => {} }) => {
  const { user, logout } = useAuth();
  const location  = useLocation();
  const isMobile  = useIsMobile();
  const role      = user?.role || 'RESIDENT';
  const navItems  = NAV_CONFIG[role] || NAV_CONFIG.RESIDENT;

  /* Deduplicate */
  const seen  = new Set();
  const items = navItems.filter(({ label }) => {
    if (seen.has(label)) return false;
    seen.add(label);
    return true;
  });

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  /* Escape key */
  const handleKey = useCallback((e) => { if (e.key === 'Escape') onClose(); }, [onClose]);
  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  /* Route change → close */
  useEffect(() => { onClose(); }, [location.pathname]);

  /* Body scroll lock on mobile when open */
  useEffect(() => {
    if (isMobile) {
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen, isMobile]);

  /* ─────────────────────────────────────────────────────────
     INLINE STYLES — pure React, zero CSS class dependency
  ───────────────────────────────────────────────────────── */
  const backdropStyle = {
    display:       isMobile ? 'block' : 'none',
    position:      'fixed',
    top:           0, left: 0, right: 0, bottom: 0,
    background:    'rgba(0, 0, 0, 0.55)',
    backdropFilter:'blur(2px)',
    zIndex:        9998,
    opacity:       isOpen ? 1 : 0,
    pointerEvents: isOpen ? 'auto' : 'none',
    transition:    'opacity 0.28s ease',
  };

  const sidebarStyle = isMobile
    ? {
        /* Mobile: fixed drawer from left */
        position:   'fixed',
        top:        0,
        left:       0,
        height:     '100vh',
        width:      '280px',
        zIndex:     9999,
        background: '#ffffff',
        borderRight:'1px solid #e8eaf0',
        boxShadow:  '6px 0 40px rgba(0,0,0,0.20)',
        display:    'flex',
        flexDirection:'column',
        overflowY:  'auto',
        overflowX:  'hidden',
        transform:  isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        willChange: 'transform',
      }
    : {
        /* Desktop: sticky sidebar */
        width:         'var(--ch-sidebar-w)',
        background:    'var(--ch-sidebar-bg)',
        borderRight:   '1px solid var(--ch-sidebar-border)',
        display:       'flex',
        flexDirection: 'column',
        minHeight:     '100vh',
        position:      'sticky',
        top:           0,
        flexShrink:    0,
        zIndex:        30,
        overflowY:     'auto',
      };

  return (
    <>
      {/* ── Dark backdrop (mobile only) ── */}
      <div style={backdropStyle} onClick={onClose} aria-hidden="true" />

      {/* ── Sidebar panel ── */}
      <aside style={sidebarStyle}>

        {/* Brand + Close */}
        <div style={{
          padding: '16px 18px',
          borderBottom: '1px solid #e8eaf0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          flexShrink: 0,
        }}>
          <Link
            to="/"
            onClick={onClose}
            style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none' }}
          >
            <div style={{
              width:38, height:38, borderRadius:10,
              background:'linear-gradient(135deg,#6366f1,#8b5cf6)',
              display:'flex', alignItems:'center', justifyContent:'center',
              color:'#fff', flexShrink:0,
              boxShadow:'0 4px 12px rgba(99,102,241,0.35)',
            }}>
              <Building2 size={22} color="#fff" />
            </div>
            <div>
              <span style={{ display:'block', fontSize:14, fontWeight:800, color:'#1a1a2e', letterSpacing:'-0.3px' }}>
                CommunityHub
              </span>
              <span style={{ display:'block', fontSize:10, color:'#6b7280', fontWeight:500, marginTop:1 }}>
                Smart Living, Better Together
              </span>
            </div>
          </Link>

          {/* Close button — always rendered, hidden on desktop via display:none */}
          {isMobile && (
            <button
              onClick={onClose}
              aria-label="Close menu"
              style={{
                width:34, height:34, border:'1px solid #e8eaf0', borderRadius:9,
                background:'#f5f6fa', cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center',
                color:'#4b5563', flexShrink:0,
              }}
            >
              <X size={17} />
            </button>
          )}
        </div>

        {/* User identity strip */}
        <div style={{
          padding: '12px 16px',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexShrink: 0,
        }}>
          <div style={{
            width:40, height:40, borderRadius:12,
            background:'rgba(255,255,255,0.22)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:15, fontWeight:800, color:'#fff', flexShrink:0,
          }}>
            {initials}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontWeight:800, fontSize:13, color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {user?.name || 'User'}
            </div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.75)', marginTop:1 }}>
              {ROLE_LABEL[role]}
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <nav style={{ padding:'10px 10px', display:'flex', flexDirection:'column', gap:2, flex:1, overflowY:'auto' }}>
          {items.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={label}
              to={path}
              end={path === '/'}
              onClick={onClose}
              style={({ isActive }) => ({
                display:        'flex',
                alignItems:     'center',
                gap:            10,
                padding:        '9px 12px',
                borderRadius:   10,
                fontSize:       13,
                fontWeight:     600,
                textDecoration: 'none',
                transition:     'all 0.15s ease',
                cursor:         'pointer',
                color:          isActive ? '#ffffff' : '#4b5563',
                background:     isActive ? '#6366f1' : 'transparent',
                boxShadow:      isActive ? '0 4px 12px rgba(99,102,241,0.3)' : 'none',
              })}
            >
              <Icon size={18} style={{ flexShrink:0 }} />
              <span style={{ flex:1 }}>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Spacer */}
        <div style={{ flex:'0 0 8px' }} />

        {/* Footer */}
        <div style={{
          padding:'12px 10px 16px',
          borderTop:'1px solid #e8eaf0',
          display:'flex', flexDirection:'column', gap:10,
          flexShrink:0,
        }}>
          {/* Need Help card */}
          <div style={{
            background:'linear-gradient(135deg,#1e1b4b,#312e81)',
            borderRadius:14, padding:14, color:'#fff',
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:3 }}>
              <Headphones size={16} color="#a5b4fc" />
              <span style={{ fontSize:12, fontWeight:700 }}>Need Help?</span>
            </div>
            <p style={{ fontSize:10, color:'#c7d2fe', marginBottom:10 }}>We're here to help you</p>
            <button style={{
              width:'100%', padding:'7px 0',
              background:'rgba(255,255,255,0.12)',
              border:'1px solid rgba(255,255,255,0.2)',
              borderRadius:8, color:'#fff', fontSize:11, fontWeight:700, cursor:'pointer',
            }}>Contact Support</button>
          </div>

          {/* Sign Out */}
          <button
            onClick={() => { onClose(); logout(); }}
            style={{
              display:'flex', alignItems:'center', gap:10, width:'100%',
              padding:'10px 12px', borderRadius:10,
              background:'#fef2f2', border:'1px solid #fca5a5',
              color:'#ef4444', fontSize:13, fontWeight:700, cursor:'pointer',
            }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};
