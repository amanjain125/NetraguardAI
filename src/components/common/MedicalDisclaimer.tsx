import React from 'react';
import { AlertCircle, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

interface Props {
  variant?: 'banner' | 'card' | 'compact';
}

export const MedicalDisclaimer: React.FC<Props> = ({ variant = 'banner' }) => {
  const { t } = useLanguage();

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2">
        <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
        <span>
          <strong>Clinical Decision Support:</strong> {t.results.disclaimerText}
        </span>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-5 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-amber-900 mb-1">
              {t.results.disclaimerTitle}
            </h4>
            <p className="text-xs text-amber-800/90 leading-relaxed">
              {t.results.disclaimerText}
            </p>
            <p className="text-[11px] text-amber-700/80 mt-2">
              Compliant with CDSCO / ICMR digital health safety guidelines for AI-assisted diagnostic triaging.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-sky-50/70 border-y border-sky-100 px-4 py-2.5 text-center text-xs text-sky-900 flex items-center justify-center gap-2">
      <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
      <span>
        <strong>Medical Notice:</strong> NETRAGUARD AI is a decision-support screening prototype. All outputs require clinical correlation by a medical professional.
      </span>
    </div>
  );
};
