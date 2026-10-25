import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SlaPolicy } from '../../types';
import { ShieldCheck, Edit, Clock, X, CheckCircle } from 'lucide-react';
import { PriorityBadge } from '../dashboard/DashboardView';

export const SlaPoliciesView: React.FC = () => {
  const { slaPolicies, updateSlaPolicy } = useApp();
  const [editingPolicy, setEditingPolicy] = useState<SlaPolicy | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPolicy) return;
    updateSlaPolicy(editingPolicy.id, editingPolicy);
    setEditingPolicy(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          SLA Policies Master Matrix
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
          Response and resolution threshold definitions by ticket type and priority level.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-700/60 text-[10px] uppercase font-extrabold tracking-wider text-slate-400">
                <th className="py-3 px-5">Ticket Type</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Response Time SLA</th>
                <th className="py-3 px-4">Resolution Time SLA</th>
                <th className="py-3 px-4">Escalation Authority</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40">
              {slaPolicies.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-white">
                    {p.ticket_type}
                  </td>
                  <td className="py-3.5 px-4">
                    <PriorityBadge priority={p.priority} />
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                    {p.response_in_hours} hours
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {p.resolve_in_hours} hours
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-semibold">
                    {p.escalation_level}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <button
                      onClick={() => setEditingPolicy(p)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-200 text-xs font-bold inline-flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Adjust</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl p-6 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Adjust SLA Policy Thresholds
              </h3>
              <button onClick={() => setEditingPolicy(null)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 mt-4">
              <div>
                <label className="block text-[11px] uppercase font-bold text-slate-500 mb-1">
                  Policy Scope
                </label>
                <div className="font-bold text-slate-800 dark:text-slate-200">
                  {editingPolicy.ticket_type} — {editingPolicy.priority} Priority
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase font-bold text-slate-500 mb-1">
                  Response SLA Target (Hours)
                </label>
                <input
                  type="number"
                  min="1"
                  value={editingPolicy.response_in_hours}
                  onChange={(e) =>
                    setEditingPolicy({ ...editingPolicy, response_in_hours: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase font-bold text-slate-500 mb-1">
                  Resolution SLA Target (Hours)
                </label>
                <input
                  type="number"
                  min="1"
                  value={editingPolicy.resolve_in_hours}
                  onChange={(e) =>
                    setEditingPolicy({ ...editingPolicy, resolve_in_hours: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase font-bold text-slate-500 mb-1">
                  Escalation Authority
                </label>
                <input
                  type="text"
                  value={editingPolicy.escalation_level}
                  onChange={(e) =>
                    setEditingPolicy({ ...editingPolicy, escalation_level: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPolicy(null)}
                  className="px-4 py-2 text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold"
                >
                  Save Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
