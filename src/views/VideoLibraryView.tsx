import React, { useState } from 'react';
import {
  FolderKanban,
  Search,
  Filter,
  ExternalLink,
  Video,
  Calendar,
  Clock,
  Tag,
  CheckCircle,
  FileText,
  Trash2,
  Edit2,
} from 'lucide-react';
import { VideoProject, HubDatabase } from '../types/hub';
import { api } from '../api/client';

interface VideoLibraryViewProps {
  database: HubDatabase;
  onRefresh: () => void;
  onOpenProject?: (project: VideoProject) => void;
}

export const VideoLibraryView: React.FC<VideoLibraryViewProps> = ({
  database,
  onRefresh,
  onOpenProject,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredProjects = database.projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id: string) => {
    if (confirm('Delete this project record from the library?')) {
      await api.deleteItem('projects', id);
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Video Library & Project Repository
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Searchable catalog of all active, scheduled, and published videos with associated scripts, trips, and metadata.
          </p>
        </div>
        <div className="text-xs text-slate-500 font-mono">
          Total Projects: <strong className="text-slate-900">{database.projects.length}</strong>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search projects by title, description, or tags..."
            className="w-full text-xs border border-slate-300 rounded-lg p-2.5 pl-9 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-700 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="idea">Idea</option>
            <option value="planned">Planned</option>
            <option value="ready_to_film">Ready to Film</option>
            <option value="editing">Editing</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-3">
        {filteredProjects.map((proj) => {
          const linkedTrip = database.trips.find((t) => t.id === proj.tripId);
          return (
            <div
              key={proj.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3 text-xs hover:border-slate-300 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-1">
                    <span className="font-semibold text-slate-900 uppercase">
                      {proj.status.replace(/_/g, ' ')}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Target: {proj.publishDate || 'TBD'}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">{proj.targetRuntimeMinutes}m</span>
                    {linkedTrip && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-blue-600 font-medium">Trip: {linkedTrip.destination}</span>
                      </>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {proj.title}
                  </h3>

                  <p className="text-slate-600 mt-1 leading-relaxed line-clamp-2">
                    {proj.description}
                  </p>

                  {/* Tags */}
                  {proj.tags && proj.tags.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {proj.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {proj.youtubeUrl ? (
                    <a
                      href={proj.youtubeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Watch Live</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">Unpublished</span>
                  )}

                  <button
                    onClick={() => handleDelete(proj.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredProjects.length === 0 && (
          <div className="py-12 text-center bg-white border border-slate-200 rounded-xl text-slate-500 text-xs">
            No projects match the search filter.
          </div>
        )}
      </div>
    </div>
  );
};
