import React, { useState } from 'react';
import {
  X,
  Heart,
  FileText,
  Volume2,
  VolumeX,
  Gauge,
  PictureInPicture2,
  Radio,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Disc
} from 'lucide-react';
import { PlayerState, Track } from '../../types/music';
import { playerEngine } from '../../services/playerEngine';
import { formatTime } from '../../services/audioMetadata';
import { ClickWheelController } from './ClickWheelController';
import { CURATED_CATALOG } from '../../services/youtubeApi';

interface Props {
  playerState: PlayerState;
  isLiked?: boolean;
  onToggleLike?: () => void;
  onClose: () => void;
  onOpenQueue?: () => void;
  onOpenLyrics?: () => void;
}

export const ExpandedPlayer: React.FC<Props> = ({
  playerState,
  isLiked = false,
  onToggleLike,
  onClose,
  onOpenLyrics
}) => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    shuffleMode,
    repeatMode,
    playbackRate,
    queue
  } = playerState;

  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [useWheelMode, setUseWheelMode] = useState(false);

  if (!currentTrack) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const remainingSeconds = Math.max(0, duration - currentTime);
  const rates = [0.75, 1.0, 1.25, 1.5, 2.0];

  const displayTracks: Track[] =
    queue && queue.length > 2 ? queue : CURATED_CATALOG.slice(0, 14);

  return (
    <div
      id="expanded-player-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-8 bg-black/85 backdrop-blur-2xl transition-opacity animate-in fade-in select-none"
      onClick={onClose}
    >
      {/* Outer Grand Container matching dark audiophile aesthetic */}
      <div
        id="audiophile-player-stage"
        className="relative w-full max-w-5xl h-full max-h-[92vh] flex flex-col md:flex-row rounded-[32px] bg-[#18181A] border border-white/[0.08] shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden text-[#F1EEE7]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Floating Controls Bar */}
        <div className="absolute top-4 right-5 z-30 flex items-center gap-2">
          {/* Controller Mode Toggle (Buttons vs Wheel) */}
          <button
            aria-label="Toggle player layout"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#202022] border border-white/[0.08] text-xs font-semibold text-[#B4B1AB] hover:text-[#F1EEE7] hover:bg-[#262628] transition shadow-sm"
            onClick={() => setUseWheelMode(!useWheelMode)}
            title="Toggle between minimal buttons and classic wheel"
          >
            <Disc className="w-3.5 h-3.5 text-[#C7B5FF]" />
            <span>{useWheelMode ? 'Buttons' : 'Wheel'}</span>
          </button>

          {/* Speed Selector */}
          <div className="relative">
            <button
              id="player-speed-btn"
              aria-label="Playback speed"
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#202022] border border-white/[0.08] text-xs font-semibold text-[#B4B1AB] hover:text-[#F1EEE7] hover:bg-[#262628] transition shadow-sm"
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
            >
              <Gauge className="w-3.5 h-3.5" />
              <span>{playbackRate}x</span>
            </button>
            {showSpeedMenu && (
              <div className="absolute top-full mt-2 right-0 rounded-2xl bg-[#202022] border border-white/[0.08] p-1.5 shadow-2xl z-40 flex flex-col gap-0.5 text-xs min-w-20 backdrop-blur-xl">
                {rates.map((r) => (
                  <button
                    key={r}
                    className={`px-3 py-1.5 rounded-xl text-left transition ${
                      playbackRate === r
                        ? 'bg-[#F1EEE7] text-[#151515] font-bold'
                        : 'text-[#B4B1AB] hover:text-[#F1EEE7] hover:bg-white/[0.06]'
                    }`}
                    onClick={() => {
                      playerEngine.setPlaybackRate(r);
                      setShowSpeedMenu(false);
                    }}
                  >
                    {r}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Lyrics Trigger */}
          {onOpenLyrics && (
            <button
              id="player-lyrics-btn"
              aria-label="Show lyrics"
              className="p-2 rounded-full bg-[#202022] border border-white/[0.08] text-[#B4B1AB] hover:text-[#F1EEE7] hover:bg-[#262628] transition"
              onClick={onOpenLyrics}
              title="Lyrics"
            >
              <FileText className="w-4 h-4" />
            </button>
          )}

          {/* Picture in Picture */}
          {playerEngine.isPictureInPictureSupported() && (
            <button
              id="player-pip-btn"
              aria-label="Toggle floating player"
              className={`p-2 rounded-full bg-[#202022] border border-white/[0.08] transition ${
                playerState.isPipActive
                  ? 'text-[#F1EEE7] bg-white/20'
                  : 'text-[#B4B1AB] hover:text-[#F1EEE7] hover:bg-[#262628]'
              }`}
              onClick={() => playerEngine.togglePictureInPicture()}
              title="Floating Player"
            >
              <PictureInPicture2 className="w-4 h-4" />
            </button>
          )}

          {/* Close button */}
          <button
            id="player-close-btn"
            aria-label="Close player"
            className="p-2 rounded-full bg-[#202022] border border-white/[0.08] text-[#B4B1AB] hover:text-[#F1EEE7] hover:bg-[#262628] transition"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* LEFT COLUMN: The Audiophile Player Card */}
        <div
          id="audiophile-player-panel"
          className="w-full md:w-[460px] lg:w-[480px] h-full flex flex-col justify-between p-6 sm:p-8 bg-[#1B1B1D] border-b md:border-b-0 md:border-r border-white/[0.06] shrink-0 overflow-y-auto no-scrollbar select-none"
        >
          {/* Top: Album Artwork & Info */}
          <div className="flex flex-col items-center">
            <div className="relative w-full max-w-[260px] sm:max-w-[290px] aspect-square rounded-[28px] overflow-hidden bg-[#151515] shadow-2xl border border-white/[0.08]">
              {currentTrack.artworkUrl ? (
                <img
                  src={currentTrack.artworkUrl}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-[#151515] text-[#77756F]">
                  <Radio className="w-16 h-16 opacity-50" />
                </div>
              )}
            </div>

            {/* Track Title & Artist */}
            <div className="mt-5 text-center w-full px-4">
              <h2 className="text-2xl sm:text-[24px] font-bold tracking-tight text-[#F1EEE7] truncate font-['Plus_Jakarta_Sans',sans-serif]">
                {currentTrack.title}
              </h2>
              <p className="text-sm font-normal text-[#B4B1AB] mt-1 truncate">
                {currentTrack.artist}
              </p>
            </div>
          </div>

          {/* Middle: Seeker / Progress Bar */}
          <div className="my-4 w-full max-w-[340px] mx-auto">
            <div
              className="relative w-full h-1.5 bg-[#262628] rounded-full cursor-pointer py-1 group flex items-center"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickPos = (e.clientX - rect.left) / rect.width;
                playerEngine.seek(clickPos * duration);
              }}
            >
              <div className="w-full h-1.5 bg-[#262628] rounded-full relative overflow-visible">
                <div
                  className="h-full bg-gradient-to-r from-[#B4B1AB] to-[#C7B5FF] rounded-full relative"
                  style={{ width: `${progressPercent}%` }}
                >
                  <div
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#F1EEE7] shadow-md transition-transform group-hover:scale-110"
                    style={{ transform: 'translate(50%, -50%)' }}
                  />
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="flex items-center justify-between text-xs font-mono text-[#77756F] mt-1.5 tabular-nums">
              <span>{formatTime(currentTime)}</span>
              <span>-{formatTime(remainingSeconds)}</span>
            </div>
          </div>

          {/* Controls: Standard Minimal Audiophile Row OR Wheel */}
          {useWheelMode ? (
            <div className="flex flex-col items-center justify-center pb-2">
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
                size={230}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center gap-5 sm:gap-6 py-2">
              {/* Shuffle */}
              <button
                aria-label="Toggle shuffle"
                className={`p-2.5 rounded-full transition ${
                  shuffleMode ? 'text-[#C7B5FF] bg-white/[0.06]' : 'text-[#77756F] hover:text-[#B4B1AB]'
                }`}
                onClick={() => playerEngine.toggleShuffle()}
              >
                <Shuffle className="w-5 h-5 stroke-[2]" />
              </button>

              {/* Prev */}
              <button
                aria-label="Previous track"
                className="p-2.5 rounded-full text-[#B4B1AB] hover:text-[#F1EEE7] transition"
                onClick={() => playerEngine.previousTrack()}
              >
                <SkipBack className="w-6 h-6 fill-current stroke-0" />
              </button>

              {/* Prominent Circular Off-White Play/Pause Button */}
              <button
                id="expanded-play-btn"
                aria-label={isPlaying ? 'Pause' : 'Play'}
                className="w-16 h-16 rounded-full bg-[#F1EEE7] text-[#151515] flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all shrink-0"
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

              {/* Next */}
              <button
                aria-label="Next track"
                className="p-2.5 rounded-full text-[#B4B1AB] hover:text-[#F1EEE7] transition"
                onClick={() => playerEngine.nextTrack()}
              >
                <SkipForward className="w-6 h-6 fill-current stroke-0" />
              </button>

              {/* Repeat */}
              <button
                aria-label="Toggle repeat"
                className={`p-2.5 rounded-full transition ${
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

          {/* Volume Slider & Like Button on bottom row */}
          <div className="flex items-center justify-between px-4 pt-3 border-t border-white/[0.06]">
            <div className="flex items-center gap-2">
              <button
                aria-label={isMuted ? 'Unmute' : 'Mute'}
                className="text-[#77756F] hover:text-[#F1EEE7] p-1 transition"
                onClick={() => playerEngine.toggleMute()}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => playerEngine.setVolume(parseFloat(e.target.value))}
                className="w-24 h-1 bg-[#262628] rounded-lg appearance-none cursor-pointer accent-[#C7B5FF]"
                aria-label="Volume slider"
              />
            </div>

            {onToggleLike && (
              <button
                aria-label={isLiked ? 'Unlike song' : 'Like song'}
                className={`p-2 rounded-full transition ${
                  isLiked ? 'text-rose-500 fill-current' : 'text-[#77756F] hover:text-[#F1EEE7]'
                }`}
                onClick={onToggleLike}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Numbered Tracklist & Album Queue */}
        <div
          id="queue-tracklist-panel"
          className="flex-1 flex flex-col justify-between p-6 sm:p-8 bg-[#18181A] overflow-hidden"
        >
          {/* Header Label */}
          <div className="flex items-center justify-between pb-4 shrink-0 border-b border-white/[0.04]">
            <span className="text-xs font-bold uppercase tracking-widest text-[#77756F] font-mono">
              Tracklist Queue
            </span>
            <span className="text-xs text-[#77756F] font-mono">
              {displayTracks.length} Tracks
            </span>
          </div>

          {/* Scrollable Numbered Tracks List */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-2 py-3 no-scrollbar">
            {displayTracks.map((track, idx) => {
              const isCurrent = currentTrack.id === track.id;
              const trackNumber = idx + 1;

              return (
                <div
                  key={`${track.id}-${idx}`}
                  id={`tracklist-item-${track.id}`}
                  className={`group flex items-center transition-all duration-150 cursor-pointer ${
                    isCurrent
                      ? 'p-3 rounded-2xl bg-[#202022] border border-[#C7B5FF]/30 shadow-md'
                      : 'p-2.5 rounded-2xl hover:bg-[#202022] border border-transparent'
                  }`}
                  onClick={() => playerEngine.playTrack(track)}
                >
                  {/* Big Number */}
                  <span
                    className={`w-9 text-base sm:text-lg font-bold font-mono shrink-0 ${
                      isCurrent ? 'text-[#C7B5FF]' : 'text-[#77756F] group-hover:text-[#B4B1AB]'
                    }`}
                  >
                    {trackNumber}
                  </span>

                  {/* Title & Artist */}
                  <div className="min-w-0 flex-1 pr-3">
                    <h4
                      className={`text-sm sm:text-base font-semibold truncate leading-tight ${
                        isCurrent ? 'text-[#F1EEE7] font-bold' : 'text-[#F1EEE7]'
                      }`}
                    >
                      {track.title}
                    </h4>
                    <p
                      className={`text-xs truncate mt-0.5 ${
                        isCurrent ? 'text-[#C7B5FF]' : 'text-[#77756F] group-hover:text-[#B4B1AB]'
                      }`}
                    >
                      {track.artist}
                    </p>
                  </div>

                  {/* Duration */}
                  <span className="text-xs font-mono text-[#77756F] shrink-0">
                    {formatTime(track.duration)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Bottom Mini Status Bar */}
          <div className="pt-3 border-t border-white/[0.04] shrink-0 flex items-center justify-between text-xs text-[#77756F]">
            <span className="font-mono">Audiophile High-Fidelity Output</span>
            <span className="text-[#C7B5FF] font-mono font-semibold">24-bit • 48 kHz</span>
          </div>
        </div>
      </div>
    </div>
  );
};
