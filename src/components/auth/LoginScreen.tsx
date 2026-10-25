import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Lock,
  User as UserIcon,
  LogIn,
  CheckCircle2,
  Shield,
  Layers,
  Sparkles,
  ArrowRight,
  Sun,
  Moon,
  CheckSquare,
  Square
} from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { login, loginWithGoogle, darkMode, toggleDarkMode } = useApp();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [rememberMe, setRememberMe] = useState(true);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(username, password, rememberMe);
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleSigningIn(true);
      await loginWithGoogle(rememberMe);
    } finally {
      setIsGoogleSigningIn(false);
    }
  };

  const handleQuickLogin = (u: string, p: string = 'password') => {
    setUsername(u);
    setPassword(p);
    login(u, p, rememberMe);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f4f7f9] dark:bg-[#0f172a] relative overflow-hidden">
      <div className="mesh-bg" />

      {/* Bento Login Card */}
      <div className="w-full max-w-4xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-white/80 dark:border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[580px]">
        {/* Visual Brand Side */}
        <div className="md:w-5/12 bg-gradient-to-br from-[#002e5d] via-[#002447] to-[#001426] p-8 md:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            {/* Live Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-[11px] font-extrabold uppercase tracking-wider mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399] animate-pulse" />
              <span>CCI Secure Network</span>
            </div>

            <div className="text-2xl md:text-3xl font-black tracking-tight leading-tight mb-2">
              Coolaire Consolidated Inc.
            </div>
            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              Unified Enterprise IT HelpDesk, Equipment IER Workflow & Project Office.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="space-y-4 my-8 relative z-10">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4 text-sky-400" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Tiered SLA Engine</div>
                <div className="text-[11px] text-slate-300">Automated policy breach tracking & alert routing.</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">IER Inspection Hub</div>
                <div className="text-[11px] text-slate-300">Form A & B multi-department approval matrices.</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">IT Project Kanban</div>
                <div className="text-[11px] text-slate-300">Cross-department portfolio milestones & logs.</div>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 font-semibold relative z-10 border-t border-white/10 pt-4">
            Authorized Personnel Access Only • All Sessions Audited
          </div>
        </div>

        {/* Form Side */}
        <div className="md:w-7/12 p-8 md:p-12 flex flex-col justify-center bg-white dark:bg-slate-800 relative">
          <div className="absolute top-6 right-6">
            <button
              type="button"
              onClick={toggleDarkMode}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700/80 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5 text-xs font-bold"
              title={darkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              <span className="text-[11px]">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>

          <div className="mb-6">
            <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center">
              CCI<span className="text-[#d71921]">.</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">
              Sign In to Workspace
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
              Provide corporate domain credentials or choose a pre-configured profile.
            </p>
          </div>

          {/* Google Workspace Direct Single Sign-On */}
          <div className="mb-5">
            <button
              type="button"
              disabled={isGoogleSigningIn}
              onClick={handleGoogleSignIn}
              className="gsi-material-button shadow-sm hover:shadow transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              <div className="gsi-material-button-state"></div>
              <div className="gsi-material-button-content-wrapper">
                <div className="gsi-material-button-icon">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                  </svg>
                </div>
                <span className="gsi-material-button-contents">
                  {isGoogleSigningIn ? 'Authenticating with Google Workspace...' : 'Sign in with Google Workspace'}
                </span>
                <span style={{ display: 'none' }}>Sign in with Google</span>
              </div>
            </button>
            <p className="text-[10px] text-center text-slate-400 mt-1.5 font-medium">
              Seamlessly sign in using your <span className="font-bold text-slate-600 dark:text-slate-300">@coolaireconsolidated.com</span> account
            </p>
          </div>

          <div className="relative flex py-2 items-center mb-4">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
            <span className="flex-shrink mx-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              or domain credentials
            </span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase font-extrabold tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin or jdelacruz"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-semibold text-xs focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase font-extrabold tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-semibold text-xs focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>
            </div>

            {/* Remember Me Option */}
            <div className="flex items-center justify-between py-1">
              <label
                onClick={() => setRememberMe(!rememberMe)}
                className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                <div
                  className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                    rememberMe
                      ? 'bg-[#002e5d] border-[#002e5d] text-white dark:bg-blue-600 dark:border-blue-600'
                      : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'
                  }`}
                >
                  {rememberMe && <CheckSquare className="w-3.5 h-3.5" />}
                </div>
                <span>Remember me on this device (Persistent SSO & Session)</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-[#002e5d] hover:bg-[#002246] text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-950/20 transition-all cursor-pointer mt-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Authenticate Session</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Persona Selectors */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700/60">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5">
              Quick Test Personas (Click to Sign In):
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'admin123')}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/80 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200/80 dark:border-slate-700/80 text-left transition-all group"
              >
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 flex items-center justify-between">
                  <span>admin</span>
                  <span className="text-[9px] bg-red-100 dark:bg-red-950 text-red-600 px-1.5 py-0.5 rounded font-black">SUPER</span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Default Administrator</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('jdelacruz', 'password')}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/80 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200/80 dark:border-slate-700/80 text-left transition-all group"
              >
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 flex items-center justify-between">
                  <span>jdelacruz</span>
                  <span className="text-[9px] bg-blue-100 dark:bg-blue-950 text-blue-600 px-1.5 py-0.5 rounded font-black">IT</span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Senior Desktop Eng.</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('mgarcia', 'password')}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/80 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200/80 dark:border-slate-700/80 text-left transition-all group"
              >
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 flex items-center justify-between">
                  <span>mgarcia</span>
                  <span className="text-[9px] bg-purple-100 dark:bg-purple-950 text-purple-600 px-1.5 py-0.5 rounded font-black">MGR</span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Operations Manager</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('asantos', 'password')}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/80 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200/80 dark:border-slate-700/80 text-left transition-all group"
              >
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 flex items-center justify-between">
                  <span>asantos</span>
                  <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950 text-emerald-600 px-1.5 py-0.5 rounded font-black">USER</span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Finance Analyst</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
