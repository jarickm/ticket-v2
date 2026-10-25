import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ITProject, ProjectStatus, TicketPriority } from '../../types';
import { PriorityBadge } from '../dashboard/DashboardView';
import {
  Kanban,
  PlusCircle,
  Calendar,
  UserCheck,
  Building,
  MessageSquare,
  MoreVertical,
  CheckCircle2,
  Trash2,
  Edit,
  Clock,
  X,
  Send
} from 'lucide-react';

export const ProjectBoardView: React.FC = () => {
  const {
    projects,
    projectUpdates,
    createProject,
    updateProject,
    deleteProject,
    addProjectUpdate,
    departments,
    currentUser,
    users
  } = useApp();

  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProjectForLogs, setSelectedProjectForLogs] = useState<ITProject | null>(null);
  const [newLogText, setNewLogText] = useState('');
  const [editingProject, setEditingProject] = useState<ITProject | null>(null);

  // New Project Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('Planning');
  const [priority, setPriority] = useState<TicketPriority>('Medium');
  const [startDate, setStartDate] = useState(new Date().toISOString().substring(0, 10));
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().substring(0, 10)
  );
  const [leadIt, setLeadIt] = useState('Jarick Montojo');
  const [coHeadIt, setCoHeadIt] = useState('');
  const [projectDept, setProjectDept] = useState('IT');
  const [progressPercent, setProgressPercent] = useState<number>(10);

  const itStaff = users.filter((u) => u.department === 'IT' || u.role === 'it support' || u.role === 'admin');

  const filteredProjects = projects.filter((p) => {
    if (selectedDept !== 'All' && p.department !== selectedDept) return false;
    return true;
  });

  const columns: { id: ProjectStatus; label: string; color: string }[] = [
    { id: 'Planning', label: 'Planning & Backlog', color: 'border-slate-300 dark:border-slate-700' },
    { id: 'To Do', label: 'To Do / Scheduled', color: 'border-blue-400 dark:border-blue-600' },
    { id: 'In Progress', label: 'In Progress', color: 'border-purple-400 dark:border-purple-600' },
    { id: 'In Review', label: 'In Review & Testing', color: 'border-amber-400 dark:border-amber-600' },
    { id: 'Completed', label: 'Delivered / Completed', color: 'border-emerald-400 dark:border-emerald-600' }
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createProject({
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      start_date: startDate,
      end_date: endDate,
      lead_it: leadIt,
      co_head_it: coHeadIt || undefined,
      department: projectDept,
      progress_percent: progressPercent
    });

    setIsAddModalOpen(false);
    setTitle('');
    setDescription('');
  };

  const handleStatusChange = (projId: number, nextStatus: ProjectStatus) => {
    updateProject(projId, { status: nextStatus });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    updateProject(editingProject.id, editingProject);
    setEditingProject(null);
  };

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectForLogs || !newLogText.trim()) return;
    addProjectUpdate(selectedProjectForLogs.id, newLogText);
    setNewLogText('');
  };

  const relevantUpdates = selectedProjectForLogs
    ? projectUpdates.filter((u) => u.project_id === selectedProjectForLogs.id)
    : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            IT Project Roadmap & Kanban Board
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Inter-departmental milestone tracking, systems engineering, and implementation logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Department switcher */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-transparent border-none text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="All">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-thin">
        {columns.map((col) => {
          const colProjects = filteredProjects.filter((p) => p.status === col.id);

          return (
            <div
              key={col.id}
              className={`w-72 sm:w-80 shrink-0 bg-white/70 dark:bg-slate-800/70 border ${col.color} rounded-3xl p-4 flex flex-col min-h-[550px] shadow-xs backdrop-blur-xs`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/70 dark:border-slate-700/50">
                <span className="font-extrabold text-xs text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <span>{col.label}</span>
                </span>
                <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-black flex items-center justify-center">
                  {colProjects.length}
                </span>
              </div>

              {/* Cards list */}
              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {colProjects.length === 0 ? (
                  <div className="h-28 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 text-xs italic">
                    No active tasks
                  </div>
                ) : (
                  colProjects.map((p) => (
                    <div
                      key={p.id}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 shadow-xs hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <PriorityBadge priority={p.priority} />
                        <span className="text-[10px] font-extrabold text-slate-400 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700/60">
                          {p.department}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-xs text-slate-900 dark:text-white leading-snug">
                        {p.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {p.description}
                      </p>

                      {/* Progress Bar */}
                      {p.progress_percent !== undefined && (
                        <div className="mt-3">
                          <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                            <span>Progress</span>
                            <span>{p.progress_percent}%</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-blue-600 h-1.5 rounded-full transition-all"
                              style={{ width: `${p.progress_percent}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Meta Footer */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                        <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                          <UserCheck className="w-3 h-3 text-blue-500" />
                          <span className="truncate max-w-[100px]">{p.lead_it}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedProjectForLogs(p)}
                            className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-blue-600 transition-colors"
                            title="Meeting Logs"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingProject(p)}
                            className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Quick Move Status Bar */}
                      <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/40 flex items-center justify-between">
                        <span className="text-[9px] font-bold uppercase text-slate-400">Move to:</span>
                        <select
                          value={p.status}
                          onChange={(e) => handleStatusChange(p.id, e.target.value as ProjectStatus)}
                          className="text-[10px] font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-1.5 py-0.5 text-slate-700 dark:text-slate-300"
                        >
                          <option value="Planning">Planning</option>
                          <option value="To Do">To Do</option>
                          <option value="In Progress">In Progress</option>
                          <option value="In Review">In Review</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Project Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Launch New IT Project
              </h3>
              <button onClick={() => setIsAddModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-[11px] uppercase font-bold text-slate-500 mb-1">
                  Project Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Disaster Recovery Hot-Site Sync"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase font-bold text-slate-500 mb-1">
                  Detailed Roadmap Scope & Deliverables
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Goals, target branches, infrastructure requirements..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase font-bold text-slate-500 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  >
                    <option value="Planning">Planning</option>
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="In Review">In Review</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-bold text-slate-500 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TicketPriority)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase font-bold text-slate-500 mb-1">Lead IT Engineer</label>
                  <input
                    type="text"
                    required
                    value={leadIt}
                    onChange={(e) => setLeadIt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-bold text-slate-500 mb-1">Department</label>
                  <select
                    value={projectDept}
                    onChange={(e) => setProjectDept(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase font-bold text-slate-500 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase font-bold text-slate-500 mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Project Meeting Logs Modal */}
      {selectedProjectForLogs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Meeting Logs & Progress Notes
                </h3>
                <div className="text-xs text-blue-600 font-bold">{selectedProjectForLogs.title}</div>
              </div>
              <button onClick={() => setSelectedProjectForLogs(null)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* List */}
            <div className="my-4 max-h-64 overflow-y-auto space-y-2 pr-1">
              {relevantUpdates.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  No meeting notes logged yet.
                </div>
              ) : (
                relevantUpdates.map((u) => (
                  <div key={u.id} className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1">
                      <span className="text-slate-800 dark:text-slate-200">{u.author}</span>
                      <span>{u.created_at}</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{u.update_text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Append */}
            <form onSubmit={handleAddLog} className="flex gap-2">
              <input
                type="text"
                required
                value={newLogText}
                onChange={(e) => setNewLogText(e.target.value)}
                placeholder="Log sprint update or milestone status..."
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#002e5d] text-white rounded-xl text-xs font-bold flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Edit Project Specifications
              </h3>
              <button onClick={() => setEditingProject(null)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-[11px] uppercase font-bold text-slate-500 mb-1">Title</label>
                <input
                  type="text"
                  value={editingProject.title}
                  onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase font-bold text-slate-500 mb-1">Progress %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editingProject.progress_percent || 0}
                  onChange={(e) => setEditingProject({ ...editingProject, progress_percent: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold"
                />
              </div>

              <div className="flex justify-between items-center pt-3">
                <button
                  type="button"
                  onClick={() => {
                    deleteProject(editingProject.id);
                    setEditingProject(null);
                  }}
                  className="px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Project</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingProject(null)}
                    className="px-4 py-2 text-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
