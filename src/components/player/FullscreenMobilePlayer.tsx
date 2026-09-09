import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  MoreVertical,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  ListMusic,
  FileText,
  Share2,
  Radio,
  PictureInPicture2,
  Disc
} from 'lucide-react';
import { PlayerState, Track } from '../../types/music';
import { playerEngine } from '../../services/playerEngine';
import { formatTime } from '../../services/audioMetadata';
import { CURATED_CATALOG } from '../../services/youtubeApi';
import { ClickWheelController } from './ClickWheelController';

interface Props {
  playerState: PlayerState;
  isLiked?: boolean;
  onToggleLike?: () => void;
  onClose: () => void;
  onOpenQueue?: () => void;
  onOpenLyrics?: () => void;
  onOpenSearch?: () => void;
  initialTab?: 'now_playing' | 'queue' | 'lyrics';
}

export const FullscreenMobilePlayer: React.FC<Props> = ({
  playerState,
  isLiked = false,
  onToggleLike,
  onClose,
  initialTab = 'now_playing'
}) => {
  const [activeTab, setActiveTab] = useState<'queue' | 'now_playing' | 'lyrics'>(initialTab);
  const [useWheelMode, setUseWheelMode] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const activeLyricRef = useRef<HTMLDivElement | null>(null);

  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    shuffleMode,
    repeatMode,
    queue,
    buffering
  } = playerState;

  // Auto-scroll active lyric line into view
  useEffect(() => {
    if (activeTab === 'lyrics' && activeLyricRef.current) {
      activeLyricRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentTime, activeTab]);

  if (!currentTrack) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const remainingSeconds = Math.max(0, duration - currentTime);
  const displayTracks: Track[] =
    queue && queue.length > 2 ? queue : CURATED_CATALOG.slice(0, 15);

  // Parse lyrics
  const hasSyncedLyrics = Array.isArray(currentTrack.lyrics) && currentTrack.lyrics.length > 0;
  const rawTextLyrics = typeof currentTrack.lyrics === 'string' ? currentTrack.lyrics : null;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentTrack.title,
          text: `Listening to ${currentTrack.title} by ${currentTrack.artist} on Aura Music`,
          url: window.location.href
        });
      } catch {
        // user dismissed
      }
    } else {
      await navigator.clipboard.writeText(`${currentTrack.title} - ${currentTrack.artist}`);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2000);
    }
  };

  return (
    <div
      id="mobile-player-modal"
      className="fixed inset-0 z-50 flex flex-col justify-between bg-[#151515] text-[#F1EEE7] select-none pt-safe pb-safe overflow-hidden animate-in fade-in duration-200"
    >
      {/* Top Header Bar */}
      <header className="relative z-20 flex items-center justify-between px-4 pt-3 pb-2 shrink-0 border-b border-white/[0.04]">
        <button
          id="mobile-player-back-btn"
          aria-label="Collapse player"
          className="w-10 h-10 rounded-full flex items-center justify-center text-[#B4B1AB] hover:text-[#F1EEE7] hover:bg-white/[0.06] active:scale-95 transition"
          onClick={onClose}
        >
          <ChevronLeft className="w-6 h-6 stroke-[2]" />
        </button>

        {/* Center Segmented View Switcher */}
        <div className="flex items-center p-1 rounded-full bg-[#1B1B1D] border border-white/[0.06] text-xs font-semibold">
          <button
            className={`px-3 py-1 rounded-full transition ${
              activeTab === 'queue'
                ? 'bg-[#262628] text-[#F1EEE7] shadow-sm'
                : 'text-[#77756F] hover:text-[#B4B1AB]'
            }`}
            onClick={() => setActiveTab('queue')}
          >
            Queue
          </button>
          <button
            className={`px-3 py-1 rounded-full transition ${
              activeTab === 'now_playing'
                ? 'bg-[#262628] text-[#F1EEE7] shadow-sm'
                : 'text-[#77756F] hover:text-[#B4B1AB]'
            }`}
            onClick={() => setActiveTab('now_playing')}
          >
            Now Playing
          </button>
          <button
            className={`px-3 py-1 rounded-full transition ${
              activeTab === 'lyrics'
                ? 'bg-[#262628] text-[#F1EEE7] shadow-sm'
                : 'text-[#77756F] hover:text-[#B4B1AB]'
            }`}
            onClick={() => setActiveTab('lyrics')}
          >
            Lyrics
          </button>
        </div>

        {/* Share / Options */}
        <button
          id="mobile-player-options-btn"
          aria-label="Share song"
          className="w-10 h-10 rounded-full flex items-center justify-center text-[#B4B1AB] hover:text-[#F1EEE7] hover:bg-white/[0.06] active:scale-95 transition"
          onClick={handleShare}
        >
          <Share2 className="w-4 h-4" />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col justify-between px-5 py-3 overflow-hidden">
        {/* =================================================================== */}
        {/* VIEW 1: NOW PLAYING (AUTHENTIC AUDIOPHILE PHONE PLAYER) */}
        {/* =================================================================== */}
        {activeTab === 'now_playing' && (
          <div className="flex-1 flex flex-col justify-between py-1 overflow-y-auto no-scrollbar max-w-sm mx-auto w-full">
            {/* Top: Large Album Artwork with soft depth */}
            <div className="flex flex-col items-center justify-center pt-2">
              <div className="w-[240px] h-[240px] xs:w-[260px] xs:h-[260px] sm:w-[280px] sm:h-[280px] aspect-square rounded-[28px] overflow-hidden bg-[#1B1B1D] border border-white/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.85)] relative">
                {currentTrack.artworkUrl ? (
                  <img
                    src={currentTrack.artworkUrl}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#77756F]">
                    <Radio className="w-16 h-16 opacity-50" />
                  </div>
                )}
                {buffering && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-white/30 border-t-[#C7B5FF] rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {/* Title & Artist Information */}
              <div className="mt-5 text-center w-full px-2">
                <h1 className="text-xl sm:text-2xl font-bold text-[#F1EEE7] tracking-tight truncate font-['Plus_Jakarta_Sans',sans-serif]">
                  {currentTrack.title}
                </h1>
                <p className="text-sm text-[#B4B1AB] font-normal mt-1 truncate">
                  {currentTrack.artist}
                </p>
              </div>
            </div>

            {/* Progress scrubber */}
            <div className="w-full my-3">
              <div
                className="relative w-full h-2 bg-[#262628] rounded-full cursor-pointer group flex items-center"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickPos = (e.clientX - rect.left) / rect.width;
                  playerEngine.seek(clickPos * duration);
                }}
              >
                <div
                  className="h-full bg-gradient-to-r from-[#B4B1AB] to-[#C7B5FF] rounded-full relative"
                  style={{ width: `${progressPercent}%` }}
                >
                  <div
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#F1EEE7] shadow-md"
                    style={{ transform: 'translate(50%, -50%)' }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-[#77756F] mt-1.5 tabular-nums">
                <span>{formatTime(currentTime)}</span>
                <span>-{formatTime(remainingSeconds)}</span>
              </div>
            </div>

            {/* Mode Switcher: Standard Minimal Controls OR Classic Click Wheel */}
            {useWheelMode ? (
              <div className="flex flex-col items-center justify-center py-2">
                <ClickWheelController
                  isPlaying={isPlaying}
                  shuffleMode={shuffleMode}
                  onTogglePlayPause={() => playerEngine.togglePlayPause()}
                  onNextTrack={() => playerEngine.nextTrack()}
                  onPreviousTrack={() => playerEngine.previousTrack()}
                  onToggleShuffle={() => playerEngine.toggleShuffle()}
                  onWheelScrub={(deltaSeconds) => {
                    playerEngine.seek(Math.max(0, Math.min(duration, currentTime + deltaSeconds)));
                  }}
                  size={220}
                />
              </div>
            ) : (
              /* Minimal Audiophile 5-Button Control Row */
              <div className="flex items-center justify-between px-3 py-3 w-full">
                {/* Shuffle Button */}
                <button
                  id="mobile-player-shuffle-btn"
                  aria-label="Toggle shuffle"
                  className={`p-2.5 rounded-full transition active:scale-95 ${
                    shuffleMode ? 'text-[#C7B5FF] bg-white/[0.06]' : 'text-[#77756F] hover:text-[#B4B1AB]'
                  }`}
                  onClick={() => playerEngine.toggleShuffle()}
                >
                  <Shuffle className="w-5 h-5 stroke-[2]" />
                </button>

                {/* Previous Track Button */}
                <button
                  id="mobile-player-prev-btn"
                  aria-label="Previous track"
                  className="p-2.5 rounded-full text-[#B4B1AB] hover:text-[#F1EEE7] transition active:scale-95"
                  onClick={() => playerEngine.previousTrack()}
                >
                  <SkipBack className="w-6 h-6 fill-current stroke-0" />
                </button>

                {/* PROMINENT CIRCULAR AUDIOPHILE PLAY/PAUSE BUTTON */}
                <button
                  id="mobile-player-play-pause-btn"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                  className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-[#F1EEE7] text-[#151515] shadow-xl hover:scale-105 active:scale-95 transition-all shrink-0 flex items-center justify-center"
                  style={{
                    aspectRatio: '1 / 1',
                    borderRadius: '50%',
                    flexShrink: 0,
                    display: 'grid',
                    placeItems: 'center'
                  }}
                  onClick={() => playerEngine.togglePlayPause()}
                >
                  {isPlaying ? (
                    <Pause className="w-7 h-7 fill-current stroke-0" />
                  ) : (
                    <Play className="w-7 h-7 fill-current stroke-0 ml-1" />
                  )}
                </button>

                {/* Next Track Button */}
                <button
                  id="mobile-player-next-btn"
                  aria-label="Next track"
                  className="p-2.5 rounded-full text-[#B4B1AB] hover:text-[#F1EEE7] transition active:scale-95"
                  onClick={() => playerEngine.nextTrack()}
                >
                  <SkipForward className="w-6 h-6 fill-current stroke-0" />
                </button>

                {/* Repeat Button */}
                <button
                  id="mobile-player-repeat-btn"
                  aria-label="Toggle repeat"
                  className={`p-2.5 rounded-full transition active:scale-95 ${
                    repeatMode !== 'off'
                      ? 'text-[#C7B5FF] bg-white/[0.06]'
                      : 'text-[#77756F] hover:text-[#B4B1AB]'
                  }`}
                  onClick={() => playerEngine.toggleRepeat()}
                >
                  {repeatMode === 'one' ? (
                    <Repeat1 className="w-5 h-5 stroke-[2]" />
                  ) : (
                    <Repeat className="w-5 h-5 stroke-[2]" />
                  )}
                </button>
              </div>
            )}

            {/* Secondary Action Bar */}
            <div className="flex items-center justify-around py-2.5 px-4 rounded-2xl bg-[#1B1B1D] border border-white/[0.06] w-full mb-1">
              {onToggleLike && (
                <button
                  id="mobile-action-save"
                  aria-label={isLiked ? 'Saved' : 'Save song'}
                  className="flex items-center gap-1.5 text-xs text-[#B4B1AB] hover:text-[#F1EEE7] transition active:scale-95"
                  onClick={onToggleLike}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'text-rose-500 fill-current' : ''}`} />
                  <span className={isLiked ? 'text-rose-500 font-semibold' : ''}>
                    {isLiked ? 'Liked' : 'Like'}
                  </span>
                </button>
              )}

              {/* Toggle Wheel vs Minimal Player */}
              <button
                aria-label="Toggle player style"
                className="flex items-center gap-1.5 text-xs text-[#77756F] hover:text-[#F1EEE7] transition active:scale-95"
                onClick={() => setUseWheelMode(!useWheelMode)}
                title="Toggle Wheel Controller"
              >
                <Disc className="w-4 h-4 text-[#C7B5FF]" />
                <span>{useWheelMode ? 'Buttons' : 'Wheel'}</span>
              </button>

              {/* Picture-in-Picture Pop-out */}
              {playerEngine.isPictureInPictureSupported() && (
                <button
                  id="mobile-action-pip"
                  aria-label="Floating Player"
                  className="flex items-center gap-1.5 text-xs text-[#77756F] hover:text-[#F1EEE7] transition active:scale-95"
                  onClick={() => playerEngine.togglePictureInPicture()}
                >
                  <PictureInPicture2 className="w-4 h-4" />
                  <span>Pop-out</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* VIEW 2: QUEUE / TRACKLIST */}
        {/* =================================================================== */}
        {activeTab === 'queue' && (
          <div className="flex-1 flex flex-col overflow-hidden py-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 shrink-0 border-b border-white/[0.04]">
              <span className="text-xs font-bold uppercase tracking-widest text-[#77756F] font-mono">
                Now Playing Queue ({displayTracks.length})
              </span>
              {queue.length > 1 && (
                <button
                  className="text-xs text-[#77756F] hover:text-rose-400 transition font-medium"
                  onClick={() => playerEngine.clearQueue()}
                >
                  Clear Queue
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 py-2 no-scrollbar">
              {displayTracks.map((track, idx) => {
                const isCurrent = currentTrack.id === track.id;
                const trackNumber = idx + 1;

                return (
                  <div
                    key={`${track.id}-${idx}`}
                    className={`group flex items-center transition-all duration-150 cursor-pointer ${
                      isCurrent
                        ? 'p-3 rounded-2xl bg-[#202022] border border-[#C7B5FF]/30 shadow-md'
                        : 'p-2.5 rounded-2xl hover:bg-[#1B1B1D] border border-transparent'
                    }`}
                    onClick={() => playerEngine.playTrack(track)}
                  >
                    <span
                      className={`w-8 text-base font-bold font-mono shrink-0 ${
                        isCurrent ? 'text-[#C7B5FF]' : 'text-[#77756F]'
                      }`}
                    >
                      {trackNumber}
                    </span>

                    <div className="min-w-0 flex-1 pr-2">
                      <h4
                        className={`text-sm font-semibold truncate leading-tight ${
                          isCurrent ? 'text-[#F1EEE7] font-bold' : 'text-[#B4B1AB]'
                        }`}
                      >
                        {track.title}
                      </h4>
                      <p
                        className={`text-xs truncate mt-0.5 ${
                          isCurrent ? 'text-[#C7B5FF]' : 'text-[#77756F]'
                        }`}
                      >
                        {track.artist}
                      </p>
                    </div>

                    <span className="text-xs font-mono text-[#77756F] shrink-0">
                      {formatTime(track.duration)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* VIEW 3: LYRICS */}
        {/* =================================================================== */}
        {activeTab === 'lyrics' && (
          <div className="flex-1 flex flex-col overflow-hidden py-2 animate-in fade-in duration-200">
            {/* Header info */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#1B1B1D] border border-white/[0.06] mb-3 shrink-0">
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-semibold text-[#F1EEE7] truncate">
                  {currentTrack.title}
                </h4>
                <p className="text-xs text-[#77756F] truncate">{currentTrack.artist}</p>
              </div>
              <button
                aria-label={isPlaying ? 'Pause' : 'Play'}
                className="w-9 h-9 rounded-full bg-[#F1EEE7] text-[#151515] flex items-center justify-center shadow-md shrink-0"
                onClick={() => playerEngine.togglePlayPause()}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-current stroke-0" />
                ) : (
                  <Play className="w-4 h-4 fill-current stroke-0 ml-0.5" />
                )}
              </button>
            </div>

            {/* Lyrics content */}
            <div className="flex-1 overflow-y-auto px-2 space-y-6 text-center py-6 no-scrollbar">
              {hasSyncedLyrics ? (
                (currentTrack.lyrics as any[]).map((line, idx) => {
                  const isActive =
                    currentTime >= line.time &&
                    (!currentTrack.lyrics![idx + 1] ||
                      currentTime < currentTrack.lyrics![idx + 1].time);

                  return (
                    <p
                      key={idx}
                      ref={isActive ? activeLyricRef : null}
                      className={`text-lg sm:text-xl font-bold tracking-tight transition-all duration-300 cursor-pointer ${
                        isActive
                          ? 'text-[#F1EEE7] scale-105 drop-shadow-[0_2px_12px_rgba(199,181,255,0.4)]'
                          : 'text-[#4D4D50] hover:text-[#B4B1AB]'
                      }`}
                      onClick={() => playerEngine.seek(line.time)}
                    >
                      {line.text}
                    </p>
                  );
                })
              ) : rawTextLyrics ? (
                <div className="whitespace-pre-line text-sm text-[#B4B1AB] leading-relaxed">
                  {rawTextLyrics}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-[#77756F] space-y-2">
                  <FileText className="w-10 h-10 opacity-40" />
                  <p className="text-sm">No lyrics available for this track</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* 3-Tab Bottom Navigation Bar */}
      <nav
        id="mobile-player-bottom-tabs"
        className="relative z-20 flex items-center justify-around h-16 border-t border-white/[0.06] bg-[#18181A]/95 backdrop-blur-md px-4 shrink-0"
      >
        <button
          className={`flex flex-col items-center justify-center flex-1 h-full transition ${
            activeTab === 'queue' ? 'text-[#F1EEE7] font-bold' : 'text-[#77756F] hover:text-[#B4B1AB]'
          }`}
          onClick={() => setActiveTab('queue')}
        >
          <ListMusic className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">Queue</span>
        </button>

        <button
          className={`flex flex-col items-center justify-center flex-1 h-full transition ${
            activeTab === 'now_playing' ? 'text-[#F1EEE7] font-bold' : 'text-[#77756F] hover:text-[#B4B1AB]'
          }`}
          onClick={() => setActiveTab('now_playing')}
        >
          <Play className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">Now Playing</span>
        </button>

        <button
          className={`flex flex-col items-center justify-center flex-1 h-full transition ${
            activeTab === 'lyrics' ? 'text-[#F1EEE7] font-bold' : 'text-[#77756F] hover:text-[#B4B1AB]'
          }`}
          onClick={() => setActiveTab('lyrics')}
        >
          <FileText className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">Lyrics</span>
        </button>
      </nav>

      {/* Share Toast */}
      {shareToast && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-[#202022] text-[#F1EEE7] text-xs font-semibold shadow-2xl border border-white/[0.1] z-50 animate-bounce">
          Song info copied to clipboard!
        </div>
      )}
    </div>
  );
};
