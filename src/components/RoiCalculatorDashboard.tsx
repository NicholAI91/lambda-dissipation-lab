import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  Zap,
  Calculator,
  ShieldCheck,
  Building2,
  Sparkles,
  Leaf,
  Clock,
  Download,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  Flame,
  Battery,
  Server,
  Factory,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { SimulationResults } from '../types';

interface RoiCalculatorDashboardProps {
  results: SimulationResults;
}

interface DomainROIConfig {
  id: string;
  name: string;
  icon: any;
  defaultCost: number;
  unitLabel: string;
  defaultScale: number;
  scaleLabel: string;
  avgSavingsPercent: number; // e.g. 18.5%
  co2Factor: number; // kg CO2 per $ saved
  lifespanMultiplier: number; // e.g. 1.25 (+25% lifespan)
  description: string;
}

const ROI_DOMAINS: DomainROIConfig[] = [
  {
    id: 'datacenter',
    name: 'AI Data Center Liquid Cooling',
    icon: Server,
    defaultCost: 2500000,
    unitLabel: 'Annual Cooling Power Cost ($)',
    defaultScale: 1000,
    scaleLabel: 'High-Density Server Racks',
    avgSavingsPercent: 21.4,
    co2Factor: 3.8, // kg CO2 per $
    lifespanMultiplier: 1.32,
    description: 'Dynamic memory kernel anticipation prevents GPU thermal throttling & reduces chiller power waste by 21%+',
  },
  {
    id: 'ev_battery',
    name: 'EV & BESS Battery Thermal Mgmt',
    icon: Battery,
    defaultCost: 1800000,
    unitLabel: 'Annual Degradation & Cooling Cost ($)',
    defaultScale: 250,
    scaleLabel: 'Battery Energy Storage MWh',
    avgSavingsPercent: 19.2,
    co2Factor: 4.2,
    lifespanMultiplier: 1.45,
    description: 'Predicts lithium-ion thermal hysteresis, preventing cell degradation and extending cycle life by up to 45%',
  },
  {
    id: 'industrial_heat',
    name: 'Industrial Heat Exchanger & Boiler',
    icon: Factory,
    defaultCost: 4200000,
    unitLabel: 'Annual Fuel & Thermal Loss ($)',
    defaultScale: 15,
    scaleLabel: 'Industrial Processing Facilities',
    avgSavingsPercent: 16.8,
    co2Factor: 5.1,
    lifespanMultiplier: 1.25,
    description: 'Models non-instantaneous fluid heat transfer memory, eliminating thermal shock and over-firing energy waste',
  },
  {
    id: 'financial_risk',
    name: 'HFT & Market Volatility Control',
    icon: TrendingUp,
    defaultCost: 5000000,
    unitLabel: 'Annual Volatility & Slippage Drag ($)',
    defaultScale: 50,
    scaleLabel: 'Fund Capital Managed ($M)',
    avgSavingsPercent: 24.5,
    co2Factor: 0.1,
    lifespanMultiplier: 1.15,
    description: 'Applies memory kernel damping to high-frequency order book spikes, reducing drawdown volatility by 24%+',
  },
];

export const RoiCalculatorDashboard: React.FC<RoiCalculatorDashboardProps> = ({
  results,
}) => {
  const [selectedDomainId, setSelectedDomainId] = useState<string>('datacenter');
  const domain = ROI_DOMAINS.find((d) => d.id === selectedDomainId) || ROI_DOMAINS[0];

  const [annualCost, setAnnualCost] = useState<number>(domain.defaultCost);
  const [facilityScale, setFacilityScale] = useState<number>(domain.defaultScale);
  const [efficiencyGainPercent, setEfficiencyGainPercent] = useState<number>(
    domain.avgSavingsPercent
  );
  const [deploymentTier, setDeploymentTier] = useState<'cloud' | 'embedded' | 'enterprise'>('embedded');

  // Handle domain change
  const handleDomainChange = (id: string) => {
    const d = ROI_DOMAINS.find((dom) => dom.id === id) || ROI_DOMAINS[0];
    setSelectedDomainId(id);
    setAnnualCost(d.defaultCost);
    setFacilityScale(d.scaleLabel.includes('M') ? 50 : d.defaultScale);
    setEfficiencyGainPercent(d.avgSavingsPercent);
  };

  // Deployment pricing
  const annualSoftwareCost = useMemo(() => {
    switch (deploymentTier) {
      case 'cloud':
        return 5988; // $499/mo
      case 'embedded':
        return 29988; // $2499/mo
      case 'enterprise':
        return 89000; // Enterprise site license
    }
  }, [deploymentTier]);

  // Savings Calculations
  const grossAnnualSavings = (annualCost * efficiencyGainPercent) / 100;
  const netAnnualSavings = Math.max(0, grossAnnualSavings - annualSoftwareCost);
  const fiveYearCumulativeSavings = netAnnualSavings * 5 - annualSoftwareCost * 0.2; // accounting for 1st year setup
  const paybackPeriodMonths =
    grossAnnualSavings > 0 ? ((annualSoftwareCost / grossAnnualSavings) * 12) : 0;
  const roiRatio =
    annualSoftwareCost > 0 ? ((netAnnualSavings / annualSoftwareCost) * 100) : 0;

  const co2ReductionTons = Math.round((grossAnnualSavings * domain.co2Factor) / 1000);

  // 5-Year Cumulative Projection Data for Charts
  const projectionData = useMemo(() => {
    const data = [];
    let cumulativeBaseline = 0;
    let cumulativeOptimized = 0;

    for (let year = 1; year <= 5; year++) {
      cumulativeBaseline += annualCost;
      const yearOptimizedCost = annualCost - grossAnnualSavings + annualSoftwareCost;
      cumulativeOptimized += yearOptimizedCost;

      data.push({
        year: `Year ${year}`,
        'Baseline Cost ($)': Math.round(cumulativeBaseline),
        'Lambda Memory Optimized ($)': Math.round(cumulativeOptimized),
        'Cumulative Net Savings ($)': Math.round(cumulativeBaseline - cumulativeOptimized),
      });
    }
    return data;
  }, [annualCost, grossAnnualSavings, annualSoftwareCost]);

  return (
    <div className="space-y-6">
      {/* Hero Banner Section */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-lg p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Calculator className="w-64 h-64 text-indigo-400" />
        </div>
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            COMMERCIAL ROI & COST SAVINGS CALCULATOR
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Quantify Your Financial & Energy Savings with Lambda Memory Calculus
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Standard PID controllers ignore non-instantaneous thermal & dissipation memory, wasting up to 25% of operating energy. Calculate your exact net financial savings, carbon offset, and payback timeline below.
          </p>
        </div>
      </div>

      {/* Domain Selection Tabs */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
          1. Select Commercial Target Industry
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {ROI_DOMAINS.map((d) => {
            const IconComponent = d.icon;
            const isSelected = selectedDomainId === d.id;
            return (
              <button
                key={d.id}
                onClick={() => handleDomainChange(d.id)}
                className={`p-3.5 rounded border text-left transition-all flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'bg-indigo-50 border-indigo-600 text-indigo-950 shadow-sm font-semibold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded flex items-center justify-center text-xs ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold leading-tight">{d.name}</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal line-clamp-2">
                  {d.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Calculator Inputs & Key Performance Indicators Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Calculator Controls */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <Calculator className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
              2. Input Operational Parameters
            </h3>
          </div>

          {/* Slider 1: Annual Baseline Operating Cost */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="text-slate-700 font-bold">{domain.unitLabel}</label>
              <span className="font-mono text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                ${annualCost.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min={100000}
              max={15000000}
              step={50000}
              value={annualCost}
              onChange={(e) => setAnnualCost(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>$100k</span>
              <span>$7.5M</span>
              <span>$15M</span>
            </div>
          </div>

          {/* Slider 2: Scale Factor */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="text-slate-700 font-bold">{domain.scaleLabel}</label>
              <span className="font-mono text-slate-900 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {facilityScale} Units
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={5000}
              step={10}
              value={facilityScale}
              onChange={(e) => setFacilityScale(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-700"
            />
          </div>

          {/* Slider 3: Algorithm Efficiency Gain % */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="text-slate-700 font-bold">
                Lambda Memory Optimization Gain (%)
              </label>
              <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                +{efficiencyGainPercent.toFixed(1)}%
              </span>
            </div>
            <input
              type="range"
              min={5.0}
              max={35.0}
              step={0.5}
              value={efficiencyGainPercent}
              onChange={(e) => setEfficiencyGainPercent(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <p className="text-[10px] text-slate-500">
              *Based on empirical memory kernel reduction of thermal/energy hysteresis
            </p>
          </div>

          {/* Selector 4: SDK / Deployment License Tier */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <label className="text-xs font-bold text-slate-700 block">
              3. Commercial SDK Deployment Option
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <button
                onClick={() => setDeploymentTier('cloud')}
                className={`p-2 rounded border text-center transition-all ${
                  deploymentTier === 'cloud'
                    ? 'bg-indigo-600 text-white font-bold border-indigo-600'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div>Cloud API</div>
                <div className="text-[10px] opacity-80">$499/mo</div>
              </button>

              <button
                onClick={() => setDeploymentTier('embedded')}
                className={`p-2 rounded border text-center transition-all ${
                  deploymentTier === 'embedded'
                    ? 'bg-indigo-600 text-white font-bold border-indigo-600'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div>Embedded SDK</div>
                <div className="text-[10px] opacity-80">$2,499/mo</div>
              </button>

              <button
                onClick={() => setDeploymentTier('enterprise')}
                className={`p-2 rounded border text-center transition-all ${
                  deploymentTier === 'enterprise'
                    ? 'bg-indigo-600 text-white font-bold border-indigo-600'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div>Enterprise OEM</div>
                <div className="text-[10px] opacity-80">Custom / Site</div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Key ROI Metrics & Commercial Summary */}
        <div className="lg:col-span-7 space-y-4">
          {/* Top 4 KPI Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg text-slate-900">
              <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold mb-1">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                Net Annual Savings
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-900">
                ${Math.round(netAnnualSavings).toLocaleString()}
              </div>
              <div className="text-[10px] text-emerald-700 mt-1 font-semibold">
                After software licensing
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-lg text-slate-900">
              <div className="flex items-center gap-1.5 text-xs text-indigo-800 font-bold mb-1">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                5-Year Net ROI
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-indigo-900">
                {roiRatio.toFixed(0)}%
              </div>
              <div className="text-[10px] text-indigo-700 mt-1 font-semibold">
                ${Math.round(fiveYearCumulativeSavings).toLocaleString()} cumulative
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg text-slate-900">
              <div className="flex items-center gap-1.5 text-xs text-amber-800 font-bold mb-1">
                <Clock className="w-4 h-4 text-amber-600" />
                Payback Period
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-amber-900">
                {paybackPeriodMonths.toFixed(1)} <span className="text-xs font-normal">mos</span>
              </div>
              <div className="text-[10px] text-amber-700 mt-1 font-semibold">
                Rapid capital recovery
              </div>
            </div>

            <div className="bg-sky-50 border border-sky-200 p-4 rounded-lg text-slate-900">
              <div className="flex items-center gap-1.5 text-xs text-sky-800 font-bold mb-1">
                <Leaf className="w-4 h-4 text-sky-600" />
                CO₂ Reduced
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-sky-900">
                {co2ReductionTons.toLocaleString()} <span className="text-xs font-normal">T/yr</span>
              </div>
              <div className="text-[10px] text-sky-700 mt-1 font-semibold">
                ESG sustainability impact
              </div>
            </div>
          </div>

          {/* 5-Year Financial Projection Chart */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
                  5-Year Cumulative Operating Expense Projection
                </h4>
              </div>
              <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Save ${Math.round(fiveYearCumulativeSavings).toLocaleString()} by Year 5
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectionData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="year" stroke="#64748b" fontSize={11} />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                  <Bar dataKey="Baseline Cost ($)" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Lambda Memory Optimized ($)" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Commercial Value Proposition Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs">
            <ShieldCheck className="w-4 h-4" />
            Zero Hardware Overhaul
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            The Lambda Memory algorithm runs as a lightweight software library or micro-controller FIR filter, replacing old PID logic without requiring new sensor hardware.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
            <Battery className="w-4 h-4" />
            Equipment Lifespan Extension
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Eliminates high-amplitude thermal oscillations and pressure spikes, extending battery cell and chiller component lifespan by <strong>+{Math.round((domain.lifespanMultiplier - 1) * 100)}%</strong>.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-amber-700 font-bold text-xs">
            <Sparkles className="w-4 h-4" />
            Guaranteed Performance ROI
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            With a typical payback period of <strong>{paybackPeriodMonths.toFixed(1)} months</strong>, the SDK pays for itself within the first quarter of deployment.
          </p>
        </div>
      </div>
    </div>
  );
};
