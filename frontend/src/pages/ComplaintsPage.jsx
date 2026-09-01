import React, { useState, useEffect } from 'react';
import { complaintService } from '../services/api';
import { ComplaintModal } from '../components/complaints/ComplaintModal';
import { AlertCircle, Plus, Trash2, ArrowRight } from 'lucide-react';

export const ComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await complaintService.getComplaints();
      setComplaints(res.data.complaints || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleDeleteComplaint = async (id, title) => {
    if (confirm(`Delete helpdesk ticket "${title}"?`)) {
      try {
        await complaintService.deleteComplaint(id);
        fetchComplaints();
      } catch (err) {
        alert('Failed to delete complaint ticket');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Maintenance Helpdesk & Complaints</h1>
          <p className="text-xs text-slate-500">Track resolution progress for plumbing, electrical, and security tickets, or cancel active tickets.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-500/25"
        >
          <Plus className="w-4 h-4" />
          <span>+ Raise Ticket</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from(new Map(complaints.map(c => [c._id || c.title, c])).values()).map(c => (
          <div key={c._id} className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 dark:text-white text-base">{c.title}</h4>
              <button
                onClick={() => handleDeleteComplaint(c._id, c.title)}
                className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                title="Delete Ticket"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">{c.description}</p>

            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold overflow-x-auto pb-2 scrollbar-hide">
              <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded">V-{c.villa?.villaNumber || '101'}</span>
              <ArrowRight className="w-3 h-3 text-slate-300" />
              <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-1 rounded">{c.category}</span>
              <ArrowRight className="w-3 h-3 text-slate-300" />
              <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">{c.assignedTo || 'Unassigned'}</span>
              <ArrowRight className="w-3 h-3 text-slate-300" />
              <span className={`px-2 py-1 rounded ${c.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
                {c.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      <ComplaintModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onComplaintCreated={() => fetchComplaints()}
      />
    </div>
  );
};
