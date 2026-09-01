import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { paymentService, communityService, villaService } from '../services/api';
import { RazorpayModal } from '../components/payments/RazorpayModal';
import { 
  CreditCard, CheckCircle2, AlertCircle, Plus, Edit2, 
  Trash2, X, Settings, DollarSign, Zap, Wrench 
} from 'lucide-react';

export const MaintenancePage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'COMMUNITY_ADMIN' || user?.role === 'SUPER_ADMIN';

  const [payments, setPayments] = useState([]);
  const [villas, setVillas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState(null);

  // Default Maintenance Rate State
  const [maintenanceRate, setMaintenanceRate] = useState(user?.community?.maintenanceMonthlyRate || 4500);
  const [isEditingRate, setIsEditingRate] = useState(false);

  // Custom Bill Modal State
  const [showCustomBillModal, setShowCustomBillModal] = useState(false);
  const [customBillForm, setCustomBillForm] = useState({
    title: '',
    billType: 'UTILITY',
    month: 'August 2026',
    amount: '',
    dueDate: '',
    villaId: '',
    adminNotes: ''
  });

  // Edit Bill Modal State
  const [editingBill, setEditingBill] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    billType: 'MAINTENANCE',
    month: '',
    amount: '',
    dueDate: '',
    status: 'PENDING',
    adminNotes: ''
  });

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await paymentService.getPayments();
      setPayments(res.data.payments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVillas = async () => {
    try {
      const res = await villaService.getVillas();
      setVillas(res.data.villas || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPayments();
    if (isAdmin) fetchVillas();
  }, []);



  const handleUpdateRate = async (e) => {
    e.preventDefault();
    try {
      const commId = user?.community?._id || user?.community || '65f1a2b3c4d5e6f7a8b9c0d1';
      await communityService.updateRate(commId, maintenanceRate);
      alert(`Default monthly maintenance rate updated to ₹${maintenanceRate}!`);
      setIsEditingRate(false);
    } catch (err) {
      alert('Failed to update maintenance rate');
    }
  };

  const handleCreateCustomBill = async (e) => {
    e.preventDefault();
    try {
      await paymentService.createCustomBill(customBillForm);
      alert('Custom bill issued successfully!');
      setShowCustomBillModal(false);
      setCustomBillForm({
        title: '',
        billType: 'UTILITY',
        month: 'August 2026',
        amount: '',
        dueDate: '',
        villaId: '',
        adminNotes: ''
      });
      fetchPayments();
    } catch (err) {
      alert('Failed to create custom bill');
    }
  };

  const handleOpenEditBill = (p) => {
    setEditingBill(p);
    setEditForm({
      title: p.title,
      billType: p.billType || 'MAINTENANCE',
      month: p.month,
      amount: p.totalAmount,
      dueDate: p.dueDate ? new Date(p.dueDate).toISOString().split('T')[0] : '',
      status: p.status,
      adminNotes: p.adminNotes || ''
    });
  };

  const handleSaveEditBill = async (e) => {
    e.preventDefault();
    try {
      await paymentService.updateBill(editingBill._id, editForm);
      alert('Bill updated successfully!');
      setEditingBill(null);
      fetchPayments();
    } catch (err) {
      alert('Failed to update bill');
    }
  };

  const handleDeleteBill = async (id, title) => {
    if (confirm(`Delete bill "${title}"?`)) {
      try {
        await paymentService.deleteBill(id);
        fetchPayments();
      } catch (err) {
        alert('Failed to delete bill');
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>Maintenance Bills & Custom Charges</span>
            {isAdmin && (
              <span className="text-xs bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 rounded-full font-bold">
                Admin Financial Control
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isAdmin
              ? 'Set default society maintenance rates, issue custom utility/event bills, edit existing invoices, and track Razorpay payments.'
              : 'View monthly society invoices, custom charges, pay online via Razorpay, and view payment receipts.'}
          </p>
        </div>

        {isAdmin && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setIsEditingRate(!isEditingRate)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition-all"
            >
              <Settings className="w-4 h-4 text-amber-400" />
              <span>Set Default Rate</span>
            </button>

            <button
              onClick={() => setShowCustomBillModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Custom Bill</span>
            </button>
          </div>
        )}
      </div>

      {/* Admin Maintenance Rate Config Box */}
      {isAdmin && isEditingRate && (
        <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 shadow-xl animate-in fade-in slide-in-from-top-2">
          <h3 className="font-bold text-sm text-slate-200 mb-2 flex items-center gap-2">
            <Settings className="w-4 h-4 text-amber-400" />
            Set Default Monthly Maintenance Tariff Rate
          </h3>
          <form onSubmit={handleUpdateRate} className="flex items-center gap-3 max-w-md">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">₹</span>
              <input
                type="number"
                required
                min="500"
                step="100"
                value={maintenanceRate}
                onChange={(e) => setMaintenanceRate(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-colors"
            >
              Update Rate
            </button>
          </form>
        </div>
      )}

      {/* Payment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {payments.map(p => (
          <div key={p._id} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">
                    Invoice #{p.receiptNumber} • {p.billType || 'MAINTENANCE'}
                  </span>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base mt-0.5">{p.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    p.status === 'PAID' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                  }`}>
                    {p.status}
                  </span>

                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditBill(p)}
                        className="p-1.5 text-slate-400 hover:text-blue-500 transition-colors"
                        title="Edit Bill Details"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBill(p._id, p.title)}
                        className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                        title="Delete Bill"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 text-xs space-y-2 mt-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">Target Villa:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{p.villa?.villaNumber || 'V-101'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Billing Period:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{p.month}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Due Date:</span>
                  <span className="text-slate-800 dark:text-slate-200">{p.dueDate ? new Date(p.dueDate).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-800 pt-2 flex justify-between items-center">
                  <span className="font-bold text-slate-900 dark:text-white">Total Amount:</span>
                  <span className="text-xl font-black text-blue-600 dark:text-blue-400">₹{p.totalAmount}</span>
                </div>

                {p.adminNotes && (
                  <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs text-amber-800 dark:text-amber-300">
                    <span className="font-bold flex items-center gap-1 mb-0.5">
                      📝 Admin Note / Remark:
                    </span>
                    <span>{p.adminNotes}</span>
                  </div>
                )}
              </div>
            </div>

            {p.status === 'PENDING' || p.status === 'OVERDUE' ? (
              <button
                onClick={() => setSelectedBill(p)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>Pay ₹{p.totalAmount} via Razorpay</span>
              </button>
            ) : (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs rounded-xl flex items-center justify-between border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Paid on {p.paidDate ? new Date(p.paidDate).toLocaleDateString() : 'Today'}</span>
                </div>
                <span className="font-mono text-[10px] bg-emerald-100 dark:bg-emerald-900 px-2 py-0.5 rounded font-bold">
                  {p.razorpayPaymentId || 'VERIFIED'}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Inline Section: Add Custom Bill (Admin) */}
      {showCustomBillModal && (
        <div className="bg-slate-900 text-white rounded-3xl p-6 border border-blue-500/50 shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-400" />
              <span>Issue Custom / Utility / Fine Invoice</span>
            </h3>
            <button onClick={() => setShowCustomBillModal(false)} className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded-lg">
              Close Form
            </button>
          </div>

          <form onSubmit={handleCreateCustomBill} className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-6 space-y-1">
              <label className="block text-xs font-semibold text-slate-300">Bill Title</label>
              <input
                type="text"
                required
                placeholder="e.g. EV Charging Fee / Clubhouse Event"
                value={customBillForm.title}
                onChange={(e) => setCustomBillForm({ ...customBillForm, title: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-3 space-y-1">
              <label className="block text-xs font-semibold text-slate-300">Bill Category</label>
              <select
                value={customBillForm.billType}
                onChange={(e) => setCustomBillForm({ ...customBillForm, billType: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl"
              >
                <option value="UTILITY">Utility Water/Power</option>
                <option value="EV_CHARGING">EV Charging Station</option>
                <option value="EVENT_FEE">Clubhouse Event Fee</option>
                <option value="REPAIR_FINE">Property Repair Fine</option>
                <option value="OTHER">Other Custom Charge</option>
              </select>
            </div>

            <div className="md:col-span-3 space-y-1">
              <label className="block text-xs font-semibold text-slate-300">Target Villa</label>
              <select
                required
                value={customBillForm.villaId}
                onChange={(e) => setCustomBillForm({ ...customBillForm, villaId: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl"
              >
                <option value="">Select Villa</option>
                {villas.map(v => (
                  <option key={v._id} value={v._id}>{v.villaNumber} ({v.block})</option>
                ))}
                {!villas.length && <option value="villa_101">V-101 (Phase 1)</option>}
              </select>
            </div>

            <div className="md:col-span-4 space-y-1">
              <label className="block text-xs font-semibold text-slate-300">Amount (₹)</label>
              <input
                type="number"
                required
                min="1"
                placeholder="1200"
                value={customBillForm.amount}
                onChange={(e) => setCustomBillForm({ ...customBillForm, amount: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl"
              />
            </div>

            <div className="md:col-span-4 space-y-1">
              <label className="block text-xs font-semibold text-slate-300">Due Date</label>
              <input
                type="date"
                required
                value={customBillForm.dueDate}
                onChange={(e) => setCustomBillForm({ ...customBillForm, dueDate: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl"
              />
            </div>

            <div className="md:col-span-4 space-y-1">
              <label className="block text-xs font-semibold text-slate-300">Admin Note / Remark (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Calculated based on 150 kWh charging"
                value={customBillForm.adminNotes}
                onChange={(e) => setCustomBillForm({ ...customBillForm, adminNotes: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl"
              />
            </div>

            <div className="md:col-span-12 flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowCustomBillModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25"
              >
                Issue Invoice
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Inline Section: Edit Existing Bill (Admin Increase/Decrease Amount & Notes) */}
      {editingBill && (
        <div className="bg-slate-900 text-white rounded-3xl p-6 border border-amber-500/50 shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-amber-400" />
              <span>Modify Maintenance Invoice: {editingBill.title}</span>
            </h3>
            <button onClick={() => setEditingBill(null)} className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded-lg">
              Close Editor
            </button>
          </div>

          <form onSubmit={handleSaveEditBill} className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-6 space-y-1">
              <label className="block text-xs font-semibold text-slate-300">Bill Title</label>
              <input
                type="text"
                required
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl"
              />
            </div>

            {/* Increase / Decrease Amount Control Box */}
            <div className="md:col-span-6 bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2">
              <label className="block text-xs font-bold text-slate-200">
                Bill Amount Adjuster (Increase / Decrease)
              </label>
              
              <div className="flex items-center gap-2">
                <span className="font-black text-sm text-slate-400">₹</span>
                <input
                  type="number"
                  required
                  min="0"
                  value={editForm.amount}
                  onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                  className="flex-1 px-3 py-1.5 text-base font-bold bg-slate-800 border border-slate-700 rounded-xl text-blue-400"
                />
              </div>

              {/* Quick Adjustment Pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] text-slate-400 font-semibold self-center mr-1">Quick Adjust:</span>
                <button
                  type="button"
                  onClick={() => setEditForm({ ...editForm, amount: Math.max(0, Number(editForm.amount || 0) + 500) })}
                  className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-md text-[11px] font-bold hover:bg-emerald-900"
                >
                  + ₹500
                </button>
                <button
                  type="button"
                  onClick={() => setEditForm({ ...editForm, amount: Math.max(0, Number(editForm.amount || 0) + 100) })}
                  className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-md text-[11px] font-bold hover:bg-emerald-900"
                >
                  + ₹100
                </button>
                <button
                  type="button"
                  onClick={() => setEditForm({ ...editForm, amount: Math.max(0, Number(editForm.amount || 0) - 100) })}
                  className="px-2 py-0.5 bg-rose-950 text-rose-300 border border-rose-800 rounded-md text-[11px] font-bold hover:bg-rose-900"
                >
                  - ₹100
                </button>
                <button
                  type="button"
                  onClick={() => setEditForm({ ...editForm, amount: Math.max(0, Number(editForm.amount || 0) - 500) })}
                  className="px-2 py-0.5 bg-rose-950 text-rose-300 border border-rose-800 rounded-md text-[11px] font-bold hover:bg-rose-900"
                >
                  - ₹500
                </button>
              </div>
            </div>

            <div className="md:col-span-3 space-y-1">
              <label className="block text-xs font-semibold text-slate-300">Billing Period</label>
              <input
                type="text"
                value={editForm.month}
                onChange={(e) => setEditForm({ ...editForm, month: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl"
              />
            </div>

            <div className="md:col-span-3 space-y-1">
              <label className="block text-xs font-semibold text-slate-300">Payment Status</label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl font-bold"
              >
                <option value="PENDING">PENDING</option>
                <option value="PAID">PAID</option>
                <option value="OVERDUE">OVERDUE</option>
              </select>
            </div>

            <div className="md:col-span-6 space-y-1">
              <label className="block text-xs font-semibold text-slate-300">
                Admin Note / Reason for Amount Modification
              </label>
              <input
                type="text"
                placeholder="e.g. Added ₹200 late fee surcharge / Discount applied for early payment"
                value={editForm.adminNotes}
                onChange={(e) => setEditForm({ ...editForm, adminNotes: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl"
              />
            </div>

            <div className="md:col-span-12 flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingBill(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-500/25"
              >
                Save Modified Bill
              </button>
            </div>
          </form>
        </div>
      )}

      {selectedBill && (
        <RazorpayModal
          isOpen={!!selectedBill}
          onClose={() => setSelectedBill(null)}
          bill={selectedBill}
          onPaymentSuccess={() => {
            setSelectedBill(null);
            fetchPayments();
          }}
        />
      )}
    </div>
  );
};
