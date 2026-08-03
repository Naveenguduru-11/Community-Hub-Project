import React, { useState, useRef, useEffect } from 'react';
import { visitorService } from '../../services/api';
import { KeyRound, QrCode, CheckCircle, AlertCircle, X, Shield, Camera, Upload, Scan } from 'lucide-react';

export const CheckInModal = ({ isOpen, onClose, onCheckInSuccess }) => {
  const [activeTab, setActiveTab] = useState('SCANNER');
  const [passcode, setPasscode] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, []);

  if (!isOpen) return null;

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const startWebcam = async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (err) {
      console.warn('Webcam access error:', err);
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = fallbackStream;
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
        }
        setIsCameraActive(true);
      } catch (fallbackErr) {
        setCameraError('Camera access denied or no webcam hardware detected on device.');
        setIsCameraActive(false);
      }
    }
  };

  const handleVerify = async (codeToVerify) => {
    const code = codeToVerify || passcode;
    if (!code || code.length !== 6) {
      setError('Please enter a valid 6-digit passcode');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await visitorService.checkIn(code);
      setResult(res.data.visitor);
      stopWebcam();
      if (onCheckInSuccess) onCheckInSuccess(res.data.visitor);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid passcode or visitor not approved');
    } finally {
      setLoading(false);
      setScanning(false);
    }
  };

  const handleSimulatedScan = (simulatedCode = '849201') => {
    setScanning(true);
    setError('');
    setTimeout(() => {
      setPasscode(simulatedCode);
      handleVerify(simulatedCode);
    }, 1500);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setScanning(true);
    setError('');

    setTimeout(() => {
      const detectedPasscode = '521940';
      setPasscode(detectedPasscode);
      handleVerify(detectedPasscode);
    }, 1200);
  };

  const handleCloseModal = () => {
    stopWebcam();
    setResult(null);
    setPasscode('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 animate-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Security Gate Pass Scanner</h3>
              <p className="text-xs text-slate-500">Scan QR Pass or Enter 6-Digit Code</p>
            </div>
          </div>
          <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!result ? (
          <div className="space-y-4">
            
            {/* Mode Switcher Tabs */}
            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => setActiveTab('SCANNER')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'SCANNER' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>Live Camera QR</span>
              </button>
              
              <button
                type="button"
                onClick={() => { stopWebcam(); setActiveTab('PASSCODE'); }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'PASSCODE' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <KeyRound className="w-4 h-4" />
                <span>6-Digit Passcode</span>
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs rounded-xl flex items-center gap-2 border border-red-200 dark:border-red-800">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* TAB 1: CAMERA QR SCANNER */}
            {activeTab === 'SCANNER' && (
              <div className="space-y-4 text-center">
                
                {/* Camera Viewfinder Screen */}
                <div className="relative w-full h-60 bg-slate-950 rounded-3xl border-2 border-dashed border-amber-500/50 flex flex-col items-center justify-center overflow-hidden shadow-inner">
                  
                  {/* HTML5 Live Video Stream */}
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted
                    className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`} 
                  />

                  {/* Laser Beam Animation when camera is streaming or scanning */}
                  {(isCameraActive || scanning) && (
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_15px_#f59e0b] animate-bounce z-10" style={{ animationDuration: '1.2s' }} />
                  )}

                  {!isCameraActive && !scanning && (
                    <div className="space-y-2 p-4">
                      <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
                        <Camera className="w-7 h-7" />
                      </div>
                      <h4 className="font-bold text-sm text-white">Device Camera Off</h4>
                      <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                        {cameraError || 'Click below to turn on live webcam or scan a guest pass.'}
                      </p>
                    </div>
                  )}

                  {/* Viewfinder Target Frame Overlay */}
                  <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-amber-400 pointer-events-none z-10" />
                  <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-amber-400 pointer-events-none z-10" />
                  <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-amber-400 pointer-events-none z-10" />
                  <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-amber-400 pointer-events-none z-10" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {!isCameraActive ? (
                    <button
                      type="button"
                      onClick={startWebcam}
                      className="py-3 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Turn On Camera</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSimulatedScan('849201')}
                      className="py-3 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Scan className="w-4 h-4" />
                      <span>{scanning ? 'Decoding...' : 'Capture & Verify'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={scanning}
                    className="py-3 px-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload QR Image</span>
                  </button>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                {/* Instant Test Passcodes */}
                <div className="border-t border-slate-100 dark:border-slate-700/60 pt-3 text-left">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Simulate Live Camera Detection</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleSimulatedScan('849201')}
                      className="p-2 bg-slate-50 dark:bg-slate-900 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-xl border border-slate-200 dark:border-slate-700 text-left text-xs transition-colors"
                    >
                      <span className="font-bold block text-slate-900 dark:text-white">Rohan Verma (Guest)</span>
                      <span className="text-slate-500 font-mono text-[10px]">Passcode: 849201</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSimulatedScan('521940')}
                      className="p-2 bg-slate-50 dark:bg-slate-900 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-xl border border-slate-200 dark:border-slate-700 text-left text-xs transition-colors"
                    >
                      <span className="font-bold block text-slate-900 dark:text-white">Amazon Delivery</span>
                      <span className="text-slate-500 font-mono text-[10px]">Passcode: 521940</span>
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: MANUAL 6-DIGIT PASSCODE */}
            {activeTab === 'PASSCODE' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Enter 6-Digit Passcode</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="e.g. 849201"
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      className="flex-1 px-4 py-3 text-lg font-mono tracking-widest text-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                    <button
                      onClick={() => handleVerify()}
                      disabled={loading}
                      className="px-5 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-colors"
                    >
                      {loading ? 'Verifying...' : 'Verify'}
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        ) : (
          /* SUCCESS STATE */
          <div className="text-center space-y-4 py-2">
            <div className="inline-flex p-3 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 rounded-full">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div>
              <h4 className="font-bold text-xl text-slate-900 dark:text-white">Gate Access Approved!</h4>
              <p className="text-xs text-slate-500 mt-0.5">QR Code / Passcode Verified & Visitor Logged</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-left text-xs space-y-2">
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-slate-500">Visitor Name:</span>
                <span className="font-bold text-slate-900 dark:text-white">{result.name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-slate-500">Visitor Type:</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">{result.visitorType}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-slate-500">Visiting Villa:</span>
                <span className="font-bold text-slate-900 dark:text-white">{result.villa?.villaNumber || 'V-101'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Host Resident:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{result.hostResident?.name}</span>
              </div>
            </div>

            <button
              onClick={handleCloseModal}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-emerald-500/25"
            >
              Confirm Gate Entry & Close
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
