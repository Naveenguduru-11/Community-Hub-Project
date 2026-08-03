import React, { useState, useEffect } from 'react';
import { analyticsService, complaintService, paymentService, noticeService } from '../services/api';
import { 
  Users, Home, CreditCard, AlertCircle, TrendingUp, 
  Plus, CheckCircle, Clock, Bell, Sparkles, FileText 
} from 'lucide-react';

export const CommunityAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [noticeForm, setNoticeForm] = useState({ title: '', content: '', category: 'GENERAL', priority: 'NORMAL' });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [sRes, cRes] = await Promise.all([
        analyticsService.getStats(),
        complaintService.getComplaints()
      ]);
      setStats(sRes.data.stats);
      setComplaints(cRes.data.complaints);
    } catch (err) {
      console.error('Failed to fetch admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMonthlyBills = async () => {
    if (confirm('Generate monthly maintenance bills (₹4,500) for August 2026 across all occupied villas?')) {
      try {
        await paymentService.generateBills({
          month: 'August 2026',
          amount: 4500
        });
        alert('Monthly maintenance invoices successfully generated!');
        fetchAdminData();
      } catch (err) {
        alert(err.response?.data?.message || 'Bill generation failed');
      }
    }
  };

  const handleUpdateComplaintStatus = async (id, status) => {
    try {
      await complaintService.updateStatus(id, { status, resolutionNotes: 'Updated by Community Admin' });
      fetchAdminData();
    } catch (err) {
      alert('Status update failed');
    }
  };

  const handlePublishNotice = async (e) => {
    e.preventDefault();
    try {
      await noticeService.createNotice(noticeForm);
      alert('Notice published and broadcast live to residents!');
      setShowNoticeModal(false);
      setNoticeForm({ title: '', content: '', category: 'GENERAL', priority: 'NORMAL' });
    } catch (err) {
      alert('Notice publishing failed');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 text-xs px-3 py-1 rounded-full font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Community Administrator HQ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">Greenfield Enclave Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Oversee villa occupancy, generate maintenance invoices, resolve tickets, and post announcements.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleGenerateMonthlyBills}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            <span>Generate Monthly Bills</span>
          </button>

          <button
            onClick={() => setShowNoticeModal(true)}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-2"
          >
            <Bell className="w-4 h-4" />
            <span>Publish Notice</span>
          </button>
        </div>
      </div>

      {/* Analytics Metric Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase">Total Residents</span>
              <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-2xl"><Users className="w-5 h-5" /></div>
            </div>
            <span className="text-3xl font-black text-slate-900 dark:text-white mt-2 block">{stats.totalResidents}</span>
            <span className="text-[11px] text-slate-400">Across {stats.totalVillas} Villas</span>
          </div>

          <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase">Active Gate Visitors</span>
              <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-2xl"><Clock className="w-5 h-5" /></div>
            </div>
            <span className="text-3xl font-black text-slate-900 dark:text-white mt-2 block">{stats.activeVisitors}</span>
            <span className="text-[11px] text-amber-600 dark:text-amber-400">Inside Premises Now</span>
          </div>

          <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase">Open Complaints</span>
              <div className="p-2.5 bg-red-500/10 text-red-500 rounded-2xl"><AlertCircle className="w-5 h-5" /></div>
            </div>
            <span className="text-3xl font-black text-slate-900 dark:text-white mt-2 block">{stats.openComplaints}</span>
            <span className="text-[11px] text-red-500">Requires Staff Action</span>
          </div>

          <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase">Maintenance Revenue</span>
              <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-2xl"><TrendingUp className="w-5 h-5" /></div>
            </div>
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2 block">₹{stats.totalRevenueCollected}</span>
            <span className="text-[11px] text-slate-400">₹{stats.pendingRevenue} Pending</span>
          </div>
        </div>
      )}

      {/* Complaints Resolution Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Resident Helpdesk Complaints</h3>
            <p className="text-xs text-slate-500">Manage and assign staff to resolve maintenance tickets</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">Ticket</th>
                <th className="py-3 px-4">Raised By / Villa</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {complaints.map(c => (
                <tr key={c._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 dark:text-white block">{c.title}</span>
                    <span className="text-[11px] text-slate-500 truncate block max-w-xs">{c.description}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-blue-600 dark:text-blue-400">{c.villa?.villaNumber || 'V-101'}</span>
                    <span className="text-[10px] text-slate-400 block">{c.raisedBy?.name}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 font-semibold text-[11px]">
                      {c.category}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-bold ${c.priority === 'HIGH' || c.priority === 'URGENT' ? 'text-red-500' : 'text-slate-600'}`}>
                      {c.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      c.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' :
                      c.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <select
                      value={c.status}
                      onChange={(e) => handleUpdateComplaintStatus(c._id, e.target.value)}
                      className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
                    >
                      <option value="OPEN">Mark OPEN</option>
                      <option value="IN_PROGRESS">Mark IN PROGRESS</option>
                      <option value="RESOLVED">Mark RESOLVED</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Publish Notice Modal */}
      {showNoticeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-4">Publish Community Notice</h3>
            <form onSubmit={handlePublishNotice} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Notice Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scheduled Water Tank Sanitization"
                  value={noticeForm.title}
                  onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Content</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Write notice details..."
                  value={noticeForm.content}
                  onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowNoticeModal(false)}
                  className="flex-1 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white font-semibold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs"
                >
                  Broadcast Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
