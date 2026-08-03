import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { visitorService } from '../../services/api';
import { X, QrCode, User, Phone, Car, CheckCircle2, Copy } from 'lucide-react';

export const VisitorPassModal = ({ isOpen, onClose, onPassCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    visitorType: 'GUEST',
    company: '',
    vehicleNumber: '',
    purpose: 'Personal Visit'
  });
  const [createdPass, setCreatedPass] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await visitorService.createPass(formData);
      setCreatedPass(res.data.visitor);
      if (onPassCreated) onPassCreated(res.data.visitor);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate visitor pass');
    } finally {
      setLoading(false);
    }
  };

  const copyPasscode = () => {
    if (createdPass) {
      navigator.clipboard.writeText(createdPass.passcode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 animate-in zoom-in-95">
        
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Pre-Approve Visitor</h3>
              <p className="text-xs text-slate-500">Generate QR Pass & Access Code</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!createdPass ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Visitor Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Visitor Type</label>
                <select
                  value={formData.visitorType}
                  onChange={(e) => setFormData({ ...formData, visitorType: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="GUEST">Guest / Family</option>
                  <option value="DELIVERY">Delivery</option>
                  <option value="CAB">Cab / Taxi</option>
                  <option value="SERVICE_PROVIDER">Plumber / Technician</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            {formData.visitorType === 'DELIVERY' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Delivery Service / Company</label>
                <input
                  type="text"
                  placeholder="Amazon, Swiggy, Zomato, Blinkit..."
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Vehicle Reg Number (Optional)</label>
              <input
                type="text"
                placeholder="TS 09 EQ 1234"
                value={formData.vehicleNumber}
                onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all"
            >
              {loading ? 'Generating Gate Pass...' : 'Create Visitor Pass'}
            </button>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <div className="inline-flex p-3 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 rounded-full">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h4 className="font-bold text-lg text-slate-900 dark:text-white">Visitor Pass Generated!</h4>

            {/* QR Code Container */}
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 inline-block shadow-inner">
              <QRCodeSVG
                value={`COMMUNITYHUB-VISITOR-${createdPass.passcode}`}
                size={180}
                level="H"
                includeMargin={true}
              />
            </div>

            <div className="bg-slate-100 dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">6-Digit Access Passcode</span>
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400 tracking-widest font-mono">
                  {createdPass.passcode}
                </span>
              </div>
              <button
                onClick={copyPasscode}
                className="flex items-center gap-1 text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Share code <strong>{createdPass.passcode}</strong> or the QR image with <strong>{createdPass.name}</strong> for instant gate entry.
            </p>

            <button
              onClick={onClose}
              className="w-full py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white font-semibold rounded-xl"
            >
              Done & Close
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
