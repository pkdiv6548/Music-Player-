import React, { useState } from 'react';
import { Compass, Play, Sparkles, Disc, Award } from 'lucide-react';
import { motion } from 'motion/react';
import { Track, PlayerState } from '../../types/music';
import { TrackCard } from '../common/TrackCard';
import { TrackRow } from '../common/TrackRow';
import { CURATED_CATALOG } from '../../services/youtubeApi';
import { playerEngine } from '../../services/playerEngine';

interface Props {
  playerState: PlayerState;
  likedTrackIds: Set<string>;
  onToggleLike: (track: Track) => void;
}

export const ExploreView: React.FC<Props> = ({ playerState, likedTrackIds, onToggleLike }) => {
  const [selectedMood, setSelectedMood] = useState<string>('All');

  const moods = ['All', 'Chill', 'Lo-Fi', 'Electronic', 'Indian', 'Focus', 'Ambient', 'Acoustic'];

  const filteredTracks =
    selectedMood === 'All'
      ? CURATED_CATALOG
      : CURATED_CATALOG.filter((t) => t.genre?.toLowerCase().includes(selectedMood.toLowerCase()));

  const featured = CURATED_CATALOG[0];

  return (
    <div id="explore-view-container" className="space-y-8 sm:space-y-10 pb-36 md:pb-28 select-none">
      {/* Hero Spotlight Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-[28px] bg-[#1B1B1D] border border-white/[0.08] p-6 sm:p-8 shadow-2xl"
      >
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 sm:gap-8">
          <motion.div
            className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-[22px] overflow-hidden shadow-2xl shrink-0 border border-white/[0.08] bg-[#151515] group cursor-pointer"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => playerEngine.playTrack(featured, CURATED_CATALOG)}
          >
            {featured.artworkUrl ? (
              <img
                src={featured.artworkUrl}
                alt=""
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#77756F]">
                <Disc className="w-12 h-12 opacity-50" />
              </div>
            )}
            <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-black/70 backdrop-blur-md text-[#C7B5FF] border border-white/[0.1] font-mono">
              Spotlight Release
            </div>
          </motion.div>

          <div className="space-y-3 text-center md:text-left flex-1">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#C7B5FF] flex items-center justify-center md:justify-start gap-1.5 font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Aura Master Recording</span>
            </span>
            <h1 className="text-2xl sm:text-4xl font-bold text-[#F1EEE7] tracking-tight font-['Plus_Jakarta_Sans',sans-serif] leading-tight">
              {featured.title}
            </h1>
            <p className="text-sm sm:text-base text-[#B4B1AB] font-medium">
              {featured.artist} • <span className="text-[#77756F]">{featured.album}</span>
            </p>
            <p className="text-xs sm:text-sm text-[#77756F] max-w-xl leading-relaxed">
              Immerse yourself in lush harmonic depth and acoustic warmth mastered with 24-bit high-resolution studio dynamics.
            </p>
            <div className="pt-2 flex items-center justify-center md:justify-start gap-3">
              <motion.button
                id="explore-play-featured-btn"
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#F1EEE7] hover:bg-[#EAE6DF] text-[#151515] font-bold text-xs sm:text-sm shadow-xl transition active:scale-95 cursor-pointer"
                onClick={() => playerEngine.playTrack(featured, CURATED_CATALOG)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Play className="w-4 h-4 fill-current stroke-0 ml-0.5" />
                <span>Play Now</span>
              </motion.button>
              <motion.button
                id="explore-add-queue-featured-btn"
                className="px-5 py-3 rounded-full bg-[#202022] hover:bg-[#262628] text-[#F1EEE7] font-semibold text-xs sm:text-sm border border-white/[0.08] transition active:scale-95 cursor-pointer"
                onClick={() => playerEngine.addToQueue(featured)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Add to Queue
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mood / Genre Selector Chips */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Compass className="w-4 h-4 text-[#C7B5FF]" />
          <h2 className="text-base sm:text-lg font-bold text-[#F1EEE7]">Explore By Atmosphere</h2>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {moods.map((m) => (
            <button
              key={m}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                selectedMood === m
                  ? 'bg-[#262628] text-[#F1EEE7] border border-[#C7B5FF]/40 shadow-sm'
                  : 'bg-[#1B1B1D] text-[#77756F] hover:text-[#B4B1AB] hover:bg-[#202022] border border-white/[0.06]'
              }`}
              onClick={() => setSelectedMood(m)}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Filtered Mood Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 w-full">
        {filteredTracks.map((track) => (
          <TrackCard
            key={`explore-${track.id}`}
            track={track}
            isPlayingCurrent={playerState.isPlaying && playerState.currentTrack?.id === track.id}
            isLiked={likedTrackIds.has(track.id)}
            onPlay={() => playerEngine.playTrack(track, filteredTracks)}
            onPause={() => playerEngine.pause()}
            onToggleLike={() => onToggleLike(track)}
            onAddToQueue={() => playerEngine.addToQueue(track)}
            onPlayNext={() => playerEngine.playNext(track)}
          />
        ))}
      </div>

      {/* Global Top Chart Section */}
      <section className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#C7B5FF]" />
            <h2 className="text-lg sm:text-xl font-bold text-[#F1EEE7]">Aura Global Top 10</h2>
          </div>
          <span className="text-xs text-[#77756F] font-mono">Updated Daily</span>
        </div>
        <div className="rounded-[24px] bg-[#1B1B1D] border border-white/[0.06] p-2.5 sm:p-4 space-y-1.5 shadow-lg w-full">
          {CURATED_CATALOG.slice(0, 8).map((track, idx) => (
            <TrackRow
              key={`chart-${track.id}`}
              track={track}
              index={idx}
              isPlayingCurrent={playerState.isPlaying && playerState.currentTrack?.id === track.id}
              isLiked={likedTrackIds.has(track.id)}
              onPlay={() => playerEngine.playTrack(track, CURATED_CATALOG)}
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
