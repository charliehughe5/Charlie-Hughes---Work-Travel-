import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  CheckCircle2,
  Clock,
  Car,
  Video,
  FileText,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { CalendarItem, HubDatabase } from '../types/hub';
import { api } from '../api/client';

interface CalendarViewProps {
  database: HubDatabase;
  onRefresh: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  database,
  onRefresh,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('2026-10-18');
  const [newType, setNewType] = useState<CalendarItem['type']>('publishing');

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const item: CalendarItem = {
      id: `cal-${Date.now()}`,
      title: newTitle.trim(),
      date: newDate,
      type: newType,
      completed: false,
    };

    try {
      await api.createItem('calendar', item);
      setShowAddModal(false);
      setNewTitle('');
      onRefresh();
    } catch (err: any) {
      alert(`Error creating calendar event: ${err.message}`);
    }
  };

  const handleToggleComplete = async (id: string, current: boolean) => {
    try {
      await api.updateItem('calendar', id, { completed: !current });
      onRefresh();
    } catch (err: any) {
      alert(`Update error: ${err.message}`);
    }
  };

  const calendarItems = database.calendar;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Content Calendar & Production Schedule
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Coordinate weekly filming around UK work trips, editing deadlines, and Sunday upload targets.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Schedule Milestone</span>
        </button>
      </div>

      {/* Schedule Items List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {calendarItems.map((item) => (
          <div
            key={item.id}
            className={`p-4 rounded-xl border text-xs transition-colors space-y-2 ${
              item.completed ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-slate-200 shadow-2xs'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => handleToggleComplete(item.id, item.completed)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                />
                <div>
                  <h4 className={`font-bold ${item.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                    <span className="font-mono">{item.date}</span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize font-semibold text-red-600">{item.type}</span>
                  </div>
                </div>
              </div>

              <span
                className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                  item.type === 'publishing'
                    ? 'bg-red-100 text-red-800'
                    : item.type === 'filming'
                    ? 'bg-blue-100 text-blue-800'
                    : item.type === 'travel'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {item.type}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 text-xs animate-in fade-in duration-150">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Add Schedule Event
            </h3>
            <p className="text-slate-500 mb-4">
              Schedule filming, editing, travel, or publishing milestones.
            </p>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Event Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Manchester Leisure Centre Filming Day 1"
                  className="w-full border border-slate-300 rounded-lg p-2.5"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newType}
                    onChange={(e: any) => setNewType(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-white"
                  >
                    <option value="filming">Filming</option>
                    <option value="editing">Editing</option>
                    <option value="publishing">Publishing Target</option>
                    <option value="travel">Work Travel</option>
                    <option value="sponsorship_deadline">Sponsorship Deadline</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold shadow-xs"
                >
                  Add Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
