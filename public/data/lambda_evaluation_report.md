# LAMBDA DISSIPATION MODEL EVALUATION REPORT

**Domain:** Rheology & Polymers — Viscoelastic Stress Relaxation  
**Generated:** 7/28/2026 4:08:09 PM  
**Author:** Nicholas Reid Angell

---

**MASTER FORMULA:** `Lambda(t) = Kc * Integral_0^T [ Phi(t) * (-dU/dt) ] dt`  
*Continuous memory-weighted dissipation calculus for non-instantaneous physical dynamics*

## 1. KEY SIMULATION PERFORMANCE METRICS

*   **TOTAL ACCUMULATED LAMBDA:** 73.897 MPa·s
*   **TOTAL POTENTIAL DROP:** 89.970 MJ/m³
*   **PEAK DISSIPATION RATE:** 69.177 /s
*   **MEMORY HALF-LIFE (T1/2):** 1.75 s
*   **MEMORY EFFICIENCY RATIO:** 65.7%
*   **PEAK INTEGRAND VALUE:** 67.807

## 2. TIME-SERIES CURVES SNAPSHOT [U(t), Phi(t), Lambda(t)]
*(See interactive visualizer for full chart)*
*   **U(t) Potential** (Decreasing curve)
*   **Phi(t) Memory** (Exponentially decaying curve)
*   **Lambda(t) Dissipation** (Logarithmically growing curve)

## 3. MILESTONE TIME-SERIES DATA POINTS

| Step % | t (s) | U(t) | -dU/dt | Phi(t) | Integrand | Lambda(t) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0% | 0s | 100 | 35.993 | 1 | 35.993 | 0 |
| 20% | 2s | 28.171 | 14.537 | 0.4493 | 6.532 | 67.091 |
| 40% | 4s | 13.669 | 2.935 | 0.2019 | 0.593 | 73.28 |
| 60% | 6s | 10.741 | 0.593 | 0.0907 | 0.054 | 73.841 |
| 80% | 8s | 10.15 | 0.12 | 0.0408 | 0.005 | 73.892 |
| 100% | 10s | 10.03 | 0.024 | 0.0183 | 0 | 73.897 |

---
*Lambda Continuous Memory Calculus Engine — Certified Evaluation Summary*
