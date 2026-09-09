import React from 'react';
import { Search, Settings, WifiOff, Download, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { NavigationTab, PlayerState } from '../../types/music';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

interface Props {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenSettings: () => void;
  playerState?: PlayerState;
  onOpenPlayer?: () => void;
}

export const Header: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  onOpenSettings,
  playerState,
  onOpenPlayer
}) => {
  const isOnline = useOnlineStatus();
  const { isInstallable, install } = usePWAInstall();

  const isPlaying = playerState?.isPlaying;
  const currentTrack = playerState?.currentTrack;

  return (
    <header
      id="app-top-header"
      className="sticky top-0 z-30 flex items-center justify-between px-3 sm:px-6 md:px-8 py-3 bg-[#18181A]/95 backdrop-blur-xl border-b border-white/[0.06] select-none transition-colors"
    >
      {/* Left: Aura Music Brand Logo & App Name */}
      <div className="flex items-center gap-4 min-w-0">
        <motion.div
          id="header-brand-logo"
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => onSelectTab('home')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Audiophile Minimalist Logo Icon */}
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#202022] border border-white/[0.08] shadow-md shrink-0 flex items-center justify-center group-hover:border-[#C7B5FF]/30 transition-colors">
            {/* Animated Audio Equalizer Bars */}
            <div className="flex items-end gap-[3px] z-10 px-1">
              <motion.span
                className="w-[3px] bg-[#C7B5FF] rounded-full"
                animate={{
                  height: isPlaying ? [6, 16, 8, 20, 10] : [8, 10, 8]
                }}
                transition={{
                  repeat: Infinity,
                  duration: isPlaying ? 0.9 : 2.5,
                  ease: 'easeInOut'
                }}
              />
              <motion.span
                className="w-[3px] bg-[#F1EEE7] rounded-full"
                animate={{
                  height: isPlaying ? [18, 8, 22, 12, 16] : [14, 16, 14]
                }}
                transition={{
                  repeat: Infinity,
                  duration: isPlaying ? 0.8 : 2.2,
                  ease: 'easeInOut',
                  delay: 0.15
                }}
              />
              <motion.span
                className="w-[3px] bg-[#C7B5FF] rounded-full"
                animate={{
                  height: isPlaying ? [12, 22, 10, 18, 8] : [10, 12, 10]
                }}
                transition={{
                  repeat: Infinity,
                  duration: isPlaying ? 1.0 : 2.8,
                  ease: 'easeInOut',
                  delay: 0.3
                }}
              />
              <motion.span
                className="w-[3px] bg-[#B4B1AB] rounded-full hidden sm:block"
                animate={{
                  height: isPlaying ? [8, 16, 6, 14, 10] : [6, 8, 6]
                }}
                transition={{
                  repeat: Infinity,
                  duration: isPlaying ? 0.75 : 2.0,
                  ease: 'easeInOut',
                  delay: 0.45
                }}
              />
            </div>
          </div>

          {/* App Name & Hi-Res Badge */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-sm sm:text-base font-bold tracking-wide text-[#F1EEE7] font-['Plus_Jakarta_Sans',sans-serif]">
                AURA
              </span>
              <span className="text-sm sm:text-base font-bold tracking-wide text-[#C7B5FF] font-['Plus_Jakarta_Sans',sans-serif]">
                MUSIC
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[9px] font-semibold tracking-widest text-[#77756F] uppercase font-mono">
                STUDIO HI-RES
              </span>
              <span className="w-1 h-1 rounded-full bg-[#C7B5FF]/80" />
            </div>
          </div>
        </motion.div>

        {/* Desktop Quick Search Trigger */}
        {activeTab !== 'search' && (
          <motion.button
            id="header-quick-search-btn"
            className="hidden lg:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#202022] hover:bg-[#262628] border border-white/[0.08] hover:border-white/[0.14] text-xs text-[#B4B1AB] hover:text-[#F1EEE7] transition group ml-2"
            onClick={() => onSelectTab('search')}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            <Search className="w-3.5 h-3.5 text-[#B4B1AB] group-hover:text-[#C7B5FF] transition-colors" />
            <span className="text-xs">Search songs, artists, albums...</span>
            <kbd className="px-1.5 py-0.5 rounded bg-[#262628] text-[10px] font-mono text-[#77756F] border border-white/5">
              /
            </kbd>
          </motion.button>
        )}
      </div>

      {/* Middle: Active Playing Song Bar */}
      {currentTrack && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-[#202022] hover:bg-[#262628] border border-white/[0.08] hover:border-[#C7B5FF]/30 cursor-pointer transition shadow-sm max-w-sm lg:max-w-md mx-2 truncate"
          onClick={onOpenPlayer}
          title="Click to open now playing"
        >
          <div className="flex items-end gap-1 shrink-0">
            <span className={`w-1 rounded-full bg-[#C7B5FF] ${isPlaying ? 'h-3 animate-pulse' : 'h-1.5'}`} />
            <span className={`w-1 rounded-full bg-[#F1EEE7] ${isPlaying ? 'h-4 animate-bounce' : 'h-2'}`} />
            <span className={`w-1 rounded-full bg-[#77756F] ${isPlaying ? 'h-2.5 animate-pulse' : 'h-1'}`} />
          </div>
          <div className="min-w-0 flex-1 truncate">
            <span className="text-xs font-semibold text-[#F1EEE7] truncate inline-block max-w-[140px] sm:max-w-[180px]">
              {currentTrack.title}
            </span>
            <span className="text-[11px] text-[#B4B1AB] ml-1.5 truncate">
              • {currentTrack.artist}
            </span>
          </div>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-[#262628] text-[#B4B1AB] border border-white/[0.06] shrink-0 font-mono">
            {currentTrack.source === 'local' ? 'Local' : 'Hi-Fi'}
          </span>
        </motion.div>
      )}

      {/* Right: Status Pills & Action Icons */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Mobile Search Button */}
        {activeTab !== 'search' && (
          <button
            id="header-mobile-search-btn"
            aria-label="Search"
            className="lg:hidden p-2 rounded-full text-[#B4B1AB] hover:text-[#F1EEE7] hover:bg-white/[0.06] transition"
            onClick={() => onSelectTab('search')}
          >
            <Search className="w-4 h-4 text-[#C7B5FF]" />
          </button>
        )}

        {/* Hi-Res Audio Format Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#202022] text-[#B4B1AB] border border-white/[0.08] font-mono">
          <Sparkles className="w-3 h-3 text-[#C7B5FF]" />
          <span>24-BIT FLAC</span>
        </div>

        {/* Offline Badge */}
        {!isOnline && (
          <div
            id="header-offline-pill"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20 animate-pulse"
          >
            <WifiOff className="w-3 h-3" />
            <span className="hidden sm:inline">Offline Mode</span>
          </div>
        )}

        {/* PWA Install Button */}
        {isInstallable && (
          <motion.button
            id="header-install-btn"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#262628] hover:bg-[#2D2D30] text-[#F1EEE7] border border-white/[0.08] transition shadow-sm"
            onClick={install}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Download className="w-3.5 h-3.5 text-[#C7B5FF]" />
            <span className="hidden sm:inline">Install App</span>
          </motion.button>
        )}

        {/* Settings button */}
        <motion.button
          id="header-settings-btn"
          aria-label="Open settings"
          className="p-2 rounded-full text-[#B4B1AB] hover:text-[#F1EEE7] hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] transition"
          onClick={onOpenSettings}
          whileHover={{ rotate: 30, scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
        </motion.button>

        {/* Audiophile Profile Avatar */}
        <div className="w-8 h-8 rounded-full bg-[#202022] border border-white/[0.08] flex items-center justify-center text-[#C7B5FF] text-xs font-bold font-mono shrink-0 shadow-sm">
          AU
        </div>
      </div>
    </header>
  );
};
