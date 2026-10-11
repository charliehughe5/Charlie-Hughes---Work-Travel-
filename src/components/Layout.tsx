import React, { useState } from 'react';
import {
  LayoutDashboard,
  KanbanSquare,
  Lightbulb,
  Newspaper,
  Compass,
  FileText,
  Clapperboard,
  Film,
  Image as ImageIcon,
  FolderKanban,
  Youtube,
  BarChart3,
  Megaphone,
  Briefcase,
  Calendar as CalendarIcon,
  Settings,
  ShieldAlert,
  Sparkles,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { ChannelSettings } from '../types/hub';

export type NavSection =
  | 'dashboard'
  | 'weekly_planner'
  | 'ideas'
  | 'research'
  | 'trip_to_content'
  | 'scripts'
  | 'video_studio'
  | 'intro_outro'
  | 'thumbnails'
  | 'library'
  | 'youtube_channel'
  | 'analytics'
  | 'google_ads'
  | 'sponsorships'
  | 'calendar'
  | 'settings';

interface LayoutProps {
  currentSection: NavSection;
  onNavigate: (section: NavSection) => void;
  channel: ChannelSettings;
  onOpenSafetyModal: () => void;
  onOpenAssistant: () => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  currentSection,
  onNavigate,
  channel,
  onOpenSafetyModal,
  onOpenAssistant,
  onLogout,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: NavSection; label: string; icon: React.ElementType; group?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'weekly_planner', label: 'Weekly Planner', icon: KanbanSquare },
    { id: 'ideas', label: 'Ideas & Trends', icon: Lightbulb },
    { id: 'research', label: 'News & Research', icon: Newspaper },
    { id: 'trip_to_content', label: 'Trip-to-Content', icon: Compass },
    { id: 'scripts', label: 'Scripts & Storyboards', icon: FileText },
    { id: 'video_studio', label: 'Video Studio', icon: Clapperboard },
    { id: 'intro_outro', label: 'Intro & Outro Studio', icon: Film },
    { id: 'thumbnails', label: 'Thumbnails & Titles', icon: ImageIcon },
    { id: 'library', label: 'Video Library', icon: FolderKanban },
    { id: 'youtube_channel', label: 'YouTube Channel', icon: Youtube },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'google_ads', label: 'Google Ads & Promotions', icon: Megaphone },
    { id: 'sponsorships', label: 'Sponsorships & Income', icon: Briefcase },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
    { id: 'settings', label: 'Settings & Integrations', icon: Settings },
  ];

  const currentNav = navItems.find((n) => n.id === currentSection) || navItems[0];

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col md:flex-row font-sans text-slate-900 selection:bg-red-500 selection:text-white">
      {/* Desktop Persistent Left Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 shrink-0 h-screen sticky top-0 overflow-y-auto">
        {/* Brand Lockup */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Youtube className="w-4 h-4 fill-white" />
            </div>
            <div className="truncate">
              <h1 className="text-sm font-bold tracking-tight text-slate-900 truncate">
                {channel.channelName || 'Charlie Hughes'}
              </h1>
              <p className="text-[11px] text-slate-500 font-medium truncate">
                {channel.tagline || 'Work. Travel. Real Life.'}
              </p>
            </div>
          </div>
        </div>

        {/* Channel Quick Info */}
        <div className="px-5 py-2.5 bg-slate-50/60 border-b border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
          <span className="font-mono text-slate-700">{channel.channelHandle || '@charliehughe5'}</span>
          <span className="text-slate-400">·</span>
          <span>{channel.currency || 'GBP (£)'}</span>
          <span className="text-slate-400">·</span>
          <span>UK Weekly</span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors text-left ${
                  active
                    ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-slate-500'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Utility Controls */}
        <div className="p-3 border-t border-slate-100 space-y-1 bg-slate-50/50">
          <button
            onClick={onOpenSafetyModal}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-lg transition-colors text-left"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate">Pre-Filming Safety</span>
          </button>

          <button
            onClick={onOpenAssistant}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors text-left"
          >
            <Sparkles className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span className="truncate">AI Channel Strategist</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors text-left"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            <span>Lock Workspace</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center">
            <Youtube className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 block leading-tight">{channel.channelName}</span>
            <span className="text-[10px] text-slate-500 block leading-tight">{currentNav.label}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAssistant}
            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200"
            title="AI Strategist"
          >
            <Sparkles className="w-4 h-4 text-red-600" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white pt-16 p-4 overflow-y-auto">
          <div className="space-y-1 mb-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = currentSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-medium rounded-lg text-left ${
                    active ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
          <div className="pt-4 border-t border-slate-200 space-y-2">
            <button
              onClick={() => {
                onOpenSafetyModal();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-amber-800 bg-amber-50 rounded-lg"
            >
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Pre-Filming Confidentiality Check</span>
            </button>
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <LogOut className="w-4 h-4" />
              <span>Lock Workspace</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar Contract */}
        <header className="hidden md:flex items-center justify-between gap-8 px-8 py-3.5 bg-white border-b border-slate-200 sticky top-0 z-20">
          {/* Zone 1: Contextual Breadcrumb */}
          <div className="flex items-center gap-2 text-xs whitespace-nowrap shrink-0">
            <span className="font-semibold text-slate-900">{channel.channelName}</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-600">{currentNav.label}</span>
          </div>

          {/* Zone 2: Navigation Info / Tagline */}
          <div className="flex items-center gap-3 text-xs text-slate-500 whitespace-nowrap">
            <span>Weekly Target: {channel.weeklyPublishDay || 'Sunday 18:00'}</span>
            <span aria-hidden="true">·</span>
            <span>Est. Run Costs: £0 / Budget Managed</span>
            <span aria-hidden="true">·</span>
            <a
              href={channel.channelUrl || 'https://www.youtube.com/@charliehughe5'}
              target="_blank"
              rel="noreferrer"
              className="text-red-600 hover:text-red-700 flex items-center gap-1 font-medium hover:underline"
            >
              <span>{channel.channelHandle || '@charliehughe5'}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Zone 3: Primary Action & Shortcuts */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenSafetyModal}
              className="px-3 py-1.5 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              <span>Filming Safety Protocol</span>
            </button>
            <button
              onClick={onOpenAssistant}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Strategist</span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-8 max-w-[1440px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
