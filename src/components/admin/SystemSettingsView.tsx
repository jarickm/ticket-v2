import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  KeyRound,
  Mail,
  Bell,
  CheckCircle,
  Database,
  RefreshCw,
  Server,
  AlertCircle,
  UploadCloud,
  DownloadCloud,
  FileCode,
  Copy,
  Check,
  Flame,
  ArrowRight
} from 'lucide-react';
import {
  getSavedSupabaseConfig,
  saveSupabaseCredentials,
  testSupabaseConnection,
  fetchRemoteTickets,
  pushAllDataToSupabase,
  getSupabaseSchemaSql
} from '../../services/supabase';
import { transferAllDataToFirestore } from '../../services/firestoreSync';

export const SystemSettingsView: React.FC = () => {
  const {
    systemSettings,
    updateSystemSettings,
    addToast,
    tickets,
    users,
    assets,
    ierFormsA,
    ierFormsB,
    projects
  } = useApp();

  const [companyPin, setCompanyPin] = useState(systemSettings.company_pin);
  const [companyName, setCompanyName] = useState(systemSettings.company_name);
  const [smtpServer, setSmtpServer] = useState(systemSettings.smtp_server);
  const [smtpPort, setSmtpPort] = useState(systemSettings.smtp_port);
  const [senderEmail, setSenderEmail] = useState(systemSettings.sender_email);
  const [systemNotice, setSystemNotice] = useState(systemSettings.system_notice);

  // Supabase Database state
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [isTestingDb, setIsTestingDb] = useState(false);
  const [isPushingSupabase, setIsPushingSupabase] = useState(false);
  const [isTransferringFirestore, setIsTransferringFirestore] = useState(false);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const [dbStatus, setDbStatus] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
  }>({
    tested: false,
    success: false,
    message: ''
  });

  const [firestoreStatus, setFirestoreStatus] = useState<string | null>(null);

  useEffect(() => {
    const creds = getSavedSupabaseConfig();
    setSupabaseUrl(creds.url);
    setSupabaseKey(creds.anonKey);
    if (creds.url && creds.anonKey) {
      setDbStatus({
        tested: true,
        success: true,
        message: 'Supabase credentials loaded. Ready for live read/write sync.'
      });
    }
  }, []);

  const handleTestSupabase = async () => {
    setIsTestingDb(true);
    try {
      const res = await testSupabaseConnection(supabaseUrl, supabaseKey);
      setDbStatus({
        tested: true,
        success: res.success,
        message: res.message
      });
      if (res.success) {
        saveSupabaseCredentials(supabaseUrl, supabaseKey);
        addToast('Connected to Supabase database successfully!', 'success');
      } else {
        addToast(res.message, 'danger');
      }
    } finally {
      setIsTestingDb(false);
    }
  };

  const handlePullRemoteRecords = async () => {
    setIsTestingDb(true);
    try {
      saveSupabaseCredentials(supabaseUrl, supabaseKey);
      const remoteTickets = await fetchRemoteTickets();
      if (remoteTickets && remoteTickets.length > 0) {
        addToast(`Retrieved ${remoteTickets.length} existing tickets from Supabase!`, 'success');
      } else {
        addToast('Connected to Supabase. Table verified.', 'info');
      }
    } catch (err: any) {
      addToast(`Sync error: ${err.message}`, 'danger');
    } finally {
      setIsTestingDb(false);
    }
  };

  const handlePushToSupabase = async () => {
    setIsPushingSupabase(true);
    try {
      saveSupabaseCredentials(supabaseUrl, supabaseKey);
      const res = await pushAllDataToSupabase({
        tickets,
        users,
        assets,
        ierFormsA,
        ierFormsB,
        projects
      });
      if (res.success) {
        addToast(res.message, 'success');
      } else {
        addToast(res.message, 'danger');
      }
    } finally {
      setIsPushingSupabase(false);
    }
  };

  const handleTransferToFirestore = async () => {
    setIsTransferringFirestore(true);
    setFirestoreStatus('Transferring all tickets, users, assets, and IER forms to Firebase Firestore...');
    try {
      const res = await transferAllDataToFirestore({
        tickets,
        users,
        assets,
        ierFormsA,
        ierFormsB,
        projects
      });
      setFirestoreStatus(res.message);
      if (res.success) {
        addToast(res.message, 'success');
      } else {
        addToast(res.message, 'danger');
      }
    } catch (err: any) {
      const msg = err.message || 'Firestore transfer failed';
      setFirestoreStatus(msg);
      addToast(msg, 'danger');
    } finally {
      setIsTransferringFirestore(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(getSupabaseSchemaSql());
    setCopiedSql(true);
    addToast('PostgreSQL SQL Schema script copied to clipboard!', 'success');
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseCredentials(supabaseUrl, supabaseKey);
    updateSystemSettings({
      company_pin: companyPin.trim(),
      company_name: companyName.trim(),
      smtp_server: smtpServer.trim(),
      smtp_port: Number(smtpPort),
      sender_email: senderEmail.trim(),
      system_notice: systemNotice.trim()
    });
    addToast('System configuration saved successfully.', 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-4xl pb-12">
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          System & Database Configuration
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
          Supabase PostgreSQL main database, Firebase Firestore replication, company security PIN, and SMTP mail relay.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* 1. Supabase Database Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-500" />
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Main Database: Supabase PostgreSQL
                </h3>
                <span className="text-[10px] text-slate-400 font-semibold">
                  Primary live cloud storage for tickets, IER forms, assets, and users.
                </span>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1.5 ${
                dbStatus.success
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${dbStatus.success ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span>{dbStatus.success ? 'Supabase Active & Live' : 'Requires Configuration'}</span>
            </span>
          </div>

          <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
            All tickets and workspace forms automatically sync with this Supabase PostgreSQL instance. If your Supabase database is new, click <span className="font-bold text-blue-600 dark:text-blue-400">View SQL Schema</span> to copy the required table definitions.
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">
                Supabase Project URL
              </label>
              <input
                type="text"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://your-project-id.supabase.co"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">
                Supabase Anon / Public API Key
              </label>
              <input
                type="password"
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono text-xs text-slate-900 dark:text-white"
              />
            </div>

            {dbStatus.tested && (
              <div
                className={`p-3.5 rounded-xl flex items-center gap-2.5 text-xs font-semibold ${
                  dbStatus.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                }`}
              >
                {dbStatus.success ? (
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                )}
                <span>{dbStatus.message}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleTestSupabase}
                disabled={isTestingDb || !supabaseUrl || !supabaseKey}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold text-xs flex items-center gap-1.5 disabled:opacity-50 transition-all cursor-pointer"
              >
                <Server className="w-3.5 h-3.5 text-blue-500" />
                <span>{isTestingDb ? 'Testing Connection...' : 'Test Connection'}</span>
              </button>

              <button
                type="button"
                onClick={handlePullRemoteRecords}
                disabled={isTestingDb || !supabaseUrl || !supabaseKey}
                className="px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center gap-1.5 disabled:opacity-50 border border-blue-200/50 dark:border-blue-800/50 transition-all cursor-pointer"
              >
                <DownloadCloud className={`w-3.5 h-3.5 ${isTestingDb ? 'animate-bounce' : ''}`} />
                <span>Pull Live Supabase Records</span>
              </button>

              <button
                type="button"
                onClick={handlePushToSupabase}
                disabled={isPushingSupabase || !supabaseUrl || !supabaseKey}
                className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-1.5 disabled:opacity-50 border border-emerald-200/50 dark:border-emerald-800/50 transition-all cursor-pointer"
              >
                <UploadCloud className={`w-3.5 h-3.5 ${isPushingSupabase ? 'animate-spin' : ''}`} />
                <span>{isPushingSupabase ? 'Pushing Data...' : 'Seed / Push All Data to Supabase'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowSqlModal(true)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-all ml-auto cursor-pointer"
              >
                <FileCode className="w-3.5 h-3.5 text-purple-500" />
                <span>View Supabase SQL Schema</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. Firebase Firestore Data Transfer Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Firebase Firestore Cloud Replication & Mirror
                </h3>
                <span className="text-[10px] text-slate-400 font-semibold">
                  Google Cloud Project: <span className="font-mono text-slate-600 dark:text-slate-300">gen-lang-client-0709840443</span>
                </span>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              Firestore Ready
            </span>
          </div>

          <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
            Want to copy or transfer all data to Firebase Firestore as requested? You can mirror all tickets, users, assets, IER reports, and project roadmaps directly into your provisioned Firestore database with one click.
          </p>

          <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="font-extrabold text-xs text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                <span>Total Live Records:</span>
                <span className="bg-amber-200/60 dark:bg-amber-900/60 px-2 py-0.5 rounded text-[10px] font-mono">
                  {tickets.length} Tickets • {users.length} Users • {assets.length} Assets • {ierFormsA.length + ierFormsB.length} IERs
                </span>
              </div>
              <div className="text-[11px] text-amber-800 dark:text-amber-300 mt-1">
                Transfers documents to collections: <span className="font-mono">tickets</span>, <span className="font-mono">users</span>, <span className="font-mono">assets</span>, <span className="font-mono">ier_forms_a</span>, <span className="font-mono">ier_forms_b</span>, <span className="font-mono">it_projects</span>.
              </div>
            </div>

            <button
              type="button"
              disabled={isTransferringFirestore}
              onClick={handleTransferToFirestore}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-extrabold text-xs shadow-md shadow-amber-900/10 flex items-center gap-2 shrink-0 disabled:opacity-50 cursor-pointer"
            >
              <Flame className={`w-4 h-4 ${isTransferringFirestore ? 'animate-bounce' : ''}`} />
              <span>{isTransferringFirestore ? 'Transferring...' : 'Transfer All Data to Firebase Firestore'}</span>
            </button>
          </div>

          {firestoreStatus && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{firestoreStatus}</span>
            </div>
          )}
        </div>

        {/* 3. Gateway PIN Security */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-700/60">
            <KeyRound className="w-4 h-4 text-amber-500" />
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Gateway Access PIN Security
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">
                Active Employee Gateway PIN
              </label>
              <input
                type="text"
                required
                maxLength={8}
                value={companyPin}
                onChange={(e) => setCompanyPin(e.target.value)}
                placeholder="7799"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono text-base font-black tracking-widest text-slate-900 dark:text-white"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Required by employees when accessing the /portal secure gateway.
              </span>
            </div>

            <div>
              <label className="block text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">
                Company Display Name
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold"
              />
            </div>
          </div>
        </div>

        {/* 4. SMTP Mail Relay */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-700/60">
            <Mail className="w-4 h-4 text-blue-500" />
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Automated Notification Email Gateway (SMTP)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">
                SMTP Server Host
              </label>
              <input
                type="text"
                value={smtpServer}
                onChange={(e) => setSmtpServer(e.target.value)}
                placeholder="smtp.office365.com"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">
                Port
              </label>
              <input
                type="number"
                value={smtpPort}
                onChange={(e) => setSmtpPort(Number(e.target.value))}
                placeholder="587"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">
              Sender Email Address
            </label>
            <input
              type="email"
              value={senderEmail}
              onChange={(e) => setSenderEmail(e.target.value)}
              placeholder="it-helpdesk@coolaireconsolidated.com"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
            />
          </div>
        </div>

        {/* 5. Global Broadcast */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-700/60">
            <Bell className="w-4 h-4 text-purple-500" />
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Enterprise Maintenance Notice Banner
            </h3>
          </div>

          <div>
            <label className="block text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">
              Broadcast Message
            </label>
            <textarea
              rows={2}
              value={systemNotice}
              onChange={(e) => setSystemNotice(e.target.value)}
              placeholder="Displayed across all user workspaces..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-[#002e5d] hover:bg-[#002042] text-white text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Apply System Settings</span>
          </button>
        </div>
      </form>

      {/* SQL Schema Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-purple-600" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Supabase PostgreSQL SQL Schema
                </h3>
              </div>
              <button
                onClick={() => setShowSqlModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
              >
                ✕ Close
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Paste this SQL into your <strong className="text-slate-700 dark:text-slate-200">Supabase Dashboard &gt; SQL Editor</strong> to create the tables (<code className="font-mono">tickets</code>, <code className="font-mono">assets</code>, <code className="font-mono">ier_forms_a</code>, <code className="font-mono">ier_forms_b</code>, <code className="font-mono">it_projects</code>) and configure open anon policies.
            </p>

            <pre className="flex-1 overflow-y-auto p-4 bg-slate-950 text-slate-100 font-mono text-[11px] rounded-2xl border border-slate-800 select-all">
              {getSupabaseSchemaSql()}
            </pre>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={handleCopySql}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedSql ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy Entire SQL Script'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowSqlModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
