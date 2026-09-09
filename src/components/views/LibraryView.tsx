import React, { useState } from 'react';
import {
  Plus,
  Heart,
  ListMusic,
  HardDrive,
  History,
  Trash2,
  Play,
  Shuffle,
  Music,
  ArrowLeft
} from 'lucide-react';
import { Playlist, Track, PlayerState } from '../../types/music';
import { TrackRow } from '../common/TrackRow';
import { playerEngine } from '../../services/playerEngine';
import {
  savePlaylistToDB,
  deletePlaylistFromDB
} from '../../services/indexedDb';

interface Props {
  playerState: PlayerState;
  playlists: Playlist[];
  likedTracks: Track[];
  localTracks: Track[];
  onUpdatePlaylists: () => void;
  likedTrackIds: Set<string>;
  onToggleLike: (track: Track) => void;
  activePlaylistProp?: Playlist | null;
}

export const LibraryView: React.FC<Props> = ({
  playerState,
  playlists,
  likedTracks,
  localTracks,
  onUpdatePlaylists,
  likedTrackIds,
  onToggleLike,
  activePlaylistProp
}) => {
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(activePlaylistProp || null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newPl: Playlist = {
      id: `pl-${Date.now()}`,
      title: newTitle.trim(),
      description: newDesc.trim() || undefined,
      tracks: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await savePlaylistToDB(newPl);
    onUpdatePlaylists();
    setNewTitle('');
    setNewDesc('');
    setShowCreateModal(false);
    setSelectedPlaylist(newPl);
  };

  const handleDeletePlaylist = async (id: string) => {
    if (!confirm('Are you sure you want to delete this playlist?')) return;
    await deletePlaylistFromDB(id);
    onUpdatePlaylists();
    if (selectedPlaylist?.id === id) {
      setSelectedPlaylist(null);
    }
  };

  const handleRemoveTrackFromPlaylist = async (trackId: string) => {
    if (!selectedPlaylist) return;
    const updated: Playlist = {
      ...selectedPlaylist,
      tracks: selectedPlaylist.tracks.filter((t) => t.id !== trackId),
      updatedAt: Date.now()
    };
    await savePlaylistToDB(updated);
    setSelectedPlaylist(updated);
    onUpdatePlaylists();
  };

  return (
    <div id="library-view-container" className="w-full space-y-8 pb-36 md:pb-28 select-none">
      {/* Selected Playlist Detailed View */}
      {selectedPlaylist ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Back Button */}
          <div className="flex items-center gap-3">
            <button
              aria-label="Back to library"
              className="p-2.5 rounded-full bg-[#1B1B1D] hover:bg-[#202022] text-[#B4B1AB] hover:text-[#F1EEE7] border border-white/[0.06] transition active:scale-95"
              onClick={() => setSelectedPlaylist(null)}
            >
              <ArrowLeft className="w-5 h-5 stroke-[2]" />
            </button>
            <h2 className="text-xl font-bold text-[#F1EEE7]">Playlist Details</h2>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 p-6 sm:p-8 rounded-[28px] bg-[#1B1B1D] border border-white/[0.08] shadow-2xl">
            <div className="w-36 h-36 rounded-[22px] bg-[#151515] border border-white/[0.06] flex items-center justify-center text-[#C7B5FF] shrink-0 shadow-xl">
              <ListMusic className="w-16 h-16 opacity-80" />
            </div>
            <div className="space-y-2 text-center sm:text-left flex-1 min-w-0">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-[#C7B5FF] font-mono">
                Curated Playlist
              </span>
              <h1 className="text-2xl sm:text-4xl font-bold text-[#F1EEE7] tracking-tight truncate font-['Plus_Jakarta_Sans',sans-serif]">
                {selectedPlaylist.title}
              </h1>
              {selectedPlaylist.description && (
                <p className="text-xs sm:text-sm text-[#77756F]">{selectedPlaylist.description}</p>
              )}
              <p className="text-xs text-[#B4B1AB] font-medium font-mono">
                {selectedPlaylist.tracks.length} track{selectedPlaylist.tracks.length === 1 ? '' : 's'}
              </p>

              {/* Play All & Shuffle Buttons */}
              {selectedPlaylist.tracks.length > 0 && (
                <div className="flex items-center justify-center sm:justify-start gap-3 pt-3">
                  <button
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#F1EEE7] hover:bg-[#EAE6DF] text-[#151515] text-xs sm:text-sm font-bold shadow-lg transition active:scale-95 cursor-pointer"
                    onClick={() => playerEngine.playTrack(selectedPlaylist.tracks[0], selectedPlaylist.tracks)}
                  >
                    <Play className="w-4 h-4 fill-current stroke-0 ml-0.5" />
                    <span>Play All</span>
                  </button>
                  <button
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#202022] hover:bg-[#262628] text-[#F1EEE7] text-xs sm:text-sm font-semibold border border-white/[0.08] transition active:scale-95 cursor-pointer"
                    onClick={() => {
                      playerEngine.toggleShuffle();
                      const rand = Math.floor(Math.random() * selectedPlaylist.tracks.length);
                      playerEngine.playTrack(selectedPlaylist.tracks[rand], selectedPlaylist.tracks);
                    }}
                  >
                    <Shuffle className="w-4 h-4 stroke-[2]" />
                    <span>Shuffle</span>
                  </button>
                  <button
                    aria-label="Delete playlist"
                    className="p-2.5 rounded-full text-[#77756F] hover:text-rose-400 hover:bg-rose-500/10 transition active:scale-95"
                    onClick={() => handleDeletePlaylist(selectedPlaylist.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Tracks List */}
          {selectedPlaylist.tracks.length === 0 ? (
            <div className="text-center py-16 rounded-[24px] bg-[#1B1B1D] border border-white/[0.06]">
              <Music className="w-10 h-10 text-[#77756F] mx-auto mb-3 opacity-60" />
              <p className="text-sm font-semibold text-[#F1EEE7]">No tracks in this playlist yet</p>
              <p className="text-xs text-[#77756F] mt-1">
                Explore music or search tracks, then select "Add to Playlist".
              </p>
            </div>
          ) : (
            <div className="space-y-1.5 w-full">
              {selectedPlaylist.tracks.map((track, idx) => (
                <TrackRow
                  key={`pl-track-${track.id}`}
                  track={track}
                  index={idx}
                  isPlayingCurrent={playerState.isPlaying && playerState.currentTrack?.id === track.id}
                  isLiked={likedTrackIds.has(track.id)}
                  onPlay={() => playerEngine.playTrack(track, selectedPlaylist.tracks)}
                  onPause={() => playerEngine.pause()}
                  onToggleLike={() => onToggleLike(track)}
                  onAddToQueue={() => playerEngine.addToQueue(track)}
                  onPlayNext={() => playerEngine.playNext(track)}
                  onRemove={() => handleRemoveTrackFromPlaylist(track.id)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Library Overview */
        <div className="w-full space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#F1EEE7] tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
                Your Library
              </h1>
              <p className="text-xs text-[#77756F] mt-0.5">
                Playlists, Liked Songs, and Local Audio files
              </p>
            </div>
            <button
              id="library-create-playlist-btn"
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#F1EEE7] hover:bg-[#EAE6DF] text-[#151515] text-xs font-bold shadow-md transition active:scale-95 cursor-pointer"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>New Playlist</span>
            </button>
          </div>

          {/* Quick Hub Cards - full width responsive grid with zero blank space */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full">
            {/* Liked Songs Card */}
            <div
              className="group p-4 sm:p-5 rounded-[22px] bg-[#1B1B1D] border border-white/[0.06] hover:border-white/[0.12] hover:bg-[#202022] transition-all cursor-pointer shadow-md flex items-center justify-between gap-3 w-full"
              onClick={() => {
                if (likedTracks.length > 0) {
                  playerEngine.playTrack(likedTracks[0], likedTracks);
                }
              }}
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div
                  className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0 shadow-lg"
                  style={{ flexShrink: 0 }}
                >
                  <Heart className="w-5 h-5 fill-current" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm sm:text-base font-bold text-[#F1EEE7] transition truncate">
                    Liked Songs
                  </h3>
                  <p className="text-xs text-[#77756F] mt-0.5 truncate font-mono">
                    {likedTracks.length} favorite track{likedTracks.length === 1 ? '' : 's'}
                  </p>
                </div>
              </div>
              <div
                className="w-10 h-10 rounded-full bg-[#262628] group-hover:bg-[#F1EEE7] text-[#B4B1AB] group-hover:text-[#151515] flex items-center justify-center shrink-0 aspect-square shadow-md transition-all group-hover:scale-105"
                style={{ flexShrink: 0, aspectRatio: '1 / 1', borderRadius: '50%', display: 'grid', placeItems: 'center' }}
              >
                <Play className="w-4 h-4 fill-current stroke-0 ml-0.5" />
              </div>
            </div>

            {/* Local Music Card */}
            <div
              className="group p-4 sm:p-5 rounded-[22px] bg-[#1B1B1D] border border-white/[0.06] hover:border-white/[0.12] hover:bg-[#202022] transition-all cursor-pointer shadow-md flex items-center justify-between gap-3 w-full"
              onClick={() => {
                if (localTracks.length > 0) {
                  playerEngine.playTrack(localTracks[0], localTracks);
                }
              }}
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div
                  className="w-12 h-12 rounded-2xl bg-[#C7B5FF]/15 text-[#C7B5FF] border border-[#C7B5FF]/30 flex items-center justify-center shrink-0 shadow-lg"
                  style={{ flexShrink: 0 }}
                >
                  <HardDrive className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm sm:text-base font-bold text-[#F1EEE7] transition truncate">
                    Local Device Audio
                  </h3>
                  <p className="text-xs text-[#77756F] mt-0.5 truncate font-mono">
                    {localTracks.length} offline track{localTracks.length === 1 ? '' : 's'}
                  </p>
                </div>
              </div>
              <div
                className="w-10 h-10 rounded-full bg-[#262628] group-hover:bg-[#F1EEE7] text-[#B4B1AB] group-hover:text-[#151515] flex items-center justify-center shrink-0 aspect-square shadow-md transition-all group-hover:scale-105"
                style={{ flexShrink: 0, aspectRatio: '1 / 1', borderRadius: '50%', display: 'grid', placeItems: 'center' }}
              >
                <Play className="w-4 h-4 fill-current stroke-0 ml-0.5" />
              </div>
            </div>

            {/* Recently Played Card */}
            <div
              className="group p-4 sm:p-5 rounded-[22px] bg-[#1B1B1D] border border-white/[0.06] hover:border-white/[0.12] hover:bg-[#202022] transition-all cursor-pointer shadow-md flex items-center justify-between gap-3 w-full"
              onClick={() => {
                if (playerState.history.length > 0) {
                  playerEngine.playTrack(playerState.history[0], playerState.history);
                }
              }}
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div
                  className="w-12 h-12 rounded-2xl bg-white/[0.06] text-[#F1EEE7] border border-white/[0.08] flex items-center justify-center shrink-0 shadow-lg"
                  style={{ flexShrink: 0 }}
                >
                  <History className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm sm:text-base font-bold text-[#F1EEE7] transition truncate">
                    Recently Played
                  </h3>
                  <p className="text-xs text-[#77756F] mt-0.5 truncate font-mono">
                    {playerState.history.length} recent track{playerState.history.length === 1 ? '' : 's'}
                  </p>
                </div>
              </div>
              <div
                className="w-10 h-10 rounded-full bg-[#262628] group-hover:bg-[#F1EEE7] text-[#B4B1AB] group-hover:text-[#151515] flex items-center justify-center shrink-0 aspect-square shadow-md transition-all group-hover:scale-105"
                style={{ flexShrink: 0, aspectRatio: '1 / 1', borderRadius: '50%', display: 'grid', placeItems: 'center' }}
              >
                <Play className="w-4 h-4 fill-current stroke-0 ml-0.5" />
              </div>
            </div>
          </div>

          {/* User Playlists Section */}
          <div className="space-y-3.5 w-full">
            <h2 className="text-base font-bold text-[#F1EEE7]">Your Playlists</h2>
            {playlists.length === 0 ? (
              <div className="text-center py-12 rounded-[24px] bg-[#1B1B1D] border border-white/[0.06] w-full">
                <ListMusic className="w-10 h-10 text-[#77756F] mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold text-[#F1EEE7]">No playlists yet</p>
                <p className="text-xs text-[#77756F] mt-1">
                  Create your first playlist to organize favorite songs.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 w-full">
                {playlists.map((pl) => (
                  <div
                    key={pl.id}
                    className="group flex flex-col p-3.5 rounded-[22px] bg-[#1B1B1D] hover:bg-[#202022] border border-white/[0.06] hover:border-white/[0.12] transition-all cursor-pointer w-full"
                    onClick={() => setSelectedPlaylist(pl)}
                  >
                    <div className="aspect-square w-full rounded-[16px] bg-[#151515] border border-white/[0.04] flex items-center justify-center text-[#C7B5FF] mb-3 shadow-inner">
                      <ListMusic className="w-9 h-9 opacity-80" />
                    </div>
                    <h4 className="text-sm font-semibold text-[#F1EEE7] truncate group-hover:text-white">
                      {pl.title}
                    </h4>
                    <p className="text-xs text-[#77756F] mt-0.5 font-mono">
                      {pl.tracks.length} track{pl.tracks.length === 1 ? '' : 's'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="w-full max-w-md rounded-[28px] bg-[#1B1B1D] border border-white/[0.08] p-6 shadow-2xl space-y-4 text-[#F1EEE7]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-[#F1EEE7]">Create New Playlist</h3>
            <form onSubmit={handleCreatePlaylist} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#B4B1AB] uppercase tracking-wider mb-1.5 font-mono">
                  Playlist Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Midnight Beats, Morning Acoustic"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#151515] border border-white/[0.08] text-[#F1EEE7] placeholder-[#77756F] text-sm focus:outline-none focus:border-[#C7B5FF]"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#B4B1AB] uppercase tracking-wider mb-1.5 font-mono">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="A few words about this playlist..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-[#151515] border border-white/[0.08] text-[#F1EEE7] placeholder-[#77756F] text-sm focus:outline-none focus:border-[#C7B5FF]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded-full text-xs font-semibold text-[#77756F] hover:text-[#F1EEE7] transition"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#F1EEE7] hover:bg-[#EAE6DF] text-[#151515] text-xs font-bold shadow-md transition active:scale-95"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
