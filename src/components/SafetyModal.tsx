import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, Lock, EyeOff, CheckSquare, X } from 'lucide-react';

interface SafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SafetyModal: React.FC<SafetyModalProps> = ({ isOpen, onClose }) => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    s1: true,
    s2: true,
    s3: false,
    s4: false,
    s5: true,
    s6: false,
  });

  if (!isOpen) return null;

  const toggle = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const allPassed = Object.values(checkedItems).every(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Pre-Filming Confidentiality & Safety Protocol</h3>
              <p className="text-xs text-slate-500">Commercial site surveys & public premises filming compliance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-lg text-xs text-amber-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Professional Practice Reminder:</span> As a national health and safety professional, your channel documents real working life, but must never breach client non-disclosure agreements, reveal proprietary security codes, or film unauthorised plant areas.
            </div>
          </div>

          <div className="space-y-3">
            <label
              onClick={() => toggle('s1')}
              className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={checkedItems.s1}
                onChange={() => {}}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-900 block mb-0.5">1. Client Site Authorization Confirmed</span>
                <span className="text-slate-500">The building manager or responsible client contact has given explicit permission to carry and record on a smartphone/camera on-site.</span>
              </div>
            </label>

            <label
              onClick={() => toggle('s2')}
              className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={checkedItems.s2}
                onChange={() => {}}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-900 block mb-0.5">2. No Security Alarm Codes or Passwords Exposed</span>
                <span className="text-slate-500">Ensure no fire alarm panel master keys, door entry keypads, PIN numbers, or WiFi passwords appear in frame or reflection.</span>
              </div>
            </label>

            <label
              onClick={() => toggle('s3')}
              className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={checkedItems.s3}
                onChange={() => {}}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-900 block mb-0.5">3. Client Proprietary Schematics Covered</span>
                <span className="text-slate-500">No client company documents, architectural drawings, tenant names, or internal pricing visible on clipboards or laptop screens.</span>
              </div>
            </label>

            <label
              onClick={() => toggle('s4')}
              className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={checkedItems.s4}
                onChange={() => {}}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-900 block mb-0.5">4. Public & Staff Privacy Respected</span>
                <span className="text-slate-500">In leisure facilities, gyms, or hotel lobbies, do not film identifiable members of the public or minors without written model releases.</span>
              </div>
            </label>

            <label
              onClick={() => toggle('s5')}
              className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={checkedItems.s5}
                onChange={() => {}}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-900 block mb-0.5">5. Statutory Accuracy (UK Legislation)</span>
                <span className="text-slate-500">Distinguish formal UK legislation (e.g. Regulatory Reform Fire Safety Order 2005) from company opinions or advisory codes.</span>
              </div>
            </label>

            <label
              onClick={() => toggle('s6')}
              className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={checkedItems.s6}
                onChange={() => {}}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-900 block mb-0.5">6. Vlog Disclaimer in Video Description</span>
                <span className="text-slate-500">Include disclaimer: "Content shared is personal documentary commentary and does not constitute formal safety audit advice."</span>
              </div>
            </label>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <span className={allPassed ? 'text-emerald-700 font-semibold' : 'text-slate-500'}>
              {allPassed ? '✓ All protocols verified for filming' : 'Action items remaining'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
