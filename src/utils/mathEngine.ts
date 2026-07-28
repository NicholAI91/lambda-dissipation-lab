import { KernelParams, KernelType, PotentialParams, PotentialType, SimulationParams, SimulationPoint, SimulationResults } from '../types';

/**
 * Computes Potential Energy U(t)
 */
export function computePotential(t: number, type: PotentialType, params: PotentialParams): number {
  const { U0, U_inf, k, shockTime, shockSteepness, frequency, damping } = params;

  switch (type) {
    case 'exponential_decay': {
      // U(t) = U_inf + (U0 - U_inf) * exp(-k * t)
      return U_inf + (U0 - U_inf) * Math.exp(-k * t);
    }
    case 'step_release': {
      // U(t) = U0 - (U0 - U_inf) / (1 + exp(-shockSteepness * (t - shockTime)))
      const sigmoid = 1 / (1 + Math.exp(-shockSteepness * (t - shockTime)));
      return U0 - (U0 - U_inf) * sigmoid;
    }
    case 'cyclic_damping': {
      // U(t) = U_inf + (U0 - U_inf) * exp(-damping * t) * cos^2(frequency * t)
      const cosVal = Math.cos(frequency * t);
      return U_inf + (U0 - U_inf) * Math.exp(-damping * t) * (cosVal * cosVal);
    }
    case 'linear_drain': {
      // U(t) = max(U_inf, U0 - k * 10 * t)
      return Math.max(U_inf, U0 - k * 12 * t);
    }
    case 'multi_shock': {
      // Multi-stage impulse drops at t = 1.5, 4.0, 6.5
      const drop1 = 0.4 * (U0 - U_inf) / (1 + Math.exp(-shockSteepness * (t - 1.5)));
      const drop2 = 0.35 * (U0 - U_inf) / (1 + Math.exp(-shockSteepness * (t - 4.0)));
      const drop3 = 0.25 * (U0 - U_inf) / (1 + Math.exp(-shockSteepness * (t - 6.5)));
      return Math.max(U_inf, U0 - drop1 - drop2 - drop3);
    }
    default:
      return U0 * Math.exp(-k * t);
  }
}

/**
 * Computes -dU/dt (Negative derivative of U(t) with respect to t)
 * Uses high-precision central difference with small adaptive delta h
 */
export function computeMinusdUdt(t: number, type: PotentialType, params: PotentialParams): number {
  const h = 0.0005;
  const tPrev = Math.max(0, t - h);
  const tNext = t + h;

  const uPrev = computePotential(tPrev, type, params);
  const uNext = computePotential(tNext, type, params);

  // dU/dt = (uNext - uPrev) / (2 * h)
  // -dU/dt = (uPrev - uNext) / (2 * h)
  const rate = (uPrev - uNext) / (2 * h);
  return Math.max(0, rate); // Energy release rate is non-negative
}

/**
 * Computes Memory Kernel Phi(t)
 */
export function computeKernel(t: number, type: KernelType, params: KernelParams): number {
  const { beta, alpha, sigma, mu, windowWidth, frequency } = params;

  switch (type) {
    case 'exponential': {
      // Phi(t) = exp(-beta * t)
      return Math.exp(-beta * t);
    }
    case 'power_law': {
      // Phi(t) = (1 + beta * t)^(-alpha)
      return Math.pow(1 + Math.max(0, beta * t), -Math.max(0.01, alpha));
    }
    case 'gaussian': {
      // Phi(t) = exp(-((t - mu)^2) / (2 * sigma^2))
      const diff = t - mu;
      return Math.exp(-(diff * diff) / (2 * Math.max(0.1, sigma * sigma)));
    }
    case 'uniform': {
      return 1.0;
    }
    case 'sliding_window': {
      // Active window around mu: [mu - windowWidth/2, mu + windowWidth/2]
      const minT = mu - windowWidth / 2;
      const maxT = mu + windowWidth / 2;
      return (t >= minT && t <= maxT) ? 1.0 : 0.05;
    }
    case 'damped_oscillator': {
      // Phi(t) = exp(-beta * t) * |cos(frequency * t)|
      return Math.exp(-beta * t) * Math.abs(Math.cos(frequency * t));
    }
    default:
      return Math.exp(-beta * t);
  }
}

/**
 * Runs the complete calculus simulation engine over [0, timeSpan]
 */
export function runSimulation(params: SimulationParams): SimulationResults {
  const { Kc, timeSpan, numSteps, kernelType, kernelParams, potentialType, potentialParams, discreteParams } = params;

  const dt = timeSpan / numSteps;
  const points: SimulationPoint[] = [];

  let cumIntegral = 0;
  let maxRate = 0;
  let maxIntegrand = 0;

  // Discrete Recurrence variables
  const pr = discreteParams?.pr ?? 2.5;
  const R = discreteParams?.R ?? 0.05;
  const C = discreteParams?.C ?? 10.0;
  const n = discreteParams?.n ?? 1.2;
  const q = discreteParams?.q ?? 0.8;
  const U0 = potentialParams.U0 || 100;

  let currentDiscreteLambda = 0;

  for (let i = 0; i <= numSteps; i++) {
    const t = i * dt;
    const U = computePotential(t, potentialType, potentialParams);
    const minus_dU_dt = computeMinusdUdt(t, potentialType, potentialParams);
    const Phi = computeKernel(t, kernelType, kernelParams);
    const integrand = Phi * minus_dU_dt;

    if (minus_dU_dt > maxRate) maxRate = minus_dU_dt;
    if (integrand > maxIntegrand) maxIntegrand = integrand;

    // Continuous Trapezoidal Integral step
    if (i > 0) {
      const prevPoint = points[i - 1];
      const stepArea = 0.5 * (prevPoint.integrand + integrand) * dt;
      cumIntegral += stepArea;
    }

    const cumLambda = Kc * cumIntegral;

    // Discrete Recurrence step: Lambda*_k = Lambda*_{k-1} + dt * (Pr_k * k)^(1/k) * exp[ - (k*dt*R/C)^n * (Lambda*_{k-1}/U0)^q ]
    let discreteIncrement = 0;
    let dampeningFactor = 1.0;

    if (i > 0) {
      const k = i; // Step index k >= 1
      const pr_k = pr;
      const term1Base = Math.max(0.0001, pr_k * k);
      const term1 = dt * Math.pow(term1Base, 1 / k);

      const ratioTime = (k * dt * R) / Math.max(0.001, C);
      const term2 = Math.pow(Math.max(0, ratioTime), n);

      const prevLambda = currentDiscreteLambda;
      const ratioState = prevLambda / Math.max(0.001, U0);
      const term3 = Math.pow(Math.max(0, ratioState), q);

      dampeningFactor = Math.exp(-(term2 * term3));
      discreteIncrement = term1 * dampeningFactor;
      currentDiscreteLambda += discreteIncrement;
    }

    points.push({
      t: Number(t.toFixed(3)),
      U: Number(U.toFixed(3)),
      minus_dU_dt: Number(minus_dU_dt.toFixed(3)),
      Phi: Number(Phi.toFixed(4)),
      integrand: Number(integrand.toFixed(3)),
      cumLambda: Number(cumLambda.toFixed(3)),
      cumLambdaDiscrete: Number(currentDiscreteLambda.toFixed(3)),
      discreteIncrement: Number(discreteIncrement.toFixed(4)),
      dampeningFactor: Number(dampeningFactor.toFixed(4)),
    });
  }

  const u0 = points[0].U;
  const uEnd = points[points.length - 1].U;
  const totalPotentialDrop = Math.max(0, u0 - uEnd);
  const totalLambda = points[points.length - 1].cumLambda;
  const totalLambdaDiscrete = points[points.length - 1].cumLambdaDiscrete;

  // Maximum potential dissipation possible without memory loss (Phi = 1)
  const maxPossibleLambda = Kc * totalPotentialDrop;
  const efficiencyRatio = maxPossibleLambda > 0 ? (totalLambda / maxPossibleLambda) : 1.0;

  // Estimate Memory Half-Life (where Phi drops to 0.5)
  let halfMemoryTime = timeSpan;
  for (let i = 0; i < points.length; i++) {
    if (points[i].Phi <= 0.5) {
      halfMemoryTime = points[i].t;
      break;
    }
  }

  return {
    points,
    totalLambda,
    totalLambdaDiscrete,
    totalPotentialDrop,
    peakDissipationRate: maxRate,
    peakIntegrand: maxIntegrand,
    efficiencyRatio,
    halfMemoryTime,
  };
}

/**
 * Calculates parameter sweep analysis (e.g. Lambda vs Kc, Lambda vs Beta, Lambda vs Release Rate k)
 */
export interface SensitivityPoint {
  paramVal: number;
  lambda: number;
  efficiency: number;
}

export function computeSensitivitySweep(
  baseParams: SimulationParams,
  variable: 'Kc' | 'beta' | 'k',
  minVal: number,
  maxVal: number,
  steps: number = 20
): SensitivityPoint[] {
  const result: SensitivityPoint[] = [];
  const stepSize = (maxVal - minVal) / steps;

  for (let i = 0; i <= steps; i++) {
    const val = minVal + i * stepSize;
    const testParams = JSON.parse(JSON.stringify(baseParams)) as SimulationParams;

    if (variable === 'Kc') {
      testParams.Kc = val;
    } else if (variable === 'beta') {
      testParams.kernelParams.beta = val;
    } else if (variable === 'k') {
      testParams.potentialParams.k = val;
    }

    const sim = runSimulation(testParams);
    result.push({
      paramVal: Number(val.toFixed(3)),
      lambda: Number(sim.totalLambda.toFixed(3)),
      efficiency: Number((sim.efficiencyRatio * 100).toFixed(1)),
    });
  }

  return result;
}
