import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Bell, ShieldAlert, LogOut, User, Search, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { openSidebar } from './Sidebar';

const ROLE_WELCOME = {
  SUPER_ADMIN: 'Super Admin',
  COMMUNITY_ADMIN: 'Admin',
  RESIDENT: (name) => name || 'Resident',
  SECURITY_GUARD: 'Officer',
};

const ROLE_SUBTITLE = {
  SUPER_ADMIN: "Manage all communities on the CommunityHub platform.",
  COMMUNITY_ADMIN: "Here's what's happening in your community today.",
  RESIDENT: "Here's your community activity at a glance.",
  SECURITY_GUARD: "Gate portal is live. Monitor entries and exits.",
};

function getTodayString() {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
}

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { notifications, triggerSOS } = useSocket();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const role = user?.role || 'RESIDENT';
  const displayName = role === 'RESIDENT'
    ? user?.name?.split(' ')[0] || 'Resident'
    : ROLE_WELCOME[role];

  return (
    <header className="ch-navbar">
      {/* Hamburger — mobile only */}
      <button
        className="ch-hamburger"
        onClick={() => openSidebar()}
        aria-label="Open navigation menu"
      >
        <Menu size={18} />
      </button>

      {/* Welcome + Subtitle */}
      <div className="ch-navbar-welcome">
        <h1 className="ch-navbar-title">
          Welcome back, {displayName}! <span>👋</span>
        </h1>
        <p className="ch-navbar-subtitle">{ROLE_SUBTITLE[role]}</p>
      </div>

      {/* Right Controls */}
      <div className="ch-navbar-controls">
        {/* Search — hidden on mobile via CSS */}
        <div className="ch-search-wrap">
          <Search size={15} className="ch-search-icon" />
          <input
            type="text"
            placeholder="Search..."
            className="ch-search-input"
          />
        </div>

        {/* Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="ch-icon-btn"
            title="Notifications"
          >
            <Bell size={18} />
            {notifications.length > 0 && (
              <span className="ch-notif-dot">{notifications.length}</span>
            )}
          </button>

          {showNotifications && (
            <div className="ch-dropdown ch-dropdown--notif">
              <div className="ch-dropdown-header">
                <span className="ch-dropdown-title">Notifications</span>
                <span className="ch-badge-count">{notifications.length} new</span>
              </div>
              <div className="ch-dropdown-body">
                {notifications.length === 0 ? (
                  <p className="ch-dropdown-empty">No new notifications.</p>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className="ch-notif-item">
                      <span className="ch-notif-title">{n.title}</span>
                      <p className="ch-notif-msg">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Date — hidden on mobile via CSS */}
        <div className="ch-date-pill">
          📅 {getTodayString()}
        </div>

        {/* SOS */}
        <button
          onClick={() => {
            if (confirm('⚠️ Broadcast EMERGENCY SOS to entire community?')) {
              triggerSOS('SECURITY_EMERGENCY', user?.villa ? `Villa ${user.villa.villaNumber}` : 'Community Grounds');
            }
          }}
          className="ch-sos-btn"
          title="Emergency SOS"
        >
          <ShieldAlert size={15} />
          <span>SOS</span>
        </button>

        {/* Avatar / Profile */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="ch-avatar-btn"
            >
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=6366f1&color=fff&bold=true`}
                alt={user.name}
                className="ch-avatar-img"
              />
            </button>

            {showProfileMenu && (
              <div className="ch-dropdown ch-dropdown--profile">
                <div className="ch-dropdown-header">
                  <span className="ch-dropdown-title">{user.name}</span>
                  <span className="ch-dropdown-sub">{user.email}</span>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setShowProfileMenu(false)}
                  className="ch-dropdown-item"
                >
                  <User size={14} /> My Profile
                </Link>
                <button onClick={logout} className="ch-dropdown-item ch-dropdown-item--danger">
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
