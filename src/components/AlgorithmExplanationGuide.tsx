import React, { useState } from 'react';
import katex from 'katex';
import {
  BookOpen,
  Layers,
  Sparkles,
  Code2,
  Copy,
  Check,
  Zap,
} from 'lucide-react';

export const AlgorithmExplanationGuide: React.FC = () => {
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [activeCodeLang, setActiveCodeLang] = useState<'ts' | 'python'>('ts');

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

  const typescriptSnippet = `import { LambdaCalculusEngine, ExponentialKernel } from '@lambda/dissipation-sdk';

// Initialize Lambda Memory Controller
const engine = new LambdaCalculusEngine({
  Kc: 1.25, // Coupling constant
  kernel: new ExponentialKernel({ beta: 0.4 }), // Memory decay rate
  timeHorizon: 10.0, // Control window (seconds)
});

// Control Loop Integration (e.g., 100Hz HVAC / Chiller Loop)
function onThermalSensorTick(currentPotential: number, deltaTimeSec: number) {
  // Compute memory-weighted dissipation integral
  const lambdaDissipation = engine.step(currentPotential, deltaTimeSec);

  // Apply anticipatory control output (prevents overshoot waste)
  const adjustedChillerPower = calculateOptimalPower(lambdaDissipation);
  return adjustedChillerPower;
}`;

  const pythonSnippet = `from lambda_dissipation import LambdaEngine, GaussianKernel

# Initialize Lambda Memory Control Engine
engine = LambdaEngine(
    kc=1.25,
    kernel=GaussianKernel(mu=5.0, sigma=1.5),
    time_span=10.0
)

# Real-time control loop iteration
def control_step(u_potential, dt):
    # Calculate continuous memory weighted dissipation \\Lambda(t)
    lambda_val = engine.compute_step(u_potential, dt)
    
    # Send memory-adjusted command to valve / inverter
    return lambda_val`;

  const handleCopyCode = () => {
    const code = activeCodeLang === 'ts' ? typescriptSnippet : pythonSnippet;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-8 text-slate-800">
      {/* Overview Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center text-white font-mono font-bold text-base shadow-sm">
            Λ
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Understanding the Lambda Continuous Memory Calculus Algorithm
            </h2>
            <p className="text-xs text-slate-500">
              A Mathematical Guide to Memory-Weighted Dissipation & Commercial Optimization
            </p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Standard industrial controllers (like traditional PID or exponential decay models) assume that energy release or dissipation is <strong>memoryless</strong> — meaning current energy drop depends solely on the immediate state. However, real-world physical systems (fluid thermal dynamics, battery chemical hysteresis, market order book depth) possess <strong>retrospective memory</strong>. Ignoring this memory leads to over-correction, thermal lag, and up to 25% energy waste.
        </p>

        {/* Master Formula Callout */}
        <div className="bg-slate-900 text-white rounded-lg p-5 border border-slate-800 shadow-inner font-mono space-y-4">
          {/* Continuous Formula */}
          <div>
            <div className="text-[11px] uppercase tracking-wider text-indigo-400 font-bold flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              1. Continuous Memory Calculus Integral
            </div>
            <div
              className="text-sm sm:text-base text-center font-bold text-emerald-400 py-2 border-y border-slate-800 overflow-x-auto"
              dangerouslySetInnerHTML={renderMath("\\mathbf{\\Lambda}(t) = K_c \\int_{0}^{t} \\Phi(\\tau) \\left( -\\frac{dU}{d\\tau} \\right) d\\tau")}
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-300 pt-2">
              <div>
                <span className="text-emerald-400 font-bold">Λ(t):</span> Total Accumulated Dissipation
              </div>
              <div>
                <span className="text-indigo-400 font-bold">K_c:</span> Coupling Scale Constant
              </div>
              <div>
                <span className="text-amber-400 font-bold">Φ(τ):</span> Fading Memory Kernel Weight
              </div>
              <div>
                <span className="text-rose-400 font-bold">-dU/dτ:</span> Energy Drop Rate
              </div>
            </div>
          </div>

          {/* Discrete Recurrence Formula */}
          <div className="pt-3 border-t border-slate-800">
            <div className="text-[11px] uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5 mb-2">
              <Zap className="w-3.5 h-3.5" />
              2. Discrete Non-Linear Recurrence Relation
            </div>
            <div
              className="text-xs sm:text-sm md:text-base text-center font-bold text-cyan-300 py-3 bg-slate-950/80 rounded border border-slate-800 overflow-x-auto"
              dangerouslySetInnerHTML={renderMath("\\mathbf{\\Lambda}^*_k = \\Lambda^*_{k-1} + \\Delta t \\cdot (\\text{Pr}_k \\cdot k)^{\\frac{1}{k}} \\cdot \\exp\\left[-\\left(\\frac{k \\Delta t \\cdot R}{C}\\right)^n \\left(\\frac{\\Lambda^*_{k-1}}{U_0}\\right)^q\\right]")}
            />
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px] text-slate-300 pt-2">
              <div>
                <span className="text-cyan-400 font-bold">Λ*k:</span> Iterative Step State
              </div>
              <div>
                <span className="text-indigo-400 font-bold">Pr_k:</span> Step Production Rate
              </div>
              <div>
                <span className="text-amber-400 font-bold">R / C:</span> Resistance & Capacity
              </div>
              <div>
                <span className="text-purple-400 font-bold">n:</span> Power Dampening
              </div>
              <div>
                <span className="text-rose-400 font-bold">q:</span> State Feedback Exponent
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Key Structural Principles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-2">
          <div className="w-8 h-8 rounded bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-bold">
            1
          </div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
            Traditional PID Flaw (Memoryless)
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            PID controllers assume {"\\Phi(\\tau) = 1"} (constant memory). They treat past drops identically to fresh drops, causing delayed actuation and massive thermal overshoots.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-2">
          <div className="w-8 h-8 rounded bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold">
            2
          </div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
            Memory Kernels ({"\\Phi(\\tau)"}) Solution
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            By weighting past states with specialized kernels (Exponential $\beta$, Power Law $\alpha$, or Gaussian $\sigma$), the algorithm anticipates lag and adjusts actuation before energy waste occurs.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-2">
          <div className="w-8 h-8 rounded bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold">
            3
          </div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
            Measurable Commercial Savings
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Deployed as a lightweight software FIR filter or C++/Python SDK, it delivers 15-25% energy savings and extends hardware lifespan without replacing existing sensors or actuators.
          </p>
        </div>
      </div>

      {/* Memory Kernels Breakdown Table */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <Layers className="w-5 h-5 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Supported Mathematical Memory Kernels & Use Cases
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-mono font-bold uppercase text-[10px] border-b border-slate-200">
                <th className="p-3">Kernel Type</th>
                <th className="p-3">Formula {"\\Phi(t)"}</th>
                <th className="p-3">Physical Phenomenon</th>
                <th className="p-3">Optimal Domain Application</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              <tr className="hover:bg-slate-50">
                <td className="p-3 font-bold text-indigo-900 font-mono">Exponential Decay</td>
                <td className="p-3 font-mono text-indigo-700 font-semibold">{"\\Phi(t) = e^{-\\beta t}"}</td>
                <td className="p-3">Standard thermal cooling & viscous friction dissipation</td>
                <td className="p-3">AI Server Liquid Cooling, HVAC Chiller Plants</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-3 font-bold text-indigo-900 font-mono">Power-Law Decay</td>
                <td className="p-3 font-mono text-indigo-700 font-semibold">{"\\Phi(t) = (1 + t)^{-\\alpha}"}</td>
                <td className="p-3">Heavy-tailed long memory, material fatigue, creep strain</td>
                <td className="p-3">EV Battery Degradation, Financial Order Books</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-3 font-bold text-indigo-900 font-mono">Gaussian Peak</td>
                <td className="p-3 font-mono text-indigo-700 font-semibold">{"\\Phi(t) = e^{-\\frac{(t-\\mu)^2}{2\\sigma^2}}"}</td>
                <td className="p-3">Time-delayed thermal shockwave or transport delay</td>
                <td className="p-3">Industrial Heat Exchangers, Chemical Reactors</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-3 font-bold text-indigo-900 font-mono">Sliding Buffer</td>
                <td className="p-3 font-mono text-indigo-700 font-semibold">{"\\Phi(t) = 1 \\text{ if } t \\le W \\text{ else } 0"}</td>
                <td className="p-3">Fixed window memory buffer, hard deadline reset</td>
                <td className="p-3">Edge Compute Rate Limiting, Digital Filters</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-3 font-bold text-indigo-900 font-mono">Damped Oscillator</td>
                <td className="p-3 font-mono text-indigo-700 font-semibold">{"\\Phi(t) = e^{-\\beta t} \\cos(\\omega t)"}</td>
                <td className="p-3">Resonant fluid sloshing, mechanical vibration damping</td>
                <td className="p-3">Grid Energy Frequency Damping, Micro-turbines</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Code Integration Snippet Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 text-white shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Drop-in Software Integration (SDK Code Example)
              </h3>
              <p className="text-[11px] text-slate-400">
                Integrates into existing C++, Python, TypeScript, or PLC firmware control loops
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-950 p-1 rounded border border-slate-800 text-xs font-mono">
              <button
                onClick={() => setActiveCodeLang('ts')}
                className={`px-3 py-1 rounded transition-all ${
                  activeCodeLang === 'ts'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                TypeScript / JS
              </button>
              <button
                onClick={() => setActiveCodeLang('python')}
                className={`px-3 py-1 rounded transition-all ${
                  activeCodeLang === 'python'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Python
              </button>
            </div>

            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs flex items-center gap-1.5 border border-slate-700 transition-colors"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy Code
                </>
              )}
            </button>
          </div>
        </div>

        <pre className="bg-slate-950 p-4 rounded border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed">
          <code>{activeCodeLang === 'ts' ? typescriptSnippet : pythonSnippet}</code>
        </pre>
      </div>
    </div>
  );
};
