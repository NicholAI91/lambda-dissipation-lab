import React, { useRef, useEffect } from 'react';
import { SimulationParams, SimulationResults, DomainPreset } from '../types';
import { Play, Pause, RotateCcw, Activity } from 'lucide-react';

interface PhysicalCanvasProps {
  params: SimulationParams;
  results: SimulationResults;
  currentPreset: DomainPreset;
  simTime: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onTimeChange: (time: number) => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

export const PhysicalCanvas: React.FC<PhysicalCanvasProps> = React.memo(({
  params,
  results,
  currentPreset,
  simTime,
  isPlaying,
  onTogglePlay,
  onTimeChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);

  // Render loop driven by simTime & requestAnimationFrame
  useEffect(() => {
    let animationFrameId: number;

    const renderCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      // Find current point in results matching simTime
      const stepIdx = Math.min(
        results.points.length - 1,
        Math.max(0, Math.floor((simTime / params.timeSpan) * (results.points.length - 1)))
      );
      const point = results.points[stepIdx] || results.points[0];

      // Clear canvas with rich deep view space
      ctx.fillStyle = '#0f172a'; // Slate 900
      ctx.fillRect(0, 0, width, height);

      // Draw subtle grid background
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      const gridSize = 30;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // --- LEFT REGION: Reservoir / Potential Energy Well U(t) ---
      const wellX = 70;
      const wellY = 50;
      const wellWidth = 140;
      const wellHeight = height - 90;

      const maxU = params.potentialParams.U0 || 100;
      const fillPercent = Math.min(1, Math.max(0, point.U / maxU));
      const fluidHeight = fillPercent * (wellHeight - 10);

      // Draw Well Container Box
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      ctx.strokeRect(wellX, wellY, wellWidth, wellHeight);

      // Well Glow & Fluid
      const fluidY = wellY + wellHeight - fluidHeight;
      const gradientFluid = ctx.createLinearGradient(0, fluidY, 0, wellY + wellHeight);
      gradientFluid.addColorStop(0, '#38bdf8'); // sky blue
      gradientFluid.addColorStop(1, '#0284c7');
      ctx.fillStyle = gradientFluid;
      ctx.fillRect(wellX + 2, fluidY, wellWidth - 4, fluidHeight - 2);

      // Fluid surface wave
      ctx.fillStyle = '#7dd3fc';
      ctx.beginPath();
      ctx.ellipse(
        wellX + wellWidth / 2,
        fluidY,
        wellWidth / 2 - 2,
        4 + Math.sin(simTime * 8) * 3,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Reservoir Labels
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px sans-serif';
      ctx.fillText('Potential U(t)', wellX, wellY - 12);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 13px monospace';
      ctx.fillText(`${point.U.toFixed(1)} ${currentPreset.unitPotential.split(' ')[0]}`, wellX + 10, fluidY - 10);

      // --- MIDDLE REGION: Energy Release (-dU/dt) Pipe & Memory Kernel Filter ---
      const pipeStartX = wellX + wellWidth;
      const pipeY = wellY + wellHeight / 2;
      const filterX = width / 2;
      const filterY = pipeY;

      // Draw Release Pipe
      const rate = point.minus_dU_dt;
      const pipeThickness = Math.min(24, Math.max(4, rate * 2));

      ctx.strokeStyle = rate > 1 ? '#f43f5e' : '#64748b';
      ctx.lineWidth = pipeThickness;
      ctx.beginPath();
      ctx.moveTo(pipeStartX, pipeY);
      ctx.lineTo(filterX, filterY);
      ctx.stroke();

      // Spawn Particles according to rate (-dU/dt)
      if (isPlaying && rate > 0.1 && Math.random() < Math.min(0.9, rate / 10)) {
        particlesRef.current.push({
          x: pipeStartX,
          y: pipeY + (Math.random() - 0.5) * pipeThickness,
          vx: 2 + Math.random() * 3 + rate * 0.1,
          vy: (Math.random() - 0.5) * 1.5,
          life: 0,
          maxLife: 60 + Math.random() * 40,
          size: 2 + Math.random() * 3,
          color: rate > 15 ? '#f43f5e' : '#fbbf24',
        });
      }

      // --- MEMORY KERNEL FILTER Φ(t) CIRCLE ---
      const filterRadius = 45;
      const phi = point.Phi;

      // Outer Memory Aura Ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(filterX, filterY, filterRadius + 8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(245, 158, 11, ${phi * 0.25})`;
      ctx.fill();
      ctx.restore();

      // Filter Circle
      ctx.beginPath();
      ctx.arc(filterX, filterY, filterRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#020617';
      ctx.strokeStyle = `rgba(245, 158, 11, ${Math.max(0.3, phi)})`;
      ctx.lineWidth = 3;
      ctx.fill();
      ctx.stroke();

      // Filter Pulse / Ripple
      ctx.beginPath();
      ctx.arc(filterX, filterY, filterRadius * phi, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
      ctx.fill();

      // Filter Text Label
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Memory Filter', filterX, filterY - 8);
      ctx.font = 'bold 13px monospace';
      ctx.fillText(`Φ(t) = ${phi.toFixed(2)}`, filterX, filterY + 12);

      // --- RIGHT REGION: Accumulated Dissipation Gauge Λ(t) ---
      const gaugeX = width - 130;
      const gaugeY = wellY;
      const gaugeWidth = 80;
      const gaugeHeight = wellHeight;

      const maxLambda = Math.max(1, results.totalLambda * 1.1);
      const lambdaFill = Math.min(1, Math.max(0, point.cumLambda / maxLambda));
      const lambdaHeight = lambdaFill * gaugeHeight;

      // Gauge Outline
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      ctx.strokeRect(gaugeX, gaugeY, gaugeWidth, gaugeHeight);

      // Gauge Fill Gradient
      const lambdaY = gaugeY + gaugeHeight - lambdaHeight;
      const gradientLambda = ctx.createLinearGradient(0, lambdaY, 0, gaugeY + gaugeHeight);
      gradientLambda.addColorStop(0, '#10b981'); // Emerald
      gradientLambda.addColorStop(1, '#059669');
      ctx.fillStyle = gradientLambda;
      ctx.fillRect(gaugeX + 2, lambdaY, gaugeWidth - 4, lambdaHeight - 2);

      // Gauge Label
      ctx.textAlign = 'left';
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px sans-serif';
      ctx.fillText('Accumulated Λ', gaugeX, gaugeY - 12);
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 13px monospace';
      ctx.fillText(`${point.cumLambda.toFixed(1)}`, gaugeX + 5, lambdaY - 10);

      // Pipe from Filter to Lambda Gauge
      ctx.strokeStyle = `rgba(16, 185, 129, ${point.integrand > 0.1 ? 0.8 : 0.2})`;
      ctx.lineWidth = Math.min(20, Math.max(2, point.integrand * 2));
      ctx.beginPath();
      ctx.moveTo(filterX + filterRadius, filterY);
      ctx.lineTo(gaugeX, gaugeY + gaugeHeight / 2);
      ctx.stroke();

      // --- UPDATE & DRAW PARTICLES ---
      ctx.textAlign = 'left';
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        // When passing through the filter, multiply particle life decay by memory kernel
        if (p.x > filterX - filterRadius && p.x < filterX + filterRadius) {
          p.vx *= 0.98;
          if (Math.random() > phi) {
            p.size *= 0.95;
          }
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, 1 - p.life / p.maxLife);
        ctx.fill();
        ctx.globalAlpha = 1.0;

        if (p.life >= p.maxLife || p.x > gaugeX) {
          particles.splice(i, 1);
        }
      }

      // --- TOP STATUS BANNER ---
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, 34);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px monospace';
      ctx.fillText(`Simulated Time: t = ${simTime.toFixed(2)}s / ${params.timeSpan}s`, 12, 21);

      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`U(t): ${point.U.toFixed(1)}`, 230, 21);

      ctx.fillStyle = '#f43f5e';
      ctx.fillText(`-dU/dt: ${point.minus_dU_dt.toFixed(2)}/s`, 340, 21);

      ctx.fillStyle = '#f59e0b';
      ctx.fillText(`Φ(t): ${point.Phi.toFixed(3)}`, 470, 21);

      ctx.fillStyle = '#10b981';
      ctx.fillText(`Λ(t): ${point.cumLambda.toFixed(2)}`, 585, 21);
    };

    animationFrameId = requestAnimationFrame(renderCanvas);
    return () => cancelAnimationFrame(animationFrameId);
  }, [simTime, isPlaying, params, results, currentPreset]);

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col gap-4 text-slate-800">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-600" />
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Physical System Dissipation Viewport
            </h2>
            <p className="text-[11px] text-slate-500">
              Interactive particles flow through memory-filtered dissipation pipeline
            </p>
          </div>
        </div>
        <div className="text-xs text-slate-600 font-mono flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          Realtime Fluid Mechanics
        </div>
      </div>

      {/* HTML5 Canvas Container */}
      <div className="relative w-full overflow-hidden rounded border border-slate-800 bg-slate-900 flex justify-center shadow-inner">
        <canvas
          ref={canvasRef}
          width={720}
          height={280}
          className="w-full max-w-full h-auto block cursor-crosshair"
        />
      </div>

      {/* Synchronized Transport Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3 rounded border border-slate-200">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={onTogglePlay}
            className="px-3.5 py-1.5 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isPlaying ? 'Pause' : 'Play'}
          </button>

          <button
            onClick={() => onTimeChange(0)}
            className="px-3 py-1.5 rounded bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors border border-slate-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset (0s)
          </button>
        </div>

        {/* Timeline Range Slider */}
        <div className="flex items-center gap-3 w-full sm:flex-1 max-w-md">
          <span className="text-xs font-mono font-semibold text-slate-500">0s</span>
          <input
            type="range"
            min={0}
            max={params.timeSpan}
            step={0.05}
            value={simTime}
            onChange={(e) => onTimeChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <span className="text-xs font-mono font-semibold text-slate-500">{params.timeSpan}s</span>
        </div>
      </div>
    </div>
  );
});

