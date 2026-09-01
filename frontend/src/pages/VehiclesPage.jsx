import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import {
  Car, Plus, Trash2, Loader2, ShieldCheck,
  Hash, Palette, Tag, ParkingCircle, AlertCircle
} from 'lucide-react';

const VEHICLE_TYPES = ['CAR', 'BIKE', 'SCOOTER', 'SUV', 'TRUCK', 'OTHER'];
const TYPE_EMOJI   = { CAR:'🚗', BIKE:'🏍️', SCOOTER:'🛵', SUV:'🚙', TRUCK:'🚚', OTHER:'🚘' };
const TYPE_COLOR   = {
  CAR:    { bg:'#dbeafe', color:'#1d4ed8' },
  BIKE:   { bg:'#fef3c7', color:'#b45309' },
  SCOOTER:{ bg:'#fce7f3', color:'#9d174d' },
  SUV:    { bg:'#d1fae5', color:'#065f46' },
  TRUCK:  { bg:'#e0e7ff', color:'#3730a3' },
  OTHER:  { bg:'#f3f4f6', color:'#374151' },
};

const inp = {
  padding:'9px 12px', borderRadius:10,
  border:'1px solid var(--ch-card-border)',
  background:'var(--ch-body-bg)',
  color:'var(--ch-text-primary)',
  fontSize:13, fontFamily:'inherit',
  width:'100%', outline:'none', boxSizing:'border-box',
};

export const VehiclesPage = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [adding, setAdding]       = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm] = useState({
    registrationNumber: '', vehicleType: 'CAR', model: '', color: ''
  });

  useEffect(() => { fetchVehicles(); }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await authService.getVehicles();
      setVehicles(res.data.vehicles || []);
    } catch (err) {
      console.error('Vehicles fetch error:', err);
    } finally { setLoading(false); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      await authService.registerVehicle(form);
      setForm({ registrationNumber:'', vehicleType:'CAR', model:'', color:'' });
      setShowForm(false);
      fetchVehicles();
    } catch (err) {
      alert(err.response?.data?.message || 'Vehicle registration failed');
    } finally { setAdding(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this vehicle from your profile?')) return;
    setDeletingId(id);
    try {
      await authService.deleteVehicle?.(id);
      setVehicles(prev => prev.filter(v => v._id !== id));
    } catch (err) {
      alert('Failed to remove vehicle');
    } finally { setDeletingId(null); }
  };

  return (
    <div style={{ maxWidth:860, margin:'0 auto' }}>

      {/* Page header */}
      <div style={{ marginBottom:24, display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
        <div>
          <h1 className="ch-page-title" style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{
              width:44, height:44, borderRadius:12, background:'linear-gradient(135deg,#10b981,#059669)',
              display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
            }}>
              <Car size={22} color="#fff" />
            </span>
            My Vehicles
          </h1>
          <p className="ch-page-sub">Manage your registered vehicles for Villa {user?.villa?.villaNumber || '—'}</p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          style={{
            display:'flex', alignItems:'center', gap:7, padding:'10px 18px',
            background: showForm ? '#f3f4f6' : '#10b981',
            color: showForm ? '#374151' : '#fff',
            border: showForm ? '1px solid #e5e7eb' : 'none',
            borderRadius:10, fontWeight:700, fontSize:13, cursor:'pointer',
          }}
        >
          <Plus size={16} />
          {showForm ? 'Cancel' : 'Register Vehicle'}
        </button>
      </div>

      {/* Register form */}
      {showForm && (
        <div style={{
          background:'var(--ch-card-bg)', border:'1px solid var(--ch-card-border)',
          borderRadius:16, padding:20, marginBottom:20,
          boxShadow:'0 4px 20px rgba(0,0,0,0.06)',
        }}>
          <h3 style={{ fontSize:14, fontWeight:800, color:'var(--ch-text-primary)', marginBottom:14 }}>
            Register New Vehicle
          </h3>
          <form onSubmit={handleAdd}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px,1fr))', gap:12, marginBottom:14 }}>
              <div>
                <label style={{ fontSize:11, fontWeight:700, color:'var(--ch-text-muted)', display:'block', marginBottom:5 }}>
                  Registration Number *
                </label>
                <input
                  style={{ ...inp, textTransform:'uppercase', fontFamily:'monospace' }}
                  required
                  placeholder="e.g. TS 09 EQ 1234"
                  value={form.registrationNumber}
                  onChange={e => setForm({...form, registrationNumber: e.target.value.toUpperCase()})}
                />
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:700, color:'var(--ch-text-muted)', display:'block', marginBottom:5 }}>
                  Vehicle Type *
                </label>
                <select
                  style={inp}
                  value={form.vehicleType}
                  onChange={e => setForm({...form, vehicleType: e.target.value})}
                >
                  {VEHICLE_TYPES.map(t => (
                    <option key={t} value={t}>{TYPE_EMOJI[t]} {t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:700, color:'var(--ch-text-muted)', display:'block', marginBottom:5 }}>
                  Model
                </label>
                <input
                  style={inp}
                  placeholder="e.g. Tata Nexon EV"
                  value={form.model}
                  onChange={e => setForm({...form, model: e.target.value})}
                />
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:700, color:'var(--ch-text-muted)', display:'block', marginBottom:5 }}>
                  Color
                </label>
                <input
                  style={inp}
                  placeholder="e.g. White"
                  value={form.color}
                  onChange={e => setForm({...form, color: e.target.value})}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={adding}
              style={{
                display:'flex', alignItems:'center', gap:7,
                padding:'10px 20px', borderRadius:10,
                background:'#10b981', color:'#fff',
                border:'none', fontWeight:800, fontSize:13, cursor:'pointer',
              }}
            >
              {adding
                ? <><Loader2 size={14} style={{ animation:'spin 1s linear infinite' }} /> Registering…</>
                : <><ShieldCheck size={14} /> Confirm Registration</>
              }
            </button>
          </form>
        </div>
      )}

      {/* Stats strip */}
      {!loading && vehicles.length > 0 && (
        <div style={{
          display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:12, marginBottom:20,
        }}>
          {[
            { label:'Total Vehicles', value: vehicles.length, color:'#6366f1', bg:'#ede9fe' },
            { label:'Cars / SUVs',    value: vehicles.filter(v => ['CAR','SUV'].includes(v.vehicleType)).length, color:'#1d4ed8', bg:'#dbeafe' },
            { label:'Two-Wheelers',   value: vehicles.filter(v => ['BIKE','SCOOTER'].includes(v.vehicleType)).length, color:'#b45309', bg:'#fef3c7' },
            { label:'With Parking',   value: vehicles.filter(v => v.parkingSlot).length, color:'#065f46', bg:'#d1fae5' },
          ].map(s => (
            <div key={s.label} style={{
              background:'var(--ch-card-bg)', border:'1px solid var(--ch-card-border)',
              borderRadius:12, padding:'14px 16px',
              borderLeft:`3px solid ${s.color}`,
            }}>
              <div style={{ fontSize:22, fontWeight:900, color:'var(--ch-text-primary)' }}>{s.value}</div>
              <div style={{ fontSize:11, color:'var(--ch-text-muted)', marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Vehicles list */}
      <div style={{
        background:'var(--ch-card-bg)', border:'1px solid var(--ch-card-border)',
        borderRadius:16, overflow:'hidden',
      }}>
        <div style={{
          padding:'16px 20px', borderBottom:'1px solid var(--ch-card-border)',
          display:'flex', alignItems:'center', justifyContent:'space-between',
        }}>
          <span style={{ fontSize:14, fontWeight:800, color:'var(--ch-text-primary)' }}>
            Registered Vehicles
          </span>
          {!loading && (
            <span style={{
              fontSize:11, fontWeight:700, padding:'3px 10px',
              borderRadius:99, background:'#d1fae5', color:'#065f46',
            }}>
              {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {loading ? (
          <div style={{ padding:'40px 0', textAlign:'center', color:'var(--ch-text-muted)' }}>
            <Loader2 size={24} style={{ animation:'spin 1s linear infinite', opacity:0.4, margin:'0 auto 8px', display:'block' }} />
            <p style={{ fontSize:13 }}>Loading vehicles…</p>
          </div>
        ) : vehicles.length === 0 ? (
          <div style={{ padding:'48px 20px', textAlign:'center', color:'var(--ch-text-muted)' }}>
            <Car size={40} style={{ opacity:0.15, margin:'0 auto 12px', display:'block' }} />
            <p style={{ fontSize:14, fontWeight:700, marginBottom:6 }}>No vehicles registered yet</p>
            <p style={{ fontSize:12, marginBottom:14 }}>Register your vehicle to get a parking slot assigned.</p>
            <button
              onClick={() => setShowForm(true)}
              style={{
                padding:'9px 18px', background:'#10b981', color:'#fff',
                border:'none', borderRadius:10, fontWeight:700, fontSize:13, cursor:'pointer',
              }}
            >
              Register First Vehicle
            </button>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column' }}>
            {vehicles.map((v, i) => {
              const tc = TYPE_COLOR[v.vehicleType] || TYPE_COLOR.OTHER;
              return (
                <div
                  key={v._id}
                  style={{
                    display:'flex', alignItems:'center', gap:16,
                    padding:'16px 20px',
                    borderBottom: i < vehicles.length - 1 ? '1px solid var(--ch-card-border)' : 'none',
                    flexWrap:'wrap',
                  }}
                >
                  {/* Type badge */}
                  <div style={{
                    width:52, height:52, borderRadius:14,
                    background: tc.bg,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:24, flexShrink:0,
                  }}>
                    {TYPE_EMOJI[v.vehicleType] || '🚘'}
                  </div>

                  {/* Info */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{
                      fontFamily:'monospace', fontSize:16, fontWeight:900,
                      color:'var(--ch-text-primary)', letterSpacing:'0.5px',
                    }}>
                      {v.registrationNumber}
                    </div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:'8px 14px', marginTop:4 }}>
                      {v.model && (
                        <span style={{ fontSize:12, color:'var(--ch-text-muted)', display:'flex', alignItems:'center', gap:4 }}>
                          <Tag size={12} /> {v.model}
                        </span>
                      )}
                      {v.color && (
                        <span style={{ fontSize:12, color:'var(--ch-text-muted)', display:'flex', alignItems:'center', gap:4 }}>
                          <Palette size={12} /> {v.color}
                        </span>
                      )}
                      {v.parkingSlot && (
                        <span style={{ fontSize:12, color:'#059669', fontWeight:700, display:'flex', alignItems:'center', gap:4 }}>
                          <ParkingCircle size={12} /> Slot {v.parkingSlot}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Type pill + delete */}
                  <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
                    <span style={{
                      padding:'3px 10px', borderRadius:99, fontSize:11, fontWeight:700,
                      background: tc.bg, color: tc.color,
                    }}>
                      {v.vehicleType}
                    </span>
                    <button
                      onClick={() => handleDelete(v._id)}
                      disabled={deletingId === v._id}
                      style={{
                        width:32, height:32, borderRadius:8,
                        background:'#fef2f2', border:'1px solid #fca5a5',
                        color:'#ef4444', display:'flex', alignItems:'center',
                        justifyContent:'center', cursor:'pointer', flexShrink:0,
                      }}
                      title="Remove vehicle"
                    >
                      {deletingId === v._id
                        ? <Loader2 size={13} style={{ animation:'spin 1s linear infinite' }} />
                        : <Trash2 size={13} />
                      }
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info box */}
      <div style={{
        marginTop:16, padding:'14px 18px', borderRadius:12,
        background:'#eff6ff', border:'1px solid #bfdbfe',
        display:'flex', alignItems:'flex-start', gap:10,
      }}>
        <AlertCircle size={16} color="#3b82f6" style={{ flexShrink:0, marginTop:1 }} />
        <p style={{ fontSize:12, color:'#1d4ed8', lineHeight:1.5, margin:0 }}>
          Vehicle registration is required for parking access. A parking slot will be auto-assigned by the community admin after verification. Maximum 2 vehicles per unit.
        </p>
      </div>
    </div>
  );
};
