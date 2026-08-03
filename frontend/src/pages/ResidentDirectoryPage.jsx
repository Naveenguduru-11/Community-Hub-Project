import React, { useState, useEffect } from 'react';
import { authService } from '../services/api';
import { Users, Search, UserCheck, ShieldAlert, Trash2, Mail, Phone, Home, CheckCircle2, Clock } from 'lucide-react';

export const ResidentDirectoryPage = () => {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    setLoading(true);
    try {
      const res = await authService.getAllResidents();
      setResidents(res.data.residents);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await authService.updateResidentStatus(id, newStatus);
      fetchResidents();
    } catch (err) {
      alert('Failed to update resident status');
    }
  };

  const handleDeleteResident = async (id, name) => {
    if (confirm(`Remove resident member "${name}" from community directory?`)) {
      try {
        await authService.deleteResident(id);
        fetchResidents();
      } catch (err) {
        alert('Failed to remove resident');
      }
    }
  };

  const filteredResidents = residents.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.phone && r.phone.includes(searchTerm)) ||
      (r.villa?.villaNumber && r.villa.villaNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'ALL' || (r.status || 'ACTIVE') === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Resident Directory & Status Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            View all registered resident members, monitor approval statuses, update access states, or remove members.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/50 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800 text-xs font-semibold text-blue-700 dark:text-blue-300">
          <span>Total Residents: {residents.length}</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, phone, villa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-semibold shrink-0">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">ACTIVE Only</option>
            <option value="PENDING_APPROVAL">PENDING APPROVAL</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>
      </div>

      {/* Directory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResidents.map(r => {
          const currentStatus = r.status || 'ACTIVE';
          return (
            <div key={r._id} className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={r.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                      alt={r.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{r.name}</h4>
                      <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
                        <Home className="w-3 h-3" />
                        Villa {r.villa?.villaNumber || 'V-101'} • {r.villa?.block || 'Royal Palms'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteResident(r._id, r.name)}
                    className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                    title="Remove Resident Member"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-700 text-xs space-y-1.5 mt-3">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{r.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{r.phone || '+91 91234 56789'}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 dark:border-slate-800 pt-1.5 mt-1 text-[11px]">
                    <span className="text-slate-400">Family Members:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{r.familyMembers?.length || 0} Registered</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-700 pt-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Status:</span>
                <select
                  value={currentStatus}
                  onChange={(e) => handleStatusChange(r._id, e.target.value)}
                  className={`text-xs font-bold px-3 py-1 rounded-xl border focus:outline-none ${
                    currentStatus === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300' :
                    currentStatus === 'PENDING_APPROVAL' ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300' :
                    'bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="PENDING_APPROVAL">PENDING APPROVAL</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
