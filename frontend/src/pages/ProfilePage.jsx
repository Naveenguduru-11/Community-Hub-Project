import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { User, Users, Car, Phone, ShieldAlert, Plus, Trash2 } from 'lucide-react';

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [familyForm, setFamilyForm] = useState({ name: '', relation: 'Spouse', phone: '', age: '' });
  const [vehicleForm, setVehicleForm] = useState({ registrationNumber: '', vehicleType: 'CAR', model: '', color: '' });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const res = await authService.getVehicles();
      setVehicles(res.data.vehicles);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddFamily = async (e) => {
    e.preventDefault();
    try {
      const res = await authService.addFamilyMember(familyForm);
      updateUser({ ...user, familyMembers: res.data.familyMembers });
      setFamilyForm({ name: '', relation: 'Spouse', phone: '', age: '' });
    } catch (err) {
      alert('Failed to add family member');
    }
  };

  const handleRemoveFamily = async (id) => {
    try {
      const res = await authService.removeFamilyMember(id);
      updateUser({ ...user, familyMembers: res.data.familyMembers });
    } catch (err) {
      alert('Failed to remove family member');
    }
  };

  const handleRegisterVehicle = async (e) => {
    e.preventDefault();
    try {
      await authService.registerVehicle(vehicleForm);
      alert('Vehicle registered!');
      setVehicleForm({ registrationNumber: '', vehicleType: 'CAR', model: '', color: '' });
      fetchVehicles();
    } catch (err) {
      alert('Vehicle registration failed');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Profile Header */}
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <img
          src={user?.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80'}
          alt={user?.name}
          className="w-24 h-24 rounded-2xl object-cover ring-4 ring-blue-500/20 shadow-md"
        />
        <div className="text-center sm:text-left space-y-1">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">{user?.name}</h2>
          <p className="text-xs text-slate-500">{user?.email} • {user?.phone}</p>
          <div className="pt-2 flex flex-wrap justify-center sm:justify-start gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-xs">
              Role: {user?.role}
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
              Villa {user?.villa?.villaNumber || 'V-101'}
            </span>
          </div>
        </div>
      </div>

      {/* Grid for Family & Vehicles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Family Members Section */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Family Members
          </h3>

          <div className="space-y-2">
            {user?.familyMembers?.map(m => (
              <div key={m._id} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">{m.name} ({m.relation})</span>
                  <span className="text-slate-400 text-[11px]">{m.phone || 'No phone'}</span>
                </div>
                <button onClick={() => handleRemoveFamily(m._id)} className="text-red-500 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddFamily} className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700">
            <span className="text-xs font-bold text-slate-400">Add Family Member</span>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                required
                placeholder="Name"
                value={familyForm.name}
                onChange={(e) => setFamilyForm({ ...familyForm, name: e.target.value })}
                className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
              <input
                type="text"
                required
                placeholder="Relation"
                value={familyForm.relation}
                onChange={(e) => setFamilyForm({ ...familyForm, relation: e.target.value })}
                className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
            <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl">
              + Add Member
            </button>
          </form>
        </div>

        {/* Vehicles Section */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Car className="w-5 h-5 text-emerald-500" />
            Registered Vehicles
          </h3>

          <div className="space-y-2">
            {vehicles.map(v => (
              <div key={v._id} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700/60 text-xs">
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 block">{v.registrationNumber}</span>
                <span className="text-slate-500 text-[11px]">{v.model} ({v.color}) • Slot: {v.parkingSlot}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleRegisterVehicle} className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700">
            <span className="text-xs font-bold text-slate-400">Register Vehicle</span>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                required
                placeholder="Reg No (TS 09 EQ 1234)"
                value={vehicleForm.registrationNumber}
                onChange={(e) => setVehicleForm({ ...vehicleForm, registrationNumber: e.target.value })}
                className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl uppercase font-mono"
              />
              <input
                type="text"
                placeholder="Model (Tata Nexon EV)"
                value={vehicleForm.model}
                onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })}
                className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
            <button type="submit" className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl">
              + Register Vehicle
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
