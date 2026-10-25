import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TicketType, TicketPriority } from '../../types';
import {
  X,
  FileSignature,
  Building,
  AlertCircle,
  Paperclip,
  CheckCircle,
  Monitor,
  Mail,
  UserCheck,
  Sparkles,
  Bot
} from 'lucide-react';

export const SubmitTicketModal: React.FC = () => {
  const {
    isSubmitTicketModalOpen,
    setIsSubmitTicketModalOpen,
    createTicket,
    departments,
    currentUser,
    users
  } = useApp();

  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [targetDepartment, setTargetDepartment] = useState('IT');
  const [ticketType, setTicketType] = useState<TicketType>('Incident');
  const [priority, setPriority] = useState<TicketPriority>('Medium');
  const [anydeskId, setAnydeskId] = useState('');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [assignedIt, setAssignedIt] = useState('');
  const [approverId, setApproverId] = useState<number | undefined>(undefined);
  const [referenceFormName, setReferenceFormName] = useState('');
  const [screenshotPhotoName, setScreenshotPhotoName] = useState('');

  // AI Triage State
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [aiDiagnosis, setAiDiagnosis] = useState<{
    rootCause: string;
    steps: string[];
  } | null>(null);

  if (!isSubmitTicketModalOpen) return null;

  const handleAiTriage = async () => {
    if (!subject.trim() && !description.trim()) return;
    setIsDiagnosing(true);
    try {
      const { analyzeAndDiagnoseTicket } = await import('../../services/gemini');
      const result = await analyzeAndDiagnoseTicket(subject, description);
      setPriority(result.suggestedPriority);
      setTicketType(result.suggestedCategory);
      setAiDiagnosis({
        rootCause: result.rootCauseAnalysis,
        steps: result.recommendedSteps
      });
    } catch (err) {
      console.warn('AI Triage error:', err);
    } finally {
      setIsDiagnosing(false);
    }
  };

  // Potential approvers: managers, management, admins
  const approvers = users.filter((u) => ['manager', 'management', 'admin', 'super admin'].includes(u.role));
  // IT technicians
  const itPersonnel = users.filter((u) => u.department === 'IT' || u.role === 'it support' || u.role === 'admin');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    const needsApproval = ticketType === 'Request' || ticketType === 'Change';
    const status = needsApproval ? 'Pending Approval' : 'New';

    const selectedApprover = approvers.find((a) => a.user_id === Number(approverId));

    createTicket({
      subject: subject.trim(),
      description: description.trim(),
      employee_name: currentUser?.full_name || currentUser?.username || 'Employee',
      department: currentUser?.department || 'Operations',
      target_department: targetDepartment,
      assigned_it: assignedIt || undefined,
      anydesk_id: anydeskId.trim() || undefined,
      email: email.trim(),
      ticket_type: ticketType,
      priority,
      status,
      approver_id: approverId ? Number(approverId) : undefined,
      approver_name: selectedApprover?.full_name,
      approver_status: needsApproval ? 'Pending' : undefined,
      due_date: '',
      reference_form_name: referenceFormName || undefined,
      screenshot_photo_name: screenshotPhotoName || undefined
    });

    setIsSubmitTicketModalOpen(false);
    // Reset form
    setSubject('');
    setDescription('');
    setAnydeskId('');
    setReferenceFormName('');
    setScreenshotPhotoName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
              <FileSignature className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Submit HelpDesk Ticket
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Route technical issue, hardware request, or system change to Coolaire IT
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSubmitTicketModalOpen(false)}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {/* Target Dept & Ticket Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase font-extrabold text-slate-500 dark:text-slate-400 mb-1">
                Target Department
              </label>
              <select
                value={targetDepartment}
                onChange={(e) => setTargetDepartment(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] uppercase font-extrabold text-slate-500 dark:text-slate-400 mb-1">
                Ticket Classification
              </label>
              <select
                value={ticketType}
                onChange={(e) => setTicketType(e.target.value as TicketType)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="Incident">Incident (Service Interruption)</option>
                <option value="Request">Request (Equipment / Access)</option>
                <option value="Inquiry">Inquiry (General Question)</option>
                <option value="Change">Change (System Adjustment)</option>
                <option value="Problem">Problem (Root Cause)</option>
              </select>
            </div>
          </div>

          {/* Priority & Approver */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase font-extrabold text-slate-500 dark:text-slate-400 mb-1">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="Low">Low (General inquiries, non-blocking)</option>
                <option value="Medium">Medium (Standard operation impacts)</option>
                <option value="High">High (Substantial business slowdown)</option>
                <option value="Urgent">Urgent (Critical facility / server down)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] uppercase font-extrabold text-slate-500 dark:text-slate-400 mb-1">
                Authorizing Manager {ticketType === 'Request' && <span className="text-rose-500">*</span>}
              </label>
              <select
                value={approverId || ''}
                onChange={(e) => setApproverId(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="">Select Authorizer (Optional if standard)</option>
                {approvers.map((a) => (
                  <option key={a.user_id} value={a.user_id}>
                    {a.full_name} ({a.department} - {a.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* AnyDesk ID & Contact Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase font-extrabold text-slate-500 dark:text-slate-400 mb-1">
                AnyDesk Remote ID (If Remote Support Required)
              </label>
              <div className="relative">
                <Monitor className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={anydeskId}
                  onChange={(e) => setAnydeskId(e.target.value)}
                  placeholder="e.g. 941 228 103"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase font-extrabold text-slate-500 dark:text-slate-400 mb-1">
                Email Notification Recipient
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@coolaireconsolidated.com"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-[11px] uppercase font-extrabold text-slate-500 dark:text-slate-400 mb-1">
              Ticket Subject / Brief Summary <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. ERP Invoicing Module Error 10061 on Warehouse PC"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] uppercase font-extrabold text-slate-500 dark:text-slate-400">
                Detailed Description & Steps to Reproduce <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleAiTriage}
                disabled={isDiagnosing || (!subject && !description)}
                className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-xs disabled:opacity-40 transition-all cursor-pointer"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isDiagnosing ? 'animate-spin' : 'text-amber-300'}`} />
                <span>{isDiagnosing ? 'Analyzing Diagnostics...' : 'AI Auto-Triage & Recommend'}</span>
              </button>
            </div>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide exact error codes, what steps caused the problem, and which hardware or accounts are affected..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* AI Diagnosis Result */}
          {aiDiagnosis && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-800 text-xs space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300 font-extrabold text-[11px] uppercase">
                <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Coolaire AI Triage Findings</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 font-medium">
                <strong>Likely Cause:</strong> {aiDiagnosis.rootCause}
              </p>
              <div>
                <strong className="text-slate-800 dark:text-slate-200 block text-[11px] mb-1">
                  Recommended Immediate Steps:
                </strong>
                <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-600 dark:text-slate-400">
                  {aiDiagnosis.steps.map((st, i) => (
                    <li key={i}>{st}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Attachments Section */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60">
            <span className="text-[11px] uppercase font-extrabold text-slate-500 dark:text-slate-400 block mb-2">
              Attached Documents / Evidence
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                  <Paperclip className="w-3.5 h-3.5 text-blue-500" />
                  <span>Reference Form / PDF:</span>
                </label>
                <input
                  type="text"
                  value={referenceFormName}
                  onChange={(e) => setReferenceFormName(e.target.value)}
                  placeholder="e.g. IER_Purchase_Req_Signed.pdf"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-medium"
                />
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                  <Paperclip className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Screenshot / Photo Attachment:</span>
                </label>
                <input
                  type="text"
                  value={screenshotPhotoName}
                  onChange={(e) => setScreenshotPhotoName(e.target.value)}
                  placeholder="e.g. error_dialog_screenshot.png"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-medium"
                />
              </div>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsSubmitTicketModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#002e5d] hover:bg-[#002042] text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-blue-950/20 transition-all flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Confirm & Send Ticket</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
