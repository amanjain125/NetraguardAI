import React, { useState } from 'react';
import type { PageRoute } from '../components/common/Navbar';
import { useLanguage } from '../hooks/useLanguage';
import type { ScreeningResult } from '../types/screening';
import { ExplainabilityViewer } from '../components/screening/ExplainabilityViewer';
import { QualityMetricsCard } from '../components/screening/QualityMetricsCard';
import { PatientFriendlyReport } from '../components/patient/PatientFriendlyReport';
import { MedicalDisclaimer } from '../components/common/MedicalDisclaimer';
import { MatlabIntegrationBanner } from '../components/screening/MatlabIntegrationBanner';
import { 
  ArrowLeft, 
  UserCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Download, 
  Stethoscope
} from 'lucide-react';
import { formatDate, formatPercentage, getSeverityBadgeStyle } from '../utils/formatters';

interface Props {
  result: ScreeningResult;
  onNavigate: (page: PageRoute) => void;
}

export const ResultsPage: React.FC<Props> = ({ result, onNavigate }) => {
  const { t } = useLanguage();
  const [activeView, setActiveView] = useState<'clinical' | 'patient'>('clinical');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const severityStyle = getSeverityBadgeStyle(result.class);

  const handlePrintOrExport = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Navigation & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <button
          type="button"
          onClick={() => onNavigate('screening')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Screening Portal</span>
        </button>

        {/* View Toggle: Clinical Review vs Patient-Friendly View */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-xl bg-slate-200/70 p-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveView('clinical')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                activeView === 'clinical'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5 text-sky-600" />
              <span>{t.results.toggleClinicalView}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('patient')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                activeView === 'patient'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t.results.togglePatientView}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handlePrintOrExport}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* RENDER ACTIVE VIEW */}
      {activeView === 'patient' ? (
        /* PATIENT FRIENDLY REPORT VIEW */
        <div className="space-y-6 animate-in fade-in duration-150">
          <PatientFriendlyReport result={result} onPrint={handlePrintOrExport} />
          <MedicalDisclaimer variant="card" />
        </div>
      ) : (
        /* CLINICAL RESULTS VIEW */
        <div className="space-y-8 animate-in fade-in duration-150">
          {/* Header Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-xs font-bold text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-200">
                  {result.patientId}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500">{formatDate(result.timestamp)}</span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500">{result.centerLocation || 'Field Center'}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {t.results.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {t.results.subtitle}
              </p>
            </div>

            {/* Severity Pill Badge */}
            <div className={`p-4 rounded-2xl border ${severityStyle.bg} ${severityStyle.border} flex items-center gap-3 shrink-0`}>
              <div className={`w-3 h-3 rounded-full ${severityStyle.badge} animate-pulse`}></div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider block text-slate-500">
                  Classification
                </span>
                <span className={`text-base font-extrabold ${severityStyle.text}`}>
                  {result.prediction}
                </span>
              </div>
            </div>
          </div>

          {/* MATLAB Architecture Note */}
          <MatlabIntegrationBanner compact />

          {/* Grid: AI Screening Metrics & Referral Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Metric 1: Prediction & Severity */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                ICDR Scale Severity
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-slate-900 font-mono">
                  Grade {result.class}
                </span>
                <span className="text-xs text-slate-500">of 4</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Evaluated against the International Clinical Diabetic Retinopathy scale.
              </p>
            </div>

            {/* Metric 2: Confidence Score */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                ResNet-18 Confidence
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-sky-600 font-mono">
                  {formatPercentage(result.confidence)}
                </span>
                <span className="text-xs text-slate-400 font-normal">Softmax Probability</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-600 rounded-full"
                  style={{ width: `${result.confidence * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Metric 3: Referral Action */}
            <div className={`rounded-2xl p-6 border shadow-xs space-y-2 ${
              result.referable
                ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Referral Action
                </span>
                {result.referable ? (
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
              </div>
              <div className="text-lg font-bold">
                {result.referable ? t.results.referralNeeded : t.results.routineFollowup}
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                {result.recommendation}
              </p>
            </div>
          </div>

          {/* Image Quality Metrics Card */}
          <QualityMetricsCard quality={result.imageQuality} />

          {/* Section 10: Grad-CAM Explainability Viewer */}
          <ExplainabilityViewer
            originalImage={result.originalImageUrl}
            gradCamImage={result.gradCamImageUrl}
            gradCamHeatmap={result.gradCamHeatmapUrl}
            gradCamOverlay={result.gradCamOverlayUrl}
            gradCamAvailable={result.gradCamAvailable}
            gradCamLayer={result.gradCamLayer}
            gradCamSource={result.gradCamSource}
            gradCamError={result.gradCamError}
            prediction={result.prediction}
            confidence={result.confidence}
          />

          {/* Clinical Doctor Review Section */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-sky-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Doctor Clinical Sign-off & Notes
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                Review Status: <strong>{result.clinicalStatus}</strong>
              </span>
            </div>

            <textarea
              defaultValue={result.doctorNotes || ''}
              placeholder="Record clinical impressions, macula evaluation, or telemedicine referral instructions..."
              className="w-full h-24 p-3 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 leading-relaxed"
            />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <span className="text-[11px] text-slate-400">
                Signed actions will sync to the patient health record in the district registry.
              </span>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setSaveStatus('Case marked as reviewed by physician.');
                    setTimeout(() => setSaveStatus(null), 3500);
                  }}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  Mark as Reviewed
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('dashboard')}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200 transition-colors"
                >
                  View All in Dashboard
                </button>
              </div>
            </div>

            {saveStatus && (
              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs border border-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{saveStatus}</span>
              </div>
            )}
          </div>

          {/* Medical Disclaimer */}
          <MedicalDisclaimer variant="card" />
        </div>
      )}
    </div>
  );
};
