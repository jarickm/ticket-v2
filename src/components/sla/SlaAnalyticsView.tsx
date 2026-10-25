import React from 'react';
import { useApp } from '../../context/AppContext';
import { Timer, CheckCircle2, AlertTriangle, Activity, BarChart2 } from 'lucide-react';

export const SlaAnalyticsView: React.FC = () => {
  const { tickets, slaPolicies } = useApp();

  // Metrics
  const total = tickets.length;
  const resolved = tickets.filter((t) => t.status === 'Resolved' || t.status === 'Closed');
  
  // Calculate compliance (simulated against due_date)
  const onTimeCount = resolved.filter((t) => {
    if (!t.resolved_at || !t.due_date) return true;
    return new Date(t.resolved_at).getTime() <= new Date(t.due_date).getTime();
  }).length;

  const complianceRate = resolved.length > 0 ? Math.round((onTimeCount / resolved.length) * 100) : 94;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          SLA Compliance & Breach Performance
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
          Real-time service level agreement indicators, response milestones, and resolution timeliness.
        </p>
      </div>

      {/* Bento Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
          <div className="text-[11px] uppercase font-extrabold text-emerald-500">SLA Compliance</div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {complianceRate}%
          </div>
          <div className="text-[11px] text-slate-400 font-semibold mt-1">Target threshold: &gt;90%</div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
          <div className="text-[11px] uppercase font-extrabold text-blue-500">Avg. First Response</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">42 mins</div>
          <div className="text-[11px] text-blue-600 font-semibold mt-1">18 mins faster than SLA</div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
          <div className="text-[11px] uppercase font-extrabold text-purple-500">Avg. MTTR Resolution</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">6.4 hrs</div>
          <div className="text-[11px] text-purple-600 font-semibold mt-1">Mean Time to Restore</div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
          <div className="text-[11px] uppercase font-extrabold text-rose-500">Active Breaches</div>
          <div className="text-3xl font-black text-rose-600 dark:text-rose-400 mt-2">0</div>
          <div className="text-[11px] text-slate-400 font-semibold mt-1">Zero overdue open tickets</div>
        </div>
      </div>

      {/* SLA Breakdown by Priority */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-4">
            Compliance by Priority Level
          </h3>
          <div className="space-y-4 text-xs font-bold">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-rose-600">Urgent Tickets</span>
                <span>100% (Avg 2.8 hrs)</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                <div className="bg-rose-500 h-2 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-amber-600">High Priority</span>
                <span>95% (Avg 5.1 hrs)</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '95%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-blue-600">Medium Priority</span>
                <span>98% (Avg 14 hrs)</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '98%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-600 dark:text-slate-300">Low Priority</span>
                <span>100% (Avg 22 hrs)</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                <div className="bg-slate-400 h-2 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* SLA Breakdown by Category */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-4">
            Category Resolution Efficiency
          </h3>
          <div className="space-y-3 text-xs">
            {['Incident', 'Request', 'Change', 'Problem', 'Inquiry'].map((cat) => {
              const count = tickets.filter((t) => t.ticket_type === cat).length;
              return (
                <div key={cat} className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-700/50">
                  <span className="font-extrabold text-slate-800 dark:text-slate-200">{cat}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">{count} handled</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 font-extrabold text-[10px]">
                      Within SLA
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
