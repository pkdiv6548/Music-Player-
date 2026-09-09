import React from 'react';
import { Play, Pause, SkipForward, Heart, Radio, Volume2, VolumeX, PictureInPicture2 } from 'lucide-react';
import { PlayerState } from '../../types/music';
import { playerEngine } from '../../services/playerEngine';
import { formatTime } from '../../services/audioMetadata';

interface Props {
  playerState: PlayerState;
  isLiked?: boolean;
  onToggleLike?: () => void;
  onExpand: () => void;
}

export const MiniPlayer: React.FC<Props> = ({
  playerState,
  isLiked = false,
  onToggleLike,
  onExpand
}) => {
  const { currentTrack, isPlaying, currentTime, duration, volume, isMuted, buffering } = playerState;

  if (!currentTrack) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const remainingSeconds = Math.max(0, duration - currentTime);

  return (
    <div
      id="mini-player-bar"
      className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] md:bottom-0 left-0 right-0 z-[45] bg-[#18181A]/95 md:bg-[#1B1B1D]/95 backdrop-blur-2xl border-t border-white/[0.06] select-none shadow-[0_-8px_24px_rgba(0,0,0,0.6)] transition-all md:pb-[env(safe-area-inset-bottom,0px)] text-[#F1EEE7]"
    >
      {/* Minimal Audiophile Progress Line */}
      <div
        className="relative w-full h-1 bg-[#262628] cursor-pointer group"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickPos = (e.clientX - rect.left) / rect.width;
          playerEngine.seek(clickPos * duration);
        }}
      >
        <div
          className="h-full bg-gradient-to-r from-[#B4B1AB] to-[#C7B5FF] relative transition-all duration-100"
          style={{ width: `${progressPercent}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#F1EEE7] opacity-0 group-hover:opacity-100 shadow-md transition-opacity" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-5 py-2.5 flex items-center justify-between gap-3">
        {/* Track Details & Artwork (Click to expand) */}
        <div
          className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer group"
          onClick={onExpand}
          id="mini-player-expand-trigger"
        >
          <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-[#151515] border border-white/[0.06] shrink-0 shadow-md">
            {currentTrack.artworkUrl ? (
              <img
                src={currentTrack.artworkUrl}
                alt=""
                className={`w-full h-full object-cover transition-transform duration-500 ${isPlaying ? 'scale-105' : 'scale-100'}`}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#202022] text-[#77756F]">
                <Radio className="w-5 h-5" />
              </div>
            )}
            {buffering && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white/30 border-t-[#C7B5FF] rounded-full animate-spin" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs sm:text-sm font-semibold text-[#F1EEE7] truncate group-hover:text-[#C7B5FF] transition-colors">
              {currentTrack.title}
            </h4>
            <div className="flex items-center gap-2 text-[11px] text-[#77756F] truncate mt-0.5">
              <span className="truncate">{currentTrack.artist}</span>
              <span className="hidden sm:inline text-[#4D4D50]">•</span>
              <span className="hidden sm:inline font-mono tabular-nums">
                {formatTime(currentTime)} / -{formatTime(remainingSeconds)}
              </span>
            </div>
          </div>
        </div>

        {/* Center/Right Playback Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Like Button */}
          {onToggleLike && (
            <button
              id="mini-player-like-btn"
              aria-label={isLiked ? 'Unlike track' : 'Like track'}
              className={`p-2 rounded-xl transition-colors ${
                isLiked ? 'text-rose-500' : 'text-[#77756F] hover:text-[#F1EEE7]'
              }`}
              onClick={onToggleLike}
            >
              <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isLiked ? 'fill-current' : ''}`} />
            </button>
          )}

          {/* Prominent Circular Audiophile Play/Pause Button */}
          <button
            id="mini-player-play-btn"
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#F1EEE7] text-[#151515] flex items-center justify-center hover:scale-105 active:scale-95 transition-all shrink-0 shadow-md"
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
              <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current stroke-0" />
            ) : (
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current stroke-0 ml-0.5" />
            )}
          </button>

          {/* Skip Next Button */}
          <button
            id="mini-player-next-btn"
            aria-label="Skip next"
            className="p-2 rounded-xl text-[#B4B1AB] hover:text-[#F1EEE7] transition"
            onClick={() => playerEngine.nextTrack()}
          >
            <SkipForward className="w-4 h-4 sm:w-5 sm:h-5 fill-current stroke-0" />
          </button>

          {/* Desktop Volume Slider */}
          <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-white/[0.06]">
            <button
              id="mini-player-mute-btn"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
              className="text-[#77756F] hover:text-[#F1EEE7] transition"
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
              className="w-20 h-1 bg-[#262628] rounded-lg appearance-none cursor-pointer accent-[#C7B5FF]"
              aria-label="Mini player volume slider"
            />
          </div>

          {/* Picture-in-Picture / Pop-out button */}
          {playerEngine.isPictureInPictureSupported() && (
            <button
              id="mini-player-pip-btn"
              aria-label="Floating video player"
              className="hidden sm:flex p-2 rounded-xl text-[#77756F] hover:text-[#F1EEE7] transition"
              onClick={() => playerEngine.togglePictureInPicture()}
              title="Mini Floating Player"
            >
              <PictureInPicture2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
