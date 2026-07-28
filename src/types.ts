export type KernelType = 'exponential' | 'power_law' | 'gaussian' | 'uniform' | 'sliding_window' | 'damped_oscillator';

export type PotentialType = 'exponential_decay' | 'step_release' | 'cyclic_damping' | 'linear_drain' | 'multi_shock';

export interface KernelParams {
  beta: number;       // Exponential decay rate / relaxation constant
  alpha: number;      // Power-law exponent
  sigma: number;      // Gaussian width
  mu: number;         // Gaussian peak / center time
  windowWidth: number;// Sliding window width
  frequency: number;  // Oscillator frequency
}

export interface PotentialParams {
  U0: number;         // Initial potential energy
  U_inf: number;      // Residual potential energy
  k: number;          // Primary rate constant
  shockTime: number;  // Step drop midpoint
  shockSteepness: number;
  frequency: number;  // For cyclic drops
  damping: number;
}

export type ModelMode = 'continuous' | 'discrete_recurrence' | 'overlay_both';

export interface DiscreteRecurrenceParams {
  pr: number;      // Production / power rate Pr_k
  R: number;       // System resistance / loss factor
  C: number;       // System capacity scale
  n: number;       // Exponential dampening power factor
  q: number;       // State feedback exponent
}

export interface SimulationParams {
  Kc: number;                   // Scale / coupling constant
  timeSpan: number;             // Total time duration T_max (s)
  numSteps: number;             // Resolution for discrete integration
  modelMode: ModelMode;         // Continuous vs Discrete Recurrence vs Both
  discreteParams: DiscreteRecurrenceParams;
  kernelType: KernelType;
  kernelParams: KernelParams;
  potentialType: PotentialType;
  potentialParams: PotentialParams;
}

export interface SimulationPoint {
  t: number;
  U: number;            // Potential U(t)
  minus_dU_dt: number;  // -dU/dt (rate of potential loss)
  Phi: number;          // Memory kernel value Phi(t)
  integrand: number;    // Phi(t) * (-dU/dt)
  cumLambda: number;    // Continuous accumulated Kc * integral
  cumLambdaDiscrete: number; // Discrete recurrence accumulation Lambda*_k
  discreteIncrement: number; // Step increment Delta Lambda*_k
  dampeningFactor: number;   // exp[ - (k*dt*R/C)^n * (Lambda*_{k-1}/U0)^q ]
}

export interface SimulationResults {
  points: SimulationPoint[];
  totalLambda: number;
  totalLambdaDiscrete: number;
  totalPotentialDrop: number; // U(0) - U(T_max)
  peakDissipationRate: number;// Max (-dU/dt)
  peakIntegrand: number;     // Max Phi(t)*(-dU/dt)
  efficiencyRatio: number;    // Lambda / (Kc * TotalPotentialDrop)
  halfMemoryTime: number;     // Time at which kernel drops to 50%
}

export interface DomainPreset {
  id: string;
  name: string;
  category: string;
  description: string;
  unitLambda: string;
  unitPotential: string;
  defaultParams: Partial<SimulationParams>;
  interpretation: {
    U: string;
    minus_dU_dt: string;
    Phi: string;
    Lambda: string;
    Kc: string;
  };
}
