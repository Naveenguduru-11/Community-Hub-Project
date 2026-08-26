import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Building2, Shield, UserCheck, Home, Key, ArrowRight, User, Mail, Phone, Lock, UserPlus } from 'lucide-react';

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') || 'RESIDENT';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: initialRole,
    buildingBlock: 'Building A',
    floorNumber: 'Floor 1',
    villaNumber: 'Flat 101'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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
      
      {/* Luxury Modern Apartment & Gated Community Background Photo - Crisp & Clear */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=2400&q=95')` 
        }}
      />

      {/* Crystal Clear Light Overlay */}
      <div className="absolute inset-0 bg-slate-900/15" />
      
      <div className="max-w-5xl w-full space-y-6 my-6 z-10 relative">
        
        {/* Header Title */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
              <Building2 className="w-7 h-7" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">
              CommunityHub
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-white/95 font-bold drop-shadow-sm">
            Gated Community & Villa Management Portal
          </p>
        </div>

        {/* 2-Column Main Layout: Supported User Roles Panel + Register Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Column: Supported User Roles Card */}
          <div className="lg:col-span-7 bg-white/88 backdrop-blur-xl border border-white/90 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <span>Supported User Roles</span>
                  </h2>
                  <p className="text-xs text-slate-500">Click any role card below to select your registration role.</p>
                </div>
                <span className="text-[11px] font-mono px-3 py-1 bg-slate-100 text-slate-700 font-bold rounded-full border border-slate-200">
                  4 Roles
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {userRolesList.map(r => {
                  const Icon = r.icon;
                  const isSelected = formData.role === r.roleKey;
                  return (
                    <div
                      key={r.roleKey}
                      onClick={() => setFormData({ ...formData, role: r.roleKey })}
                      className={`p-4 ${r.cardBg} rounded-2xl border cursor-pointer transition-all duration-200 space-y-2 group shadow-sm hover:shadow-md ${
                        isSelected ? 'ring-2 ring-blue-600 shadow-md scale-[1.02]' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className={`p-2 rounded-xl ${r.iconBg}`}>
                          <Icon className="w-4.5 h-4.5" />
                        </div>
                        <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${r.badgeBg}`}>
                          {r.subtitle}
                        </span>
                      </div>

                      <div>
                        <h3 className={`font-extrabold text-sm ${r.textColor} group-hover:text-blue-600 transition-colors`}>
                          {r.title}
                        </h3>
                        <p className="text-[11px] text-slate-600 leading-snug mt-1 font-medium">
                          {r.description}
                        </p>
                      </div>

                      <div className="text-[11px] font-bold text-blue-600 flex items-center gap-1 pt-1">
                        <span>{isSelected ? '✓ Selected Role' : `Select ${r.title}`}</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-slate-600 font-medium">Already registered on CommunityHub?</span>
              <Link
                to="/login"
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl border border-slate-300 transition-all flex items-center justify-center gap-2"
              >
                <span>Sign In Here</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Column: Register Form White Card */}
          <div className="lg:col-span-5 bg-white/88 backdrop-blur-xl border border-white/90 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col justify-between space-y-5">
            <div>
              <div className="pb-3 border-b border-slate-100 flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Create Account</h2>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">Register for villa, admin, or gate access.</p>
                </div>
                <span className="text-[10px] font-mono font-bold px-2.5 py-1 bg-blue-100 text-blue-800 border border-blue-200 rounded-full uppercase">
                  {formData.role}
                </span>
              </div>

              {error && (
                <div className="p-3 mb-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-bold">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vikram Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none placeholder-slate-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="name@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none placeholder-slate-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Mobile Phone</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none placeholder-slate-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">User Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-blue-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                    >
                      <option value="RESIDENT">Resident / Owner</option>
                      <option value="COMMUNITY_ADMIN">Community Admin</option>
                      <option value="SECURITY_GUARD">Security Guard</option>
                      <option value="SUPER_ADMIN">Super Admin</option>
                    </select>
                  </div>
                </div>

                {/* Residence Details */}
                <div className="bg-blue-50/70 p-3 rounded-2xl border border-blue-100 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-blue-900">
                    <Home className="w-3.5 h-3.5 text-blue-600" />
                    <span>Residence Location (Building, Floor & Flat/Villa)</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">Building / Block</label>
                      <input
                        type="text"
                        required
                        placeholder="Building A"
                        value={formData.buildingBlock}
                        onChange={(e) => setFormData({ ...formData, buildingBlock: e.target.value })}
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">Floor No.</label>
                      <input
                        type="text"
                        required
                        placeholder="Floor 1"
                        value={formData.floorNumber}
                        onChange={(e) => setFormData({ ...formData, floorNumber: e.target.value })}
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">Flat / Villa No.</label>
                      <input
                        type="text"
                        required
                        placeholder="Flat 101"
                        value={formData.villaNumber}
                        onChange={(e) => setFormData({ ...formData, villaNumber: e.target.value })}
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900"
                      />
                    </div>
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
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none placeholder-slate-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 mt-2"
                >
                  <span>{loading ? 'Creating Account...' : 'Register Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            <div className="border-t border-slate-100 pt-3 text-center text-xs text-slate-500 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:underline font-bold">
                Sign In Here
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
