import React, { useState } from 'react';
import {
  Clapperboard,
  CheckSquare,
  Clock,
  Layers,
  Film,
  Plus,
  Trash2,
  FileDown,
  Sparkles,
  Scissors,
  BookmarkCheck,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { VideoProject, HubDatabase } from '../types/hub';
import { api } from '../api/client';

interface VideoStudioViewProps {
  database: HubDatabase;
  onRefresh: () => void;
}

export const VideoStudioView: React.FC<VideoStudioViewProps> = ({
  database,
  onRefresh,
}) => {
  const [selectedProject, setSelectedProject] = useState<VideoProject | null>(
    database.projects[0] || null
  );
  const [newChecklistText, setNewChecklistText] = useState('');
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [newChapterTime, setNewChapterTime] = useState('');

  const handleToggleChecklist = async (checkId: string) => {
    if (!selectedProject) return;

    const checklist = selectedProject.editingChecklist.map((c) =>
      c.id === checkId ? { ...c, done: !c.done } : c
    );

    const updated = { ...selectedProject, editingChecklist: checklist };
    setSelectedProject(updated);
    await api.updateItem('projects', selectedProject.id, { editingChecklist: checklist });
    onRefresh();
  };

  const handleAddChecklistItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim() || !selectedProject) return;

    const checklist = [
      ...(selectedProject.editingChecklist || []),
      {
        id: `c-${Date.now()}`,
        text: newChecklistText.trim(),
        done: false,
      },
    ];

    setSelectedProject({ ...selectedProject, editingChecklist: checklist });
    setNewChecklistText('');
    await api.updateItem('projects', selectedProject.id, { editingChecklist: checklist });
    onRefresh();
  };

  const handleAddChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChapterTitle.trim() || !selectedProject) return;

    const chapters = [
      ...(selectedProject.chapters || []),
      {
        title: newChapterTitle.trim(),
        timestamp: newChapterTime.trim() || '00:00',
      },
    ];

    setSelectedProject({ ...selectedProject, chapters });
    setNewChapterTitle('');
    setNewChapterTime('');
    await api.updateItem('projects', selectedProject.id, { chapters });
    onRefresh();
  };

  const handleExportBrief = () => {
    if (!selectedProject) return;

    const brief = `
==================================================
CHARLIE CREATOR HUB — EDITING & PRODUCTION BRIEF
Video: ${selectedProject.title}
Target Publish: ${selectedProject.publishDate || 'Sunday'} (18:00)
Target Length: ${selectedProject.targetRuntimeMinutes} minutes
==================================================

1. STORY & SUMMARY:
${selectedProject.description}

2. CHAPTER MARKERS (FOR YOUTUBE DESCRIPTION):
${selectedProject.chapters?.map((c) => `${c.timestamp} - ${c.title}`).join('\n') || 'None configured.'}

3. SHORT-FORM CLIP OPPORTUNITIES:
${selectedProject.shortClipsIdeas?.map((s, i) => `${i + 1}. ${s}`).join('\n') || 'None'}

4. EDITING CHECKLIST:
${selectedProject.editingChecklist?.map((c) => `[${c.done ? 'X' : ' '}] ${c.text}`).join('\n')}

5. COMPLIANCE & BLUR CHECKS:
- Confirm no proprietary client alarm codes or security passes visible
- Audio mastered to -14 LUFS
==================================================
    `.trim();

    const blob = new Blob([brief], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `editing-brief-${selectedProject.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Video Studio & Production Workspace
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Orchestrate editing checklists, chapter markers, B-roll notes, and short-form clip ideas.
          </p>
        </div>
        {selectedProject && (
          <button
            onClick={handleExportBrief}
            className="px-4 py-2 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors shrink-0"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Export Editing Brief (.txt)</span>
          </button>
        )}
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Project Selector */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Active Projects ({database.projects.length})
          </h3>

          <div className="space-y-2.5">
            {database.projects.map((proj) => {
              const isSelected = selectedProject?.id === proj.id;
              return (
                <div
                  key={proj.id}
                  onClick={() => setSelectedProject(proj)}
                  className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-white border-red-500 shadow-xs ring-1 ring-red-500'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold text-slate-900 mb-1">
                    <span className="truncate">{proj.title}</span>
                    <span className="text-[11px] font-mono text-slate-500">{proj.targetRuntimeMinutes}m</span>
                  </div>
                  <div className="text-slate-500 flex items-center gap-2 text-[11px]">
                    <span className="capitalize">{proj.status.replace(/_/g, ' ')}</span>
                    <span aria-hidden="true">·</span>
                    <span>Publish: {proj.publishDate || 'TBD'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Production Workbench */}
        <div className="lg:col-span-2 space-y-6">
          {selectedProject ? (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-6 text-xs">
              {/* Project Head */}
              <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-1">
                    <span className="font-semibold text-red-600 uppercase">
                      {selectedProject.status.replace(/_/g, ' ')}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Target: {selectedProject.publishDate || 'Sunday 18:00'}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">{selectedProject.targetRuntimeMinutes} minutes</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedProject.title}</h3>
                  <p className="text-slate-600 mt-1 leading-relaxed">{selectedProject.description}</p>
                </div>
              </div>

              {/* Editing Checklist */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                    <span>Editing & Post-Production Checklist</span>
                  </h4>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {selectedProject.editingChecklist?.filter((c) => c.done).length || 0} /{' '}
                    {selectedProject.editingChecklist?.length || 0} completed
                  </span>
                </div>

                <div className="space-y-2">
                  {selectedProject.editingChecklist?.map((chk) => (
                    <label
                      key={chk.id}
                      className="flex items-start gap-3 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={chk.done}
                        onChange={() => handleToggleChecklist(chk.id)}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                      />
                      <span className={`text-xs ${chk.done ? 'line-through text-slate-400' : 'text-slate-700 font-medium'}`}>
                        {chk.text}
                      </span>
                    </label>
                  ))}
                </div>

                {/* Add new check item */}
                <form onSubmit={handleAddChecklistItem} className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    value={newChecklistText}
                    onChange={(e) => setNewChecklistText(e.target.value)}
                    placeholder="Add custom task (e.g. Colour grade sunset shot, blur company logo)..."
                    className="flex-1 bg-white border border-slate-300 rounded-lg p-2 text-xs focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shrink-0"
                  >
                    Add Task
                  </button>
                </form>
              </div>

              {/* YouTube Chapters Markers */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>Chapter Markers (For YouTube Description)</span>
                  </h4>
                </div>

                <div className="space-y-2">
                  {selectedProject.chapters?.map((ch, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200/60"
                    >
                      <span className="font-medium text-slate-800">{ch.title}</span>
                      <span className="font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {ch.timestamp}
                      </span>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddChapter} className="grid grid-cols-3 gap-2 pt-1">
                  <input
                    type="text"
                    value={newChapterTitle}
                    onChange={(e) => setNewChapterTitle(e.target.value)}
                    placeholder="Chapter Title (e.g. M6 Coffee Stop)"
                    className="col-span-2 border border-slate-300 rounded-lg p-2 text-xs"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newChapterTime}
                      onChange={(e) => setNewChapterTime(e.target.value)}
                      placeholder="02:30"
                      className="w-20 font-mono border border-slate-300 rounded-lg p-2 text-xs text-center"
                    />
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
                    >
                      Add
                    </button>
                  </div>
                </form>
              </div>

              {/* Short-Form Clips Ideas (Shorts / Reels) */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                  <Scissors className="w-4 h-4 text-purple-600" />
                  <span>Planned Short-Form Clips (YouTube Shorts)</span>
                </h4>

                <div className="space-y-2">
                  {selectedProject.shortClipsIdeas?.map((clip, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-purple-50/50 border border-purple-200/60 rounded-lg text-slate-800 flex items-center justify-between"
                    >
                      <span>{clip}</span>
                      <span className="text-[10px] font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                        9:16 Short
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center bg-white border border-slate-200 rounded-xl text-slate-500 text-xs">
              Select a project to enter Video Studio.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
