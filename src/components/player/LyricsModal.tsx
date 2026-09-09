import React, { useEffect, useRef } from 'react';
import { X, Mic2, AlertCircle } from 'lucide-react';
import { Track, LyricLine } from '../../types/music';
import { playerEngine } from '../../services/playerEngine';

interface Props {
  track: Track | null;
  currentTime: number;
  isOpen: boolean;
  onClose: () => void;
}

export const LyricsModal: React.FC<Props> = ({ track, currentTime, isOpen, onClose }) => {
  const activeLineRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentTime]);

  if (!isOpen || !track) return null;

  const hasSyncedLyrics = Array.isArray(track.lyrics) && track.lyrics.length > 0;
  const rawTextLyrics = typeof track.lyrics === 'string' ? track.lyrics : null;

  return (
    <div
      id="lyrics-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-2xl transition-opacity animate-in fade-in select-none"
      onClick={onClose}
    >
      <div
        id="lyrics-modal-panel"
        className="relative w-full max-w-xl max-h-[85vh] rounded-[28px] bg-[#18181A] border border-white/[0.08] shadow-2xl p-6 sm:p-8 flex flex-col overflow-hidden text-[#F1EEE7]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[#202022] text-[#C7B5FF] flex items-center justify-center border border-white/[0.06] shrink-0">
              <Mic2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-[#F1EEE7] leading-none truncate max-w-[280px]">
                {track.title}
              </h3>
              <p className="text-xs text-[#77756F] mt-1 truncate">
                {track.artist}
              </p>
            </div>
          </div>
          <button
            id="lyrics-close-btn"
            aria-label="Close lyrics"
            className="p-2 rounded-full text-[#77756F] hover:text-[#F1EEE7] hover:bg-white/[0.06] transition"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lyrics Body */}
        <div className="flex-1 overflow-y-auto py-8 px-2 space-y-6 text-center select-none scroll-smooth no-scrollbar">
          {hasSyncedLyrics ? (
            (track.lyrics as LyricLine[]).map((line, idx) => {
              const lines = track.lyrics as LyricLine[];
              const nextLine = lines[idx + 1];
              const isCurrent =
                currentTime >= line.time &&
                (!nextLine || currentTime < nextLine.time);

              return (
                <div
                  key={idx}
                  ref={isCurrent ? activeLineRef : null}
                  className={`transition-all duration-300 py-1.5 px-4 rounded-xl cursor-pointer ${
                    isCurrent
                      ? 'text-xl sm:text-2xl font-bold text-[#F1EEE7] drop-shadow-[0_2px_12px_rgba(199,181,255,0.4)] scale-105'
                      : 'text-base sm:text-lg font-medium text-[#4D4D50] hover:text-[#B4B1AB]'
                  }`}
                  onClick={() => playerEngine.seek(line.time)}
                >
                  {line.text}
                </div>
              );
            })
          ) : rawTextLyrics ? (
            <div className="text-left text-sm sm:text-base leading-relaxed text-[#B4B1AB] whitespace-pre-wrap font-sans">
              {rawTextLyrics}
            </div>
          ) : (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#202022] border border-white/[0.06] flex items-center justify-center text-[#77756F] mb-4">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-semibold text-[#F1EEE7]">Lyrics unavailable</h4>
              <p className="text-xs text-[#77756F] max-w-sm mt-2 leading-relaxed">
                Lyrics stream not available for this track. Curated tracks like "Neon Heartbeat" have live synchronized lyrics.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
