import React, { useState } from 'react';
import { Play, Pause, MoreVertical, Heart, Radio, Volume2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Track } from '../../types/music';

interface Props {
  track: Track;
  isPlayingCurrent: boolean;
  isLiked?: boolean;
  onPlay: () => void;
  onPause: () => void;
  onToggleLike?: () => void;
  onAddToQueue?: () => void;
  onPlayNext?: () => void;
}

export const TrackCard: React.FC<Props> = ({
  track,
  isPlayingCurrent,
  isLiked = false,
  onPlay,
  onPause,
  onToggleLike,
  onAddToQueue,
  onPlayNext
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <motion.div
      id={`track-card-${track.id}`}
      className={`group relative flex flex-col p-3 rounded-2xl bg-[#1B1B1D] hover:bg-[#202022] border transition-all duration-200 cursor-pointer select-none w-44 sm:w-48 shrink-0 ${
        isPlayingCurrent
          ? 'border-[#C7B5FF]/30 shadow-lg shadow-black/60 bg-[#202022]'
          : 'border-white/[0.06] hover:border-white/[0.12] shadow-md shadow-black/40'
      }`}
      onClick={isPlayingCurrent ? onPause : onPlay}
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
    >
      {/* Artwork container */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#151515] mb-3 shadow-inner">
        {track.artworkUrl ? (
          <img
            src={track.artworkUrl}
            alt={track.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#18181A] text-[#77756F]">
            <Radio className="w-10 h-10 opacity-70" />
          </div>
        )}

        {/* Source Badge */}
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-semibold tracking-wider uppercase bg-[#151515]/85 backdrop-blur-md text-[#B4B1AB] border border-white/[0.06] font-mono">
          {track.source === 'local' ? 'Local' : track.source === 'youtube' ? 'YouTube' : 'Studio'}
        </div>

        {/* Playing Status Badge */}
        {isPlayingCurrent && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider bg-[#C7B5FF] text-[#151515] flex items-center gap-1 shadow-md font-mono">
            <Volume2 className="w-3 h-3 animate-pulse" />
            <span>Playing</span>
          </div>
        )}

        {/* Circular Audiophile Play / Pause Button */}
        <motion.button
          id={`card-play-btn-${track.id}`}
          aria-label={isPlayingCurrent ? 'Pause track' : 'Play track'}
          className={`absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 border border-white/10 ${
            isPlayingCurrent
              ? 'bg-[#F1EEE7] text-[#151515] shadow-lg scale-100 opacity-100'
              : 'bg-[#F1EEE7] text-[#151515] opacity-0 translate-y-1.5 group-hover:opacity-100 group-hover:translate-y-0 shadow-lg'
          }`}
          style={{
            aspectRatio: '1 / 1',
            borderRadius: '50%',
            flexShrink: 0,
            display: 'grid',
            placeItems: 'center'
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (isPlayingCurrent) onPause();
            else onPlay();
          }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
        >
          {isPlayingCurrent ? (
            <Pause className="w-4 h-4 fill-current stroke-0" />
          ) : (
            <Play className="w-4 h-4 fill-current stroke-0 ml-0.5" />
          )}
        </motion.button>
      </div>

      {/* Title & Artist */}
      <div className="flex items-start justify-between gap-1">
        <div className="min-w-0 flex-1">
          <h4 className={`text-sm font-semibold truncate leading-tight ${isPlayingCurrent ? 'text-[#F1EEE7] font-bold' : 'text-[#F1EEE7] group-hover:text-white'}`}>
            {track.title}
          </h4>
          <p className="text-xs text-[#77756F] group-hover:text-[#B4B1AB] truncate mt-1 transition-colors">
            {track.artist}
          </p>
        </div>

        {/* Context Menu Button */}
        <div className="relative">
          <button
            id={`card-menu-btn-${track.id}`}
            aria-label="Track options"
            className="p-1 rounded-lg text-[#77756F] hover:text-[#F1EEE7] hover:bg-white/[0.06] opacity-0 group-hover:opacity-100 transition"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <div
              className="absolute right-0 bottom-full mb-1 w-44 rounded-xl bg-[#202022] border border-white/[0.08] shadow-2xl p-1.5 z-40 text-xs text-[#F1EEE7] backdrop-blur-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {onToggleLike && (
                <button
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/[0.06] text-left transition text-[#B4B1AB] hover:text-[#F1EEE7]"
                  onClick={() => {
                    onToggleLike();
                    setShowMenu(false);
                  }}
                >
                  <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                  {isLiked ? 'Remove from Liked' : 'Like Song'}
                </button>
              )}
              {onPlayNext && (
                <button
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/[0.06] text-left transition text-[#B4B1AB] hover:text-[#F1EEE7]"
                  onClick={() => {
                    onPlayNext();
                    setShowMenu(false);
                  }}
                >
                  <Play className="w-3.5 h-3.5" />
                  Play Next
                </button>
              )}
              {onAddToQueue && (
                <button
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/[0.06] text-left transition text-[#B4B1AB] hover:text-[#F1EEE7]"
                  onClick={() => {
                    onAddToQueue();
                    setShowMenu(false);
                  }}
                >
                  Add to Queue
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
