import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, FlipHorizontal, Type, X, ChevronUp, ChevronDown } from 'lucide-react';

interface TeleprompterModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

export const TeleprompterModal: React.FC<TeleprompterModalProps> = ({
  isOpen,
  onClose,
  title,
  content,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(2); // 1 - 5
  const [fontSize, setFontSize] = useState(36); // px
  const [isMirrored, setIsMirrored] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop += speed;
        }
      }, 30);
    }
    return () => clearInterval(interval);
  }, [isPlaying, speed]);

  if (!isOpen) return null;

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const estimatedMins = (wordCount / 135).toFixed(1); // 135 words per minute average speaking rate

  const resetScroll = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    setIsPlaying(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black text-white flex flex-col font-sans select-none">
      {/* Top Floating Control Bar */}
      <div className="px-6 py-4 bg-neutral-900/90 border-b border-neutral-800 flex items-center justify-between backdrop-blur-md">
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-neutral-200">{title}</h2>
          <p className="text-[11px] text-neutral-400">
            {wordCount} words · ~{estimatedMins} min speaking time
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Font Size */}
          <div className="flex items-center gap-1 bg-neutral-800 rounded-lg p-1">
            <button
              onClick={() => setFontSize((f) => Math.max(22, f - 4))}
              className="px-2 py-1 text-xs hover:bg-neutral-700 rounded text-neutral-300"
              title="Decrease Font Size"
            >
              A-
            </button>
            <span className="text-xs font-mono px-1 text-neutral-400">{fontSize}px</span>
            <button
              onClick={() => setFontSize((f) => Math.min(64, f + 4))}
              className="px-2 py-1 text-xs hover:bg-neutral-700 rounded text-neutral-300"
              title="Increase Font Size"
            >
              A+
            </button>
          </div>

          {/* Speed */}
          <div className="flex items-center gap-1 bg-neutral-800 rounded-lg p-1">
            <span className="text-[11px] px-1.5 text-neutral-400">Speed</span>
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`w-6 h-6 text-xs rounded font-mono ${
                  speed === s ? 'bg-red-600 text-white font-bold' : 'text-neutral-400 hover:bg-neutral-700'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Mirror Flip */}
          <button
            onClick={() => setIsMirrored((m) => !m)}
            className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 ${
              isMirrored
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700'
            }`}
            title="Mirror for Teleprompter Glass"
          >
            <FlipHorizontal className="w-3.5 h-3.5" />
            <span className="text-[11px]">Mirror</span>
          </button>

          {/* Reset */}
          <button
            onClick={resetScroll}
            className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg border border-neutral-700 text-neutral-300"
            title="Reset to Top"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Play/Pause */}
          <button
            onClick={() => setIsPlaying((p) => !p)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-red-600 hover:bg-red-500 text-white shadow-lg'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
            <span>{isPlaying ? 'Pause' : 'Start Scroll'}</span>
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-lg transition-colors ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Teleprompter Scroll Text Area */}
      <div
        ref={scrollContainerRef}
        className={`flex-1 overflow-y-auto px-12 py-24 transition-transform ${
          isMirrored ? 'scale-x-[-1]' : ''
        }`}
        style={{ scrollBehavior: 'smooth' }}
      >
        <div className="max-w-4xl mx-auto space-y-8 leading-relaxed font-medium">
          {content.split('\n\n').map((paragraph, idx) => (
            <p
              key={idx}
              style={{ fontSize: `${fontSize}px`, lineHeight: 1.5 }}
              className="text-neutral-100 font-sans tracking-wide"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* Bottom Floating Indicator */}
      <div className="py-2 bg-neutral-950 border-t border-neutral-900 text-center text-xs text-neutral-500">
        Press Spacebar or click Start Scroll to run teleprompter · Ideal eye-level position is directly beneath lens
      </div>
    </div>
  );
};
