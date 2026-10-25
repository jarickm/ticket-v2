import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TicketStatus, TicketPriority } from '../../types';
import { PriorityBadge, StatusBadge } from '../dashboard/DashboardView';
import {
  X,
  User,
  Building,
  Monitor,
  Mail,
  Calendar,
  CheckCircle,
  Clock,
  Send,
  MessageSquare,
  ShieldCheck,
  Archive,
  Wrench,
  Paperclip,
  CheckCheck,
  AlertCircle,
  Sparkles,
  Bot
} from 'lucide-react';

export const TicketDetailModal: React.FC = () => {
  const {
    selectedTicketId,
    setSelectedTicketId,
    tickets,
    currentUser,
    updateTicketStatus,
    assignTicket,
    addTicketComment,
    approveTicket,
    archiveTicket,
    users
  } = useApp();

  const [commentText, setCommentText] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [newStatus, setNewStatus] = useState<TicketStatus | ''>('');
  const [assignedTechnician, setAssignedTechnician] = useState('');
  const [isDraftingResolution, setIsDraftingResolution] = useState(false);

  if (!selectedTicketId) return null;

  const ticket = tickets.find((t) => t.id === selectedTicketId);
  if (!ticket) return null;

  const handleAiDraftResolution = async () => {
    setIsDraftingResolution(true);
    try {
      const { draftResolutionNotes } = await import('../../services/gemini');
      const drafted = await draftResolutionNotes(
        ticket.subject,
        ticket.description,
        resolutionNotes || 'Applied configuration update and verified stability'
      );
      setResolutionNotes(drafted);
    } catch (err) {
      console.warn('AI resolution draft error:', err);
    } finally {
      setIsDraftingResolution(false);
    }
  };

  const isStaffOrAdmin =
    currentUser?.role === 'admin' ||
    currentUser?.role === 'super admin' ||
    currentUser?.role === 'it support' ||
    currentUser?.role === 'management';

  const canApprove =
    currentUser?.role === 'manager' ||
    currentUser?.role === 'management' ||
    currentUser?.role === 'admin' ||
    currentUser?.role === 'super admin';

  const itStaff = users.filter((u) => u.department === 'IT' || u.role === 'it support' || u.role === 'admin');

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addTicketComment(ticket.id, commentText);
    setCommentText('');
  };

  const handleStatusUpdate = () => {
    if (!newStatus) return;
    updateTicketStatus(ticket.id, newStatus, resolutionNotes || undefined);
    setNewStatus('');
    setResolutionNotes('');
  };

  const handleAssign = () => {
    if (!assignedTechnician) return;
    assignTicket(ticket.id, assignedTechnician);
    setAssignedTechnician('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/40">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm md:text-base font-black text-blue-600 dark:text-blue-400">
              {ticket.ticket_number}
            </span>
            <PriorityBadge priority={ticket.priority} />
            <StatusBadge status={ticket.status} approverStatus={ticket.approver_status} />
          </div>

          <div className="flex items-center gap-2">
            {isStaffOrAdmin && !ticket.is_archived && (
              <button
                onClick={() => {
                  archiveTicket(ticket.id);
                  setSelectedTicketId(null);
                }}
                className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-600 dark:text-slate-300 hover:text-amber-600 text-xs font-bold transition-colors inline-flex items-center gap-1"
                title="Archive Ticket"
              >
                <Archive className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Archive</span>
              </button>
            )}

            <button
              onClick={() => setSelectedTicketId(null)}
              className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Title & Requestor Banner */}
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {ticket.subject}
            </h2>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
              <span>Submitted by <strong className="text-slate-800 dark:text-slate-200">{ticket.employee_name}</strong></span>
              <span>•</span>
              <span>Dept: <strong className="text-slate-800 dark:text-slate-200">{ticket.department}</strong></span>
              <span>•</span>
              <span>Created: {ticket.created_at}</span>
            </div>
          </div>

          {/* Bento Tiles Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/40">
              <span className="text-[10px] uppercase font-extrabold text-slate-400 block mb-1">
                Target Dept
              </span>
              <div className="font-extrabold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-blue-500" />
                <span>{ticket.target_department}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/40">
              <span className="text-[10px] uppercase font-extrabold text-slate-400 block mb-1">
                AnyDesk Remote ID
              </span>
              <div className="font-mono font-extrabold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Monitor className="w-3.5 h-3.5 text-purple-500" />
                <span>{ticket.anydesk_id || 'Not Provided'}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/40">
              <span className="text-[10px] uppercase font-extrabold text-slate-400 block mb-1">
                Assigned Tech
              </span>
              <div className="font-extrabold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5 truncate">
                <Wrench className="w-3.5 h-3.5 text-emerald-500" />
                <span>{ticket.assigned_it || 'Pending Assignment'}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/40">
              <span className="text-[10px] uppercase font-extrabold text-slate-400 block mb-1">
                SLA Due Date
              </span>
              <div className="font-extrabold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>{ticket.due_date ? ticket.due_date.substring(0, 16) : 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Problem Description Bento Box */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-700/50">
            <div className="text-[11px] uppercase font-extrabold tracking-wider text-slate-400 mb-2">
              Problem Description & System Context
            </div>
            <p className="text-xs md:text-sm text-slate-800 dark:text-slate-200 font-medium whitespace-pre-wrap leading-relaxed">
              {ticket.description}
            </p>

            {/* Attachments */}
            {(ticket.reference_form_name || ticket.screenshot_photo_name) && (
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/50 flex flex-wrap gap-2">
                {ticket.reference_form_name && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200/50 dark:border-blue-900/50">
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>{ticket.reference_form_name}</span>
                  </div>
                )}
                {ticket.screenshot_photo_name && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200/50 dark:border-emerald-900/50">
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>{ticket.screenshot_photo_name}</span>
                  </div>
                )}
              </div>
            )}

            {/* Resolution Notes (if available) */}
            {ticket.resolution_notes && (
              <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 rounded-xl">
                <div className="text-[11px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300 flex items-center gap-1 mb-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Resolution Record</span>
                </div>
                <p className="text-xs text-emerald-800 dark:text-emerald-200 font-medium">
                  {ticket.resolution_notes}
                </p>
                {ticket.resolved_at && (
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">
                    Closed on: {ticket.resolved_at}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pending Approval Callout (if applicable) */}
          {(ticket.status === 'Pending Approval' || ticket.approver_status === 'Pending') && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800/50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-amber-900 dark:text-amber-200">
                    Management Approval Pending
                  </div>
                  <div className="text-[11px] text-amber-700 dark:text-amber-300">
                    Designated Approver: {ticket.approver_name || 'Department Manager'}
                  </div>
                </div>
              </div>

              {canApprove && (
                <button
                  onClick={() => approveTicket(ticket.id)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authorize & Release to IT</span>
                </button>
              )}
            </div>
          )}

          {/* IT Staff Controls (Status & Technician Assignment) */}
          {isStaffOrAdmin && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-700/60 space-y-3">
              <div className="text-[11px] uppercase font-extrabold tracking-wider text-slate-500 dark:text-slate-400">
                Technician Dispatch & Workflow Controls
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Assign Technician */}
                <div className="flex items-center gap-2">
                  <select
                    value={assignedTechnician}
                    onChange={(e) => setAssignedTechnician(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="">Select Technician...</option>
                    {itStaff.map((u) => (
                      <option key={u.user_id} value={u.full_name}>
                        {u.full_name} ({u.role})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAssign}
                    disabled={!assignedTechnician}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold disabled:opacity-50 transition-all cursor-pointer"
                  >
                    Assign
                  </button>
                </div>

                {/* Change Status */}
                <div className="flex items-center gap-2">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as TicketStatus)}
                    className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="">Change Status...</option>
                    <option value="New">New</option>
                    <option value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Pending Approval">Pending Approval</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                  <button
                    onClick={handleStatusUpdate}
                    disabled={!newStatus}
                    className="px-3 py-1.5 rounded-xl bg-[#002e5d] hover:bg-[#002042] text-white text-xs font-bold disabled:opacity-50 transition-all cursor-pointer"
                  >
                    Update
                  </button>
                </div>
              </div>

              {/* Resolution Notes Box (if status is being changed to Resolved/Closed) */}
              {(newStatus === 'Resolved' || newStatus === 'Closed') && (
                <div className="pt-2 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase text-slate-500">
                      Resolution Findings / Work Done:
                    </label>
                    <button
                      type="button"
                      onClick={handleAiDraftResolution}
                      disabled={isDraftingResolution}
                      className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-700 dark:text-purple-300 text-[10px] font-bold flex items-center gap-1 border border-purple-200 dark:border-purple-800 transition-colors"
                    >
                      <Sparkles className="w-3 h-3 text-purple-500" />
                      <span>{isDraftingResolution ? 'Drafting...' : 'AI Auto-Draft Resolution'}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Document root cause, configuration fix, or replacement components used..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
                  />
                </div>
              )}
            </div>
          )}

          {/* Timeline & Discussion Thread */}
          <div>
            <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-500" />
              <span>Activity & Discussion Thread ({ticket.comments.length})</span>
            </div>

            <div className="space-y-3">
              {ticket.comments.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/30 text-center text-xs text-slate-400">
                  No comments logged yet. Start the conversation below.
                </div>
              ) : (
                ticket.comments.map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                          {c.sender}
                        </span>
                        {c.sender_role && (
                          <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {c.sender_role}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">{c.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {c.message}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Post Reply Box */}
            <form onSubmit={handlePostComment} className="mt-4 flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Post reply or operational update..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="px-4 py-2.5 rounded-xl bg-[#002e5d] hover:bg-[#002042] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-40 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Reply</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
