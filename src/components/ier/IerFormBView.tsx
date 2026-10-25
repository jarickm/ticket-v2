import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { IerFormB } from '../../types';
import {
  Wrench,
  CheckCircle,
  Clock,
  Printer,
  PlusCircle,
  Search,
  DollarSign,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export const IerFormBView: React.FC = () => {
  const {
    ierFormsB,
    createIerFormB,
    approveIerB,
    setSelectedPrintIer,
    currentUser,
    departments
  } = useApp();

  const [activeTab, setActiveTab] = useState<'records' | 'create'>('records');
  const [search, setSearch] = useState('');

  // Form states
  const [requestorName, setRequestorName] = useState(currentUser?.full_name || currentUser?.username || 'Technician');
  const [department, setDepartment] = useState(currentUser?.department || 'Operations');
  const [equipmentType, setEquipmentType] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [partsNeeded, setPartsNeeded] = useState('');
  const [costEstimate, setCostEstimate] = useState<number>(0);
  const [technicianName, setTechnicianName] = useState(currentUser?.full_name || 'Assigned Tech');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipmentType.trim() || !serviceDescription.trim()) return;

    createIerFormB({
      requestor_name: requestorName,
      department,
      equipmentType: equipmentType.trim(),
      equipment_type: equipmentType.trim(),
      serial_number: serialNumber.trim(),
      service_description: serviceDescription.trim(),
      parts_needed: partsNeeded.trim() || undefined,
      cost_estimate: Number(costEstimate) || undefined,
      technician_name: technicianName.trim(),
      status: 'Pending Review'
    } as any);

    setEquipmentType('');
    setSerialNumber('');
    setServiceDescription('');
    setPartsNeeded('');
    setCostEstimate(0);
    setActiveTab('records');
  };

  const filteredForms = ierFormsB.filter((f) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        f.ier_no.toLowerCase().includes(q) ||
        f.equipment_type.toLowerCase().includes(q) ||
        f.serial_number.toLowerCase().includes(q) ||
        f.requestor_name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const isManager = currentUser?.role === 'manager' || currentUser?.role === 'super admin';
  const isManagement = currentUser?.role === 'management' || currentUser?.role === 'super admin' || currentUser?.role === 'admin';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            IER Form B — Technical Maintenance & Repair Service
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Heavy diagnostic evaluation, parts replacement quotation & authorization.
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
            Form B Records ({ierFormsB.length})
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
            <span>File IER Form B</span>
          </button>
        </div>
      </div>

      {activeTab === 'create' ? (
        <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-3xl p-6 shadow-sm">
          <div className="mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/60">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Create Technical Maintenance & Parts Clearance (Form B)
            </h3>
            <p className="text-xs text-slate-500">
              Submit repair proposal with parts requirement and CapEx/OpEx cost estimates.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] uppercase font-extrabold text-slate-500 dark:text-slate-400 mb-1">
                  Requestor Name
                </label>
                <input
                  type="text"
                  required
                  value={requestorName}
                  onChange={(e) => setRequestorName(e.target.value)}
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
                  Equipment / Machine Type <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={equipmentType}
                  onChange={(e) => setEquipmentType(e.target.value)}
                  placeholder="e.g. Diagnostic Chiller Console or Rugged Tablet"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase font-extrabold text-slate-500 dark:text-slate-400 mb-1">
                  Serial Number / Identification Tag
                </label>
                <input
                  type="text"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="e.g. SN-8891-CH-2024"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-mono font-bold text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase font-extrabold text-slate-500 dark:text-slate-400 mb-1">
                Technical Service Scope & Repair Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={serviceDescription}
                onChange={(e) => setServiceDescription(e.target.value)}
                placeholder="Detail the failure mechanics, diagnostic test results, and corrective actions required..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] uppercase font-extrabold text-slate-500 dark:text-slate-400 mb-1">
                  Replacement Parts Needed
                </label>
                <input
                  type="text"
                  value={partsNeeded}
                  onChange={(e) => setPartsNeeded(e.target.value)}
                  placeholder="e.g. Main Control PCB, High-Pressure Sensor"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase font-extrabold text-slate-500 dark:text-slate-400 mb-1">
                  Estimated Repair Cost (PHP ₱)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={costEstimate}
                  onChange={(e) => setCostEstimate(Number(e.target.value))}
                  placeholder="e.g. 15000"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-mono font-bold text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase font-extrabold text-slate-500 dark:text-slate-400 mb-1">
                Assigned Lead Technician
              </label>
              <input
                type="text"
                required
                value={technicianName}
                onChange={(e) => setTechnicianName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200"
              />
            </div>

            <div className="pt-4 flex items-center gap-3">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#002e5d] hover:bg-[#002042] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Submit Form B</span>
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
        <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-4 md:p-5 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-3">
            <div className="relative w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Form B, serial, equipment..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>

            <button
              onClick={() => setActiveTab('create')}
              className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 text-xs font-bold flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New Form B</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-700/60 text-[10px] uppercase font-extrabold tracking-wider text-slate-400">
                  <th className="py-3 px-5">Ref #</th>
                  <th className="py-3 px-4">Equipment & Serial</th>
                  <th className="py-3 px-4">Service Scope</th>
                  <th className="py-3 px-4">Parts & Estimate</th>
                  <th className="py-3 px-4">Manager Sign</th>
                  <th className="py-3 px-4">Management Sign</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40 text-xs">
                {filteredForms.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400">
                      No IER Form B records found.
                    </td>
                  </tr>
                ) : (
                  filteredForms.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="py-3.5 px-5 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {f.ier_no}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900 dark:text-slate-100">{f.equipment_type}</div>
                        <div className="text-[10px] font-mono text-slate-400">{f.serial_number || 'No S/N'}</div>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="text-slate-800 dark:text-slate-200 line-clamp-1">{f.service_description}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Tech: {f.technician_name}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {f.cost_estimate ? `₱${f.cost_estimate.toLocaleString()}` : '—'}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{f.parts_needed || 'None'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        {f.manager_approval === 'Approved' ? (
                          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Approved
                          </span>
                        ) : isManager ? (
                          <button
                            onClick={() => approveIerB(f.id, 'manager')}
                            className="px-2 py-0.5 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-700 text-[10px] font-bold border border-amber-200 transition-colors"
                          >
                            Approve
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Pending</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {f.management_approval === 'Approved' ? (
                          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Approved
                          </span>
                        ) : isManagement ? (
                          <button
                            onClick={() => approveIerB(f.id, 'management')}
                            className="px-2 py-0.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold border border-blue-200 transition-colors"
                          >
                            Endorse CapEx
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Pending</span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={() => setSelectedPrintIer({ type: 'B', data: f })}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 dark:bg-slate-700 dark:text-slate-200 text-xs font-bold inline-flex items-center gap-1 transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5 text-blue-500" />
                          <span>Print</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
