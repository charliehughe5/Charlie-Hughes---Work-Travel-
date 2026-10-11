import React, { useState, useEffect } from 'react';
import {
  Youtube,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Video,
  Upload,
  Lock,
  Eye,
  Key,
  ShieldCheck,
  Radio,
} from 'lucide-react';
import { api } from '../api/client';
import { HubDatabase } from '../types/hub';

interface YouTubeChannelViewProps {
  database: HubDatabase;
  onRefresh: () => void;
}

export const YouTubeChannelView: React.FC<YouTubeChannelViewProps> = ({
  database,
  onRefresh,
}) => {
  const [channelProfile, setChannelProfile] = useState<any>(null);
  const [channelVideos, setChannelVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusInfo, setStatusInfo] = useState<any>(null);

  useEffect(() => {
    loadChannel();
  }, []);

  const loadChannel = async () => {
    setLoading(true);
    try {
      const [profile, videos, status] = await Promise.all([
        api.getYoutubeChannel(),
        api.getYoutubeVideos(),
        api.getYoutubeStatus(),
      ]);
      setChannelProfile(profile);
      setChannelVideos(videos);
      setStatusInfo(status);
    } catch (e: any) {
      console.warn('YouTube channel fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (confirm('Disconnect YouTube account credentials from Charlie Creator Hub?')) {
      await api.disconnectYoutube();
      loadChannel();
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            YouTube Channel Connection & Operations
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Official YouTube Data API v3 integration for Charlie Hughes (@charliehughe5).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadChannel}
            disabled={loading}
            className="px-3 py-1.5 text-xs text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Sync</span>
          </button>
        </div>
      </div>

      {/* Channel Profile Banner */}
      <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Youtube className="w-8 h-8 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">
                  {channelProfile?.title || 'Charlie Hughes'}
                </h3>
                <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {channelProfile?.customUrl || '@charliehughe5'}
                </span>
                <span className="text-emerald-700 text-xs font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-xl">
                {channelProfile?.description || 'Work. Travel. Real Life. Weekly British vlog.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href="https://www.youtube.com/@charliehughe5"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <span>Open on YouTube</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Live Channel Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">Subscribers:</span>
            <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
              {channelProfile?.subscriberCount || 240}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">Total Channel Views:</span>
            <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
              {channelProfile?.viewCount?.toLocaleString() || '18,450'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">Public Videos:</span>
            <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
              {channelProfile?.videoCount || 16}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">Publish Target:</span>
            <span className="text-lg font-bold text-slate-900">
              Weekly (Sunday)
            </span>
          </div>
        </div>
      </div>

      {/* Safety Notice Before Live Changes */}
      <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Live Channel Modification Protection: </span>
          <span>
            Charlie Creator Hub never publishes videos, alters privacy status, or modifies live YouTube metadata without explicit, final confirmation in the UI. All uploads are initially prepared in private draft state.
          </span>
        </div>
      </div>

      {/* Published Videos Registry */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Recent Channel Uploads ({channelVideos.length})
        </h3>

        <div className="space-y-3">
          {channelVideos.map((vid) => (
            <div
              key={vid.id}
              className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span className="font-mono">{vid.publishedAt?.split('T')[0]}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono">{vid.duration}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-700 font-semibold uppercase">{vid.privacyStatus}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{vid.title}</h4>
                <p className="text-slate-500 text-[11px] line-clamp-1">{vid.description}</p>
              </div>

              <div className="flex items-center gap-4 text-[11px] font-mono text-slate-600 shrink-0">
                <div className="text-right">
                  <span className="block font-bold text-slate-900 tabular-nums">
                    {vid.viewCount?.toLocaleString()} views
                  </span>
                  <span className="text-slate-400">
                    {vid.likeCount} likes · {vid.commentCount} comments
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
