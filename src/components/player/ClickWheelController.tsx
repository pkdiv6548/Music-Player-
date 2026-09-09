import React, { useRef, useState, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Shuffle } from 'lucide-react';

interface Props {
  isPlaying: boolean;
  shuffleMode: boolean;
  onTogglePlayPause: () => void;
  onNextTrack: () => void;
  onPreviousTrack: () => void;
  onToggleShuffle: () => void;
  onWheelScrub?: (deltaSeconds: number) => void;
  className?: string;
  size?: number; // size in pixels, default 260
}

export const ClickWheelController: React.FC<Props> = ({
  isPlaying,
  shuffleMode,
  onTogglePlayPause,
  onNextTrack,
  onPreviousTrack,
  onToggleShuffle,
  onWheelScrub,
  className = '',
  size = 260
}) => {
  const wheelRef = useRef<HTMLDivElement | null>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const lastAngleRef = useRef<number | null>(null);
  const [activeButton, setActiveButton] = useState<string | null>(null);

  // Trigger gentle haptic tap if available
  const triggerHaptic = useCallback(() => {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(6);
      }
    } catch {
      // Ignore vibration error
    }
  }, []);

  // Pointer drag for wheel scrubbing (rotational gesture)
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!wheelRef.current) return;
    const rect = wheelRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Only scrub if touching the outer wheel ring (not the center button)
    const centerRadius = (size * 0.35) / 2;
    const outerRadius = size / 2;

    if (dist >= centerRadius && dist <= outerRadius + 15) {
      setIsScrubbing(true);
      lastAngleRef.current = Math.atan2(dy, dx);
      (e.target as HTMLElement)?.setPointerCapture?.(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isScrubbing || !wheelRef.current || lastAngleRef.current === null) return;
    const rect = wheelRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    const currentAngle = Math.atan2(dy, dx);

    let deltaAngle = currentAngle - lastAngleRef.current;
    // Normalize across -PI / PI boundary
    if (deltaAngle > Math.PI) deltaAngle -= 2 * Math.PI;
    if (deltaAngle < -Math.PI) deltaAngle += 2 * Math.PI;

    // Threshold to register scrub
    if (Math.abs(deltaAngle) > 0.08) {
      // 1 full revolution (2*PI) = ~30 seconds scrub
      const deltaSeconds = (deltaAngle / (2 * Math.PI)) * 30;
      if (onWheelScrub) {
        onWheelScrub(deltaSeconds);
      }
      triggerHaptic();
      lastAngleRef.current = currentAngle;
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isScrubbing) {
      setIsScrubbing(false);
      lastAngleRef.current = null;
      try {
        (e.target as HTMLElement)?.releasePointerCapture?.(e.pointerId);
      } catch {
        // Ignore
      }
    }
  };

  return (
    <div
      ref={wheelRef}
      id="ipod-click-wheel"
      className={`relative select-none flex items-center justify-center rounded-full cursor-grab active:cursor-grabbing transition-transform ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        aspectRatio: '1 / 1',
        borderRadius: '50%',
        backgroundColor: '#1B1B1D',
        boxShadow:
          '16px 16px 32px #0e0e10, -16px -16px 32px #26262a, inset 0 1px 1px rgba(255, 255, 255, 0.06)',
        border: '1px solid rgba(255, 255, 255, 0.04)'
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Top Button: Shuffle */}
      <button
        id="wheel-shuffle-btn"
        aria-label="Toggle shuffle"
        className={`absolute top-4 left-1/2 -translate-x-1/2 p-2 rounded-full transition-all duration-150 z-10 flex flex-col items-center ${
          activeButton === 'shuffle' ? 'scale-90 opacity-70' : 'hover:scale-110 active:scale-95'
        } ${shuffleMode ? 'text-[#C7B5FF]' : 'text-[#77756F] hover:text-[#F1EEE7]'}`}
        onPointerDown={(e) => {
          e.stopPropagation();
          setActiveButton('shuffle');
          triggerHaptic();
        }}
        onPointerUp={() => setActiveButton(null)}
        onClick={(e) => {
          e.stopPropagation();
          onToggleShuffle();
        }}
      >
        <Shuffle className="w-5 h-5 stroke-[2.2]" />
        {shuffleMode && (
          <span className="w-1.5 h-1.5 rounded-full bg-[#C7B5FF] shadow-[0_0_8px_rgba(199,181,255,0.8)] mt-0.5" />
        )}
      </button>

      {/* Left Button: Previous Track */}
      <button
        id="wheel-prev-btn"
        aria-label="Previous track"
        className={`absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full text-[#77756F] hover:text-[#F1EEE7] transition-all duration-150 z-10 ${
          activeButton === 'prev' ? 'scale-90 opacity-70 text-[#F1EEE7]' : 'hover:scale-110 active:scale-95'
        }`}
        onPointerDown={(e) => {
          e.stopPropagation();
          setActiveButton('prev');
          triggerHaptic();
        }}
        onPointerUp={() => setActiveButton(null)}
        onClick={(e) => {
          e.stopPropagation();
          onPreviousTrack();
        }}
      >
        <SkipBack className="w-5 h-5 fill-current stroke-0" />
      </button>

      {/* Right Button: Next Track */}
      <button
        id="wheel-next-btn"
        aria-label="Next track"
        className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full text-[#77756F] hover:text-[#F1EEE7] transition-all duration-150 z-10 ${
          activeButton === 'next' ? 'scale-90 opacity-70 text-[#F1EEE7]' : 'hover:scale-110 active:scale-95'
        }`}
        onPointerDown={(e) => {
          e.stopPropagation();
          setActiveButton('next');
          triggerHaptic();
        }}
        onPointerUp={() => setActiveButton(null)}
        onClick={(e) => {
          e.stopPropagation();
          onNextTrack();
        }}
      >
        <SkipForward className="w-5 h-5 fill-current stroke-0" />
      </button>

      {/* Bottom Button: Play / Pause */}
      <button
        id="wheel-bottom-play-btn"
        aria-label={isPlaying ? 'Pause' : 'Play'}
        className={`absolute bottom-4 left-1/2 -translate-x-1/2 p-2 rounded-full text-[#77756F] hover:text-[#F1EEE7] transition-all duration-150 z-10 flex items-center justify-center gap-1 ${
          activeButton === 'bottom-play' ? 'scale-90 opacity-70 text-[#F1EEE7]' : 'hover:scale-110 active:scale-95'
        }`}
        onPointerDown={(e) => {
          e.stopPropagation();
          setActiveButton('bottom-play');
          triggerHaptic();
        }}
        onPointerUp={() => setActiveButton(null)}
        onClick={(e) => {
          e.stopPropagation();
          onTogglePlayPause();
        }}
      >
        <div className="flex items-center gap-1">
          <Play className={`w-4 h-4 fill-current stroke-0 ${isPlaying ? 'opacity-30' : 'opacity-100 text-[#F1EEE7]'}`} />
          <Pause className={`w-4 h-4 fill-current stroke-0 ${isPlaying ? 'opacity-100 text-[#F1EEE7]' : 'opacity-30'}`} />
        </div>
      </button>

      {/* Center Concave Neumorphic Button */}
      <button
        id="wheel-center-btn"
        aria-label="Center select button"
        className={`relative z-20 rounded-full flex items-center justify-center transition-all duration-150 active:scale-95 ${
          activeButton === 'center' ? 'scale-95' : ''
        }`}
        style={{
          width: `${size * 0.36}px`,
          height: `${size * 0.36}px`,
          aspectRatio: '1 / 1',
          borderRadius: '50%',
          backgroundColor: '#151515',
          boxShadow:
            'inset 4px 4px 10px #0a0a0c, inset -3px -3px 8px #222226, 0 1px 2px rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.04)'
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
          setActiveButton('center');
          triggerHaptic();
        }}
        onPointerUp={() => setActiveButton(null)}
        onClick={(e) => {
          e.stopPropagation();
          onTogglePlayPause();
        }}
      >
        <div className="w-3.5 h-3.5 rounded-full bg-white/[0.06] flex items-center justify-center">
          <div className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-[#C7B5FF]' : 'bg-[#77756F]'}`} />
        </div>
      </button>
    </div>
  );
};
