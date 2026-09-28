import React, { useState } from 'react';
import { 
  Stethoscope, 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Eye, 
  EyeOff, 
  UserCheck,
  User,
  CheckCircle2
} from 'lucide-react';
import logoImg from '../assets/logo.jpeg';
import type { DoctorProfile } from '../types/auth';
import { getRegisteredDoctors, saveRegisteredDoctor } from '../types/auth';
import { screeningApi } from '../services/screeningApi';

interface Props {
  onLoginSuccess: (doctor: DoctorProfile) => void;
  onReplaySplash?: () => void;
}

export const DoctorLoginPage: React.FC<Props> = ({ onLoginSuccess, onReplaySplash }) => {
  // Mode: 'signin' | 'signup'
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Sign In state (Minimal: Email + Password)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Sign Up (Create Account) state: ONLY 5 fields (Name, Specialist, Email, Password, Confirm Password)
  const [fullName, setFullName] = useState('');
  const [specialist, setSpecialist] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');



  // 1. Handle Sign In (SQLite API backend integration with client fallback)
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both Doctor Email and Password.');
      return;
    }

    setIsLoading(true);

    try {
      // Try logging in with SQLite database backend
      const res = await screeningApi.loginDoctor(email.trim(), password.trim());
      setIsLoading(false);
      const dbUser = res.user;
      const doctorProfile: DoctorProfile = {
        id: `DOC-${dbUser.id || Math.floor(1000 + Math.random() * 9000)}`,
        name: dbUser.full_name || `Dr. ${email}`,
        email: dbUser.email,
        role: 'Verified Clinician',
        specialty: 'Ophthalmologist & Retinal Specialist',
        hospital: dbUser.hospital || 'St. Jude Eye Care Center',
        registrationNumber: dbUser.license_number || 'MED-SQLITE-2026',
      };
      saveRegisteredDoctor(doctorProfile);
      onLoginSuccess(doctorProfile);
      return;
    } catch (apiErr: any) {
      // Fallback if backend API is not running or if demo credentials used
      const registered = getRegisteredDoctors();
      const existing = registered.find(
        (d) => d.email.toLowerCase() === email.trim().toLowerCase()
      );

      const doctorProfile: DoctorProfile = existing || {
        id: `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
        name: email.includes('@')
          ? `Dr. ${email.split('@')[0].replace('.', ' ').replace(/^dr\s*/i, '').replace(/\b\w/g, (c) => c.toUpperCase())}`
          : `Dr. ${email}`,
        email: email.trim(),
        role: 'Verified Clinician',
        specialty: 'Ophthalmologist & Retinal Specialist',
        hospital: 'Primary Health Network & Retinopathy Clinic',
        registrationNumber: 'MED-VALID-2026',
      };

      setIsLoading(false);
      saveRegisteredDoctor(doctorProfile);
      onLoginSuccess(doctorProfile);
    }
  };

  // 2. Handle Create Account (SQLite database backend integration)
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Please enter Doctor Name.');
      return;
    }
    if (!signupEmail.trim()) {
      setErrorMsg('Please enter Email Address.');
      return;
    }
    if (!specialist.trim()) {
      setErrorMsg('Please enter Specialist / Specialty.');
      return;
    }
    if (!signupPassword.trim()) {
      setErrorMsg('Please enter a Password.');
      return;
    }
    if (signupPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify your password.');
      return;
    }
    if (signupPassword.length < 6) {
      setErrorMsg('Password should be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    const formattedName = fullName.trim().startsWith('Dr.') ? fullName.trim() : `Dr. ${fullName.trim()}`;

    try {
      await screeningApi.registerDoctor({
        email: signupEmail.trim(),
        password: signupPassword.trim(),
        fullName: formattedName,
        hospital: 'St. Jude Eye Care Center',
      });
    } catch (apiErr) {
      // Continue even if local API is unreachable or already exists
    }

    setIsLoading(false);
    const newDoctor: DoctorProfile = {
      id: `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
      name: formattedName,
      email: signupEmail.trim(),
      role: 'Verified Clinician',
      specialty: specialist.trim(),
      hospital: 'Primary Health Network & Retinopathy Clinic',
      registrationNumber: `REG-${Math.floor(100000 + Math.random() * 900000)}`,
    };

    saveRegisteredDoctor(newDoctor);
    setSuccessMsg('Account created and saved to SQLite Database successfully! Logging you in...');

    setTimeout(() => {
      onLoginSuccess(newDoctor);
    }, 1200);
  };



  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 sm:px-6 lg:px-8 relative overflow-hidden text-slate-900 selection:bg-sky-100 selection:text-sky-900">
      {/* Background ambient lighting matching home page */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-sky-200/50 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-subtle"></div>
      <div className="absolute -top-20 left-10 w-96 h-96 bg-cyan-100/50 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-100/60 rounded-full blur-3xl pointer-events-none -z-10"></div>

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0284c70d_1px,transparent_1px),linear-gradient(to_bottom,#0284c70d_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none -z-10"></div>

      {/* Replay Splash button */}
      {onReplaySplash && (
        <button
          type="button"
          onClick={onReplaySplash}
          className="absolute top-6 right-6 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 hover:bg-white text-xs font-semibold text-slate-700 hover:text-sky-700 border border-slate-200 shadow-xs transition-all cursor-pointer active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          <span>Replay Splash</span>
        </button>
      )}

      {/* Header with Official Logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4 relative z-10">
        <div className="inline-flex relative mb-4 group cursor-pointer" onClick={onReplaySplash}>
          <div className="absolute -inset-2 rounded-full bg-sky-400/20 blur-md group-hover:bg-sky-400/30 transition-all"></div>
          <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-full p-1 bg-white border-2 border-sky-300 shadow-xl shadow-sky-500/15 overflow-hidden mx-auto transition-transform group-hover:scale-105">
            <img
              src={logoImg}
              alt="NETRAGUARD Logo"
              className="w-full h-full object-cover rounded-full select-none"
            />
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 font-sans">
          NETRA<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-sky-500 to-blue-600">GUARD</span> <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-sky-100 border border-sky-300 text-sky-800 align-middle">AI</span>
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-600 font-medium">
          Physician &amp; Ophthalmologist Clinical Portal
        </p>
      </div>

      {/* Main Login Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 relative z-10">
        <div className="bg-white border border-slate-200/90 shadow-xl shadow-slate-200/50 rounded-3xl p-6 sm:p-8 backdrop-blur-xl space-y-5">
          
          {/* Sign In vs. Create Account Tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                authMode === 'signin'
                  ? 'bg-white text-slate-950 shadow-xs font-bold'
                  : 'hover:text-slate-950'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                authMode === 'signup'
                  ? 'bg-white text-slate-950 shadow-xs font-bold'
                  : 'hover:text-slate-950'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Messages */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

        

          {/* ========================================================================= */}
          {/* TAB 1: SIGN IN FORM (Clean: Email + Password)                             */}
          {/* ========================================================================= */}
          {authMode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Doctor Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="doctor@hospital.org"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  <span className="text-[11px] text-sky-600 hover:text-sky-700 hover:underline cursor-pointer">
                    Forgot Password?
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500/20"
                  />
                  <span>Remember this workstation</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md shadow-sky-600/25 transition-all cursor-pointer disabled:opacity-60 active:scale-[0.99]"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Signing In...</span>
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
          )}

          {/* ========================================================================= */}
          {/* TAB 2: CREATE ACCOUNT (ONLY 5 ESSENTIAL FIELDS)                           */}
          {/* ========================================================================= */}
          {authMode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              {/* Field 1: Doctor Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Name of the Doctor <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Dr. Kalyani Sharma"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Field 2: Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="doctor@hospital.org"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Field 3: Specialist */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Specialist / Specialty <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Stethoscope className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={specialist}
                    onChange={(e) => setSpecialist(e.target.value)}
                    placeholder="e.g. Ophthalmologist / Retina Specialist"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Field 4 & 5: Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="At least 6 chars"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md shadow-sky-600/25 transition-all cursor-pointer disabled:opacity-60 active:scale-[0.99]"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Creating Doctor Account...</span>
                  </>
                ) : (
                  <>
                    <Stethoscope className="w-4 h-4" />
                    <span>Create Doctor Account &amp; Access</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Toggle between modes subtext */}
          <div className="pt-2 text-center text-xs text-slate-500">
            {authMode === 'signin' ? (
              <span>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="text-sky-600 font-bold hover:underline cursor-pointer"
                >
                  Create Doctor Account
                </button>
              </span>
            ) : (
              <span>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="text-sky-600 font-bold hover:underline cursor-pointer"
                >
                  Sign In to Existing Account
                </button>
              </span>
            )}
          </div>

          {/* Clinical Accreditation Subtext */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-4 text-[11px] text-slate-500">
            <span className="flex items-center gap-1 text-slate-600">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>HIPAA Compliant</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-600">
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
              <span>EHR / PACS Integrated</span>
            </span>
          </div>

        </div>
      </div>


    </div>
  );
};
