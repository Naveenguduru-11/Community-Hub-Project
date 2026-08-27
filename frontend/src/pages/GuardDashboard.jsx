import React, { useState, useEffect } from 'react';
import { visitorService } from '../services/api';
import { CheckInModal } from '../components/visitors/CheckInModal';
import { useSocket } from '../context/SocketContext';
import { 
  Shield, QrCode, Key, LogIn, LogOut, Truck, Car, 
  ShieldAlert, Clock, CheckCircle2, Search, User, Camera 
} from 'lucide-react';

export const GuardDashboard = () => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const { triggerSOS } = useSocket();

  const fetchVisitors = async () => {
    setLoading(true);
    try {
      const res = await visitorService.getVisitors();
      setVisitors(res.data.visitors || []);
    } catch (err) {
      console.error('Failed to fetch gate logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  const handleCheckout = async (visitorId) => {
    if (confirm('Confirm visitor exit check-out?')) {
      try {
        await visitorService.checkOut(visitorId);
        fetchVisitors();
      } catch (err) {
        alert('Check-out failed');
      }
    }
  };

  const activeInside = visitors.filter(v => v.status === 'INSIDE');
  const deliveryLogs = visitors.filter(v => v.visitorType === 'DELIVERY');

  return (
    <div className="space-y-6">
      
      {/* Top Security Guard Control Bar */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold shadow-inner">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 text-xs px-2.5 py-0.5 rounded-full font-mono mb-1">
              <span>Gate 1 Controller • Active Duty</span>
            </div>
            <h1 className="text-2xl font-black">Gate Security Portal</h1>
            <p className="text-xs text-slate-400">Scan QR codes with live camera viewfinder, verify 6-digit access passes, and track delivery entries.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowCheckInModal(true)}
            className="flex items-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-amber-500/25 transition-all"
          >
            <Camera className="w-5 h-5" />
            <span>📷 Open Camera QR Scanner</span>
          </button>

          <button
            onClick={() => {
              if (confirm('🚨 BROADCAST EMERGENCY SOS TO ALL RESIDENTS & ADMINS?')) {
                triggerSOS('GATE_BREACH_ALERT', 'Main Entrance Gate 1');
              }
            }}
            className="flex items-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-500/25 transition-all animate-pulse"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>TRIGGER SOS</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 block uppercase">Visitors Inside Premises</span>
            <span className="text-3xl font-black text-amber-500 mt-1 block">{activeInside.length}</span>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
            <LogIn className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 block uppercase">Deliveries Logged Today</span>
            <span className="text-3xl font-black text-blue-500 mt-1 block">{deliveryLogs.length}</span>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl">
            <Truck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 block uppercase">Pre-Approved Passes</span>
            <span className="text-3xl font-black text-emerald-500 mt-1 block">
              {visitors.filter(v => v.status === 'PRE_APPROVED').length}
            </span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Quick Passcode Check-In Bar */}
      <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-3xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-500" />
              <span>Quick 6-Digit Passcode Gate Check-In</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              Enter visitor's 6-digit pre-approved passcode or scan QR code to grant instant entry.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setShowCheckInModal(true)}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 shrink-0"
            >
              <Camera className="w-4 h-4" />
              <span>Verify Passcode & Scan QR</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Visitor Gate Logs Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Gate Movement Logs</h3>
            <p className="text-xs text-slate-500">Live entry and exit records for current shift</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">Visitor</th>
                <th className="py-3 px-4">Visiting Villa</th>
                <th className="py-3 px-4">Type / Service</th>
                <th className="py-3 px-4">Passcode</th>
                <th className="py-3 px-4">Entry Time</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {visitors.map(v => (
                <tr key={v._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 dark:text-white block">{v.name}</span>
                    <span className="text-[11px] text-slate-400">{v.phone}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-blue-600 dark:text-blue-400">{v.villa?.villaNumber || 'V-101'}</span>
                    <span className="text-[10px] text-slate-400 block">{v.hostResident?.name}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 font-semibold text-[11px]">
                      {v.visitorType} {v.company ? `(${v.company})` : ''}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                    {v.passcode}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                    {v.entryTime ? new Date(v.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Not Checked In'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      v.status === 'INSIDE' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300' :
                      v.status === 'EXITED' ? 'bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400' :
                      'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                    }`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {v.status === 'INSIDE' ? (
                      <button
                        onClick={() => handleCheckout(v._id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] rounded-lg transition-colors"
                      >
                        Check-Out Exit
                      </button>
                    ) : v.status === 'PRE_APPROVED' ? (
                      <button
                        onClick={() => setShowCheckInModal(true)}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] rounded-lg transition-colors"
                      >
                        Scan / Check-In
                      </button>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CheckInModal
        isOpen={showCheckInModal}
        onClose={() => setShowCheckInModal(false)}
        onCheckInSuccess={() => fetchVisitors()}
      />

    </div>
  );
};
