import React, { useState, useEffect } from 'react';
import { complaintService } from '../services/api';
import { ComplaintModal } from '../components/complaints/ComplaintModal';
import { AlertCircle, Plus, Trash2 } from 'lucide-react';

export const ComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await complaintService.getComplaints();
      setComplaints(res.data.complaints);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
        {complaints.map(c => (
          <div key={c._id} className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2.5 py-0.5 rounded-full">
                {c.category}
              </span>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold ${c.status === 'RESOLVED' ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {c.status}
                </span>
                <button
                  onClick={() => handleDeleteComplaint(c._id, c.title)}
                  className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                  title="Delete Ticket"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base">{c.title}</h4>
              <p className="text-xs text-slate-500 mt-1">{c.description}</p>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-700 pt-3 flex items-center justify-between text-xs text-slate-400">
              <span>Raised by: {c.raisedBy?.name} (Villa {c.villa?.villaNumber || 'V-101'})</span>
              <span>Assigned: {c.assignedTo}</span>
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
