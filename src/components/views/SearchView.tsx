import React, { useState, useEffect, useRef } from 'react';
import { Search, X, History, TrendingUp, Sparkles, AlertCircle } from 'lucide-react';
import { Track, PlayerState } from '../../types/music';
import { TrackRow } from '../common/TrackRow';
import { searchMusic, CURATED_CATALOG } from '../../services/youtubeApi';
import { playerEngine } from '../../services/playerEngine';
import { getSearchHistoryFromDB, addSearchHistoryToDB, clearSearchHistoryInDB } from '../../services/indexedDb';

interface Props {
  playerState: PlayerState;
  likedTrackIds: Set<string>;
  localTracks: Track[];
  onToggleLike: (track: Track) => void;
  onOpenSettings: () => void;
}

export const SearchView: React.FC<Props> = ({
  playerState,
  likedTrackIds,
  localTracks,
  onToggleLike,
  onOpenSettings
}) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'tracks' | 'local' | 'albums'>('all');
  const [results, setResults] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const searchTimeoutRef = useRef<any>(null);

  const trendingSearches = [
    'Lo-Fi Study Beats',
    'Synthwave Sunset',
    'Acoustic Guitar Melodies',
    'Indian Sitar Fusion',
    'Deep Focus Ambient',
    'Cyberpunk Bass',
    'Classical Piano'
  ];

  useEffect(() => {
    getSearchHistoryFromDB().then(setHistory);
  }, []);

  const performSearch = async (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) {
      setResults([]);
      setErrorMsg(null);
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    addSearchHistoryToDB(trimmed);
    setHistory((prev) => [trimmed, ...prev.filter((h) => h !== trimmed)].slice(0, 8));

    const localMatches = localTracks.filter(
      (t) =>
        t.title.toLowerCase().includes(trimmed.toLowerCase()) ||
        t.artist.toLowerCase().includes(trimmed.toLowerCase()) ||
        (t.album && t.album.toLowerCase().includes(trimmed.toLowerCase()))
    );

    try {
      const apiResults = await searchMusic(trimmed);
      const combined = [...localMatches, ...apiResults.filter((ar) => !localMatches.some((lm) => lm.id === ar.id))];
      setResults(combined);
    } catch (err: any) {
      console.warn('Search error:', err);
      const catalogMatches = CURATED_CATALOG.filter(
        (t) =>
          t.title.toLowerCase().includes(trimmed.toLowerCase()) ||
          t.artist.toLowerCase().includes(trimmed.toLowerCase()) ||
          (t.genre && t.genre.toLowerCase().includes(trimmed.toLowerCase()))
      );
      setResults([...localMatches, ...catalogMatches]);
      setErrorMsg(err.message || 'YouTube search unavailable. Showing curated & local library matches.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (val.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(val);
      }, 350);
    } else {
      setResults([]);
      setErrorMsg(null);
    }
  };

  const handleSelectQuery = (term: string) => {
    setQuery(term);
    performSearch(term);
  };

  const handleClearHistory = async () => {
    await clearSearchHistoryInDB();
    setHistory([]);
  };

  const filteredResults = results.filter((track) => {
    if (activeCategory === 'local') return track.source === 'local';
    return true;
  });

  return (
    <div id="search-view-container" className="space-y-6 pb-36 md:pb-28 select-none">
      {/* Search Bar Input */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-4.5 w-5 h-5 text-[#B4B1AB] pointer-events-none" />
          <input
            id="search-main-input"
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search tracks, artists, albums, or local files..."
            className="w-full pl-12 pr-11 py-3.5 sm:py-4 rounded-[22px] bg-[#1B1B1D] border border-white/[0.08] text-[#F1EEE7] placeholder-[#77756F] focus:outline-none focus:border-[#C7B5FF]/50 text-sm sm:text-base shadow-lg transition"
            autoFocus
          />
          {query && (
            <button
              id="search-clear-btn"
              aria-label="Clear search"
              className="absolute right-3.5 p-1 rounded-full text-[#77756F] hover:text-[#F1EEE7] transition"
              onClick={() => {
                setQuery('');
                setResults([]);
                setErrorMsg(null);
              }}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 mt-3.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all', label: 'All Results' },
            { id: 'tracks', label: 'Tracks' },
            { id: 'local', label: `Local (${localTracks.length})` }
          ].map((cat) => (
            <button
              key={cat.id}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                activeCategory === cat.id
                  ? 'bg-[#262628] text-[#F1EEE7] border border-[#C7B5FF]/40 shadow-sm'
                  : 'bg-[#1B1B1D] text-[#77756F] hover:text-[#B4B1AB] hover:bg-[#202022] border border-white/[0.06]'
              }`}
              onClick={() => setActiveCategory(cat.id as any)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Warning Notice if API key missing */}
      {errorMsg && (
        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#1B1B1D] border border-amber-500/20 text-amber-200 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
          <div className="flex-1">
            <p className="font-semibold">Notice regarding online search:</p>
            <p className="mt-0.5 text-amber-300/80">{errorMsg}</p>
          </div>
          <button
            className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 font-semibold text-[11px] text-amber-200 transition shrink-0"
            onClick={onOpenSettings}
          >
            Configure Key
          </button>
        </div>
      )}

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="space-y-2 pt-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className="flex items-center gap-3 p-3 rounded-2xl bg-[#1B1B1D] border border-white/[0.04] animate-pulse"
            >
              <div className="w-11 h-11 rounded-xl bg-[#202022] shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-[#202022] rounded w-1/3" />
                <div className="h-2.5 bg-[#18181A] rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search Results */}
      {!isLoading && results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#F1EEE7]">
              Found {filteredResults.length} track{filteredResults.length === 1 ? '' : 's'}
            </h2>
          </div>
          <div className="space-y-1.5 w-full">
            {filteredResults.map((track, idx) => (
              <TrackRow
                key={`search-res-${track.id}`}
                track={track}
                index={idx}
                isPlayingCurrent={playerState.isPlaying && playerState.currentTrack?.id === track.id}
                isLiked={likedTrackIds.has(track.id)}
                onPlay={() => playerEngine.playTrack(track, filteredResults)}
                onPause={() => playerEngine.pause()}
                onToggleLike={() => onToggleLike(track)}
                onAddToQueue={() => playerEngine.addToQueue(track)}
                onPlayNext={() => playerEngine.playNext(track)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty Search State: History & Trending */}
      {!isLoading && !query && (
        <div className="space-y-8 pt-2">
          {/* Search History */}
          {history.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#77756F] flex items-center gap-2 font-mono">
                  <History className="w-4 h-4 text-[#B4B1AB]" />
                  <span>Recent Searches</span>
                </h3>
                <button
                  className="text-xs text-[#77756F] hover:text-rose-400 transition"
                  onClick={handleClearHistory}
                >
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {history.map((term) => (
                  <button
                    key={term}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1B1B1D] hover:bg-[#202022] border border-white/[0.06] text-xs text-[#B4B1AB] hover:text-[#F1EEE7] transition active:scale-95"
                    onClick={() => handleSelectQuery(term)}
                  >
                    <span>{term}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Trending Searches */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#77756F] flex items-center gap-2 mb-3 font-mono">
              <TrendingUp className="w-4 h-4 text-[#C7B5FF]" />
              <span>Trending Discovery Tags</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {trendingSearches.map((term) => (
                <button
                  key={term}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1B1B1D] hover:bg-[#202022] border border-white/[0.06] text-xs font-medium text-[#B4B1AB] hover:text-[#F1EEE7] transition group shadow-sm active:scale-95"
                  onClick={() => handleSelectQuery(term)}
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#C7B5FF] group-hover:scale-110 transition-transform" />
                  <span>{term}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* No Results Found */}
      {!isLoading && query && results.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-[#1B1B1D] border border-white/[0.06] flex items-center justify-center text-[#77756F] mx-auto mb-4">
            <Search className="w-8 h-8 opacity-60" />
          </div>
          <h3 className="text-lg font-semibold text-[#F1EEE7]">No results found for "{query}"</h3>
          <p className="text-xs text-[#77756F] mt-1 max-w-sm mx-auto">
            Try checking spelling, searching for a different artist, or importing local audio files into your library.
          </p>
        </div>
      )}
    </div>
  );
};
