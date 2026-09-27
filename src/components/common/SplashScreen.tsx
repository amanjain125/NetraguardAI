import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import logoImg from '../../assets/logo.jpeg';

interface Props {
  onComplete: () => void;
}

export const SplashScreen: React.FC<Props> = ({ onComplete }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Elegant 1.8s splash, then fade out and transition to login
    const timer = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => {
        onComplete();
      }, 350);
    }, 1800);

    return () => clearTimeout(timer);
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

      {/* Center Splash Container: Only Logo and Name */}
      <div className="relative z-10 flex flex-col items-center max-w-md px-6 text-center animate-in zoom-in-95 fade-in duration-700">
        
        {/* Pulsing Outer Rings & Logo Frame */}
        <div className="relative mb-6">
          <div className="absolute -inset-4 rounded-full bg-sky-400/20 blur-xl animate-pulse"></div>
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500 opacity-60 animate-spin [animation-duration:8s]"></div>
          
          {/* Circular Retinal Frame with Official Logo */}
          <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden p-1.5 bg-white border-2 border-sky-400/80 shadow-2xl shadow-sky-500/20">
            <img
              src={logoImg}
              alt="NETRAGUARD AI Logo"
              className="w-full h-full object-cover rounded-full select-none"
            />
            {/* Subtle sweeping scanline */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-sky-400/20 to-transparent h-1/3 w-full animate-bounce [animation-duration:1.8s] pointer-events-none"></div>
          </div>
        </div>

        {/* Brand Name Only */}
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 font-sans">
          NETRA<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-sky-500 to-blue-600">GUARD</span> <span className="text-xs px-2 py-0.5 rounded font-mono bg-sky-100 border border-sky-300 text-sky-800 align-middle">AI</span>
        </h1>
      </div>
    </div>
  );
};
