import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSocket } from '../../context/SocketContext';
import { 
  Sun, Moon, Bell, ShieldAlert, LogOut, User, 
  Building2, Search 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, triggerSOS } = useSocket();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleSOSTrigger = () => {
    if (confirm('⚠️ Are you sure you want to broadcast an EMERGENCY SOS to the entire community & security gate?')) {
      triggerSOS('SECURITY_EMERGENCY', user?.villa ? `Villa ${user.villa.villaNumber}` : 'Community Grounds');
    }
  };

  return (
    <header className="bg-white dark:bg-slate-900 backdrop-blur-md border-b border-emerald-100/80 dark:border-slate-800 sticky top-0 z-40 transition-colors">
      <div className="px-4 lg:px-8 py-3 flex items-center justify-between gap-4">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                CommunityHub <span className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-bold">SaaS</span>
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 block -mt-0.5 font-medium">
                {user?.community?.name || 'Community Hub For All Solutions'}
              </span>
            </div>
          </Link>
        </div>

        {/* Global Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search residents, visitors, complaints, notices..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Emergency SOS Button */}
          <button
            onClick={handleSOSTrigger}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs shadow-md shadow-red-500/20 active:scale-95 transition-all animate-pulse"
            title="Trigger Emergency SOS Alert"
          >
            <ShieldAlert className="w-4 h-4" />
            <span className="hidden sm:inline">EMERGENCY SOS</span>
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle Dark/Light Mode"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
          </button>

          {/* Notifications Center */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-colors"
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-emerald-600 rounded-full ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-3 mb-2">
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Bell className="w-4 h-4 text-emerald-500" />
                    Live Activity Stream
                  </h4>
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                    {notifications.length} new
                  </span>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/50">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No real-time notifications yet.
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className="py-2.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-700/30 px-2 rounded-lg transition-colors">
                        <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-white">
                          <span>{n.title}</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            {new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 mt-1">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar Dropdown */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                  alt={user.name}
                  className="w-9 h-9 rounded-xl object-cover ring-2 ring-emerald-500/40"
                />
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-bold text-slate-900 dark:text-white leading-snug">{user.name}</div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">{user.role}</div>
                </div>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700/60">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{user.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  >
                    <User className="w-4 h-4 text-emerald-500" />
                    <span>My Profile & Family</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </header>
  );
};
