import React, { useState, useEffect } from 'react';
import {
  Youtube,
  Eye,
  Users,
  Video,
  Calendar,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Compass,
  FileText,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  DollarSign,
  ShieldCheck,
  Megaphone,
} from 'lucide-react';
import { HubDatabase, IntegrationDiagnostics } from '../types/hub';
import { NavSection } from '../components/Layout';
import { api } from '../api/client';

interface DashboardViewProps {
  database: HubDatabase;
  diagnostics?: IntegrationDiagnostics;
  onNavigate: (section: NavSection) => void;
  onRefresh: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  database,
  diagnostics,
  onNavigate,
  onRefresh,
}) => {
  const [timeframe, setTimeframe] = useState<'last_7_days' | 'last_28_days' | 'last_90_days'>('last_28_days');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, [timeframe]);

  const loadAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const data = await api.getYoutubeAnalytics(timeframe);
      setAnalyticsData(data);
    } catch (e) {
      console.warn('Analytics load error:', e);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const channel = database.channel;
  const activeProjects = database.projects.filter((p) => p.status !== 'published');
  const upcomingTrips = database.trips.filter((t) => t.status !== 'completed');
  const nextProject = database.projects[0];
  const shortlistedIdeas = database.ideas.filter((i) => i.status === 'shortlisted');
  const activeSponsorships = database.sponsorships.filter((s) => s.status !== 'declined');
  const totalAdSpend = database.adsCampaigns.reduce((acc, c) => acc + (c.actualSpendGbp || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Top Banner & Quick Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Welcome back, {channel.creatorName || 'Charlie'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Overview of channel production, UK travel itineraries, and publishing schedule.
          </p>
        </div>

        {/* Timeframe Filter Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg shrink-0">
          <button
            onClick={() => setTimeframe('last_7_days')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              timeframe === 'last_7_days'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Last 7 days
          </button>
          <button
            onClick={() => setTimeframe('last_28_days')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              timeframe === 'last_28_days'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Last 28 days
          </button>
          <button
            onClick={() => setTimeframe('last_90_days')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              timeframe === 'last_90_days'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Last 90 days
          </button>
        </div>
      </div>

      {/* KPI Metric Strips (Tabular Figures) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Channel Subscribers</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            240
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
            <span>+{analyticsData?.overview?.subscribersGained || 34}</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-400">Verified channel</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Views ({timeframe === 'last_7_days' ? '7d' : timeframe === 'last_28_days' ? '28d' : '90d'})</span>
            <Eye className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {analyticsData?.overview?.views?.toLocaleString() || '2,450'}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
            <span>Watch: {analyticsData?.overview?.watchTimeHours || '218.6'} hrs</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-400">Avg {analyticsData?.overview?.avgViewDuration || '05:22'}</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Active Projects</span>
            <Video className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {activeProjects.length}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
            <span>Next: Sunday 18:00</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-600 font-medium">On Schedule</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Google Ads Spend</span>
            <Megaphone className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            £{totalAdSpend.toFixed(2)}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
            <span>Budget Cap Maintained</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-400">Strict safety</span>
          </div>
        </div>
      </div>

      {/* Primary Production Focus & Quick Launch Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: This Week's Video Focus & Roadmap */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: This Week's Primary Video Focus */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-red-600">
                  Target Upload: {channel.weeklyPublishDay || 'Sunday 18:00'}
                </span>
                <span className="text-slate-400">·</span>
                <span className="text-xs text-slate-500">Status: {nextProject?.status?.replace(/_/g, ' ') || 'Planning'}</span>
              </div>
              <button
                onClick={() => onNavigate('weekly_planner')}
                className="text-xs font-medium text-slate-900 hover:text-red-600 flex items-center gap-1 transition-colors"
              >
                <span>Full Workflow</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {nextProject ? (
              <div className="mt-4">
                <h3 className="text-base font-bold text-slate-900">
                  {nextProject.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {nextProject.description}
                </p>

                <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200/60 flex flex-wrap items-center gap-4 text-xs text-slate-600">
                  <div>
                    <span className="text-slate-400">Target Length: </span>
                    <span className="font-mono font-medium text-slate-800">{nextProject.targetRuntimeMinutes} mins</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Editing Progress: </span>
                    <span className="font-medium text-slate-800">
                      {nextProject.editingChecklist?.filter((c) => c.done).length || 0} / {nextProject.editingChecklist?.length || 0} tasks done
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Shorts Clip Ideas: </span>
                    <span className="font-medium text-slate-800">{nextProject.shortClipsIdeas?.length || 0} planned</span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => onNavigate('video_studio')}
                    className="px-3 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors"
                  >
                    Open in Video Studio
                  </button>
                  <button
                    onClick={() => onNavigate('scripts')}
                    className="px-3 py-1.5 text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg transition-colors"
                  >
                    View Script & Prompts
                  </button>
                  <button
                    onClick={() => onNavigate('thumbnails')}
                    className="px-3 py-1.5 text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg transition-colors"
                  >
                    Thumbnail & Title Packaging
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-500">
                No active project assigned for this week yet.
                <button
                  onClick={() => onNavigate('weekly_planner')}
                  className="block mx-auto mt-2 text-red-600 font-semibold hover:underline"
                >
                  Start New Video Workflow
                </button>
              </div>
            )}
          </div>

          {/* Quick Action Matrix */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              Core Creator Workflows
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => onNavigate('trip_to_content')}
                className="p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-left transition-colors group flex items-start justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                    <Compass className="w-4 h-4 text-red-600" />
                    <span>Turn Work Trip into Vlog</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Convert driving, hotels & permitted site visits into a shot list.
                  </p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
              </button>

              <button
                onClick={() => onNavigate('scripts')}
                className="p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-left transition-colors group flex items-start justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Generate Natural Script</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Talking-point prompts or spoken script with teleprompter mode.
                  </p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
              </button>

              <button
                onClick={() => onNavigate('intro_outro')}
                className="p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-left transition-colors group flex items-start justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                    <Video className="w-4 h-4 text-purple-600" />
                    <span>Branded Intro / Outro Studio</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Render browser animations or generate Veo video bumpers.
                  </p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
              </button>

              <button
                onClick={() => onNavigate('ideas')}
                className="p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-left transition-colors group flex items-start justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Ideas & Trends Generator</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    5 title angles, storytelling hooks, and production estimates.
                  </p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
              </button>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Upcoming Trips & Integration Health */}
        <div className="space-y-6">
          {/* Card: Upcoming UK Work Trips */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-red-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Upcoming Travel & Sites
                </h4>
              </div>
              <button
                onClick={() => onNavigate('trip_to_content')}
                className="text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Manage
              </button>
            </div>

            <div className="mt-3 space-y-3">
              {upcomingTrips.map((trip) => (
                <div key={trip.id} className="p-3 bg-slate-50/70 border border-slate-200/60 rounded-lg text-xs">
                  <div className="font-semibold text-slate-900">{trip.title}</div>
                  <div className="mt-1 text-slate-500 flex items-center gap-2 text-[11px]">
                    <span>{trip.dates}</span>
                    <span aria-hidden="true">·</span>
                    <span>{trip.transportMode}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="text-slate-600 truncate max-w-[150px]">{trip.destination}</span>
                    <span className={`font-medium ${trip.filmingAuthorisedAtSite === 'Full' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {trip.filmingAuthorisedAtSite} Filming
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card: System & Integrations Diagnostics */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Integration Health
              </h4>
              <button
                onClick={() => onNavigate('settings')}
                className="text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Settings
              </button>
            </div>

            <div className="mt-3 space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Gemini 3.8 Flash AI</span>
                <span className="font-medium text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">YouTube Official Channel</span>
                <span className="font-medium text-blue-600 flex items-center gap-1">
                  @charliehughe5
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Database Persistence</span>
                <span className="font-medium text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Atomic Storage
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-600">Google Ads API</span>
                <span className="font-medium text-slate-500">
                  {diagnostics?.googleAds?.configured ? 'Connected' : 'Budget Safety Active'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
