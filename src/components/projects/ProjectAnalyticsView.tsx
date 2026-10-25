import React from 'react';
import { useApp } from '../../context/AppContext';
import { Kanban, PieChart, CheckCircle2, TrendingUp, Clock, AlertTriangle } from 'lucide-react';

export const ProjectAnalyticsView: React.FC = () => {
  const { projects } = useApp();

  const total = projects.length;
  const completed = projects.filter((p) => p.status === 'Completed').length;
  const inProgress = projects.filter((p) => p.status === 'In Progress').length;
  const planning = projects.filter((p) => p.status === 'Planning' || p.status === 'To Do').length;

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Department counts
  const deptCounts: Record<string, number> = {};
  projects.forEach((p) => {
    deptCounts[p.department] = (deptCounts[p.department] || 0) + 1;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          IT Project Portfolio Analytics
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
          Delivery velocity, resource allocation, and department modernization tracking.
        </p>
      </div>

      {/* Metric Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
          <div className="text-[11px] uppercase font-extrabold text-slate-400">Total Initiatives</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">{total}</div>
          <div className="text-[11px] text-blue-600 font-semibold mt-1">Active IT Roadmap</div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
          <div className="text-[11px] uppercase font-extrabold text-emerald-500">Completed & Deployed</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">{completed}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">{completionRate}% Deliverable rate</div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
          <div className="text-[11px] uppercase font-extrabold text-purple-500">In Development</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">{inProgress}</div>
          <div className="text-[11px] text-purple-600 font-semibold mt-1">Active sprint execution</div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
          <div className="text-[11px] uppercase font-extrabold text-amber-500">Pipeline / Backlog</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">{planning}</div>
          <div className="text-[11px] text-amber-600 font-semibold mt-1">Scheduled for next quarter</div>
        </div>
      </div>

      {/* Breakdown Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Department Volume */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-4">
            Projects by Beneficiary Department
          </h3>
          <div className="space-y-3">
            {Object.entries(deptCounts).map(([dept, count]) => {
              const pct = Math.round((count / total) * 100);
              return (
                <div key={dept}>
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    <span>{dept}</span>
                    <span>{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-4">
            Roadmap Pipeline Health
          </h3>
          <div className="space-y-4">
            {['Completed', 'In Progress', 'In Review', 'To Do', 'Planning'].map((st) => {
              const cnt = projects.filter((p) => p.status === st).length;
              const pct = total > 0 ? Math.round((cnt / total) * 100) : 0;
              return (
                <div key={st} className="flex items-center justify-between text-xs">
                  <div className="font-bold text-slate-800 dark:text-slate-200 w-32">{st}</div>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="font-mono font-bold text-slate-500 w-12 text-right">{cnt} ({pct}%)</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
