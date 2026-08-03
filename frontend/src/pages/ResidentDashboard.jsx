import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { visitorService, paymentService, complaintService, noticeService, eventService } from '../services/api';
import { VisitorPassModal } from '../components/visitors/VisitorPassModal';
import { RazorpayModal } from '../components/payments/RazorpayModal';
import { ComplaintModal } from '../components/complaints/ComplaintModal';
import { 
  Home, QrCode, CreditCard, AlertCircle, Bell, Calendar, 
  Trash2, X, Plus 
} from 'lucide-react';

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

  useEffect(() => {
    fetchResidentData();
  }, []);

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
      setVisitors(vRes.data.visitors);
      setPayments(pRes.data.payments);
      setComplaints(cRes.data.complaints);
      setNotices(nRes.data.notices);
      setEvents(eRes.data.events);
    } catch (err) {
      console.error('Error fetching resident dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold mb-2">
              <Home className="w-3.5 h-3.5" />
              <span>Villa {user?.villa?.villaNumber || 'V-101'} • {user?.villa?.block || 'Royal Palms'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">Welcome, {user?.name}!</h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-xl">
              Manage your guest passes, pay maintenance, raise helpdesk tickets, and check community notices all in real-time.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowVisitorModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-blue-600 hover:bg-blue-50 font-bold text-xs rounded-xl shadow-lg transition-all"
            >
              <QrCode className="w-4 h-4" />
              <span>+ Pre-Approve Guest Pass</span>
            </button>
            
            <button
              onClick={() => setShowComplaintModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-700/80 hover:bg-blue-700 text-white font-bold text-xs rounded-xl backdrop-blur-md border border-white/20 transition-all"
            >
              <AlertCircle className="w-4 h-4" />
              <span>+ Raise Ticket</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pending Maintenance Bill Warning (If Any) */}
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
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Amount Due: <strong className="text-amber-600 dark:text-amber-400 text-sm">₹{pendingBill.totalAmount}</strong> • Due Date: {new Date(pendingBill.dueDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedBillForPayment(pendingBill)}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-500/25 transition-all"
          >
            Pay Now with Razorpay
          </button>
        </div>
      )}

      {/* Grid Overview Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Visitors Log Widget with Delete/Cancel Pass Action */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <QrCode className="w-4 h-4 text-blue-500" />
                Active Guest Passes
              </h3>
              <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-semibold px-2 py-0.5 rounded-full">
                {visitors.length} total
              </span>
            </div>

            <div className="space-y-3">
              {visitors.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No active guest passes.</p>
              ) : (
                visitors.slice(0, 3).map(v => (
                  <div key={v._id} className="p-3 bg-slate-50 dark:bg-slate-900/70 rounded-2xl border border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold block text-slate-900 dark:text-white">{v.name}</span>
                      <span className="text-[10px] text-slate-500 block">{v.visitorType} • Code: <strong className="font-mono text-blue-600">{v.passcode}</strong></span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        v.status === 'INSIDE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' :
                        v.status === 'PRE_APPROVED' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {v.status}
                      </span>
                      <button
                        onClick={() => handleDeleteVisitor(v._id, v.name)}
                        className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                        title="Cancel/Delete Guest Pass"
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
            className="mt-4 w-full py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Create New Visitor Pass
          </button>
        </div>

        {/* Helpdesk Ticket Widget with Delete Ticket Action */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                My Helpdesk Tickets
              </h3>
              <span className="text-xs bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 font-semibold px-2 py-0.5 rounded-full">
                {complaints.filter(c => c.status !== 'RESOLVED').length} open
              </span>
            </div>

            <div className="space-y-3">
              {complaints.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No active complaints raised.</p>
              ) : (
                complaints.slice(0, 3).map(c => (
                  <div key={c._id} className="p-3 bg-slate-50 dark:bg-slate-900/70 rounded-2xl border border-slate-100 dark:border-slate-700/60 text-xs flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                        <span className="truncate">{c.title}</span>
                        <span className="text-[10px] text-amber-600 shrink-0 font-semibold">{c.status}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{c.description}</p>
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
            className="mt-4 w-full py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Raise New Complaint Ticket
          </button>
        </div>

        {/* Notices Board Widget */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Bell className="w-4 h-4 text-purple-500" />
              Community Announcements
            </h3>
          </div>

          <div className="space-y-3">
            {notices.slice(0, 3).map(n => (
              <div key={n._id} className="p-3 bg-purple-50/50 dark:bg-purple-950/20 rounded-2xl border border-purple-100 dark:border-purple-900/30 text-xs">
                <span className="font-bold block text-slate-900 dark:text-white mb-0.5">{n.title}</span>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] line-clamp-2">{n.content}</p>
              </div>
            ))}
          </div>
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
