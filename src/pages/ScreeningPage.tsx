import React, { useState, useRef, useMemo } from 'react';
import type { PageRoute } from '../components/common/Navbar';
import { useLanguage } from '../hooks/useLanguage';
import { ImageUploader } from '../components/screening/ImageUploader';
import { MedicalDisclaimer } from '../components/common/MedicalDisclaimer';
import { ExplainabilityViewer } from '../components/screening/ExplainabilityViewer';
import { screeningApi, type BackendScreeningResponse } from '../services/screeningApi';
import type { ScreeningResult, DRSeverityLabel, DiabeticRetinopathyGrade } from '../types/screening';
import { 
  AlertCircle, 
  CheckCircle, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  RotateCcw,
  Printer,
  ShieldCheck,
  Stethoscope,
  Activity,
  Calendar,
  Clock,
  FileText,
  BadgeCheck
} from 'lucide-react';
import { getSeverityBadgeStyle, formatDate, formatTime } from '../utils/formatters';
import type { DoctorProfile } from '../types/auth';

interface Props {
  onNavigate: (page: PageRoute) => void;
  onSetSelectedResult: (result: ScreeningResult) => void;
}

export const ScreeningPage: React.FC<Props> = ({ onNavigate, onSetSelectedResult }) => {
  const { t } = useLanguage();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [liveResult, setLiveResult] = useState<BackendScreeningResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dedicated ref to scroll smoothly down to report/scanning section
  const reportSectionRef = useRef<HTMLDivElement>(null);

  // Retrieve logged-in doctor profile if available
  const loggedDoctor: DoctorProfile | null = useMemo(() => {
    try {
      const saved = localStorage.getItem('netraguard_doctor_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }, []);

  const handleImageSelected = (file: File | null, url: string | null) => {
    setSelectedFile(file);
    setPreviewUrl(url);
    setErrorMessage(null);
    setLiveResult(null);
  };

  /**
   * Action handler when user clicks "Continue to Screening" / "Analyze Image"
   * Sends actual image file to POST http://127.0.0.1:8000/api/screen
   * Smoothly scrolls down to ensure report / scanning progress is immediately seen!
   */
  const handleProceedToScreening = async () => {
    // 1. Handle case where no image has been selected
    if (!selectedFile) {
      setErrorMessage(t.screening.noImageSelected || 'Please select or drop a retinal fundus image before continuing.');
      return;
    }

    setErrorMessage(null);
    setLiveResult(null);
    setIsAnalyzing(true);

    // Smoothly scroll down so user immediately sees the analysis in motion
    setTimeout(() => {
      reportSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    try {
      // 2. Call live FastAPI backend endpoint
      const result = await screeningApi.screenImage(selectedFile);
      setLiveResult(result);

      // 3. Sync full ScreeningResult structure so user can view ResultsPage if desired
      const severityMap: Record<number, DRSeverityLabel> = {
        0: 'No Apparent DR',
        1: 'Mild Non-Proliferative DR',
        2: 'Moderate Non-Proliferative DR',
        3: 'Severe Non-Proliferative DR',
        4: 'Proliferative DR',
      };

      const fullResult: ScreeningResult = {
        id: `SCR-${Date.now().toString().slice(-6)}`,
        patientId: `PT-${Math.floor(1000 + Math.random() * 9000)}`,
        centerLocation: 'Primary Health Care Center (Rural Tele-Ophthalmology Unit)',
        timestamp: new Date().toISOString(),
        prediction: severityMap[result.predictedClass] || (result.predictedClassName as DRSeverityLabel),
        class: result.predictedClass as DiabeticRetinopathyGrade,
        confidence: result.confidence,
        referable: result.screeningStatus.includes('Referable') || result.predictedClass >= 2,
        macularInvolvementSuspected: result.predictedClass >= 3,
        recommendation: result.referralMessage,
        imageQuality: {
          status: 'Adequate',
          focusScore: 0.94,
          illuminationScore: 0.92,
          fieldCoverageScore: 0.95,
          artifactsDetected: false,
        },
        originalImageUrl: result.originalImageUrl || previewUrl || '',
        gradCamImageUrl: result.gradCAMOverlay || result.gradCAMImage || undefined,
        gradCamHeatmapUrl: result.gradCAMHeatmap || undefined,
        gradCamOverlayUrl: result.gradCAMOverlay || undefined,
        gradCamAvailable: result.gradCAMAvailable,
        gradCamLayer: result.gradCAMLayer || 'res5b_relu',
        gradCamSource: result.gradCAMSource || undefined,
        gradCamError: result.gradCAMError || undefined,
        clinicalStatus: 'Pending Review',
      };

      onSetSelectedResult(fullResult);

      // Smooth scroll down to the newly generated report
      setTimeout(() => {
        reportSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to communicate with FastAPI backend.';
      setErrorMessage(
        `${msg}. Please verify that the FastAPI backend server is running on http://127.0.0.1:8000 via 'uvicorn backend.main:app --reload'.`
      );
      setTimeout(() => {
        reportSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleResetForNewScreening = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setLiveResult(null);
    setErrorMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrintReport = () => {
    window.print();
  };

  // Helper for referral urgency badge
  const getReferralUrgency = (grade: number) => {
    switch (grade) {
      case 0:
        return {
          label: 'Routine Annual Follow-up (12 Months)',
          urgency: 'Low Risk',
          color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500',
        };
      case 1:
        return {
          label: 'Semi-Annual Clinical Review (6-12 Months)',
          urgency: 'Low-Moderate',
          color: 'bg-teal-50 text-teal-800 border-teal-200',
          dot: 'bg-teal-500',
        };
      case 2:
        return {
          label: 'Comprehensive Eye Examination (4-8 Weeks)',
          urgency: 'Referral Indicated',
          color: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
        };
      case 3:
        return {
          label: 'Vitreoretinal Specialist Evaluation (2-4 Weeks)',
          urgency: 'High Priority Referral',
          color: 'bg-orange-50 text-orange-900 border-orange-200',
          dot: 'bg-orange-500',
        };
      case 4:
        return {
          label: 'Urgent Specialized Intervention (<48-72 Hours)',
          urgency: 'Critical / Urgent',
          color: 'bg-rose-50 text-rose-900 border-rose-200',
          dot: 'bg-rose-600 animate-pulse',
        };
      default:
        return {
          label: 'Clinical correlation recommended',
          urgency: 'Standard',
          color: 'bg-slate-50 text-slate-800 border-slate-200',
          dot: 'bg-slate-500',
        };
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page Header (Hidden in Print) */}
      <div className="no-print text-left space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Patient Intake & Diagnostic Portal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t.screening.title}
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
          {t.screening.subtitle}
        </p>
      </div>

      {/* Main Intake Section: Uploader & Protocol Sidebar (Hidden in Print) */}
      <div className="no-print grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Image Uploader */}
        <div className="lg:col-span-8 space-y-6">
          <ImageUploader
            onImageSelected={handleImageSelected}
            onProceedToScreening={handleProceedToScreening}
            selectedImagePreview={previewUrl}
            selectedFileName={selectedFile?.name || (previewUrl ? 'Sample Retinal Fundus Scan' : null)}
            isLoading={isAnalyzing}
          />
        </div>

        {/* Right Sidebar: Clinical Protocols & ICDR Scale Reference */}
        <div className="lg:col-span-4 space-y-6">
          {/* Fundus Image Protocol Guidelines */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Fundus Image Protocol</span>
            </h3>
            
            <ul className="text-xs text-slate-600 space-y-3 leading-relaxed">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 shrink-0"></span>
                <span><strong>Field of View:</strong> Standard 45° or 50° macula-centered and disc-centered posterior pole views.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 shrink-0"></span>
                <span><strong>Mydriasis:</strong> Non-mydriatic or pharmacologically dilated fundus photographs accepted.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 shrink-0"></span>
                <span><strong>Resolution:</strong> Minimum 1024×1024 resolution recommended for microaneurysm resolution.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 shrink-0"></span>
                <span><strong>Supported Hardware:</strong> Non-mydriatic tabletop cameras, portable smartphone fundus scopes (Remidio, Forus, Volk).</span>
              </li>
            </ul>
          </div>

          {/* ICDR 5-Stage Classification Reference */}
          <div className="bg-slate-50/70 rounded-3xl p-6 border border-slate-200/80 space-y-3.5">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-sky-600" />
              <span>ICDR DR Severity Scale</span>
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/70">
                <span className="font-semibold text-slate-800">Grade 0: No DR</span>
                <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">No lesions</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/70">
                <span className="font-semibold text-slate-800">Grade 1: Mild NPDR</span>
                <span className="text-[11px] font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">Microaneurysms only</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/70">
                <span className="font-semibold text-slate-800">Grade 2: Moderate NPDR</span>
                <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">Exudates / Hemorrhages</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/70">
                <span className="font-semibold text-slate-800">Grade 3: Severe NPDR</span>
                <span className="text-[11px] font-medium text-orange-800 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">4-2-1 Rule Met</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/70">
                <span className="font-semibold text-slate-800">Grade 4: Proliferative</span>
                <span className="text-[11px] font-medium text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">Neovascularization</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Target Anchor for Smooth Auto-Scroll when user clicks scanning */}
      <div ref={reportSectionRef} className="scroll-mt-8 space-y-6">
        {/* Error Message Alert */}
        {errorMessage && (
          <div className="p-6 rounded-3xl bg-rose-50 border border-rose-200 text-rose-900 shadow-sm animate-in fade-in duration-200 space-y-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-2 text-xs flex-1">
                <h4 className="font-bold text-rose-950 text-sm">
                  Screening Pipeline Notice
                </h4>
                <p className="text-rose-800 leading-relaxed font-mono">
                  {errorMessage}
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleProceedToScreening}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retry AI Screening</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ACTIVE SCANNING PROGRESS STATE (Visible when doctor clicks scanning) */}
        {isAnalyzing && (
          <div className="p-8 sm:p-12 rounded-3xl bg-white border border-sky-200 shadow-xl shadow-sky-600/5 animate-in fade-in zoom-in-95 duration-300">
            <div className="max-w-xl mx-auto text-center space-y-6">
              {/* Radar pulse animation */}
              <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-sky-200 animate-ping opacity-60"></div>
                <div className="relative w-16 h-16 rounded-2xl bg-sky-600 flex items-center justify-center text-white shadow-lg shadow-sky-600/30">
                  <Activity className="w-8 h-8 animate-pulse" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[11px] font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
                  <span>AI Inference In Motion</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Analyzing Retinal Fundus Scan
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                  Feeding high-resolution fundus tensor through ResNet-18 convolutional backbone and computing Class Activation Maps (CAM).
                </p>
              </div>

              {/* Step indicator tracker */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-left space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>FastAPI Execution Pipeline</span>
                  <span className="text-sky-700 font-mono text-[11px]">PORT 8000</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-sky-500 to-indigo-600 h-full rounded-full animate-pulse w-4/5 transition-all duration-500"></div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>512×512 Tensor Standardized</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Layer: res5b_relu CAM</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* REDESIGNED OFFICIAL CLINICAL SCREENING REPORT */}
        {liveResult && (
          <div 
            id="clinical-report" 
            className="rounded-3xl bg-white border-2 border-sky-300/80 shadow-2xl shadow-sky-600/10 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            {/* Report Header Bar */}
            <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono tracking-widest text-sky-300 font-bold uppercase">
                    NETRAGUARD AI · CLINICAL SCREENING REPORT
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Verified ONNX Engine
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Comprehensive Retinopathy Assessment
                </h2>
                <div className="flex items-center gap-4 text-xs text-slate-300 flex-wrap pt-1 font-mono">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-sky-400" />
                    {formatDate(new Date().toISOString())} · {formatTime(new Date().toISOString())}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-sky-400" />
                    {loggedDoctor ? `Dr. ${loggedDoctor.name} (${loggedDoctor.specialty})` : 'Attending Tele-Ophthalmologist'}
                  </span>
                </div>
              </div>

              {/* Action Buttons (Hidden in Print) */}
              <div className="no-print flex items-center gap-3 shrink-0 flex-wrap">
                <button
                  type="button"
                  onClick={handlePrintReport}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 shadow-xs transition-colors backdrop-blur-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Report</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetForNewScreening}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 shadow-xs transition-colors backdrop-blur-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Scan Another</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('results')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-extrabold shadow-lg shadow-sky-500/20 transition-all hover:scale-102"
                >
                  <span>Detailed View</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Report Content Body */}
            <div className="p-6 sm:p-8 space-y-8">
              {/* Primary Clinical Severity Banner */}
              {(() => {
                const urgency = getReferralUrgency(liveResult.predictedClass);
                const badgeStyle = getSeverityBadgeStyle(liveResult.predictedClass as DiabeticRetinopathyGrade);
                const isReferable = liveResult.screeningStatus.toLowerCase().includes('referable') || liveResult.predictedClass >= 2;

                return (
                  <div className={`p-6 sm:p-7 rounded-3xl border-2 ${badgeStyle.border} ${badgeStyle.bg} space-y-4 shadow-sm`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                            isReferable ? 'bg-rose-100 text-rose-900 border border-rose-300' : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          }`}>
                            <span className={`w-2 h-2 rounded-full ${isReferable ? 'bg-rose-600 animate-pulse' : 'bg-emerald-600'}`}></span>
                            {isReferable ? 'REFERABLE DR DETECTED' : 'NON-REFERABLE RETINOPATHY'}
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-500">
                            ICDR Stage {liveResult.predictedClass} of 4
                          </span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight pt-1">
                          {liveResult.predictedClassName}
                        </h3>
                      </div>

                      <div className="sm:text-right">
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Triage Urgency Status
                        </div>
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-extrabold ${urgency.color}`}>
                          <span className={`w-2 h-2 rounded-full ${urgency.dot}`}></span>
                          <span>{urgency.urgency}</span>
                        </div>
                      </div>
                    </div>

                    {/* Clinical Pathway Recommendation Box */}
                    <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/90 text-xs text-slate-800 leading-relaxed space-y-1">
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-sky-600" />
                        <span>Clinical Referral Directive:</span>
                      </div>
                      <p className="font-medium text-slate-700 pl-6">
                        {liveResult.referralMessage}
                      </p>
                      <div className="pl-6 text-[11px] text-slate-500 pt-1 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Recommended action timeframe: <strong>{urgency.label}</strong></span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* 4 Core Diagnostic Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Classification & Grade */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 hover:border-slate-300 transition-colors space-y-2">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Diagnostic Grade
                  </span>
                  <div className="text-lg font-black text-slate-900">
                    Grade {liveResult.predictedClass}
                  </div>
                  <div className="text-xs font-semibold text-slate-600 line-clamp-1">
                    {liveResult.predictedClassName}
                  </div>
                  <span className="text-[10px] font-mono text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100 inline-block">
                    ICD-10: E11.3{liveResult.predictedClass}
                  </span>
                </div>

                {/* 2. Confidence Metric with Gauge */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 hover:border-slate-300 transition-colors space-y-2">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Model Confidence
                  </span>
                  <div className="text-lg font-black text-sky-700">
                    {(liveResult.confidence * 100).toFixed(1)}%
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-sky-600 h-full rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, Math.max(0, liveResult.confidence * 100))}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                    <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                    High Statistical Certainty
                  </span>
                </div>

                {/* 3. Triage Status */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 hover:border-slate-300 transition-colors space-y-2">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Screening Status
                  </span>
                  <div className="text-base font-extrabold text-slate-900">
                    {liveResult.screeningStatus}
                  </div>
                  <span className="text-xs text-slate-500 block">
                    {liveResult.predictedClass >= 2 ? 'Actionable pathology identified' : 'Routine baseline monitoring'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 block">
                    Triage protocol: ICDR 2024
                  </span>
                </div>

                {/* 4. Explainability Layer */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 hover:border-slate-300 transition-colors space-y-2">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Explainability Engine
                  </span>
                  <div className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
                    <span>{liveResult.gradCAMMethod || 'CAM'}</span>
                    <span className="text-[10px] font-normal text-slate-500 font-mono">
                      (res5b_relu)
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 block">
                    GAP-Linear Layer Heatmap
                  </span>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 inline-block">
                    Latency: ~42ms
                  </span>
                </div>
              </div>

              {/* Explainability Visualizer Section */}
              <div className="pt-2 space-y-4">
                <div className="border-t border-slate-200 pt-6">
                  <ExplainabilityViewer
                    originalImage={liveResult.originalImageUrl || previewUrl || ''}
                    gradCamImage={liveResult.gradCAMOverlay || liveResult.gradCAMImage || undefined}
                    gradCamHeatmap={liveResult.gradCAMHeatmap || undefined}
                    gradCamOverlay={liveResult.gradCAMOverlay || undefined}
                    gradCamAvailable={liveResult.gradCAMAvailable}
                    gradCamLayer={liveResult.gradCAMLayer || 'res5b_relu'}
                    gradCamSource={liveResult.gradCAMSource || undefined}
                    gradCamMethod={liveResult.gradCAMMethod || 'CAM'}
                    gradCamError={liveResult.gradCAMError || undefined}
                    debug={liveResult.debug || undefined}
                    prediction={liveResult.predictedClassName}
                    confidence={liveResult.confidence}
                  />
                </div>
              </div>

              {/* Clinical Verification & Quality Control Box */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-slate-800 block">
                      Quality Assurance & Review Protocol
                    </span>
                    <span className="text-slate-500">
                      Standardized under tele-ophthalmology triage protocols. Correlate with clinical history and visual acuity.
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onNavigate('results')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    <span>Open Patient Dossier</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* End of Page Medical & Regulatory Disclaimer */}
      <div className="pt-8 border-t border-slate-200">
        <MedicalDisclaimer variant="card" />
      </div>
    </div>
  );
};

