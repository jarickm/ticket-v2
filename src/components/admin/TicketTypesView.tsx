import React from 'react';
import { useApp } from '../../context/AppContext';
import { Tags, ShieldCheck, CheckCircle } from 'lucide-react';
import { PriorityBadge } from '../dashboard/DashboardView';

export const TicketTypesView: React.FC = () => {
  const { ticketTypes } = useApp();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          HelpDesk Service Catalog & Ticket Categories
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
          Standardized ITIL classification types, routing rules, and baseline urgency mapping.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-3xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-700/60 text-[10px] uppercase font-extrabold tracking-wider text-slate-400">
              <th className="py-3 px-5">Category Name</th>
              <th className="py-3 px-4">Owning Department</th>
              <th className="py-3 px-4">Default Baseline Priority</th>
              <th className="py-3 px-5">Description & Scope</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40">
            {ticketTypes.map((type) => (
              <tr key={type.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition-colors">
                <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-white">
                  {type.name}
                </td>
                <td className="py-3.5 px-4 font-semibold text-blue-600 dark:text-blue-400">
                  {type.department}
                </td>
                <td className="py-3.5 px-4">
                  <PriorityBadge priority={type.default_priority} />
                </td>
                <td className="py-3.5 px-5 text-slate-600 dark:text-slate-300">
                  {type.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
