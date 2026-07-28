import React, { useState } from 'react';
import { SimulationParams, SimulationResults, KernelType } from '../types';
import { runSimulation } from '../utils/mathEngine';
import { GitCompare, ArrowRightLeft, Sparkles } from 'lucide-react';
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

interface ComparisonPanelProps {
  baseParams: SimulationParams;
  baseResults: SimulationResults;
}

export const ComparisonPanel: React.FC<ComparisonPanelProps> = ({
  baseParams,
  baseResults,
}) => {
  const [altKernelType, setAltKernelType] = useState<KernelType>('uniform');
  const [altBeta, setAltBeta] = useState<number>(0.1);

  // Compute Alt Simulation
  const altParams: SimulationParams = {
    ...baseParams,
    kernelType: altKernelType,
    kernelParams: {
      ...baseParams.kernelParams,
      beta: altBeta,
    },
  };

  const altResults = runSimulation(altParams);

  // Merge points for combined chart
  const combinedPoints = baseResults.points.map((pt, idx) => {
    const altPt = altResults.points[idx] || pt;
    return {
      t: pt.t,
      primaryLambda: pt.cumLambda,
      altLambda: altPt.cumLambda,
      primaryPhi: pt.Phi,
      altPhi: altPt.Phi,
    };
  });

  const diffLambda = baseResults.totalLambda - altResults.totalLambda;
  const percentDiff =
    altResults.totalLambda > 0
      ? ((diffLambda / altResults.totalLambda) * 100).toFixed(1)
      : '0.0';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-xl flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-semibold text-white">
              Side-by-Side Kernel Benchmark Comparison
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Compare active model kernel against an alternative benchmark configuration
          </p>
        </div>

        {/* Alternative Kernel Selection */}
        <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400 font-medium">Compare with:</span>
          <select
            value={altKernelType}
            onChange={(e) => setAltKernelType(e.target.value as KernelType)}
            className="bg-slate-900 text-white font-semibold rounded-lg px-2.5 py-1 border border-slate-700/80 focus:outline-none"
          >
            <option value="uniform">Uniform (No Memory Loss)</option>
            <option value="exponential">Exponential Fading</option>
            <option value="power_law">Power Law Fading</option>
            <option value="gaussian">Gaussian Memory Window</option>
            <option value="sliding_window">Sliding Window Buffer</option>
          </select>
        </div>
      </div>

      {/* Comparison Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-950/70 border border-emerald-500/30 p-4 rounded-xl">
          <span className="text-xs text-slate-400 font-mono block">Active Kernel Λ</span>
          <span className="text-xl font-bold font-mono text-emerald-400">
            {baseResults.totalLambda.toFixed(3)}
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">
            Type: {baseParams.kernelType}
          </span>
        </div>

        <div className="bg-slate-950/70 border border-sky-500/30 p-4 rounded-xl">
          <span className="text-xs text-slate-400 font-mono block">Benchmark Kernel Λ</span>
          <span className="text-xl font-bold font-mono text-sky-400">
            {altResults.totalLambda.toFixed(3)}
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">
            Type: {altKernelType}
          </span>
        </div>

        <div className="bg-slate-950/70 border border-indigo-500/30 p-4 rounded-xl">
          <span className="text-xs text-slate-400 font-mono block">Dissipation Difference</span>
          <span
            className={`text-xl font-bold font-mono ${
              diffLambda >= 0 ? 'text-amber-400' : 'text-rose-400'
            }`}
          >
            {diffLambda >= 0 ? `+${diffLambda.toFixed(3)}` : diffLambda.toFixed(3)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">
            {diffLambda >= 0 ? `${percentDiff}% higher` : `${percentDiff}% lower`}
          </span>
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="h-64 w-full bg-slate-950/70 border border-slate-800/80 p-4 rounded-xl">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={combinedPoints} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="t" stroke="#64748b" fontSize={11} tickFormatter={(v) => `${v}s`} />
            <YAxis stroke="#94a3b8" fontSize={11} />
            <Tooltip
              contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', fontSize: '12px' }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
            <Line
              type="monotone"
              dataKey="primaryLambda"
              name={`Active Kernel (${baseParams.kernelType}) Λ`}
              stroke="#10b981"
              strokeWidth={3}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="altLambda"
              name={`Benchmark (${altKernelType}) Λ`}
              stroke="#38bdf8"
              strokeWidth={2.5}
              strokeDasharray="4 4"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
