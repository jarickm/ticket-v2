import React from 'react';
import { useApp, AppView } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  LayoutGrid,
  Home,
  User as UserIcon,
  BookOpen,
  Contact,
  FileSignature,
  Wrench,
  Tags,
  PieChart,
  Timer,
  Boxes,
  Building,
  ShieldCheck,
  Users,
  Briefcase,
  Kanban,
  Sliders,
  Archive,
  Fingerprint,
  PackageCheck,
  ChevronDown,
  Sun,
  Moon
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    currentView,
    setCurrentView,
    canAccess,
    switchUserRole,
    setIsSubmitTicketModalOpen,
    darkMode,
    toggleDarkMode
  } = useApp();

  const handleNav = (view: AppView) => {
    setCurrentView(view);
    onClose();
  };

  const currentRole = (currentUser?.role || 'employee').toLowerCase() as UserRole;
  const initial = currentUser?.username ? currentUser.username[0].toUpperCase() : 'G';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        id="sidebar"
        className={`fixed top-0 left-0 h-screen w-[290px] p-5 z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-3xl p-4 flex flex-col h-full shadow-xl dark:shadow-2xl">
          {/* Brand */}
          <div className="flex items-center gap-3 pb-4 px-2 border-b border-slate-100 dark:border-slate-700/50">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center text-lg font-bold shadow-sm">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center">
                CCI<span className="text-[#d71921]">.</span>
              </div>
              <div className="text-[10px] uppercase font-bold tracking-[2px] text-slate-400 dark:text-slate-400 -mt-1">
                WORKSPACE
              </div>
            </div>
          </div>

          {/* User Card & Persona Selector */}
          <div className="my-3 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#002e5d] text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
                {initial}
              </div>
              <div className="overflow-hidden flex-1">
                <div className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                  {currentUser?.full_name || currentUser?.username || 'Guest User'}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
                  ONLINE
                </div>
              </div>
            </div>

            {/* Persona Switcher Dropdown */}
            <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/50 flex items-center justify-between text-xs">
              <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Role</span>
              <div className="relative group">
                <button
                  type="button"
                  className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[11px] capitalize flex items-center gap-1 hover:border-blue-500 transition-colors"
                >
                  {currentUser?.role || 'Select'}
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
                <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1 hidden group-hover:block z-50">
                  {(['employee', 'manager', 'it support', 'management', 'admin', 'super admin'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => switchUserRole(r)}
                      className={`w-full text-left px-3 py-1.5 text-xs capitalize font-semibold transition-colors ${
                        currentRole === r
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Submit Ticket Button */}
          <button
            onClick={() => {
              setIsSubmitTicketModalOpen(true);
              onClose();
            }}
            className="w-full mb-3 py-2 px-3 bg-gradient-to-r from-[#002e5d] to-[#1e40af] hover:from-[#002447] hover:to-[#1d3557] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <FileSignature className="w-4 h-4" />
            <span>Submit Ticket</span>
          </button>

          {/* Scrollable Nav Items */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
            {/* Core Section */}
            <div>
              <div className="text-[10px] uppercase font-extrabold tracking-[1.2px] text-slate-400 dark:text-slate-500 px-3 mb-1">
                Core Apps
              </div>
              <div className="space-y-0.5">
                <NavItem
                  active={currentView === 'dashboard'}
                  onClick={() => handleNav('dashboard')}
                  icon={<Home className="w-4 h-4 text-sky-500" />}
                  iconBg="bg-sky-50 dark:bg-sky-950/60"
                  label="Dashboard"
                />
                <NavItem
                  active={currentView === 'profile'}
                  onClick={() => handleNav('profile')}
                  icon={<UserIcon className="w-4 h-4 text-purple-500" />}
                  iconBg="bg-purple-50 dark:bg-purple-950/60"
                  label="My Profile"
                />
                <NavItem
                  active={currentView === 'knowledge_base'}
                  onClick={() => handleNav('knowledge_base')}
                  icon={<BookOpen className="w-4 h-4 text-emerald-500" />}
                  iconBg="bg-emerald-50 dark:bg-emerald-950/60"
                  label="Knowledge Base"
                />
                {canAccess('menu_directory') && (
                  <NavItem
                    active={currentView === 'directory'}
                    onClick={() => handleNav('directory')}
                    icon={<Contact className="w-4 h-4 text-amber-500" />}
                    iconBg="bg-amber-50 dark:bg-amber-950/60"
                    label="Directory"
                  />
                )}
              </div>
            </div>

            {/* HelpDesk Section */}
            <div>
              <div className="text-[10px] uppercase font-extrabold tracking-[1.2px] text-slate-400 dark:text-slate-500 px-3 mb-1">
                HelpDesk
              </div>
              <div className="space-y-0.5">
                <NavItem
                  active={currentView === 'ier_a'}
                  onClick={() => handleNav('ier_a')}
                  icon={<FileSignature className="w-4 h-4 text-teal-500" />}
                  iconBg="bg-teal-50 dark:bg-teal-950/60"
                  label="IER Form A"
                />
                {canAccess('menu_ier_b') && (
                  <NavItem
                    active={currentView === 'ier_b'}
                    onClick={() => handleNav('ier_b')}
                    icon={<Wrench className="w-4 h-4 text-indigo-500" />}
                    iconBg="bg-indigo-50 dark:bg-indigo-950/60"
                    label="IER Form B"
                  />
                )}
              </div>
            </div>

            {/* Project Office */}
            {canAccess('menu_it_projects') && (
              <div>
                <div className="text-[10px] uppercase font-extrabold tracking-[1.2px] text-slate-400 dark:text-slate-500 px-3 mb-1">
                  Project Office
                </div>
                <div className="space-y-0.5">
                  <NavItem
                    active={currentView === 'it_projects'}
                    onClick={() => handleNav('it_projects')}
                    icon={<Kanban className="w-4 h-4 text-violet-500" />}
                    iconBg="bg-violet-50 dark:bg-violet-950/60"
                    label="Project Board"
                  />
                  <NavItem
                    active={currentView === 'it_project_analytics'}
                    onClick={() => handleNav('it_project_analytics')}
                    icon={<PieChart className="w-4 h-4 text-blue-500" />}
                    iconBg="bg-blue-50 dark:bg-blue-950/60"
                    label="Project Analytics"
                  />
                </div>
              </div>
            )}

            {/* Asset Management */}
            {canAccess('menu_ier_hub') && (
              <div>
                <div className="text-[10px] uppercase font-extrabold tracking-[1.2px] text-slate-400 dark:text-slate-500 px-3 mb-1">
                  Asset Management
                </div>
                <div className="space-y-0.5">
                  <NavItem
                    active={currentView === 'ier_hub'}
                    onClick={() => handleNav('ier_hub')}
                    icon={<PackageCheck className="w-4 h-4 text-teal-500" />}
                    iconBg="bg-teal-50 dark:bg-teal-950/60"
                    label="IER Central Hub"
                  />
                  <NavItem
                    active={currentView === 'audit'}
                    onClick={() => handleNav('audit')}
                    icon={<Fingerprint className="w-4 h-4 text-indigo-500" />}
                    iconBg="bg-indigo-50 dark:bg-indigo-950/60"
                    label="Audit Trail"
                  />
                </div>
              </div>
            )}

            {/* Admin Tools */}
            {canAccess('menu_admin_tools') && (
              <div>
                <div className="text-[10px] uppercase font-extrabold tracking-[1.2px] text-slate-400 dark:text-slate-500 px-3 mb-1">
                  Admin Tools
                </div>
                <div className="space-y-0.5">
                  <NavItem
                    active={currentView === 'manage_ticket_types'}
                    onClick={() => handleNav('manage_ticket_types')}
                    icon={<Tags className="w-4 h-4 text-orange-500" />}
                    iconBg="bg-orange-50 dark:bg-orange-950/60"
                    label="Ticket Categories"
                  />
                  <NavItem
                    active={currentView === 'analytics'}
                    onClick={() => handleNav('analytics')}
                    icon={<PieChart className="w-4 h-4 text-pink-500" />}
                    iconBg="bg-pink-50 dark:bg-pink-950/60"
                    label="Analytics"
                  />
                  <NavItem
                    active={currentView === 'sla_analytics'}
                    onClick={() => handleNav('sla_analytics')}
                    icon={<Timer className="w-4 h-4 text-red-500" />}
                    iconBg="bg-red-50 dark:bg-red-950/60"
                    label="SLA Performance"
                  />
                  <NavItem
                    active={currentView === 'assets'}
                    onClick={() => handleNav('assets')}
                    icon={<Boxes className="w-4 h-4 text-amber-500" />}
                    iconBg="bg-amber-50 dark:bg-amber-950/60"
                    label="Asset Inventory"
                  />
                  <NavItem
                    active={currentView === 'manage_departments'}
                    onClick={() => handleNav('manage_departments')}
                    icon={<Building className="w-4 h-4 text-blue-500" />}
                    iconBg="bg-blue-50 dark:bg-blue-950/60"
                    label="Departments"
                  />
                  <NavItem
                    active={currentView === 'slas'}
                    onClick={() => handleNav('slas')}
                    icon={<ShieldCheck className="w-4 h-4 text-rose-500" />}
                    iconBg="bg-rose-50 dark:bg-rose-950/60"
                    label="SLA Policies"
                  />
                  <NavItem
                    active={currentView === 'users'}
                    onClick={() => handleNav('users')}
                    icon={<Users className="w-4 h-4 text-purple-500" />}
                    iconBg="bg-purple-50 dark:bg-purple-950/60"
                    label="User Management"
                  />
                  <NavItem
                    active={currentView === 'it_staff'}
                    onClick={() => handleNav('it_staff')}
                    icon={<Briefcase className="w-4 h-4 text-cyan-500" />}
                    iconBg="bg-cyan-50 dark:bg-cyan-950/60"
                    label="IT Personnel"
                  />
                </div>
              </div>
            )}

            {/* System Section */}
            {canAccess('menu_admin_tools') && (
              <div>
                <div className="text-[10px] uppercase font-extrabold tracking-[1.2px] text-slate-400 dark:text-slate-500 px-3 mb-1">
                  System
                </div>
                <div className="space-y-0.5">
                  <NavItem
                    active={currentView === 'role_settings'}
                    onClick={() => handleNav('role_settings')}
                    icon={<Sliders className="w-4 h-4 text-orange-500" />}
                    iconBg="bg-orange-50 dark:bg-orange-950/60"
                    label="Role Permissions"
                  />
                  <NavItem
                    active={currentView === 'archive'}
                    onClick={() => handleNav('archive')}
                    icon={<Archive className="w-4 h-4 text-slate-500" />}
                    iconBg="bg-slate-100 dark:bg-slate-700"
                    label="Archives"
                  />
                  <NavItem
                    active={currentView === 'settings'}
                    onClick={() => handleNav('settings')}
                    icon={<Sliders className="w-4 h-4 text-slate-600 dark:text-slate-300" />}
                    iconBg="bg-slate-100 dark:bg-slate-700"
                    label="System Settings"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle Footer */}
          <div className="pt-3 mt-auto border-t border-slate-100 dark:border-slate-700/60">
            <button
              onClick={toggleDarkMode}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 transition-colors text-xs font-bold cursor-pointer"
            >
              <div className="flex items-center gap-2">
                {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-500" />}
                <span>{darkMode ? 'Light Theme' : 'Dark Theme'}</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold">
                {darkMode ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

interface NavItemProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  iconBg: string;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ active, onClick, icon, iconBg, label }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-left font-semibold text-xs transition-all ${
        active
          ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold shadow-xs'
          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-700/40 hover:text-slate-900 dark:hover:text-white'
      }`}
    >
      <div className={`w-7 h-7 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <span className="truncate">{label}</span>
    </button>
  );
};
