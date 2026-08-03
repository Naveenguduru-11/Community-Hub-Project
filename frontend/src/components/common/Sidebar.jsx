import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, Users, Home, UserCheck, Shield, 
  QrCode, AlertCircle, Bell, CreditCard, Calendar, 
  Car, FileText, Settings 
} from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role || 'RESIDENT';

  // Super Admin has access to EVERY SINGLE FEATURE across the platform
  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'COMMUNITY_ADMIN', 'RESIDENT', 'SECURITY_GUARD'] },
    { label: 'Resident Directory', path: '/residents-directory', icon: Users, roles: ['SUPER_ADMIN', 'COMMUNITY_ADMIN'] },
    { label: 'Visitor Pass & Logs', path: '/visitors', icon: QrCode, roles: ['SUPER_ADMIN', 'COMMUNITY_ADMIN', 'RESIDENT', 'SECURITY_GUARD'] },
    { label: 'Helpdesk Complaints', path: '/complaints', icon: AlertCircle, roles: ['SUPER_ADMIN', 'COMMUNITY_ADMIN', 'RESIDENT'] },
    { label: 'Notice Board', path: '/notices', icon: Bell, roles: ['SUPER_ADMIN', 'COMMUNITY_ADMIN', 'RESIDENT', 'SECURITY_GUARD'] },
    { label: 'Maintenance Bills', path: '/maintenance', icon: CreditCard, roles: ['SUPER_ADMIN', 'COMMUNITY_ADMIN', 'RESIDENT'] },
    { label: 'Community Events', path: '/events', icon: Calendar, roles: ['SUPER_ADMIN', 'COMMUNITY_ADMIN', 'RESIDENT'] },
    { label: 'Villas & Directory', path: '/villas', icon: Home, roles: ['SUPER_ADMIN', 'COMMUNITY_ADMIN'] },
    { label: 'Vehicles & Parking', path: '/vehicles', icon: Car, roles: ['SUPER_ADMIN', 'COMMUNITY_ADMIN', 'RESIDENT', 'SECURITY_GUARD'] },
    { label: 'Profile & Family', path: '/profile', icon: Settings, roles: ['SUPER_ADMIN', 'COMMUNITY_ADMIN', 'RESIDENT', 'SECURITY_GUARD'] }
  ];

  const filteredItems = navItems.filter(item => item.roles.includes(role));

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-65px)] transition-colors">
      <div className="p-4 space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Navigation ({role.replace('_', ' ')})
        </div>

        {filteredItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="p-4 m-3 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800/80 dark:to-slate-800/40 border border-blue-100 dark:border-slate-700/60">
        <div className="flex items-center gap-2 mb-1 text-blue-600 dark:text-blue-400 font-bold text-xs">
          <Shield className="w-4 h-4" />
          <span>Active Scope</span>
        </div>
        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
          {user?.community?.name || 'Super Admin Platform Mode'}
        </p>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
          Role: {role}
        </p>
      </div>
    </aside>
  );
};
