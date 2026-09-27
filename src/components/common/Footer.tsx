import type { PageRoute } from './Navbar';
import { ShieldCheck, Heart, Sparkles, ExternalLink } from 'lucide-react';

interface Props {
  onNavigate: (page: PageRoute) => void;
}

export const Footer: React.FC<Props> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand & Purpose Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-sky-600 text-white">
                <svg className="w-5 h-5 stroke-white fill-none stroke-[2]" viewBox="0 0 24 24">
                  <path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6Z" />
                  <circle cx="12" cy="12" r="3" fill="currentColor" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                NETRA<span className="text-sky-400">GUARD</span> AI
              </span>
            </div>
            
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Technology designed to support earlier, more explainable retinal screening.
              Bridging the specialist divide for underserved communities and primary healthcare centers across India.
            </p>

            <div className="flex items-center gap-2 text-xs text-sky-400 pt-2 font-mono">
              <Sparkles className="w-4 h-4" />
              <span>SIH 2026 Innovation Demonstration Prototype</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">
              Platform Navigation
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <button 
                  onClick={() => onNavigate('home')}
                  className="hover:text-white transition-colors"
                >
                  Home Overview
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('screening')}
                  className="hover:text-white transition-colors"
                >
                  Fundus Screening Portal
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('dashboard')}
                  className="hover:text-white transition-colors"
                >
                  Doctor Clinical Review
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('history')}
                  className="hover:text-white transition-colors"
                >
                  Screening Records & History
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('how-it-works')}
                  className="hover:text-white transition-colors"
                >
                  How Pipeline Works
                </button>
              </li>
            </ul>
          </div>

          {/* Clinical & MATLAB Pipeline Notes */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">
              AI Pipeline Architecture
            </h4>
            <div className="space-y-2 text-xs text-slate-400 leading-relaxed">
              <p>
                <strong className="text-slate-300">Model:</strong> ResNet-18 Deep Feature Extraction
              </p>
              <p>
                <strong className="text-slate-300">Explainability:</strong> Grad-CAM Class Activation Maps
              </p>
              <p>
                <strong className="text-slate-300">Target Pipeline:</strong> MATLAB Image Processing Toolbox via REST API Gateway
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-800 text-sky-300 text-[11px] font-mono border border-slate-700">
                  <ExternalLink className="w-3 h-3" />
                  API Endpoint: POST /api/screen
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Medical Safety Disclaimer Strip */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Medical Safety Notice:</strong> NETRAGUARD AI is an assistive decision-support platform. It does not replace professional diagnostic judgment by a licensed medical practitioner.
              </span>
            </div>
            <div className="flex items-center gap-1 text-slate-500">
              <span>Developed with</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>for rural healthcare impact</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
