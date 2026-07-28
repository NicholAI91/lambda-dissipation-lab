import React, { useState } from 'react';
import katex from 'katex';
import { SimulationResults, DomainPreset, DiscreteRecurrenceParams } from '../types';
import { Info, Sparkles, RefreshCw, Layers } from 'lucide-react';

interface MathFormulaHeaderProps {
  results: SimulationResults;
  Kc: number;
  currentPreset: DomainPreset;
  discreteParams?: DiscreteRecurrenceParams;
  onToggleFormulaMode?: (mode: 'continuous' | 'discrete') => void;
}

export const MathFormulaHeader: React.FC<MathFormulaHeaderProps> = React.memo(({
  results,
  Kc,
  currentPreset,
  discreteParams = { pr: 2.5, R: 0.05, C: 10.0, n: 1.2, q: 0.8 },
  onToggleFormulaMode,
}) => {
  const [selectedFormula, setSelectedFormula] = useState<'continuous' | 'discrete'>('discrete');
  const [activeTerm, setActiveTerm] = useState<string | null>(null);

  // Render LaTeX math string to HTML safely
  const renderMath = (latexStr: string) => {
    try {
      return {
        __html: katex.renderToString(latexStr, {
          throwOnError: false,
          displayMode: true,
        }),
      };
    } catch {
      return { __html: latexStr };
    }
  };

  const continuousLatex = `\\mathbf{\\Lambda} = K_c \\int_{0}^{T} \\Phi(t) \\cdot \\left( -\\frac{dU}{dt} \\right) dt`;
  const discreteLatex = `\\mathbf{\\Lambda}^*_k = \\Lambda^*_{k-1} + \\Delta t \\cdot (\\text{Pr}_k \\cdot k)^{\\frac{1}{k}} \\cdot \\exp\\left[-\\left(\\frac{k \\Delta t \\cdot R}{C}\\right)^n \\left(\\frac{\\Lambda^*_{k-1}}{U_0}\\right)^q\\right]`;

  const continuousTermDefs: Record<string, { label: string; desc: string; currentVal: string; role: string; bg: string; text: string }> = {
    Lambda: {
      label: 'Accumulated Dissipation (Λ)',
      desc: currentPreset.interpretation.Lambda,
      currentVal: `${results.totalLambda.toFixed(3)} ${currentPreset.unitLambda}`,
      role: 'Left-Hand Side Output Metric',
      bg: 'bg-emerald-500/10 border-emerald-500/30',
      text: 'text-emerald-400',
    },
    Kc: {
      label: 'Coupling Constant (K_c)',
      desc: currentPreset.interpretation.Kc,
      currentVal: `${Kc.toFixed(2)} (Multiplier)`,
      role: 'System Efficiency / Scale Factor',
      bg: 'bg-indigo-500/10 border-indigo-500/30',
      text: 'text-indigo-400',
    },
    Integral: {
      label: 'Time Continuous Integral (∫₀ᵀ ... dt)',
      desc: 'Accumulates memory-weighted energy release across the active time window [0, T_max].',
      currentVal: `${(results.totalLambda / (Kc || 1)).toFixed(3)} ${currentPreset.unitPotential}`,
      role: 'Continuous Calculus Accumulator',
      bg: 'bg-purple-500/10 border-purple-500/30',
      text: 'text-purple-400',
    },
    Phi: {
      label: 'Memory Kernel Function Φ(t)',
      desc: currentPreset.interpretation.Phi,
      currentVal: `Half-life: t½ ≈ ${results.halfMemoryTime.toFixed(2)}s`,
      role: 'Temporal Weighting & Fading Filter',
      bg: 'bg-amber-500/10 border-amber-500/30',
      text: 'text-amber-400',
    },
    dUdt: {
      label: 'Energy Release Rate (-dU/dt)',
      desc: currentPreset.interpretation.minus_dU_dt,
      currentVal: `Peak: ${results.peakDissipationRate.toFixed(2)} /s`,
      role: 'Rate of Potential Drop / Driving Force',
      bg: 'bg-rose-500/10 border-rose-500/30',
      text: 'text-rose-400',
    },
  };

  const discreteTermDefs: Record<string, { label: string; desc: string; currentVal: string; role: string; bg: string; text: string }> = {
    Lambda_k: {
      label: 'Discrete Recurrence State Λ*k',
      desc: 'Accumulated state metric at discrete step k under non-linear production and feedback dampening.',
      currentVal: `${results.totalLambdaDiscrete.toFixed(3)} ${currentPreset.unitLambda}`,
      role: 'Recurrence State Target',
      bg: 'bg-emerald-500/10 border-emerald-500/30',
      text: 'text-emerald-400',
    },
    Lambda_prev: {
      label: 'Prior Step State Λ*k-1',
      desc: 'State value carried over from previous iteration step k-1.',
      currentVal: `Previous state memory feedback baseline`,
      role: 'Memory Feedback Variable',
      bg: 'bg-indigo-500/10 border-indigo-500/30',
      text: 'text-indigo-400',
    },
    DrivingTerm: {
      label: 'Driving Production Term Δt·(Pr_k·k)^(1/k)',
      desc: 'Step driving force powered by step index k and production rate Pr_k.',
      currentVal: `Pr = ${discreteParams.pr}`,
      role: 'Step Inflow Driving Factor',
      bg: 'bg-cyan-500/10 border-cyan-500/30',
      text: 'text-cyan-400',
    },
    ExpDampening: {
      label: 'Non-Linear Exp Dampening exp[-((k·dt·R)/C)^n · (Λ*k-1 / U0)^q]',
      desc: 'Non-linear feedback suppression scaling with resistance R, capacity C, power n, and state exponent q.',
      currentVal: `R=${discreteParams.R}, C=${discreteParams.C}, n=${discreteParams.n}, q=${discreteParams.q}`,
      role: 'State & Resistance Dampening Filter',
      bg: 'bg-amber-500/10 border-amber-500/30',
      text: 'text-amber-400',
    },
  };

  const termDefinitions = selectedFormula === 'continuous' ? continuousTermDefs : discreteTermDefs;

  const handleModeChange = (mode: 'continuous' | 'discrete') => {
    setSelectedFormula(mode);
    setActiveTerm(null);
    if (onToggleFormulaMode) {
      onToggleFormulaMode(mode);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-2xl relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
        {/* Title and LaTeX block */}
        <div className="flex-1 w-full">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Governing Equation Model
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {currentPreset.category} • {currentPreset.name}
              </span>
            </div>

            {/* Formula Switcher Tabs */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => handleModeChange('discrete')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  selectedFormula === 'discrete'
                    ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Discrete Recurrence (Λ*k)
              </button>
              <button
                onClick={() => handleModeChange('continuous')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  selectedFormula === 'continuous'
                    ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Continuous Integral (∫)
              </button>
            </div>
          </div>

          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            {selectedFormula === 'discrete'
              ? 'Discrete Non-Linear Recurrence Memory Model'
              : 'Continuous Memory-Weighted Energy Dissipation Integral'}
          </h1>

          {/* Interactive KaTeX Display */}
          <div className="my-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-inner">
            <div
              className="text-base md:text-xl lg:text-2xl font-mono text-slate-100 overflow-x-auto max-w-full py-1 text-center md:text-left"
              dangerouslySetInnerHTML={renderMath(selectedFormula === 'discrete' ? discreteLatex : continuousLatex)}
            />

            <div className="flex items-center gap-3 text-xs text-slate-400 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-4 min-w-[170px]">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-semibold text-sm">
                  <span>{selectedFormula === 'discrete' ? 'Λ*k =' : 'Λ ='}</span>
                  <span className="text-base text-white">
                    {selectedFormula === 'discrete'
                      ? results.totalLambdaDiscrete.toFixed(3)
                      : results.totalLambda.toFixed(3)}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Unit: {currentPreset.unitLambda}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Term Inspector Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-slate-400 flex items-center gap-1 font-medium mr-1">
              <Info className="w-3.5 h-3.5" /> Hover or tap term:
            </span>

            {selectedFormula === 'discrete' ? (
              <>
                <button
                  onMouseEnter={() => setActiveTerm('Lambda_k')}
                  onClick={() => setActiveTerm('Lambda_k')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all border ${
                    activeTerm === 'Lambda_k'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-500/10'
                      : 'bg-slate-800/60 border-slate-700/60 text-emerald-400 hover:bg-slate-800'
                  }`}
                >
                  Λ*k State
                </button>

                <button
                  onMouseEnter={() => setActiveTerm('Lambda_prev')}
                  onClick={() => setActiveTerm('Lambda_prev')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all border ${
                    activeTerm === 'Lambda_prev'
                      ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 shadow-lg shadow-indigo-500/10'
                      : 'bg-slate-800/60 border-slate-700/60 text-indigo-400 hover:bg-slate-800'
                  }`}
                >
                  Λ*k-1
                </button>

                <button
                  onMouseEnter={() => setActiveTerm('DrivingTerm')}
                  onClick={() => setActiveTerm('DrivingTerm')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all border ${
                    activeTerm === 'DrivingTerm'
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-lg shadow-cyan-500/10'
                      : 'bg-slate-800/60 border-slate-700/60 text-cyan-400 hover:bg-slate-800'
                  }`}
                >
                  Δt·(Pr_k·k)^(1/k)
                </button>

                <button
                  onMouseEnter={() => setActiveTerm('ExpDampening')}
                  onClick={() => setActiveTerm('ExpDampening')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all border ${
                    activeTerm === 'ExpDampening'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-lg shadow-amber-500/10'
                      : 'bg-slate-800/60 border-slate-700/60 text-amber-400 hover:bg-slate-800'
                  }`}
                >
                  exp[-((kΔtR)/C)^n (Λ*k-1/U0)^q]
                </button>
              </>
            ) : (
              <>
                <button
                  onMouseEnter={() => setActiveTerm('Lambda')}
                  onClick={() => setActiveTerm('Lambda')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all border ${
                    activeTerm === 'Lambda'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-500/10'
                      : 'bg-slate-800/60 border-slate-700/60 text-emerald-400 hover:bg-slate-800'
                  }`}
                >
                  Λ (Total)
                </button>

                <button
                  onMouseEnter={() => setActiveTerm('Kc')}
                  onClick={() => setActiveTerm('Kc')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all border ${
                    activeTerm === 'Kc'
                      ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 shadow-lg shadow-indigo-500/10'
                      : 'bg-slate-800/60 border-slate-700/60 text-indigo-400 hover:bg-slate-800'
                  }`}
                >
                  Kc = {Kc}
                </button>

                <button
                  onMouseEnter={() => setActiveTerm('Integral')}
                  onClick={() => setActiveTerm('Integral')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all border ${
                    activeTerm === 'Integral'
                      ? 'bg-purple-500/20 border-purple-500 text-purple-300 shadow-lg shadow-purple-500/10'
                      : 'bg-slate-800/60 border-slate-700/60 text-purple-400 hover:bg-slate-800'
                  }`}
                >
                  ∫ (Integral)
                </button>

                <button
                  onMouseEnter={() => setActiveTerm('Phi')}
                  onClick={() => setActiveTerm('Phi')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all border ${
                    activeTerm === 'Phi'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-lg shadow-amber-500/10'
                      : 'bg-slate-800/60 border-slate-700/60 text-amber-400 hover:bg-slate-800'
                  }`}
                >
                  Φ(t) Kernel
                </button>

                <button
                  onMouseEnter={() => setActiveTerm('dUdt')}
                  onClick={() => setActiveTerm('dUdt')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all border ${
                    activeTerm === 'dUdt'
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-lg shadow-rose-500/10'
                      : 'bg-slate-800/60 border-slate-700/60 text-rose-400 hover:bg-slate-800'
                  }`}
                >
                  -dU/dt Rate
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Term Explanation Drawer */}
      {activeTerm && termDefinitions[activeTerm] && (
        <div
          className={`mt-4 p-4 rounded-xl border text-sm transition-all duration-200 ${termDefinitions[activeTerm].bg}`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`font-semibold font-mono text-sm ${termDefinitions[activeTerm].text}`}>
              {termDefinitions[activeTerm].label}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-900/60 text-slate-300 border border-slate-700/50">
              {termDefinitions[activeTerm].role}
            </span>
          </div>
          <p className="text-slate-200 text-xs md:text-sm leading-relaxed mb-2">
            {termDefinitions[activeTerm].desc}
          </p>
          <div className="text-xs font-mono font-semibold text-slate-300">
            Live Simulated Value: <span className="text-white bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">{termDefinitions[activeTerm].currentVal}</span>
          </div>
        </div>
      )}
    </div>
  );
});
