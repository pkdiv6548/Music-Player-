import React, { useState } from 'react';
import { Play, Pause, Heart, MoreVertical, Plus, ListPlus, Trash2, Radio } from 'lucide-react';
import { Track } from '../../types/music';
import { formatTime, formatBytes } from '../../services/audioMetadata';

interface Props {
  track: Track;
  index: number;
  isPlayingCurrent: boolean;
  isLiked?: boolean;
  onPlay: () => void;
  onPause: () => void;
  onToggleLike?: () => void;
  onAddToQueue?: () => void;
  onPlayNext?: () => void;
  onRemove?: () => void;
  showIndex?: boolean;
}

export const TrackRow: React.FC<Props> = ({
  track,
  index,
  isPlayingCurrent,
  isLiked = false,
  onPlay,
  onPause,
  onToggleLike,
  onAddToQueue,
  onPlayNext,
  onRemove,
  showIndex = true
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      id={`track-row-${track.id}`}
      className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#202022] transition-colors duration-150 select-none cursor-pointer border ${
        isPlayingCurrent
          ? 'bg-[#202022] border-[#C7B5FF]/30'
          : 'border-transparent hover:border-white/[0.04]'
      }`}
      onClick={isPlayingCurrent ? onPause : onPlay}
    >
      {/* Index or Animated Equalizer */}
      {showIndex && (
        <div className="w-6 text-center text-xs font-medium text-[#77756F] shrink-0 font-mono">
          {isPlayingCurrent ? (
            <div className="flex items-end justify-center gap-0.5 h-3.5">
              <span className="w-1 bg-[#C7B5FF] rounded-full animate-bounce [animation-delay:-0.3s] h-3" />
              <span className="w-1 bg-[#C7B5FF] rounded-full animate-bounce [animation-delay:-0.15s] h-2" />
              <span className="w-1 bg-[#C7B5FF] rounded-full animate-bounce h-3.5" />
            </div>
          ) : (
            <span className="group-hover:hidden">{index + 1}</span>
          )}
          {!isPlayingCurrent && (
            <button
              aria-label="Play track"
              className="hidden group-hover:inline-flex items-center justify-center text-[#B4B1AB] hover:text-[#F1EEE7]"
            >
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            </button>
          )}
        </div>
      )}

      {/* Thumbnail */}
      <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-[#151515] shrink-0 shadow-sm border border-white/[0.04]">
        {track.artworkUrl ? (
          <img src={track.artworkUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#1B1B1D] text-[#77756F]">
            <Radio className="w-5 h-5 opacity-60" />
          </div>
        )}
        {isPlayingCurrent && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Pause className="w-4 h-4 text-[#F1EEE7] fill-current" />
          </div>
        )}
      </div>

      {/* Title & Artist */}
      <div className="min-w-0 flex-1">
        <h5 className={`text-sm font-semibold truncate leading-tight ${isPlayingCurrent ? 'text-[#F1EEE7] font-bold' : 'text-[#F1EEE7] group-hover:text-white'}`}>
          {track.title}
        </h5>
        <div className="flex items-center gap-2 text-xs text-[#77756F] group-hover:text-[#B4B1AB] truncate mt-0.5 transition-colors">
          <span className="truncate">{track.artist}</span>
          {track.album && (
            <>
              <span className="text-[#4D4D50] hidden sm:inline">•</span>
              <span className="truncate hidden sm:inline text-[#77756F]">{track.album}</span>
            </>
          )}
        </div>
      </div>

      {/* Metadata pill for format/size if local */}
      {track.source === 'local' && (
        <div className="hidden md:flex items-center gap-1.5 text-[10px] text-[#77756F] shrink-0">
          <span className="px-1.5 py-0.5 rounded bg-[#262628] border border-white/[0.06] font-mono uppercase">
            {track.format || 'AUDIO'}
          </span>
          {track.size && <span className="font-mono">{formatBytes(track.size)}</span>}
        </div>
      )}

      {/* Duration */}
      <div className="text-xs text-[#77756F] font-mono tabular-nums shrink-0">
        {formatTime(track.duration)}
      </div>

      {/* Like Button */}
      {onToggleLike && (
        <button
          id={`row-like-btn-${track.id}`}
          aria-label={isLiked ? 'Unlike song' : 'Like song'}
          className={`p-1.5 rounded-lg transition-colors shrink-0 ${
            isLiked ? 'text-rose-500' : 'text-[#77756F] hover:text-[#F1EEE7] opacity-0 group-hover:opacity-100'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleLike();
          }}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
        </button>
      )}

      {/* Context Menu */}
      <div className="relative shrink-0">
        <button
          id={`row-menu-btn-${track.id}`}
          aria-label="More options"
          className="p-1.5 rounded-lg text-[#77756F] hover:text-[#F1EEE7] hover:bg-white/[0.06] opacity-0 group-hover:opacity-100 transition"
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {showMenu && (
          <div
            className="absolute right-0 top-full mt-1 w-44 rounded-xl bg-[#202022] border border-white/[0.08] shadow-2xl p-1 z-40 text-xs text-[#F1EEE7] backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {onPlayNext && (
              <button
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/[0.06] text-[#B4B1AB] hover:text-[#F1EEE7] text-left transition"
                onClick={() => {
                  onPlayNext();
                  setShowMenu(false);
                }}
              >
                <ListPlus className="w-3.5 h-3.5" />
                Play Next
              </button>
            )}
            {onAddToQueue && (
              <button
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/[0.06] text-[#B4B1AB] hover:text-[#F1EEE7] text-left transition"
                onClick={() => {
                  onAddToQueue();
                  setShowMenu(false);
                }}
              >
                <Plus className="w-3.5 h-3.5" />
                Add to Queue
              </button>
            )}
            {onRemove && (
              <button
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-rose-500/20 text-rose-400 text-left transition"
                onClick={() => {
                  onRemove();
                  setShowMenu(false);
                }}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
