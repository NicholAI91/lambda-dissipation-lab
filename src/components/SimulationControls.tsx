import React from 'react';
import { SimulationParams, KernelType, PotentialType, SimulationResults } from '../types';
import {
  Sliders,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  Gauge,
  Clock,
  Cpu,
  Layers,
  Activity,
  Zap,
} from 'lucide-react';

interface SimulationControlsProps {
  params: SimulationParams;
  onChange: (newParams: SimulationParams) => void;
  onResetParams: () => void;
  simTime: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onTimeChange: (time: number) => void;
  playbackSpeed: number;
  onChangePlaybackSpeed: (speed: number) => void;
  results: SimulationResults;
}

export const SimulationControls: React.FC<SimulationControlsProps> = React.memo(({
  params,
  onChange,
  onResetParams,
  simTime,
  isPlaying,
  onTogglePlay,
  onTimeChange,
  playbackSpeed,
  onChangePlaybackSpeed,
  results,
}) => {
  const updateKc = (val: number) => {
    onChange({ ...params, Kc: val });
  };

  const updateDiscreteParam = (key: keyof SimulationParams['discreteParams'], val: number) => {
    onChange({
      ...params,
      discreteParams: { ...params.discreteParams, [key]: val },
    });
  };

  const updateModelMode = (mode: SimulationParams['modelMode']) => {
    onChange({ ...params, modelMode: mode });
  };

  const updateTimeSpan = (val: number) => {
    onChange({ ...params, timeSpan: val });
  };

  const updateKernelType = (type: KernelType) => {
    onChange({ ...params, kernelType: type });
  };

  const updateKernelParam = (key: keyof SimulationParams['kernelParams'], val: number) => {
    onChange({
      ...params,
      kernelParams: { ...params.kernelParams, [key]: val },
    });
  };

  const updatePotentialType = (type: PotentialType) => {
    onChange({ ...params, potentialType: type });
  };

  const updatePotentialParam = (key: keyof SimulationParams['potentialParams'], val: number) => {
    onChange({
      ...params,
      potentialParams: { ...params.potentialParams, [key]: val },
    });
  };

  // Find instantaneous point matching simTime
  const stepIdx = Math.min(
    results.points.length - 1,
    Math.max(0, Math.floor((simTime / params.timeSpan) * (results.points.length - 1)))
  );
  const currentPoint = results.points[stepIdx] || results.points[0];

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col gap-6 text-slate-800">
      {/* Title Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-indigo-600" />
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Simulation Controls & Parameters
            </h2>
            <p className="text-[11px] text-slate-500">
              Control time evolution & adjust mathematical formulation parameters
            </p>
          </div>
        </div>
        <button
          onClick={onResetParams}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded border border-slate-200 transition-colors"
        >
          Reset Defaults
        </button>
      </div>

      {/* DYNAMIC TIME EVOLUTION & PLAYBACK CONTROL CARD */}
      <div className="bg-slate-900 text-white p-4 rounded-lg shadow-sm space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-300">
              Dynamic Simulation Time Controller
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className={isPlaying ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
              {isPlaying ? 'EVOLVING' : 'PAUSED'}
            </span>
          </div>
        </div>

        {/* Play/Pause & Transport Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onTogglePlay}
            className={`px-4 py-2 rounded font-bold text-xs flex items-center gap-2 transition-all shadow-sm ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            {isPlaying ? 'Pause Simulation' : 'Play / Evolve'}
          </button>

          <button
            onClick={() => onTimeChange(Math.max(0, simTime - 0.5))}
            className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            title="Step Back 0.5s"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onTimeChange(Math.min(params.timeSpan, simTime + 0.5))}
            className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            title="Step Forward 0.5s"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onTimeChange(0)}
            className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700 flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Reset (0s)
          </button>

          {/* Speed Selector */}
          <div className="ml-auto flex items-center gap-1 bg-slate-950 p-1 rounded border border-slate-800 text-[10px] font-mono">
            <span className="text-slate-500 px-1 flex items-center gap-0.5">
              <Gauge className="w-3 h-3" />
            </span>
            {[0.5, 1.0, 2.0, 5.0].map((s) => (
              <button
                key={s}
                onClick={() => onChangePlaybackSpeed(s)}
                className={`px-2 py-0.5 rounded transition-all ${
                  playbackSpeed === s
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Slider with Live Value Indicator */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Time t</span>
            <span className="text-emerald-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              {simTime.toFixed(2)}s / {params.timeSpan}s
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={params.timeSpan}
            step={0.05}
            value={simTime}
            onChange={(e) => onTimeChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>

        {/* Instantaneous Values Readout Box */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-800 text-center font-mono">
          <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
            <div className="text-[10px] text-sky-400 uppercase">U(t)</div>
            <div className="text-xs font-bold text-white">{currentPoint.U.toFixed(1)}</div>
          </div>
          <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
            <div className="text-[10px] text-rose-400 uppercase">-dU/dt</div>
            <div className="text-xs font-bold text-white">{currentPoint.minus_dU_dt.toFixed(2)}</div>
          </div>
          <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
            <div className="text-[10px] text-amber-400 uppercase">Φ(t)</div>
            <div className="text-xs font-bold text-white">{currentPoint.Phi.toFixed(3)}</div>
          </div>
          <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
            <div className="text-[10px] text-emerald-400 uppercase">Λ(t)</div>
            <div className="text-xs font-bold text-white">{currentPoint.cumLambda.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Global Scaling: Kc & TimeSpan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label className="text-slate-700 font-bold font-mono flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-indigo-600" /> Coupling Constant (K_c)
            </label>
            <span className="font-mono text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 font-bold">
              {params.Kc.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min={0.01}
            max={5.0}
            step={0.05}
            value={params.Kc}
            onChange={(e) => updateKc(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label className="text-slate-700 font-bold font-mono flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-sky-600" /> Total Time Horizon (T_max)
            </label>
            <span className="font-mono text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 font-bold">
              {params.timeSpan} s
            </span>
          </div>
          <input
            type="range"
            min={3}
            max={40}
            step={1}
            value={params.timeSpan}
            onChange={(e) => updateTimeSpan(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
          />
        </div>
      </div>

      {/* SECTION 0: DISCRETE RECURRENCE PARAMETERS CARD */}
      <div className="space-y-3 bg-indigo-50/50 p-4 rounded-lg border border-indigo-100">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-indigo-600" /> Discrete Recurrence Model Parameters (Λ*k)
          </h3>
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-indigo-200 text-xs font-mono">
            <button
              onClick={() => updateModelMode('discrete_recurrence')}
              className={`px-2 py-0.5 rounded transition-all ${
                params.modelMode === 'discrete_recurrence'
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Discrete Only
            </button>
            <button
              onClick={() => updateModelMode('overlay_both')}
              className={`px-2 py-0.5 rounded transition-all ${
                params.modelMode === 'overlay_both'
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Overlay Both
            </button>
          </div>
        </div>

        <p className="text-[11px] text-slate-600 leading-normal">
          Adjust step driving production rate <span className="font-mono text-indigo-700 font-bold">Pr_k</span>, loss resistance <span className="font-mono text-indigo-700 font-bold">R</span>, system capacity <span className="font-mono text-indigo-700 font-bold">C</span>, power factor <span className="font-mono text-indigo-700 font-bold">n</span>, and feedback exponent <span className="font-mono text-indigo-700 font-bold">q</span>.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-white p-3 rounded-lg border border-indigo-100">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-700 font-mono font-semibold text-[11px]">Production Rate (Pr_k)</span>
              <span className="text-indigo-700 font-mono font-bold">{params.discreteParams?.pr ?? 2.5}</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={10.0}
              step={0.1}
              value={params.discreteParams?.pr ?? 2.5}
              onChange={(e) => updateDiscreteParam('pr', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-700 font-mono font-semibold text-[11px]">System Resistance (R)</span>
              <span className="text-indigo-700 font-mono font-bold">{params.discreteParams?.R ?? 0.05}</span>
            </div>
            <input
              type="range"
              min={0.001}
              max={0.5}
              step={0.005}
              value={params.discreteParams?.R ?? 0.05}
              onChange={(e) => updateDiscreteParam('R', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-700 font-mono font-semibold text-[11px]">System Capacity (C)</span>
              <span className="text-indigo-700 font-mono font-bold">{params.discreteParams?.C ?? 10.0}</span>
            </div>
            <input
              type="range"
              min={1.0}
              max={50.0}
              step={1.0}
              value={params.discreteParams?.C ?? 10.0}
              onChange={(e) => updateDiscreteParam('C', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-700 font-mono font-semibold text-[11px]">Exponential Factor (n)</span>
              <span className="text-indigo-700 font-mono font-bold">{params.discreteParams?.n ?? 1.2}</span>
            </div>
            <input
              type="range"
              min={0.2}
              max={3.0}
              step={0.1}
              value={params.discreteParams?.n ?? 1.2}
              onChange={(e) => updateDiscreteParam('n', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-700 font-mono font-semibold text-[11px]">State Feedback Exponent (q)</span>
              <span className="text-indigo-700 font-mono font-bold">{params.discreteParams?.q ?? 0.8}</span>
            </div>
            <input
              type="range"
              min={0.1}
              max={2.5}
              step={0.05}
              value={params.discreteParams?.q ?? 0.8}
              onChange={(e) => updateDiscreteParam('q', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>
        </div>
      </div>

      {/* SECTION 1: Memory Kernel Selector & Parameters */}
      <div className="space-y-3">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-amber-600" /> Memory Kernel Φ(t) Formulation
        </h3>

        {/* Kernel Type Selector Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          {[
            { id: 'exponential', label: 'Exponential Decay', sub: 'e^(-βt)' },
            { id: 'power_law', label: 'Power Law', sub: '(1+βt)^(-α)' },
            { id: 'gaussian', label: 'Gaussian Window', sub: 'e^-((t-μ)²/2σ²)' },
            { id: 'uniform', label: 'Uniform (No Loss)', sub: 'Φ(t) = 1.0' },
            { id: 'sliding_window', label: 'Sliding Buffer', sub: 'Rectangular' },
            { id: 'damped_oscillator', label: 'AC Damped', sub: 'e^(-βt)|cos(ωt)|' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => updateKernelType(item.id as KernelType)}
              className={`p-2.5 rounded border text-left transition-all ${
                params.kernelType === item.id
                  ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-sm font-semibold'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="font-bold text-xs">{item.label}</div>
              <div className="text-[10px] font-mono text-slate-500 mt-0.5">{item.sub}</div>
            </button>
          ))}
        </div>

        {/* Kernel Contextual Parameters Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
          {(params.kernelType === 'exponential' || params.kernelType === 'power_law' || params.kernelType === 'damped_oscillator') && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700 font-mono text-[11px]">Decay Constant (β)</span>
                <span className="text-amber-700 font-mono font-bold">{params.kernelParams.beta.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0.02}
                max={2.0}
                step={0.02}
                value={params.kernelParams.beta}
                onChange={(e) => updateKernelParam('beta', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
            </div>
          )}

          {params.kernelType === 'power_law' && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700 font-mono text-[11px]">Power Exponent (α)</span>
                <span className="text-amber-700 font-mono font-bold">{params.kernelParams.alpha.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0.1}
                max={3.0}
                step={0.1}
                value={params.kernelParams.alpha}
                onChange={(e) => updateKernelParam('alpha', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
            </div>
          )}

          {(params.kernelType === 'gaussian' || params.kernelType === 'sliding_window') && (
            <>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-700 font-mono text-[11px]">Memory Center Peak (μ)</span>
                  <span className="text-amber-700 font-mono font-bold">{params.kernelParams.mu.toFixed(1)}s</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={params.timeSpan - 1}
                  step={0.5}
                  value={params.kernelParams.mu}
                  onChange={(e) => updateKernelParam('mu', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-700 font-mono text-[11px]">
                    {params.kernelType === 'gaussian' ? 'Gaussian Spread (σ)' : 'Buffer Width (W)'}
                  </span>
                  <span className="text-amber-700 font-mono font-bold">
                    {params.kernelType === 'gaussian' ? params.kernelParams.sigma.toFixed(1) : params.kernelParams.windowWidth.toFixed(1)}s
                  </span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={10}
                  step={0.5}
                  value={params.kernelType === 'gaussian' ? params.kernelParams.sigma : params.kernelParams.windowWidth}
                  onChange={(e) =>
                    updateKernelParam(
                      params.kernelType === 'gaussian' ? 'sigma' : 'windowWidth',
                      parseFloat(e.target.value)
                    )
                  }
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                />
              </div>
            </>
          )}

          {params.kernelType === 'damped_oscillator' && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700 font-mono text-[11px]">Modulation Freq (ω)</span>
                <span className="text-amber-700 font-mono font-bold">{params.kernelParams.frequency.toFixed(2)} rad/s</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={5.0}
                step={0.2}
                value={params.kernelParams.frequency}
                onChange={(e) => updateKernelParam('frequency', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: Potential Function U(t) Selector & Parameters */}
      <div className="space-y-3">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-sky-600" /> Potential Profile U(t) Formulation
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          {[
            { id: 'exponential_decay', label: 'Exponential Drop', sub: 'Smooth Relaxation' },
            { id: 'step_release', label: 'Step / Sigmoid', sub: 'Sudden Release' },
            { id: 'cyclic_damping', label: 'Cyclic Damped', sub: 'Oscillatory Strain' },
            { id: 'linear_drain', label: 'Constant Drain', sub: 'Steady Rate' },
            { id: 'multi_shock', label: 'Multi-Stage Shock', sub: 'Cascading Drops' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => updatePotentialType(item.id as PotentialType)}
              className={`p-2.5 rounded border text-left transition-all ${
                params.potentialType === item.id
                  ? 'bg-sky-50 border-sky-500 text-sky-900 shadow-sm font-semibold'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="font-bold text-xs">{item.label}</div>
              <div className="text-[10px] font-mono text-slate-500 mt-0.5">{item.sub}</div>
            </button>
          ))}
        </div>

        {/* Potential Contextual Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-700 font-mono text-[11px]">Initial Energy (U0)</span>
              <span className="text-sky-700 font-mono font-bold">{params.potentialParams.U0}</span>
            </div>
            <input
              type="range"
              min={20}
              max={300}
              step={10}
              value={params.potentialParams.U0}
              onChange={(e) => updatePotentialParam('U0', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
          </div>

          {(params.potentialType === 'exponential_decay' || params.potentialType === 'linear_drain') && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700 font-mono text-[11px]">Release Rate Constant (k)</span>
                <span className="text-sky-700 font-mono font-bold">{params.potentialParams.k.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0.05}
                max={2.5}
                step={0.05}
                value={params.potentialParams.k}
                onChange={(e) => updatePotentialParam('k', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
              />
            </div>
          )}

          {params.potentialType === 'step_release' && (
            <>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-700 font-mono text-[11px]">Shock Event Time (t_shock)</span>
                  <span className="text-sky-700 font-mono font-bold">{params.potentialParams.shockTime.toFixed(1)}s</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={params.timeSpan - 1}
                  step={0.5}
                  value={params.potentialParams.shockTime}
                  onChange={(e) => updatePotentialParam('shockTime', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-700 font-mono text-[11px]">Shock Steepness (s)</span>
                  <span className="text-sky-700 font-mono font-bold">{params.potentialParams.shockSteepness.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={10.0}
                  step={0.5}
                  value={params.potentialParams.shockSteepness}
                  onChange={(e) => updatePotentialParam('shockSteepness', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                />
              </div>
            </>
          )}

          {params.potentialType === 'cyclic_damping' && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700 font-mono text-[11px]">Cycle Frequency (ω)</span>
                <span className="text-sky-700 font-mono font-bold">{params.potentialParams.frequency.toFixed(1)} rad/s</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={6.0}
                step={0.5}
                value={params.potentialParams.frequency}
                onChange={(e) => updatePotentialParam('frequency', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

