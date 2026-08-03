import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, UserCheck, Home, Key, Sparkles } from 'lucide-react';

export const DemoRoleBar = () => {
  const { user, loginAsDemoRole } = useAuth();

  const roles = [
    { key: 'SUPER_ADMIN', label: 'Super Admin', icon: Shield, bg: 'bg-purple-600 hover:bg-purple-700' },
    { key: 'COMMUNITY_ADMIN', label: 'Community Admin', icon: UserCheck, bg: 'bg-blue-600 hover:bg-blue-700' },
    { key: 'RESIDENT', label: 'Resident', icon: Home, bg: 'bg-emerald-600 hover:bg-emerald-700' },
    { key: 'SECURITY_GUARD', label: 'Security Guard', icon: Key, bg: 'bg-amber-600 hover:bg-amber-700' }
  ];

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-xs px-4 py-2 flex flex-wrap items-center justify-between gap-2 shadow-md">
      <div className="flex items-center gap-2 text-slate-300 font-medium">
        <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
        <span>Demo Credentials Switcher:</span>
        {user && (
          <span className="bg-slate-800 text-slate-200 px-2 py-0.5 rounded-full border border-slate-700">
            Active: <strong className="text-white">{user.name}</strong> ({user.role})
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {roles.map(r => {
          const Icon = r.icon;
          const isActive = user?.role === r.key;
          return (
            <button
              key={r.key}
              onClick={() => loginAsDemoRole(r.key)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-white font-medium transition-all ${
                r.bg
              } ${isActive ? 'ring-2 ring-white ring-offset-1 ring-offset-slate-900 shadow-lg' : 'opacity-85 hover:opacity-100'}`}
              title={`Switch session to ${r.label}`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{r.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
