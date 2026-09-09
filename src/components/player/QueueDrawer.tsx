import React from 'react';
import { X, Trash2, Radio, Play, Pause, GripVertical, ArrowUp, ArrowDown } from 'lucide-react';
import { PlayerState } from '../../types/music';
import { playerEngine } from '../../services/playerEngine';
import { formatTime } from '../../services/audioMetadata';
import { CURATED_CATALOG } from '../../services/youtubeApi';

interface Props {
  playerState: PlayerState;
  isOpen: boolean;
  onClose: () => void;
}

export const QueueDrawer: React.FC<Props> = ({ playerState, isOpen, onClose }) => {
  const { currentTrack, queue, queueIndex, isPlaying } = playerState;

  if (!isOpen) return null;

  const upNextTracks = queue.slice(queueIndex + 1);

  return (
    <div
      id="queue-drawer-backdrop"
      className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-md transition-opacity select-none"
      onClick={onClose}
    >
      <div
        id="queue-drawer-panel"
        className="relative w-full max-w-md h-full bg-[#18181A] border-l border-white/[0.08] shadow-2xl flex flex-col p-4 sm:p-6 overflow-hidden animate-in slide-in-from-right duration-250 text-[#F1EEE7]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] shrink-0">
          <div>
            <span className="text-[10px] font-semibold tracking-widest uppercase text-[#C7B5FF] font-mono">
              PLAYLIST QUEUE
            </span>
            <h3 className="text-2xl font-bold text-[#F1EEE7] tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">Your Queue</h3>
            <p className="text-xs text-[#77756F] mt-0.5 font-mono">
              {queue.length} track{queue.length === 1 ? '' : 's'} queued
            </p>
          </div>
          <div className="flex items-center gap-2">
            {queue.length > 1 && (
              <button
                id="queue-clear-btn"
                aria-label="Clear queue"
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#202022] hover:bg-rose-500/20 text-xs font-semibold text-[#77756F] hover:text-rose-400 border border-white/[0.08] transition active:scale-95"
                onClick={() => playerEngine.clearQueue()}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
            <button
              id="queue-close-btn"
              aria-label="Close queue drawer"
              className="p-2 rounded-full text-[#77756F] hover:text-[#F1EEE7] hover:bg-white/[0.06] transition"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 no-scrollbar">
          {/* Now Playing Section */}
          {currentTrack && (
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#C7B5FF] block mb-2 font-mono">
                Currently Playing
              </span>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#202022] border border-white/[0.08] shadow-md">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#151515] shrink-0 border border-white/[0.04]">
                    {currentTrack.artworkUrl ? (
                      <img src={currentTrack.artworkUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#77756F]">
                        <Radio className="w-6 h-6" />
                      </div>
                    )}
                    {isPlaying && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="flex items-end gap-0.5 h-3.5">
                          <span className="w-1 bg-[#C7B5FF] rounded-full animate-bounce [animation-delay:-0.3s] h-3" />
                          <span className="w-1 bg-[#C7B5FF] rounded-full animate-bounce [animation-delay:-0.15s] h-2" />
                          <span className="w-1 bg-[#C7B5FF] rounded-full animate-bounce h-3.5" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-[#F1EEE7] truncate">
                      {currentTrack.title}
                    </h4>
                    <p className="text-xs text-[#77756F] truncate mt-0.5">
                      {currentTrack.artist}
                    </p>
                  </div>
                </div>

                <button
                  id="drawer-active-play-btn"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                  className="w-10 h-10 rounded-full bg-[#F1EEE7] text-[#151515] flex items-center justify-center shadow-lg shrink-0 active:scale-95 transition"
                  style={{
                    aspectRatio: '1 / 1',
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center'
                  }}
                  onClick={() => playerEngine.togglePlayPause()}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-current stroke-0" />
                  ) : (
                    <Play className="w-4 h-4 fill-current stroke-0 ml-0.5" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Up Next List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#77756F] font-mono">
                Up Next ({upNextTracks.length})
              </span>
            </div>

            {upNextTracks.length === 0 ? (
              <div className="py-8 text-center text-[#77756F] bg-[#1B1B1D] rounded-2xl border border-white/[0.04]">
                <p className="text-xs">Your queue is empty</p>
                <p className="text-[11px] text-[#4D4D50] mt-1">
                  Add tracks from explore or your library
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {upNextTracks.map((track, idx) => {
                  const actualIndex = queueIndex + 1 + idx;
                  return (
                    <div
                      key={`${track.id}-${idx}`}
                      className="group flex items-center justify-between p-2.5 rounded-2xl bg-[#1B1B1D] hover:bg-[#202022] border border-white/[0.04] transition-all cursor-pointer"
                      onClick={() => playerEngine.skipToQueueIndex(actualIndex)}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <GripVertical className="w-4 h-4 text-[#4D4D50] group-hover:text-[#B4B1AB] shrink-0" />
                        <div className="w-11 h-11 rounded-xl overflow-hidden bg-[#151515] shrink-0 border border-white/[0.04]">
                          {track.artworkUrl ? (
                            <img src={track.artworkUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#77756F]">
                              <Radio className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1 pr-2">
                          <h5 className="text-sm font-semibold text-[#F1EEE7] truncate">
                            {track.title}
                          </h5>
                          <p className="text-xs text-[#77756F] truncate mt-0.5">
                            {track.artist}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-xs text-[#77756F] font-mono mr-1">
                          {formatTime(track.duration)}
                        </span>
                        <div className="opacity-0 group-hover:opacity-100 flex items-center transition">
                          {idx > 0 && (
                            <button
                              aria-label="Move up"
                              className="p-1 text-[#77756F] hover:text-[#F1EEE7]"
                              onClick={(e) => {
                                e.stopPropagation();
                                playerEngine.reorderQueue(actualIndex, actualIndex - 1);
                              }}
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {idx < upNextTracks.length - 1 && (
                            <button
                              aria-label="Move down"
                              className="p-1 text-[#77756F] hover:text-[#F1EEE7]"
                              onClick={(e) => {
                                e.stopPropagation();
                                playerEngine.reorderQueue(actualIndex, actualIndex + 1);
                              }}
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            aria-label="Remove from queue"
                            className="p-1 text-[#77756F] hover:text-rose-400"
                            onClick={(e) => {
                              e.stopPropagation();
                              playerEngine.removeFromQueue(actualIndex);
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recommended Session Banner Card */}
          <div className="pt-2">
            <span className="text-[10px] font-semibold tracking-widest uppercase text-[#77756F] block mb-2 font-mono">
              CURATED MASTER
            </span>
            <div
              className="relative overflow-hidden rounded-2xl bg-[#202022] border border-white/[0.08] p-4 cursor-pointer shadow-lg group hover:border-[#C7B5FF]/30 transition"
              onClick={() => {
                const sample = CURATED_CATALOG.find((c) => c.id === 'liquid-6') || CURATED_CATALOG[1];
                if (sample) playerEngine.playTrack(sample);
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#C7B5FF] font-mono">
                    Curated Session
                  </span>
                  <h4 className="text-base font-bold text-[#F1EEE7] mt-0.5">
                    Deep Bass Sessions
                  </h4>
                  <p className="text-xs text-[#77756F] mt-0.5">
                    Audiophile high-frequency dynamics
                  </p>
                </div>
                <div
                  className="w-10 h-10 rounded-full bg-[#F1EEE7] text-[#151515] flex items-center justify-center shadow-lg shrink-0 group-hover:scale-105 transition"
                  style={{ aspectRatio: '1 / 1', borderRadius: '50%', display: 'grid', placeItems: 'center' }}
                >
                  <Play className="w-4 h-4 fill-current stroke-0 ml-0.5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
