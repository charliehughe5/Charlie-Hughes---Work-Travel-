import React, { useState } from 'react';
import {
  KanbanSquare,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  MoreVertical,
  Trash2,
  Edit2,
  AlertCircle,
  FileText,
  Video,
} from 'lucide-react';
import { VideoProject, ProjectStatus, HubDatabase } from '../types/hub';
import { api } from '../api/client';

interface WeeklyPlannerViewProps {
  database: HubDatabase;
  onRefresh: () => void;
  onSelectProject?: (project: VideoProject) => void;
}

const STAGES: { id: ProjectStatus; label: string; color: string }[] = [
  { id: 'idea', label: 'Idea', color: 'bg-slate-100 text-slate-700' },
  { id: 'researching', label: 'Researching', color: 'bg-blue-50 text-blue-700' },
  { id: 'planned', label: 'Planned', color: 'bg-indigo-50 text-indigo-700' },
  { id: 'script_in_progress', label: 'Script In Progress', color: 'bg-purple-50 text-purple-700' },
  { id: 'ready_to_film', label: 'Ready to Film', color: 'bg-amber-50 text-amber-700' },
  { id: 'filmed', label: 'Filmed', color: 'bg-orange-50 text-orange-700' },
  { id: 'editing', label: 'Editing', color: 'bg-rose-50 text-rose-700' },
  { id: 'thumbnail_and_title', label: 'Thumb & Title', color: 'bg-pink-50 text-pink-700' },
  { id: 'ready_to_upload', label: 'Ready to Upload', color: 'bg-teal-50 text-teal-700' },
  { id: 'scheduled', label: 'Scheduled', color: 'bg-emerald-50 text-emerald-700' },
  { id: 'published', label: 'Published', color: 'bg-slate-900 text-white' },
];

export const WeeklyPlannerView: React.FC<WeeklyPlannerViewProps> = ({
  database,
  onRefresh,
  onSelectProject,
}) => {
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newRuntime, setNewRuntime] = useState(12);
  const [newPublishDate, setNewPublishDate] = useState('2026-10-18');
  const [newNotes, setNewNotes] = useState('');
  const [activeStageFilter, setActiveStageFilter] = useState<string>('all');

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newProj: VideoProject = {
      id: `proj-${Date.now()}`,
      title: newTitle.trim(),
      workingTitle: newTitle.trim(),
      status: 'planned',
      publishDate: newPublishDate,
      targetRuntimeMinutes: Number(newRuntime) || 12,
      description: newNotes || 'Weekly vlog project for Charlie Hughes channel.',
      tags: ['Work Travel', 'Charlie Hughes', 'UK Vlog'],
      category: 'Travel & Lifestyle',
      privacyStatus: 'private',
      editingNotes: '',
      shortClipsIdeas: [],
      chapters: [],
      editingChecklist: [
        { id: 'c1', text: 'Confirm filming permissions & safety checks', done: false },
        { id: 'c2', text: 'Assemble rough cut narrative', done: false },
        { id: 'c3', text: 'Master audio to -14 LUFS', done: false },
        { id: 'c4', text: 'Design 1280x720 thumbnail with high contrast', done: false },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await api.createItem('projects', newProj);
      setShowNewModal(false);
      setNewTitle('');
      setNewNotes('');
      onRefresh();
    } catch (err: any) {
      alert(`Error creating project: ${err.message}`);
    }
  };

  const handleMoveStage = async (project: VideoProject, newStatus: ProjectStatus) => {
    try {
      await api.updateItem('projects', project.id, { status: newStatus });
      onRefresh();
    } catch (err: any) {
      alert(`Error updating status: ${err.message}`);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (confirm('Are you sure you want to remove this project?')) {
      await api.deleteItem('projects', id);
      onRefresh();
    }
  };

  const filteredProjects =
    activeStageFilter === 'all'
      ? database.projects
      : database.projects.filter((p) => p.status === activeStageFilter);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Weekly Production Planner & Kanban
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Target cadence: 1 main Sunday release per week. Track workflow from concept to review.
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Video Workflow</span>
        </button>
      </div>

      {/* Stage Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-slate-100 text-xs">
        <button
          onClick={() => setActiveStageFilter('all')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap font-medium transition-colors ${
            activeStageFilter === 'all'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Stages ({database.projects.length})
        </button>
        {STAGES.map((s) => {
          const count = database.projects.filter((p) => p.status === s.id).length;
          return (
            <button
              key={s.id}
              onClick={() => setActiveStageFilter(s.id)}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap font-medium transition-colors ${
                activeStageFilter === s.id
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {s.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Kanban Board Columns View */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-x-auto pb-6">
        {STAGES.slice(0, 8).map((stage) => {
          const stageProjects = database.projects.filter((p) => p.status === stage.id);
          return (
            <div
              key={stage.id}
              className="bg-slate-100/70 rounded-xl p-3 border border-slate-200/80 flex flex-col min-h-[360px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-800">{stage.label}</span>
                <span className="text-[11px] font-mono text-slate-500 font-semibold bg-white px-2 py-0.5 rounded border border-slate-200">
                  {stageProjects.length}
                </span>
              </div>

              {/* Cards */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {stageProjects.map((proj) => {
                  const currentStageIdx = STAGES.findIndex((s) => s.id === proj.status);
                  const nextStage = STAGES[currentStageIdx + 1];

                  return (
                    <div
                      key={proj.id}
                      className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow space-y-2 text-xs"
                    >
                      <div className="font-semibold text-slate-900 leading-snug line-clamp-2">
                        {proj.title}
                      </div>

                      <div className="text-[11px] text-slate-500 flex items-center justify-between">
                        <span>Target: {proj.publishDate || 'TBD'}</span>
                        <span className="font-mono">{proj.targetRuntimeMinutes}m</span>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDeleteProject(proj.id)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {nextStage && (
                          <button
                            onClick={() => handleMoveStage(proj, nextStage.id)}
                            className="flex items-center gap-1 text-[11px] font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded transition-colors"
                          >
                            <span>Move to {nextStage.label}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {stageProjects.length === 0 && (
                  <div className="h-24 flex items-center justify-center text-[11px] text-slate-400 border border-dashed border-slate-200 rounded-lg">
                    No items in {stage.label}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Project Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in duration-150">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Start New Video Production Workflow
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Create a new weekly vlog episode for Charlie Hughes channel.
            </p>

            <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Video Working Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Manchester Leisure Centre Fire Risk Survey & Road Trip"
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-red-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Target Runtime (Minutes)
                  </label>
                  <input
                    type="number"
                    value={newRuntime}
                    onChange={(e) => setNewRuntime(Number(e.target.value))}
                    min={3}
                    max={60}
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Target Publish Date
                  </label>
                  <input
                    type="date"
                    value={newPublishDate}
                    onChange={(e) => setNewPublishDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Outline / Story Notes
                </label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  rows={3}
                  placeholder="What is the story? Road travel, site observations, fitness, hotel..."
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors font-semibold shadow-xs"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
