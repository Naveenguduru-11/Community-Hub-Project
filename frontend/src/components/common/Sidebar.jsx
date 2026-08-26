import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, Users, Home, Shield, 
  QrCode, AlertCircle, Bell, CreditCard, Calendar, 
  Car, Settings 
} from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role || 'RESIDENT';

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'COMMUNITY_ADMIN', 'RESIDENT', 'SECURITY_GUARD'] },
    { label: 'Gate Security Portal', path: '/security', icon: Shield, roles: ['SUPER_ADMIN', 'COMMUNITY_ADMIN', 'SECURITY_GUARD'] },
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
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-emerald-100/80 dark:border-slate-800 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-65px)] transition-colors">
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
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-lg shadow-emerald-700/25'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-800/80 hover:text-emerald-800 dark:hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="p-4 m-3 rounded-2xl bg-emerald-50/70 dark:bg-slate-800/60 border border-emerald-100 dark:border-slate-700/60">
        <div className="flex items-center gap-2 mb-1 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
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
