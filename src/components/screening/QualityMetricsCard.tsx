import React from 'react';
import type { ImageQualityMetrics } from '../../types/screening';
import { CheckCircle2, AlertTriangle, XCircle, Gauge } from 'lucide-react';
import { formatPercentage } from '../../utils/formatters';

interface Props {
  quality: ImageQualityMetrics;
}

export const QualityMetricsCard: React.FC<Props> = ({ quality }) => {
  const getQualityBadge = () => {
    switch (quality.status) {
      case 'Adequate':
        return {
          icon: CheckCircle2,
          text: 'Adequate Quality for AI Assessment',
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500',
        };
      case 'Suboptimal':
        return {
          icon: AlertTriangle,
          text: 'Suboptimal Quality (Assessment Proceeded)',
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
        };
      case 'Ungradable':
        return {
          icon: XCircle,
          text: 'Ungradable Image — Recapture Advised',
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          dot: 'bg-rose-500',
        };
    }
  };

  const badge = getQualityBadge();
  const Icon = badge.icon;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-50 text-sky-700">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Image Quality Assessment
            </h4>
            <p className="text-xs text-slate-500">
              Automated pre-screening validation metrics
            </p>
          </div>
        </div>

        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badge.bg}`}>
          <span className={`w-2 h-2 rounded-full ${badge.dot}`}></span>
          <span>{quality.status}</span>
        </span>
      </div>

      {/* Progress Bars for Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
        {/* Focus */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-600 font-medium">Image Sharpness & Focus</span>
            <span className="font-mono font-bold text-slate-900">{formatPercentage(quality.focusScore)}</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-sky-600 rounded-full transition-all duration-500"
              style={{ width: `${quality.focusScore * 100}%` }}
            ></div>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Retinal vessel edge clarity</span>
        </div>

        {/* Illumination */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-600 font-medium">Illumination Uniformity</span>
            <span className="font-mono font-bold text-slate-900">{formatPercentage(quality.illuminationScore)}</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-600 rounded-full transition-all duration-500"
              style={{ width: `${quality.illuminationScore * 100}%` }}
            ></div>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Balanced fundus exposure</span>
        </div>

        {/* Field Coverage */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-600 font-medium">Disc & Macula Field</span>
            <span className="font-mono font-bold text-slate-900">{formatPercentage(quality.fieldCoverageScore)}</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-500"
              style={{ width: `${quality.fieldCoverageScore * 100}%` }}
            ></div>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Standard posterior pole field</span>
        </div>
      </div>

      {quality.notes && (
        <div className="mt-4 p-3 rounded-xl bg-slate-50 text-slate-600 text-xs border border-slate-100 flex items-center gap-2">
          <Icon className="w-4 h-4 text-slate-400 shrink-0" />
          <span>{quality.notes}</span>
        </div>
      )}
    </div>
  );
};
