import React, { useState } from 'react';
import { SimulationParams, SimulationResults, DomainPreset } from '../types';
import { Download, Copy, Check, FileText, Code, Table, X, FileCheck } from 'lucide-react';
import jsPDF from 'jspdf';

interface ReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  params: SimulationParams;
  results: SimulationResults;
  currentPreset: DomainPreset;
}

export const ReportExportModal: React.FC<ReportExportModalProps> = ({
  isOpen,
  onClose,
  params,
  results,
  currentPreset,
}) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen) return null;

  // Generate CSV Data String
  const generateCSV = () => {
    let csv = `Time_t,Potential_U,Minus_dU_dt,Kernel_Phi,Integrand,Cum_Lambda\n`;
    results.points.forEach((p) => {
      csv += `${p.t},${p.U},${p.minus_dU_dt},${p.Phi},${p.integrand},${p.cumLambda}\n`;
    });
    return csv;
  };

  // Generate Technical Report Summary
  const generateReportText = () => {
    return `===============================================================
LAMBDA DISSIPATION MODEL TECHNICAL EVALUATION REPORT
Equation: Lambda = Kc * Integral_0^T [ Phi(t) * (-dU/dt) ] dt
Domain: ${currentPreset.category} - ${currentPreset.name}
Generated: ${new Date().toISOString()}
===============================================================

PARAMETERS:
---------------------------------------------------------------
Coupling Constant Kc: ${params.Kc}
Time Span T_max:      ${params.timeSpan} s
Kernel Type:          ${params.kernelType}
Kernel Parameters:    ${JSON.stringify(params.kernelParams)}
Potential Type:       ${params.potentialType}
Potential Parameters: ${JSON.stringify(params.potentialParams)}

KEY SIMULATION METRICS:
---------------------------------------------------------------
Total Accumulated Lambda (Λ): ${results.totalLambda.toFixed(4)} ${currentPreset.unitLambda}
Total Potential Drop (ΔU):    ${results.totalPotentialDrop.toFixed(4)} ${currentPreset.unitPotential}
Peak Dissipation Rate (-dU/dt): ${results.peakDissipationRate.toFixed(4)} /s
Peak Integrand Value:         ${results.peakIntegrand.toFixed(4)}
Memory Efficiency Ratio (η):  ${(results.efficiencyRatio * 100).toFixed(2)}%
Memory Half-Life (t_1/2):     ${results.halfMemoryTime.toFixed(2)} s

INTERPRETATION:
---------------------------------------------------------------
- Reservoir Potential U(t): ${currentPreset.interpretation.U}
- Energy Release Rate -dU/dt: ${currentPreset.interpretation.minus_dU_dt}
- Memory Kernel Phi(t): ${currentPreset.interpretation.Phi}
- Output Measure Lambda: ${currentPreset.interpretation.Lambda}
===============================================================`;
  };

  const handleCopyText = (content: string, type: string) => {
    navigator.clipboard.writeText(content);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleDownloadCSV = () => {
    const blob = new Blob([generateCSV()], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `lambda_dissipation_${currentPreset.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF Generation with jsPDF
  const handleDownloadPDF = () => {
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();

    // 1. Header Banner
    doc.setFillColor(15, 23, 42); // Slate 900
    doc.rect(0, 0, pageWidth, 35, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('LAMBDA DISSIPATION MODEL EVALUATION REPORT', 14, 15);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(165, 180, 252);
    doc.text(`Domain: ${currentPreset.category} — ${currentPreset.name}`, 14, 22);
    doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 28);

    // 2. Master Formula Banner
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(14, 40, pageWidth - 28, 20, 2, 2, 'FD');

    doc.setFont('courier', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('MASTER FORMULA: Lambda(t) = Kc * Integral_0^T [ Phi(t) * (-dU/dt) ] dt', 18, 49);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Continuous memory-weighted dissipation calculus for non-instantaneous physical dynamics', 18, 55);

    // 3. Key Metrics Cards
    let y = 68;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text('1. KEY SIMULATION PERFORMANCE METRICS', 14, y);

    y += 5;
    const colWidth = (pageWidth - 28 - 6) / 3;
    const metrics = [
      { label: 'Total Accumulated Lambda', value: `${results.totalLambda.toFixed(3)} ${currentPreset.unitLambda.split(' ')[0]}` },
      { label: 'Total Potential Drop', value: `${results.totalPotentialDrop.toFixed(3)} ${currentPreset.unitPotential.split(' ')[0]}` },
      { label: 'Peak Dissipation Rate', value: `${results.peakDissipationRate.toFixed(3)} /s` },
      { label: 'Memory Half-Life (t1/2)', value: `${results.halfMemoryTime.toFixed(2)} s` },
      { label: 'Memory Efficiency Ratio', value: `${(results.efficiencyRatio * 100).toFixed(1)}%` },
      { label: 'Peak Integrand Value', value: `${results.peakIntegrand.toFixed(3)}` },
    ];

    metrics.forEach((m, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const boxX = 14 + col * (colWidth + 3);
      const boxY = y + row * 18;

      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(boxX, boxY, colWidth, 15, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(m.label.toUpperCase(), boxX + 4, boxY + 5);

      doc.setFont('courier', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(79, 70, 229);
      doc.text(m.value, boxX + 4, boxY + 11);
    });

    y += 42;

    // 4. Vector Chart Snapshots Frame
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text('2. TIME-SERIES CURVES SNAPSHOT [U(t), Phi(t), Lambda(t)]', 14, y);

    y += 5;
    const chartHeight = 48;
    const chartWidth = pageWidth - 28;

    doc.setFillColor(15, 23, 42);
    doc.roundedRect(14, y, chartWidth, chartHeight, 2, 2, 'F');

    // Draw grid lines inside chart box
    doc.setDrawColor(51, 65, 85);
    doc.setLineWidth(0.2);
    for (let gridX = 25; gridX < chartWidth - 10; gridX += 30) {
      doc.line(14 + gridX, y + 5, 14 + gridX, y + chartHeight - 8);
    }
    for (let gridY = 10; gridY < chartHeight - 10; gridY += 12) {
      doc.line(18, y + gridY, 14 + chartWidth - 10, y + gridY);
    }

    const pts = results.points;
    const n = pts.length;
    if (n > 1) {
      const maxU = Math.max(1, Math.max(...pts.map((p) => p.U)));
      const maxL = Math.max(1, results.totalLambda);

      // Plot U(t) - Sky Blue
      doc.setDrawColor(56, 189, 248);
      doc.setLineWidth(0.8);
      for (let i = 0; i < n - 1; i++) {
        const x1 = 20 + (i / (n - 1)) * (chartWidth - 30);
        const y1 = y + chartHeight - 10 - (pts[i].U / maxU) * (chartHeight - 18);
        const x2 = 20 + ((i + 1) / (n - 1)) * (chartWidth - 30);
        const y2 = y + chartHeight - 10 - (pts[i + 1].U / maxU) * (chartHeight - 18);
        doc.line(14 + x1, y1, 14 + x2, y2);
      }

      // Plot Phi(t) - Amber
      doc.setDrawColor(245, 158, 11);
      doc.setLineWidth(0.6);
      for (let i = 0; i < n - 1; i++) {
        const x1 = 20 + (i / (n - 1)) * (chartWidth - 30);
        const y1 = y + chartHeight - 10 - pts[i].Phi * (chartHeight - 18);
        const x2 = 20 + ((i + 1) / (n - 1)) * (chartWidth - 30);
        const y2 = y + chartHeight - 10 - pts[i + 1].Phi * (chartHeight - 18);
        doc.line(14 + x1, y1, 14 + x2, y2);
      }

      // Plot Lambda(t) - Emerald
      doc.setDrawColor(16, 185, 129);
      doc.setLineWidth(0.9);
      for (let i = 0; i < n - 1; i++) {
        const x1 = 20 + (i / (n - 1)) * (chartWidth - 30);
        const y1 = y + chartHeight - 10 - (pts[i].cumLambda / maxL) * (chartHeight - 18);
        const x2 = 20 + ((i + 1) / (n - 1)) * (chartWidth - 30);
        const y2 = y + chartHeight - 10 - (pts[i + 1].cumLambda / maxL) * (chartHeight - 18);
        doc.line(14 + x1, y1, 14 + x2, y2);
      }
    }

    // Legend
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(56, 189, 248);
    doc.text('— U(t) Potential', 22, y + chartHeight - 3);
    doc.setTextColor(245, 158, 11);
    doc.text('— Phi(t) Memory', 65, y + chartHeight - 3);
    doc.setTextColor(16, 185, 129);
    doc.text('— Lambda(t) Dissipation', 110, y + chartHeight - 3);

    y += chartHeight + 10;

    // 5. Time-Series Sampling Data Table
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text('3. MILESTONE TIME-SERIES DATA POINTS', 14, y);

    y += 5;
    const tableWidth = pageWidth - 28;
    const headers = ['Step %', 't (s)', 'U(t)', '-dU/dt', 'Phi(t)', 'Integrand', 'Lambda(t)'];
    const colW = tableWidth / headers.length;

    doc.setFillColor(226, 232, 240);
    doc.rect(14, y, tableWidth, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    headers.forEach((h, i) => {
      doc.text(h, 16 + i * colW, y + 4.5);
    });

    y += 6;
    doc.setFont('courier', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);

    const samplePct = [0, 0.2, 0.4, 0.6, 0.8, 1.0];
    samplePct.forEach((pct, rIdx) => {
      const idxVal = Math.min(results.points.length - 1, Math.floor(pct * (results.points.length - 1)));
      const pt = results.points[idxVal];
      if (!pt) return;

      const rowY = y + rIdx * 5.5;

      if (rIdx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, rowY, tableWidth, 5.5, 'F');
      }

      doc.text(`${Math.round(pct * 100)}%`, 16 + 0 * colW, rowY + 4);
      doc.text(`${pt.t}s`, 16 + 1 * colW, rowY + 4);
      doc.text(`${pt.U}`, 16 + 2 * colW, rowY + 4);
      doc.text(`${pt.minus_dU_dt}`, 16 + 3 * colW, rowY + 4);
      doc.text(`${pt.Phi}`, 16 + 4 * colW, rowY + 4);
      doc.text(`${pt.integrand}`, 16 + 5 * colW, rowY + 4);
      doc.text(`${pt.cumLambda}`, 16 + 6 * colW, rowY + 4);
    });

    y += 38;

    // Footer
    doc.setDrawColor(203, 213, 225);
    doc.line(14, y, pageWidth - 14, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('Lambda Continuous Memory Calculus Engine — Certified Evaluation Summary', 14, y + 4);

    doc.save(`Lambda_Simulation_Report_${currentPreset.id}.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Export & Report Center</h2>
            <p className="text-xs text-slate-400">
              Download PDF summary reports, CSV time-series datasets, or copy technical log
            </p>
          </div>
        </div>

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={handleDownloadPDF}
            className="p-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
          >
            <FileCheck className="w-4 h-4" />
            Download PDF Report
          </button>

          <button
            onClick={handleDownloadCSV}
            className="p-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
          >
            <Download className="w-4 h-4" />
            Download CSV Data
          </button>

          <button
            onClick={() => handleCopyText(generateReportText(), 'report')}
            className="p-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
          >
            {copiedType === 'report' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copiedType === 'report' ? 'Report Copied!' : 'Copy Text Report'}
          </button>
        </div>

        {/* Report Preview Text Area */}
        <div className="space-y-2">
          <label className="text-xs font-mono font-semibold text-slate-400 flex items-center gap-1.5">
            <Code className="w-3.5 h-3.5" /> Technical Summary Log
          </label>
          <textarea
            readOnly
            value={generateReportText()}
            className="w-full h-44 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-emerald-400/90 leading-relaxed resize-none focus:outline-none"
          />
        </div>

        {/* First 5 rows preview table */}
        <div className="space-y-2">
          <label className="text-xs font-mono font-semibold text-slate-400 flex items-center gap-1.5">
            <Table className="w-3.5 h-3.5" /> First 5 Time-Step Integrations
          </label>
          <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="p-2">t (s)</th>
                  <th className="p-2">U(t)</th>
                  <th className="p-2">-dU/dt</th>
                  <th className="p-2">Φ(t)</th>
                  <th className="p-2">Integrand</th>
                  <th className="p-2">Λ(t)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {results.points.slice(0, 5).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40">
                    <td className="p-2 text-indigo-400">{row.t}</td>
                    <td className="p-2">{row.U}</td>
                    <td className="p-2 text-rose-400">{row.minus_dU_dt}</td>
                    <td className="p-2 text-amber-400">{row.Phi}</td>
                    <td className="p-2 text-purple-400">{row.integrand}</td>
                    <td className="p-2 text-emerald-400 font-bold">{row.cumLambda}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

