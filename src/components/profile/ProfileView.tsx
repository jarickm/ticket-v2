import React, { useRef, useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { User, Mail, Phone, Building, ShieldCheck, PenTool, Eraser, CheckCircle } from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { currentUser, updateCurrentUserProfile } = useApp();

  const [fullName, setFullName] = useState(currentUser?.full_name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [position, setPosition] = useState(currentUser?.position || '');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(!!currentUser?.signature);

  // Load existing signature on canvas
  useEffect(() => {
    if (currentUser?.signature && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
          ctx.drawImage(img, 0, 0);
        };
        img.src = currentUser.signature;
      }
    }
  }, [currentUser?.signature]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = '#002e5d';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    let signatureUrl = currentUser?.signature;
    if (canvasRef.current && hasSignature) {
      signatureUrl = canvasRef.current.toDataURL('image/png');
    }

    updateCurrentUserProfile({
      full_name: fullName,
      email,
      phone,
      position,
      signature: signatureUrl
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-4xl">
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          My Account & Digital Authorization
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
          Manage your personnel directory profile and digital signature for IER approvals.
        </p>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Profile Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-700/60">
            <div className="w-16 h-16 rounded-2xl bg-[#002e5d] text-white flex items-center justify-center font-black text-2xl shadow-sm">
              {currentUser?.username ? currentUser.username[0].toUpperCase() : 'U'}
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {currentUser?.full_name || currentUser?.username}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span className="capitalize font-bold text-blue-600 dark:text-blue-400">
                  {currentUser?.role}
                </span>
                <span>•</span>
                <span>{currentUser?.department} Department</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[11px] uppercase font-bold text-slate-500 mb-1">
                Full Legal Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-semibold"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase font-bold text-slate-500 mb-1">
                Designated Position Title
              </label>
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-semibold"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase font-bold text-slate-500 mb-1">
                Corporate Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-semibold"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase font-bold text-slate-500 mb-1">
                Direct Contact / Local Extension
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+63 2 8555-0100"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Digital Signature Pad */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <PenTool className="w-4 h-4 text-blue-500" />
                <span>Authorized Digital Signature Pad</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Used to digitally endorse IER Form A inspections and Form B service authorizations.
              </p>
            </div>

            <button
              type="button"
              onClick={clearCanvas}
              className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center gap-1 transition-colors"
            >
              <Eraser className="w-3.5 h-3.5" />
              <span>Clear Pad</span>
            </button>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-2 flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={500}
              height={140}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="cursor-crosshair bg-white dark:bg-slate-800 rounded-xl max-w-full shadow-inner"
            />
          </div>

          <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Digital signatures are encrypted and bound to your Coolaire corporate ID.</span>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-[#002e5d] hover:bg-[#002042] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all flex items-center gap-1.5"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Save Profile & Signature</span>
          </button>
        </div>
      </form>
    </div>
  );
};
