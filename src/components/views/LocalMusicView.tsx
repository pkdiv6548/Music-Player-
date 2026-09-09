import React, { useState, useRef } from 'react';
import {
  Upload,
  FolderOpen,
  Play,
  Shuffle,
  Trash2,
  HardDrive,
  Search
} from 'lucide-react';
import { Track, PlayerState } from '../../types/music';
import { TrackRow } from '../common/TrackRow';
import { parseAudioFileMetadata, formatBytes } from '../../services/audioMetadata';
import { saveTrackToDB, clearAllTracksInDB } from '../../services/indexedDb';
import { playerEngine } from '../../services/playerEngine';

interface Props {
  playerState: PlayerState;
  localTracks: Track[];
  onRefreshLocalTracks: () => void;
  likedTrackIds: Set<string>;
  onToggleLike: (track: Track) => void;
}

export const LocalMusicView: React.FC<Props> = ({
  playerState,
  localTracks,
  onRefreshLocalTracks,
  likedTrackIds,
  onToggleLike
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const processFiles = async (files: FileList | File[]) => {
    setIsProcessing(true);
    const audioFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('audio/') || /\.(mp3|wav|ogg|flac|m4a|aac)$/i.test(file.name)) {
        audioFiles.push(file);
      }
    }

    if (audioFiles.length === 0) {
      setIsProcessing(false);
      return;
    }

    for (const f of audioFiles) {
      try {
        const track = await parseAudioFileMetadata(f);
        await saveTrackToDB(track);
      } catch (err) {
        console.warn('Failed parsing local audio file:', f.name, err);
      }
    }

    onRefreshLocalTracks();
    setIsProcessing(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(e.dataTransfer.files);
    }
  };

  const handleDirectoryPicker = async () => {
    if ('showDirectoryPicker' in window) {
      try {
        const dirHandle = await (window as any).showDirectoryPicker();
        setIsProcessing(true);
        const files: File[] = [];
        for await (const entry of (dirHandle as any).values()) {
          if (entry.kind === 'file') {
            const file = await entry.getFile();
            if (file.type.startsWith('audio/') || /\.(mp3|wav|ogg|flac|m4a|aac)$/i.test(file.name)) {
              files.push(file);
            }
          }
        }
        await processFiles(files);
      } catch {
        // cancelled
      }
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleClearLibrary = async () => {
    if (!confirm('Clear all local music records from browser storage? (Your original files on disk remain safe and untouched)')) return;
    await clearAllTracksInDB();
    onRefreshLocalTracks();
  };

  const filtered = localTracks.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.album && t.album.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalSize = localTracks.reduce((acc, t) => acc + (t.size || 0), 0);

  return (
    <div id="local-music-view-container" className="space-y-8 pb-36 md:pb-28 select-none">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="audio/*,.mp3,.wav,.ogg,.flac,.m4a"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            processFiles(e.target.files);
          }
        }}
      />

      {/* Header and Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-[#C7B5FF]" />
            <h1 className="text-2xl sm:text-3xl font-bold text-[#F1EEE7] tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
              Local Device Audio
            </h1>
          </div>
          <p className="text-xs text-[#77756F] mt-1 font-mono">
            {localTracks.length} tracks • {formatBytes(totalSize)} stored locally • Zero-upload privacy
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5">
          <button
            id="local-select-files-btn"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#F1EEE7] hover:bg-[#EAE6DF] text-[#151515] text-xs font-bold shadow-md transition active:scale-95 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4 stroke-[2.5]" />
            <span>Import Files</span>
          </button>
          <button
            id="local-select-folder-btn"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#202022] hover:bg-[#262628] text-[#F1EEE7] text-xs font-semibold border border-white/[0.08] transition active:scale-95 cursor-pointer"
            onClick={handleDirectoryPicker}
          >
            <FolderOpen className="w-4 h-4 text-[#C7B5FF]" />
            <span>Select Folder</span>
          </button>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        id="local-dropzone"
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative border border-dashed rounded-[28px] p-7 sm:p-10 text-center transition-all cursor-pointer select-none ${
          isDragging
            ? 'border-[#C7B5FF] bg-[#202022] scale-[1.01]'
            : 'border-white/[0.1] hover:border-white/[0.2] bg-[#1B1B1D] hover:bg-[#202022]'
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#262628] text-[#C7B5FF] flex items-center justify-center shadow-inner border border-white/[0.04]">
            <Upload className={`w-7 h-7 ${isDragging ? 'animate-bounce' : ''}`} />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#F1EEE7]">
              Drag & Drop audio files here
            </h3>
            <p className="text-xs text-[#77756F] mt-1 max-w-sm mx-auto">
              Supports MP3, FLAC, WAV, M4A, and OGG with automatic metadata and artwork extraction.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-[#B4B1AB] px-3 py-1 rounded-full bg-[#262628] border border-white/[0.06] font-mono">
            Direct local offline playback
          </span>
        </div>

        {isProcessing && (
          <div className="absolute inset-0 bg-[#151515]/90 backdrop-blur-sm rounded-[28px] flex flex-col items-center justify-center space-y-2 z-20">
            <div className="w-8 h-8 border-2 border-white/30 border-t-[#C7B5FF] rounded-full animate-spin" />
            <p className="text-xs font-semibold text-[#F1EEE7]">
              Extracting audio tags and album art...
            </p>
          </div>
        )}
      </div>

      {/* Local Track List Controls */}
      {localTracks.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Play All & Shuffle */}
            <div className="flex items-center gap-2.5">
              <button
                id="local-play-all-btn"
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#F1EEE7] hover:bg-[#EAE6DF] text-[#151515] text-xs sm:text-sm font-bold shadow-lg transition active:scale-95 cursor-pointer"
                onClick={() => playerEngine.playTrack(localTracks[0], localTracks)}
              >
                <Play className="w-4 h-4 fill-current stroke-0 ml-0.5" />
                <span>Play All</span>
              </button>
              <button
                id="local-shuffle-all-btn"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#202022] hover:bg-[#262628] text-[#F1EEE7] text-xs sm:text-sm font-semibold border border-white/[0.08] transition active:scale-95 cursor-pointer"
                onClick={() => {
                  playerEngine.toggleShuffle();
                  const rand = Math.floor(Math.random() * localTracks.length);
                  playerEngine.playTrack(localTracks[rand], localTracks);
                }}
              >
                <Shuffle className="w-4 h-4 stroke-[2]" />
                <span>Shuffle</span>
              </button>
              <button
                id="local-clear-lib-btn"
                aria-label="Clear local library"
                className="p-2.5 rounded-full text-[#77756F] hover:text-rose-400 hover:bg-rose-500/10 transition ml-auto sm:ml-0 active:scale-95"
                onClick={handleClearLibrary}
                title="Clear local library from cache"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Search within local files */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#77756F]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter local songs..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#1B1B1D] border border-white/[0.08] text-xs text-[#F1EEE7] placeholder-[#77756F] focus:outline-none focus:border-[#C7B5FF]"
              />
            </div>
          </div>

          {/* List */}
          <div className="space-y-1.5 w-full">
            {filtered.map((track, idx) => (
              <TrackRow
                key={`local-${track.id}`}
                track={track}
                index={idx}
                isPlayingCurrent={playerState.isPlaying && playerState.currentTrack?.id === track.id}
                isLiked={likedTrackIds.has(track.id)}
                onPlay={() => playerEngine.playTrack(track, filtered)}
                onPause={() => playerEngine.pause()}
                onToggleLike={() => onToggleLike(track)}
                onAddToQueue={() => playerEngine.addToQueue(track)}
                onPlayNext={() => playerEngine.playNext(track)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
