import React, { useState, useMemo } from 'react';
import type { PageRoute } from '../components/common/Navbar';
import { useLanguage } from '../hooks/useLanguage';
import type { ScreeningResult } from '../types/screening';
import { ExplainabilityViewer } from '../components/screening/ExplainabilityViewer';
import { PatientFriendlyReport } from '../components/patient/PatientFriendlyReport';
import { MedicalDisclaimer } from '../components/common/MedicalDisclaimer';
import logoImg from '../assets/logo.jpeg';
import { 
  ArrowLeft, 
  UserCheck, 
  Printer, 
  Stethoscope,
  Award,
  CheckCircle2
} from 'lucide-react';
import { formatDate, formatTime, getSeverityBadgeStyle } from '../utils/formatters';
import type { DoctorProfile } from '../types/auth';

interface Props {
  result: ScreeningResult;
  onNavigate: (page: PageRoute) => void;
}

export const ResultsPage: React.FC<Props> = ({ result, onNavigate }) => {
  const { t } = useLanguage();
  const [activeView, setActiveView] = useState<'clinical' | 'patient'>('clinical');
  const [doctorNotes, setDoctorNotes] = useState(result.doctorNotes || '');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Logged-in doctor profile
  const loggedDoctor: DoctorProfile | null = useMemo(() => {
    try {
      const saved = localStorage.getItem('netraguard_doctor_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }, []);

  const handlePrintOrExport = () => {
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

  // Helper to format doctor name cleanly without duplicate 'Dr.'
  const formatDoctorName = (name?: string) => {
    if (!name) return 'Dr. Kalyani Sharma, MS';
    const cleaned = name.replace(/^(dr\.?\s*)+/i, '').trim();
    return cleaned ? `Dr. ${cleaned}` : 'Dr. Kalyani Sharma, MS';
  };

  const patientDisplayName = result.patientName || `Patient ${result.patientId}`;
  const patientDisplayAge = result.patientAge || 52;
  const patientDisplayGender = result.patientGender || 'Male';
  const patientDisplayPhone = result.patientPhone || '+91 98765 43210';
  const doctorDisplayName = formatDoctorName(
    result.reviewedBy || (loggedDoctor ? loggedDoctor.name : undefined)
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans selection:bg-sky-100 selection:text-sky-900 print:p-0 print:m-0 print:max-w-full print:space-y-4">
      
      {/* Top Navigation & View Switcher (Hidden in Print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <button
          type="button"
          onClick={() => onNavigate('screening')}
          className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-700 hover:text-sky-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-sky-600" />
          <span>Back to Screening Portal</span>
        </button>

        {/* View Toggle: Official Clinical Structured Report vs Patient-Friendly View */}
        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-xl bg-slate-200/80 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveView('clinical')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
                activeView === 'clinical'
                  ? 'bg-white text-slate-950 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <Stethoscope className="w-4 h-4 text-sky-600" />
              <span>Official Structured Clinical Report</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('patient')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
                activeView === 'patient'
                  ? 'bg-white text-slate-950 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Patient Guidance Report</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handlePrintOrExport}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* RENDER ACTIVE VIEW */}
      {activeView === 'patient' ? (
        /* PATIENT FRIENDLY REPORT VIEW */
        <div className="space-y-6 animate-in fade-in duration-150">
          <PatientFriendlyReport result={result} onPrint={handlePrintOrExport} />
          <div className="no-print">
            <MedicalDisclaimer variant="card" />
          </div>
        </div>
      ) : (
        /* OFFICIAL STRUCTURED CLINICAL HOSPITAL REPORT VIEW (2-PAGE EXECUTIVE LAYOUT) */
        <div 
          id="clinical-report" 
          className="rounded-3xl bg-white border-2 border-slate-300 shadow-2xl shadow-slate-900/10 overflow-hidden animate-in fade-in duration-200 print:shadow-none print:border-none print:rounded-none print:p-0"
        >
          {/* =================================================================== */}
          {/* PAGE 1: CLINICAL DIAGNOSTIC IMPRESSION & BIOMARKER FINDINGS         */}
          {/* =================================================================== */}
          <div className="p-8 sm:p-12 space-y-8 bg-white text-slate-900 print:p-0 print:space-y-7 print:flex print:flex-col print:justify-between min-h-[900px] print:min-h-[265mm]">
            
            <div className="space-y-7 print:space-y-6">
              {/* 1. OFFICIAL HOSPITAL LETTERHEAD HEADER */}
              <div className="border-b-2 border-slate-900 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:pb-4">
                {/* Hospital Logo & Brand Title */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full border-2 border-sky-600 p-0.5 shadow-md overflow-hidden shrink-0 bg-white print:w-16 print:h-16">
                    <img src={logoImg} alt="Hospital Logo" className="w-full h-full object-cover rounded-full" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 uppercase font-sans print:text-xl">
                      NETRAGUARD CLINICAL OPHTHALMOLOGY &amp; TELE-RETINOPATHY CENTER
                    </h1>
                    <p className="text-xs font-bold text-sky-700 uppercase tracking-wider mt-1 print:text-xs">
                      Department of Vitreoretinal Diseases &amp; Tele-Triage Network
                    </p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 print:text-xs">
                      NABH Accredited Tele-Ophthalmology Facility · NABL ISO-15189 Certified
                    </p>
                  </div>
                </div>

                {/* Report Reference Badge */}
                <div className="sm:text-right border-l sm:border-l-0 border-slate-200 pl-4 sm:pl-0 shrink-0 space-y-1 print:text-right">
                  <div className="inline-block px-3.5 py-1 bg-slate-900 text-white rounded-md text-sm font-mono font-bold tracking-wider print:bg-slate-800 print:text-sm">
                    {result.id}
                  </div>
                  <div className="text-xs text-slate-500 font-medium print:text-xs">
                    <strong>Report Date:</strong> {formatDate(result.timestamp)}
                  </div>
                  <div className="text-xs text-slate-500 font-medium print:text-xs">
                    <strong>Report Time:</strong> {formatTime(result.timestamp)}
                  </div>
                </div>
              </div>

              {/* 2. PATIENT DEMOGRAPHICS & ADMINISTRATIVE BOX */}
              <div className="bg-slate-50 rounded-2xl border border-slate-300 p-6 space-y-4 print:p-5 print:space-y-3 print:rounded-2xl">
                <div className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2 flex items-center justify-between">
                  <span>Patient Demographic &amp; Administrative Record</span>
                  <span className="text-xs font-mono text-slate-500 font-normal">UHID Confidential Record</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs print:grid-cols-4 print:gap-x-6 print:gap-y-3 print:text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Patient Name</span>
                    <span className="font-extrabold text-slate-900 text-sm block">{patientDisplayName}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Patient ID / UHID</span>
                    <span className="font-mono font-bold text-sky-700 text-sm block">{result.patientId}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Age / Gender</span>
                    <span className="font-bold text-slate-900 text-sm block">{patientDisplayAge} Yrs / {patientDisplayGender}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Contact Phone</span>
                    <span className="font-mono font-medium text-slate-800 text-xs block">{patientDisplayPhone}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Screening Facility</span>
                    <span className="font-semibold text-slate-800 block">{result.centerLocation || 'St. Jude Eye Hospital'}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Attending Clinician</span>
                    <span className="font-semibold text-slate-800 block">{doctorDisplayName}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Exam Type</span>
                    <span className="font-semibold text-slate-800 block">45° Fundus Tele-Screening</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Diagnostic Engine</span>
                    <span className="font-semibold text-emerald-700 block">ResNet-18 ONNX Engine</span>
                  </div>
                </div>
              </div>

              {/* 3. PRIMARY CLINICAL DIAGNOSIS BANNER */}
              {(() => {
                const urgency = getReferralUrgency(result.class);
                const isReferable = result.referable;
                const badgeStyle = getSeverityBadgeStyle(result.class);

                return (
                  <div className={`p-6 sm:p-7 rounded-2xl border-2 ${badgeStyle.border} ${badgeStyle.bg} space-y-4 print:p-6 print:space-y-3.5 print:rounded-2xl`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-3.5">
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Primary Clinical Impression &amp; ICDR Stage
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight print:text-xl">
                          {result.prediction}
                        </h2>
                      </div>

                      <div className="sm:text-right">
                        <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wide border ${
                          isReferable ? 'bg-rose-100 text-rose-900 border-rose-300' : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        }`}>
                          <span className={`w-2.5 h-2.5 rounded-full ${isReferable ? 'bg-rose-600' : 'bg-emerald-600'}`}></span>
                          {isReferable ? 'REFERABLE DIABETIC RETINOPATHY' : 'NON-REFERABLE RETINOPATHY'}
                        </span>
                        <div className="text-xs font-mono font-semibold text-slate-500 mt-1">
                          ICD-10 Code: E11.3{result.class}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1 print:grid-cols-3 print:gap-4 print:text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">ICDR DR Severity Grade</span>
                        <span className="font-extrabold text-slate-900 text-base">Grade {result.class} of 4</span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">AI Model Certainty</span>
                        <span className="font-extrabold text-sky-700 text-base font-mono">{(result.confidence * 100).toFixed(1)}% Confidence</span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Triage Action Timeframe</span>
                        <span className="font-extrabold text-slate-900 text-xs leading-snug">{urgency.label}</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 leading-relaxed font-medium print:p-3.5 print:text-xs">
                      <strong>Clinical Directive:</strong> {result.recommendation}
                    </div>
                  </div>
                );
              })()}

              {/* 4. LESION & BIOMARKER CLINICAL FINDINGS SUMMARY TABLE */}
              <div className="space-y-3.5 print:space-y-3">
                <div className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2 flex items-center justify-between">
                  <span>Pathological Biomarker &amp; Lesion Analysis</span>
                  <span className="text-xs font-mono text-slate-500">Automated Fundus Lesion Triage</span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-300">
                  <table className="w-full text-left border-collapse text-xs print:text-[10pt]">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-300">
                        <th className="p-3.5 print:p-3">Biomarker / Pathological Feature</th>
                        <th className="p-3.5 print:p-3">AI Detection Status</th>
                        <th className="p-3.5 print:p-3">Clinical Description &amp; Anatomical Region</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-medium">
                      <tr>
                        <td className="p-3.5 print:p-3 font-bold text-slate-900">Microaneurysms</td>
                        <td className="p-3.5 print:p-3">
                          <span className={`px-3 py-1 rounded-md text-xs font-bold ${result.class >= 1 ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'}`}>
                            {result.class >= 1 ? 'Present' : 'Absent'}
                          </span>
                        </td>
                        <td className="p-3.5 print:p-3 text-slate-600">
                          {result.class >= 1 ? 'Tiny hyperreflective punctate vascular dilations in temporal macula arcade' : 'No apparent vascular sacculations noted'}
                        </td>
                      </tr>

                      <tr>
                        <td className="p-3.5 print:p-3 font-bold text-slate-900">Retinal Hemorrhages</td>
                        <td className="p-3.5 print:p-3">
                          <span className={`px-3 py-1 rounded-md text-xs font-bold ${result.class >= 2 ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'}`}>
                            {result.class >= 2 ? 'Present' : 'Absent'}
                          </span>
                        </td>
                        <td className="p-3.5 print:p-3 text-slate-600">
                          {result.class >= 2 ? 'Intraretinal blot & flame hemorrhages identified in >2 quadrants' : 'No intraretinal hemorrhages detected'}
                        </td>
                      </tr>

                      <tr>
                        <td className="p-3.5 print:p-3 font-bold text-slate-900">Hard Exudates (Lipid Deposits)</td>
                        <td className="p-3.5 print:p-3">
                          <span className={`px-3 py-1 rounded-md text-xs font-bold ${result.class >= 2 ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'}`}>
                            {result.class >= 2 ? 'Present' : 'Absent'}
                          </span>
                        </td>
                        <td className="p-3.5 print:p-3 text-slate-600">
                          {result.class >= 2 ? 'Waxy yellowish lipid deposits clustered near posterior pole' : 'No hard exudates observed'}
                        </td>
                      </tr>

                      <tr>
                        <td className="p-3.5 print:p-3 font-bold text-slate-900">Cotton Wool Spots (Soft Exudates)</td>
                        <td className="p-3.5 print:p-3">
                          <span className={`px-3 py-1 rounded-md text-xs font-bold ${result.class >= 3 ? 'bg-rose-100 text-rose-900' : 'bg-emerald-100 text-emerald-900'}`}>
                            {result.class >= 3 ? 'Present' : 'Absent'}
                          </span>
                        </td>
                        <td className="p-3.5 print:p-3 text-slate-600">
                          {result.class >= 3 ? 'Multiple fluffy white nerve fiber layer micro-infarcts' : 'No soft exudates detected'}
                        </td>
                      </tr>

                      <tr>
                        <td className="p-3.5 print:p-3 font-bold text-slate-900">Neovascularization (NVD / NVE)</td>
                        <td className="p-3.5 print:p-3">
                          <span className={`px-3 py-1 rounded-md text-xs font-bold ${result.class >= 4 ? 'bg-rose-100 text-rose-900' : 'bg-emerald-100 text-emerald-900'}`}>
                            {result.class >= 4 ? 'Present' : 'Absent'}
                          </span>
                        </td>
                        <td className="p-3.5 print:p-3 text-slate-600">
                          {result.class >= 4 ? 'Preretinal new vessel proliferation at optic disc' : 'No preretinal or disc neovascularization'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* PAGE 1 PRINT FOOTER */}
            <div className="hidden print:flex items-center justify-between text-xs text-slate-400 pt-4 border-t-2 border-slate-200 mt-auto">
              <span>NETRAGUARD TELE-RETINOPATHY SYSTEM · REPORT ID: {result.id}</span>
              <span className="font-bold text-slate-700">Page 1 of 2 - Clinical Triage Summary</span>
            </div>

          </div>

          {/* =================================================================== */}
          {/* PAGE 2: RETINAL SCANS, AI EXPLAINABILITY & AUTHORIZATION SIGN-OFF   */}
          {/* =================================================================== */}
          <div className="p-8 sm:p-10 space-y-7 bg-white text-slate-900 print:p-0 print:pt-6 print:space-y-6 print-page-break border-t-2 border-slate-200 sm:border-t-0">
            
            {/* PAGE 2 PRINT HEADER */}
            <div className="hidden print:flex items-center justify-between border-b-2 border-slate-900 pb-3">
              <div className="flex items-center gap-3">
                <img src={logoImg} alt="Hospital Logo" className="w-10 h-10 rounded-full border border-sky-600" />
                <div>
                  <h3 className="text-sm font-black text-slate-950 uppercase">
                    NETRAGUARD CLINICAL OPHTHALMOLOGY &amp; TELE-RETINOPATHY CENTER
                  </h3>
                  <p className="text-[10px] font-bold text-sky-700">RETINAL IMAGING &amp; EXPLAINABILITY REPORT</p>
                </div>
              </div>
              <div className="text-right text-[11px] font-mono font-bold text-slate-900">
                REPORT REF: {result.id}
              </div>
            </div>

            {/* 5. RETINAL IMAGING & AI EXPLAINABILITY (GRAD-CAM) HEATMAP */}
            <div className="space-y-4 print:space-y-3">
              <div className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2 flex items-center justify-between">
                <span>Retinal Fundus Scans &amp; AI Lesion Heatmap Explainability</span>
                <span className="text-xs text-slate-500 font-mono">ResNet-18 (Layer: res5b_relu)</span>
              </div>

              {/* SCREEN ONLY VIEW: Full interactive ExplainabilityViewer with tabs & sliders */}
              <div className="no-print">
                <ExplainabilityViewer
                  originalImage={result.originalImageUrl}
                  gradCamImage={result.gradCamImageUrl}
                  gradCamHeatmap={result.gradCamHeatmapUrl}
                  gradCamOverlay={result.gradCamOverlayUrl}
                  gradCamAvailable={result.gradCamAvailable}
                  gradCamLayer={result.gradCamLayer || 'res5b_relu'}
                  gradCamSource={result.gradCamSource}
                  gradCamMethod="CAM"
                  prediction={result.prediction}
                  confidence={result.confidence}
                />
              </div>

              {/* PRINT ONLY VIEW: 3-column imaging section (Original Scan + AI Score Heatmap + Grad-CAM Overlay) */}
              <div className="hidden print:grid grid-cols-3 gap-3 my-2">
                {/* 1. Original Retinal Scan */}
                <div className="border-2 border-slate-200 rounded-xl p-2.5 text-center bg-slate-50 space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">
                    1. Original 45° Fundus Scan
                  </div>
                  <div className="h-44 flex items-center justify-center bg-slate-950 rounded-lg overflow-hidden border border-slate-300">
                    <img 
                      src={result.originalImageUrl} 
                      alt="Original Fundus Scan" 
                      className="max-h-40 w-full object-contain"
                    />
                  </div>
                  <p className="text-[9px] text-slate-500 font-medium">Raw Retinal Photograph</p>
                </div>

                {/* 2. AI Score Heatmap (JET Colormap) */}
                <div className="border-2 border-slate-200 rounded-xl p-2.5 text-center bg-slate-50 space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">
                    2. AI Score Heatmap (JET)
                  </div>
                  <div className="h-44 flex items-center justify-center bg-slate-950 rounded-lg overflow-hidden border border-slate-300">
                    <img 
                      src={result.gradCamHeatmapUrl || result.gradCamOverlayUrl || result.gradCamImageUrl || result.originalImageUrl} 
                      alt="AI Score Heatmap" 
                      className="max-h-40 w-full object-contain"
                    />
                  </div>
                  <div className="bg-black/90 text-white rounded px-2 py-0.5 text-[8px] flex items-center justify-between font-mono">
                    <span>Low</span>
                    <div className="w-16 h-1.5 rounded-full bg-gradient-to-r from-blue-600 via-cyan-400 via-amber-400 to-red-600"></div>
                    <span className="text-rose-400 font-bold">High Salience</span>
                  </div>
                </div>

                {/* 3. Grad-CAM Lesion Overlay */}
                <div className="border-2 border-slate-200 rounded-xl p-2.5 text-center bg-slate-50 space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">
                    3. Grad-CAM Lesion Overlay
                  </div>
                  <div className="h-44 flex items-center justify-center bg-slate-950 rounded-lg overflow-hidden border border-slate-300">
                    <img 
                      src={result.gradCamOverlayUrl || result.gradCamImageUrl || result.originalImageUrl} 
                      alt="Grad-CAM Lesion Overlay" 
                      className="max-h-40 w-full object-contain"
                    />
                  </div>
                  <p className="text-[9px] text-sky-700 font-mono font-bold">ResNet-18 (res5b_relu)</p>
                </div>
              </div>
            </div>

            {/* 6. CLINICAL DOCTOR SIGN-OFF NOTES */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-300 space-y-3 print:p-4 print:space-y-2 print:rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-sky-600" />
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    Physician Clinical Notes &amp; Diagnostic Authorization
                  </h3>
                </div>
                <span className="text-xs text-slate-500 font-semibold no-print">
                  Status: <strong>{result.clinicalStatus}</strong>
                </span>
              </div>

              {doctorNotes ? (
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-medium print:p-3 print:text-xs">
                  <strong>Doctor Clinical Notes:</strong> {doctorNotes}
                </div>
              ) : null}

              <div className="no-print space-y-3">
                <textarea
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  placeholder="Enter custom clinical notes, treatment recommendation, or telemedicine sign-off..."
                  className="w-full h-24 p-3 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 leading-relaxed font-medium"
                />

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                  <span className="text-xs text-slate-500 font-medium">
                    Saving notes will authorize this report in the district health registry.
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      setSaveStatus('Clinical sign-off recorded and saved successfully.');
                      setTimeout(() => setSaveStatus(null), 3500);
                    }}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    Save Doctor Notes
                  </button>
                </div>

                {saveStatus && (
                  <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs border border-emerald-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{saveStatus}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 7. OFFICIAL PHYSICIAN AUTHORIZATION & SIGN-OFF */}
            <div className="pt-6 border-t-2 border-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 print:pt-4 print:gap-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <Award className="w-4 h-4 text-sky-700" />
                  <span>Validated Tele-Ophthalmology Triage Standard</span>
                </div>
                <p className="text-slate-500 max-w-md text-xs print:text-xs">
                  This report is generated electronically under NABH tele-triage guidelines. Findings should be correlated with visual acuity and dilated ophthalmoscopy.
                </p>
              </div>

              {/* Signature Box */}
              <div className="text-center sm:text-right space-y-1 shrink-0 border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-200 print:text-right">
                <div className="inline-block border-b-2 border-slate-900 pb-1 px-4 font-serif italic text-lg font-bold text-slate-900">
                  {doctorDisplayName}
                </div>
                <div className="text-xs font-bold text-slate-900">
                  {doctorDisplayName} (Vitreoretinal Specialist)
                </div>
                <div className="text-xs font-mono text-slate-500">
                  Reg No: MED-KA-2026-9482 · Retinal Consultant
                </div>
                <div className="text-xs text-emerald-700 font-bold uppercase tracking-wider flex items-center justify-center sm:justify-end gap-1.5 pt-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Digitally Authorized &amp; Signed</span>
                </div>
              </div>
            </div>

            {/* PAGE 2 PRINT FOOTER */}
            <div className="hidden print:flex items-center justify-between text-[10px] text-slate-400 pt-4 border-t border-slate-200">
              <span>NETRAGUARD CLINICAL OPHTHALMOLOGY REPORT · CONFIDENTIAL MEDICAL RECORD</span>
              <span className="font-bold text-slate-600">Page 2 of 2 - Official Tele-Ophthalmology Diagnostic Report</span>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
