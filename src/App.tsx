import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Topnav } from './components/layout/Topnav';
import { GatewayScreen } from './components/auth/GatewayScreen';
import { LoginScreen } from './components/auth/LoginScreen';
import { DashboardView } from './components/dashboard/DashboardView';
import { ProfileView } from './components/profile/ProfileView';
import { KnowledgeBaseView } from './components/kb/KnowledgeBaseView';
import { DirectoryView } from './components/directory/DirectoryView';
import { IerFormAView } from './components/ier/IerFormAView';
import { IerFormBView } from './components/ier/IerFormBView';
import { IerCentralHubView } from './components/ier/IerCentralHubView';
import { ProjectBoardView } from './components/projects/ProjectBoardView';
import { ProjectAnalyticsView } from './components/projects/ProjectAnalyticsView';
import { TicketTypesView } from './components/admin/TicketTypesView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { SlaAnalyticsView } from './components/sla/SlaAnalyticsView';
import { AssetsView } from './components/assets/AssetsView';
import { DepartmentsView } from './components/admin/DepartmentsView';
import { SlaPoliciesView } from './components/sla/SlaPoliciesView';
import { UsersView } from './components/admin/UsersView';
import { ItStaffView } from './components/admin/ItStaffView';
import { RoleSettingsView } from './components/admin/RoleSettingsView';
import { ArchiveView } from './components/admin/ArchiveView';
import { SystemSettingsView } from './components/admin/SystemSettingsView';
import { AuditTrailView } from './components/admin/AuditTrailView';
import { SubmitTicketModal } from './components/tickets/SubmitTicketModal';
import { TicketDetailModal } from './components/tickets/TicketDetailModal';
import { PrintIerModal } from './components/ier/PrintIerModal';
import { AiCompanionDrawer } from './components/ai/AiCompanionDrawer';
import { SupabaseCloudModal } from './components/common/SupabaseCloudModal';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export const App: React.FC = () => {
  const {
    currentUser,
    isGatewayPassed,
    currentView,
    systemSettings,
    toasts,
    removeToast,
    isSupabaseModalOpen,
    setIsSupabaseModalOpen
  } = useApp();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 1. PIN Gateway
  if (!isGatewayPassed) {
    return <GatewayScreen />;
  }

  // 2. Login Screen
  if (!currentUser) {
    return <LoginScreen />;
  }

  // 3. View Switcher
  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'profile':
        return <ProfileView />;
      case 'knowledge_base':
        return <KnowledgeBaseView />;
      case 'directory':
        return <DirectoryView />;
      case 'ier_a':
        return <IerFormAView />;
      case 'ier_b':
        return <IerFormBView />;
      case 'ier_hub':
        return <IerCentralHubView />;
      case 'it_projects':
        return <ProjectBoardView />;
      case 'it_project_analytics':
        return <ProjectAnalyticsView />;
      case 'manage_ticket_types':
        return <TicketTypesView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'sla_analytics':
        return <SlaAnalyticsView />;
      case 'assets':
        return <AssetsView />;
      case 'manage_departments':
        return <DepartmentsView />;
      case 'slas':
        return <SlaPoliciesView />;
      case 'users':
        return <UsersView />;
      case 'it_staff':
        return <ItStaffView />;
      case 'role_settings':
        return <RoleSettingsView />;
      case 'archive':
        return <ArchiveView />;
      case 'settings':
        return <SystemSettingsView />;
      case 'audit':
        return <AuditTrailView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f9] dark:bg-[#0f172a] text-[#1e293b] dark:text-[#f8fafc] transition-colors relative">
      {/* Background gradient mesh */}
      <div className="mesh-bg" />

      {/* Sidebar Navigation */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Workspace Wrapper (Matching Flask #content-wrapper width and margin) */}
      <div className="lg:ml-[290px] min-h-screen p-3 md:p-6 transition-all">
        {/* Top Navigation */}
        <Topnav onToggleSidebar={() => setIsSidebarOpen(true)} />

        {/* Global Broadcast Banner */}
        {systemSettings?.system_notice && (
          <div className="mb-6 p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200/80 dark:border-blue-800/60 shadow-xs flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-blue-900 dark:text-blue-200 font-semibold">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
              <span>{systemSettings.system_notice}</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-blue-500 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800 shrink-0">
              Notice
            </span>
          </div>
        )}

        {/* Active View Container */}
        <main className="pb-16">{renderCurrentView()}</main>
      </div>

      {/* Global Modals & AI Companion */}
      <SubmitTicketModal />
      <TicketDetailModal />
      <PrintIerModal />
      <AiCompanionDrawer />
      <SupabaseCloudModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />

      {/* Toast Notifications */}
      <div className="fixed bottom-5 right-5 z-50 space-y-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-3.5 rounded-2xl shadow-xl border flex items-center justify-between gap-3 text-xs font-bold pointer-events-auto transition-all animate-in slide-in-from-bottom-5 ${
              toast.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800'
                : toast.type === 'danger'
                ? 'bg-rose-50 dark:bg-rose-950 text-rose-900 dark:text-rose-200 border-rose-300 dark:border-rose-800'
                : toast.type === 'warning'
                ? 'bg-amber-50 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              {toast.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />}
              {toast.type === 'danger' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-blue-600 shrink-0" />}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
