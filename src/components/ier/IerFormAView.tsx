import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { IerFormA } from '../../types';
import {
  FileSignature,
  CheckCircle,
  Clock,
  Printer,
  PlusCircle,
  Search,
  UserCheck,
  ShieldCheck,
  Layers,
  Edit,
  AlertCircle
} from 'lucide-react';

export const IerFormAView: React.FC = () => {
  const {
    ierFormsA,
    createIerFormA,
    approveIerA,
    setSelectedPrintIer,
    currentUser,
    users,
    departments
  } = useApp();

  const [activeTab, setActiveTab] = useState<'records' | 'create'>('records');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');

  // Form states
  const [positionTitle, setPositionTitle] = useState(currentUser?.position || 'Staff');
  const [department, setDepartment] = useState(currentUser?.department || 'Operations');
  const [assetCode, setAssetCode] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [issueDetails, setIssueDetails] = useState('');
  const [deptHeadId, setDeptHeadId] = useState<number>(2);
  const [itPersonnelId, setItPersonnelId] = useState<number>(3);

  const approvers = users.filter((u) => ['manager', 'management', 'admin', 'super admin'].includes(u.role));
  const itStaff = users.filter((u) => u.department === 'IT' || u.role === 'it support' || u.role === 'admin');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetCode.trim() || !itemDescription.trim() || !issueDetails.trim()) return;

    const selectedDh = users.find((u) => u.user_id === Number(deptHeadId));
    const selectedIt = users.find((u) => u.user_id === Number(itPersonnelId));

    createIerFormA({
      employee_name: currentUser?.full_name || currentUser?.username || 'Employee',
      position_title: positionTitle,
      department,
      asset_code: assetCode.trim().toUpperCase(),
      item_description: itemDescription.trim(),
      issue_details: issueDetails.trim(),
      dept_head_id: Number(deptHeadId),
      dept_head_name: selectedDh?.full_name,
      it_personnel_id: Number(itPersonnelId),
      it_staff_name: selectedIt?.full_name,
      created_by: currentUser?.username || 'user',
      date_reported: new Date().toISOString().substring(0, 10)
    });

    setAssetCode('');
    setItemDescription('');
    setIssueDetails('');
    setActiveTab('records');
  };

  const filteredForms = ierFormsA.filter((f) => {
    if (filterStatus !== 'all' && f.workflow_status !== filterStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        f.ier_no.toLowerCase().includes(q) ||
        f.asset_code.toLowerCase().includes(q) ||
        f.item_description.toLowerCase().includes(q) ||
        f.employee_name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            IER Form A — Inspection & Evaluation Report
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Equipment defect, replacement evaluation, and multi-tier endorsement workflow.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="inline-flex bg-white dark:bg-slate-800 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
          <button
            onClick={() => setActiveTab('records')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'records'
                ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Form Records ({ierFormsA.length})
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'create'
                ? 'bg-[#002e5d] text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>File New IER Form A</span>
          </button>
        </div>
      </div>

      {/* Stepper Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 font-black text-xs flex items-center justify-center mb-2">
            1
          </div>
          <div className="text-xs font-extrabold text-slate-900 dark:text-white">
            Employee Incident Filing
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Report hardware malfunction, physical defect, or replacement necessity with asset tag.
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 font-black text-xs flex items-center justify-center mb-2">
            2
          </div>
          <div className="text-xs font-extrabold text-slate-900 dark:text-white">
            Supervisor Endorsement
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Department head verifies employee custody, operational necessity, and signs report.
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 font-black text-xs flex items-center justify-center mb-2">
            3
          </div>
          <div className="text-xs font-extrabold text-slate-900 dark:text-white">
            IT Physical Verification
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Technical engineer inspects unit, confirms diagnostics, logs closure remarks.
          </div>
        </div>
      </div>

      {activeTab === 'create' ? (
        /* Form Creation Card */
        <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-3xl p-6 shadow-sm">
          <div className="mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/60">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              File New Equipment Inspection Report (Form A)
            </h3>
            <p className="text-xs text-slate-500">
              Generated report will be routed for supervisor signature and IT hardware evaluation.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] uppercase font-extrabold text-slate-500 dark:text-slate-400 mb-1">
                  Employee Full Name
                </label>
                <input
                  type="text"
                  disabled
                  value={currentUser?.full_name || currentUser?.username}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-xs font-bold text-slate-600 dark:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase font-extrabold text-slate-500 dark:text-slate-400 mb-1">
                  Position / Role
                </label>
                <input
                  type="text"
                  required
                  value={positionTitle}
                  onChange={(e) => setPositionTitle(e.target.value)}
                  placeholder="e.g. Senior Billing Specialist"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase font-extrabold text-slate-500 dark:text-slate-400 mb-1">
                  Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] uppercase font-extrabold text-slate-500 dark:text-slate-400 mb-1">
                  Asset Tag / Equipment Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={assetCode}
                  onChange={(e) => setAssetCode(e.target.value)}
                  placeholder="e.g. CCI-NB-029 or CCI-PRN-014"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-mono font-bold text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase font-extrabold text-slate-500 dark:text-slate-400 mb-1">
                  Item Description & Model <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                  placeholder="e.g. Dell Latitude 5420 Laptop (Core i5 / 16GB)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase font-extrabold text-slate-500 dark:text-slate-400 mb-1">
                Detailed Issue Findings / Failure Symptoms <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={issueDetails}
                onChange={(e) => setIssueDetails(e.target.value)}
                placeholder="State how and when the defect occurred, symptoms, error messages..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] uppercase font-extrabold text-slate-500 dark:text-slate-400 mb-1">
                  Endorsing Department Head / Supervisor
                </label>
                <select
                  value={deptHeadId}
                  onChange={(e) => setDeptHeadId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200"
                >
                  {approvers.map((a) => (
                    <option key={a.user_id} value={a.user_id}>
                      {a.full_name} ({a.department} - {a.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] uppercase font-extrabold text-slate-500 dark:text-slate-400 mb-1">
                  Assigned IT Inspection Engineer
                </label>
                <select
                  value={itPersonnelId}
                  onChange={(e) => setItPersonnelId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200"
                >
                  {itStaff.map((u) => (
                    <option key={u.user_id} value={u.user_id}>
                      {u.full_name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-3">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#002e5d] hover:bg-[#002042] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Submit IER Form A</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('records')}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Form Records Table */
        <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-3xl shadow-sm overflow-hidden">
          {/* Table Header Filter */}
          <div className="p-4 md:p-5 border-b border-slate-100 dark:border-slate-700/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search IER #, Asset, Item..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                <option value="all">All Workflow States</option>
                <option value="Draft">Draft</option>
                <option value="Under Review">Under Review</option>
                <option value="Approved">Approved</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <button
              onClick={() => setActiveTab('create')}
              className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 text-xs font-bold flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create Record</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-700/60 text-[10px] uppercase font-extrabold tracking-wider text-slate-400">
                  <th className="py-3 px-5">IER Ref #</th>
                  <th className="py-3 px-4">Asset & Item</th>
                  <th className="py-3 px-4">Requestor</th>
                  <th className="py-3 px-4">Dept Head Sign</th>
                  <th className="py-3 px-4">IT Tech Sign</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40 text-xs">
                {filteredForms.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400">
                      No IER Form A submissions match current criteria.
                    </td>
                  </tr>
                ) : (
                  filteredForms.map((f) => {
                    const isManager = currentUser?.role === 'manager' || currentUser?.role === 'super admin';
                    const isItTech = currentUser?.role === 'it support' || currentUser?.role === 'admin' || currentUser?.role === 'super admin';

                    return (
                      <tr key={f.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="py-3.5 px-5 font-mono font-bold text-blue-600 dark:text-blue-400">
                          {f.ier_no}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-extrabold text-slate-900 dark:text-slate-100">{f.asset_code}</div>
                          <div className="text-[11px] text-slate-400 truncate max-w-xs">{f.item_description}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-800 dark:text-slate-200">{f.employee_name}</div>
                          <div className="text-[10px] text-slate-400">{f.department}</div>
                        </td>

                        {/* Dept Head Signature */}
                        <td className="py-3.5 px-4">
                          {f.dept_head_status === 'Approved' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Signed</span>
                            </span>
                          ) : isManager ? (
                            <button
                              onClick={() => approveIerA(f.id, 'manager')}
                              className="px-2 py-0.5 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-700 text-[10px] font-bold border border-amber-200 transition-colors"
                            >
                              Sign as Manager
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Pending</span>
                          )}
                        </td>

                        {/* IT Personnel Signature */}
                        <td className="py-3.5 px-4">
                          {f.it_status === 'Approved' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Verified</span>
                            </span>
                          ) : isItTech && f.dept_head_status === 'Approved' ? (
                            <button
                              onClick={() => approveIerA(f.id, 'it')}
                              className="px-2 py-0.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold border border-blue-200 transition-colors"
                            >
                              Verify as IT
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Awaiting</span>
                          )}
                        </td>

                        {/* Overall Status */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              f.workflow_status === 'Completed'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                                : f.workflow_status === 'Under Review'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {f.workflow_status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-5 text-right">
                          <button
                            onClick={() => setSelectedPrintIer({ type: 'A', data: f })}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 text-xs font-bold inline-flex items-center gap-1 transition-colors"
                            title="Print Form"
                          >
                            <Printer className="w-3.5 h-3.5 text-blue-500" />
                            <span>Print Preview</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
