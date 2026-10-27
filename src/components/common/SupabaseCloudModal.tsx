import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Database,
  X,
  Server,
  DownloadCloud,
  UploadCloud,
  FileCode,
  CheckCircle,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import {
  getSavedSupabaseConfig,
  saveSupabaseCredentials,
  testSupabaseConnection,
  pushAllDataToSupabase,
  getSupabaseSchemaSql
} from '../../services/supabase';

interface SupabaseCloudModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseCloudModal: React.FC<SupabaseCloudModalProps> = ({ isOpen, onClose }) => {
  const {
    pullFromSupabase,
    isSupabaseSyncing,
    addToast,
    tickets,
    users,
    assets,
    ierFormsA,
    ierFormsB,
    projects,
    departments,
    slaPolicies
  } = useApp();

  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [status, setStatus] = useState<{ tested: boolean; success: boolean; message: string }>({
    tested: false,
    success: false,
    message: ''
  });
  const [showSql, setShowSql] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const creds = getSavedSupabaseConfig();
      setUrl(creds.url);
      setAnonKey(creds.anonKey);
      if (creds.url && creds.anonKey) {
        setStatus({
          tested: true,
          success: true,
          message: 'Supabase cloud configuration loaded. Ready for cloud sync.'
        });
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestAndSave = async () => {
    if (!url.trim() || !anonKey.trim()) {
      addToast('Please provide both Project URL and Anon API Key.', 'warning');
      return;
    }

    setIsTesting(true);
    try {
      const res = await testSupabaseConnection(url.trim(), anonKey.trim());
      setStatus({
        tested: true,
        success: res.success,
        message: res.message
      });

      if (res.success) {
        saveSupabaseCredentials(url.trim(), anonKey.trim());
        addToast('Connected to Supabase! Pulling live database...', 'success');
        await pullFromSupabase(true);
      } else {
        addToast(res.message, 'danger');
      }
    } finally {
      setIsTesting(false);
    }
  };

  const handlePullAll = async () => {
    if (url.trim() && anonKey.trim()) {
      saveSupabaseCredentials(url.trim(), anonKey.trim());
    }
    await pullFromSupabase(true);
  };

  const handlePushAll = async () => {
    if (!url.trim() || !anonKey.trim()) {
      addToast('Please enter your Supabase credentials first.', 'warning');
      return;
    }

    setIsPushing(true);
    try {
      saveSupabaseCredentials(url.trim(), anonKey.trim());
      const res = await pushAllDataToSupabase({
        tickets,
        users,
        assets,
        ierFormsA,
        ierFormsB,
        projects,
        departments,
        slaPolicies
      });
      if (res.success) {
        addToast(res.message, 'success');
      } else {
        addToast(res.message, 'danger');
      }
    } finally {
      setIsPushing(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(getSupabaseSchemaSql());
    setCopied(true);
    addToast('PostgreSQL schema copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#002e5d] to-[#001e3d] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
              <Database className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm tracking-tight">Supabase Cloud Database</h3>
              <p className="text-[11px] text-slate-300">
                Primary cloud persistence for all Coolaire Consolidated Inc. data
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Cloud Info Banner */}
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start justify-between gap-3">
            <div className="space-y-0.5">
              <span className="font-bold text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>100% Cloud-Authoritative Supabase PostgreSQL</span>
              </span>
              <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                All tickets, employee accounts, hardware assets, IER reports, and project roadmaps pull directly from your Supabase cloud tables.
              </p>
            </div>
          </div>

          {/* Credentials Inputs */}
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">
                Supabase Project URL
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">
                Supabase Anon / Public API Key
              </label>
              <input
                type="password"
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Connection Test Result */}
          {status.tested && (
            <div
              className={`p-3 rounded-xl flex items-center gap-2 text-xs font-semibold ${
                status.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}
            >
              {status.success ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{status.message}</span>
            </div>
          )}

          {/* Cloud Database Record Count Summary */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
            <div className="font-extrabold text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
              Live Cloud Record Counter:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                <span className="text-base font-black text-slate-900 dark:text-white">{tickets.length}</span>
                <p className="text-[10px] font-bold text-slate-400">Tickets</p>
              </div>
              <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                <span className="text-base font-black text-slate-900 dark:text-white">{assets.length}</span>
                <p className="text-[10px] font-bold text-slate-400">Assets</p>
              </div>
              <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                <span className="text-base font-black text-slate-900 dark:text-white">{ierFormsA.length + ierFormsB.length}</span>
                <p className="text-[10px] font-bold text-slate-400">IER Forms</p>
              </div>
              <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                <span className="text-base font-black text-slate-900 dark:text-white">{projects.length}</span>
                <p className="text-[10px] font-bold text-slate-400">IT Projects</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleTestAndSave}
              disabled={isTesting || !url || !anonKey}
              className="px-4 py-2.5 rounded-xl bg-[#002e5d] hover:bg-[#002244] text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-blue-950/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Server className="w-3.5 h-3.5" />
              <span>{isTesting ? 'Verifying...' : 'Save & Connect'}</span>
            </button>

            <button
              type="button"
              onClick={handlePullAll}
              disabled={isSupabaseSyncing}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              <DownloadCloud className={`w-3.5 h-3.5 ${isSupabaseSyncing ? 'animate-bounce' : ''}`} />
              <span>{isSupabaseSyncing ? 'Pulling Data...' : 'Pull All Supabase Data'}</span>
            </button>

            <button
              type="button"
              onClick={handlePushAll}
              disabled={isPushing || !url || !anonKey}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 disabled:opacity-50 transition-all cursor-pointer"
            >
              <UploadCloud className={`w-3.5 h-3.5 ${isPushing ? 'animate-spin' : ''}`} />
              <span>{isPushing ? 'Pushing Data...' : 'Seed / Push Data to Supabase'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSql(!showSql)}
              className="px-3.5 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-bold text-xs flex items-center gap-1.5 border border-purple-200 dark:border-purple-800 ml-auto transition-all cursor-pointer"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{showSql ? 'Hide SQL' : 'View SQL Schema'}</span>
            </button>
          </div>

          {/* SQL Schema Preview */}
          {showSql && (
            <div className="space-y-2 pt-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-[11px] text-slate-600 dark:text-slate-300">
                  Supabase SQL Editor Script:
                </span>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied!' : 'Copy Script'}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-[10px] max-h-48 overflow-y-auto leading-relaxed border border-slate-700">
                {getSupabaseSchemaSql()}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
