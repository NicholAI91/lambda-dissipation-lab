import React, { useState } from 'react';
import { SimulationParams } from '../types';
import { computeSensitivitySweep } from '../utils/mathEngine';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { SlidersHorizontal, Sparkles, TrendingUp, Info } from 'lucide-react';

interface SensitivityAnalysisProps {
  baseParams: SimulationParams;
}

export const SensitivityAnalysis: React.FC<SensitivityAnalysisProps> = ({ baseParams }) => {
  const [variable, setVariable] = useState<'Kc' | 'beta' | 'k'>('beta');
  const [minVal, setMinVal] = useState<number>(0.05);
  const [maxVal, setMaxVal] = useState<number>(2.0);

  // Compute sweep data on the fly
  const sweepData = computeSensitivitySweep(baseParams, variable, minVal, maxVal, 20);

  const varInfo = {
    Kc: {
      title: 'Coupling Constant (K_c)',
      desc: 'Evaluates linear scaling effect of coupling efficiency on total output dissipation Λ.',
      unit: 'Multiplier',
    },
    beta: {
      title: 'Memory Fading Rate (β)',
      desc: 'Shows how faster memory decay (higher β) reduces accumulated dissipation by discounting late energy releases.',
      unit: 's⁻¹',
    },
    k: {
      title: 'Potential Energy Release Rate (k)',
      desc: 'Analyzes how rapid potential drops (-dU/dt) interact with memory window timing.',
      unit: 's⁻¹',
    },
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-xl flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-semibold text-white">
              Sensitivity & Parameter Sweep Analysis
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Sweep a parameter across a continuous range to observe non-linear response in total output Λ
          </p>
        </div>

        {/* Sweep Variable Selector Buttons */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-medium">
          <button
            onClick={() => {
              setVariable('beta');
              setMinVal(0.02);
              setMaxVal(2.0);
            }}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              variable === 'beta'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sweep β (Memory)
          </button>
          <button
            onClick={() => {
              setVariable('Kc');
              setMinVal(0.1);
              setMaxVal(5.0);
            }}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              variable === 'Kc'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sweep K_c
          </button>
          <button
            onClick={() => {
              setVariable('k');
              setMinVal(0.05);
              setMaxVal(2.5);
            }}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              variable === 'k'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sweep k (Release Rate)
          </button>
        </div>
      </div>

      {/* Description Callout */}
      <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-xl text-xs text-slate-300 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white">{varInfo[variable].title}: </span>
          <span>{varInfo[variable].desc}</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 w-full bg-slate-950/70 border border-slate-800/80 p-4 rounded-xl">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sweepData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="paramVal"
              stroke="#64748b"
              fontSize={11}
              label={{ value: `${varInfo[variable].title} (${varInfo[variable].unit})`, position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 11 }}
            />
            <YAxis yAxisId="left" stroke="#10b981" fontSize={11} />
            <YAxis yAxisId="right" orientation="right" stroke="#6366f1" fontSize={11} unit="%" />
            <Tooltip
              contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', fontSize: '12px' }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="lambda"
              name="Accumulated Λ"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ r: 2 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="efficiency"
              name="Memory Efficiency %"
              stroke="#6366f1"
              strokeWidth={2}
              strokeDasharray="3 3"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
