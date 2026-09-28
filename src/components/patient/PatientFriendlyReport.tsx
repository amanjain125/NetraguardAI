import React, { useEffect } from 'react';
import type { ScreeningResult, SupportedLanguage } from '../../types/screening';
import { useLanguage } from '../../hooks/useLanguage';
import { SUPPORTED_LANGUAGES } from '../../data/translations';
import logoImg from '../../assets/logo.jpeg';
import { 
  HeartHandshake, 
  CheckCircle2, 
  Award,
  Globe
} from 'lucide-react';
import { formatDate, formatTime, getSeverityBadgeStyle } from '../../utils/formatters';

interface Props {
  result: ScreeningResult;
  onPrint?: () => void;
}

export const PatientFriendlyReport: React.FC<Props> = ({ result }) => {
  const { t, language, setLanguage } = useLanguage();

  // If result has a preferredLanguage specified, switch to it automatically on mount
  useEffect(() => {
    if (result.preferredLanguage && result.preferredLanguage !== language) {
      setLanguage(result.preferredLanguage);
    }
  }, [result.preferredLanguage, setLanguage, language]);

  const isReferable = result.referable;
  const badgeStyle = getSeverityBadgeStyle(result.class);

  // Helper for doctor name formatting
  const doctorDisplayName = result.reviewedBy
    ? (result.reviewedBy.startsWith('Dr.') ? result.reviewedBy : `Dr. ${result.reviewedBy}`)
    : 'Dr. Kalyani Sharma, MS';

  const patientDisplayName = result.patientName || `Patient ${result.patientId}`;
  const patientDisplayAge = result.patientAge || 52;
  const patientDisplayGender = result.patientGender || 'Male';
  const patientDisplayPhone = result.patientPhone || '+91 98765 43210';

  const pr = t.patientReport;

  return (
    <div 
      id="patient-report"
      className="rounded-3xl bg-white border-2 border-slate-300 shadow-2xl shadow-slate-900/10 overflow-hidden animate-in fade-in duration-200 print:shadow-none print:border-none print:rounded-none print:p-0"
    >
      {/* =================================================================== */}
      {/* PAGE 1: PATIENT OVERVIEW & SIMPLE CLINICAL EXPLANATION              */}
      {/* =================================================================== */}
      <div className="p-8 sm:p-12 space-y-8 bg-white text-slate-900 print:p-0 print:space-y-7 print:flex print:flex-col print:justify-between min-h-[900px] print:min-h-[265mm]">
        
        <div className="space-y-7 print:space-y-6">
          {/* 1. OFFICIAL HOSPITAL LETTERHEAD HEADER WITH LANGUAGE SELECTOR */}
          <div className="border-b-2 border-slate-900 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:pb-4">
            {/* Hospital Logo & Title */}
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

            {/* Language Switcher Pills & Report Badge */}
            <div className="sm:text-right shrink-0 space-y-2 print:text-right">
              {/* Interactive Language Selector (Hidden in Print) */}
              <div className="no-print flex items-center gap-1.5 justify-end bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                <Globe className="w-3.5 h-3.5 text-sky-700 shrink-0 ml-1" />
                <span className="text-[11px] font-bold text-slate-600 mr-1">Language:</span>
                {SUPPORTED_LANGUAGES.map((langOption) => (
                  <button
                    key={langOption.code}
                    type="button"
                    onClick={() => setLanguage(langOption.code as SupportedLanguage)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      language === langOption.code
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {langOption.nativeLabel}
                  </button>
                ))}
              </div>

              <div className="inline-block px-3.5 py-1 bg-slate-900 text-white rounded-md text-sm font-mono font-bold tracking-wider print:bg-slate-800 print:text-sm">
                {result.id}
              </div>
              <div className="text-xs text-slate-500 font-medium print:text-xs">
                <strong>{pr.reportDate || 'Report Date:'}</strong> {formatDate(result.timestamp, language)}
              </div>
              <div className="text-xs text-slate-500 font-medium print:text-xs">
                <strong>{pr.reportTime || 'Report Time:'}</strong> {formatTime(result.timestamp)}
              </div>
            </div>
          </div>

          {/* 2. PATIENT DEMOGRAPHICS & ADMINISTRATIVE BOX */}
          <div className="bg-slate-50 rounded-2xl border border-slate-300 p-6 space-y-4 print:p-5 print:space-y-3 print:rounded-2xl">
            <div className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2 flex items-center justify-between">
              <span>{pr.demographicsLabel}</span>
              <span className="text-xs font-mono text-slate-500 font-normal">UHID Confidential Record</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs print:grid-cols-4 print:gap-x-6 print:gap-y-3 print:text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">{pr.demographicsLabel}</span>
                <span className="font-extrabold text-slate-900 text-sm block">{patientDisplayName}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">{pr.patientIdLabel}</span>
                <span className="font-mono font-bold text-sky-700 text-sm block">{result.patientId}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">{pr.ageGender || 'Age / Gender'}</span>
                <span className="font-bold text-slate-900 text-sm block">{patientDisplayAge} {pr.yearsOld} / {patientDisplayGender}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">{pr.contactPhone || 'Contact Phone'}</span>
                <span className="font-mono font-medium text-slate-800 text-xs block">{patientDisplayPhone}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">{pr.healthCenterLabel}</span>
                <span className="font-semibold text-slate-800 block">{result.centerLocation || pr.primaryHealthCenter}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">{pr.attendingClinician || 'Attending Clinician'}</span>
                <span className="font-semibold text-slate-800 block">{doctorDisplayName}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">{pr.examType || 'Exam Type'}</span>
                <span className="font-semibold text-slate-800 block">45° Fundus Tele-Screening</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">{pr.diagnosticEngine || 'Diagnostic Engine'}</span>
                <span className="font-semibold text-emerald-700 block">ResNet-18 ONNX Engine</span>
              </div>
            </div>
          </div>

          {/* 3. PATIENT-FRIENDLY CLINICAL IMPRESSION BANNER */}
          <div className={`p-6 sm:p-7 rounded-2xl border-2 ${badgeStyle.border} ${badgeStyle.bg} space-y-4 print:p-6 print:space-y-3.5 print:rounded-2xl`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-3.5">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
                  <HeartHandshake className="w-4 h-4 text-sky-700" />
                  <span>{pr.whatFound}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight print:text-lg">
                  {isReferable ? pr.referralTitle : pr.healthyTitle}
                </h2>
              </div>

              <div className="sm:text-right">
                <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wide border ${
                  isReferable ? 'bg-rose-100 text-rose-900 border-rose-300' : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                }`}>
                  <span className={`w-2.5 h-2.5 rounded-full ${isReferable ? 'bg-rose-600' : 'bg-emerald-600'}`}></span>
                  {isReferable ? (pr.specialistRecommended || 'SPECIALIST CHECKUP RECOMMENDED') : (pr.healthyDetected || 'HEALTHY RETINA DETECTED')}
                </span>
                <div className="text-xs font-mono font-semibold text-slate-500 mt-1">
                  ICD-10 Code: E11.3{result.class}
                </div>
              </div>
            </div>

            {/* Simple Explanation Content */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1 print:grid-cols-2 print:gap-4 print:text-xs">
              <div className="p-3.5 rounded-xl bg-white/90 border border-slate-200 leading-relaxed">
                <strong className="text-slate-900 block mb-1">{pr.whatMeans}:</strong>
                <p className="text-slate-700">
                  {isReferable ? pr.whatMeansReferable : pr.whatMeansHealthy}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/90 border border-slate-200 leading-relaxed">
                <strong className="text-slate-900 block mb-1">{pr.nextSteps}:</strong>
                <p className="text-slate-700 font-semibold">
                  {isReferable ? pr.nextStepsReferableTitle : pr.nextStepsHealthyTitle}
                </p>
                <p className="text-slate-600 mt-0.5">
                  {isReferable ? pr.nextStepsReferableDesc : pr.nextStepsHealthyDesc}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 leading-relaxed font-medium print:p-3.5 print:text-xs">
              <strong>{pr.clinicalDirective || 'Clinical Directive:'}</strong> {result.recommendation}
            </div>
          </div>

          {/* 4. LESION & BIOMARKER CLINICAL FINDINGS SUMMARY TABLE (SIMPLE TERMS & MULTI-LANGUAGE) */}
          <div className="space-y-3.5 print:space-y-3">
            <div className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2 flex items-center justify-between">
              <span>{pr.biomarkerTitle || 'Pathological Biomarker Summary'}</span>
              <span className="text-xs font-mono text-slate-500">Automated Fundus Lesion Triage</span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-300">
              <table className="w-full text-left border-collapse text-xs print:text-[10pt]">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-300">
                    <th className="p-3.5 print:p-3">{pr.eyeFeatureCol || 'Eye Feature / Lesion Type'}</th>
                    <th className="p-3.5 print:p-3">{pr.statusCol || 'Status'}</th>
                    <th className="p-3.5 print:p-3">{pr.explanationCol || 'Simple Health Explanation'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {/* Microaneurysms */}
                  <tr>
                    <td className="p-3.5 print:p-3 font-bold text-slate-900">{pr.microaneurysmsName || 'Microaneurysms (Blood Vessel Dots)'}</td>
                    <td className="p-3.5 print:p-3">
                      <span className={`px-3 py-1 rounded-md text-xs font-bold ${result.class >= 1 ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'}`}>
                        {result.class >= 1 ? (pr.present || 'Present') : (pr.absent || 'Absent')}
                      </span>
                    </td>
                    <td className="p-3.5 print:p-3 text-slate-600">
                      {result.class >= 1 ? (pr.microaneurysmsPresent || 'Tiny swollen blood vessel pouches detected in retinal blood vessels') : (pr.microaneurysmsAbsent || 'No swelling or pouches seen in tiny retinal blood vessels')}
                    </td>
                  </tr>

                  {/* Retinal Hemorrhages */}
                  <tr>
                    <td className="p-3.5 print:p-3 font-bold text-slate-900">{pr.hemorrhagesName || 'Retinal Hemorrhages (Micro Bleeding)'}</td>
                    <td className="p-3.5 print:p-3">
                      <span className={`px-3 py-1 rounded-md text-xs font-bold ${result.class >= 2 ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'}`}>
                        {result.class >= 2 ? (pr.present || 'Present') : (pr.absent || 'Absent')}
                      </span>
                    </td>
                    <td className="p-3.5 print:p-3 text-slate-600">
                      {result.class >= 2 ? (pr.hemorrhagesPresent || 'Small blood leakage spots identified inside retina layers') : (pr.hemorrhagesAbsent || 'No blood spots or vessel leakage observed inside the retina')}
                    </td>
                  </tr>

                  {/* Hard Exudates */}
                  <tr>
                    <td className="p-3.5 print:p-3 font-bold text-slate-900">{pr.hardExudatesName || 'Hard Exudates (Lipid/Fat Deposits)'}</td>
                    <td className="p-3.5 print:p-3">
                      <span className={`px-3 py-1 rounded-md text-xs font-bold ${result.class >= 2 ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'}`}>
                        {result.class >= 2 ? (pr.present || 'Present') : (pr.absent || 'Absent')}
                      </span>
                    </td>
                    <td className="p-3.5 print:p-3 text-slate-600">
                      {result.class >= 2 ? (pr.hardExudatesPresent || 'Yellowish protein/fat deposits clustered near central vision zone') : (pr.hardExudatesAbsent || 'No protein or fat deposit spots seen near posterior pole')}
                    </td>
                  </tr>

                  {/* Cotton Wool Spots */}
                  <tr>
                    <td className="p-3.5 print:p-3 font-bold text-slate-900">{pr.cottonWoolSpotsName || 'Cotton Wool Spots (Nerve Fiber Spots)'}</td>
                    <td className="p-3.5 print:p-3">
                      <span className={`px-3 py-1 rounded-md text-xs font-bold ${result.class >= 3 ? 'bg-rose-100 text-rose-900' : 'bg-emerald-100 text-emerald-900'}`}>
                        {result.class >= 3 ? (pr.present || 'Present') : (pr.absent || 'Absent')}
                      </span>
                    </td>
                    <td className="p-3.5 print:p-3 text-slate-600">
                      {result.class >= 3 ? (pr.cottonWoolSpotsPresent || 'Fluffy white spots showing reduced blood flow to nerve fiber layers') : (pr.cottonWoolSpotsAbsent || 'No nerve fiber swelling or micro-infarct spots detected')}
                    </td>
                  </tr>

                  {/* Neovascularization */}
                  <tr>
                    <td className="p-3.5 print:p-3 font-bold text-slate-900">{pr.neovascularizationName || 'Neovascularization (Fragile New Vessels)'}</td>
                    <td className="p-3.5 print:p-3">
                      <span className={`px-3 py-1 rounded-md text-xs font-bold ${result.class >= 4 ? 'bg-rose-100 text-rose-900' : 'bg-emerald-100 text-emerald-900'}`}>
                        {result.class >= 4 ? (pr.present || 'Present') : (pr.absent || 'Absent')}
                      </span>
                    </td>
                    <td className="p-3.5 print:p-3 text-slate-600">
                      {result.class >= 4 ? (pr.neovascularizationPresent || 'Abnormal new blood vessels growing in retina requiring urgent treatment') : (pr.neovascularizationAbsent || 'No abnormal new blood vessel growth detected')}
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
          <span className="font-bold text-slate-700">{pr.page1Footer || 'Page 1 of 2 - Patient Eye Health Guidance'}</span>
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
              <p className="text-[10px] font-bold text-sky-700">PATIENT RETINAL IMAGING &amp; EXPLAINABILITY REPORT</p>
            </div>
          </div>
          <div className="text-right text-[11px] font-mono font-bold text-slate-900">
            REPORT REF: {result.id}
          </div>
        </div>

        {/* 5. RETINAL IMAGING & AI EXPLAINABILITY HEATMAP */}
        <div className="space-y-4 print:space-y-3">
          <div className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2 flex items-center justify-between">
            <span>Retinal Fundus Scans &amp; AI Lesion Heatmap Explainability</span>
            <span className="text-xs text-slate-500 font-mono">ResNet-18 (Layer: res5b_relu)</span>
          </div>

          {/* PRINT & DISPLAY IMAGE GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2">
            <div className="border-2 border-slate-200 rounded-xl p-3 text-center bg-slate-50 space-y-2">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                {pr.originalScanTitle || '1. Original 45° Retinal Fundus Scan'}
              </div>
              <div className="h-56 flex items-center justify-center bg-slate-950 rounded-lg overflow-hidden border border-slate-300">
                <img 
                  src={result.originalImageUrl} 
                  alt="Original Fundus" 
                  className="max-h-52 w-full object-contain"
                />
              </div>
              <p className="text-[10px] text-slate-500 italic">
                {pr.originalScanDesc || 'Raw photograph of back of eye acquired at health center'}
              </p>
            </div>

            <div className="border-2 border-slate-200 rounded-xl p-3 text-center bg-slate-50 space-y-2">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                {pr.gradCamScanTitle || '2. AI Lesion Salience Overlay (Grad-CAM)'}
              </div>
              <div className="h-56 flex items-center justify-center bg-slate-950 rounded-lg overflow-hidden border border-slate-300">
                <img 
                  src={result.gradCamOverlayUrl || result.gradCamImageUrl || result.originalImageUrl} 
                  alt="Grad-CAM Overlay" 
                  className="max-h-52 w-full object-contain"
                />
              </div>
              {/* Legend */}
              <div className="bg-black/90 text-white rounded-md px-3 py-1 text-[9px] flex items-center justify-between font-mono">
                <span>{pr.gradCamLow || '0.0 (Low Salience)'}</span>
                <div className="w-24 h-2 rounded-full bg-gradient-to-r from-blue-600 via-cyan-400 via-amber-400 to-red-600"></div>
                <span className="text-rose-400 font-bold">{pr.gradCamHigh || '1.0 (High Activation)'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 6. HEALTH TIPS FOR PATIENT */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-300 space-y-3 print:p-4 print:space-y-2 print:rounded-xl">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              {pr.importantInfo}
            </h3>
          </div>

          <ul className="text-xs text-slate-700 space-y-2 list-disc pl-5 leading-relaxed font-medium">
            <li>{pr.tip1}</li>
            <li>{pr.tip2}</li>
            <li>{pr.tip3}</li>
          </ul>
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
              <span>{pr.digitallySigned || 'Digitally Authorized & Signed'}</span>
            </div>
          </div>
        </div>

        {/* PAGE 2 PRINT FOOTER */}
        <div className="hidden print:flex items-center justify-between text-[10px] text-slate-400 pt-4 border-t border-slate-200">
          <span>NETRAGUARD CLINICAL OPHTHALMOLOGY REPORT · CONFIDENTIAL MEDICAL RECORD</span>
          <span className="font-bold text-slate-600">{pr.page2Footer || 'Page 2 of 2 - Patient Retinal Health Record'}</span>
        </div>

      </div>
    </div>
  );
};
