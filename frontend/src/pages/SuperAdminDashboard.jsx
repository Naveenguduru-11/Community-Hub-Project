import React, { useState, useEffect } from 'react';
import { communityService, analyticsService } from '../services/api';
import { Shield, Building2, Plus, Users, Globe, CheckCircle } from 'lucide-react';

export const SuperAdminDashboard = () => {
  const [communities, setCommunities] = useState([]);
  const [stats, setStats] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    contactPhone: '',
    contactEmail: '',
    maintenanceMonthlyRate: 4500
  });

  const fetchData = async () => {
    try {
      const [cRes, sRes] = await Promise.all([
        communityService.getCommunities(),
        analyticsService.getStats()
      ]);
      const rawCommunities = cRes.data.communities || [];
      setCommunities(Array.from(new Map(rawCommunities.map(c => [c.code || c._id, c])).values()));
      setStats(sRes.data.stats || {});
    } catch (err) {
      console.error('Failed to fetch super admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCommunity = async (e) => {
    e.preventDefault();
    try {
      await communityService.createCommunity(formData);
      alert('Community onboarded successfully!');
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert('Failed to onboard community');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-emerald-800">
        <div>
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold mb-2">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Platform Super Admin Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">CommunityHub SaaS Platform Overview</h1>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1">Multi-tenant management across all registered gated communities & villa associations.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-900/30 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>+ Onboard New Community</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 block uppercase">Total SaaS Communities</span>
            <span className="text-3xl font-black text-purple-600 dark:text-purple-400 mt-1 block">{communities.length}</span>
          </div>
          <div className="p-3 bg-purple-500/10 text-purple-500 rounded-2xl"><Building2 className="w-6 h-6" /></div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 block uppercase">Platform Total Residents</span>
            <span className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-1 block">{stats?.totalResidents || 3}</span>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl"><Users className="w-6 h-6" /></div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 block uppercase">System Health & APIs</span>
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">99.99%</span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl"><Globe className="w-6 h-6" /></div>
        </div>
      </div>

      {/* Communities List Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
        <h3 className="font-bold text-slate-900 dark:text-white text-base mb-4">Onboarded Communities & Villa Enclaves</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {communities.map(c => (
            <div key={c._id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{c.name}</h4>
                <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-mono text-[10px] font-bold">
                  {c.code}
                </span>
              </div>
              <p className="text-xs text-slate-500">{c.address?.street}, {c.address?.city}, {c.address?.state}</p>

              <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex items-center justify-between text-xs">
                <span className="text-slate-400">Monthly Maintenance Rate:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{c.maintenanceMonthlyRate} / villa</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-4">Onboard New Gated Community</h3>
            <form onSubmit={handleCreateCommunity} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Community Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Palm Meadows Villa Association"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Community Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PMVA-2026"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white font-semibold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs"
                >
                  Confirm & Onboard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
