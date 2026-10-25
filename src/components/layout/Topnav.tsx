import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Menu,
  Search,
  Bell,
  Moon,
  Sun,
  LogOut,
  PlusCircle,
  Ticket as TicketIcon,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface TopnavProps {
  onToggleSidebar: () => void;
}

export const Topnav: React.FC<TopnavProps> = ({ onToggleSidebar }) => {
  const {
    currentUser,
    currentView,
    setCurrentView,
    searchQuery,
    setSearchQuery,
    darkMode,
    toggleDarkMode,
    logout,
    setIsSubmitTicketModalOpen,
    setSelectedTicketId,
    tickets
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const supabaseCreds = typeof window !== 'undefined' ? localStorage.getItem('cci_supabase_url') : null;

  // View Title Mapping
  const viewTitles: Record<string, string> = {
    dashboard: 'Workspace Dashboard',
    profile: 'User Profile & Signature',
    knowledge_base: 'IT Knowledge Base',
    directory: 'Employee Directory',
    ier_a: 'IER Form A: Inspection & Evaluation',
    ier_b: 'IER Form B: Service & Repair',
    ier_hub: 'IER Central Hub',
    it_projects: 'IT Project Roadmap Board',
    it_project_analytics: 'Project Portfolio Analytics',
    manage_ticket_types: 'Ticket Categories & Service Catalog',
    analytics: 'HelpDesk Performance Analytics',
    sla_analytics: 'SLA Tracking & Breach Monitor',
    assets: 'IT Hardware & Asset Inventory',
    manage_departments: 'Department Management',
    slas: 'SLA Policy Master Matrix',
    users: 'User Account Management',
    it_staff: 'IT Support Personnel',
    role_settings: 'Role Access Permissions',
    archive: 'Ticket Archives',
    settings: 'System Configuration',
    audit: 'Security & Audit Trail'
  };

  const title = viewTitles[currentView] || 'Workspace';

  return (
    <header className="bg-white dark:bg-slate-800 rounded-2xl h-16 px-4 md:px-6 mb-6 flex items-center justify-between border border-slate-200/80 dark:border-slate-700/60 shadow-sm transition-colors">
      {/* Left: Mobile Toggle & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle navigation"
          className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h1 className="text-base md:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <span>{title}</span>
        </h1>
      </div>

      {/* Middle: Quick Search */}
      <div className="hidden md:flex items-center w-64 lg:w-80 bg-slate-100/80 dark:bg-slate-900/60 rounded-xl px-3 py-1.5 border border-slate-200/60 dark:border-slate-700/40 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
        <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tickets, assets, logs..."
          className="bg-transparent border-none text-xs font-semibold text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none w-full"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-[10px] bg-slate-200 dark:bg-slate-700 rounded-full w-4 h-4 flex items-center justify-center text-slate-500 hover:text-slate-800"
          >
            ×
          </button>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Supabase Indicator */}
        <button
          onClick={() => setCurrentView('settings')}
          className={`hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-colors cursor-pointer ${
            supabaseCreds
              ? 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
              : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
          }`}
          title="Supabase Database Settings"
        >
          <span className={`w-2 h-2 rounded-full ${supabaseCreds ? 'bg-emerald-500 shadow-[0_0_6px_#10b981] animate-pulse' : 'bg-slate-400'}`} />
          <span>{supabaseCreds ? 'Supabase: Active' : 'Supabase: Connect'}</span>
        </button>

        {/* Export CSV (From original app /export_report) */}
        <button
          onClick={() => {
            const csvRows = [
              ['Ticket #', 'Subject', 'Department', 'Priority', 'Status', 'Assigned IT', 'Created At'],
              ...tickets.map((t) => [
                t.ticket_number,
                `"${t.subject.replace(/"/g, '""')}"`,
                t.department,
                t.priority,
                t.status,
                t.assigned_it || 'Unassigned',
                t.created_at
              ])
            ];
            const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.join(',')).join('\n');
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            link.setAttribute('download', `coolaire_tickets_export_${new Date().toISOString().substring(0, 10)}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
          className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
          title="Export CSV Report"
        >
          <span>Export CSV</span>
        </button>

        {/* Quick Submit Ticket */}
        <button
          onClick={() => setIsSubmitTicketModalOpen(true)}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-bold transition-all border border-blue-200/50 dark:border-blue-800/50 shadow-xs"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New Ticket</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700/80 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#d71921] ring-2 ring-white dark:ring-slate-800" />
          </button>

          {isNotifOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)} />
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700/60 px-1">
                  <span className="font-extrabold text-xs text-slate-900 dark:text-white">Recent Alerts</span>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">3 Unread</span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-700/50 max-h-64 overflow-y-auto my-1">
                  {tickets.slice(0, 3).map((t) => (
                    <div
                      key={t.id}
                      onClick={() => {
                        setSelectedTicketId(t.id);
                        setIsNotifOpen(false);
                      }}
                      className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors flex items-start gap-2.5"
                    >
                      <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                        <TicketIcon className="w-3.5 h-3.5" />
                      </div>
                      <div className="overflow-hidden flex-1">
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {t.ticket_number}: {t.subject}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>Status: {t.status}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        IER Form A (#0042) Verified
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Manager & IT signs recorded
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700/80 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* User Role Pill */}
        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
          {currentUser?.avatar ? (
            <img
              src={currentUser.avatar}
              alt={currentUser.full_name}
              className="w-7 h-7 rounded-full border border-slate-200 dark:border-slate-600 object-cover shrink-0"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-black text-xs flex items-center justify-center shrink-0">
              {currentUser?.full_name?.charAt(0) || 'U'}
            </div>
          )}
          <div className="flex flex-col items-start leading-tight">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[120px] truncate">
              {currentUser?.full_name || 'Guest'}
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {currentUser?.role || 'Guest'}
            </span>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-bold transition-all border border-rose-200/40 dark:border-rose-900/40"
          title="Sign Out"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};
