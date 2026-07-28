import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  Legend,
  ReferenceLine,
} from 'recharts';
import { SimulationResults, DomainPreset } from '../types';
import { TrendingDown, Zap, Shield, BarChart3, Clock } from 'lucide-react';

interface InteractiveChartsProps {
  results: SimulationResults;
  currentPreset: DomainPreset;
  simTime: number;
}

export const InteractiveCharts: React.FC<InteractiveChartsProps> = React.memo(({
  results,
  currentPreset,
  simTime,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'potential' | 'kernel' | 'accumulated'>('all');
  const roundedTime = Math.round(simTime * 10) / 10;

  // Custom Crisp Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded shadow-xl text-xs font-mono space-y-1 z-50 text-white">
          <p className="text-slate-400 font-bold border-b border-slate-800 pb-1">
            Time t = {label}s
          </p>
          {payload.map((p: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5" style={{ color: p.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                {p.name}:
              </span>
              <span className="font-semibold text-white">{p.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col gap-6 text-slate-800">
      {/* Header and View Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Calculus Curves & Integration Decomposition
            </h2>
          </div>
          <p className="text-[11px] text-slate-500">
            Realtime decomposition of energy release rates, memory weighting, and accumulated integral curves
          </p>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded transition-colors ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Split
          </button>
          <button
            onClick={() => setActiveTab('potential')}
            className={`px-3 py-1 rounded transition-colors ${
              activeTab === 'potential'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Potential U(t)
          </button>
          <button
            onClick={() => setActiveTab('kernel')}
            className={`px-3 py-1 rounded transition-colors ${
              activeTab === 'kernel'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Kernel Φ(t)
          </button>
          <button
            onClick={() => setActiveTab('accumulated')}
            className={`px-3 py-1 rounded transition-colors ${
              activeTab === 'accumulated'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Integral Λ(t)
          </button>
        </div>
      </div>

      {/* Grid of Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 1: Potential U(t) and -dU/dt */}
        {(activeTab === 'all' || activeTab === 'potential') && (
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-700 flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4 text-sky-600" />
                Potential Energy U(t) & Release Rate (-dU/dt)
              </span>
              <span className="text-[11px] font-mono text-slate-500 font-semibold">
                Peak Drop Rate: {results.peakDissipationRate.toFixed(2)}/s
              </span>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={results.points} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="t" stroke="#64748b" fontSize={11} tickFormatter={(v) => `${v}s`} />
                  <YAxis yAxisId="left" stroke="#0284c7" fontSize={11} />
                  <YAxis yAxisId="right" orientation="right" stroke="#e11d48" fontSize={11} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <ReferenceLine
                    x={roundedTime}
                    stroke="#6366f1"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    label={{ value: `t=${roundedTime}s`, position: 'top', fill: '#4f46e5', fontSize: 10 }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="U"
                    name={currentPreset.interpretation.U}
                    stroke="#0284c7"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="minus_dU_dt"
                    name={currentPreset.interpretation.minus_dU_dt}
                    stroke="#e11d48"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* CHART 2: Memory Kernel Phi(t) & Integrand Product */}
        {(activeTab === 'all' || activeTab === 'kernel') && (
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-700 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600" />
                Memory Kernel Φ(t) & Integrand Product Φ(t)·(-dU/dt)
              </span>
              <span className="text-[11px] font-mono text-slate-500 font-semibold">
                Memory Decay
              </span>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={results.points} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="integrandGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9333ea" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#9333ea" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="t" stroke="#64748b" fontSize={11} tickFormatter={(v) => `${v}s`} />
                  <YAxis yAxisId="left" stroke="#d97706" fontSize={11} domain={[0, 1.1]} />
                  <YAxis yAxisId="right" orientation="right" stroke="#9333ea" fontSize={11} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <ReferenceLine
                    x={roundedTime}
                    stroke="#6366f1"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="Phi"
                    name={currentPreset.interpretation.Phi}
                    stroke="#d97706"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="integrand"
                    name="Integrand Φ(t)·(-dU/dt)"
                    stroke="#9333ea"
                    fillOpacity={1}
                    fill="url(#integrandGrad)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* CHART 3: Accumulated Lambda Integration Curve & Discrete Recurrence */}
        {(activeTab === 'all' || activeTab === 'accumulated') && (
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg flex flex-col gap-3 lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-600" />
                Accumulated Dissipation: Continuous Integral Λ(t) vs Discrete Recurrence Λ*k
              </span>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                  Continuous Λ(T) = {results.totalLambda.toFixed(3)}
                </span>
                <span className="text-indigo-800 font-bold bg-indigo-100 px-2 py-0.5 rounded border border-indigo-300">
                  Discrete Λ*k(T) = {results.totalLambdaDiscrete.toFixed(3)}
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={results.points} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="lambdaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="discreteGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="t" stroke="#64748b" fontSize={11} tickFormatter={(v) => `${v}s`} />
                  <YAxis stroke="#059669" fontSize={11} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <ReferenceLine
                    x={roundedTime}
                    stroke="#6366f1"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    label={{ value: `Cursor t=${roundedTime}s`, position: 'top', fill: '#059669', fontSize: 11 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="cumLambda"
                    name="Continuous Integral Λ(t)"
                    stroke="#059669"
                    fillOpacity={1}
                    fill="url(#lambdaGrad)"
                    strokeWidth={2.5}
                  />
                  <Line
                    type="monotone"
                    dataKey="cumLambdaDiscrete"
                    name="Discrete Recurrence Λ*k"
                    stroke="#4f46e5"
                    strokeWidth={3}
                    dot={false}
                    strokeDasharray="4 2"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

