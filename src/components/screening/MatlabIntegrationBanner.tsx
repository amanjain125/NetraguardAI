import React, { useState } from 'react';
import { Terminal, Cpu, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';

interface Props {
  compact?: boolean;
}

export const MatlabIntegrationBanner: React.FC<Props> = ({ compact = false }) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  if (compact) {
    return (
      <div className="bg-slate-900 text-slate-300 rounded-xl p-3 border border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-sky-400" />
          <span>
            <strong className="text-white">AI Engine Target:</strong> MATLAB ResNet-18 & Grad-CAM Pipeline
          </span>
        </div>
        <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-amber-300 border border-amber-500/30">
          Awaiting Backend REST Bridge
        </span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-white tracking-wide">
                MATLAB AI Pipeline Integration Architecture
              </h4>
              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-sky-950 text-sky-300 border border-sky-700/50">
                SIH 2026 Ready
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              The frontend is designed with decoupled integration boundaries. The trained deep learning pipeline
              (ResNet-18 classification and Grad-CAM explainability heatmap generator) operates independently in MATLAB
              and binds via standard REST API endpoints.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="self-start md:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-850 text-slate-300 hover:text-white hover:bg-slate-700 text-xs font-mono border border-slate-700 transition-colors"
        >
          <Terminal className="w-3.5 h-3.5 text-sky-400" />
          <span>{showTechnicalDetails ? 'Hide API Contract' : 'Inspect API Contract'}</span>
          {showTechnicalDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {showTechnicalDetails && (
        <div className="mt-4 pt-4 border-t border-slate-800 space-y-3 text-xs animate-in fade-in-50 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Architectural Pipeline Flow */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-2 font-mono">
                System Workflow Pipeline
              </span>
              <div className="space-y-1.5 text-slate-300 font-mono text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-[9px] font-bold">1</span>
                  <span>React UI Upload (`src/services/screeningApi.ts`)</span>
                </div>
                <div className="pl-6 text-slate-500 text-[10px]">↓ HTTP POST multipart/form-data</div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[9px] font-bold">2</span>
                  <span>Backend REST Service (`/api/screen`)</span>
                </div>
                <div className="pl-6 text-slate-500 text-[10px]">↓ MATLAB Engine API / Production Server</div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[9px] font-bold">3</span>
                  <span>MATLAB ResNet-18 & Grad-CAM Pipeline</span>
                </div>
                <div className="pl-6 text-slate-500 text-[10px]">↓ JSON result with heatmap coordinates & URLs</div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-[9px] font-bold">4</span>
                  <span>Explainability Viewer & Doctor Workspace</span>
                </div>
              </div>
            </div>

            {/* Target JSON Contract */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 font-mono text-[11px] text-slate-300">
              <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                Contract: POST /api/screen
              </span>
              <pre className="text-emerald-400 overflow-x-auto text-[10px] leading-tight">
{`{
  "prediction": "Moderate Non-Proliferative DR",
  "class": 2,
  "confidence": 0.924,
  "imageQuality": {
    "status": "Adequate",
    "focus": 0.94,
    "illumination": 0.89
  },
  "referable": true,
  "processedImageUrl": "...",
  "gradCamImageUrl": "...",
  "timestamp": "2026-09-26T..."
}`}
              </pre>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-amber-300 bg-amber-950/40 border border-amber-800/40 rounded-lg p-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              <strong>Clean Boundary Guarantee:</strong> No fake medical logic or client-side neural calculations are injected. The UI shell faithfully mirrors clinical expectations while awaiting the live MATLAB server.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
