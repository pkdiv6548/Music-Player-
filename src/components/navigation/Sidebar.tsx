import React from 'react';
import {
  Home,
  Search,
  Compass,
  Library,
  Heart,
  HardDrive,
  ListMusic,
  Settings,
  Download,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { NavigationTab, Playlist } from '../../types/music';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface Props {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  playlists: Playlist[];
  onSelectPlaylist?: (playlist: Playlist) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  playlists,
  onSelectPlaylist,
  isCollapsed,
  onToggleCollapse,
  onOpenSettings
}) => {
  const { isInstallable, install } = usePWAInstall();

  const navItems: Array<{ id: NavigationTab; label: string; icon: React.ReactNode }> = [
    { id: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { id: 'search', label: 'Search', icon: <Search className="w-4 h-4" /> },
    { id: 'explore', label: 'Explore', icon: <Compass className="w-4 h-4" /> },
    { id: 'library', label: 'Your Library', icon: <Library className="w-4 h-4" /> },
    { id: 'liked', label: 'Liked Songs', icon: <Heart className="w-4 h-4" /> },
    { id: 'local', label: 'Local Music', icon: <HardDrive className="w-4 h-4" /> }
  ];

  return (
    <aside
      id="desktop-sidebar"
      className={`hidden md:flex flex-col h-full bg-[#18181A] border-r border-white/[0.06] select-none transition-all duration-300 z-30 shrink-0 ${
        isCollapsed ? 'w-20' : 'w-60'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
        <div
          className="flex items-center gap-3 cursor-pointer overflow-hidden"
          onClick={() => onSelectTab('home')}
        >
          {/* Logo Mark */}
          <div className="w-9 h-9 rounded-xl bg-[#202022] border border-white/[0.08] shadow-sm shrink-0 flex items-center justify-center">
            <div className="flex items-end gap-[2px]">
              <span className="w-[3px] bg-[#C7B5FF] rounded-full h-3" />
              <span className="w-[3px] bg-[#F1EEE7] rounded-full h-4.5" />
              <span className="w-[3px] bg-[#77756F] rounded-full h-2" />
            </div>
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <h1 className="text-sm font-bold tracking-wide text-[#F1EEE7] flex items-center gap-1.5 font-['Plus_Jakarta_Sans',sans-serif]">
                AURA <span className="text-[10px] font-bold uppercase tracking-widest text-[#C7B5FF] font-mono">MUSIC</span>
              </h1>
              <p className="text-[10px] text-[#77756F] font-mono">Studio Audiophile</p>
            </div>
          )}
        </div>

        <button
          id="sidebar-collapse-toggle-btn"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="p-1.5 rounded-lg text-[#77756F] hover:text-[#F1EEE7] hover:bg-white/[0.04] transition"
          onClick={onToggleCollapse}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-link-${item.id}`}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-[#262628] text-[#F1EEE7] border border-white/[0.08] shadow-sm'
                  : 'text-[#B4B1AB] hover:text-[#F1EEE7] hover:bg-white/[0.04] border border-transparent'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
              onClick={() => onSelectTab(item.id)}
              title={item.label}
            >
              <div className={`shrink-0 ${isActive ? 'text-[#C7B5FF]' : 'text-[#77756F]'}`}>
                {item.icon}
              </div>
              {!isCollapsed && <span className="truncate">{item.label}</span>}
              {!isCollapsed && isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#C7B5FF]" />
              )}
            </button>
          );
        })}

        {/* User Playlists Divider */}
        {!isCollapsed && (
          <div className="pt-6 pb-2">
            <div className="flex items-center justify-between px-3 text-[10px] font-bold uppercase tracking-wider text-[#77756F] font-mono">
              <span>Playlists</span>
              <button
                aria-label="Create new playlist"
                className="hover:text-[#F1EEE7] transition-colors"
                onClick={() => onSelectTab('library')}
              >
                +
              </button>
            </div>
            <div className="mt-2 space-y-0.5 max-h-48 overflow-y-auto">
              {playlists.map((pl) => (
                <button
                  key={pl.id}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-[#B4B1AB] hover:text-[#F1EEE7] hover:bg-white/[0.04] truncate text-left transition"
                  onClick={() => {
                    onSelectTab('library');
                    if (onSelectPlaylist) onSelectPlaylist(pl);
                  }}
                >
                  <ListMusic className="w-3.5 h-3.5 text-[#77756F] shrink-0" />
                  <span className="truncate">{pl.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Sidebar Footer: Install PWA & Settings */}
      <div className="p-3 border-t border-white/[0.06] space-y-2">
        {isInstallable && (
          <button
            id="sidebar-install-pwa-btn"
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#F1EEE7] bg-[#202022] hover:bg-[#262628] border border-white/[0.08] transition ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
            onClick={install}
            title="Install Aura Music App"
          >
            <Download className="w-3.5 h-3.5 text-[#C7B5FF] shrink-0" />
            {!isCollapsed && <span>Install PWA App</span>}
          </button>
        )}

        <button
          id="sidebar-settings-btn"
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#B4B1AB] hover:text-[#F1EEE7] hover:bg-white/[0.04] transition ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
          onClick={onOpenSettings}
          title="App Settings"
        >
          <Settings className="w-3.5 h-3.5 text-[#77756F] shrink-0" />
          {!isCollapsed && <span>Settings & Audio</span>}
        </button>
      </div>
    </aside>
  );
};
