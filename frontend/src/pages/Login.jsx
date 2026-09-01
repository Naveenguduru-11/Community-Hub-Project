import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Shield, UserCheck, Home, Key, ArrowRight, Lock, Mail, UserPlus } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(msg || 'Login failed. Please check your email and password, then try again.');
    } finally {
      setLoading(false);
    }
  };

  const userRolesList = [
    {
      roleKey: 'SUPER_ADMIN',
      title: 'Super Admin',
      subtitle: 'Platform Owner',
      description: 'Multi-tenant community onboarding, global metrics & SaaS management.',
      icon: Shield,
      cardBg: 'bg-purple-50 hover:bg-purple-100/80 border-purple-200',
      badgeBg: 'bg-purple-600 text-white',
      iconBg: 'bg-purple-100 text-purple-700',
      textColor: 'text-purple-950'
    },
    {
      roleKey: 'COMMUNITY_ADMIN',
      title: 'Community Admin',
      subtitle: 'Villa Society Lead',
      description: 'Villa occupancy, monthly maintenance billing, helpdesk resolution & broadcasts.',
      icon: UserCheck,
      cardBg: 'bg-blue-50 hover:bg-blue-100/80 border-blue-200',
      badgeBg: 'bg-blue-600 text-white',
      iconBg: 'bg-blue-100 text-blue-700',
      textColor: 'text-blue-950'
    },
    {
      roleKey: 'RESIDENT',
      title: 'Resident / Owner',
      subtitle: 'Villa Member',
      description: 'QR visitor passes, Razorpay maintenance payments, complaints & events.',
      icon: Home,
      cardBg: 'bg-emerald-50 hover:bg-emerald-100/80 border-emerald-200',
      badgeBg: 'bg-emerald-600 text-white',
      iconBg: 'bg-emerald-100 text-emerald-700',
      textColor: 'text-emerald-950'
    },
    {
      roleKey: 'SECURITY_GUARD',
      title: 'Security Guard',
      subtitle: 'Gate Controller',
      description: 'Live webcam QR scanner, 6-digit passcode gate verification & emergency SOS.',
      icon: Key,
      cardBg: 'bg-amber-50 hover:bg-amber-100/80 border-amber-200',
      badgeBg: 'bg-amber-600 text-white',
      iconBg: 'bg-amber-100 text-amber-800',
      textColor: 'text-amber-950'
    }
  ];

  return (
    <div className="min-h-screen relative flex flex-col justify-center items-center p-4 sm:p-6 overflow-hidden bg-slate-900">

      {/* Background photo — unchanged */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=2400&q=95')`
        }}
      />
      <div className="absolute inset-0 bg-slate-900/15" />

      {/*
        ── OUTER WRAPPER ──
        Mobile:  tighter vertical margin + smaller gap between cards
        Desktop: original my-6 / space-y-6 / gap-6 — unchanged via lg: prefix
      */}
      <div className="max-w-5xl w-full space-y-3 lg:space-y-6 my-3 lg:my-6 z-10 relative">

        {/* ── HEADER ── */}
        <div className="text-center space-y-1 lg:space-y-2">
          <div className="flex items-center justify-center gap-3">
            {/* Logo: slightly smaller on mobile, original size on desktop */}
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
              <Building2 className="w-6 h-6 lg:w-7 lg:h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight drop-shadow-md">
              CommunityHub
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-white/95 font-bold drop-shadow-sm">
            Gated Community &amp; Villa Management Portal
          </p>
        </div>

        {/*
          ── MAIN GRID ──
          Mobile:  1 column, gap-3
          Desktop: 12-column, gap-6 — unchanged
        */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-6 items-stretch">

          {/*
            ── SIGN IN CARD ──
            MOBILE  → order-1 (renders FIRST — immediately visible on page open)
            DESKTOP → order-2 lg:col-span-5 (right column, unchanged)
          */}
          <div className="order-1 lg:order-2 lg:col-span-5 bg-white/88 backdrop-blur-xl border border-white/90 rounded-3xl p-5 sm:p-6 lg:p-7 shadow-2xl flex flex-col justify-between space-y-4 lg:space-y-6">
            <div>
              <div className="pb-3 border-b border-slate-100 mb-4">
                <h2 className="text-xl font-bold text-slate-900">Account Sign In</h2>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">Sign in with your email address and password.</p>
              </div>

              {error && (
                <div className="p-3 mb-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-bold">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none placeholder-slate-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none placeholder-slate-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 mt-2"
                >
                  <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            <div className="border-t border-slate-100 pt-4 text-center text-xs text-slate-500 font-medium">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:underline font-bold">
                Register Here
              </Link>
            </div>
          </div>

          {/*
            ── SUPPORTED ROLES CARD ──
            MOBILE  → order-2 (renders BELOW the login form)
            DESKTOP → order-1 lg:col-span-7 (left column, unchanged)
          */}
          <div className="order-2 lg:order-1 lg:col-span-7 bg-white/85 backdrop-blur-xl border border-white/90 rounded-3xl p-5 sm:p-6 lg:p-7 shadow-2xl flex flex-col justify-between space-y-4 lg:space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3 lg:mb-4 pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <span>Supported User Roles</span>
                  </h2>
                  <p className="text-xs text-slate-500">Click any role card below to register a new user.</p>
                </div>
                <span className="text-[11px] font-mono px-3 py-1 bg-slate-100 text-slate-700 font-bold rounded-full border border-slate-200">
                  4 Roles
                </span>
              </div>

              {/*
                Role cards:
                Mobile  → always 2-column grid, compact padding, hide long descriptions + badges to save height
                Desktop → 2-column grid with full padding & descriptions (sm:block restores them)
              */}
              <div className="grid grid-cols-2 gap-2.5 lg:gap-3.5">
                {userRolesList.map(r => {
                  const Icon = r.icon;
                  return (
                    <div
                      key={r.roleKey}
                      onClick={() => navigate(`/register?role=${r.roleKey}`)}
                      className={`p-3 lg:p-4 ${r.cardBg} rounded-2xl border cursor-pointer transition-all duration-200 space-y-1.5 lg:space-y-2 group shadow-sm hover:shadow-md`}
                    >
                      <div className="flex items-center justify-between">
                        <div className={`p-1.5 lg:p-2 rounded-xl ${r.iconBg}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        {/* Subtitle badge: hidden on small mobile, shown sm+ */}
                        <span className={`hidden sm:inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${r.badgeBg}`}>
                          {r.subtitle}
                        </span>
                      </div>

                      <div>
                        <h3 className={`font-extrabold text-xs sm:text-sm ${r.textColor} group-hover:text-blue-600 transition-colors`}>
                          {r.title}
                        </h3>
                        {/* Description: hidden on mobile to keep cards compact, shown sm+ */}
                        <p className="hidden sm:block text-[11px] text-slate-600 leading-snug mt-1 font-medium">
                          {r.description}
                        </p>
                      </div>

                      <div className="text-[11px] font-bold text-blue-600 flex items-center gap-1 pt-0.5">
                        {/* Short label on mobile, full label on sm+ */}
                        <span className="sm:hidden">Register →</span>
                        <span className="hidden sm:inline">Register as {r.title}</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform hidden sm:inline" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 lg:pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-slate-600 font-medium">No account registered yet?</span>
              <Link
                to="/register"
                className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Create Account Now</span>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
