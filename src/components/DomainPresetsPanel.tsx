import React from 'react';
import { DomainPreset, SimulationParams } from '../types';
import { DOMAIN_PRESETS } from '../utils/domainPresets';
import { Compass, CheckCircle2, ArrowRight } from 'lucide-react';

interface DomainPresetsPanelProps {
  currentPreset: DomainPreset;
  onSelectPreset: (preset: DomainPreset) => void;
}

export const DomainPresetsPanel: React.FC<DomainPresetsPanelProps> = ({
  currentPreset,
  onSelectPreset,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-xl flex flex-col gap-4">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <Compass className="w-5 h-5 text-indigo-400" />
        <div>
          <h2 className="text-base font-semibold text-white">Application Domain Scenarios</h2>
          <p className="text-xs text-slate-400">
            Select a physical, engineering, or economic domain model pre-configured with physical units and interpretations
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {DOMAIN_PRESETS.map((preset) => {
          const isSelected = preset.id === currentPreset.id;
          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all duration-200 relative overflow-hidden ${
                isSelected
                  ? 'bg-indigo-600/15 border-indigo-500/80 text-white shadow-xl shadow-indigo-500/10'
                  : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 text-indigo-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}

              <div>
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-indigo-400 block mb-1">
                  {preset.category}
                </span>
                <h3 className="text-xs font-bold text-white mb-1 leading-snug">
                  {preset.name}
                </h3>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
                  {preset.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/60 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                <span>Output Unit:</span>
                <span className="text-indigo-300 font-semibold">{preset.unitLambda.split(' ')[0]}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
