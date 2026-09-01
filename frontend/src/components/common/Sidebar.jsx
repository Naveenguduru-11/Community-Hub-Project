import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, Home, Shield,
  QrCode, AlertCircle, Bell, CreditCard, Calendar,
  Car, Settings, Building2, BarChart3, FileText,
  UserPlus, Headphones, Globe, Truck, BellRing, ChevronDown, Vote, Tag, X
} from 'lucide-react';

// Role-specific navigation configs
const NAV_CONFIG = {
  SUPER_ADMIN: [
    { label: 'Dashboard',           path: '/',               icon: LayoutDashboard },
    { label: 'Communities',         path: '/communities',    icon: Building2,  badge: 'Super' },
    { label: 'Apartments',          path: '/villas',         icon: Home },
    { label: 'Property Listings',   path: '/listings',       icon: Tag,        badge: 'Super' },
    { label: 'Residents',           path: '/residents-directory', icon: Users },
    { label: 'Maintenance & Billing', path: '/maintenance', icon: CreditCard },
    { label: 'Complaints',          path: '/complaints',     icon: AlertCircle },
    { label: 'Vehicles',            path: '/vehicles',       icon: Car },
    { label: 'Visitors',            path: '/visitors',       icon: QrCode },
    { label: 'Announcements',       path: '/notices',        icon: BellRing },
    { label: 'Proposals & Voting',  path: '/proposals',      icon: Vote },
    { label: 'Audit Trail',         path: '/audit-trail',    icon: Shield },
    { label: 'Analytics',           path: '/analytics',      icon: BarChart3,  badge: 'Super' },
    { label: 'Reports',             path: '/reports',        icon: FileText },
    { label: 'Profile',             path: '/profile',        icon: Settings },
  ],
  COMMUNITY_ADMIN: [
    { label: 'Dashboard',           path: '/',               icon: LayoutDashboard },
    { label: 'Apartments',          path: '/villas',         icon: Home },
    { label: 'Residents',           path: '/residents-directory', icon: Users },
    { label: 'Maintenance & Billing', path: '/maintenance', icon: CreditCard },
    { label: 'Complaints',          path: '/complaints',     icon: AlertCircle },
    { label: 'Vehicles',            path: '/vehicles',       icon: Car },
    { label: 'Visitors',            path: '/visitors',       icon: QrCode },
    { label: 'Announcements',       path: '/notices',        icon: BellRing },
    { label: 'Proposals & Voting',  path: '/proposals',      icon: Vote },
    { label: 'Audit Trail',         path: '/audit-trail',    icon: Shield },
    { label: 'Property Listings',   path: '/listings',       icon: Tag },
    { label: 'Reports',             path: '/reports',        icon: FileText },
  ],
  RESIDENT: [
    { label: 'Dashboard',           path: '/',               icon: LayoutDashboard },
    { label: 'My Maintenance',      path: '/maintenance',    icon: CreditCard },
    { label: 'My Visitors',         path: '/visitors',       icon: QrCode },
    { label: 'My Complaints',       path: '/complaints',     icon: AlertCircle },
    { label: 'Notice Board',        path: '/notices',        icon: Bell },
    { label: 'Community Events',    path: '/events',         icon: Calendar },
    { label: 'Proposals & Voting',  path: '/proposals',      icon: Vote },
    { label: 'Properties for Sale', path: '/listings',       icon: Tag },
    { label: 'My Vehicles',         path: '/vehicles',       icon: Car },
    { label: 'Profile & Family',    path: '/profile',        icon: Settings },
  ],
  SECURITY_GUARD: [
    { label: 'Dashboard',           path: '/',               icon: LayoutDashboard },
    { label: 'Gate Security',       path: '/security',       icon: Shield },
    { label: 'Visitor Logs',        path: '/visitors',       icon: QrCode },
    { label: 'Deliveries',          path: '/visitors',       icon: Truck },
    { label: 'Notice Board',        path: '/notices',        icon: Bell },
    { label: 'Profile',             path: '/profile',        icon: Settings },
  ],
};

const ROLE_LABEL = {
  SUPER_ADMIN: 'Super Admin',
  COMMUNITY_ADMIN: 'Community Admin',
  RESIDENT: 'Resident',
  SECURITY_GUARD: 'Security Guard',
};

const ROLE_COLOR = {
  SUPER_ADMIN: 'bg-purple-100 text-purple-700',
  COMMUNITY_ADMIN: 'bg-blue-100 text-blue-700',
  RESIDENT: 'bg-emerald-100 text-emerald-700',
  SECURITY_GUARD: 'bg-amber-100 text-amber-700',
};

// Expose a way for the Navbar to trigger sidebar open
export const openSidebar = () => window.dispatchEvent(new Event('ch:open-sidebar'));

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const role = user?.role || 'RESIDENT';
  const navItems = NAV_CONFIG[role] || NAV_CONFIG.RESIDENT;
  const [isOpen, setIsOpen] = useState(false);

  // Listen for the custom open event dispatched by the Navbar hamburger
  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener('ch:open-sidebar', handler);
    return () => window.removeEventListener('ch:open-sidebar', handler);
  }, []);

  // Close sidebar on route change (any nav click)
  const handleNavClick = () => setIsOpen(false);

  // Deduplicate by label
  const seen = new Set();
  const filteredItems = navItems.filter(item => {
    const key = item.label;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="ch-sidebar-overlay"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`ch-sidebar${isOpen ? ' ch-sidebar--open' : ''}`}>
        {/* Brand + Mobile close button */}
        <div className="ch-sidebar-brand" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" className="ch-brand-link" onClick={handleNavClick}>
            <div className="ch-brand-icon">
              <Building2 size={22} />
            </div>
            <div>
              <span className="ch-brand-name">CommunityHub</span>
              <span className="ch-brand-tagline">Smart Living, Better Together</span>
            </div>
          </Link>
          {/* Close button — only visible on mobile */}
          <button
            onClick={() => setIsOpen(false)}
            className="ch-hamburger"
            style={{ display: 'flex', marginLeft: 8 }}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="ch-sidebar-nav">
          {filteredItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.label}
                to={item.path}
                end={item.path === '/'}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `ch-nav-item${isActive ? ' ch-nav-item--active' : ''}`
                }
              >
                <Icon size={18} className="ch-nav-icon" />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && role === 'SUPER_ADMIN' && (
                  <span style={{
                    fontSize: 9, fontWeight: 800, padding: '1px 5px',
                    borderRadius: 20, background: '#7c3aed22',
                    color: '#a78bfa', border: '1px solid #7c3aed44',
                    letterSpacing: '0.3px', lineHeight: 1.4
                  }}>S</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Spacer */}
        <div className="ch-sidebar-spacer" />

        {/* User Profile Footer */}
        <div className="ch-sidebar-footer">
          {/* Need Help */}
          <div className="ch-help-card">
            <div className="ch-help-header">
              <Headphones size={16} className="ch-help-icon" />
              <span className="ch-help-title">Need Help?</span>
            </div>
            <p className="ch-help-sub">We're here to help you</p>
            <button className="ch-help-btn">Contact Support</button>
          </div>

          {/* User Info */}
          <div className="ch-user-row">
            <div className="ch-user-avatar" style={role === 'SUPER_ADMIN' ? { background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' } : {}}>
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
