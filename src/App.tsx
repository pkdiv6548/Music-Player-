import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/navigation/Sidebar';
import { Header } from './components/navigation/Header';
import { BottomNav } from './components/navigation/BottomNav';
import { MiniPlayer } from './components/player/MiniPlayer';
import { ExpandedPlayer } from './components/player/ExpandedPlayer';
import { FullscreenMobilePlayer } from './components/player/FullscreenMobilePlayer';
import { QueueDrawer } from './components/player/QueueDrawer';
import { LyricsModal } from './components/player/LyricsModal';
import { HomeView } from './components/views/HomeView';
import { ExploreView } from './components/views/ExploreView';
import { SearchView } from './components/views/SearchView';
import { LibraryView } from './components/views/LibraryView';
import { LikedSongsView } from './components/views/LikedSongsView';
import { LocalMusicView } from './components/views/LocalMusicView';
import { SettingsModal } from './components/views/SettingsModal';

import {
  Track,
  Playlist,
  NavigationTab,
  PlayerState
} from './types/music';

import { playerEngine } from './services/playerEngine';

import {
  getAllTracksFromDB,
  getPlaylistsFromDB,
  getLikedTracksFromDB,
  saveLikedTrackToDB,
  removeLikedTrackFromDB,
  getSettingsFromDB
} from './services/indexedDb';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');

  const [playerState, setPlayerState] = useState<PlayerState>(
    playerEngine.getState()
  );

  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);
  const [likedTrackIds, setLikedTrackIds] = useState<Set<string>>(new Set());
  const [localTracks, setLocalTracks] = useState<Track[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] =
    useState<Playlist | null>(null);

  // Modal & Drawer visibility
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isExpandedPlayerOpen, setIsExpandedPlayerOpen] = useState(false);
  const [isMobileFullscreenOpen, setIsMobileFullscreenOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // ---------------------------------------------------------
  // Player Engine Subscription
  // ---------------------------------------------------------
  useEffect(() => {
    const unsubscribe = playerEngine.subscribe((state) => {
      setPlayerState(state);
    });

    return () => unsubscribe();
  }, []);

  // ---------------------------------------------------------
  // IMPORTANT:
  // Persistent YouTube IFrame container
  //
  // playerEngine.ts expects:
  // document.getElementById('aura-yt-player')
  //
  // Keep this element mounted permanently so the YouTube
  // IFrame API can initialize even when the player UI is closed.
  // ---------------------------------------------------------
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 30;

    const mountYouTubePlayer = () => {
      attempts += 1;

      try {
        playerEngine.mountYouTubePlayer();
      } catch (error) {
        console.warn(
          'YouTube player initialization attempt failed:',
          error
        );
      }

      // Stop retrying after a reasonable amount of time.
      if (attempts >= maxAttempts) {
        clearInterval(intervalId);
      }
    };

    // First attempt after DOM mount.
    const initialTimeout = window.setTimeout(() => {
      mountYouTubePlayer();
    }, 100);

    // Keep trying because the YouTube IFrame API loads asynchronously.
    const intervalId = window.setInterval(() => {
      mountYouTubePlayer();
    }, 500);

    return () => {
      window.clearTimeout(initialTimeout);
      window.clearInterval(intervalId);
    };
  }, []);

  // ---------------------------------------------------------
  // Initial Data Fetch from IndexedDB
  // ---------------------------------------------------------
  const refreshLibraryData = useCallback(async () => {
    try {
      const [
        allTracks,
        userPlaylists,
        savedLiked,
        settings
      ] = await Promise.all([
        getAllTracksFromDB(),
        getPlaylistsFromDB(),
        getLikedTracksFromDB(),
        getSettingsFromDB()
      ]);

      const locals = allTracks.filter(
        (track) => track.source === 'local'
      );

      setLocalTracks(locals);
      setPlaylists(userPlaylists);
      setLikedTracks(savedLiked);
      setLikedTrackIds(
        new Set(savedLiked.map((track) => track.id))
      );

      // Apply equalizer preset
      if (settings.equalizerPreset) {
        playerEngine.setEqualizerPreset(
          settings.equalizerPreset
        );
      }

      // Apply background playback setting
      if (typeof settings.backgroundPlayback === 'boolean') {
        playerEngine.setBackgroundPlaybackEnabled(
          settings.backgroundPlayback
        );
      }
    } catch (error) {
      console.error(
        'Error fetching data from IndexedDB:',
        error
      );
    }
  }, []);

  useEffect(() => {
    refreshLibraryData();
  }, [refreshLibraryData]);

  // ---------------------------------------------------------
  // Like / Favorite Handler
  // ---------------------------------------------------------
  const handleToggleLike = async (track: Track) => {
    const isCurrentlyLiked = likedTrackIds.has(track.id);

    if (isCurrentlyLiked) {
      await removeLikedTrackFromDB(track.id);

      setLikedTrackIds((previous) => {
        const next = new Set(previous);
        next.delete(track.id);
        return next;
      });

      setLikedTracks((previous) =>
        previous.filter((item) => item.id !== track.id)
      );
    } else {
      await saveLikedTrackToDB(track);

      setLikedTrackIds(
        (previous) =>
          new Set(previous).add(track.id)
      );

      setLikedTracks((previous) => [
        track,
        ...previous.filter((item) => item.id !== track.id)
      ]);
    }
  };

  // ---------------------------------------------------------
  // Keyboard Shortcuts
  // ---------------------------------------------------------
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;

      if (
        target &&
        (
          ['INPUT', 'TEXTAREA'].includes(target.tagName) ||
          target.isContentEditable
        )
      ) {
        return;
      }

      switch (event.code) {
        case 'Space':
          event.preventDefault();
          playerEngine.togglePlayPause();
          break;

        case 'ArrowRight':
          event.preventDefault();
          playerEngine.seek(
            playerState.currentTime + 5
          );
          break;

        case 'ArrowLeft':
          event.preventDefault();
          playerEngine.seek(
            Math.max(
              0,
              playerState.currentTime - 5
            )
          );
          break;

        case 'KeyM':
          playerEngine.toggleMute();
          break;

        case 'KeyL':
          if (playerState.currentTrack) {
            setIsLyricsOpen((previous) => !previous);
          }
          break;

        case 'KeyQ':
          setIsQueueOpen((previous) => !previous);
          break;

        case 'Slash':
          event.preventDefault();
          setActiveTab('search');
          break;

        default:
          break;
      }
    };

    window.addEventListener(
      'keydown',
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown
      );
    };
  }, [
    playerState.currentTime,
    playerState.currentTrack
  ]);

  // ---------------------------------------------------------
  // Open Player
  // ---------------------------------------------------------
  const handleOpenPlayer = () => {
    if (window.innerWidth < 768) {
      setIsMobileFullscreenOpen(true);
    } else {
      setIsExpandedPlayerOpen(true);
    }
  };

  const isCurrentTrackLiked =
    playerState.currentTrack
      ? likedTrackIds.has(
          playerState.currentTrack.id
        )
      : false;

  // ---------------------------------------------------------
  // Render
  // ---------------------------------------------------------
  return (
    <div
      id="aura-music-app"
      className="
        flex
        h-screen
        w-screen
        bg-[#151515]
        text-[#F1EEE7]
        overflow-hidden
        font-sans
        relative
      "
    >

      {/* =====================================================
          Background
      ====================================================== */}
      <div
        className="
          fixed
          inset-0
          bg-gradient-to-b
          from-[#18181A]
          via-[#151515]
          to-[#121214]
          pointer-events-none
          z-0
        "
      />

      {/* =====================================================
          HIDDEN / PERSISTENT YOUTUBE PLAYER HOST

          IMPORTANT:
          playerEngine.ts uses:
          #aura-yt-player

          Do NOT remove this element.
      ====================================================== */}
      <div
        id="aura-yt-player"
        aria-hidden="true"
        className="
          fixed
          left-[-9999px]
          top-0
          w-[320px]
          h-[240px]
          opacity-0
          pointer-events-none
          overflow-hidden
        "
      />

      {/* =====================================================
          Desktop Sidebar
      ====================================================== */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setSelectedPlaylist(null);
          setActiveTab(tab);
        }}
        playlists={playlists}
        onSelectPlaylist={(playlist) => {
          setSelectedPlaylist(playlist);
          setActiveTab('library');
        }}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() =>
          setIsSidebarCollapsed(
            (previous) => !previous
          )
        }
        onOpenSettings={() =>
          setIsSettingsOpen(true)
        }
      />

      {/* =====================================================
          Main Application Area
      ====================================================== */}
      <div
        className="
          flex-1
          flex
          flex-col
          h-full
          overflow-hidden
          min-w-0
          relative
        "
      >

        {/* ===================================================
            Header
        ==================================================== */}
        <Header
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setSelectedPlaylist(null);
            setActiveTab(tab);
          }}
          onOpenSettings={() =>
            setIsSettingsOpen(true)
          }
          playerState={playerState}
          onOpenPlayer={handleOpenPlayer}
        />

        {/* ===================================================
            Main Scroll Area
        ==================================================== */}
        <main
          id="main-scroll-view"
          className="
            flex-1
            overflow-y-auto
            overflow-x-hidden
            p-4
            sm:p-6
            md:p-8
            scroll-smooth
          "
        >
          <div
            className="
              max-w-7xl
              mx-auto
            "
          >

            {/* ===============================================
                HOME
            ================================================ */}
            {activeTab === 'home' && (
              <HomeView
                playerState={playerState}
                likedTrackIds={likedTrackIds}
                localTracks={localTracks}
                onToggleLike={handleToggleLike}
                onSelectTab={setActiveTab}
              />
            )}

            {/* ===============================================
                EXPLORE
            ================================================ */}
            {activeTab === 'explore' && (
              <ExploreView
                playerState={playerState}
                likedTrackIds={likedTrackIds}
                onToggleLike={handleToggleLike}
              />
            )}

            {/* ===============================================
                SEARCH
            ================================================ */}
            {activeTab === 'search' && (
              <SearchView
                playerState={playerState}
                likedTrackIds={likedTrackIds}
                localTracks={localTracks}
                onToggleLike={handleToggleLike}
                onOpenSettings={() =>
                  setIsSettingsOpen(true)
                }
              />
            )}

            {/* ===============================================
                LIBRARY
            ================================================ */}
            {activeTab === 'library' && (
              <LibraryView
                playerState={playerState}
                playlists={playlists}
                likedTracks={likedTracks}
                localTracks={localTracks}
                onUpdatePlaylists={
                  refreshLibraryData
                }
                likedTrackIds={likedTrackIds}
                onToggleLike={handleToggleLike}
                activePlaylistProp={
                  selectedPlaylist
                }
              />
            )}

            {/* ===============================================
                LIKED SONGS
            ================================================ */}
            {activeTab === 'liked' && (
              <LikedSongsView
                playerState={playerState}
                likedTracks={likedTracks}
                onToggleLike={handleToggleLike}
              />
            )}

            {/* ===============================================
                LOCAL MUSIC
            ================================================ */}
            {activeTab === 'local' && (
              <LocalMusicView
                playerState={playerState}
                localTracks={localTracks}
                onRefreshLocalTracks={
                  refreshLibraryData
                }
                likedTrackIds={likedTrackIds}
                onToggleLike={handleToggleLike}
              />
            )}

          </div>
        </main>

        {/* ===================================================
            Floating Mini Player
        ==================================================== */}
        <MiniPlayer
          playerState={playerState}
          isLiked={isCurrentTrackLiked}
          onToggleLike={() => {
            if (playerState.currentTrack) {
              handleToggleLike(
                playerState.currentTrack
              );
            }
          }}
          onExpand={handleOpenPlayer}
        />

        {/* ===================================================
            Mobile Bottom Navigation
        ==================================================== */}
        <BottomNav
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setSelectedPlaylist(null);
            setActiveTab(tab);
          }}
        />

      </div>

      {/* =====================================================
          Desktop Expanded Player
      ====================================================== */}
      {isExpandedPlayerOpen && (
        <ExpandedPlayer
          playerState={playerState}
          isLiked={isCurrentTrackLiked}
          onToggleLike={() => {
            if (playerState.currentTrack) {
              handleToggleLike(
                playerState.currentTrack
              );
            }
          }}
          onClose={() =>
            setIsExpandedPlayerOpen(false)
          }
          onOpenQueue={() =>
            setIsQueueOpen(true)
          }
          onOpenLyrics={() =>
            setIsLyricsOpen(true)
          }
        />
      )}

      {/* =====================================================
          Mobile Fullscreen Player
      ====================================================== */}
      {isMobileFullscreenOpen && (
        <FullscreenMobilePlayer
          playerState={playerState}
          isLiked={isCurrentTrackLiked}
          onToggleLike={() => {
            if (playerState.currentTrack) {
              handleToggleLike(
                playerState.currentTrack
              );
            }
          }}
          onClose={() =>
            setIsMobileFullscreenOpen(false)
          }
          onOpenQueue={() =>
            setIsQueueOpen(true)
          }
          onOpenLyrics={() =>
            setIsLyricsOpen(true)
          }
        />
      )}

      {/* =====================================================
          Queue Drawer
      ====================================================== */}
      <QueueDrawer
        playerState={playerState}
        isOpen={isQueueOpen}
        onClose={() =>
          setIsQueueOpen(false)
        }
      />

      {/* =====================================================
          Lyrics Modal
      ====================================================== */}
      <LyricsModal
        track={playerState.currentTrack}
        currentTime={playerState.currentTime}
        isOpen={isLyricsOpen}
        onClose={() =>
          setIsLyricsOpen(false)
        }
      />

      {/* =====================================================
          Settings Modal
      ====================================================== */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() =>
          setIsSettingsOpen(false)
        }
      />

    </div>
  );
  }    }
  }, []);

  useEffect(() => {
    refreshLibraryData();
  }, [refreshLibraryData]);

  // Like / Favorite handler
  const handleToggleLike = async (track: Track) => {
    const isCurrentlyLiked = likedTrackIds.has(track.id);
    if (isCurrentlyLiked) {
      await removeLikedTrackFromDB(track.id);
      setLikedTrackIds((prev) => {
        const next = new Set(prev);
        next.delete(track.id);
        return next;
      });
      setLikedTracks((prev) => prev.filter((t) => t.id !== track.id));
    } else {
      await saveLikedTrackToDB(track);
      setLikedTrackIds((prev) => new Set(prev).add(track.id));
      setLikedTracks((prev) => [track, ...prev.filter((t) => t.id !== track.id)]);
    }
  };

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input or textarea
      if (
        ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName) ||
        (e.target as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          playerEngine.togglePlayPause();
          break;
        case 'ArrowRight':
          e.preventDefault();
          playerEngine.seek(playerState.currentTime + 5);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          playerEngine.seek(Math.max(0, playerState.currentTime - 5));
          break;
        case 'KeyM':
          playerEngine.toggleMute();
          break;
        case 'KeyL':
          if (playerState.currentTrack) {
            setIsLyricsOpen((prev) => !prev);
          }
          break;
        case 'KeyQ':
          setIsQueueOpen((prev) => !prev);
          break;
        case 'Slash':
          e.preventDefault();
          setActiveTab('search');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerState.currentTime, playerState.currentTrack]);

  // Open Player modal adaptively based on screen width
  const handleOpenPlayer = () => {
    if (window.innerWidth < 768) {
      setIsMobileFullscreenOpen(true);
    } else {
      setIsExpandedPlayerOpen(true);
    }
  };

  const isCurrentTrackLiked = playerState.currentTrack
    ? likedTrackIds.has(playerState.currentTrack.id)
    : false;

  return (
    <div id="aura-music-app" className="flex h-screen w-screen bg-[#151515] text-[#F1EEE7] overflow-hidden font-sans relative">
      {/* Subtle audiophile tonal depth gradient */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#18181A] via-[#151515] to-[#121214] pointer-events-none z-0" />

      {/* Desktop Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setSelectedPlaylist(null);
          setActiveTab(tab);
        }}
        playlists={playlists}
        onSelectPlaylist={(pl) => {
          setSelectedPlaylist(pl);
          setActiveTab('library');
        }}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0 relative">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setSelectedPlaylist(null);
            setActiveTab(tab);
          }}
          onOpenSettings={() => setIsSettingsOpen(true)}
          playerState={playerState}
          onOpenPlayer={handleOpenPlayer}
        />

        {/* Scrollable View Containers */}
        <main
          id="main-scroll-view"
          className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 md:p-8 scroll-smooth"
        >
          <div className="max-w-7xl mx-auto">
            {activeTab === 'home' && (
              <HomeView
                playerState={playerState}
                likedTrackIds={likedTrackIds}
                localTracks={localTracks}
                onToggleLike={handleToggleLike}
                onSelectTab={setActiveTab}
              />
            )}

            {activeTab === 'explore' && (
              <ExploreView
                playerState={playerState}
                likedTrackIds={likedTrackIds}
                onToggleLike={handleToggleLike}
              />
            )}

            {activeTab === 'search' && (
              <SearchView
                playerState={playerState}
                likedTrackIds={likedTrackIds}
                localTracks={localTracks}
                onToggleLike={handleToggleLike}
                onOpenSettings={() => setIsSettingsOpen(true)}
              />
            )}

            {activeTab === 'library' && (
              <LibraryView
                playerState={playerState}
                playlists={playlists}
                likedTracks={likedTracks}
                localTracks={localTracks}
                onUpdatePlaylists={refreshLibraryData}
                likedTrackIds={likedTrackIds}
                onToggleLike={handleToggleLike}
                activePlaylistProp={selectedPlaylist}
              />
            )}

            {activeTab === 'liked' && (
              <LikedSongsView
                playerState={playerState}
                likedTracks={likedTracks}
                onToggleLike={handleToggleLike}
              />
            )}

            {activeTab === 'local' && (
              <LocalMusicView
                playerState={playerState}
                localTracks={localTracks}
                onRefreshLocalTracks={refreshLibraryData}
                likedTrackIds={likedTrackIds}
                onToggleLike={handleToggleLike}
              />
            )}
          </div>
        </main>

        {/* Floating MiniPlayer Bar */}
        <MiniPlayer
          playerState={playerState}
          isLiked={isCurrentTrackLiked}
          onToggleLike={() => {
            if (playerState.currentTrack) {
              handleToggleLike(playerState.currentTrack);
            }
          }}
          onExpand={handleOpenPlayer}
        />

        {/* Mobile Bottom Navigation Bar */}
        <BottomNav
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setSelectedPlaylist(null);
            setActiveTab(tab);
          }}
        />
      </div>

      {/* Desktop Expanded Player Modal */}
      {isExpandedPlayerOpen && (
        <ExpandedPlayer
          playerState={playerState}
          isLiked={isCurrentTrackLiked}
          onToggleLike={() => {
            if (playerState.currentTrack) {
              handleToggleLike(playerState.currentTrack);
            }
          }}
          onClose={() => setIsExpandedPlayerOpen(false)}
          onOpenQueue={() => setIsQueueOpen(true)}
          onOpenLyrics={() => setIsLyricsOpen(true)}
        />
      )}

      {/* Mobile Fullscreen Player View */}
      {isMobileFullscreenOpen && (
        <FullscreenMobilePlayer
          playerState={playerState}
          isLiked={isCurrentTrackLiked}
          onToggleLike={() => {
            if (playerState.currentTrack) {
              handleToggleLike(playerState.currentTrack);
            }
          }}
          onClose={() => setIsMobileFullscreenOpen(false)}
          onOpenQueue={() => setIsQueueOpen(true)}
          onOpenLyrics={() => setIsLyricsOpen(true)}
        />
      )}

      {/* Queue Drawer */}
      <QueueDrawer
        playerState={playerState}
        isOpen={isQueueOpen}
        onClose={() => setIsQueueOpen(false)}
      />

      {/* Lyrics Modal */}
      <LyricsModal
        track={playerState.currentTrack}
        currentTime={playerState.currentTime}
        isOpen={isLyricsOpen}
        onClose={() => setIsLyricsOpen(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
