import React, { useState, useEffect } from 'react';
import { villaService } from '../services/api';
import { Home, Users, CheckCircle, Shield } from 'lucide-react';

export const VillaDirectoryPage = () => {
  const [villas, setVillas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVillas();
  }, []);

  const fetchVillas = async () => {
    setLoading(true);
    try {
      const res = await villaService.getVillas();
      setVillas(res.data.villas);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Villa & House Directory</h1>
        <p className="text-xs text-slate-500">Manage villa occupancy status, owner/tenant assignments, and parking allocations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {villas.map(v => (
          <div key={v._id} className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-lg font-black text-blue-600 dark:text-blue-400">{v.villaNumber}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                v.occupancyStatus === 'VACANT' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {v.occupancyStatus}
              </span>
            </div>

            <div className="text-xs text-slate-500 space-y-1">
              <p>Block: <strong className="text-slate-800 dark:text-slate-200">{v.block}</strong></p>
              <p>Size: {v.sizeSqFt} SqFt • {v.bedrooms} BHK</p>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-700 pt-3 text-xs">
              <span className="text-slate-400 block">Occupant Resident:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {v.tenant?.name || v.owner?.name || 'Unoccupied'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
