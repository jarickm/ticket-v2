import React from 'react';
import { useApp } from '../../context/AppContext';
import { PieChart, TrendingUp, Users, CheckCircle2, Star, Clock } from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { tickets, departments } = useApp();

  const total = tickets.length;
  const resolved = tickets.filter((t) => t.status === 'Resolved' || t.status === 'Closed').length;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 100;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          HelpDesk Operational Analytics
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
          Enterprise operational metrics, department demand volume, and user satisfaction scoring.
        </p>
      </div>

      {/* Top Bento Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
          <div className="text-[11px] uppercase font-extrabold text-blue-500">Total Processed</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">{total}</div>
          <div className="text-[11px] text-slate-400 mt-1">Tickets across all channels</div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
          <div className="text-[11px] uppercase font-extrabold text-emerald-500">Resolution Rate</div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {resolutionRate}%
          </div>
          <div className="text-[11px] text-emerald-600 mt-1">High fulfillment velocity</div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
          <div className="text-[11px] uppercase font-extrabold text-amber-500">CSAT Satisfaction</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-2 flex items-center gap-1">
            <span>4.9</span>
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
          </div>
          <div className="text-[11px] text-amber-600 mt-1">98.4% Positive user feedback</div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
          <div className="text-[11px] uppercase font-extrabold text-purple-500">First Contact Fix</div>
          <div className="text-3xl font-black text-purple-600 dark:text-purple-400 mt-2">78%</div>
          <div className="text-[11px] text-purple-600 mt-1">Single-touch resolution rate</div>
        </div>
      </div>

      {/* Department Influx & Ticket Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Department Volume */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-4">
            Ticket Volume by Requesting Department
          </h3>
          <div className="space-y-3.5">
            {departments.map((dept) => {
              const count = tickets.filter((t) => t.department === dept.name).length;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={dept.id}>
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    <span>{dept.name} ({dept.code})</span>
                    <span>{count} tickets ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.max(pct, 4)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority & Type Distribution */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-4">
            Incident vs Request Classification
          </h3>
          <div className="space-y-4">
            {['Incident', 'Request', 'Change', 'Inquiry', 'Problem'].map((t) => {
              const count = tickets.filter((tk) => tk.ticket_type === t).length;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={t} className="flex items-center justify-between text-xs font-semibold">
                  <span className="w-24 text-slate-800 dark:text-slate-200 font-bold">{t}</span>
                  <div className="flex-1 mx-3">
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${Math.max(pct, 5)}%` }} />
                    </div>
                  </div>
                  <span className="font-mono text-slate-500 w-12 text-right">{count} ({pct}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
