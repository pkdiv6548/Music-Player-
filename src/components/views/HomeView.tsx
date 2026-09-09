import React from 'react';
import { Play, Pause, Sparkles, Flame, HardDrive, Compass, Radio, ArrowRight, Disc3, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { Track, PlayerState, NavigationTab } from '../../types/music';
import { TrackCard } from '../common/TrackCard';
import { EqualizerVisualizer } from '../common/EqualizerVisualizer';
import { CURATED_CATALOG } from '../../services/youtubeApi';
import { playerEngine } from '../../services/playerEngine';

interface Props {
  playerState: PlayerState;
  likedTrackIds: Set<string>;
  localTracks: Track[];
  onToggleLike: (track: Track) => void;
  onSelectTab: (tab: NavigationTab) => void;
}

export const HomeView: React.FC<Props> = ({
  playerState,
  likedTrackIds,
  localTracks,
  onToggleLike,
  onSelectTab
}) => {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const featuredTrack: Track = CURATED_CATALOG[0] || {
    id: 'spotlight-1',
    title: 'Midnight City Lights',
    artist: 'Neon Heights',
    album: 'Synthesia Dreams',
    duration: 218,
    source: 'stream',
    addedAt: Date.now(),
    artworkUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&auto=format&fit=crop&q=80'
  };

  const isFeaturedPlaying = playerState.isPlaying && playerState.currentTrack?.id === featuredTrack.id;

  const quickPicks = (
    playerState.history.length > 0
      ? playerState.history.slice(0, 6)
      : [...localTracks.slice(0, 2), ...CURATED_CATALOG.slice(0, 6)]
  ).slice(0, 6);

  const chillTracks = CURATED_CATALOG.filter((t) => t.genre?.includes('Chill') || t.genre?.includes('Lo-Fi'));
  const workoutTracks = CURATED_CATALOG.filter((t) => t.genre?.includes('Electronic') || t.genre?.includes('Workout'));
  const indianTracks = CURATED_CATALOG.filter((t) => t.genre?.includes('Indian'));
  const focusTracks = CURATED_CATALOG.filter((t) => t.genre?.includes('Focus') || t.genre?.includes('Ambient'));

  return (
    <div id="home-view-container" className="space-y-10 sm:space-y-12 pb-36 md:pb-28">
      {/* Grand Hero Showcase Section - Dark Charcoal Audiophile Style */}
      <motion.section
        id="home-hero-banner"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-[28px] bg-[#1B1B1D] border border-white/[0.08] p-6 sm:p-8 lg:p-10 shadow-2xl shadow-black/80 select-none"
      >
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 lg:gap-10">
          {/* Left: Hero Headline, Badges, Description & CTA */}
          <div className="space-y-4 max-w-2xl text-center lg:text-left">
            {/* Badges row */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-[#262628] text-[#F1EEE7] border border-white/[0.08]">
                <Sparkles className="w-3.5 h-3.5 text-[#C7B5FF]" />
                <span>Featured Master Release</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#202022] text-[#B4B1AB] border border-white/[0.06] font-mono">
                <ShieldCheck className="w-3 h-3 text-[#C7B5FF]" />
                <span>24-Bit / 96kHz Lossless</span>
              </span>
            </div>

            {/* Uncompressed, Spacious Typography Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F1EEE7] tracking-tight leading-[1.15] font-['Plus_Jakarta_Sans',sans-serif]">
              {featuredTrack.title}
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg font-medium text-[#B4B1AB]">
              by <span className="text-[#F1EEE7] font-semibold">{featuredTrack.artist}</span> • <span className="text-[#77756F]">{featuredTrack.album}</span>
            </p>

            {/* Generously Spaced Body Description */}
            <p className="text-xs sm:text-sm text-[#77756F] leading-relaxed max-w-xl mx-auto lg:mx-0">
              Immerse yourself in pure studio sound with uncompressed acoustic range, unfiltered harmonic dynamics, and precision hardware audio processing.
            </p>

            {/* Audio Spec Pills */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1">
              <span className="px-2.5 py-1 rounded-lg bg-[#202022] border border-white/[0.06] text-[11px] text-[#B4B1AB] font-mono">
                FLAC • 320kbps
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#202022] border border-white/[0.06] text-[11px] text-[#B4B1AB] font-mono">
                Studio Equalizer Active
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#202022] border border-white/[0.06] text-[11px] text-[#C7B5FF] font-mono">
                Background Playback Ready
              </span>
            </div>

            {/* Call to Action Buttons */}
            <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <motion.button
                id="hero-play-featured-btn"
                className="flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#F1EEE7] hover:bg-[#EAE6DF] text-[#151515] font-bold text-sm shadow-xl transition-all cursor-pointer active:scale-95"
                onClick={() => {
                  if (isFeaturedPlaying) playerEngine.pause();
                  else playerEngine.playTrack(featuredTrack, CURATED_CATALOG);
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {isFeaturedPlaying ? (
                  <>
                    <Pause className="w-5 h-5 fill-current" />
                    <span>Pause Master</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                    <span>Play Master Release</span>
                  </>
                )}
              </motion.button>

              <motion.button
                id="hero-queue-btn"
                className="px-5 py-3.5 rounded-full bg-[#202022] hover:bg-[#262628] text-[#F1EEE7] font-semibold text-sm border border-white/[0.08] transition cursor-pointer"
                onClick={() => playerEngine.addToQueue(featuredTrack)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Add to Queue
              </motion.button>

              <motion.button
                id="hero-explore-btn"
                className="px-5 py-3.5 rounded-full bg-[#202022] hover:bg-[#262628] text-[#B4B1AB] hover:text-[#F1EEE7] font-semibold text-sm border border-white/[0.08] transition flex items-center gap-1.5 cursor-pointer"
                onClick={() => onSelectTab('explore')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>Browse All</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          {/* Right: Featured Album Artwork Card */}
          <motion.div
            className="relative shrink-0 group cursor-pointer mx-auto lg:mx-0"
            onClick={() => {
              if (isFeaturedPlaying) playerEngine.pause();
              else playerEngine.playTrack(featuredTrack, CURATED_CATALOG);
            }}
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          >
            <div className="relative w-52 h-52 sm:w-64 sm:h-64 lg:w-72 lg:h-72 aspect-square max-w-[85vw] rounded-[24px] overflow-hidden shadow-2xl border border-white/[0.08] bg-[#151515]">
              {featuredTrack.artworkUrl ? (
                <img
                  src={featuredTrack.artworkUrl}
                  alt={featuredTrack.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-[#202022] text-[#77756F]">
                  <Disc3 className="w-16 h-16 animate-spin" style={{ animationDuration: '10s' }} />
                  <span className="text-xs text-[#B4B1AB] mt-2 font-mono">Aura Master</span>
                </div>
              )}

              {/* Overlay with Lossless Equalizer Badge and True-Circle Play Button */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 sm:p-4 flex items-end justify-between gap-3 pointer-events-none">
                <div className="pointer-events-auto flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#151515]/90 backdrop-blur-md border border-white/[0.08] shadow-lg min-w-0">
                  <EqualizerVisualizer
                    isPlaying={isFeaturedPlaying}
                    barCount={5}
                    height={12}
                    color="#C7B5FF"
                  />
                  <span className="text-[10px] font-bold text-[#F1EEE7] tracking-wider font-mono uppercase whitespace-nowrap">
                    {isFeaturedPlaying ? 'Playing' : 'Master'}
                  </span>
                </div>

                {/* True-Circle Play Button */}
                <div
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#F1EEE7] text-[#151515] flex items-center justify-center shadow-2xl shrink-0 aspect-square group-hover:scale-108 transition-transform pointer-events-auto"
                  style={{ flexShrink: 0, aspectRatio: '1 / 1', borderRadius: '50%' }}
                >
                  {isFeaturedPlaying ? (
                    <Pause className="w-5 h-5 fill-current stroke-0" />
                  ) : (
                    <Play className="w-5 h-5 fill-current stroke-0 ml-0.5" />
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Greeting & Quick Picks */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-0.5">
            <h2 className="text-xl sm:text-2xl font-bold text-[#F1EEE7] tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
              {greeting}
            </h2>
            <p className="text-xs text-[#77756F]">Jump straight back into your frequent sessions</p>
          </div>
          <span className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#1B1B1D] text-[#B4B1AB] border border-white/[0.08] font-mono">
            <Sparkles className="w-3.5 h-3.5 text-[#C7B5FF]" />
            <span>Lossless Studio Engine</span>
          </span>
        </div>

        {/* Quick Picks 2x3 or 3x2 Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickPicks.map((track) => {
            const isPlayingThis = playerState.isPlaying && playerState.currentTrack?.id === track.id;
            return (
              <motion.div
                key={`quick-${track.id}`}
                id={`quick-pick-${track.id}`}
                className={`group flex items-center justify-between p-2.5 rounded-2xl bg-[#1B1B1D] hover:bg-[#202022] border transition-all duration-200 cursor-pointer select-none shadow-md ${
                  isPlayingThis
                    ? 'border-[#C7B5FF]/30 bg-[#202022]'
                    : 'border-white/[0.06] hover:border-white/[0.12]'
                }`}
                onClick={() => {
                  if (isPlayingThis) playerEngine.pause();
                  else playerEngine.playTrack(track, quickPicks);
                }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#151515] shrink-0 shadow-md relative border border-white/[0.04]">
                    {track.artworkUrl ? (
                      <img src={track.artworkUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#77756F]">
                        <Radio className="w-5 h-5" />
                      </div>
                    )}
                    {isPlayingThis && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="w-2 h-2 rounded-full bg-[#C7B5FF] animate-ping" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 pr-2">
                    <h3 className={`text-xs sm:text-sm font-semibold truncate leading-tight ${isPlayingThis ? 'text-[#F1EEE7] font-bold' : 'text-[#F1EEE7] group-hover:text-white'}`}>
                      {track.title}
                    </h3>
                    <p className="text-[11px] text-[#77756F] truncate mt-0.5">
                      {track.artist}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 mr-1">
                  {isPlayingThis && (
                    <div className="mr-2">
                      <EqualizerVisualizer isPlaying={true} barCount={3} height={12} color="#C7B5FF" />
                    </div>
                  )}
                  <button
                    aria-label={isPlayingThis ? 'Pause' : 'Play'}
                    className={`w-9 h-9 rounded-full bg-[#F1EEE7] text-[#151515] flex items-center justify-center shadow-lg transition-all shrink-0 ${
                      isPlayingThis ? 'opacity-100 scale-100' : 'opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0'
                    }`}
                    style={{
                      aspectRatio: '1 / 1',
                      borderRadius: '50%',
                      flexShrink: 0,
                      display: 'grid',
                      placeItems: 'center'
                    }}
                  >
                    {isPlayingThis ? (
                      <Pause className="w-4 h-4 fill-current stroke-0" />
                    ) : (
                      <Play className="w-4 h-4 fill-current stroke-0 ml-0.5" />
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Local Music Hub Banner */}
      <motion.div
        className="relative overflow-hidden rounded-[24px] bg-[#1B1B1D] border border-white/[0.08] p-6 sm:p-8 shadow-xl"
        whileHover={{ scale: 1.005 }}
        transition={{ duration: 0.2 }}
      >
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-[#C7B5FF]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#C7B5FF] font-mono">
                Zero-Upload Local Audio Engine
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#F1EEE7] tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
              Play High-Fidelity Audio Directly From Your Device
            </h2>
            <p className="text-xs sm:text-sm text-[#77756F] leading-relaxed">
              Import MP3, FLAC, WAV, M4A or OGG files with automatic metadata parsing. Operates 100% offline with full hardware sound processing.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <motion.button
              id="home-import-local-btn"
              className="px-6 py-3 rounded-full bg-[#F1EEE7] hover:bg-[#EAE6DF] text-[#151515] font-bold text-xs sm:text-sm shadow-xl transition cursor-pointer active:scale-95"
              onClick={() => onSelectTab('local')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Open Local Library ({localTracks.length})
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Shelf 1: Made For You / Chill & Lo-Fi */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-[#F1EEE7] tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
              Made For You • Chill & Lo-Fi
            </h3>
            <p className="text-xs text-[#77756F] mt-0.5">
              Atmospheric melodies and smooth resonant frequencies
            </p>
          </div>
          <button
            className="text-xs font-semibold text-[#B4B1AB] hover:text-[#F1EEE7] flex items-center gap-1 transition"
            onClick={() => onSelectTab('explore')}
          >
            <span>Explore all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-3 pt-1 no-scrollbar scroll-smooth">
          {chillTracks.map((track) => (
            <TrackCard
              key={track.id}
              track={track}
              isPlayingCurrent={playerState.isPlaying && playerState.currentTrack?.id === track.id}
              isLiked={likedTrackIds.has(track.id)}
              onPlay={() => playerEngine.playTrack(track, chillTracks)}
              onPause={() => playerEngine.pause()}
              onToggleLike={() => onToggleLike(track)}
              onAddToQueue={() => playerEngine.addToQueue(track)}
              onPlayNext={() => playerEngine.playNext(track)}
            />
          ))}
        </div>
      </section>

      {/* Shelf 2: High-Energy & Workout */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-[#F1EEE7] tracking-tight font-['Plus_Jakarta_Sans',sans-serif] flex items-center gap-2">
              <span>High-Energy & Workout</span>
              <Flame className="w-4 h-4 text-[#C7B5FF]" />
            </h3>
            <p className="text-xs text-[#77756F] mt-0.5">
              Driving rhythms, electronic pulses, and fast-tempo dynamics
            </p>
          </div>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-3 pt-1 no-scrollbar scroll-smooth">
          {workoutTracks.map((track) => (
            <TrackCard
              key={track.id}
              track={track}
              isPlayingCurrent={playerState.isPlaying && playerState.currentTrack?.id === track.id}
              isLiked={likedTrackIds.has(track.id)}
              onPlay={() => playerEngine.playTrack(track, workoutTracks)}
              onPause={() => playerEngine.pause()}
              onToggleLike={() => onToggleLike(track)}
              onAddToQueue={() => playerEngine.addToQueue(track)}
              onPlayNext={() => playerEngine.playNext(track)}
            />
          ))}
        </div>
      </section>

      {/* Shelf 3: Indian Classical & Fusion */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-[#F1EEE7] tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
              Indian Classical & Acoustic Fusion
            </h3>
            <p className="text-xs text-[#77756F] mt-0.5">
              Ragas, sitar melodies, morning serenades and modern fusion
            </p>
          </div>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-3 pt-1 no-scrollbar scroll-smooth">
          {indianTracks.map((track) => (
            <TrackCard
              key={track.id}
              track={track}
              isPlayingCurrent={playerState.isPlaying && playerState.currentTrack?.id === track.id}
              isLiked={likedTrackIds.has(track.id)}
              onPlay={() => playerEngine.playTrack(track, indianTracks)}
              onPause={() => playerEngine.pause()}
              onToggleLike={() => onToggleLike(track)}
              onAddToQueue={() => playerEngine.addToQueue(track)}
              onPlayNext={() => playerEngine.playNext(track)}
            />
          ))}
        </div>
      </section>

      {/* Shelf 4: Deep Focus & Ambient */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-[#F1EEE7] tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
              Deep Focus & Sleep
            </h3>
            <p className="text-xs text-[#77756F] mt-0.5">
              Cosmic soundscapes and peaceful resonant frequencies
            </p>
          </div>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-3 pt-1 no-scrollbar scroll-smooth">
          {focusTracks.map((track) => (
            <TrackCard
              key={track.id}
              track={track}
              isPlayingCurrent={playerState.isPlaying && playerState.currentTrack?.id === track.id}
              isLiked={likedTrackIds.has(track.id)}
              onPlay={() => playerEngine.playTrack(track, focusTracks)}
              onPause={() => playerEngine.pause()}
              onToggleLike={() => onToggleLike(track)}
              onAddToQueue={() => playerEngine.addToQueue(track)}
              onPlayNext={() => playerEngine.playNext(track)}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
