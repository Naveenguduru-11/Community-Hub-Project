import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, Home, Shield,
  QrCode, AlertCircle, Bell, CreditCard, Calendar,
  Car, Settings, Building2, FileText,
  Headphones, Truck, BellRing, ChevronDown, Vote, Tag, X
} from 'lucide-react';

// Role-specific navigation configs
const NAV_CONFIG = {
  SUPER_ADMIN: [
    { label: 'Dashboard',             path: '/',               icon: LayoutDashboard },
    { label: 'Communities',           path: '/communities',    icon: Building2 },
    { label: 'Apartments',            path: '/villas',         icon: Home },
    { label: 'Property Listings',     path: '/listings',       icon: Tag },
    { label: 'Residents',             path: '/residents-directory', icon: Users },
    { label: 'Maintenance & Billing', path: '/maintenance',    icon: CreditCard },
    { label: 'Complaints',            path: '/complaints',     icon: AlertCircle },
    { label: 'Vehicles',              path: '/vehicles',       icon: Car },
    { label: 'Visitors',              path: '/visitors',       icon: QrCode },
    { label: 'Announcements',         path: '/notices',        icon: BellRing },
    { label: 'Proposals & Voting',    path: '/proposals',      icon: Vote },
    { label: 'Audit Trail',           path: '/audit-trail',    icon: Shield },
    { label: 'Profile',               path: '/profile',        icon: Settings },
  ],
  COMMUNITY_ADMIN: [
    { label: 'Dashboard',             path: '/',               icon: LayoutDashboard },
    { label: 'Apartments',            path: '/villas',         icon: Home },
    { label: 'Residents',             path: '/residents-directory', icon: Users },
    { label: 'Maintenance & Billing', path: '/maintenance',    icon: CreditCard },
    { label: 'Complaints',            path: '/complaints',     icon: AlertCircle },
    { label: 'Vehicles',              path: '/vehicles',       icon: Car },
    { label: 'Visitors',              path: '/visitors',       icon: QrCode },
    { label: 'Announcements',         path: '/notices',        icon: BellRing },
    { label: 'Proposals & Voting',    path: '/proposals',      icon: Vote },
    { label: 'Audit Trail',           path: '/audit-trail',    icon: Shield },
    { label: 'Property Listings',     path: '/listings',       icon: Tag },
  ],
  RESIDENT: [
    { label: 'Dashboard',             path: '/',               icon: LayoutDashboard },
    { label: 'My Maintenance',        path: '/maintenance',    icon: CreditCard },
    { label: 'My Visitors',           path: '/visitors',       icon: QrCode },
    { label: 'My Complaints',         path: '/complaints',     icon: AlertCircle },
    { label: 'Notice Board',          path: '/notices',        icon: Bell },
    { label: 'Community Events',      path: '/events',         icon: Calendar },
    { label: 'Proposals & Voting',    path: '/proposals',      icon: Vote },
    { label: 'Properties for Sale',   path: '/listings',       icon: Tag },
    { label: 'My Vehicles',           path: '/vehicles',       icon: Car },
    { label: 'Profile & Family',      path: '/profile',        icon: Settings },
  ],
  SECURITY_GUARD: [
    { label: 'Dashboard',   path: '/',          icon: LayoutDashboard },
    { label: 'Gate Security', path: '/security', icon: Shield },
    { label: 'Visitor Logs', path: '/visitors',  icon: QrCode },
    { label: 'Deliveries',   path: '/visitors',  icon: Truck },
    { label: 'Notice Board', path: '/notices',   icon: Bell },
    { label: 'Profile',      path: '/profile',   icon: Settings },
  ],
};

const ROLE_LABEL = {
  SUPER_ADMIN:    'Super Admin',
  COMMUNITY_ADMIN:'Community Admin',
  RESIDENT:       'Resident',
  SECURITY_GUARD: 'Security Guard',
};

const ROLE_COLOR = {
  SUPER_ADMIN:    'bg-purple-100 text-purple-700',
  COMMUNITY_ADMIN:'bg-blue-100 text-blue-700',
  RESIDENT:       'bg-emerald-100 text-emerald-700',
  SECURITY_GUARD: 'bg-amber-100 text-amber-700',
};

// Hook: detect if we are on a mobile viewport
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isMobile;
}

export const Sidebar = () => {
  const { user } = useAuth();
  const role      = user?.role || 'RESIDENT';
  const navItems  = NAV_CONFIG[role] || NAV_CONFIG.RESIDENT;
  const location  = useLocation();
  const isMobile  = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  // Listen for hamburger click from Navbar via custom event
  useEffect(() => {
    const open = () => setIsOpen(true);
    window.addEventListener('ch:open-sidebar', open);
    return () => window.removeEventListener('ch:open-sidebar', open);
  }, []);

  // Close drawer on route change
  useEffect(() => { setIsOpen(false); }, [location.pathname]);

  // Deduplicate by label
  const seen = new Set();
  const filteredItems = navItems.filter(({ label }) => {
    if (seen.has(label)) return false;
    seen.add(label);
    return true;
  });

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  /* ── Inline styles — 100% React-controlled, no CSS-class dependency ── */
  const sidebarStyle = isMobile ? {
    position:   'fixed',
    top:        0,
    left:       0,
    bottom:     0,
    height:     '100vh',
    width:      '270px',
    zIndex:     400,
    background: '#ffffff',
    borderRight:'1px solid #e8eaf0',
    display:    'flex',
    flexDirection: 'column',
    overflowY:  'auto',
    transform:  isOpen ? 'translateX(0)' : 'translateX(-110%)',
    transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
    boxShadow:  isOpen ? '4px 0 40px rgba(0,0,0,0.18)' : 'none',
  } : {
    width:      'var(--ch-sidebar-w)',
    background: 'var(--ch-sidebar-bg)',
    borderRight:'1px solid var(--ch-sidebar-border)',
    display:    'flex',
    flexDirection:'column',
    minHeight:  '100vh',
    position:   'sticky',
    top:        0,
    flexShrink: 0,
    zIndex:     30,
  };

  const overlayStyle = {
    display:    (isMobile && isOpen) ? 'block' : 'none',
    position:   'fixed',
    inset:      0,
    background: 'rgba(0,0,0,0.50)',
    zIndex:     399,
  };

  return (
    <>
      {/* Backdrop overlay — closes drawer on tap */}
      <div style={overlayStyle} onClick={() => setIsOpen(false)} aria-hidden="true" />

      <aside style={sidebarStyle}>
        {/* Brand + Close button */}
        <div className="ch-sidebar-brand" style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <Link to="/" className="ch-brand-link" onClick={() => setIsOpen(false)}>
            <div className="ch-brand-icon"><Building2 size={22} /></div>
            <div>
              <span className="ch-brand-name">CommunityHub</span>
              <span className="ch-brand-tagline">Smart Living, Better Together</span>
            </div>
          </Link>
          {/* Mobile close button */}
          {isMobile && (
            <button
              onClick={() => setIsOpen(false)}
              style={{
                width:36, height:36, border:'1px solid #e8eaf0', borderRadius:9,
                background:'#f5f6fa', cursor:'pointer', display:'flex',
                alignItems:'center', justifyContent:'center', color:'#4b5563',
                flexShrink:0, marginLeft:8
              }}
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Nav items */}
        <nav className="ch-sidebar-nav">
          {filteredItems.map(item => {
            const Icon = item.icon;
            const isActive = item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.label}
                to={item.path}
                end={item.path === '/'}
                onClick={() => setIsOpen(false)}
                className={`ch-nav-item${isActive ? ' ch-nav-item--active' : ''}`}
              >
                <Icon size={18} className="ch-nav-icon" />
                <span style={{ flex:1 }}>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="ch-sidebar-spacer" />

        {/* Footer */}
        <div className="ch-sidebar-footer">
          <div className="ch-help-card">
            <div className="ch-help-header">
              <Headphones size={16} className="ch-help-icon" />
              <span className="ch-help-title">Need Help?</span>
            </div>
            <p className="ch-help-sub">We're here to help you</p>
            <button className="ch-help-btn">Contact Support</button>
          </div>
          <div className="ch-user-row">
            <div
              className="ch-user-avatar"
              style={role === 'SUPER_ADMIN' ? { background:'linear-gradient(135deg,#7c3aed,#4f46e5)' } : {}}
            >
              {initials}
            </div>
            <div className="ch-user-info">
              <span className="ch-user-name">{user?.name || 'User'}</span>
              <span className={`ch-user-role ${ROLE_COLOR[role]}`}>
                {role === 'SUPER_ADMIN' && '👑 '}{ROLE_LABEL[role]}
              </span>
            </div>
            <ChevronDown size={14} className="ch-user-chevron" />
          </div>
        </div>
      </aside>
    </>
  );
};
