import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Archive, Search, Eye } from 'lucide-react';
import { PriorityBadge } from '../dashboard/DashboardView';

export const ArchiveView: React.FC = () => {
  const { tickets, setSelectedTicketId } = useApp();
  const [search, setSearch] = useState('');

  const archivedTickets = tickets.filter((t) => t.is_archived || t.status === 'Closed');

  const filtered = archivedTickets.filter((t) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        t.ticket_number.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.employee_name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          HelpDesk Historical Archives
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
          Read-only vault of resolved incidents, closed hardware service forms, and completed changes.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-4 md:p-5 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-3">
          <div className="relative w-80">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search archived tickets..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold focus:outline-none"
            />
          </div>
          <span className="text-xs font-bold text-slate-400">
            {filtered.length} Archived Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-700/60 text-[10px] uppercase font-extrabold tracking-wider text-slate-400">
                <th className="py-3 px-5">Archive Ref #</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Requestor</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Date Closed</th>
                <th className="py-3 px-5 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No records in archive database.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-bold text-slate-600 dark:text-slate-400">
                      {t.ticket_number}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200 max-w-xs truncate">
                      {t.subject}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                      {t.employee_name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {t.department}
                    </td>
                    <td className="py-3.5 px-4">
                      <PriorityBadge priority={t.priority} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {t.resolved_at ? t.resolved_at.substring(0, 10) : t.created_at.substring(0, 10)}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => setSelectedTicketId(t.id)}
                        className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-blue-600"
                        title="View Archive"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
