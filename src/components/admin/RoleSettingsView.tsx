import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { Sliders, ShieldCheck, Check, CheckCircle2 } from 'lucide-react';

export const RoleSettingsView: React.FC = () => {
  const { systemSettings, updateRolePermissions } = useApp();

  const [perms, setPerms] = useState(systemSettings.role_permissions);

  const roles: UserRole[] = ['employee', 'manager', 'it support', 'management', 'admin', 'super admin'];

  const menus: { key: keyof typeof perms; label: string; desc: string }[] = [
    { key: 'menu_directory', label: 'Company Directory', desc: 'View global employee contact list' },
    { key: 'menu_ier_b', label: 'IER Form B', desc: 'Create and review heavy service/repair proposals' },
    { key: 'menu_ier_hub', label: 'IER Central Hub', desc: 'Master register of all inspection reports' },
    { key: 'menu_it_projects', label: 'IT Project Kanban', desc: 'Access cross-functional project office board' },
    { key: 'menu_admin_tools', label: 'Admin Configuration', desc: 'Manage SLAs, departments, user roles and system' }
  ];

  const handleToggle = (menuKey: keyof typeof perms, role: UserRole) => {
    if (role === 'super admin') return; // Super admin always has access
    const currentList = perms[menuKey] || [];
    const has = currentList.includes(role);
    const updated = has
      ? currentList.filter((r) => r !== role)
      : [...currentList, role];

    const nextPerms = { ...perms, [menuKey]: updated };
    setPerms(nextPerms);
    updateRolePermissions(nextPerms);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Role-Based Access Control (RBAC) Permissions
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
          Dynamic matrix controlling navigation visibility and feature privileges across system roles.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-700/60 text-[10px] uppercase font-extrabold tracking-wider text-slate-400">
                <th className="py-3 px-5 w-72">Workspace Module</th>
                {roles.map((r) => (
                  <th key={r} className="py-3 px-3 text-center capitalize">
                    {r}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40">
              {menus.map((m) => (
                <tr key={m.key} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="py-4 px-5">
                    <div className="font-extrabold text-slate-900 dark:text-white">{m.label}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{m.desc}</div>
                  </td>

                  {roles.map((r) => {
                    const isGranted = r === 'super admin' || (perms[m.key] || []).includes(r);

                    return (
                      <td key={r} className="py-4 px-3 text-center">
                        <button
                          type="button"
                          disabled={r === 'super admin'}
                          onClick={() => handleToggle(m.key, r)}
                          className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all ${
                            isGranted
                              ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-300 dark:text-slate-600'
                          } ${r === 'super admin' ? 'opacity-80 cursor-not-allowed' : 'hover:scale-105 cursor-pointer'}`}
                          title={isGranted ? 'Access Granted' : 'Access Denied'}
                        >
                          {isGranted ? <Check className="w-4 h-4 font-black" /> : <span className="text-xs">✕</span>}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-700/60 text-[11px] text-slate-400 font-semibold flex items-center justify-between">
          <span>Changes are saved instantly to persistent workspace configuration.</span>
          <span>Super Admin maintains unrestricted master access.</span>
        </div>
      </div>
    </div>
  );
};
