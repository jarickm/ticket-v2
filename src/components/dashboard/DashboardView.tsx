import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Ticket, TicketStatus, TicketPriority } from '../../types';
import {
  Inbox,
  Clock,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  CheckCheck,
  PlusCircle,
  Eye,
  UserCheck,
  ShieldAlert,
  ArrowUpDown
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    tickets,
    currentUser,
    setSelectedTicketId,
    setIsSubmitTicketModalOpen,
    approveAllPendingTickets,
    searchQuery: globalSearch
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'my' | 'dept' | 'pending'>('all');
  const [localSearch, setLocalSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'created_at' | 'priority' | 'due_date'>('created_at');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Metric computations
  const metrics = useMemo(() => {
    const total = tickets.length;
    const newCount = tickets.filter((t) => t.status === 'New' || t.status === 'Pending Approval').length;
    const inProgress = tickets.filter((t) => t.status === 'In Progress' || t.status === 'Assigned').length;
    const resolved = tickets.filter((t) => t.status === 'Resolved' || t.status === 'Closed').length;
    return { total, newCount, inProgress, resolved };
  }, [tickets]);

  // Tab Filtering & Query Matching
  const filteredTickets = useMemo(() => {
    let result = tickets.filter((t) => !t.is_archived);

    // Tab logic
    if (activeTab === 'my') {
      result = result.filter(
        (t) =>
          t.employee_name.toLowerCase() === currentUser?.username.toLowerCase() ||
          t.email.toLowerCase() === currentUser?.email.toLowerCase()
      );
    } else if (activeTab === 'dept') {
      result = result.filter(
        (t) =>
          t.department.toLowerCase() === currentUser?.department.toLowerCase() ||
          t.target_department.toLowerCase() === currentUser?.department.toLowerCase()
      );
    } else if (activeTab === 'pending') {
      result = result.filter((t) => t.status === 'Pending Approval' || t.approver_status === 'Pending');
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((t) => t.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      result = result.filter((t) => t.priority === priorityFilter);
    }

    // Search query
    const q = (localSearch || globalSearch).trim().toLowerCase();
    if (q) {
      result = result.filter(
        (t) =>
          t.ticket_number.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.employee_name.toLowerCase().includes(q) ||
          t.department.toLowerCase().includes(q) ||
          (t.assigned_it && t.assigned_it.toLowerCase().includes(q))
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortField === 'created_at') {
        const diff = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        return sortAsc ? -diff : diff;
      }
      if (sortField === 'priority') {
        const order: Record<TicketPriority, number> = { Urgent: 4, High: 3, Medium: 2, Low: 1 };
        const diff = order[b.priority] - order[a.priority];
        return sortAsc ? -diff : diff;
      }
      if (sortField === 'due_date') {
        const diff = new Date(b.due_date).getTime() - new Date(a.due_date).getTime();
        return sortAsc ? -diff : diff;
      }
      return 0;
    });

    return result;
  }, [tickets, activeTab, statusFilter, priorityFilter, localSearch, globalSearch, currentUser, sortField, sortAsc]);

  const canApprove =
    currentUser?.role === 'manager' ||
    currentUser?.role === 'management' ||
    currentUser?.role === 'admin' ||
    currentUser?.role === 'super admin';

  const pendingCount = tickets.filter(
    (t) => t.status === 'Pending Approval' || t.approver_status === 'Pending'
  ).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Workspace Overview
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Real-time ticketing operations, departmental routing & SLA enforcement.
          </p>
        </div>

        {/* Segmented Control */}
        <div className="inline-flex bg-white dark:bg-slate-800 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Tickets
          </button>
          <button
            onClick={() => setActiveTab('my')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'my'
                ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            My Tickets
          </button>
          <button
            onClick={() => setActiveTab('dept')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'dept'
                ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            My Department
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'pending'
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>Approvals</span>
            {pendingCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Bento Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-extrabold tracking-wider text-slate-400">Total Volume</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
              <Inbox className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {metrics.total}
          </div>
          <div className="text-[11px] font-semibold text-slate-400 mt-1">
            Across all CCI business units
          </div>
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-blue-500/5 rounded-full pointer-events-none group-hover:scale-125 transition-transform" />
        </div>

        {/* New / Pending */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-extrabold tracking-wider text-amber-500">New & Pending</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {metrics.newCount}
          </div>
          <div className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 mt-1">
            Awaiting review / triage
          </div>
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-amber-500/5 rounded-full pointer-events-none group-hover:scale-125 transition-transform" />
        </div>

        {/* In Progress */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-extrabold tracking-wider text-purple-500">In Progress</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {metrics.inProgress}
          </div>
          <div className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 mt-1">
            Assigned to IT engineers
          </div>
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-purple-500/5 rounded-full pointer-events-none group-hover:scale-125 transition-transform" />
        </div>

        {/* Resolved */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-extrabold tracking-wider text-emerald-500">Resolved</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {metrics.resolved}
          </div>
          <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
            Successfully closed within SLA
          </div>
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-500/5 rounded-full pointer-events-none group-hover:scale-125 transition-transform" />
        </div>
      </div>

      {/* Unified Data Table Card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-3xl shadow-sm overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 md:p-5 border-b border-slate-100 dark:border-slate-700/60 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 flex-1 flex-wrap">
            {/* Filter Search */}
            <div className="relative w-full md:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Filter table..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Status Select */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="New">New</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>

            {/* Priority Select */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {canApprove && pendingCount > 0 && (
              <button
                onClick={approveAllPendingTickets}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Approve All Pending ({pendingCount})</span>
              </button>
            )}

            <button
              onClick={() => setIsSubmitTicketModalOpen(true)}
              className="px-4 py-1.5 rounded-xl bg-[#002e5d] hover:bg-[#002042] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Submit Ticket</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-700/60 text-[10px] uppercase font-extrabold tracking-wider text-slate-400">
                <th className="py-3 px-5">Ticket #</th>
                <th className="py-3 px-4">Subject & Details</th>
                <th className="py-3 px-4">Requestor / Dept</th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-slate-600 dark:hover:text-slate-200"
                  onClick={() => {
                    setSortField('priority');
                    setSortAsc(!sortAsc);
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span>Priority</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Assigned IT</th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-slate-600 dark:hover:text-slate-200"
                  onClick={() => {
                    setSortField('due_date');
                    setSortAsc(!sortAsc);
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span>Due Date</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40 text-xs">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Inbox className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <div className="font-bold text-sm text-slate-600 dark:text-slate-300">
                      No matching tickets found
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Adjust your search filters or click "Submit Ticket" to file a new issue.
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTickets.map((t) => (
                  <tr
                    key={t.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition-colors group cursor-pointer"
                    onClick={() => setSelectedTicketId(t.id)}
                  >
                    {/* Ticket Number */}
                    <td className="py-3.5 px-5 font-mono font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600 dark:text-blue-400">{t.ticket_number}</span>
                      </div>
                    </td>

                    {/* Subject */}
                    <td className="py-3.5 px-4 max-w-xs md:max-w-md">
                      <div className="font-extrabold text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 transition-colors">
                        {t.subject}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        {t.description}
                      </div>
                    </td>

                    {/* Requestor */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800 dark:text-slate-200">{t.employee_name}</div>
                      <div className="text-[10px] text-slate-400">{t.department}</div>
                    </td>

                    {/* Priority Badge */}
                    <td className="py-3.5 px-4">
                      <PriorityBadge priority={t.priority} />
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <StatusBadge status={t.status} approverStatus={t.approver_status} />
                    </td>

                    {/* Assigned IT */}
                    <td className="py-3.5 px-4">
                      {t.assigned_it ? (
                        <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                          <UserCheck className="w-3.5 h-3.5 text-blue-500" />
                          <span>{t.assigned_it}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] italic text-slate-400">Unassigned</span>
                      )}
                    </td>

                    {/* Due Date */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-700 dark:text-slate-300">
                        {t.due_date ? t.due_date.substring(0, 10) : '—'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {t.due_date ? t.due_date.substring(11, 16) : ''}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedTicketId(t.id)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all inline-flex items-center gap-1"
                        title="View Ticket"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-500" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-900/20 text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>Showing {filteredTickets.length} of {tickets.length} total records</span>
          <span className="text-[11px] text-slate-400">Coolaire HelpDesk SLA Engine v2.4</span>
        </div>
      </div>
    </div>
  );
};

export const PriorityBadge: React.FC<{ priority: TicketPriority }> = ({ priority }) => {
  switch (priority) {
    case 'Urgent':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-extrabold text-[10px] uppercase tracking-wide border border-rose-200/50 dark:border-rose-900/50">
          <ShieldAlert className="w-3 h-3 text-rose-500" />
          Urgent
        </span>
      );
    case 'High':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-extrabold text-[10px] uppercase tracking-wide border border-amber-200/50 dark:border-amber-900/50">
          High
        </span>
      );
    case 'Medium':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-extrabold text-[10px] uppercase tracking-wide border border-blue-200/50 dark:border-blue-900/50">
          Medium
        </span>
      );
    case 'Low':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 font-extrabold text-[10px] uppercase tracking-wide">
          Low
        </span>
      );
  }
};

export const StatusBadge: React.FC<{ status: TicketStatus; approverStatus?: string }> = ({
  status,
  approverStatus
}) => {
  if (status === 'Pending Approval') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 font-bold text-[10px] border border-amber-200/60">
        <Clock className="w-3 h-3 text-amber-600" />
        Approval Req.
      </span>
    );
  }
  if (status === 'New') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950/70 text-sky-800 dark:text-sky-300 font-bold text-[10px] border border-sky-200/60">
        New Triage
      </span>
    );
  }
  if (status === 'In Progress' || status === 'Assigned') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 font-bold text-[10px] border border-purple-200/60">
        <Activity className="w-3 h-3 text-purple-600 animate-pulse" />
        {status}
      </span>
    );
  }
  if (status === 'Resolved') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] border border-emerald-200/60">
        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        Resolved
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10px]">
      Closed
    </span>
  );
};
