import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, ShieldCheck, KeyRound, ArrowRight } from 'lucide-react';

export const GatewayScreen: React.FC = () => {
  const { verifyGatewayPin, systemSettings } = useApp();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pin.length < 4) return;
    const ok = verifyGatewayPin(pin);
    if (!ok) {
      setError(true);
      setPin('');
    }
  };

  const handleQuickPin = () => {
    setPin(systemSettings.company_pin || '7799');
    verifyGatewayPin(systemSettings.company_pin || '7799');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f4f7f9] dark:bg-[#0f172a] relative overflow-hidden">
      {/* Mesh background */}
      <div className="mesh-bg" />

      <div className="w-full max-w-md bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-white/60 dark:border-slate-700/60 rounded-3xl shadow-2xl overflow-hidden transition-all">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#002e5d] to-[#001a35] p-8 text-center text-white relative">
          <div className="w-16 h-16 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl shadow-inner relative">
            <Lock className="w-7 h-7 text-white" />
            <div className="absolute inset-0 rounded-2xl border-2 border-white/30 animate-ping opacity-25" />
          </div>

          <div className="text-xl font-black tracking-tight">CCI SECURE GATEWAY</div>
          <div className="text-xs uppercase font-extrabold tracking-widest text-slate-300 mt-1">
            Coolaire Consolidated Inc.
          </div>
        </div>

        {/* Form Body */}
        <div className="p-8 text-center">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-6">
            Enter the authorized 4-digit Gateway Access PIN to unlock workspace services.
          </p>

          <form onSubmit={handleSubmit}>
            {/* Slot-like PIN input */}
            <div className="relative mb-5">
              <input
                type="password"
                maxLength={8}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value.replace(/\D/g, ''));
                  setError(false);
                }}
                autoFocus
                placeholder="••••"
                className={`w-full h-16 text-center text-3xl font-black tracking-[18px] rounded-2xl border-2 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none transition-all ${
                  error
                    ? 'border-rose-500 bg-rose-50/50'
                    : 'border-slate-200 dark:border-slate-700 focus:border-[#002e5d] dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
                }`}
              />
            </div>

            {error && (
              <p className="text-xs font-bold text-rose-500 mb-4 animate-bounce">
                Incorrect PIN. Please re-enter the authorized code.
              </p>
            )}

            <button
              type="submit"
              disabled={pin.length < 4}
              className="w-full h-13 rounded-2xl bg-[#002e5d] hover:bg-[#002042] text-white font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>Verify & Proceed</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Assist */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-700/60 flex flex-col items-center">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mb-2">
              Demonstration Environment
            </span>
            <button
              onClick={handleQuickPin}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors border border-blue-200/40 dark:border-blue-800/40"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Auto-Fill Default PIN (7799)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
