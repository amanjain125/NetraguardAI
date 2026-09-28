import React from 'react';
import type { ScreeningResult, SupportedLanguage } from '../../types/screening';
import { useLanguage } from '../../hooks/useLanguage';
import { SUPPORTED_LANGUAGES } from '../../data/translations';
import { 
  HeartHandshake, 
  AlertCircle, 
  CheckCircle2, 
  Printer, 
  PhoneCall,
  Globe
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

interface Props {
  result: ScreeningResult;
  onPrint?: () => void;
}

export const PatientFriendlyReport: React.FC<Props> = ({ result, onPrint }) => {
  const { t, language, setLanguage } = useLanguage();

  const isReferable = result.referable;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden max-w-4xl mx-auto print:border-none print:shadow-none print:max-w-full print:rounded-none">
      {/* Patient Header Banner */}
      <div className="bg-gradient-to-r from-sky-700 via-sky-800 to-slate-900 text-white p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-xs text-xs font-medium text-sky-200 mb-2">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>{t.patientReport.accessibleBadge}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {t.patientReport.heading}
            </h2>
            <p className="text-sm text-sky-100/90 mt-1 max-w-xl">
              {t.patientReport.subheading}
            </p>
          </div>

          {/* Right Action: Language Switcher for Patient Guidance (Hidden in Print) */}
          <div className="no-print flex flex-col items-start sm:items-end gap-2 bg-white/10 p-3 rounded-2xl backdrop-blur-xs shrink-0">
            <div className="flex items-center gap-1.5 text-xs text-sky-200 font-medium">
              <Globe className="w-3.5 h-3.5 text-sky-300" />
              <span>{t.patientReport.selectLanguage}</span>
            </div>
            
            <div className="flex items-center gap-1 bg-black/20 p-1 rounded-xl">
              {SUPPORTED_LANGUAGES.map((langOption) => (
                <button
                  key={langOption.code}
                  type="button"
                  onClick={() => setLanguage(langOption.code as SupportedLanguage)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    language === langOption.code
                      ? 'bg-white text-slate-950 shadow-sm font-extrabold'
                      : 'text-sky-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {langOption.nativeLabel}
                </button>
              ))}
            </div>
          </div>

          {/* Print-only Language & Platform Badge */}
          <div className="hidden print:block text-right text-xs text-sky-200 font-mono">
            <div className="font-bold text-white tracking-wider">NETRAGUARD AI CLINICAL PLATFORM</div>
            <div>PATIENT EYE HEALTH REPORT · {language.toUpperCase()}</div>
          </div>
        </div>

        {/* Patient Identification strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-xs">
          <div>
            <span className="text-sky-300 block text-[11px]">{t.patientReport.patientIdLabel}</span>
            <span className="font-bold text-white font-mono text-sm">{result.patientId}</span>
          </div>
          <div>
            <span className="text-sky-300 block text-[11px]">{t.patientReport.screeningDateLabel}</span>
            <span className="font-semibold text-white">{formatDate(result.timestamp, language)}</span>
          </div>
          <div>
            <span className="text-sky-300 block text-[11px]">{t.patientReport.healthCenterLabel}</span>
            <span className="font-semibold text-white">{result.centerLocation || t.patientReport.primaryHealthCenter}</span>
          </div>
          <div>
            <span className="text-sky-300 block text-[11px]">{t.patientReport.demographicsLabel}</span>
            <span className="font-semibold text-white">{result.patientAge ? `${result.patientAge} ${t.patientReport.yearsOld} / ${result.patientGender}` : t.patientReport.recorded}</span>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-8">
        {/* Visual Outcome Banner */}
        <div className={`rounded-2xl p-6 border ${
          isReferable
            ? 'bg-amber-50/70 border-amber-200'
            : 'bg-emerald-50/70 border-emerald-200'
        }`}>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl shrink-0 ${
              isReferable ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {isReferable ? <AlertCircle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {t.patientReport.whatFound}
              </span>
              <h3 className={`text-xl font-extrabold mt-0.5 ${
                isReferable ? 'text-amber-950' : 'text-emerald-950'
              }`}>
                {isReferable
                  ? t.patientReport.referralTitle
                  : t.patientReport.healthyTitle}
              </h3>
              <p className="text-sm text-slate-700 mt-2 leading-relaxed">
                {isReferable
                  ? t.patientReport.referralNote
                  : t.patientReport.healthyNote}
              </p>
            </div>
          </div>
        </div>

        {/* 3 Step Guidance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: What this means */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3">
            <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
              1
            </div>
            <h4 className="text-sm font-bold text-slate-900">
              {t.patientReport.whatMeans}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {isReferable
                ? t.patientReport.whatMeansReferable
                : t.patientReport.whatMeansHealthy}
            </p>
          </div>

          {/* Card 2: Recommended Next Step */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold text-xs">
              2
            </div>
            <h4 className="text-sm font-bold text-slate-900">
              {t.patientReport.nextSteps}
            </h4>
            <div className="text-xs text-slate-600 leading-relaxed space-y-1.5">
              {isReferable ? (
                <>
                  <p className="font-semibold text-slate-900">
                    {t.patientReport.nextStepsReferableTitle}
                  </p>
                  <p>{t.patientReport.nextStepsReferableDesc}</p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-slate-900">
                    {t.patientReport.nextStepsHealthyTitle}
                  </p>
                  <p>{t.patientReport.nextStepsHealthyDesc}</p>
                </>
              )}
            </div>
          </div>

          {/* Card 3: Important information */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
              3
            </div>
            <h4 className="text-sm font-bold text-slate-900">
              {t.patientReport.importantInfo}
            </h4>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
              <li>{t.patientReport.tip1}</li>
              <li>{t.patientReport.tip2}</li>
              <li>{t.patientReport.tip3}</li>
            </ul>
          </div>
        </div>

        {/* Action Footnote with Print Button */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-sky-600" />
            <span>{t.patientReport.footerQuestions}</span>
          </div>

          <button
            type="button"
            onClick={() => (onPrint ? onPrint() : window.print())}
            className="no-print inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>{t.patientReport.printCard}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
