import React, { useState } from 'react';
import type { PageRoute } from '../components/common/Navbar';
import { useLanguage } from '../hooks/useLanguage';
import { ImageUploader } from '../components/screening/ImageUploader';
import { MatlabIntegrationBanner } from '../components/screening/MatlabIntegrationBanner';
import { MedicalDisclaimer } from '../components/common/MedicalDisclaimer';
import { ExplainabilityViewer } from '../components/screening/ExplainabilityViewer';
import { screeningApi, type BackendScreeningResponse } from '../services/screeningApi';
import type { ScreeningResult, DRSeverityLabel, DiabeticRetinopathyGrade } from '../types/screening';
import { DEMO_SCREENING_RECORDS } from '../data/demoData';
import { 
  AlertCircle, 
  CheckCircle, 
  CheckCircle2, 
  ExternalLink, 
  Sparkles, 
  ArrowRight, 
  RotateCcw
} from 'lucide-react';

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

  const handleImageSelected = (file: File | null, url: string | null) => {
    setSelectedFile(file);
    setPreviewUrl(url);
    setErrorMessage(null);
    setLiveResult(null);
  };

  /**
   * Action handler when user clicks "Continue to Screening" / "Analyze Image"
   * Sends actual image file to POST http://127.0.0.1:8000/api/screen
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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to communicate with FastAPI backend.';
      setErrorMessage(
        `${msg}. Please verify that the FastAPI backend server is running on http://127.0.0.1:8000 via 'uvicorn backend.main:app --reload'.`
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExploreWithDemoData = () => {
    const sampleRecord = DEMO_SCREENING_RECORDS[0];
    onSetSelectedResult(sampleRecord);
    onNavigate('results');
  };

  const handleResetForNewScreening = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setLiveResult(null);
    setErrorMessage(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-left space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Patient Intake Portal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t.screening.title}
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
          {t.screening.subtitle}
        </p>
      </div>

      {/* MATLAB Architecture Notification Banner */}
      <MatlabIntegrationBanner />

      {/* Main Uploader UI Shell */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          <ImageUploader
            onImageSelected={handleImageSelected}
            onProceedToScreening={handleProceedToScreening}
            selectedImagePreview={previewUrl}
            selectedFileName={selectedFile?.name || (previewUrl ? 'Sample Retinal Fundus Scan' : null)}
            isLoading={isAnalyzing}
          />

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 shadow-xs animate-in fade-in duration-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-2 text-xs">
                  <h4 className="font-bold text-rose-950 text-sm">
                    Backend Screening Notice
                  </h4>
                  <p className="text-rose-800 leading-relaxed font-mono">
                    {errorMessage}
                  </p>
                  <button
                    type="button"
                    onClick={handleProceedToScreening}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs transition-colors"
                  >
                    <span>Retry Screening</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* REAL RETURNED SCREENING RESULT CARD */}
          {liveResult && (
            <div className="p-6 sm:p-7 rounded-3xl bg-white border border-sky-200 shadow-md shadow-sky-600/5 animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-2xs">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-slate-900">
                        Live Model Screening Prediction
                      </h3>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        ResNet-18 ONNX
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Inference executed via FastAPI endpoint: <span className="font-mono text-slate-600">/api/screen</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetForNewScreening}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>New Scan</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('results')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    <span>Full Report</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 4 Core Returned Values Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. predictedClassName */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Predicted Class Name
                  </span>
                  <div className="text-base font-extrabold text-slate-900 leading-snug">
                    {liveResult.predictedClassName}
                  </div>
                  <span className="text-[11px] font-mono font-semibold text-sky-700 mt-1 block">
                    Class ID: {liveResult.predictedClass}
                  </span>
                </div>

                {/* 2. confidence (decimal to percentage) */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Confidence
                  </span>
                  <div className="text-base font-extrabold text-sky-700">
                    {(liveResult.confidence * 100).toFixed(2)}%
                  </div>
                  <div className="mt-2 w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-sky-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, liveResult.confidence * 100))}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block font-mono">
                    Raw: {liveResult.confidence}
                  </span>
                </div>

                {/* 3. screeningStatus */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Screening Status
                  </span>
                  <div className="mt-1">
                    <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${
                      liveResult.screeningStatus === 'No referable DR'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : liveResult.screeningStatus === 'Mild DR'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}>
                      {liveResult.screeningStatus}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1.5 block">
                    Triage classification
                  </span>
                </div>

                {/* 4. referralMessage */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Referral Message
                  </span>
                  <div className="text-xs font-semibold text-slate-800 leading-snug">
                    {liveResult.referralMessage}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1.5 block">
                    Clinical pathway recommendation
                  </span>
                </div>
              </div>

              {/* Real Grad-CAM Explainability Section (3 Visualizations: Original, Heatmap, Overlay) */}
              <div className="pt-2">
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
          )}
        </div>

        {/* Sidebar Specifications & Protocol */}
        <div className="lg:col-span-4 space-y-6">
          {/* Image Protocol Guidelines */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Fundus Image Protocol</span>
            </h3>
            
            <ul className="text-xs text-slate-600 space-y-2.5 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 shrink-0"></span>
                <span><strong>Field:</strong> Standard 45° or 50° macula-centered and disc-centered posterior pole views.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 shrink-0"></span>
                <span><strong>Mydriasis:</strong> Non-mydriatic or pharmacologically dilated fundus photographs accepted.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 shrink-0"></span>
                <span><strong>Resolution:</strong> Minimum 1024×1024 resolution recommended for microaneurysm resolution.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 shrink-0"></span>
                <span><strong>Supported Hardware:</strong> Non-mydriatic tabletop cameras, portable smartphone-based fundus scopes (e.g. Remidio, Forus).</span>
              </li>
            </ul>
          </div>

          {/* Quick Demo Preview Shortcut */}
          <div className="bg-gradient-to-br from-sky-50 to-cyan-50/50 rounded-2xl p-6 border border-sky-100 shadow-xs space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700 font-mono">
              SIH Presentation Mode
            </span>
            <h4 className="text-sm font-bold text-slate-900">
              Preview Results Page UI
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Examine the Grad-CAM interactive viewer, image quality metrics, and multilingual patient guidance without waiting for the live backend server.
            </p>
            <button
              type="button"
              onClick={handleExploreWithDemoData}
              className="w-full mt-2 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold border border-slate-200 shadow-xs transition-colors"
            >
              <span>Explore Results View</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          {/* Clinical Disclaimer */}
          <MedicalDisclaimer variant="card" />
        </div>
      </div>
    </div>
  );
};
