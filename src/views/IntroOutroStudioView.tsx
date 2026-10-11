import React, { useState, useRef, useEffect } from 'react';
import {
  Film,
  Sparkles,
  Download,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Video,
  MonitorPlay,
  Layers,
} from 'lucide-react';
import { IntroOutroAsset, HubDatabase } from '../types/hub';
import { api } from '../api/client';

interface IntroOutroStudioViewProps {
  database: HubDatabase;
  onRefresh: () => void;
}

export const IntroOutroStudioView: React.FC<IntroOutroStudioViewProps> = ({
  database,
  onRefresh,
}) => {
  const [assetType, setAssetType] = useState<'intro' | 'outro' | 'subscribe_card'>('intro');
  const [preset, setPreset] = useState<IntroOutroAsset['presetStyle']>('Cinematic Road Trip');
  const [primaryText, setPrimaryText] = useState('CHARLIE HUGHES');
  const [secondaryText, setSecondaryText] = useState('Work. Travel. Real Life.');
  const [durationSecs, setDurationSecs] = useState(5);
  const [engine, setEngine] = useState<'browser_canvas_renderer' | 'veo_ai_model'>('browser_canvas_renderer');

  // Canvas rendering state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [veoPrompt, setVeoPrompt] = useState('Cinematic UK countryside road trip opening with subtle red accent typography');
  const [veoStatus, setVeoStatus] = useState<string | null>(null);
  const [veoLoading, setVeoLoading] = useState(false);

  // Animation frame loop
  useEffect(() => {
    let animId: number;
    let startTime = Date.now();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      const progress = (elapsed % durationSecs) / durationSecs;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      if (preset === 'Cinematic Road Trip') {
        grad.addColorStop(0, '#0F172A'); // deep slate
        grad.addColorStop(1, '#1E293B');
      } else if (preset === 'Modern Travel Vlog') {
        grad.addColorStop(0, '#18181B');
        grad.addColorStop(1, '#27272A');
      } else {
        grad.addColorStop(0, '#09090B');
        grad.addColorStop(1, '#18181B');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Road Perspective Lines (Cinematic Travel motif)
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.25)'; // restrained red
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, canvas.height * 0.45);
      ctx.lineTo(canvas.width * 0.2, canvas.height);
      ctx.moveTo(canvas.width / 2, canvas.height * 0.45);
      ctx.lineTo(canvas.width * 0.8, canvas.height);
      ctx.stroke();

      // Dashed lane marker
      ctx.setLineDash([20, 20]);
      ctx.lineDashOffset = -elapsed * 120;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, canvas.height * 0.45);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Horizon glow
      const radialGlow = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height * 0.45,
        10,
        canvas.width / 2,
        canvas.height * 0.45,
        250
      );
      radialGlow.addColorStop(0, 'rgba(239, 68, 68, 0.35)');
      radialGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = radialGlow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Animated Title
      const titleAlpha = Math.min(1, Math.max(0, (progress - 0.1) * 3));
      ctx.save();
      ctx.globalAlpha = titleAlpha;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Red Accent Bar
      ctx.fillStyle = '#EF4444';
      ctx.fillRect(canvas.width / 2 - 40, canvas.height * 0.38 - 45, 80, 4);

      // Primary Text
      ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(primaryText, canvas.width / 2, canvas.height * 0.38);

      // Secondary Text (Tagline)
      const subAlpha = Math.min(1, Math.max(0, (progress - 0.3) * 3));
      ctx.globalAlpha = subAlpha;
      ctx.font = '500 16px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#94A3B8';
      ctx.fillText(secondaryText, canvas.width / 2, canvas.height * 0.38 + 42);

      // Outro / Subscribe button prompt if selected
      if (assetType === 'subscribe_card' || assetType === 'outro') {
        const subBtnAlpha = Math.min(1, Math.max(0, (progress - 0.5) * 3));
        ctx.globalAlpha = subBtnAlpha;
        ctx.fillStyle = '#DC2626';
        ctx.beginPath();
        ctx.roundRect(canvas.width / 2 - 80, canvas.height * 0.72, 160, 36, 18);
        ctx.fill();

        ctx.font = 'bold 13px sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('SUBSCRIBE', canvas.width / 2, canvas.height * 0.72 + 18);
      }

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [preset, primaryText, secondaryText, durationSecs, assetType]);

  // Real Browser MediaRecorder Video Exporter
  const handleExportBrowserVideo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsRecording(true);
    setRecordedVideoUrl(null);

    const stream = canvas.captureStream(30);
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks: Blob[] = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setRecordedVideoUrl(url);
      setIsRecording(false);
    };

    mediaRecorder.start();

    // Record for the exact configured duration
    setTimeout(() => {
      mediaRecorder.stop();
    }, durationSecs * 1000);
  };

  // Official Veo Video Generation Request
  const handleStartVeo = async () => {
    if (!confirm('Start Veo AI video generation job? (Uses official veo-3.1-lite-generate-preview model).')) {
      return;
    }

    setVeoLoading(true);
    setVeoStatus('Initiating generation job with Google Gemini Veo...');

    try {
      const res = await api.generateVeoVideo(veoPrompt, '16:9');
      setVeoStatus(`Operation submitted: ${res.operationName}. Polling status in background...`);

      // Poll once to verify
      setTimeout(async () => {
        try {
          const pollRes = await api.pollVeoStatus(res.operationName);
          if (pollRes.done) {
            setVeoStatus('Video generation complete!');
          } else {
            setVeoStatus(`Job processing (${res.operationName}). Asynchronous generation in progress.`);
          }
        } catch {
          // keep status
        }
      }, 3000);
    } catch (err: any) {
      setVeoStatus(`Veo Generation Error: ${err.message}`);
    } finally {
      setVeoLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Intro & Outro Studio
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Create branded 3–5s intro bumpers and 5–10s closing sequences. Zero running costs via browser animation or Gemini Veo models.
          </p>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Configuration Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Film className="w-4 h-4 text-red-600" />
              <span>Asset Specifications</span>
            </h3>

            {/* Asset Type */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Asset Category</label>
              <div className="grid grid-cols-3 gap-2">
                {(['intro', 'outro', 'subscribe_card'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setAssetType(t)}
                    className={`py-2 px-2 text-center rounded-lg font-medium capitalize border transition-colors ${
                      assetType === t
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {t.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Preset Style */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Preset Creative Style</label>
              <select
                value={preset}
                onChange={(e: any) => setPreset(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-white text-slate-700"
              >
                <option value="Cinematic Road Trip">Cinematic Road Trip (M6 / UK Expressways)</option>
                <option value="Modern Travel Vlog">Modern Travel Vlog (Clean Minimal)</option>
                <option value="Minimalist Creator">Minimalist Creator Branding</option>
                <option value="Workday-to-Road-Trip">Workday-to-Road-Trip Transition</option>
                <option value="Clean Logo Reveal">Clean Logo & Title Reveal</option>
              </select>
            </div>

            {/* Typography */}
            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Primary Display Text</label>
                <input
                  type="text"
                  value={primaryText}
                  onChange={(e) => setPrimaryText(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tagline (Secondary Text)</label>
                <input
                  type="text"
                  value={secondaryText}
                  onChange={(e) => setSecondaryText(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Duration: {durationSecs} seconds</label>
                <input
                  type="range"
                  min={3}
                  max={10}
                  value={durationSecs}
                  onChange={(e) => setDurationSecs(Number(e.target.value))}
                  className="w-full accent-red-600"
                />
              </div>
            </div>

            {/* Generation Engine Toggle */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label className="block font-semibold text-slate-700">Rendering Engine</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setEngine('browser_canvas_renderer')}
                  className={`p-2.5 rounded-lg border text-left transition-colors ${
                    engine === 'browser_canvas_renderer'
                      ? 'border-red-600 bg-red-50/40 text-slate-900 font-semibold'
                      : 'border-slate-200 bg-slate-50 text-slate-600'
                  }`}
                >
                  <div className="text-slate-900 font-bold">In-Browser Video</div>
                  <div className="text-[10px] text-slate-500">100% Free · Instant WebM</div>
                </button>

                <button
                  type="button"
                  onClick={() => setEngine('veo_ai_model')}
                  className={`p-2.5 rounded-lg border text-left transition-colors ${
                    engine === 'veo_ai_model'
                      ? 'border-red-600 bg-red-50/40 text-slate-900 font-semibold'
                      : 'border-slate-200 bg-slate-50 text-slate-600'
                  }`}
                >
                  <div className="text-slate-900 font-bold">Veo AI Generator</div>
                  <div className="text-[10px] text-slate-500">Veo 3.1 Lite model</div>
                </button>
              </div>
            </div>

            {/* Engine action button */}
            {engine === 'browser_canvas_renderer' ? (
              <button
                type="button"
                onClick={handleExportBrowserVideo}
                disabled={isRecording}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
              >
                {isRecording ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Capturing Canvas Frames ({durationSecs}s)...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Render & Export Free WebM Video</span>
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-2">
                <textarea
                  value={veoPrompt}
                  onChange={(e) => setVeoPrompt(e.target.value)}
                  rows={2}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                />
                <button
                  type="button"
                  onClick={handleStartVeo}
                  disabled={veoLoading}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-red-500" />
                  <span>Start Veo Generation Job</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Interactive Canvas Monitor (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-lg space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <MonitorPlay className="w-3.5 h-3.5 text-red-500" />
                Live 16:9 Canvas Video Preview
              </span>
              <span className="font-mono text-[11px] text-slate-500">1280 x 720 (Scaled)</span>
            </div>

            {/* The Actual Real Animation Canvas */}
            <div className="aspect-video w-full rounded-lg overflow-hidden bg-black flex items-center justify-center relative">
              <canvas
                ref={canvasRef}
                width={1280}
                height={720}
                className="w-full h-full object-contain"
              />
              {isRecording && (
                <div className="absolute top-3 right-3 px-2 py-1 bg-red-600 text-white rounded text-[10px] font-bold tracking-wider flex items-center gap-1 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-white" />
                  REC
                </div>
              )}
            </div>

            {/* Download Link if recorded */}
            {recordedVideoUrl && (
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between text-xs animate-in fade-in">
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Video Render Ready! (WebM 30fps)
                </span>
                <a
                  href={recordedVideoUrl}
                  download={`charlie-hughes-${assetType}-${Date.now()}.webm`}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Finished Asset</span>
                </a>
              </div>
            )}

            {/* Veo Status Notice */}
            {veoStatus && (
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 font-mono">
                {veoStatus}
              </div>
            )}
          </div>

          {/* Guidelines info card */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
            <span className="font-semibold text-slate-900 block">Editor Usage Tip:</span>
            <p>
              Download the exported video clip and drop it directly onto Track 1 of your Premiere Pro, DaVinci Resolve, or CapCut project at the start or end of your vlog.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
