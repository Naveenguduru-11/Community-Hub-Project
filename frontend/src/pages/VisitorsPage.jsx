import React, { useState, useEffect } from 'react';
import { visitorService } from '../services/api';
import { VisitorPassModal } from '../components/visitors/VisitorPassModal';
import { QrCode, Plus, Trash2 } from 'lucide-react';

export const VisitorsPage = () => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchVisitors = async () => {
    setLoading(true);
    try {
      const res = await visitorService.getVisitors();
      setVisitors(res.data.visitors || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  const handleDeleteVisitor = async (id, name) => {
    if (confirm(`Cancel and delete guest pass for ${name}?`)) {
      try {
        await visitorService.deletePass(id);
        fetchVisitors();
      } catch (err) {
        alert('Failed to delete visitor pass');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Visitor Pass & Gate Logs</h1>
          <p className="text-xs text-slate-500">Manage pre-approved guest passes, QR passes, cancel active passes, and view logs.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Pre-Approved Visitor Pass</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visitors.map(v => (
          <div key={v._id} className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{v.name}</h4>
                <span className="text-xs text-slate-500">{v.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  v.status === 'INSIDE' ? 'bg-amber-100 text-amber-800' :
                  v.status === 'PRE_APPROVED' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {v.status}
                </span>
                <button
                  onClick={() => handleDeleteVisitor(v._id, v.name)}
                  className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                  title="Cancel/Delete Pass"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-700 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Type:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{v.visitorType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Access Passcode:</span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{v.passcode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Visiting Villa:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{v.villa?.villaNumber || 'V-101'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <VisitorPassModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onPassCreated={() => fetchVisitors()}
      />
    </div>
  );
};
