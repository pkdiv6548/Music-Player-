import React, { useState, useEffect } from 'react';
import {
  X,
  Key,
  Sliders,
  Sparkles,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { UserSettings, EqualizerPresetKey } from '../../types/music';
import { playerEngine } from '../../services/playerEngine';
import { saveSettingsToDB, getSettingsFromDB } from '../../services/indexedDb';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'dark',
    equalizerPreset: 'electronic',
    backgroundPlayback: true,
    volume: 0.8,
    audioQuality: 'lossless'
  });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const { isInstallable, install } = usePWAInstall();

  useEffect(() => {
    if (isOpen) {
      getSettingsFromDB().then((st) => {
        setSettings(st);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    await saveSettingsToDB(settings);
    if (settings.equalizerPreset) {
      playerEngine.setEqualizerPreset(settings.equalizerPreset);
    }
    if (typeof settings.backgroundPlayback === 'boolean') {
      playerEngine.setBackgroundPlaybackEnabled(settings.backgroundPlayback);
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const eqPresets: Array<{ id: EqualizerPresetKey; label: string }> = [
    { id: 'flat', label: 'Flat (Neutral Reference)' },
    { id: 'bass', label: 'Bass Boost (Dynamic Lows)' },
    { id: 'treble', label: 'Treble Boost (Bright Vocals)' },
    { id: 'vocal', label: 'Vocal Clarity (Podcasts & Acoustic)' },
    { id: 'electronic', label: 'Electronic & Dance (Club Vibe)' },
    { id: 'rock', label: 'Rock & Live Stage' },
    { id: 'classical', label: 'Classical & Orchestral Space' }
  ];

  return (
    <div
      id="settings-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in select-none"
      onClick={onClose}
    >
      <div
        id="settings-modal-panel"
        className="relative w-full max-w-xl max-h-[90vh] rounded-[28px] bg-[#18181A] border border-white/[0.08] shadow-2xl p-6 sm:p-8 flex flex-col overflow-hidden text-[#F1EEE7]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#202022] text-[#C7B5FF] flex items-center justify-center border border-white/[0.06]">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#F1EEE7] leading-none font-['Plus_Jakarta_Sans',sans-serif]">Settings & Audio Engine</h2>
              <p className="text-xs text-[#77756F] mt-1 font-mono">Configure audio DSP, PWA, and YouTube integration</p>
            </div>
          </div>
          <button
            id="settings-close-btn"
            aria-label="Close settings"
            className="p-2 rounded-full text-[#77756F] hover:text-[#F1EEE7] hover:bg-white/[0.06] transition"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto py-5 space-y-5 no-scrollbar">
          {/* YouTube Data API Key Configuration */}
          <div className="p-4 rounded-2xl bg-[#202022] border border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#F1EEE7] font-semibold text-sm">
                <Key className="w-4 h-4 text-[#C7B5FF]" />
                <span>YouTube Data API v3 Key</span>
              </div>
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[11px] text-[#C7B5FF] hover:underline font-mono"
              >
                <span>Get Free Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-xs text-[#77756F] leading-relaxed">
              Provides direct live catalog search across millions of tracks. If left blank, the app will utilize its rich curated catalog and local music storage.
            </p>
            <input
              id="settings-api-key-input"
              type="password"
              placeholder="AIzaSy... (YouTube API Key)"
              value={settings.youtubeApiKey || ''}
              onChange={(e) => setSettings({ ...settings, youtubeApiKey: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#151515] border border-white/[0.08] text-[#F1EEE7] text-xs placeholder-[#77756F] focus:outline-none focus:border-[#C7B5FF] font-mono"
            />
          </div>

          {/* Equalizer DSP Preset */}
          <div className="p-4 rounded-2xl bg-[#202022] border border-white/[0.06] space-y-3">
            <div className="flex items-center gap-2 text-[#F1EEE7] font-semibold text-sm">
              <Sparkles className="w-4 h-4 text-[#C7B5FF]" />
              <span>Web Audio DSP Equalizer</span>
            </div>
            <p className="text-xs text-[#77756F]">
              Hardware-accelerated 3-band biquad filter applying parametric real-time shaping to audio output.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {eqPresets.map((preset) => {
                const isSelected = settings.equalizerPreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    className={`px-3 py-2.5 rounded-xl text-xs font-medium text-left transition border ${
                      isSelected
                        ? 'bg-[#262628] text-[#F1EEE7] border-[#C7B5FF]/50 shadow-sm'
                        : 'bg-[#151515] text-[#77756F] border-white/[0.04] hover:text-[#B4B1AB] hover:bg-[#1B1B1D]'
                    }`}
                    onClick={() => {
                      setSettings({ ...settings, equalizerPreset: preset.id });
                      playerEngine.setEqualizerPreset(preset.id);
                    }}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Background Playback Toggle */}
          <div className="p-4 rounded-2xl bg-[#202022] border border-white/[0.06] flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-sm font-semibold text-[#F1EEE7] block">
                Continuous Mobile Background Playback
              </span>
              <p className="text-xs text-[#77756F]">
                Uses silent audio carrier loops & MediaSession API to keep audio playing when screen is locked or tab is switched.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                id="settings-background-play-toggle"
                type="checkbox"
                checked={settings.backgroundPlayback}
                onChange={(e) =>
                  setSettings({ ...settings, backgroundPlayback: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#F1EEE7] after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C7B5FF]" />
            </label>
          </div>

          {/* Install PWA Prompt */}
          {isInstallable && (
            <div className="p-4 rounded-2xl bg-[#202022] border border-white/[0.08] flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-sm font-semibold text-[#F1EEE7] block">
                  Install Progressive Web App (PWA)
                </span>
                <p className="text-xs text-[#77756F]">
                  Enjoy standalone desktop and mobile experience with fast local launch and offline storage.
                </p>
              </div>
              <button
                className="px-4 py-2 rounded-full bg-[#F1EEE7] text-[#151515] font-bold text-xs shrink-0 shadow-md hover:bg-[#EAE6DF] transition active:scale-95 cursor-pointer"
                onClick={install}
              >
                Install Now
              </button>
            </div>
          )}

          {/* App Info & Specifications */}
          <div className="space-y-2 text-xs text-[#77756F] pt-2 border-t border-white/[0.06] font-mono">
            <div className="flex items-center justify-between">
              <span>Aura Music Client Version</span>
              <span className="text-[#B4B1AB]">v2.4.0 Studio PWA</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Storage Technology</span>
              <span className="text-[#B4B1AB]">IndexedDB + CacheStorage</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Audio Engines</span>
              <span className="text-[#B4B1AB]">HTML5 Audio + Web Audio API</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.06] shrink-0">
          <button
            id="settings-cancel-btn"
            className="px-5 py-2.5 rounded-full text-xs font-semibold text-[#77756F] hover:text-[#F1EEE7] transition active:scale-95 cursor-pointer"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            id="settings-save-btn"
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-[#F1EEE7] hover:bg-[#EAE6DF] text-[#151515] text-xs font-bold shadow-lg transition active:scale-95 cursor-pointer"
            onClick={handleSave}
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
