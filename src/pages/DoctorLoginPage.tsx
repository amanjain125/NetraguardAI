import React, { useState } from 'react';
import { 
  Stethoscope, 
  Lock, 
  Mail, 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Eye, 
  EyeOff, 
  UserCheck 
} from 'lucide-react';
import logoImg from '../assets/logo.jpeg';
import type { DoctorProfile } from '../types/auth';
import { DEMO_DOCTORS } from '../types/auth';

interface Props {
  onLoginSuccess: (doctor: DoctorProfile) => void;
  onReplaySplash?: () => void;
}

export const DoctorLoginPage: React.FC<Props> = ({ onLoginSuccess, onReplaySplash }) => {
  const [email, setEmail] = useState('dr.kalyani@netraguard.ai');
  const [password, setPassword] = useState('clinical-secure-2026');
  const [department, setDepartment] = useState('Vitreoretinal & Diabetic Clinic');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both Doctor ID/Email and password.');
      return;
    }

    setIsLoading(true);

    // Simulate verified medical authentication check
    setTimeout(() => {
      setIsLoading(false);
      // Find matching demo doctor or create clinical session
      const matched = DEMO_DOCTORS.find((d) => d.email.toLowerCase() === email.toLowerCase()) || {
        id: `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
        name: email.split('@')[0].replace('dr.', 'Dr. ').replace('.', ' ').toUpperCase(),
        email: email,
        role: 'Consultant Ophthalmologist',
        specialty: 'Diabetic Retinopathy Screening',
        hospital: 'District Hospital & Rural Health Network',
        registrationNumber: 'MED-2026-ACTIVE',
      };

      onLoginSuccess(matched);
    }, 600);
  };

  const handleQuickLogin = (doctor: DoctorProfile) => {
    setEmail(doctor.email);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(doctor);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden text-slate-100">
      {/* Background radial glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_60%_60%_at_50%_0%,rgba(14,165,233,0.18),transparent)] pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Replay Splash button */}
      {onReplaySplash && (
        <button
          type="button"
          onClick={onReplaySplash}
          className="absolute top-6 right-6 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-xs text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span>Replay Splash</span>
        </button>
      )}

      {/* Header with Logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4 relative z-10">
        <div className="inline-flex relative mb-4 group">
          <div className="absolute -inset-2 rounded-full bg-sky-500/20 blur-md group-hover:bg-sky-500/30 transition-all"></div>
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-slate-950 border-2 border-sky-400/80 shadow-xl overflow-hidden mx-auto">
            <img
              src={logoImg}
              alt="NETRAGUARD Logo"
              className="w-full h-full object-cover rounded-full select-none"
            />
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          NETRA<span className="text-sky-400">GUARD</span> <span className="text-xs px-2 py-0.5 rounded font-mono bg-sky-950 border border-sky-400/40 text-sky-300 align-middle">AI</span>
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-400 font-medium">
          Physician &amp; Ophthalmologist Clinical Portal
        </p>
      </div>

      {/* Main Login Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg px-4 relative z-10">
        <div className="bg-slate-950/90 border border-slate-800 shadow-2xl rounded-2xl p-6 sm:p-8 backdrop-blur-xl space-y-6">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-sky-950 text-sky-400 border border-sky-800/50">
                <Stethoscope className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Doctor Sign In</h3>
                <p className="text-[11px] text-slate-400">Authenticate to review AI screenings &amp; Grad-CAM/CAM maps</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Secure Session
            </span>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-4">
            {/* Doctor Email / License ID */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Doctor ID / Hospital Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. dr.kalyani@netraguard.ai"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
                <span className="text-[11px] text-sky-400 hover:underline cursor-pointer">
                  Forgot Password?
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter medical credentials password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Department / Unit */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Clinical Department / Screening Center
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                >
                  <option value="Vitreoretinal & Diabetic Clinic">Vitreoretinal &amp; Diabetic Retinopathy Clinic</option>
                  <option value="Ophthalmology Outpatient Department">Ophthalmology Outpatient Department (OPD)</option>
                  <option value="Rural Health Tele-Screening Unit">Rural Health Tele-Screening Unit (District KA-04)</option>
                  <option value="Surgical Retina & Vitreous Division">Surgical Retina &amp; Vitreous Division</option>
                </select>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded bg-slate-900 border-slate-700 text-sky-600 focus:ring-sky-500/20"
                />
                <span>Remember this clinical workstation</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-600/30 transition-all cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Sign In as Doctor</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Doctor Logins (1-Click) */}
          <div className="pt-4 border-t border-slate-800/90 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              1-Click Demo Doctor Logins:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DEMO_DOCTORS.map((doc) => (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => handleQuickLogin(doc)}
                  className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800/90 border border-slate-800 hover:border-sky-500/50 text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-sky-300">
                      {doc.name}
                    </span>
                    <span className="text-[10px] font-mono text-sky-400 bg-sky-950 px-1.5 py-0.5 rounded border border-sky-800/50">
                      {doc.role.split(' ')[0]}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-0.5 truncate">
                    {doc.specialty}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
                    {doc.hospital.split('&')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Clinical Accreditation Subtext */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-center gap-4 text-[10px] text-slate-400">
            <span className="flex items-center gap-1 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>HIPAA Compliant</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
              <span>EHR / PACS Integrated</span>
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};
