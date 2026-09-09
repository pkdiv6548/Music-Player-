import React from 'react';
import { Heart, Play, Shuffle } from 'lucide-react';
import { Track, PlayerState } from '../../types/music';
import { TrackRow } from '../common/TrackRow';
import { playerEngine } from '../../services/playerEngine';

interface Props {
  playerState: PlayerState;
  likedTracks: Track[];
  onToggleLike: (track: Track) => void;
}

export const LikedSongsView: React.FC<Props> = ({ playerState, likedTracks, onToggleLike }) => {
  return (
    <div id="liked-songs-view-container" className="space-y-8 pb-36 md:pb-28 select-none">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 p-6 sm:p-8 rounded-[28px] bg-[#1B1B1D] border border-white/[0.08] shadow-2xl">
        <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-[24px] bg-[#151515] border border-white/[0.06] flex items-center justify-center text-rose-400 shrink-0 shadow-xl">
          <Heart className="w-16 h-16 sm:w-20 sm:h-20 fill-current" />
        </div>
        <div className="space-y-2 text-center sm:text-left flex-1 min-w-0">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#C7B5FF] font-mono">
            Saved Collection
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold text-[#F1EEE7] tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
            Liked Songs
          </h1>
          <p className="text-xs sm:text-sm text-[#77756F] font-mono">
            {likedTracks.length} favorite track{likedTracks.length === 1 ? '' : 's'} saved locally
          </p>

          {likedTracks.length > 0 && (
            <div className="flex items-center justify-center sm:justify-start gap-3 pt-3">
              <button
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#F1EEE7] hover:bg-[#EAE6DF] text-[#151515] text-xs sm:text-sm font-bold shadow-lg transition active:scale-95 cursor-pointer"
                onClick={() => playerEngine.playTrack(likedTracks[0], likedTracks)}
              >
                <Play className="w-4 h-4 fill-current stroke-0 ml-0.5" />
                <span>Play All</span>
              </button>
              <button
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#202022] hover:bg-[#262628] text-[#F1EEE7] text-xs sm:text-sm font-semibold border border-white/[0.08] transition active:scale-95 cursor-pointer"
                onClick={() => {
                  playerEngine.toggleShuffle();
                  const rand = Math.floor(Math.random() * likedTracks.length);
                  playerEngine.playTrack(likedTracks[rand], likedTracks);
                }}
              >
                <Shuffle className="w-4 h-4 stroke-[2]" />
                <span>Shuffle</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* List */}
      {likedTracks.length === 0 ? (
        <div className="text-center py-16 rounded-[24px] bg-[#1B1B1D] border border-white/[0.06]">
          <Heart className="w-12 h-12 text-[#77756F] mx-auto mb-3 opacity-40" />
          <h3 className="text-base font-semibold text-[#F1EEE7]">No liked songs yet</h3>
          <p className="text-xs text-[#77756F] mt-1 max-w-sm mx-auto">
            Tap the heart icon on any song to save it to your favorite collection.
          </p>
        </div>
      ) : (
        <div className="space-y-1.5 w-full">
          {likedTracks.map((track, idx) => (
            <TrackRow
              key={`liked-tr-${track.id}`}
              track={track}
              index={idx}
              isPlayingCurrent={playerState.isPlaying && playerState.currentTrack?.id === track.id}
              isLiked={true}
              onPlay={() => playerEngine.playTrack(track, likedTracks)}
              onPause={() => playerEngine.pause()}
              onToggleLike={() => onToggleLike(track)}
              onAddToQueue={() => playerEngine.addToQueue(track)}
              onPlayNext={() => playerEngine.playNext(track)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
