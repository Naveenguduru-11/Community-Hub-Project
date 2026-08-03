import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Shield, UserCheck, Home, Key, ArrowRight, Lock, Mail } from 'lucide-react';

export const Login = () => {
  const { login, loginAsDemoRole } = useAuth();
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
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async (role) => {
    setLoading(true);
    try {
      await loginAsDemoRole(role);
      navigate('/');
    } catch (err) {
      setError('Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-4 relative overflow-hidden">
      
      {/* Dynamic Ambient Glow Background */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />

      <div className="max-w-md w-full relative z-10">
        
        {/* Logo Banner */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 items-center justify-center text-white shadow-xl shadow-blue-500/30 mb-3">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">CommunityHub</h1>
          <p className="text-sm text-slate-400 mt-1">Gated Community & Villa Management SaaS</p>
        </div>

        {/* Login Form Box */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <h2 className="text-xl font-bold text-slate-100">Welcome Back</h2>

          {error && (
            <div className="p-3 bg-red-950/50 border border-red-800 text-red-300 text-xs rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@community.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Credentials Box */}
          <div className="border-t border-slate-800 pt-5 space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">One-Click Demo Login</span>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleDemoClick('SUPER_ADMIN')}
                className="flex items-center gap-2 p-2.5 bg-slate-800/60 hover:bg-purple-950/40 border border-slate-700 hover:border-purple-600 rounded-xl text-left transition-all"
              >
                <Shield className="w-4 h-4 text-purple-400 shrink-0" />
                <div>
                  <span className="text-xs font-bold block text-slate-200">Super Admin</span>
                  <span className="text-[10px] text-slate-400">Platform Owner</span>
                </div>
              </button>

              <button
                onClick={() => handleDemoClick('COMMUNITY_ADMIN')}
                className="flex items-center gap-2 p-2.5 bg-slate-800/60 hover:bg-blue-950/40 border border-slate-700 hover:border-blue-600 rounded-xl text-left transition-all"
              >
                <UserCheck className="w-4 h-4 text-blue-400 shrink-0" />
                <div>
                  <span className="text-xs font-bold block text-slate-200">Community Admin</span>
                  <span className="text-[10px] text-slate-400">Villa Society Lead</span>
                </div>
              </button>

              <button
                onClick={() => handleDemoClick('RESIDENT')}
                className="flex items-center gap-2 p-2.5 bg-slate-800/60 hover:bg-emerald-950/40 border border-slate-700 hover:border-emerald-600 rounded-xl text-left transition-all"
              >
                <Home className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-xs font-bold block text-slate-200">Resident</span>
                  <span className="text-[10px] text-slate-400">Villa Owner</span>
                </div>
              </button>

              <button
                onClick={() => handleDemoClick('SECURITY_GUARD')}
                className="flex items-center gap-2 p-2.5 bg-slate-800/60 hover:bg-amber-950/40 border border-slate-700 hover:border-amber-600 rounded-xl text-left transition-all"
              >
                <Key className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="text-xs font-bold block text-slate-200">Security Guard</span>
                  <span className="text-[10px] text-slate-400">Gate Controller</span>
                </div>
              </button>
            </div>
          </div>

          <div className="text-center pt-2 text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-400 hover:underline font-semibold">
              Register Community / Resident
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
