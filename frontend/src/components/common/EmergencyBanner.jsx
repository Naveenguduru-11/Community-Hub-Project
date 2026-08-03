import React from 'react';
import { useSocket } from '../../context/SocketContext';
import { AlertTriangle, X, ShieldAlert } from 'lucide-react';

export const EmergencyBanner = () => {
  const { sosAlert, dismissSosAlert } = useSocket();

  if (!sosAlert) return null;

  return (
    <div className="bg-red-600 text-white px-4 py-3 shadow-xl animate-sos border-b-2 border-red-700 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-red-700 rounded-full animate-bounce">
          <ShieldAlert className="w-6 h-6 text-white" />
        </div>
        <div>
          <h4 className="font-bold text-sm sm:text-base tracking-wide flex items-center gap-2">
            <span>🚨 EMERGENCY SOS BROADCAST ACTIVE</span>
            <span className="bg-red-800 text-red-100 text-xs px-2 py-0.5 rounded font-mono uppercase">
              {sosAlert.alertType || 'SECURITY ALERT'}
            </span>
          </h4>
          <p className="text-xs sm:text-sm text-red-100 mt-0.5">
            Triggered at <strong className="underline">{sosAlert.location || 'Gate 1'}</strong> by <strong>{sosAlert.senderName}</strong> ({sosAlert.senderRole}). Security team notified!
          </p>
        </div>
      </div>

      <button
        onClick={dismissSosAlert}
        className="p-1 hover:bg-red-700 rounded-lg text-red-100 hover:text-white transition-colors"
        title="Dismiss Alert"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};
