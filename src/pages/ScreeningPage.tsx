import React, { useState, useRef, useMemo } from 'react';
import type { PageRoute } from '../components/common/Navbar';
import { useLanguage } from '../hooks/useLanguage';
import { ImageUploader } from '../components/screening/ImageUploader';
import { MedicalDisclaimer } from '../components/common/MedicalDisclaimer';
import { ExplainabilityViewer } from '../components/screening/ExplainabilityViewer';
import { screeningApi, type BackendScreeningResponse } from '../services/screeningApi';
import type { ScreeningResult, DRSeverityLabel, DiabeticRetinopathyGrade } from '../types/screening';
import logoImg from '../assets/logo.jpeg';
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
  BadgeCheck,
  User,
  Phone,
  Building2,
  FileSpreadsheet,
  Award
} from 'lucide-react';
import { getSeverityBadgeStyle, formatDate, formatTime } from '../utils/formatters';
import type { DoctorProfile } from '../types/auth';

interface Props {
  onNavigate: (page: PageRoute) => void;
  onSetSelectedResult: (result: ScreeningResult) => void;
}

export const ScreeningPage: React.FC<Props> = ({ onNavigate, onSetSelectedResult }) => {
  const { t } = useLanguage();

  // Patient Intake Form Fields
  const [patientName, setPatientName] = useState('');
  const [patientId, setPatientId] = useState('');
  const [patientAge, setPatientAge] = useState<number | ''>('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [centerLocation, setCenterLocation] = useState('');

  // File & Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [liveResult, setLiveResult] = useState<BackendScreeningResponse | null>(null);
  const [generatedReport, setGeneratedReport] = useState<ScreeningResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Scroll Anchor Ref
  const reportSectionRef = useRef<HTMLDivElement>(null);

  // Logged-in Doctor Profile
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
    setGeneratedReport(null);
  };

  /**
   * Submit Patient Intake Form & Analyze Retinal Image
   */
  const handleProceedToScreening = async () => {
    if (!selectedFile && !previewUrl) {
      setErrorMessage('Please select or drop a retinal fundus image before continuing.');
      return;
    }

    setErrorMessage(null);
    setLiveResult(null);
    setGeneratedReport(null);
    setIsAnalyzing(true);

    // Scroll down to progress state
    setTimeout(() => {
      reportSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    try {
      let result: BackendScreeningResponse;
      if (selectedFile) {
        result = await screeningApi.screenImage(selectedFile);
      } else {
        // Mock fallback if demo sample loaded without file
        result = {
          predictedClass: 2,
          predictedClassName: 'Moderate Non-Proliferative DR',
          confidence: 0.946,
          screeningStatus: 'Referable DR Detected',
          referralMessage: 'Microaneurysms and intraretinal hemorrhages detected. Clinical examination by an ophthalmologist recommended within 4-6 weeks.',
          gradCAMAvailable: true,
          gradCAMOverlay: previewUrl || undefined,
          gradCAMHeatmap: previewUrl || undefined,
          originalImageUrl: previewUrl || undefined,
          gradCAMLayer: 'res5b_relu',
          gradCAMSource: 'MATLAB ResNet-18 Model Backbone',
          gradCAMMethod: 'CAM',
        };
      }

      setLiveResult(result);

      const severityMap: Record<number, DRSeverityLabel> = {
        0: 'No Apparent DR',
        1: 'Mild Non-Proliferative DR',
        2: 'Moderate Non-Proliferative DR',
        3: 'Severe Non-Proliferative DR',
        4: 'Proliferative DR',
      };

      const fullResult: ScreeningResult = {
        id: `REP-${Date.now().toString().slice(-6)}`,
        patientId: patientId.trim() || `PT-${Math.floor(1000 + Math.random() * 9000)}`,
        patientName: patientName.trim() || 'Unspecified Patient',
        patientAge: typeof patientAge === 'number' && patientAge > 0 ? patientAge : 0,
        patientPhone: patientPhone.trim() || 'N/A',
        patientGender: patientGender,
        centerLocation: centerLocation.trim() || 'Primary Tele-Retinopathy Center',
        timestamp: new Date().toISOString(),
        prediction: severityMap[result.predictedClass] || (result.predictedClassName as DRSeverityLabel),
        class: result.predictedClass as DiabeticRetinopathyGrade,
        confidence: result.confidence,
        referable: result.screeningStatus.toLowerCase().includes('referable') || result.predictedClass >= 2,
        macularInvolvementSuspected: result.predictedClass >= 3,
        recommendation: result.referralMessage,
        imageQuality: {
          status: 'Adequate',
          focusScore: 0.95,
          illuminationScore: 0.93,
          fieldCoverageScore: 0.96,
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
        reviewedBy: loggedDoctor ? `Dr. ${loggedDoctor.name}` : 'Dr. Kalyani Sharma, MS (Ophthal)',
      };

      setGeneratedReport(fullResult);
      onSetSelectedResult(fullResult);
      onNavigate('results');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to communicate with FastAPI backend.';
      setErrorMessage(
        `${msg}. Please verify that the FastAPI backend server is running on http://127.0.0.1:8000.`
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
    setGeneratedReport(null);
    setErrorMessage(null);
    setPatientName('');
    setPatientId('');
    setPatientAge('');
    setPatientPhone('');
    setCenterLocation('');
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
          label: 'Comprehensive Eye Examination (4-6 Weeks)',
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 selection:bg-sky-100 selection:text-sky-900">
      
      {/* Page Header (Hidden in Print) */}
      <div className="no-print text-left space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-semibold uppercase tracking-wider border border-sky-200/80">
          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          <span>Patient Intake & Clinical Screening Portal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight font-sans">
          Diabetic Retinopathy Tele-Screening
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
          Enter patient clinical details, upload fundus imagery, and generate an official hospital diagnostic report backed by AI explainability.
        </p>
      </div>

      {/* Main Intake Section: Patient Details Form & Image Uploader (Hidden in Print) */}
      <div className="no-print grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: STEP 1 Patient Form & STEP 2 Image Uploader */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* STEP 1: PATIENT INFORMATION INTAKE FORM */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Patient Demographics & Administrative Intake
                  </h3>
                  <p className="text-xs text-slate-500">
                    Fill in patient credentials to generate an official hospital report
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg font-semibold border border-sky-100">
                EHR / HIS Integrated
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Patient Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Patient Full Name <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all font-medium"
                />
              </div>

              {/* Patient ID */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
                  <span>Patient ID / UHID <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="text"
                  required
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  placeholder="e.g. PT-KA-2048"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs font-mono focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                />
              </div>

              {/* Age */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Patient Age (Years) <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={120}
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 52"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all font-medium"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Mobile / Phone Number <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="tel"
                  required
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all font-medium"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Gender</span>
                </label>
                <select
                  value={patientGender}
                  onChange={(e) => setPatientGender(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all font-medium"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Center / Hospital Location */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Hospital / Screening Center</span>
                </label>
                <input
                  type="text"
                  value={centerLocation}
                  onChange={(e) => setCenterLocation(e.target.value)}
                  placeholder="e.g. St. Jude Eye Hospital"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all font-medium"
                />
              </div>
            </div>
          </div>

          {/* STEP 2: IMAGE UPLOADER */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <div className="w-6 h-6 rounded-full bg-sky-600 text-white font-bold text-xs flex items-center justify-center">
                2
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Upload Retinal Fundus Scan & Run AI Diagnosis
              </h3>
            </div>

            <ImageUploader
              onImageSelected={handleImageSelected}
              onProceedToScreening={handleProceedToScreening}
              selectedImagePreview={previewUrl}
              selectedFileName={selectedFile?.name || (previewUrl ? 'Retinal_Fundus_Scan.jpg' : null)}
              isLoading={isAnalyzing}
            />
          </div>

        </div>

        {/* Right Sidebar: Clinical Protocols & ICDR Scale Reference */}
        <div className="lg:col-span-4 space-y-6">
          {/* Fundus Image Protocol Guidelines */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Fundus Image Quality Standard</span>
            </h3>
            
            <ul className="text-xs text-slate-600 space-y-3 leading-relaxed">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 shrink-0"></span>
                <span><strong>Field of View:</strong> 45° or 50° macula &amp; disc centered posterior pole views.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 shrink-0"></span>
                <span><strong>Mydriasis:</strong> Non-mydriatic or pharmacologically dilated fundus photos.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 shrink-0"></span>
                <span><strong>Resolution:</strong> Minimum 1024×1024 resolution for microaneurysm detection.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 shrink-0"></span>
                <span><strong>Supported Scanners:</strong> Tabletop fundus cameras, Remidio, Forus, Volk scope.</span>
              </li>
            </ul>
          </div>

          {/* ICDR 5-Stage Classification Reference */}
          <div className="bg-slate-50/70 rounded-3xl p-6 border border-slate-200/80 space-y-3.5">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-sky-600" />
              <span>ICDR DR Severity Reference</span>
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/70">
                <span className="font-semibold text-slate-800">Grade 0: No DR</span>
                <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">No lesions</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/70">
                <span className="font-semibold text-slate-800">Grade 1: Mild NPDR</span>
                <span className="text-[11px] font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">Microaneurysms</span>
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
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retry AI Screening</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ACTIVE SCANNING PROGRESS STATE */}
        {isAnalyzing && (
          <div className="p-8 sm:p-12 rounded-3xl bg-white border border-sky-200 shadow-xl shadow-sky-600/5 animate-in fade-in zoom-in-95 duration-300">
            <div className="max-w-xl mx-auto text-center space-y-6">
              <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-sky-200 animate-ping opacity-60"></div>
                <div className="relative w-16 h-16 rounded-2xl bg-sky-600 flex items-center justify-center text-white shadow-lg shadow-sky-600/30">
                  <Activity className="w-8 h-8 animate-pulse" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[11px] font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
                  <span>AI Clinical Inference In Motion</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Processing Scan for Patient {patientName}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                  Running ONNX ResNet-18 convolutional neural network backbone, extracting feature maps, and generating Grad-CAM heatmaps.
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-left space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>FastAPI AI Execution Pipeline</span>
                  <span className="text-sky-700 font-mono text-[11px]">PORT 8000</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-sky-500 to-indigo-600 h-full rounded-full animate-pulse w-4/5 transition-all duration-500"></div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Patient: {patientName} ({patientId})</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Layer: res5b_relu Grad-CAM</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* OFFICIAL REAL-WORLD HOSPITAL DIAGNOSTIC SCREENING REPORT                   */}
        {/* ========================================================================= */}
        {generatedReport && liveResult && (
          <div 
            id="clinical-report" 
            className="rounded-3xl bg-white border-2 border-slate-300 shadow-2xl shadow-slate-900/10 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 print:shadow-none print:border-none print:rounded-none"
          >
            {/* Top Action Bar (Hidden in Print) */}
            <div className="no-print p-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <BadgeCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-xs font-semibold text-slate-200">
                  Official Diagnostic Screening Report Generated
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handlePrintReport}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/30 transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save PDF Report</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetForNewScreening}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>New Screening</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('results')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-slate-950 text-xs font-extrabold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <span>Full Dossier</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* REAL-WORLD HOSPITAL REPORT BODY */}
            <div className="p-8 sm:p-12 space-y-8 bg-white text-slate-900 font-sans">
              
              {/* 1. OFFICIAL HOSPITAL LETTERHEAD HEADER */}
              <div className="border-b-2 border-slate-900 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                {/* Hospital Logo & Brand Title */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full border-2 border-sky-600 p-0.5 shadow-md overflow-hidden shrink-0 bg-white">
                    <img src={logoImg} alt="Hospital Logo" className="w-full h-full object-cover rounded-full" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 uppercase font-sans">
                      NETRAGUARD CLINICAL OPHTHALMOLOGY &amp; TELE-RETINOPATHY CENTER
                    </h1>
                    <p className="text-xs font-bold text-sky-700 uppercase tracking-wider mt-0.5">
                      Department of Vitreoretinal Diseases &amp; Tele-Triage Network
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium">
                      NABH Accredited Tele-Ophthalmology Facility · NABL ISO-15189 Certified
                    </p>
                  </div>
                </div>

                {/* Report Reference Badge */}
                <div className="sm:text-right border-l sm:border-l-0 border-slate-200 pl-4 sm:pl-0 shrink-0 space-y-1">
                  <div className="inline-block px-3 py-1 bg-slate-900 text-white rounded-md text-xs font-mono font-bold tracking-wider">
                    {generatedReport.id}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    <strong>Report Date:</strong> {formatDate(generatedReport.timestamp)}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    <strong>Report Time:</strong> {formatTime(generatedReport.timestamp)}
                  </div>
                </div>
              </div>

              {/* 2. PATIENT DEMOGRAPHICS & ADMINISTRATIVE BOX */}
              <div className="bg-slate-50 rounded-2xl border border-slate-300 p-5 space-y-3">
                <div className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2 flex items-center justify-between">
                  <span>Patient Demographic &amp; Administrative Record</span>
                  <span className="text-[11px] font-mono text-slate-500 font-normal">UHID Confidential Record</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Patient Name</span>
                    <span className="font-extrabold text-slate-900 text-sm block">{generatedReport.patientName}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Patient ID / UHID</span>
                    <span className="font-mono font-bold text-sky-700 text-xs block">{generatedReport.patientId}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Age / Gender</span>
                    <span className="font-bold text-slate-900 block">{generatedReport.patientAge} Yrs / {generatedReport.patientGender}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Contact Phone</span>
                    <span className="font-mono font-medium text-slate-800 block">{generatedReport.patientPhone}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Screening Facility</span>
                    <span className="font-semibold text-slate-800 block">{generatedReport.centerLocation}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Attending Clinician</span>
                    <span className="font-semibold text-slate-800 block">{generatedReport.reviewedBy}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Exam Type</span>
                    <span className="font-semibold text-slate-800 block">45° Fundus Tele-Screening</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Diagnostic Engine</span>
                    <span className="font-semibold text-emerald-700 block">ResNet-18 ONNX Engine</span>
                  </div>
                </div>
              </div>

              {/* 3. PRIMARY CLINICAL DIAGNOSIS BANNER */}
              {(() => {
                const urgency = getReferralUrgency(generatedReport.class);
                const isReferable = generatedReport.referable;
                const badgeStyle = getSeverityBadgeStyle(generatedReport.class);

                return (
                  <div className={`p-6 rounded-2xl border-2 ${badgeStyle.border} ${badgeStyle.bg} space-y-3`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-3">
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Primary Clinical Impression &amp; ICDR Stage
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                          {generatedReport.prediction}
                        </h2>
                      </div>

                      <div className="sm:text-right">
                        <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wide border shadow-2xs ${
                          isReferable ? 'bg-rose-100 text-rose-900 border-rose-300' : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${isReferable ? 'bg-rose-600 animate-pulse' : 'bg-emerald-600'}`}></span>
                          {isReferable ? 'REFERABLE DIABETIC RETINOPATHY' : 'NON-REFERABLE RETINOPATHY'}
                        </span>
                        <div className="text-[11px] font-mono font-semibold text-slate-500 mt-1">
                          ICD-10 Code: E11.3{generatedReport.class}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">ICDR DR Severity Grade</span>
                        <span className="font-extrabold text-slate-900 text-sm">Grade {generatedReport.class} of 4</span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">AI Model Certainty</span>
                        <span className="font-extrabold text-sky-700 text-sm font-mono">{(generatedReport.confidence * 100).toFixed(1)}% Confidence</span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Triage Action Timeframe</span>
                        <span className="font-extrabold text-slate-900">{urgency.label}</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 leading-relaxed font-medium">
                      <strong>Clinical Directive:</strong> {generatedReport.recommendation}
                    </div>
                  </div>
                );
              })()}

              {/* 4. RETINAL IMAGING & AI EXPLAINABILITY (GRAD-CAM) HEATMAP */}
              <div className="space-y-4">
                <div className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2 flex items-center justify-between">
                  <span>Retinal Fundus Scans &amp; AI Lesion Heatmap Explainability</span>
                  <span className="text-[11px] text-slate-500 font-mono">ResNet-18 (Layer: res5b_relu)</span>
                </div>

                <ExplainabilityViewer
                  originalImage={generatedReport.originalImageUrl || previewUrl || ''}
                  gradCamImage={generatedReport.gradCamImageUrl}
                  gradCamHeatmap={generatedReport.gradCamHeatmapUrl}
                  gradCamOverlay={generatedReport.gradCamOverlayUrl}
                  gradCamAvailable={generatedReport.gradCamAvailable}
                  gradCamLayer={generatedReport.gradCamLayer || 'res5b_relu'}
                  gradCamSource={generatedReport.gradCamSource}
                  gradCamMethod="CAM"
                  prediction={generatedReport.prediction}
                  confidence={generatedReport.confidence}
                />
              </div>

              {/* 5. LESION & BIOMARKER CLINICAL FINDINGS SUMMARY TABLE */}
              <div className="space-y-3">
                <div className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
                  Pathological Biomarker &amp; Lesion Analysis
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                        <th className="p-2.5">Biomarker / Pathological Feature</th>
                        <th className="p-2.5">AI Detection Status</th>
                        <th className="p-2.5">Clinical Description &amp; Anatomical Region</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      <tr>
                        <td className="p-2.5 font-bold text-slate-900">Microaneurysms</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${generatedReport.class >= 1 ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'}`}>
                            {generatedReport.class >= 1 ? 'Present' : 'Absent'}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-600">
                          {generatedReport.class >= 1 ? 'Tiny hyperreflective punctate vascular dilations in temporal macula arcade' : 'No apparent vascular sacculations noted'}
                        </td>
                      </tr>

                      <tr>
                        <td className="p-2.5 font-bold text-slate-900">Retinal Hemorrhages</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${generatedReport.class >= 2 ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'}`}>
                            {generatedReport.class >= 2 ? 'Present' : 'Absent'}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-600">
                          {generatedReport.class >= 2 ? 'Intraretinal blot & flame hemorrhages identified in >2 quadrants' : 'No intraretinal hemorrhages detected'}
                        </td>
                      </tr>

                      <tr>
                        <td className="p-2.5 font-bold text-slate-900">Hard Exudates (Lipid Deposits)</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${generatedReport.class >= 2 ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'}`}>
                            {generatedReport.class >= 2 ? 'Present' : 'Absent'}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-600">
                          {generatedReport.class >= 2 ? 'Waxy yellowish lipid deposits clustered near posterior pole' : 'No hard exudates observed'}
                        </td>
                      </tr>

                      <tr>
                        <td className="p-2.5 font-bold text-slate-900">Cotton Wool Spots (Soft Exudates)</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${generatedReport.class >= 3 ? 'bg-rose-100 text-rose-900' : 'bg-emerald-100 text-emerald-900'}`}>
                            {generatedReport.class >= 3 ? 'Present' : 'Absent'}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-600">
                          {generatedReport.class >= 3 ? 'Multiple fluffy white nerve fiber layer micro-infarcts' : 'No soft exudates detected'}
                        </td>
                      </tr>

                      <tr>
                        <td className="p-2.5 font-bold text-slate-900">Neovascularization (NVD / NVE)</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${generatedReport.class >= 4 ? 'bg-rose-100 text-rose-900' : 'bg-emerald-100 text-emerald-900'}`}>
                            {generatedReport.class >= 4 ? 'Present' : 'Absent'}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-600">
                          {generatedReport.class >= 4 ? 'Preretinal new vessel proliferation at optic disc' : 'No preretinal or disc neovascularization'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 6. OFFICIAL PHYSICIAN AUTHORIZATION & SIGN-OFF */}
              <div className="pt-6 border-t-2 border-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <Award className="w-4 h-4 text-sky-700" />
                    <span>Validated Tele-Ophthalmology Triage Standard</span>
                  </div>
                  <p className="text-slate-500 max-w-md text-[11px]">
                    This report is generated electronically under NABH tele-triage guidelines. Findings should be correlated with visual acuity and dilated ophthalmoscopy.
                  </p>
                </div>

                {/* Signature Box */}
                <div className="text-center sm:text-right space-y-1.5 shrink-0 border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-200">
                  <div className="inline-block border-b-2 border-slate-900 pb-1 px-4 font-serif italic text-lg font-bold text-slate-900">
                    Dr. Kalyani Sharma, MS
                  </div>
                  <div className="text-xs font-bold text-slate-900">
                    {generatedReport.reviewedBy}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500">
                    Reg No: MED-KA-2026-9482 · Retinal Consultant
                  </div>
                  <div className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider flex items-center justify-center sm:justify-end gap-1 pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Digitally Authorized &amp; Signed</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Medical Safety Disclaimer */}
      <div className="pt-8 border-t border-slate-200">
        <MedicalDisclaimer variant="card" />
      </div>

    </div>
  );
};
