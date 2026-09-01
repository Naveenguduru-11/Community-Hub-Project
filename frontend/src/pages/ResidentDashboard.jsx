import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { visitorService, paymentService, complaintService, noticeService, eventService } from '../services/api';
import { VisitorPassModal } from '../components/visitors/VisitorPassModal';
import { RazorpayModal } from '../components/payments/RazorpayModal';
import { ComplaintModal } from '../components/complaints/ComplaintModal';
import { 
  Home, QrCode, CreditCard, AlertCircle, Bell, Calendar, 
  Trash2, Plus, Sparkles, ShieldCheck, CheckCircle2, ArrowRight, Activity, Gamepad2
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ResidentDashboard = () => {
  const { user } = useAuth();
  const [visitors, setVisitors] = useState([]);
  const [payments, setPayments] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [notices, setNotices] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showVisitorModal, setShowVisitorModal] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [selectedBillForPayment, setSelectedBillForPayment] = useState(null);

  const fetchResidentData = async () => {
    setLoading(true);
    try {
      const [vRes, pRes, cRes, nRes, eRes] = await Promise.all([
        visitorService.getVisitors(),
        paymentService.getPayments(),
        complaintService.getComplaints(),
        noticeService.getNotices(),
        eventService.getEvents()
      ]);
      const rawVisitors = vRes.data.visitors || [];
      const rawPayments = pRes.data.payments || [];
      const rawComplaints = cRes.data.complaints || [];
      const rawNotices = nRes.data.notices || [];
      const rawEvents = eRes.data.events || [];

      setVisitors(Array.from(new Map(rawVisitors.map(v => [v.passcode || v._id, v])).values()));
      setPayments(Array.from(new Map(rawPayments.map(p => [p.receiptNumber || p._id, p])).values()));
      setComplaints(Array.from(new Map(rawComplaints.map(c => [c._id || c.title, c])).values()));
      setNotices(Array.from(new Map(rawNotices.map(n => [n._id || n.title, n])).values()));
      setEvents(Array.from(new Map(rawEvents.map(e => [e._id || e.title, e])).values()));
    } catch (err) {
      console.error('Failed to load resident dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResidentData();
  }, []);

  const handleDeleteVisitor = async (id, name) => {
    if (confirm(`Cancel and delete guest pass for ${name}?`)) {
      try {
        await visitorService.deletePass(id);
        fetchResidentData();
      } catch (err) {
        alert('Failed to delete visitor pass');
      }
    }
  };

  const handleDeleteComplaint = async (id, title) => {
    if (confirm(`Delete helpdesk ticket "${title}"?`)) {
      try {
        await complaintService.deleteComplaint(id);
        fetchResidentData();
      } catch (err) {
        alert('Failed to delete complaint ticket');
      }
    }
  };

  const pendingBill = payments.find(p => p.status === 'PENDING' || p.status === 'OVERDUE');
  const openComplaintsCount = complaints.filter(c => c.status !== 'RESOLVED').length;

  return (
    <div className="space-y-6">
      
      {/* Executive Emerald Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-emerald-700/50 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 px-3.5 py-1 rounded-full text-xs font-bold mb-3 text-emerald-200 backdrop-blur-md">
              <Home className="w-3.5 h-3.5 text-amber-400" />
              <span>Villa {user?.villa?.villaNumber || user?.villaNumber || 'Flat 101'} • {user?.buildingBlock || 'Building A'}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">Welcome, {user?.name}!</h1>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1.5 max-w-xl font-medium leading-relaxed">
              Manage your QR visitor passes, pay maintenance fees, track helpdesk tickets, and host resident community games.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => setShowVisitorModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-900/40 transition-all transform hover:-translate-y-0.5"
            >
              <QrCode className="w-4 h-4" />
              <span>+ Create Guest Pass</span>
            </button>
            
            <button
              onClick={() => setShowComplaintModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs rounded-xl border border-white/20 transition-all backdrop-blur-md"
            >
              <AlertCircle className="w-4 h-4" />
              <span>+ Raise Ticket</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:border-emerald-500/40 transition-all">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Active Guest Passes</span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">{visitors.length}</span>
            <span className="text-[10px] text-emerald-600 font-bold inline-flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3 h-3" /> Gate Pass Ready
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 group-hover:scale-110 transition-transform">
            <QrCode className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:border-amber-500/40 transition-all">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Open Tickets</span>
            <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 mt-1 block">{openComplaintsCount}</span>
            <span className="text-[10px] text-amber-600 font-bold inline-flex items-center gap-1 mt-1">
              <Activity className="w-3 h-3" /> {openComplaintsCount > 0 ? 'In Resolution' : 'All Clear'}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 group-hover:scale-110 transition-transform">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:border-blue-500/40 transition-all">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Bills & Utility</span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 block">
              {pendingBill ? `₹${pendingBill.totalAmount}` : 'Paid'}
            </span>
            <span className={`text-[10px] font-bold inline-flex items-center gap-1 mt-1 ${pendingBill ? 'text-amber-600' : 'text-emerald-600'}`}>
              {pendingBill ? 'Payment Pending' : 'Up to date'}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 group-hover:scale-110 transition-transform">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:border-purple-500/40 transition-all">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Community Events</span>
            <span className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 mt-1 block">{events.length}</span>
            <span className="text-[10px] text-purple-600 font-bold inline-flex items-center gap-1 mt-1">
              <Gamepad2 className="w-3 h-3" /> Games & Sports
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 group-hover:scale-110 transition-transform">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Pending Maintenance Bill Banner */}
      {pendingBill && (
        <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500 text-white rounded-xl shadow-md">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                Maintenance Payment Pending: {pendingBill.title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                Amount Due: <strong className="text-amber-600 dark:text-amber-400 text-sm">₹{pendingBill.totalAmount}</strong> • Due Date: {new Date(pendingBill.dueDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedBillForPayment(pendingBill)}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/25 transition-all"
          >
            Pay Now with Razorpay
          </button>
        </div>
      )}

      {/* Main Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Visitors Log Widget */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <QrCode className="w-4 h-4 text-emerald-600" />
                Active Guest Passes
              </h3>
              <span className="text-[11px] bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full">
                {visitors.length} total
              </span>
            </div>

            <div className="space-y-3">
              {visitors.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <QrCode className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-400 font-medium">No active guest passes created.</p>
                </div>
              ) : (
                visitors.slice(0, 3).map(v => (
                  <div key={v._id} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold block text-slate-900 dark:text-white">{v.name}</span>
                      <span className="text-[10px] text-slate-500 block font-medium mt-0.5">{v.visitorType} • Passcode: <strong className="font-mono text-emerald-700 font-bold">{v.passcode}</strong></span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        v.status === 'INSIDE' ? 'bg-emerald-100 text-emerald-700' :
                        v.status === 'PRE_APPROVED' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {v.status}
                      </span>
                      <button
                        onClick={() => handleDeleteVisitor(v._id, v.name)}
                        className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                        title="Cancel Guest Pass"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => setShowVisitorModal(true)}
            className="mt-5 w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>Create New Visitor Pass</span>
          </button>
        </div>

        {/* Helpdesk Ticket Widget */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                My Helpdesk Tickets
              </h3>
              <span className="text-[11px] bg-amber-100 text-amber-800 font-extrabold px-2.5 py-0.5 rounded-full">
                {openComplaintsCount} open
              </span>
            </div>

            <div className="space-y-3">
              {complaints.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-400 font-medium">No helpdesk tickets raised.</p>
                </div>
              ) : (
                complaints.slice(0, 3).map(c => (
                  <div key={c._id} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                        <span className="truncate">{c.title}</span>
                        <span className="text-[10px] text-amber-600 shrink-0 font-bold">{c.status}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5 font-medium">{c.description}</p>
                    </div>

                    <button
                      onClick={() => handleDeleteComplaint(c._id, c.title)}
                      className="p-1 text-slate-400 hover:text-red-500 transition-colors shrink-0"
                      title="Delete Ticket"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => setShowComplaintModal(true)}
            className="mt-5 w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-amber-600" />
            <span>Raise New Complaint Ticket</span>
          </button>
        </div>

        {/* Notices & Events Widget */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Bell className="w-4 h-4 text-purple-600" />
                Community Announcements
              </h3>
              <Link to="/notices" className="text-[11px] text-emerald-700 font-extrabold hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {notices.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <Bell className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-400 font-medium">No community notices posted yet.</p>
                </div>
              ) : (
                notices.slice(0, 3).map(n => (
                  <div key={n._id} className="p-3 bg-purple-50/70 dark:bg-slate-800/60 rounded-2xl border border-purple-100 dark:border-slate-800 text-xs">
                    <span className="font-bold block text-slate-900 dark:text-white mb-0.5">{n.title}</span>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px] line-clamp-2 font-medium">{n.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <Link
            to="/events"
            className="mt-5 w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-extrabold rounded-xl transition-colors flex items-center justify-center gap-2 border border-emerald-200"
          >
            <Gamepad2 className="w-4 h-4 text-emerald-700" />
            <span>🎮 Host or Join Resident Games</span>
          </Link>
        </div>

      </div>

      {/* Modals */}
      <VisitorPassModal
        isOpen={showVisitorModal}
        onClose={() => setShowVisitorModal(false)}
        onPassCreated={() => fetchResidentData()}
      />

      <ComplaintModal
        isOpen={showComplaintModal}
        onClose={() => setShowComplaintModal(false)}
        onComplaintCreated={() => fetchResidentData()}
      />

      {selectedBillForPayment && (
        <RazorpayModal
          isOpen={!!selectedBillForPayment}
          onClose={() => setSelectedBillForPayment(null)}
          bill={selectedBillForPayment}
          onPaymentSuccess={() => {
            setSelectedBillForPayment(null);
            fetchResidentData();
          }}
        />
      )}

    </div>
  );
};
