import React, { useEffect, useRef } from 'react';
import { playerEngine } from '../../services/playerEngine';

interface Props {
  isPlaying: boolean;
  barCount?: number;
  height?: number;
  className?: string;
  color?: string;
}

export const EqualizerVisualizer: React.FC<Props> = ({
  isPlaying,
  barCount = 16,
  height = 36,
  className = '',
  color = '#C7B5FF'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      const width = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, width, h);

      const freqData = playerEngine.getVisualizerData();
      const barWidth = Math.max(2, (width / barCount) - 3);
      const gap = 3;

      for (let i = 0; i < barCount; i++) {
        let barHeight = 4;
        if (isPlaying) {
          if (freqData && freqData.length > 0) {
            const dataIdx = Math.floor((i / barCount) * (freqData.length * 0.75));
            const val = freqData[dataIdx] || 0;
            barHeight = Math.max(4, (val / 255) * h * 0.9);
          } else {
            // Simulated rhythmic pulse if Web Audio is restricted by cross-origin
            const wave = Math.sin(phase + (i * 0.45)) * 0.5 + 0.5;
            barHeight = Math.max(4, wave * (h * 0.75) + 6);
          }
        }

        const x = i * (barWidth + gap);
        const y = h - barHeight;

        // Gradient bar
        const grad = ctx.createLinearGradient(0, y, 0, h);
        grad.addColorStop(0, '#F1EEE7');
        grad.addColorStop(1, color);

        ctx.fillStyle = isPlaying ? grad : '#333336';
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [2, 2, 0, 0]);
        ctx.fill();
      }

      phase += 0.12;
      if (isPlaying) {
        animFrameRef.current = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying, barCount, height, color]);

  return (
    <canvas
      ref={canvasRef}
      width={barCount * 8}
      height={height}
      className={`inline-block ${className}`}
      aria-hidden="true"
    />
  );
};
