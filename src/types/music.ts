export type AudioSourceType = 'youtube' | 'local' | 'stream';

export interface LyricLine {
  time: number; // in seconds
  text: string;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number; // in seconds
  artworkUrl?: string;
  source: AudioSourceType;
  youtubeId?: string;
  audioUrl?: string; // object URL or stream URL
  file?: File; // in-memory reference during session
  addedAt: number;
  lyrics?: string | LyricLine[];
  genre?: string;
  bitrate?: string;
  format?: string;
  size?: number; // bytes
  isLiked?: boolean;
}

export interface Playlist {
  id: string;
  title: string;
  description?: string;
  coverUrl?: string;
  trackIds?: string[];
  tracks: Track[];
  isCustom?: boolean;
  createdAt: number;
  updatedAt: number;
}

export type RepeatMode = 'off' | 'all' | 'one';
export type PlayerLevel = 'mini' | 'expanded' | 'fullscreen';
export type NavigationTab = 'home' | 'search' | 'explore' | 'library' | 'liked' | 'local' | 'settings';

export interface PlayerState {
  currentTrack: Track | null;
  currentSource: AudioSourceType | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number; // 0.0 to 1.0
  isMuted: boolean;
  repeatMode: RepeatMode;
  shuffleMode: boolean;
  playbackRate: number; // 0.5 to 2.0
  buffering: boolean;
  error: string | null;
  queue: Track[];
  queueIndex: number;
  history: Track[];
  backgroundPlayEnabled: boolean;
  keepAwakeEnabled: boolean;
  isPipActive: boolean;
  wakeLockActive: boolean;
}

export interface EqualizerPreset {
  name: string;
  bass: number; // -10 to +10 dB
  mid: number;
  treble: number;
}

export type EqualizerPresetKey = 'flat' | 'bass' | 'treble' | 'vocal' | 'electronic' | 'rock' | 'classical';

export type ThemeMode = 'dark' | 'midnight' | 'light';

export interface AppSettings {
  theme: ThemeMode;
  youtubeApiKey?: string;
  equalizerPreset?: EqualizerPresetKey | EqualizerPreset;
  volumeNormalizer?: boolean;
  offlineCacheEnabled?: boolean;
  backgroundPlayEnabled?: boolean;
  backgroundPlayback?: boolean;
  volume?: number;
  audioQuality?: string;
  keepAwakeEnabled?: boolean;
}

export type UserSettings = AppSettings;
