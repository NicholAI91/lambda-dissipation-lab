# Lambda Dissipation Simulator (Memory-Weighted Dissipation Framework)

An interactive visualizer, analytical sandbox, and continuous calculus simulator for **Memory-Weighted Dissipation Potential Models**.

This framework models dynamic dissipation potential $\Lambda(T)$ across diverse physical, biological, engineering, and economic domains governed by memory-dependent convolution integrals:

$$\Lambda(T) = K_c \int_{0}^{T} \Phi(t - \tau) \left(-\frac{d U(\tau)}{d \tau}\right) d\tau$$

---

## 🌟 Overview & Key Concepts

The simulator explores how energy, capacity, or potential $U(t)$ drops over time and couples with hereditary/memory decay kernels $\Phi(t)$ to generate non-local cumulative dissipation effects ($\Lambda$).

### Core Mathematical Components
- **Potential $U(t)$**: The stored capacity, potential, energy, or system headroom as a function of time.
- **Dissipation Rate $-\frac{dU}{dt}$**: The continuous rate of potential depletion or shock release.
- **Memory Kernel $\Phi(t)$**: The hereditary response or lag window function (Exponential, Power-Law, Gaussian, Damped Oscillator, Sliding Window).
- **Coupling Scaling $K_c$**: Domain-specific coupling index balancing physical units.
- **Dissipation Metric $\Lambda(T)$**: Integrated memory-weighted loss or accumulated impact over continuous time $T$.

---

## 🌍 Multidisciplinary Domain Presets

The simulator demonstrates universal mathematical symmetry across 9 distinct fields:

1. **Quantum Computing**: Superconducting Qubit Phase Coherence & Non-Markovian Noise Dissipation.
2. **Computer Engineering**: AI Data Center GPU Thermal Throttling & Power Shock.
3. **Cybersecurity & Operations**: SOC Incident Alert Flooding & Analyst Cognitive Fatigue.
4. **Power Grid Engineering**: High-Voltage Power Grid Line Tripping & Blackout Cascade.
5. **Macroeconomics**: Central Bank Liquidity Drain & Adaptive Inflation Memory.
6. **Epidemiology & Immunology**: Viral Pathogen Load & Immunological Memory Response.
7. **Electrodynamics**: Inductive Flyback Shock & Magnetic Core Saturation.
8. **Mechanical Engineering**: Viscous Damped Harmonic Oscillator & Hydraulic Shock.
9. **Thermodynamics**: Transient Thermal Shock & Fourier Heat Dissipation.

---

## ✨ Features

- 📈 **Real-Time Numerical Convolution**: High-precision discrete integration of derivative-kernel convolutions with customizable sample rates.
- 🎛️ **Interactive Potential & Kernel Engine**: Switch between Exponential, Step Shock, Oscillatory, Multi-Burst, Power-Law, and Gaussian profiles.
- 🧮 **LaTeX Equation Rendering**: Dynamic KaTeX equations reflecting chosen variable definitions and physics parameters.
- 📊 **Dynamic Visualizations**: Multi-axis Recharts time-series plots comparing potential $U(t)$, rate $-dU/dt$, kernel decay $\Phi(t)$, and accumulated $\Lambda(T)$.
- 🔍 **Parameter Sweeps & Sensitivity Analysis**: Visual phase diagrams mapping response across coupling coefficients $K_c$ and decay constants $\beta$.
- 📄 **Export & Analytics**: Export high-resolution simulation reports to PDF or JSON for research documentation.

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm or bun

### Installation & Running Locally

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/lambda-dissipation-simulator.git

# Navigate into project directory
cd lambda-dissipation-simulator

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to launch the simulator.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4
- **Visualization**: Recharts
- **Math Engine**: KaTeX + Custom Numerical Calculus Engine
- **Icons & Motion**: Lucide React + Motion
- **Report Generation**: jsPDF

---

## 📜 License

This project is licensed under the **Apache License 2.0**. See the [LICENSE](./LICENSE) file for complete terms and permissions.
