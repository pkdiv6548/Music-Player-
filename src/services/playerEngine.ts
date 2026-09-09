import { Track, PlayerState, RepeatMode, AudioSourceType, EqualizerPreset } from '../types/music';
import { addHistoryTrackToDB } from './indexedDb';
import { formatTime } from './audioMetadata';
import { CURATED_CATALOG } from './youtubeApi';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

type StateListener = (state: PlayerState) => void;

export const EQUALIZER_PRESETS: Record<string, EqualizerPreset> = {
  flat: { name: 'Flat', bass: 0, mid: 0, treble: 0 },
  bass: { name: 'Bass Boost', bass: 7, mid: 1, treble: -1 },
  treble: { name: 'Treble Boost', bass: -1, mid: 2, treble: 7 },
  vocal: { name: 'Vocal Clarity', bass: -2, mid: 6, treble: 3 },
  electronic: { name: 'Electronic', bass: 6, mid: 1, treble: 5 },
  rock: { name: 'Rock', bass: 5, mid: -1, treble: 4 },
  classical: { name: 'Classical', bass: 4, mid: 2, treble: 3 }
};

const initialDefaultTrack = CURATED_CATALOG[0] || null;

class PlayerEngine {
  private static instance: PlayerEngine;
  private state: PlayerState = {
    currentTrack: initialDefaultTrack,
    currentSource: initialDefaultTrack?.source || null,
    isPlaying: false,
    currentTime: 20,
    duration: initialDefaultTrack?.duration || 200,
    volume: 0.85,
    isMuted: false,
    repeatMode: 'off',
    shuffleMode: false,
    playbackRate: 1.0,
    buffering: false,
    error: null,
    queue: CURATED_CATALOG.slice(0, 14),
    queueIndex: 0,
    history: [],
    backgroundPlayEnabled: true,
    keepAwakeEnabled: false,
    isPipActive: false,
    wakeLockActive: false
  };

  private listeners: Set<StateListener> = new Set();

  // HTML5 Audio Elements for Local and Stream files
  private audioEl: HTMLAudioElement;
  private audioContext: AudioContext | null = null;
  private analyserNode: AnalyserNode | null = null;
  private bassFilter: BiquadFilterNode | null = null;
  private midFilter: BiquadFilterNode | null = null;
  private trebleFilter: BiquadFilterNode | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;

  // Background Audio & Wake Lock Keep-Alive
  private silentAudioEl: HTMLAudioElement;
  private wakeLockSentinel: any = null;
  private isPageHidden = false;
  private wasUserTriggeredPause = false;

  // Picture-in-Picture Streamer
  private pipCanvas: HTMLCanvasElement | null = null;
  private pipVideo: HTMLVideoElement | null = null;
  private pipAnimFrameId: number | null = null;
  private pipArtworkImg: HTMLImageElement | null = null;

  // YouTube IFrame Player instance
  private ytPlayer: any = null;
  private ytReady = false;
  private ytPlayerReady = false;
  private ytContainerId = 'aura-yt-player';
  private ytPollInterval: any = null;

  private constructor() {
    this.audioEl = new Audio();
    this.audioEl.crossOrigin = 'anonymous';

    // Inaudible silent audio loop data URI for mobile OS background audio keep-alive
    this.silentAudioEl = new Audio();
    this.silentAudioEl.loop = true;
    this.silentAudioEl.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

    this.setupAudioListeners();
    this.setupVisibilityListeners();
    this.setupMediaSession();
    this.initYouTubeAPI();
  }

  public static getInstance(): PlayerEngine {
    if (!PlayerEngine.instance) {
      PlayerEngine.instance = new PlayerEngine();
    }
    return PlayerEngine.instance;
  }

  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener({ ...this.state });
    return () => this.listeners.delete(listener);
  }

  public getState(): PlayerState {
    return { ...this.state };
  }

  public setBackgroundPlaybackEnabled(enabled: boolean) {
    this.state.backgroundPlayEnabled = enabled;
    this.notify();
  }

  public setEqualizerPreset(preset: string | EqualizerPreset) {
    if (typeof preset === 'string') {
      const found = EQUALIZER_PRESETS[preset] || EQUALIZER_PRESETS['flat'];
      this.setEqualizer(found);
    } else {
      this.setEqualizer(preset);
    }
  }

  private notify() {
    const cloned = { ...this.state };
    this.listeners.forEach((l) => l(cloned));
    this.updateMediaSessionState();
  }

  // --- AudioContext & Web Audio Equalizer ---
  private initAudioContext() {
    if (this.audioContext) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      this.audioContext = new AudioCtx();
      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 64;

      // Equalizer nodes
      this.bassFilter = this.audioContext.createBiquadFilter();
      this.bassFilter.type = 'lowshelf';
      this.bassFilter.frequency.value = 250;

      this.midFilter = this.audioContext.createBiquadFilter();
      this.midFilter.type = 'peaking';
      this.midFilter.frequency.value = 1500;
      this.midFilter.Q.value = 1.0;

      this.trebleFilter = this.audioContext.createBiquadFilter();
      this.trebleFilter.type = 'highshelf';
      this.trebleFilter.frequency.value = 4000;

      // Connect source -> bass -> mid -> treble -> analyser -> destination
      try {
        this.sourceNode = this.audioContext.createMediaElementSource(this.audioEl);
        this.sourceNode.connect(this.bassFilter);
        this.bassFilter.connect(this.midFilter);
        this.midFilter.connect(this.trebleFilter);
        this.trebleFilter.connect(this.analyserNode);
        this.analyserNode.connect(this.audioContext.destination);
      } catch (err) {
        console.warn('Web Audio node connection fallback:', err);
      }
    } catch (e) {
      console.warn('Web Audio API not supported or restricted:', e);
    }
  }

  public setEqualizer(preset: EqualizerPreset) {
    if (this.bassFilter) this.bassFilter.gain.value = preset.bass;
    if (this.midFilter) this.midFilter.gain.value = preset.mid;
    if (this.trebleFilter) this.trebleFilter.gain.value = preset.treble;
  }

  public getVisualizerData(): Uint8Array | null {
    if (!this.analyserNode) return null;
    const buffer = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteFrequencyData(buffer);
    return buffer;
  }

  // --- HTML5 Audio Setup ---
  private setupAudioListeners() {
    this.audioEl.addEventListener('play', () => {
      this.state.isPlaying = true;
      this.state.buffering = false;
      this.notify();
    });

    this.audioEl.addEventListener('pause', () => {
      this.state.isPlaying = false;
      this.notify();
    });

    this.audioEl.addEventListener('timeupdate', () => {
      if (this.state.currentSource !== 'youtube') {
        this.state.currentTime = this.audioEl.currentTime;
        if (!isNaN(this.audioEl.duration) && this.audioEl.duration > 0) {
          this.state.duration = this.audioEl.duration;
        }
        this.notify();
      }
    });

    this.audioEl.addEventListener('waiting', () => {
      this.state.buffering = true;
      this.notify();
    });

    this.audioEl.addEventListener('playing', () => {
      this.state.buffering = false;
      this.notify();
    });

    this.audioEl.addEventListener('ended', () => {
      this.handleTrackEnded();
    });

    this.audioEl.addEventListener('error', (e) => {
      console.warn('Audio playback error:', e);
      this.state.buffering = false;
      this.state.isPlaying = false;
      this.state.error = 'Unable to play this audio stream.';
      this.notify();
    });
  }

  // --- YouTube IFrame API Setup ---
  private initYouTubeAPI() {
    if (window.YT && window.YT.Player) {
      this.ytReady = true;
      return;
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode?.insertBefore(tag, firstScript);

    window.onYouTubeIframeAPIReady = () => {
      this.ytReady = true;
      this.mountYouTubePlayer();
    };
  }

  public mountYouTubePlayer() {
    if (!this.ytReady || this.ytPlayer) return;
    const container = document.getElementById(this.ytContainerId);
    if (!container) return;

    try {
      this.ytPlayer = new window.YT.Player(this.ytContainerId, {
        height: '240',
        width: '320',
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          playsinline: 1,
          rel: 0,
          enablejsapi: 1,
          origin: window.location.origin
        },
        events: {
          onReady: () => {
            this.ytPlayerReady = true;
            this.state.buffering = false;
            this.ytPlayer.setVolume(this.state.isMuted ? 0 : this.state.volume * 100);

            // Preload the current YouTube track without starting playback.
            // The actual play action is kept for the user's Play button gesture.
            if (this.state.currentSource === 'youtube' && this.state.currentTrack?.youtubeId) {
              try {
                this.ytPlayer.cueVideoById({
                  videoId: this.state.currentTrack.youtubeId,
                  startSeconds: Math.max(0, this.state.currentTime || 0)
                });
              } catch (err) {
                console.warn('Could not cue YouTube video:', err);
              }
            }

            this.notify();
          },
          onStateChange: (event: any) => {
            // YT.PlayerState: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)
            if (this.state.currentSource !== 'youtube') return;

            if (event.data === 1) {
              this.state.isPlaying = true;
              this.state.buffering = false;
              this.wasUserTriggeredPause = false;
              this.startYouTubeProgressPolling();
              if (this.state.keepAwakeEnabled) {
                this.requestWakeLock();
              }
              if (this.state.backgroundPlayEnabled) {
                this.startSilentAudioKeepAlive();
              }
              this.notify();
            } else if (event.data === 2) {
              // YouTube player fired pause. If user didn't trigger pause and page is hidden, re-resume for background play
              if (this.state.backgroundPlayEnabled && this.isPageHidden && !this.wasUserTriggeredPause) {
                setTimeout(() => {
                  if (this.ytPlayer && typeof this.ytPlayer.playVideo === 'function' && !this.wasUserTriggeredPause) {
                    this.ytPlayer.playVideo();
                  }
                }, 150);
                return;
              }
              this.state.isPlaying = false;
              this.stopYouTubeProgressPolling();
              this.stopSilentAudioKeepAlive();
              this.notify();
            } else if (event.data === 3) {
              this.state.buffering = true;
              this.notify();
            } else if (event.data === 0) {
              this.handleTrackEnded();
            }
          },
          onError: (e: any) => {
            console.warn('YouTube Player error code:', e.data);
            this.state.buffering = false;
            this.state.isPlaying = false;
            this.state.error = 'YouTube video cannot be played or is restricted by copyright.';
            this.stopYouTubeProgressPolling();
            this.notify();
          },
          onAutoplayBlocked: () => {
            // Browsers can reject scripted YouTube playback. Never leave the UI
            // stuck in an infinite buffering state; ask the user to press Play.
            this.state.buffering = false;
            this.state.isPlaying = false;
            this.state.error = 'Tap Play again to start YouTube playback.';
            this.stopYouTubeProgressPolling();
            this.notify();
          }
        }
      });
    } catch (err) {
      console.warn('Could not instantiate YT.Player:', err);
    }
  }

  private startYouTubeProgressPolling() {
    this.stopYouTubeProgressPolling();
    this.ytPollInterval = setInterval(() => {
      if (this.ytPlayer && typeof this.ytPlayer.getCurrentTime === 'function') {
        const cur = this.ytPlayer.getCurrentTime() || 0;
        const dur = this.ytPlayer.getDuration() || this.state.duration;
        this.state.currentTime = cur;
        if (dur > 0) this.state.duration = dur;
        this.notify();
      }
    }, 400);
  }

  private stopYouTubeProgressPolling() {
    if (this.ytPollInterval) {
      clearInterval(this.ytPollInterval);
      this.ytPollInterval = null;
    }
  }

  // --- Authoritative Playback Controls ---
  public async playTrack(track: Track, queueList?: Track[]) {
    this.initAudioContext();
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    // Stop current opposite player
    if (track.source === 'youtube') {
      this.audioEl.pause();
    } else {
      if (this.ytPlayer && typeof this.ytPlayer.pauseVideo === 'function') {
        this.ytPlayer.pauseVideo();
      }
      this.stopYouTubeProgressPolling();
    }

    // Setup queue if provided
    if (queueList && queueList.length > 0) {
      this.state.queue = [...queueList];
      this.state.queueIndex = this.state.queue.findIndex((t) => t.id === track.id);
      if (this.state.queueIndex === -1) {
        this.state.queue.unshift(track);
        this.state.queueIndex = 0;
      }
    } else if (!this.state.queue.some((t) => t.id === track.id)) {
      this.state.queue.push(track);
      this.state.queueIndex = this.state.queue.length - 1;
    } else {
      this.state.queueIndex = this.state.queue.findIndex((t) => t.id === track.id);
    }

    this.state.currentTrack = track;
    this.state.currentSource = track.source;
    this.state.currentTime = 0;
    this.state.duration = track.duration || 180;
    this.state.buffering = true;
    this.state.error = null;
    this.notify();

    // Persist to history
    addHistoryTrackToDB(track);
    this.state.history = [track, ...this.state.history.filter((t) => t.id !== track.id)].slice(0, 30);

    // Play based on source
    this.wasUserTriggeredPause = false;
    if (track.artworkUrl) {
      this.pipArtworkImg = new Image();
      this.pipArtworkImg.crossOrigin = 'anonymous';
      this.pipArtworkImg.src = track.artworkUrl;
    } else {
      this.pipArtworkImg = null;
    }

    if (track.source === 'youtube' && track.youtubeId) {
      if (!this.ytPlayer) {
        this.mountYouTubePlayer();
      }

      if (this.ytPlayer && this.ytPlayerReady && typeof this.ytPlayer.loadVideoById === 'function') {
        try {
          // loadVideoById is intentionally called from the user's Play action.
          // If the browser blocks scripted playback, onAutoplayBlocked handles it.
          this.ytPlayer.loadVideoById({
            videoId: track.youtubeId,
            startSeconds: 0
          });
          this.ytPlayer.setPlaybackRate(this.state.playbackRate);
          this.ytPlayer.setVolume(this.state.isMuted ? 0 : this.state.volume * 100);
        } catch (err) {
          console.warn('Could not start YouTube playback:', err);
          this.state.buffering = false;
          this.state.isPlaying = false;
          this.state.error = 'YouTube player is not ready. Tap Play again.';
          this.notify();
        }
      } else {
        // Do not recursively call playTrack(): that can duplicate history/queue
        // work and can leave the UI in a permanent loading loop.
        this.state.buffering = false;
        this.state.isPlaying = false;
        this.state.error = 'YouTube player is still loading. Tap Play again.';
        this.notify();
      }
    } else {
      // Local audio or stream
      const srcUrl = track.audioUrl || (track.file ? URL.createObjectURL(track.file) : '');
      if (!srcUrl) {
        this.state.error = 'No audio source found for track.';
        this.state.buffering = false;
        this.notify();
        return;
      }

      this.audioEl.src = srcUrl;
      this.audioEl.playbackRate = this.state.playbackRate;
      this.audioEl.volume = this.state.isMuted ? 0 : this.state.volume;

      try {
        await this.audioEl.play();
        this.state.isPlaying = true;
        this.state.buffering = false;
        if (this.state.keepAwakeEnabled) {
          this.requestWakeLock();
        }
      } catch (err: any) {
        console.warn('Audio play request prevented:', err);
        this.state.buffering = false;
        this.state.isPlaying = false;
        this.notify();
      }
    }

    this.updateMediaSessionMetadata(track);
  }

  public togglePlayPause() {
    if (!this.state.currentTrack) {
      if (this.state.queue.length > 0) {
        this.playTrack(this.state.queue[0]);
      }
      return;
    }
    if (this.state.isPlaying) {
      this.pause();
    } else {
      this.resume();
    }
  }

  public pause() {
    this.wasUserTriggeredPause = true;
    this.releaseWakeLock();
    this.stopSilentAudioKeepAlive();

    if (this.state.currentSource === 'youtube') {
      if (this.ytPlayer && typeof this.ytPlayer.pauseVideo === 'function') {
        this.ytPlayer.pauseVideo();
      }
      this.stopYouTubeProgressPolling();
    } else {
      this.audioEl.pause();
    }
    this.state.isPlaying = false;
    this.notify();
  }

  public resume() {
    this.wasUserTriggeredPause = false;

    if (!this.audioEl.src && this.state.currentTrack) {
      this.playTrack(this.state.currentTrack);
      return;
    }

    if (this.state.keepAwakeEnabled) {
      this.requestWakeLock();
    }
    if (this.state.backgroundPlayEnabled && this.state.currentSource === 'youtube') {
      this.startSilentAudioKeepAlive();
    }

    if (this.state.currentSource === 'youtube') {
      if (this.ytPlayer && this.ytPlayerReady && typeof this.ytPlayer.playVideo === 'function') {
        try {
          this.ytPlayer.playVideo();
        } catch (err) {
          console.warn('Could not resume YouTube playback:', err);
          this.state.isPlaying = false;
          this.state.error = 'Tap Play again to start YouTube playback.';
        }
      } else {
        this.state.isPlaying = false;
        this.state.error = 'YouTube player is still loading. Tap Play again.';
      }
    } else {
      this.audioEl.play().catch(() => {});
    }
    this.state.isPlaying = true;
    this.notify();
  }

  public seek(timeInSeconds: number) {
    const clamped = Math.max(0, Math.min(timeInSeconds, this.state.duration));
    this.state.currentTime = clamped;
    if (this.state.currentSource === 'youtube') {
      if (this.ytPlayer && typeof this.ytPlayer.seekTo === 'function') {
        this.ytPlayer.seekTo(clamped, true);
      }
    } else {
      this.audioEl.currentTime = clamped;
    }
    this.notify();
  }

  public nextTrack() {
    if (this.state.queue.length === 0) return;
    if (this.state.shuffleMode) {
      const nextIdx = Math.floor(Math.random() * this.state.queue.length);
      this.playTrack(this.state.queue[nextIdx]);
      return;
    }
    let nextIdx = this.state.queueIndex + 1;
    if (nextIdx >= this.state.queue.length) {
      if (this.state.repeatMode === 'all') {
        nextIdx = 0;
      } else {
        this.pause();
        return;
      }
    }
    this.playTrack(this.state.queue[nextIdx]);
  }

  public previousTrack() {
    // If currentTime > 3s, restart current track
    if (this.state.currentTime > 3) {
      this.seek(0);
      return;
    }
    if (this.state.queue.length === 0) return;
    let prevIdx = this.state.queueIndex - 1;
    if (prevIdx < 0) {
      prevIdx = this.state.repeatMode === 'all' ? this.state.queue.length - 1 : 0;
    }
    this.playTrack(this.state.queue[prevIdx]);
  }

  private handleTrackEnded() {
    if (this.state.repeatMode === 'one' && this.state.currentTrack) {
      this.seek(0);
      this.resume();
      return;
    }
    this.nextTrack();
  }

  public setVolume(vol: number) {
    const clamped = Math.max(0, Math.min(1, vol));
    this.state.volume = clamped;
    this.state.isMuted = clamped === 0;
    this.audioEl.volume = clamped;
    if (this.ytPlayer && typeof this.ytPlayer.setVolume === 'function') {
      this.ytPlayer.setVolume(clamped * 100);
    }
    this.notify();
  }

  public toggleMute() {
    this.state.isMuted = !this.state.isMuted;
    const effectiveVol = this.state.isMuted ? 0 : this.state.volume;
    this.audioEl.volume = effectiveVol;
    if (this.ytPlayer && typeof this.ytPlayer.setVolume === 'function') {
      this.ytPlayer.setVolume(effectiveVol * 100);
    }
    this.notify();
  }

  public toggleRepeat() {
    const modes: RepeatMode[] = ['off', 'all', 'one'];
    const currentIdx = modes.indexOf(this.state.repeatMode);
    this.state.repeatMode = modes[(currentIdx + 1) % modes.length];
    this.notify();
  }

  public toggleShuffle() {
    this.state.shuffleMode = !this.state.shuffleMode;
    this.notify();
  }

  public setPlaybackRate(rate: number) {
    this.state.playbackRate = rate;
    this.audioEl.playbackRate = rate;
    if (this.ytPlayer && typeof this.ytPlayer.setPlaybackRate === 'function') {
      this.ytPlayer.setPlaybackRate(rate);
    }
    this.notify();
  }

  // Queue Management
  public addToQueue(track: Track) {
    this.state.queue.push(track);
    this.notify();
  }

  public playNext(track: Track) {
    const insertIdx = this.state.queueIndex + 1;
    this.state.queue.splice(insertIdx, 0, track);
    this.notify();
  }

  public skipToQueueIndex(index: number) {
    if (index >= 0 && index < this.state.queue.length) {
      this.playTrack(this.state.queue[index]);
    }
  }

  public removeFromQueue(index: number) {
    if (index === this.state.queueIndex) {
      this.nextTrack();
    }
    this.state.queue.splice(index, 1);
    if (index < this.state.queueIndex) {
      this.state.queueIndex--;
    }
    this.notify();
  }

  public clearQueue() {
    if (this.state.currentTrack) {
      this.state.queue = [this.state.currentTrack];
      this.state.queueIndex = 0;
    } else {
      this.state.queue = [];
      this.state.queueIndex = -1;
    }
    this.notify();
  }

  public reorderQueue(startIndex: number, endIndex: number) {
    const result = Array.from(this.state.queue);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    // Update current index
    if (this.state.queueIndex === startIndex) {
      this.state.queueIndex = endIndex;
    } else if (startIndex < this.state.queueIndex && endIndex >= this.state.queueIndex) {
      this.state.queueIndex--;
    } else if (startIndex > this.state.queueIndex && endIndex <= this.state.queueIndex) {
      this.state.queueIndex++;
    }

    this.state.queue = result;
    this.notify();
  }

  // --- Media Session API ---
  private setupMediaSession() {
    if (!('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.setActionHandler('play', () => this.resume());
      navigator.mediaSession.setActionHandler('pause', () => this.pause());
      navigator.mediaSession.setActionHandler('previoustrack', () => this.previousTrack());
      navigator.mediaSession.setActionHandler('nexttrack', () => this.nextTrack());
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) {
          this.seek(details.seekTime);
        }
      });
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        this.seek(this.state.currentTime - (details.seekOffset || 10));
      });
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        this.seek(this.state.currentTime + (details.seekOffset || 10));
      });
      navigator.mediaSession.setActionHandler('stop', () => {
        this.pause();
      });
    } catch (err) {
      console.warn('MediaSession handler error:', err);
    }
  }

  // --- Background Audio & Wake Lock Management ---
  private setupVisibilityListeners() {
    if (typeof document === 'undefined') return;

    document.addEventListener('visibilitychange', () => {
      this.isPageHidden = document.visibilityState === 'hidden';
      if (this.isPageHidden) {
        if (this.state.isPlaying && this.state.backgroundPlayEnabled) {
          // Keep Web Audio API Context active in background
          if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume().catch(() => {});
          }
          // Start silent audio keep-alive for background playback
          if (this.state.currentSource === 'youtube') {
            this.startSilentAudioKeepAlive();
          }
        }
      } else {
        // App returned to foreground
        if (this.state.isPlaying) {
          if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume().catch(() => {});
          }
          if (this.state.keepAwakeEnabled) {
            this.requestWakeLock();
          }
          this.updateMediaSessionState();
        }
      }
    });

    window.addEventListener('focus', () => {
      if (this.state.isPlaying && this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(() => {});
      }
    });
  }

  private startSilentAudioKeepAlive() {
    if (!this.state.backgroundPlayEnabled) return;
    try {
      if (this.silentAudioEl.paused) {
        this.silentAudioEl.play().catch(() => {});
      }
    } catch (err) {
      console.warn('Silent audio keep-alive error:', err);
    }
  }

  private stopSilentAudioKeepAlive() {
    try {
      if (!this.silentAudioEl.paused) {
        this.silentAudioEl.pause();
      }
    } catch {}
  }

  private async requestWakeLock() {
    if (!this.state.keepAwakeEnabled) return;
    if ('wakeLock' in navigator && !this.wakeLockSentinel) {
      try {
        this.wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
        this.state.wakeLockActive = true;
        this.notify();
        this.wakeLockSentinel.addEventListener('release', () => {
          this.wakeLockSentinel = null;
          this.state.wakeLockActive = false;
          this.notify();
        });
      } catch (err) {
        // Handled silently (e.g. low battery mode on mobile)
      }
    }
  }

  private releaseWakeLock() {
    if (this.wakeLockSentinel) {
      this.wakeLockSentinel.release().catch(() => {});
      this.wakeLockSentinel = null;
      this.state.wakeLockActive = false;
      this.notify();
    }
  }

  public setKeepAwake(enabled: boolean) {
    this.state.keepAwakeEnabled = enabled;
    if (enabled && this.state.isPlaying) {
      this.requestWakeLock();
    } else {
      this.releaseWakeLock();
    }
    this.notify();
  }

  public setBackgroundPlay(enabled: boolean) {
    this.state.backgroundPlayEnabled = enabled;
    if (!enabled) {
      this.stopSilentAudioKeepAlive();
    } else if (this.state.isPlaying && this.state.currentSource === 'youtube') {
      this.startSilentAudioKeepAlive();
    }
    this.notify();
  }

  // --- Picture-in-Picture Floating Player for Uninterrupted Background Playback ---
  public isPictureInPictureSupported(): boolean {
    return typeof document !== 'undefined' && 'pictureInPictureEnabled' in document && !!document.pictureInPictureEnabled;
  }

  public async togglePictureInPicture(): Promise<boolean> {
    if (!this.isPictureInPictureSupported()) return false;
    if (document.pictureInPictureElement) {
      try {
        await document.exitPictureInPicture();
        this.state.isPipActive = false;
        this.notify();
        return false;
      } catch (e) {
        console.warn('Error exiting PiP:', e);
        return false;
      }
    } else {
      return this.enterPictureInPicture();
    }
  }

  public async enterPictureInPicture(): Promise<boolean> {
    if (!this.state.currentTrack) return false;
    try {
      this.initPipElements();
      if (!this.pipVideo) return false;
      this.startPipRendering();
      await this.pipVideo.play();
      await this.pipVideo.requestPictureInPicture();
      this.state.isPipActive = true;
      this.notify();
      return true;
    } catch (err) {
      console.warn('Could not launch Picture-in-Picture:', err);
      this.state.isPipActive = false;
      this.notify();
      return false;
    }
  }

  private initPipElements() {
    if (this.pipCanvas && this.pipVideo) return;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    this.pipCanvas = canvas;

    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';
    video.style.position = 'fixed';
    video.style.width = '2px';
    video.style.height = '2px';
    video.style.bottom = '0';
    video.style.left = '0';
    video.style.opacity = '0.01';
    video.style.pointerEvents = 'none';
    document.body.appendChild(video);
    this.pipVideo = video;

    const stream = canvas.captureStream(30);
    video.srcObject = stream;

    video.addEventListener('enterpictureinpicture', () => {
      this.state.isPipActive = true;
      this.notify();
    });
    video.addEventListener('leavepictureinpicture', () => {
      this.state.isPipActive = false;
      this.stopPipRendering();
      this.notify();
    });
  }

  private startPipRendering() {
    this.stopPipRendering();
    const render = () => {
      this.drawPipFrame();
      this.pipAnimFrameId = requestAnimationFrame(render);
    };
    this.pipAnimFrameId = requestAnimationFrame(render);
  }

  private stopPipRendering() {
    if (this.pipAnimFrameId) {
      cancelAnimationFrame(this.pipAnimFrameId);
      this.pipAnimFrameId = null;
    }
  }

  private drawPipFrame() {
    if (!this.pipCanvas) return;
    const ctx = this.pipCanvas.getContext('2d');
    if (!ctx) return;

    const track = this.state.currentTrack;
    const width = 512;
    const height = 512;

    // 1. Dark Gradient Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#0f1422');
    bgGrad.addColorStop(1, '#07090e');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Ambient radial glow behind artwork
    const glow = ctx.createRadialGradient(256, 175, 20, 256, 175, 180);
    glow.addColorStop(0, 'rgba(99, 102, 241, 0.35)');
    glow.addColorStop(1, 'rgba(99, 102, 241, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    // 3. Top Header / App Branding
    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = '#6366f1';
    ctx.textAlign = 'left';
    ctx.fillText('AURA MUSIC', 36, 42);

    ctx.font = '600 13px sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'right';
    ctx.fillText('BACKGROUND AUDIO ACTIVE', 476, 42);

    // 4. Album Artwork Box
    const artSize = 210;
    const artX = (width - artSize) / 2;
    const artY = 70;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(artX, artY, artSize, artSize, 20);
    ctx.clip();

    if (this.pipArtworkImg && this.pipArtworkImg.complete && this.pipArtworkImg.naturalWidth > 0) {
      ctx.drawImage(this.pipArtworkImg, artX, artY, artSize, artSize);
    } else {
      const artGrad = ctx.createLinearGradient(artX, artY, artX + artSize, artY + artSize);
      artGrad.addColorStop(0, '#312e81');
      artGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = artGrad;
      ctx.fillRect(artX, artY, artSize, artSize);
      ctx.font = 'bold 54px sans-serif';
      ctx.fillStyle = '#818cf8';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('♪', artX + artSize / 2, artY + artSize / 2);
    }
    ctx.restore();

    // Artwork Border
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(artX, artY, artSize, artSize, 20);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // 5. Track Title
    ctx.font = 'bold 24px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    const title = track?.title || 'No Track Selected';
    const truncatedTitle = title.length > 30 ? title.substring(0, 28) + '...' : title;
    ctx.fillText(truncatedTitle, 256, 325);

    // 6. Track Artist
    ctx.font = '500 17px sans-serif';
    ctx.fillStyle = '#94a3b8';
    const artist = track?.artist || 'Aura Player';
    const truncatedArtist = artist.length > 36 ? artist.substring(0, 34) + '...' : artist;
    ctx.fillText(truncatedArtist, 256, 355);

    // 7. Visualizer Bars (Real-time Equalizer)
    const barCount = 28;
    const barWidth = 8;
    const barGap = 6;
    const totalW = barCount * barWidth + (barCount - 1) * barGap;
    const startX = (width - totalW) / 2;
    const baseY = 440;

    const visData = this.getVisualizerData();
    for (let i = 0; i < barCount; i++) {
      let barHeight = 8;
      if (this.state.isPlaying) {
        if (visData && visData.length > 0) {
          const val = visData[i % visData.length] / 255;
          barHeight = Math.max(8, val * 45);
        } else {
          const time = Date.now() / 250;
          const s = (Math.sin(time + i * 0.4) + 1) / 2;
          barHeight = 8 + s * 36;
        }
      }
      const bx = startX + i * (barWidth + barGap);
      const by = baseY - barHeight;
      const barGrad = ctx.createLinearGradient(bx, baseY, bx, by);
      barGrad.addColorStop(0, '#6366f1');
      barGrad.addColorStop(1, '#38bdf8');
      ctx.fillStyle = barGrad;
      ctx.beginPath();
      ctx.roundRect(bx, by, barWidth, barHeight, 4);
      ctx.fill();
    }

    // 8. Progress Time
    const progressText = `${formatTime(this.state.currentTime)} / ${formatTime(this.state.duration)}`;
    ctx.font = '500 13px monospace';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'center';
    ctx.fillText(progressText, 256, 480);
  }

  private updateMediaSessionMetadata(track: Track) {
    if (!('mediaSession' in navigator)) return;
    try {
      const artworkSrc = track.artworkUrl || '/pwa-512x512.png';
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist,
        album: track.album || 'Aura Music',
        artwork: [
          { src: artworkSrc, sizes: '96x96', type: 'image/jpeg' },
          { src: artworkSrc, sizes: '128x128', type: 'image/jpeg' },
          { src: artworkSrc, sizes: '192x192', type: 'image/jpeg' },
          { src: artworkSrc, sizes: '512x512', type: 'image/jpeg' }
        ]
      });
    } catch (e) {
      console.warn('Could not set MediaSession metadata:', e);
    }
  }

  private updateMediaSessionState() {
    if (!('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.playbackState = this.state.isPlaying ? 'playing' : 'paused';
      if ('setPositionState' in navigator.mediaSession && this.state.duration > 0) {
        navigator.mediaSession.setPositionState({
          duration: this.state.duration,
          playbackRate: this.state.playbackRate,
          position: Math.min(this.state.currentTime, this.state.duration)
        });
      }
    } catch {
      // Ignore transient position state sync errors
    }
  }
}

export const playerEngine = PlayerEngine.getInstance();
