import React, { useState, useEffect } from 'react';
import { api, getClientToken, setClientToken } from './api/client';
import { HubDatabase, IntegrationDiagnostics } from './types/hub';
import { Layout, NavSection } from './components/Layout';
import { SafetyModal } from './components/SafetyModal';
import { AIAssistantDrawer } from './components/AIAssistantDrawer';

// Views
import { AuthLoginView } from './views/AuthLoginView';
import { DashboardView } from './views/DashboardView';
import { WeeklyPlannerView } from './views/WeeklyPlannerView';
import { IdeasView } from './views/IdeasView';
import { NewsResearchView } from './views/NewsResearchView';
import { TripToContentView } from './views/TripToContentView';
import { ScriptsView } from './views/ScriptsView';
import { VideoStudioView } from './views/VideoStudioView';
import { IntroOutroStudioView } from './views/IntroOutroStudioView';
import { ThumbnailsView } from './views/ThumbnailsView';
import { VideoLibraryView } from './views/VideoLibraryView';
import { YouTubeChannelView } from './views/YouTubeChannelView';
import { AnalyticsView } from './views/AnalyticsView';
import { GoogleAdsView } from './views/GoogleAdsView';
import { SponsorshipsView } from './views/SponsorshipsView';
import { CalendarView } from './views/CalendarView';
import { SettingsView } from './views/SettingsView';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(Boolean(getClientToken()));
  const [currentSection, setCurrentSection] = useState<NavSection>('dashboard');
  const [database, setDatabase] = useState<HubDatabase | null>(null);
  const [diagnostics, setDiagnostics] = useState<IntegrationDiagnostics | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals & Drawers
  const [safetyModalOpen, setSafetyModalOpen] = useState(false);
  const [assistantDrawerOpen, setAssistantDrawerOpen] = useState(false);

  useEffect(() => {
    loadAppData();
  }, []);

  const loadAppData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dbData, diag] = await Promise.all([
        api.getDatabase(),
        api.getStatus().catch(() => undefined),
      ]);
      setDatabase(dbData);
      setDiagnostics(diag);
    } catch (err: any) {
      console.error('Failed to load application data:', err);
      setError(err.message || 'Error connecting to Charlie Creator Hub backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {
      // ignore
    }
    setClientToken(null);
    setIsAuthenticated(false);
  };

  // If unauthenticated, show owner security login
  if (!isAuthenticated) {
    return (
      <AuthLoginView
        onSuccess={() => {
          setIsAuthenticated(true);
          loadAppData();
        }}
      />
    );
  }

  // Loading state
  if (loading || !database) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center font-sans text-xs text-slate-500">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-600 animate-pulse" />
          <span className="font-semibold text-slate-700">Loading Charlie Creator Hub...</span>
        </div>
      </div>
    );
  }

  return (
    <Layout
      currentSection={currentSection}
      onNavigate={setCurrentSection}
      channel={database.channel}
      onOpenSafetyModal={() => setSafetyModalOpen(true)}
      onOpenAssistant={() => setAssistantDrawerOpen(true)}
      onLogout={handleLogout}
    >
      {/* 1. Dashboard */}
      {currentSection === 'dashboard' && (
        <DashboardView
          database={database}
          diagnostics={diagnostics}
          onNavigate={setCurrentSection}
          onRefresh={loadAppData}
        />
      )}

      {/* 2. Weekly Planner */}
      {currentSection === 'weekly_planner' && (
        <WeeklyPlannerView
          database={database}
          onRefresh={loadAppData}
        />
      )}

      {/* 3. Ideas & Trends */}
      {currentSection === 'ideas' && (
        <IdeasView
          database={database}
          onRefresh={loadAppData}
        />
      )}

      {/* 4. News & Research */}
      {currentSection === 'research' && (
        <NewsResearchView
          database={database}
          onRefresh={loadAppData}
          onNavigateToScripts={() => setCurrentSection('scripts')}
        />
      )}

      {/* 5. Trip-to-Content */}
      {currentSection === 'trip_to_content' && (
        <TripToContentView
          database={database}
          onRefresh={loadAppData}
          onNavigateToScripts={() => setCurrentSection('scripts')}
        />
      )}

      {/* 6. Scripts & Storyboards */}
      {currentSection === 'scripts' && (
        <ScriptsView
          database={database}
          onRefresh={loadAppData}
        />
      )}

      {/* 7. Video Studio */}
      {currentSection === 'video_studio' && (
        <VideoStudioView
          database={database}
          onRefresh={loadAppData}
        />
      )}

      {/* 8. Intro & Outro Studio */}
      {currentSection === 'intro_outro' && (
        <IntroOutroStudioView
          database={database}
          onRefresh={loadAppData}
        />
      )}

      {/* 9. Thumbnails & Titles */}
      {currentSection === 'thumbnails' && (
        <ThumbnailsView
          database={database}
          onRefresh={loadAppData}
        />
      )}

      {/* 10. Video Library */}
      {currentSection === 'library' && (
        <VideoLibraryView
          database={database}
          onRefresh={loadAppData}
        />
      )}

      {/* 11. YouTube Channel */}
      {currentSection === 'youtube_channel' && (
        <YouTubeChannelView
          database={database}
          onRefresh={loadAppData}
        />
      )}

      {/* 12. Analytics */}
      {currentSection === 'analytics' && (
        <AnalyticsView
          database={database}
          onRefresh={loadAppData}
        />
      )}

      {/* 13. Google Ads */}
      {currentSection === 'google_ads' && (
        <GoogleAdsView
          database={database}
          onRefresh={loadAppData}
        />
      )}

      {/* 14. Sponsorships */}
      {currentSection === 'sponsorships' && (
        <SponsorshipsView
          database={database}
          onRefresh={loadAppData}
        />
      )}

      {/* 15. Calendar */}
      {currentSection === 'calendar' && (
        <CalendarView
          database={database}
          onRefresh={loadAppData}
        />
      )}

      {/* 16. Settings */}
      {currentSection === 'settings' && (
        <SettingsView
          channel={database.channel}
          diagnostics={diagnostics}
          database={database}
          onRefresh={loadAppData}
        />
      )}

      {/* Pre-Filming Safety Modal */}
      <SafetyModal
        isOpen={safetyModalOpen}
        onClose={() => setSafetyModalOpen(false)}
      />

      {/* Dedicated AI Copilot Slide-Over */}
      <AIAssistantDrawer
        isOpen={assistantDrawerOpen}
        onClose={() => setAssistantDrawerOpen(false)}
      />
    </Layout>
  );
}
