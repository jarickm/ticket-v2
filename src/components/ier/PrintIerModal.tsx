import React from 'react';
import { useApp } from '../../context/AppContext';
import { IerFormA, IerFormB } from '../../types';
import { X, Printer, CheckCircle } from 'lucide-react';

export const PrintIerModal: React.FC = () => {
  const { selectedPrintIer, setSelectedPrintIer } = useApp();

  if (!selectedPrintIer) return null;

  const { type, data } = selectedPrintIer;
  const isA = type === 'A';
  const formA = isA ? (data as IerFormA) : null;
  const formB = !isA ? (data as IerFormB) : null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-3xl bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden my-6 border border-slate-300">
        {/* Print Controls Bar */}
        <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between print:hidden">
          <div className="text-xs font-bold text-slate-600">
            Official Document Print Preview ({type === 'A' ? 'Form A' : 'Form B'})
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-xl bg-[#002e5d] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-[#002042] transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Document</span>
            </button>
            <button
              onClick={() => setSelectedPrintIer(null)}
              className="p-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Official Sheet */}
        <div className="p-8 md:p-12 font-serif text-slate-900 bg-white">
          {/* Header */}
          <div className="text-center border-b-2 border-slate-900 pb-5 mb-6">
            <div className="text-xl font-black tracking-wider text-[#002e5d]">
              COOLAIRE CONSOLIDATED INC.
            </div>
            <div className="text-xs tracking-wide text-slate-600 font-sans mt-0.5">
              KM 14 West Service Road, Bicutan, Parañaque City, Metro Manila
            </div>
            <div className="text-[11px] font-bold text-slate-500 font-sans">
              MANAGEMENT INFORMATION SYSTEMS & IT DEPARTMENT
            </div>

            <div className="mt-4 pt-2 border-t border-slate-300">
              <h2 className="text-base font-black font-sans tracking-wide uppercase">
                {isA
                  ? 'INSPECTION & EVALUATION REPORT (FORM A — HARDWARE DEFECT)'
                  : 'INSPECTION & EVALUATION REPORT (FORM B — SERVICE & MAINTENANCE)'}
              </h2>
              <div className="font-mono text-xs font-bold mt-1 text-slate-700">
                Control No: {isA ? formA?.ier_no : formB?.ier_no}
              </div>
            </div>
          </div>

          {/* Form Content */}
          {isA && formA && (
            <div className="space-y-5 font-sans text-xs">
              <div className="grid grid-cols-2 gap-4 border border-slate-300 p-4 rounded-lg bg-slate-50/50">
                <div>
                  <span className="font-bold text-slate-500 block text-[10px] uppercase">Employee / Custodian:</span>
                  <div className="font-bold text-sm text-slate-900">{formA.employee_name}</div>
                </div>
                <div>
                  <span className="font-bold text-slate-500 block text-[10px] uppercase">Department & Position:</span>
                  <div className="font-semibold text-slate-800">{formA.department} — {formA.position_title}</div>
                </div>
                <div>
                  <span className="font-bold text-slate-500 block text-[10px] uppercase">Asset Tag Code:</span>
                  <div className="font-mono font-bold text-sm text-blue-800">{formA.asset_code}</div>
                </div>
                <div>
                  <span className="font-bold text-slate-500 block text-[10px] uppercase">Date Reported:</span>
                  <div className="font-semibold text-slate-800">{formA.date_reported}</div>
                </div>
              </div>

              <div className="border border-slate-300 p-4 rounded-lg">
                <span className="font-bold text-slate-500 block text-[10px] uppercase mb-1">Equipment Description:</span>
                <div className="font-semibold text-slate-900 text-sm">{formA.item_description}</div>
              </div>

              <div className="border border-slate-300 p-4 rounded-lg">
                <span className="font-bold text-slate-500 block text-[10px] uppercase mb-1">Inspection Findings & Issue Symptoms:</span>
                <div className="font-medium text-slate-800 whitespace-pre-wrap leading-relaxed">{formA.issue_details}</div>
              </div>

              {formA.remarks && (
                <div className="border border-slate-300 p-4 rounded-lg bg-emerald-50/40">
                  <span className="font-bold text-emerald-800 block text-[10px] uppercase mb-1">IT Final Recommendation & Resolution:</span>
                  <div className="font-medium text-emerald-950">{formA.remarks}</div>
                </div>
              )}

              {/* Signature Blocks */}
              <div className="grid grid-cols-3 gap-6 pt-10 mt-8 border-t border-slate-300 text-center">
                <div>
                  <div className="border-b border-slate-800 pb-1 font-bold text-xs">{formA.employee_name}</div>
                  <div className="text-[10px] text-slate-500 mt-1 uppercase font-bold">Reporting Employee</div>
                </div>
                <div>
                  <div className="border-b border-slate-800 pb-1 font-bold text-xs">
                    {formA.dept_head_name || 'Department Manager'}
                    {formA.dept_head_status === 'Approved' && (
                      <span className="text-[10px] text-emerald-600 font-bold ml-1">✓ SIGNED</span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 uppercase font-bold">Department Head Endorsement</div>
                </div>
                <div>
                  <div className="border-b border-slate-800 pb-1 font-bold text-xs">
                    {formA.it_staff_name || 'IT Technical Engineer'}
                    {formA.it_status === 'Approved' && (
                      <span className="text-[10px] text-emerald-600 font-bold ml-1">✓ VERIFIED</span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 uppercase font-bold">IT Department Clearance</div>
                </div>
              </div>
            </div>
          )}

          {!isA && formB && (
            <div className="space-y-5 font-sans text-xs">
              <div className="grid grid-cols-2 gap-4 border border-slate-300 p-4 rounded-lg bg-slate-50/50">
                <div>
                  <span className="font-bold text-slate-500 block text-[10px] uppercase">Service Requestor:</span>
                  <div className="font-bold text-sm text-slate-900">{formB.requestor_name}</div>
                </div>
                <div>
                  <span className="font-bold text-slate-500 block text-[10px] uppercase">Department:</span>
                  <div className="font-semibold text-slate-800">{formB.department}</div>
                </div>
                <div>
                  <span className="font-bold text-slate-500 block text-[10px] uppercase">Machine / Unit:</span>
                  <div className="font-semibold text-slate-900">{formB.equipment_type}</div>
                </div>
                <div>
                  <span className="font-bold text-slate-500 block text-[10px] uppercase">Serial Number:</span>
                  <div className="font-mono font-bold text-slate-800">{formB.serial_number || 'N/A'}</div>
                </div>
              </div>

              <div className="border border-slate-300 p-4 rounded-lg">
                <span className="font-bold text-slate-500 block text-[10px] uppercase mb-1">Service & Repair Scope:</span>
                <div className="font-medium text-slate-800 whitespace-pre-wrap leading-relaxed">{formB.service_description}</div>
              </div>

              <div className="grid grid-cols-2 gap-4 border border-slate-300 p-4 rounded-lg">
                <div>
                  <span className="font-bold text-slate-500 block text-[10px] uppercase mb-1">Parts & Materials Required:</span>
                  <div className="font-semibold text-slate-800">{formB.parts_needed || 'None specified'}</div>
                </div>
                <div>
                  <span className="font-bold text-slate-500 block text-[10px] uppercase mb-1">Quoted Cost Estimate:</span>
                  <div className="font-mono font-bold text-base text-slate-900">
                    {formB.cost_estimate ? `PHP ₱${formB.cost_estimate.toLocaleString()}` : 'No Cost Incurred'}
                  </div>
                </div>
              </div>

              {/* Signature Blocks */}
              <div className="grid grid-cols-3 gap-6 pt-10 mt-8 border-t border-slate-300 text-center">
                <div>
                  <div className="border-b border-slate-800 pb-1 font-bold text-xs">{formB.technician_name}</div>
                  <div className="text-[10px] text-slate-500 mt-1 uppercase font-bold">Inspecting Technician</div>
                </div>
                <div>
                  <div className="border-b border-slate-800 pb-1 font-bold text-xs">
                    {formB.manager_approval === 'Approved' ? 'ENDORSED' : 'PENDING'}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 uppercase font-bold">Branch / Dept Manager</div>
                </div>
                <div>
                  <div className="border-b border-slate-800 pb-1 font-bold text-xs">
                    {formB.management_approval === 'Approved' ? 'APPROVED' : 'PENDING'}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 uppercase font-bold">Corporate Management</div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Notice */}
          <div className="mt-12 pt-4 border-t border-dashed border-slate-300 text-center text-[10px] text-slate-400 font-sans">
            Coolaire Consolidated Inc. • Confidential Internal IT Audit Record • Generated via CCI Workspace
          </div>
        </div>
      </div>
    </div>
  );
};
