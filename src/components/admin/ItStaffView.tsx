import React from 'react';
import { useApp } from '../../context/AppContext';
import { Briefcase, UserCheck, Shield, CheckCircle, Clock } from 'lucide-react';

export const ItStaffView: React.FC = () => {
  const { users, tickets } = useApp();

  const itStaff = users.filter((u) => u.department === 'IT' || u.role === 'it support' || u.role === 'admin' || u.role === 'super admin');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          IT Support Personnel & Workload
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
          Active technical support engineers, ticket queue loading, and roster availability.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {itStaff.map((staff) => {
          const assignedTickets = tickets.filter(
            (t) => t.assigned_it?.toLowerCase() === staff.full_name.toLowerCase() && t.status !== 'Closed' && t.status !== 'Resolved'
          );

          return (
            <div
              key={staff.user_id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold">
                    {staff.full_name ? staff.full_name[0] : staff.username[0]}
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    On Duty
                  </span>
                </div>

                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {staff.full_name}
                </h3>
                <div className="text-xs text-slate-400 capitalize">{staff.position || staff.role}</div>
                <div className="text-[11px] text-slate-500 mt-1">{staff.email}</div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold">Active Queue Load:</span>
                <span className="font-extrabold text-blue-600 dark:text-blue-400">
                  {assignedTickets.length} Tickets
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
