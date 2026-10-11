import React, { useState, useEffect } from 'react';
import {
  Settings,
  ShieldCheck,
  Key,
  Database,
  FileDown,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Download,
  Youtube,
  Megaphone,
  Sparkles,
  ExternalLink,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Info,
} from 'lucide-react';
import { ChannelSettings, IntegrationDiagnostics, HubDatabase, IntegrationCredentials } from '../types/hub';
import { api } from '../api/client';

interface SettingsViewProps {
  channel: ChannelSettings;
  diagnostics?: IntegrationDiagnostics;
  database: HubDatabase;
  onRefresh: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  channel,
  diagnostics,
  database,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<'credentials_guide' | 'branding' | 'backup' | 'security'>('credentials_guide');

  // Channel Form State
  const [formData, setFormData] = useState<ChannelSettings>(channel);
  const [savingChannel, setSavingChannel] = useState(false);

  // Credentials State
  const [creds, setCreds] = useState<IntegrationCredentials>(database.credentials || {});
  const [savingCreds, setSavingCreds] = useState(false);
  const [credsSavedNotice, setCredsSavedNotice] = useState(false);

  // Security PIN state
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [pinMsg, setPinMsg] = useState<{ text: string; error: boolean } | null>(null);

  // Diagnostics state
  const [testStatus, setTestStatus] = useState<IntegrationDiagnostics | null>(diagnostics || null);
  const [testingIntegrations, setTestingIntegrations] = useState(false);

  // Expanded guide accordions
  const [expandedSection, setExpandedSection] = useState<'youtube_key' | 'oauth' | 'ads' | 'gemini'>('youtube_key');

  const [copiedText, setCopiedText] = useState<string | null>(null);

  useEffect(() => {
    if (database.credentials) {
      setCreds(database.credentials);
    }
  }, [database.credentials]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleSaveChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingChannel(true);
    try {
      await api.updateChannel(formData);
      alert('Channel profile & branding updated successfully.');
      onRefresh();
    } catch (err: any) {
      alert(`Error saving channel: ${err.message}`);
    } finally {
      setSavingChannel(false);
    }
  };

  const handleSaveCredentials = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingCreds(true);
    try {
      await api.updateCredentials(creds);
      setCredsSavedNotice(true);
      setTimeout(() => setCredsSavedNotice(false), 3000);
      onRefresh();
      // Re-run diagnostics
      const status = await api.getStatus();
      setTestStatus(status);
    } catch (err: any) {
      alert(`Error saving credentials: ${err.message}`);
    } finally {
      setSavingCreds(false);
    }
  };

  const handleTestIntegrations = async () => {
    setTestingIntegrations(true);
    try {
      const res = await api.getStatus();
      setTestStatus(res);
    } catch (e: any) {
      alert(`Diagnostics query failed: ${e.message}`);
    } finally {
      setTestingIntegrations(false);
    }
  };

  const handleUpdatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinMsg(null);
    try {
      const res = await api.updatePin(currentPin, newPin);
      if (res.success) {
        setPinMsg({ text: 'Owner access PIN changed successfully.', error: false });
        setCurrentPin('');
        setNewPin('');
      }
    } catch (err: any) {
      setPinMsg({ text: err.message || 'Failed to update PIN.', error: true });
    }
  };

  const handleExportBackup = () => {
    window.location.href = api.exportBackupUrl;
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        await api.importBackup(parsed);
        alert('Database restored from JSON backup successfully!');
        onRefresh();
      } catch (err: any) {
        alert(`Failed to import backup: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const redirectUri = typeof window !== 'undefined'
    ? `${window.location.origin}/api/auth/youtube/callback`
    : 'https://ais-dev-...run.app/api/auth/youtube/callback';

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Settings & Integrations Centre
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure channel defaults, manage setup credentials at your own pace, and view diagnostics.
          </p>
        </div>

        <button
          onClick={handleTestIntegrations}
          disabled={testingIntegrations}
          className="px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${testingIntegrations ? 'animate-spin' : ''}`} />
          <span>Run Live Diagnostics</span>
        </button>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto text-xs font-medium">
        <button
          onClick={() => setActiveTab('credentials_guide')}
          className={`px-3.5 py-2 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'credentials_guide'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Key className="w-3.5 h-3.5 text-red-600" />
          <span>API & Credentials Setup Guide</span>
        </button>

        <button
          onClick={() => setActiveTab('branding')}
          className={`px-3.5 py-2 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'branding'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Channel Branding & Defaults</span>
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`px-3.5 py-2 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'backup'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-blue-600" />
          <span>Data Backup & Restore</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-3.5 py-2 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'security'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Lock className="w-3.5 h-3.5 text-slate-700" />
          <span>Owner PIN & Security</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: API & CREDENTIALS SETUP GUIDE (ADD AT A LATER DATE)               */}
      {/* ========================================================================= */}
      {activeTab === 'credentials_guide' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Reassuring Welcome Callout */}
          <div className="p-5 bg-emerald-50 border border-emerald-200/80 rounded-xl space-y-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Good news: You don't need any of these to use Charlie Creator Hub today!</span>
            </div>
            <p className="text-emerald-800 leading-relaxed">
              Your application is <strong>100% functional right now</strong> without configuring any of these extra services. Your Gemini AI scriptwriting, UK work trip planners, 11-step filming shot lists, teleprompter, free in-browser intro video generator, thumbnail designer, and project database are all active and ready to use for £0.
            </p>
            <p className="text-emerald-700 text-[11px]">
              These credentials are only needed if you decide at a later date that you want the hub to automatically publish video files to YouTube for you, or automatically sync live Google Ads campaigns. You can add them here whenever you are ready!
            </p>
          </div>

          {/* Save Status Banner */}
          {credsSavedNotice && (
            <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Credentials saved to database successfully! Status updated.</span>
            </div>
          )}

          {/* Form wrapper */}
          <form onSubmit={handleSaveCredentials} className="space-y-4">
            {/* 1. YouTube Public API Key (Simplest Method) */}
            <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-4 text-xs">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedSection(expandedSection === 'youtube_key' ? ('' as any) : 'youtube_key')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                    <Youtube className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <span>1. YouTube Public API Key</span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-normal">
                        Simplest · 2 minutes
                      </span>
                    </h3>
                    <p className="text-slate-500 text-[11px]">
                      Allows the hub to fetch your public YouTube subscriber count and video views directly.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${creds.youtubeApiKey ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                    {creds.youtubeApiKey ? 'Configured' : 'Optional — Add Later'}
                  </span>
                  {expandedSection === 'youtube_key' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </div>

              {expandedSection === 'youtube_key' && (
                <div className="pt-3 border-t border-slate-100 space-y-3 animate-in fade-in">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-2 text-slate-700">
                    <span className="font-bold text-slate-900 block">How to get a free YouTube API key (step-by-step):</span>
                    <ol className="list-decimal pl-4 space-y-1.5 leading-relaxed text-[11px]">
                      <li>
                        Sign in to the <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" className="text-red-600 font-semibold underline inline-flex items-center gap-0.5">Google Cloud Console <ExternalLink className="w-2.5 h-2.5" /></a> using your standard Google account (it is free).
                      </li>
                      <li>Click the project drop-down at the top, and click <strong>"New Project"</strong> (you can name it "Charlie Creator Hub").</li>
                      <li>In the top search bar, type <strong>"YouTube Data API v3"</strong> and click <strong>Enable</strong>.</li>
                      <li>In the left sidebar, click <strong>APIs & Services $\rightarrow$ Credentials</strong>.</li>
                      <li>Click <strong>+ Create Credentials</strong> at the top, and choose <strong>API Key</strong>.</li>
                      <li>Copy the key that appears (it starts with <code className="bg-slate-200 px-1 rounded">AIzaSy...</code>) and paste it below!</li>
                    </ol>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Paste YouTube API Key:
                    </label>
                    <input
                      type="text"
                      value={creds.youtubeApiKey || ''}
                      onChange={(e) => setCreds({ ...creds, youtubeApiKey: e.target.value })}
                      placeholder="e.g. AIzaSyD..."
                      className="w-full border border-slate-300 rounded-lg p-2.5 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 2. Google OAuth 2.0 (For Direct YouTube Video Uploads) */}
            <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-4 text-xs">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedSection(expandedSection === 'oauth' ? ('' as any) : 'oauth')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <span>2. Google OAuth 2.0 (For Direct YouTube Uploads)</span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-normal">
                        Advanced · Only for Uploads
                      </span>
                    </h3>
                    <p className="text-slate-500 text-[11px]">
                      Enables the hub to upload finished video files directly into your YouTube Studio drafts.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${creds.googleClientId ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                    {creds.googleClientId ? 'Configured' : 'Optional — Add Later'}
                  </span>
                  {expandedSection === 'oauth' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </div>

              {expandedSection === 'oauth' && (
                <div className="pt-3 border-t border-slate-100 space-y-3 animate-in fade-in">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-2 text-slate-700 text-[11px]">
                    <span className="font-bold text-slate-900 block">What is this and how do I set it up?</span>
                    <p className="leading-relaxed">
                      Google OAuth allows an application you own to talk securely to your YouTube account without storing your account password.
                    </p>
                    <ol className="list-decimal pl-4 space-y-1.5 leading-relaxed">
                      <li>
                        In the same <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" className="text-blue-600 font-semibold underline inline-flex items-center gap-0.5">Google Cloud Console <ExternalLink className="w-2.5 h-2.5" /></a> project:
                      </li>
                      <li>Go to <strong>APIs & Services $\rightarrow$ OAuth consent screen</strong>.</li>
                      <li>Choose <strong>External</strong>, and fill in App name: "Charlie Creator Hub" and your email.</li>
                      <li>Under <strong>Credentials</strong>, click <strong>+ Create Credentials $\rightarrow$ OAuth Client ID</strong>.</li>
                      <li>Application type: choose <strong>Web application</strong>.</li>
                      <li>
                        Under <strong>Authorized redirect URIs</strong>, click Add URI and paste this exact address:
                        <div className="flex items-center gap-2 mt-1">
                          <code className="bg-slate-200 px-2 py-1 rounded font-mono text-[10px] select-all text-slate-800">
                            {redirectUri}
                          </code>
                          <button
                            type="button"
                            onClick={() => handleCopy(redirectUri, 'uri')}
                            className="p-1 text-slate-500 hover:text-slate-800 border bg-white rounded"
                            title="Copy URI"
                          >
                            {copiedText === 'uri' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </li>
                      <li>Google will give you a <strong>Client ID</strong> and <strong>Client Secret</strong>. Paste them below!</li>
                    </ol>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Google Client ID:
                      </label>
                      <input
                        type="text"
                        value={creds.googleClientId || ''}
                        onChange={(e) => setCreds({ ...creds, googleClientId: e.target.value })}
                        placeholder="...apps.googleusercontent.com"
                        className="w-full border border-slate-300 rounded-lg p-2.5 font-mono text-xs focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Google Client Secret:
                      </label>
                      <input
                        type="password"
                        value={creds.googleClientSecret || ''}
                        onChange={(e) => setCreds({ ...creds, googleClientSecret: e.target.value })}
                        placeholder="GOCSPX-..."
                        className="w-full border border-slate-300 rounded-lg p-2.5 font-mono text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Google Ads Customer ID & Token */}
            <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-4 text-xs">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedSection(expandedSection === 'ads' ? ('' as any) : 'ads')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Megaphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <span>3. Google Ads (For Video Promotions)</span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-normal">
                        Optional · Only if Promoting
                      </span>
                    </h3>
                    <p className="text-slate-500 text-[11px]">
                      Connects your Google Ads account to draft video view campaigns with safety spend limits.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${creds.googleAdsCustomerId ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                    {creds.googleAdsCustomerId ? 'Configured' : 'Optional — Add Later'}
                  </span>
                  {expandedSection === 'ads' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </div>

              {expandedSection === 'ads' && (
                <div className="pt-3 border-t border-slate-100 space-y-3 animate-in fade-in">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-2 text-slate-700 text-[11px]">
                    <span className="font-bold text-slate-900 block">How to find your Google Ads details:</span>
                    <ol className="list-decimal pl-4 space-y-1.5 leading-relaxed">
                      <li>
                        Go to <a href="https://ads.google.com" target="_blank" rel="noreferrer" className="text-amber-700 font-semibold underline inline-flex items-center gap-0.5">Google Ads <ExternalLink className="w-2.5 h-2.5" /></a> and log in.
                      </li>
                      <li>In the top right corner (next to your profile picture), you will see your <strong>10-digit Customer ID</strong> formatted like <code className="bg-slate-200 px-1 rounded">123-456-7890</code>.</li>
                      <li>Enter that 10-digit number below.</li>
                      <li>
                        <em>Developer Token (Optional):</em> If you manage advanced developer API access, you can find your Developer Token under <strong>Tools & Settings $\rightarrow$ API Center</strong>.
                      </li>
                    </ol>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Google Ads Customer ID:
                      </label>
                      <input
                        type="text"
                        value={creds.googleAdsCustomerId || ''}
                        onChange={(e) => setCreds({ ...creds, googleAdsCustomerId: e.target.value })}
                        placeholder="e.g. 123-456-7890"
                        className="w-full border border-slate-300 rounded-lg p-2.5 font-mono text-xs focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Developer Token (Optional):
                      </label>
                      <input
                        type="password"
                        value={creds.googleAdsDeveloperToken || ''}
                        onChange={(e) => setCreds({ ...creds, googleAdsDeveloperToken: e.target.value })}
                        placeholder="Developer token from API Center"
                        className="w-full border border-slate-300 rounded-lg p-2.5 font-mono text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Google Gemini AI & Veo (Already Active) */}
            <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <span>4. Google Gemini AI & Veo Models</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-semibold">
                        Already Active!
                      </span>
                    </h3>
                    <p className="text-slate-500 text-[11px]">
                      Powers script generation, brainstorming, trip planning, and video models.
                    </p>
                  </div>
                </div>

                <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="w-4 h-4" /> Ready to use
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 text-[11px] text-slate-600 leading-relaxed">
                Google AI Studio automatically injects your <strong>GEMINI_API_KEY</strong> securely on the server. You never need to copy, paste, or expose this key.
              </div>
            </div>

            {/* Save Button for Credentials */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={savingCreds}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5"
              >
                {savingCreds ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Credentials...</span>
                  </>
                ) : (
                  <>
                    <Key className="w-3.5 h-3.5" />
                    <span>Save My Credentials</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CHANNEL BRANDING & PROFILE                                        */}
      {/* ========================================================================= */}
      {activeTab === 'branding' && (
        <form onSubmit={handleSaveChannel} className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-4 text-xs animate-in fade-in duration-150">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Settings className="w-4 h-4 text-slate-700" />
            <span>Channel Brand Identity & Defaults</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Channel Name</label>
              <input
                type="text"
                value={formData.channelName}
                onChange={(e) => setFormData({ ...formData, channelName: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2.5 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Channel Handle</label>
              <input
                type="text"
                value={formData.channelHandle}
                onChange={(e) => setFormData({ ...formData, channelHandle: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2.5 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Channel URL</label>
              <input
                type="text"
                value={formData.channelUrl}
                onChange={(e) => setFormData({ ...formData, channelUrl: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2.5 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2.5 font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Publishing Target</label>
              <input
                type="text"
                value={formData.weeklyPublishDay}
                onChange={(e) => setFormData({ ...formData, weeklyPublishDay: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2.5 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Currency & Region</label>
              <input
                type="text"
                value={`${formData.currency} · ${formData.timezone}`}
                disabled
                className="w-full border border-slate-200 bg-slate-50 rounded-lg p-2.5 text-slate-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Preferred Script Style</label>
            <input
              type="text"
              value={formData.scriptStyle}
              onChange={(e) => setFormData({ ...formData, scriptStyle: e.target.value })}
              className="w-full border border-slate-300 rounded-lg p-2.5"
            />
          </div>

          <div className="pt-2 flex items-center justify-end">
            <button
              type="submit"
              disabled={savingChannel}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold shadow-xs transition-colors"
            >
              {savingChannel ? 'Saving...' : 'Save Branding Changes'}
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: DATA BACKUP & RESTORE                                             */}
      {/* ========================================================================= */}
      {activeTab === 'backup' && (
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-4 text-xs animate-in fade-in duration-150">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-600" />
            <span>Application Data Backup & Migration</span>
          </h3>
          <p className="text-slate-500">
            Export your complete Charlie Creator Hub database (all scripts, trips, projects, sponsorships, and ideas) as a portable JSON file.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={handleExportBackup}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Complete Database Backup (.json)</span>
            </button>

            <label className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Restore from Backup File</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: OWNER PIN & SECURITY                                              */}
      {/* ========================================================================= */}
      {activeTab === 'security' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-700" />
              <span>Private Workspace Security (Owner Access PIN)</span>
            </h3>
            <p className="text-slate-500">
              Update the creator access PIN required to unlock this dashboard session. (Default PIN: <strong>2026</strong>).
            </p>

            <form onSubmit={handleUpdatePin} className="space-y-3 max-w-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Current PIN</label>
                <input
                  type="password"
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Owner PIN (min 4 digits)</label>
                <input
                  type="password"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 font-mono"
                  required
                />
              </div>

              {pinMsg && (
                <div className={`p-2.5 rounded-lg text-xs font-semibold ${pinMsg.error ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}>
                  {pinMsg.text}
                </div>
              )}

              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold shadow-xs transition-colors"
              >
                Update Owner PIN
              </button>
            </form>
          </div>

          {/* Audit Trail */}
          <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 text-sm">
              Security & Operation Audit Trail ({database.auditLogs?.length || 0} entries)
            </h3>
            <div className="max-h-48 overflow-y-auto space-y-1.5 font-mono text-[11px] text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200/60">
              {database.auditLogs?.slice(0, 30).map((log) => (
                <div key={log.id} className="flex items-start gap-2">
                  <span className="text-slate-400 shrink-0">{log.timestamp?.split('T')[1]?.slice(0, 8)}</span>
                  <span className="font-bold text-slate-800 shrink-0">[{log.action}]</span>
                  <span className="text-slate-600">{log.details}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
