import React, { useState, useMemo, useEffect } from 'react';
import { SimulationParams, DomainPreset } from './types';
import { DOMAIN_PRESETS } from './utils/domainPresets';
import { runSimulation } from './utils/mathEngine';
import { MathFormulaHeader } from './components/MathFormulaHeader';
import { PhysicalCanvas } from './components/PhysicalCanvas';
import { InteractiveCharts } from './components/InteractiveCharts';
import { SimulationControls } from './components/SimulationControls';
import { SensitivityAnalysis } from './components/SensitivityAnalysis';
import { ComparisonPanel } from './components/ComparisonPanel';
import { RoiCalculatorDashboard } from './components/RoiCalculatorDashboard';
import { AlgorithmExplanationGuide } from './components/AlgorithmExplanationGuide';
import { DomainPresetsPanel } from './components/DomainPresetsPanel';
import { ReportExportModal } from './components/ReportExportModal';
import {
  Download,
  Activity,
  GitCompare,
  SlidersHorizontal,
  Calculator,
  BookOpen,
} from 'lucide-react';

export default function App() {
  const [currentPreset, setCurrentPreset] = useState<DomainPreset>(DOMAIN_PRESETS[0]);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<
    'simulation' | 'roi' | 'explanation' | 'sensitivity' | 'comparison'
  >('simulation');

  // Simulation Parameters state
  const [params, setParams] = useState<SimulationParams>({
    Kc: currentPreset.defaultParams.Kc ?? 1.0,
    timeSpan: currentPreset.defaultParams.timeSpan ?? 10,
    numSteps: 200,
    modelMode: 'continuous',
    discreteParams: {
      pr: 2.5,
      R: 0.05,
      C: 10.0,
      n: 1.2,
      q: 0.8,
    },
    kernelType: currentPreset.defaultParams.kernelType ?? 'exponential',
    kernelParams: {
      beta: 0.4,
      alpha: 1.0,
      sigma: 1.5,
      mu: 5.0,
      windowWidth: 3.0,
      frequency: 1.0,
      ...currentPreset.defaultParams.kernelParams,
    },
    potentialType: currentPreset.defaultParams.potentialType ?? 'exponential_decay',
    potentialParams: {
      U0: 100,
      U_inf: 10,
      k: 0.8,
      shockTime: 2.0,
      shockSteepness: 5.0,
      frequency: 2.0,
      damping: 0.5,
      ...currentPreset.defaultParams.potentialParams,
    },
  });

  // Global Time & Simulation Playback State
  const [simTime, setSimTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  // Synchronized simulation loop (throttled to ~20 FPS to keep React render cycles performant)
  useEffect(() => {
    if (!isPlaying) return;
    let lastTime = performance.now();
    let frameId: number;
    let accumulated = 0;

    const animate = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      accumulated += dt;

      // Throttle React state updates to ~20 FPS (every 50ms)
      if (accumulated >= 0.05) {
        setSimTime((prev) => {
          let next = prev + accumulated * 1.5 * playbackSpeed;
          if (next >= params.timeSpan) {
            next = 0; // Seamless loop
          }
          return next;
        });
        accumulated = 0;
      }

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, playbackSpeed, params.timeSpan]);

  // Reset time on major param structural changes
  useEffect(() => {
    setSimTime(0);
  }, [params.timeSpan, params.kernelType, params.potentialType, currentPreset.id]);

  // Calculate live results using memoization
  const results = useMemo(() => {
    return runSimulation(params);
  }, [params]);

  // Handle preset change
  const handleSelectPreset = (preset: DomainPreset) => {
    setCurrentPreset(preset);
    setSimTime(0);
    setParams((prev) => ({
      ...prev,
      Kc: preset.defaultParams.Kc ?? prev.Kc,
      timeSpan: preset.defaultParams.timeSpan ?? prev.timeSpan,
      kernelType: preset.defaultParams.kernelType ?? prev.kernelType,
      kernelParams: {
        ...prev.kernelParams,
        ...preset.defaultParams.kernelParams,
      },
      potentialType: preset.defaultParams.potentialType ?? prev.potentialType,
      potentialParams: {
        ...prev.potentialParams,
        ...preset.defaultParams.potentialParams,
      },
    }));
  };

  // Reset to default preset parameters
  const handleResetParams = () => {
    handleSelectPreset(currentPreset);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white pb-16">
      {/* Top Navbar - Professional Light Polish */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-indigo-600 flex items-center justify-center text-white font-mono font-bold text-lg shadow-sm">
              Λ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                  Lambda Dissipation Lab
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold hidden sm:inline-block">
                  v2.5 Professional Polish
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                Continuous Memory Calculus Engine: Λ = K_c ∫ Φ(t) (-dU/dt) dt
              </p>
            </div>
          </div>

          {/* Quick Actions & System Status */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-mono font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              SYSTEM OPERATIONAL
            </div>

            <button
              onClick={() => setIsExportOpen(true)}
              className="px-3.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Export Data / Report
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Domain Scenarios Bar */}
        <DomainPresetsPanel
          currentPreset={currentPreset}
          onSelectPreset={handleSelectPreset}
        />

        {/* KaTeX Interactive Equation Header */}
        <MathFormulaHeader
          results={results}
          Kc={params.Kc}
          currentPreset={currentPreset}
          discreteParams={params.discreteParams}
        />

        {/* View Switcher Navigation Bar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveTab('simulation')}
            className={`px-3.5 py-2 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'simulation'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-4 h-4" />
            Physical Simulation & Lab
          </button>

          <button
            onClick={() => setActiveTab('roi')}
            className={`px-3.5 py-2 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'roi'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Calculator className="w-4 h-4 text-emerald-500" />
            ROI & Cost Savings Calculator
          </button>

          <button
            onClick={() => setActiveTab('explanation')}
            className={`px-3.5 py-2 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'explanation'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-500" />
            Algorithm & Math Explanation
          </button>

          <button
            onClick={() => setActiveTab('sensitivity')}
            className={`px-3.5 py-2 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'sensitivity'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Sensitivity & Sweeps
          </button>

          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-3.5 py-2 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'comparison'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <GitCompare className="w-4 h-4" />
            Benchmark Comparison
          </button>
        </div>

        {/* TAB 1: Live Simulation & Charts */}
        {activeTab === 'simulation' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Physical Canvas & Interactive Charts */}
              <div className="lg:col-span-7 space-y-6">
                <PhysicalCanvas
                  params={params}
                  results={results}
                  currentPreset={currentPreset}
                  simTime={simTime}
                  isPlaying={isPlaying}
                  onTogglePlay={() => setIsPlaying((p) => !p)}
                  onTimeChange={setSimTime}
                />
                <InteractiveCharts
                  results={results}
                  currentPreset={currentPreset}
                  simTime={simTime}
                />
              </div>

              {/* Right Column: Simulation Controls with Play/Pause & Dynamic Time Controls */}
              <div className="lg:col-span-5">
                <SimulationControls
                  params={params}
                  onChange={setParams}
                  onResetParams={handleResetParams}
                  simTime={simTime}
                  isPlaying={isPlaying}
                  onTogglePlay={() => setIsPlaying((p) => !p)}
                  onTimeChange={setSimTime}
                  playbackSpeed={playbackSpeed}
                  onChangePlaybackSpeed={setPlaybackSpeed}
                  results={results}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Commercial ROI Calculator */}
        {activeTab === 'roi' && (
          <RoiCalculatorDashboard results={results} />
        )}

        {/* TAB 3: Algorithm Explanation Guide */}
        {activeTab === 'explanation' && (
          <AlgorithmExplanationGuide />
        )}

        {/* TAB 4: Sensitivity Analysis */}
        {activeTab === 'sensitivity' && (
          <SensitivityAnalysis baseParams={params} />
        )}

        {/* TAB 5: Benchmark Comparison */}
        {activeTab === 'comparison' && (
          <ComparisonPanel baseParams={params} baseResults={results} />
        )}
      </main>

      {/* Export Report Modal */}
      <ReportExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        params={params}
        results={results}
        currentPreset={currentPreset}
      />
    </div>
  );
}

