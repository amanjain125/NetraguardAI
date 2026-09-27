import React, { useEffect, useState } from 'react';
import { ArrowRight, ShieldCheck, Sparkles, Activity } from 'lucide-react';
import logoImg from '../../assets/logo.jpeg';

interface Props {
  onComplete: () => void;
}

export const SplashScreen: React.FC<Props> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing Diagnostic Core...');
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 2200; // 2.2 seconds total splash

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      if (pct < 35) {
        setStatusText('Calibrating Retinal Scan Resolution...');
      } else if (pct < 70) {
        setStatusText('Loading Trained ResNet-18 (res5b_relu) Model...');
      } else if (pct < 95) {
        setStatusText('Securing Doctor Clinical Workspace...');
      } else {
        setStatusText('Welcome to NETRAGUARD AI');
      }

      if (pct >= 100) {
        clearInterval(interval);
        setIsFadingOut(true);
        setTimeout(() => {
          onComplete();
        }, 350);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [onComplete]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 200);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-900 overflow-hidden transition-opacity duration-300 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background ambient lighting matching home page */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-sky-200/50 rounded-full blur-3xl pointer-events-none animate-pulse-subtle"></div>
      <div className="absolute -top-20 left-10 w-96 h-96 bg-cyan-100/50 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-100/60 rounded-full blur-3xl pointer-events-none"></div>

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0284c712_1px,transparent_1px),linear-gradient(to_bottom,#0284c712_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

      {/* Skip Button in Top Right */}
      <button
        type="button"
        onClick={handleSkip}
        className="absolute top-6 right-6 flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/90 hover:bg-white text-xs font-semibold text-slate-700 hover:text-slate-950 backdrop-blur-md border border-slate-200 shadow-xs transition-all cursor-pointer z-10 active:scale-95"
      >
        <span>Skip</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>

      {/* Center Splash Container */}
      <div className="relative z-10 flex flex-col items-center max-w-md px-6 text-center animate-in zoom-in-95 fade-in duration-700">
        
        {/* Pulsing Outer Rings */}
        <div className="relative mb-8">
          <div className="absolute -inset-4 rounded-full bg-sky-400/20 blur-xl animate-pulse"></div>
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500 opacity-60 animate-spin [animation-duration:8s]"></div>
          
          {/* Circular Retinal Frame with User's Logo */}
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden p-1.5 bg-white border-2 border-sky-400/80 shadow-2xl shadow-sky-500/20">
            <img
              src={logoImg}
              alt="NETRAGUARD AI Logo"
              className="w-full h-full object-cover rounded-full select-none"
            />
            {/* High-tech sweeping scanline */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-sky-400/25 to-transparent h-1/3 w-full animate-bounce [animation-duration:1.8s] pointer-events-none"></div>
          </div>

          {/* Floating Live AI Indicator Badge */}
          <div className="absolute -bottom-2 -right-2 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-sky-300 text-[10px] font-mono text-sky-700 font-bold shadow-md">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping"></span>
            <span>AI CORE</span>
          </div>
        </div>

        {/* Wordmark Title */}
        <div className="space-y-2 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100/90 border border-sky-200 text-sky-800 text-xs font-semibold uppercase tracking-widest shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>Official Clinical Suite</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 font-sans">
            NETRA<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-sky-500 to-blue-600">GUARD</span> <span className="text-xs px-2 py-0.5 rounded font-mono bg-sky-100 border border-sky-300 text-sky-800 align-middle">AI</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 max-w-sm font-medium leading-relaxed">
            Autonomous Diabetic Retinopathy Diagnostic &amp; Explainable Screening Platform
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-xs space-y-2">
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden border border-slate-300/80 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-500 transition-all duration-100 ease-out shadow-[0_0_10px_rgba(2,132,199,0.5)]"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-600">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-sky-600 animate-pulse" />
              <span>{statusText}</span>
            </span>
            <span className="text-sky-700 font-bold">{progress}%</span>
          </div>
        </div>

        {/* Clinical Accreditation Subtext */}
        <div className="mt-8 flex items-center gap-4 text-[11px] text-slate-500 font-medium">
          <span className="flex items-center gap-1 text-slate-600">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>HIPAA-Compliant</span>
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
          <span>ResNet-18 Verified</span>
          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
          <span>Grad-CAM / CAM</span>
        </div>
      </div>
    </div>
  );
};
