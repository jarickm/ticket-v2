import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { IerFormA, IerFormB } from '../../types';
import {
  PackageCheck,
  Search,
  Filter,
  Printer,
  FileSignature,
  Wrench,
  CheckCircle,
  Clock,
  ArrowRight
} from 'lucide-react';

export const IerCentralHubView: React.FC = () => {
  const {
    ierFormsA,
    ierFormsB,
    setSelectedPrintIer,
    setCurrentView
  } = useApp();

  const [formTypeFilter, setFormTypeFilter] = useState<'all' | 'A' | 'B'>('all');
  const [search, setSearch] = useState('');

  // Combine Forms into Unified Hub Row
  type HubItem = {
    id: number;
    type: 'A' | 'B';
    ref_no: string;
    title: string;
    actor: string;
    department: string;
    status: string;
    created_at: string;
    raw: IerFormA | IerFormB;
  };

  const allItems: HubItem[] = [
    ...ierFormsA.map((a): HubItem => ({
      id: a.id,
      type: 'A',
      ref_no: a.ier_no,
      title: `${a.asset_code} — ${a.item_description}`,
      actor: a.employee_name,
      department: a.department,
      status: a.workflow_status,
      created_at: a.created_at,
      raw: a
    })),
    ...ierFormsB.map((b): HubItem => ({
      id: b.id,
      type: 'B',
      ref_no: b.ier_no,
      title: `${b.equipment_type} (S/N: ${b.serial_number || 'N/A'})`,
      actor: b.requestor_name,
      department: b.department,
      status: b.status,
      created_at: b.created_at,
      raw: b
    }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const filteredItems = allItems.filter((item) => {
    if (formTypeFilter !== 'all' && item.type !== formTypeFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.ref_no.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.actor.toLowerCase().includes(q) ||
        item.department.toLowerCase().includes(q)
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
            IER Central Hub — All Inspection & Service Reports
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Unified archive and audit control for Form A and Form B technical evaluations.
          </p>
        </div>

        {/* Form Quick Links */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentView('ier_a')}
            className="px-3.5 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 text-teal-700 dark:text-teal-300 text-xs font-bold flex items-center gap-1.5 border border-teal-200/50 transition-all"
          >
            <FileSignature className="w-3.5 h-3.5" />
            <span>Open Form A</span>
          </button>
          <button
            onClick={() => setCurrentView('ier_b')}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center gap-1.5 border border-indigo-200/50 transition-all"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Open Form B</span>
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-3xl shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 md:p-5 border-b border-slate-100 dark:border-slate-700/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search across all reports..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>

            <select
              value={formTypeFilter}
              onChange={(e) => setFormTypeFilter(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Form Types (A & B)</option>
              <option value="A">Form A (Inspection / Loss)</option>
              <option value="B">Form B (Service & Parts)</option>
            </select>
          </div>

          <div className="text-xs font-bold text-slate-500">
            Total {filteredItems.length} records compiled
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-700/60 text-[10px] uppercase font-extrabold tracking-wider text-slate-400">
                <th className="py-3 px-5">Report Code</th>
                <th className="py-3 px-4">Classification</th>
                <th className="py-3 px-4">Subject / Equipment</th>
                <th className="py-3 px-4">Requestor / Dept</th>
                <th className="py-3 px-4">Workflow Status</th>
                <th className="py-3 px-4">Date Filed</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40 text-xs">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No matching IER records in central database.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={`${item.type}-${item.id}`} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-bold text-slate-900 dark:text-white">
                      {item.ref_no}
                    </td>
                    <td className="py-3.5 px-4">
                      {item.type === 'A' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-extrabold text-[10px] border border-teal-200/50">
                          <FileSignature className="w-3 h-3" /> Form A
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-extrabold text-[10px] border border-indigo-200/50">
                          <Wrench className="w-3 h-3" /> Form B
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-extrabold text-slate-900 dark:text-slate-100 truncate">{item.title}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800 dark:text-slate-200">{item.actor}</div>
                      <div className="text-[10px] text-slate-400">{item.department}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-medium">
                      {item.created_at.substring(0, 10)}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => setSelectedPrintIer({ type: item.type, data: item.raw })}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 dark:bg-slate-700 dark:text-slate-200 text-xs font-bold inline-flex items-center gap-1 transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5 text-blue-500" />
                        <span>Print Preview</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
