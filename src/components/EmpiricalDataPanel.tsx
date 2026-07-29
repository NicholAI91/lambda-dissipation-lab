import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { Database, TrendingUp, Cpu, Battery, Activity } from 'lucide-react';

export const EmpiricalDataPanel: React.FC = () => {
  const [batteryData, setBatteryData] = useState<any[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<any[]>([]);
  const [reportMd, setReportMd] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'battery' | 'timeseries' | 'report'>('battery');

  useEffect(() => {
    // Load Battery Data
    fetch('/data/battery_test_data.csv')
      .then(res => res.text())
      .then(csv => {
        Papa.parse(csv, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            setBatteryData(results.data);
          }
        });
      })
      .catch(err => console.error("Error loading battery data", err));

    // Load Time Series Data
    fetch('/data/time_series_export.csv')
      .then(res => res.text())
      .then(csv => {
        Papa.parse(csv, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            setTimeSeriesData(results.data);
          }
        });
      })
      .catch(err => console.error("Error loading time series data", err));

    // Load Report MD
    fetch('/data/lambda_evaluation_report.md')
      .then(res => res.text())
      .then(md => setReportMd(md))
      .catch(err => console.error("Error loading report", err));
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded shadow-xl text-xs font-mono space-y-1 z-50 text-white">
          <p className="text-slate-400 font-bold border-b border-slate-800 pb-1">
            Time / Index = {label}
          </p>
          {payload.map((p: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5" style={{ color: p.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                {p.name}:
              </span>
              <span className="font-semibold text-white">{typeof p.value === 'number' ? p.value.toFixed(3) : p.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('battery')}
          className={`px-3.5 py-2 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeTab === 'battery'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <Battery className="w-4 h-4" />
          Battery Test Data
        </button>
        <button
          onClick={() => setActiveTab('timeseries')}
          className={`px-3.5 py-2 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeTab === 'timeseries'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          Lambda Time Series
        </button>
        <button
          onClick={() => setActiveTab('report')}
          className={`px-3.5 py-2 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeTab === 'report'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <Database className="w-4 h-4" />
          Evaluation Report
        </button>
      </div>

      {activeTab === 'battery' && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Battery className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Battery Charge/Discharge Test Data</h3>
              <p className="text-[11px] text-slate-500">Net Voltage, Effective Power, and SOC over 20 Hours.</p>
            </div>
          </div>
          
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={batteryData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="Time (Hours)" 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <YAxis 
                  yAxisId="left" 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Line yAxisId="left" type="monotone" dataKey="SOC (%)" stroke="#10b981" strokeWidth={2} dot={false} name="State of Charge (%)" />
                <Line yAxisId="right" type="monotone" dataKey="Net Voltage (V)" stroke="#3b82f6" strokeWidth={2} dot={false} name="Voltage (V)" />
                <Line yAxisId="left" type="monotone" dataKey="Effective Power (W)" stroke="#f59e0b" strokeWidth={2} dot={false} name="Power (W)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'timeseries' && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Activity className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Lambda Model: Full Time-Series Export</h3>
              <p className="text-[11px] text-slate-500">Visualization of the memory-weighted dissipation framework.</p>
            </div>
          </div>
          
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeriesData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLambda" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="Time_t" 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <YAxis 
                  yAxisId="left" 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                
                <Area yAxisId="left" type="monotone" dataKey="Cum_Lambda" stroke="#4f46e5" fillOpacity={1} fill="url(#colorLambda)" strokeWidth={2} name="Accumulated Lambda" />
                <Line yAxisId="left" type="monotone" dataKey="Potential_U" stroke="#0ea5e9" strokeWidth={2} dot={false} name="Potential U(t)" />
                <Line yAxisId="right" type="monotone" dataKey="Kernel_Phi" stroke="#f43f5e" strokeWidth={2} dot={false} name="Memory Kernel Phi(t)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'report' && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm prose prose-sm max-w-none text-slate-800 prose-headings:text-slate-900 prose-a:text-indigo-600">
          <div className="markdown-body">
            <Markdown remarkPlugins={[remarkGfm]}>{reportMd}</Markdown>
          </div>
        </div>
      )}
    </div>
  );
};
