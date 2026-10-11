import React, { useState } from 'react';
import {
  Compass,
  Plus,
  Car,
  Hotel,
  MapPin,
  Clock,
  ShieldCheck,
  CheckSquare,
  Sparkles,
  FileText,
  Video,
  ChevronRight,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  Camera,
} from 'lucide-react';
import { WorkTrip, TripFilmingScene, HubDatabase } from '../types/hub';
import { api } from '../api/client';

interface TripToContentViewProps {
  database: HubDatabase;
  onRefresh: () => void;
  onNavigateToScripts?: (title: string) => void;
}

export const TripToContentView: React.FC<TripToContentViewProps> = ({
  database,
  onRefresh,
  onNavigateToScripts,
}) => {
  const [selectedTrip, setSelectedTrip] = useState<WorkTrip | null>(database.trips[0] || null);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [showNewTripModal, setShowNewTripModal] = useState(false);

  // New trip form state
  const [dest, setDest] = useState('');
  const [tripTitle, setTripTitle] = useState('');
  const [duration, setDuration] = useState(3);
  const [datesStr, setDatesStr] = useState('14–16 October 2026');
  const [purpose, setPurpose] = useState('');
  const [transport, setTransport] = useState<'Driving' | 'Train' | 'Walking' | 'Flight'>('Driving');
  const [hotel, setHotel] = useState('');
  const [filmingAuth, setFilmingAuth] = useState<'Full' | 'Restricted' | 'Strictly Prohibited' | 'Pending Confirmation'>('Restricted');
  const [filmingNotes, setFilmingNotes] = useState('');

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dest || !tripTitle) return;

    const newTrip: WorkTrip = {
      id: `trip-${Date.now()}`,
      title: tripTitle,
      destination: dest,
      dates: datesStr,
      durationDays: Number(duration) || 1,
      purpose,
      transportMode: transport,
      hotelDetails: hotel || 'Local hotel',
      stopsAlongWay: ['Motorway Service Station break'],
      filmingAuthorisedAtSite: filmingAuth,
      permittedFilmingNotes: filmingNotes || 'Permitted in public concourses only.',
      observations: '',
      cameraGear: 'Phone on gimbal + wireless lav mic',
      status: 'planning',
      createdAt: new Date().toISOString(),
    };

    try {
      await api.createItem('trips', newTrip);
      setSelectedTrip(newTrip);
      setShowNewTripModal(false);
      onRefresh();
    } catch (err: any) {
      alert(`Error saving trip: ${err.message}`);
    }
  };

  const handleGeneratePlan = async () => {
    if (!selectedTrip) return;
    setGeneratingPlan(true);

    try {
      const plan = await api.generateTripFilmingPlan({
        destination: selectedTrip.destination,
        dates: selectedTrip.dates,
        durationDays: selectedTrip.durationDays,
        purpose: selectedTrip.purpose,
        transportMode: selectedTrip.transportMode,
        hotelDetails: selectedTrip.hotelDetails,
        stopsAlongWay: selectedTrip.stopsAlongWay,
        filmingAuthorisedAtSite: selectedTrip.filmingAuthorisedAtSite,
        permittedFilmingNotes: selectedTrip.permittedFilmingNotes,
      });

      const updated = {
        ...selectedTrip,
        filmingPlan: plan,
      };

      await api.updateItem('trips', selectedTrip.id, { filmingPlan: plan });
      setSelectedTrip(updated);
      onRefresh();
    } catch (err: any) {
      alert(`Failed to generate filming plan: ${err.message}`);
    } finally {
      setGeneratingPlan(false);
    }
  };

  const handleToggleSceneDone = async (sceneId: string) => {
    if (!selectedTrip?.filmingPlan) return;

    const scenes = selectedTrip.filmingPlan.scenes.map((s) =>
      s.id === sceneId ? { ...s, completed: !s.completed } : s
    );

    const updatedPlan = {
      ...selectedTrip.filmingPlan,
      scenes,
    };

    setSelectedTrip({ ...selectedTrip, filmingPlan: updatedPlan });
    await api.updateItem('trips', selectedTrip.id, { filmingPlan: updatedPlan });
    onRefresh();
  };

  const handleConvertToProject = async () => {
    if (!selectedTrip) return;

    const newProject = {
      id: `proj-${Date.now()}`,
      title: `${selectedTrip.destination} Road Trip & Working Vlog`,
      workingTitle: selectedTrip.title,
      status: 'planned' as const,
      publishDate: '2026-10-25',
      targetRuntimeMinutes: 14,
      description: `Follow me on this ${selectedTrip.durationDays}-day work trip to ${selectedTrip.destination}. Purpose: ${selectedTrip.purpose}`,
      tags: ['Charlie Hughes', selectedTrip.destination, 'Work Travel', 'Road Trip', 'Vlog'],
      category: 'Travel & Lifestyle',
      tripId: selectedTrip.id,
      privacyStatus: 'private' as const,
      editingNotes: `Shot list compiled from ${selectedTrip.filmingPlan?.scenes?.length || 0} planned scenes.`,
      shortClipsIdeas: [
        `What happens on a ${selectedTrip.destination} work trip`,
        `Staying fit while working away in ${selectedTrip.destination}`,
      ],
      chapters: [
        { title: 'The Early Morning Drive', timestamp: '00:00' },
        { title: `Arriving in ${selectedTrip.destination}`, timestamp: '03:15' },
        { title: 'Workday Walkthrough & Insights', timestamp: '06:00' },
        { title: 'Hotel Life & Reflections', timestamp: '09:40' },
      ],
      editingChecklist: [
        { id: 'c1', text: 'Check all background signage for privacy', done: false },
        { id: 'c2', text: 'Confirm site authorization paperwork', done: true },
        { id: 'c3', text: 'Assemble rough cut', done: false },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await api.createItem('projects', newProject);
      await api.updateItem('trips', selectedTrip.id, {
        status: 'converted_to_vlog',
        linkedProjectId: newProject.id,
      });
      alert(`Trip successfully converted to Video Project: "${newProject.title}"!`);
      onRefresh();
    } catch (err: any) {
      alert(`Error converting to project: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Trip-to-Content Workflow
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Convert real UK & Ireland work itineraries into realistic, privacy-compliant 11-step filming shot lists.
          </p>
        </div>
        <button
          onClick={() => setShowNewTripModal(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Travel Itinerary</span>
        </button>
      </div>

      {/* Main Split: Trip Selector Left / Filming Plan Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Stored Work Trips */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Upcoming & Active Travel
          </h3>

          <div className="space-y-2.5">
            {database.trips.map((trip) => {
              const isSelected = selectedTrip?.id === trip.id;
              return (
                <div
                  key={trip.id}
                  onClick={() => setSelectedTrip(trip)}
                  className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-white border-red-500 shadow-xs ring-1 ring-red-500'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-900 truncate">{trip.title}</span>
                    <span className="text-[11px] font-mono text-slate-500 shrink-0">{trip.durationDays}d</span>
                  </div>

                  <div className="text-slate-500 flex items-center gap-2 text-[11px] mb-2">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{trip.destination}</span>
                    <span aria-hidden="true">·</span>
                    <span>{trip.dates}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-600">{trip.transportMode}</span>
                    <span className={`font-semibold ${trip.filmingAuthorisedAtSite === 'Full' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {trip.filmingAuthorisedAtSite} Permission
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: 11-Step Filming Workflow & Mobile Checklist */}
        <div className="lg:col-span-2 space-y-5">
          {selectedTrip ? (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-5">
              {/* Trip Overview Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-1">
                    <span>{selectedTrip.destination}</span>
                    <span aria-hidden="true">·</span>
                    <span>{selectedTrip.dates}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-slate-900">{selectedTrip.transportMode}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {selectedTrip.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    <strong>Work Purpose:</strong> {selectedTrip.purpose}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleGeneratePlan}
                    disabled={generatingPlan}
                    className="px-3 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors disabled:opacity-50"
                  >
                    {generatingPlan ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating Plan...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{selectedTrip.filmingPlan ? 'Re-generate 11-Step Plan' : 'Generate Filming Plan'}</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleConvertToProject}
                    className="px-3 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Convert to Full Vlog</span>
                  </button>
                </div>
              </div>

              {/* Site Filming Authorization Callout */}
              <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-lg text-xs text-amber-900 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Authorisation Status: {selectedTrip.filmingAuthorisedAtSite}. </span>
                  <span>{selectedTrip.permittedFilmingNotes} Never film private client codes or plant rooms without confirmed sign-off.</span>
                </div>
              </div>

              {/* 11-Step Shot List */}
              {selectedTrip.filmingPlan ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      11-Step Practical Filming Plan (Mobile Ready)
                    </h4>
                    <span className="text-xs text-slate-500">
                      {selectedTrip.filmingPlan.scenes?.filter((s) => s.completed).length || 0} of {selectedTrip.filmingPlan.scenes?.length || 11} shots captured
                    </span>
                  </div>

                  <div className="space-y-3">
                    {selectedTrip.filmingPlan.scenes?.map((scene) => (
                      <div
                        key={scene.id}
                        className={`p-4 rounded-xl border text-xs transition-colors space-y-2 ${
                          scene.completed ? 'bg-slate-50/80 border-slate-200 opacity-70' : 'bg-white border-slate-200 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={scene.completed}
                              onChange={() => handleToggleSceneDone(scene.id)}
                              className="mt-1 h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900">
                                  {scene.stepNumber}. {scene.stageName}
                                </span>
                                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                                  ~{scene.clipDurationSeconds}s
                                </span>
                                {scene.essential && (
                                  <span className="text-[10px] font-semibold text-red-600">
                                    Essential
                                  </span>
                                )}
                              </div>
                              <p className="text-slate-600 mt-1">
                                <strong>What to Film:</strong> {scene.whatToFilm}
                              </p>
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                Angle: <strong>{scene.cameraAngle}</strong>
                              </div>
                            </div>
                          </div>
                        </div>

                        {scene.suggestedNarration && (
                          <div className="p-2.5 bg-slate-50 rounded-lg text-[11px] text-slate-700 italic border border-slate-100">
                            "{scene.suggestedNarration}"
                          </div>
                        )}

                        {scene.privacyWarning && (
                          <div className="text-[11px] text-amber-700 flex items-center gap-1 font-medium">
                            <AlertTriangle className="w-3 h-3 shrink-0" />
                            <span>{scene.privacyWarning}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center border border-dashed border-slate-200 rounded-xl space-y-3">
                  <Compass className="w-8 h-8 text-slate-300 mx-auto" />
                  <h4 className="text-sm font-semibold text-slate-800">
                    No Filming Plan Generated Yet
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Click "Generate Filming Plan" above to create the 11-step realistic filming checklist tailored to this travel itinerary.
                  </p>
                  <button
                    onClick={handleGeneratePlan}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                  >
                    Generate 11-Step Plan
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center bg-white border border-slate-200 rounded-xl text-slate-500 text-xs">
              Select or create a travel itinerary to begin.
            </div>
          )}
        </div>
      </div>

      {/* New Trip Modal */}
      {showNewTripModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6 text-xs animate-in fade-in duration-150">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Add New UK Work Travel Itinerary
            </h3>
            <p className="text-slate-500 mb-4">
              Enter your real journey details, destinations, and site authorization.
            </p>

            <form onSubmit={handleCreateTrip} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Trip Title
                </label>
                <input
                  type="text"
                  value={tripTitle}
                  onChange={(e) => setTripTitle(e.target.value)}
                  placeholder="e.g. Dublin & Wicklow Compliance Review"
                  className="w-full border border-slate-300 rounded-lg p-2.5"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Destination
                  </label>
                  <input
                    type="text"
                    value={dest}
                    onChange={(e) => setDest(e.target.value)}
                    placeholder="e.g. Manchester & Salford"
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Dates
                  </label>
                  <input
                    type="text"
                    value={datesStr}
                    onChange={(e) => setDatesStr(e.target.value)}
                    placeholder="e.g. 21–23 October 2026"
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    min={1}
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Transport Mode
                  </label>
                  <select
                    value={transport}
                    onChange={(e: any) => setTransport(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-white"
                  >
                    <option value="Driving">Driving (Car/Van)</option>
                    <option value="Train">Train</option>
                    <option value="Flight">Flight</option>
                    <option value="Walking">Walking</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Hotel / Accommodation
                </label>
                <input
                  type="text"
                  value={hotel}
                  onChange={(e) => setHotel(e.target.value)}
                  placeholder="e.g. Premier Inn Salford Quays"
                  className="w-full border border-slate-300 rounded-lg p-2.5"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Filming Authorization at Destination
                </label>
                <select
                  value={filmingAuth}
                  onChange={(e: any) => setFilmingAuth(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 bg-white"
                >
                  <option value="Restricted">Restricted (Public & corridor only)</option>
                  <option value="Full">Full (Client confirmed consent)</option>
                  <option value="Strictly Prohibited">Strictly Prohibited (Exterior only)</option>
                  <option value="Pending Confirmation">Pending Confirmation</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewTripModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold shadow-xs"
                >
                  Save Itinerary
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
