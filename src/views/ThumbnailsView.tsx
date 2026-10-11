import React, { useState, useRef, useEffect } from 'react';
import {
  Image as ImageIcon,
  Sparkles,
  Download,
  Upload,
  Type,
  Palette,
  Eye,
  Check,
  RefreshCw,
  Sliders,
  Layers,
} from 'lucide-react';
import { ThumbnailConcept, HubDatabase } from '../types/hub';
import { api } from '../api/client';

interface ThumbnailsViewProps {
  database: HubDatabase;
  onRefresh: () => void;
}

export const ThumbnailsView: React.FC<ThumbnailsViewProps> = ({
  database,
  onRefresh,
}) => {
  const [headlineText, setHeadlineText] = useState('FAILS 80% OF THE TIME');
  const [subText, setSubText] = useState('WHAT LANDLORDS OVERLOOK');
  const [badgeText, setBadgeText] = useState('UK SAFETY AUDIT');
  const [bgStyle, setBgStyle] = useState<'dark_gradient' | 'road_trip_tint' | 'contrast_black'>('dark_gradient');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [accentColor, setAccentColor] = useState('#EF4444');
  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Render thumbnail to 1280x720 canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    if (uploadedImage) {
      // Draw uploaded photo covering canvas
      const hRatio = canvas.width / uploadedImage.width;
      const vRatio = canvas.height / uploadedImage.height;
      const ratio = Math.max(hRatio, vRatio);
      const centerShiftX = (canvas.width - uploadedImage.width * ratio) / 2;
      const centerShiftY = (canvas.height - uploadedImage.height * ratio) / 2;
      ctx.drawImage(uploadedImage, 0, 0, uploadedImage.width, uploadedImage.height,
        centerShiftX, centerShiftY, uploadedImage.width * ratio, uploadedImage.height * ratio);

      // Vignette / dark overlay on left for text legibility
      const scrim = ctx.createLinearGradient(0, 0, canvas.width * 0.75, 0);
      scrim.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
      scrim.addColorStop(0.6, 'rgba(0, 0, 0, 0.4)');
      scrim.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = scrim;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      // Default graphic background
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      if (bgStyle === 'dark_gradient') {
        grad.addColorStop(0, '#0F172A');
        grad.addColorStop(1, '#020617');
      } else if (bgStyle === 'road_trip_tint') {
        grad.addColorStop(0, '#1E1B4B');
        grad.addColorStop(1, '#0F172A');
      } else {
        grad.addColorStop(0, '#18181B');
        grad.addColorStop(1, '#09090B');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Diagonal graphic slash
      ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
      ctx.beginPath();
      ctx.moveTo(canvas.width * 0.6, 0);
      ctx.lineTo(canvas.width, 0);
      ctx.lineTo(canvas.width * 0.8, canvas.height);
      ctx.lineTo(canvas.width * 0.4, canvas.height);
      ctx.fill();
    }

    // Top Category / Badge Pill
    if (badgeText.trim()) {
      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.roundRect(60, 60, ctx.measureText(badgeText).width + 80, 48, 8);
      ctx.fill();

      ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(badgeText.toUpperCase(), 75, 84);
    }

    // Headline Text (Massive, YouTube Style, High-Contrast Stroke)
    ctx.font = '900 68px "Plus Jakarta Sans", Impact, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // Black Drop Shadow / Outline
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 12;
    ctx.lineJoin = 'miter';
    ctx.miterLimit = 2;
    ctx.strokeText(headlineText, 60, 150);

    // Headline Fill
    ctx.fillStyle = textColor;
    ctx.fillText(headlineText, 60, 150);

    // Sub-Headline Text with Yellow or White Highlight
    if (subText.trim()) {
      ctx.font = 'bold 42px "Plus Jakarta Sans", sans-serif';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 8;
      ctx.strokeText(subText, 60, 245);

      ctx.fillStyle = '#FBBF24'; // Warning yellow highlight
      ctx.fillText(subText, 60, 245);
    }

    // Bottom Branding Watermark
    ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText('CHARLIE HUGHES · WORK. TRAVEL. REAL LIFE.', 60, canvas.height - 60);

  }, [headlineText, subText, badgeText, bgStyle, textColor, accentColor, uploadedImage]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setUploadedImage(img);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadThumbnail = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `charlie-thumbnail-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Thumbnails & Titles Packaging Studio
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Design high-contrast 1280x720 YouTube packaging. Preview at full resolution and simulated mobile search size.
          </p>
        </div>
        <button
          onClick={handleDownloadThumbnail}
          className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export 1280x720 PNG</span>
        </button>
      </div>

      {/* Main Studio Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Canvas Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Type className="w-4 h-4 text-red-600" />
              <span>Packaging Typography & Badges</span>
            </h3>

            {/* Headline */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Main Punchy Headline (3–5 Words Max)
              </label>
              <input
                type="text"
                value={headlineText}
                onChange={(e) => setHeadlineText(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 font-bold uppercase tracking-wider"
              />
            </div>

            {/* Sub-text */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Highlight / Secondary Text
              </label>
              <input
                type="text"
                value={subText}
                onChange={(e) => setSubText(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 uppercase font-medium"
              />
            </div>

            {/* Top Badge */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Top Label / Category Pill
              </label>
              <input
                type="text"
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 uppercase font-medium"
              />
            </div>

            {/* Photo Upload */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block font-semibold text-slate-700 mb-1">
                Upload Road Trip / Site Photograph
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                JPG or PNG. Photos are laid out automatically with text contrast scrims.
              </span>
            </div>

            {/* Presets */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block font-semibold text-slate-700 mb-1">Background Theme</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => { setUploadedImage(null); setBgStyle('dark_gradient'); }}
                  className="p-2 border rounded text-center hover:bg-slate-50 font-medium"
                >
                  Dark Slate
                </button>
                <button
                  type="button"
                  onClick={() => { setUploadedImage(null); setBgStyle('road_trip_tint'); }}
                  className="p-2 border rounded text-center hover:bg-slate-50 font-medium"
                >
                  Midnight Blue
                </button>
                <button
                  type="button"
                  onClick={() => { setUploadedImage(null); setBgStyle('contrast_black'); }}
                  className="p-2 border rounded text-center hover:bg-slate-50 font-medium"
                >
                  Pure Charcoal
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Previews & Dimensions (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Main 1280x720 Canvas Box */}
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-lg space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-medium text-white flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-red-500" />
                Live 16:9 Thumbnail Canvas (1280 x 720)
              </span>
              <span className="font-mono text-[11px]">YouTube Specification standard</span>
            </div>

            <div className="aspect-video w-full rounded-lg overflow-hidden bg-black flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={1280}
                height={720}
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Mobile Search Feed Preview (320px check) */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
              <Eye className="w-4 h-4 text-slate-500" />
              <span>Mobile Feed Legibility Simulation (Small Screen Test)</span>
            </h4>
            <p className="text-slate-500">
              80% of YouTube views originate on mobile screens. Ensure your text remains 100% legible at small scale:
            </p>

            <div className="max-w-[320px] bg-slate-50 p-2 rounded-lg border border-slate-200 space-y-2">
              <div className="aspect-video w-full rounded overflow-hidden bg-slate-900">
                <canvas
                  width={320}
                  height={180}
                  ref={(smallCanvas) => {
                    if (smallCanvas && canvasRef.current) {
                      const ctx = smallCanvas.getContext('2d');
                      ctx?.drawImage(canvasRef.current, 0, 0, 320, 180);
                    }
                  }}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-[11px] font-bold text-slate-900 truncate">
                {headlineText} — {subText}
              </div>
              <div className="text-[10px] text-slate-400">
                Charlie Hughes · 2.4K views · 2 days ago
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
