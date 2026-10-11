import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Plus,
  Tv,
  Copy,
  Check,
  Clock,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ScriptRecord, HubDatabase } from '../types/hub';
import { api } from '../api/client';
import { TeleprompterModal } from '../components/TeleprompterModal';

interface ScriptsViewProps {
  database: HubDatabase;
  onRefresh: () => void;
}

export const ScriptsView: React.FC<ScriptsViewProps> = ({ database, onRefresh }) => {
  const [selectedScript, setSelectedScript] = useState<ScriptRecord | null>(
    database.scripts[0] || null
  );
  const [activeFormatTab, setActiveFormatTab] = useState<'prompts' | 'full' | 'both'>('both');
  const [generating, setGenerating] = useState(false);
  const [showPrompter, setShowPrompter] = useState(false);
  const [copied, setCopied] = useState(false);

  // New script generation inputs
  const [newTitle, setNewTitle] = useState('');
  const [runtimeOption, setRuntimeOption] = useState('10–12 minutes');
  const [contextNotes, setContextNotes] = useState('');
  const [includeSafety, setIncludeSafety] = useState(true);

  const handleGenerateScript = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setGenerating(true);
    try {
      const generated = await api.generateScript({
        title: newTitle.trim(),
        runtime: runtimeOption,
        contextNotes: contextNotes.trim(),
        targetTone: 'Conversational, authentic, direct British English with dry humor',
        includeSafetyNotes: includeSafety,
      });

      const newRecord: ScriptRecord = {
        id: `script-${Date.now()}`,
        title: newTitle.trim(),
        workingTitle: newTitle.trim(),
        targetRuntime: runtimeOption,
        bulletTalkingPrompts: generated.bulletTalkingPrompts || [],
        fullSpokenScript: generated.fullSpokenScript || '',
        openingHook: generated.openingHook || '',
        intro: generated.intro || '',
        sections: generated.sections || [],
        callToAction: generated.callToAction || '',
        closingReflection: generated.closingReflection || '',
        factualVerificationNotes: generated.factualVerificationNotes || [],
        complianceSafetyNotes: generated.complianceSafetyNotes || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await api.createItem('scripts', newRecord);
      setSelectedScript(newRecord);
      setNewTitle('');
      setContextNotes('');
      onRefresh();
    } catch (err: any) {
      alert(`Script generation error: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this script record?')) {
      await api.deleteItem('scripts', id);
      setSelectedScript(database.scripts.find((s) => s.id !== id) || null);
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Scripts & Storyboards
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dual-format scriptwriting: natural talking-point prompts for free speaking + full spoken scripts for rehearsal.
          </p>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Generator Form & Saved Scripts */}
        <div className="space-y-5">
          {/* Script Generator Card */}
          <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-red-600" />
              <span>Generate New Script</span>
            </h3>

            <form onSubmit={handleGenerateScript} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Video Topic or Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Inspecting a Hotel in North Wales: Real Life Checks"
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Target Runtime
                </label>
                <select
                  value={runtimeOption}
                  onChange={(e) => setRuntimeOption(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 bg-white text-slate-700"
                >
                  <option value="3–5 minutes">3–5 minutes (Short & focused)</option>
                  <option value="5–8 minutes">5–8 minutes (Brisk travel vlog)</option>
                  <option value="8–12 minutes">8–12 minutes (Standard YouTube)</option>
                  <option value="12–15 minutes">12–15 minutes (Deep-dive vlog)</option>
                  <option value="15–20 minutes">15–20 minutes (Full road trip story)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Story Beats & Road Context
                </label>
                <textarea
                  value={contextNotes}
                  onChange={(e) => setContextNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. 5am start, rainy motorway drive, hotel gym workout, door gap checks..."
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={includeSafety}
                  onChange={(e) => setIncludeSafety(e.target.checked)}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <span className="text-[11px] text-slate-600 font-medium">
                  Include Professional Safety & Confidentiality Guardrails
                </span>
              </label>

              <button
                type="submit"
                disabled={generating}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Drafting Script in British English...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-3.5 h-3.5" />
                    <span>Generate Dual-Format Script</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Saved Scripts List */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Saved Scripts ({database.scripts.length})
            </h4>

            <div className="space-y-2">
              {database.scripts.map((script) => (
                <div
                  key={script.id}
                  onClick={() => setSelectedScript(script)}
                  className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedScript?.id === script.id
                      ? 'bg-white border-red-500 shadow-xs ring-1 ring-red-500'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold text-slate-900 mb-1">
                    <span className="truncate">{script.title}</span>
                    <span className="text-[11px] font-mono text-slate-500 shrink-0 ml-2">
                      {script.targetRuntime}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {script.sections?.length || 0} narrative sections · {script.bulletTalkingPrompts?.length || 0} bullet prompts
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Script Workspace & Teleprompter */}
        <div className="lg:col-span-2 space-y-4">
          {selectedScript ? (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-6 text-xs">
              {/* Header with Teleprompter Launch */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-1">
                    <span className="font-semibold text-slate-900">{selectedScript.targetRuntime}</span>
                    <span aria-hidden="true">·</span>
                    <span>Conversational British English</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {selectedScript.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setShowPrompter(true)}
                    className="px-3.5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
                  >
                    <Tv className="w-3.5 h-3.5" />
                    <span>Open Teleprompter Mode</span>
                  </button>

                  <button
                    onClick={() =>
                      handleCopy(
                        activeFormatTab === 'prompts'
                          ? selectedScript.bulletTalkingPrompts.join('\n• ')
                          : selectedScript.fullSpokenScript
                      )
                    }
                    className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                    title="Copy Text to Clipboard"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => handleDelete(selectedScript.id)}
                    className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete Script"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Format Switcher */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit">
                <button
                  onClick={() => setActiveFormatTab('prompts')}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    activeFormatTab === 'prompts' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Bullet Talking Prompts
                </button>
                <button
                  onClick={() => setActiveFormatTab('full')}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    activeFormatTab === 'full' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Full Spoken Script
                </button>
                <button
                  onClick={() => setActiveFormatTab('both')}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    activeFormatTab === 'both' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Dual View (Both)
                </button>
              </div>

              {/* Display Content */}
              {(activeFormatTab === 'prompts' || activeFormatTab === 'both') && (
                <div className="space-y-3 p-4 bg-slate-50/80 rounded-xl border border-slate-200/60">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>Bullet Talking Prompts (Natural Camera Delivery)</span>
                  </h4>
                  <ul className="space-y-2 text-slate-700 leading-relaxed">
                    {selectedScript.bulletTalkingPrompts?.map((prompt, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                        <span>{prompt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(activeFormatTab === 'full' || activeFormatTab === 'both') && (
                <div className="space-y-4">
                  {/* Hook & Intro */}
                  <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
                    <div>
                      <span className="font-bold text-slate-900 block mb-1">Opening Hook (First 15–20s):</span>
                      <p className="text-slate-700 leading-relaxed italic bg-slate-50 p-3 rounded-lg border border-slate-100">
                        "{selectedScript.openingHook}"
                      </p>
                    </div>

                    <div>
                      <span className="font-bold text-slate-900 block mb-1">Channel Intro:</span>
                      <p className="text-slate-700 leading-relaxed">
                        {selectedScript.intro}
                      </p>
                    </div>
                  </div>

                  {/* Narrative Sections */}
                  {selectedScript.sections?.map((sec, idx) => (
                    <div key={idx} className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                      <div className="font-bold text-slate-900 text-sm pb-1 border-b border-slate-100 flex items-center justify-between">
                        <span>{sec.title}</span>
                        {sec.bRollNotes && (
                          <span className="text-[11px] font-normal text-slate-500 italic">
                            B-roll: {sec.bRollNotes}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-700 leading-relaxed">
                        {sec.spokenText}
                      </p>
                    </div>
                  ))}

                  {/* Call to action & Outro */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 space-y-2">
                    <div>
                      <span className="font-bold text-slate-900 block mb-1">Call to Action:</span>
                      <p className="text-slate-700">{selectedScript.callToAction}</p>
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block mb-1">Closing Reflection:</span>
                      <p className="text-slate-700 italic">"{selectedScript.closingReflection}"</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Factual Verification & Compliance Panel */}
              {(selectedScript.factualVerificationNotes?.length > 0 ||
                selectedScript.complianceSafetyNotes?.length > 0) && (
                <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-3 text-amber-950">
                  <div className="font-bold text-xs flex items-center gap-1.5 text-amber-900">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>Statutory Verification & Professional Compliance Guardrails</span>
                  </div>

                  {selectedScript.factualVerificationNotes?.length > 0 && (
                    <div>
                      <span className="font-semibold block mb-1">Citations & Regulations Cited:</span>
                      <ul className="list-disc pl-5 space-y-0.5 text-[11px] text-amber-900">
                        {selectedScript.factualVerificationNotes.map((note, idx) => (
                          <li key={idx}>{note}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedScript.complianceSafetyNotes?.length > 0 && (
                    <div>
                      <span className="font-semibold block mb-1">Filming & Confidentiality Restrictions:</span>
                      <ul className="list-disc pl-5 space-y-0.5 text-[11px] text-amber-900">
                        {selectedScript.complianceSafetyNotes.map((note, idx) => (
                          <li key={idx}>{note}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="py-16 text-center bg-white border border-slate-200 rounded-xl text-slate-500 text-xs">
              Select or generate a script to view the dual-format workspace.
            </div>
          )}
        </div>
      </div>

      {/* Teleprompter Modal */}
      {selectedScript && (
        <TeleprompterModal
          isOpen={showPrompter}
          onClose={() => setShowPrompter(false)}
          title={selectedScript.title}
          content={
            activeFormatTab === 'prompts'
              ? selectedScript.bulletTalkingPrompts?.join('\n\n• ') || ''
              : selectedScript.fullSpokenScript ||
                selectedScript.sections?.map((s) => `${s.title}\n\n${s.spokenText}`).join('\n\n') ||
                ''
          }
        />
      )}
    </div>
  );
};
