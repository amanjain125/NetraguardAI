import React from 'react';
import type { PageRoute } from '../components/common/Navbar';
import { useLanguage } from '../hooks/useLanguage';
import { 
  ArrowRight, 
  ShieldCheck, 
  Layers, 
  Globe, 
  Heart, 
  Activity, 
  Eye, 
  Cpu, 
  Users, 
  Compass
} from 'lucide-react';
import { InteractiveGazeEye } from '../components/home/InteractiveGazeEye';

interface Props {
  onNavigate: (page: PageRoute) => void;
}

export const HomePage: React.FC<Props> = ({ onNavigate }) => {
  const { t } = useLanguage();

  return (
    <div className="bg-white text-slate-900 overflow-hidden space-y-24 pb-24">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION (PRECISION OPHTHALMOLOGY AESTHETIC)                      */}
      {/* ========================================================================= */}
      <section className="relative min-h-[640px] lg:min-h-[720px] flex items-center pt-8 sm:pt-14 pb-16 overflow-hidden">
        {/* Ambient Blue Glowing Background Orbs */}
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-sky-200/40 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-subtle"></div>
        <div className="absolute -top-20 left-10 w-96 h-96 bg-cyan-100/40 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-100/50 rounded-full blur-3xl pointer-events-none -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Headline, Subtitle, CTA */}
            <div className="lg:col-span-6 space-y-6 text-left z-10">
              {/* Eyebrow with horizontal bar */}
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-[2.5px] bg-sky-600 rounded-full"></span>
                <span className="text-[11px] sm:text-xs font-bold tracking-[0.2em] text-sky-700 uppercase font-sans">
                  PRECISION VISION HEALTHCARE
                </span>
              </div>

              {/* Large Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 tracking-tight leading-[1.08] font-sans">
                Precision<br />
                Intelligence for<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-sky-500 to-blue-600">
                  Ophthalmology
                </span>
              </h1>

              {/* Supporting Copy */}
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl font-normal">
                We stand at the intersection of deep learning, clinical practice, and rural healthcare triage—building the explainable AI ecosystem that advances the field of ophthalmic care and accessible diabetic retinopathy screening.
              </p>

              {/* Primary & Secondary Action CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('screening')}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 active:scale-98 text-white font-semibold text-sm shadow-lg shadow-sky-600/25 hover:shadow-sky-600/35 transition-all duration-200"
                >
                  <span>Schedule a Demo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('how-it-works')}
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-200 shadow-xs hover:border-slate-300 transition-colors"
                >
                  <Compass className="w-4 h-4 text-slate-400" />
                  <span>Explore Architecture</span>
                </button>
              </div>

              {/* Trust signals */}
              <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center gap-6 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Clinical Decision Support</span>
                </div>
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-sky-600" />
                  <span>Grad-CAM Explainable AI</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-600" />
                  <span>Rural Community Triage</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Gaze-Tracking Eye + Orbital Rings + Floating Data Cards */}
            <div className="lg:col-span-6 relative">
              <InteractiveGazeEye />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. IMPACT SECTION: WHY ACCESSIBLE RETINAL SCREENING MATTERS              */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>Preventing Vision Loss in India</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
            {t.impact.heading}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
            {t.impact.subheading}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Early Detection */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:border-sky-200 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-sky-600 group-hover:text-white transition-all">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {t.impact.cards.earlyDetection.title}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t.impact.cards.earlyDetection.description}
            </p>
          </div>

          {/* Card 2: Explainable AI */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:border-cyan-200 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-cyan-600 group-hover:text-white transition-all">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {t.impact.cards.explainableAi.title}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t.impact.cards.explainableAi.description}
            </p>
          </div>

          {/* Card 3: Rural Accessibility */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {t.impact.cards.ruralAccessibility.title}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t.impact.cards.ruralAccessibility.description}
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. SIX-STAGE WORKFLOW PROCESS (HOW NETRAGUARD WORKS)                      */}
      {/* ========================================================================= */}
      <section className="bg-slate-50/70 py-20 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-100/70 px-3.5 py-1 rounded-full border border-sky-200">
              End-to-End Clinical Flow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight mt-3">
              {t.process.heading}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              {t.process.subheading}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.process.steps.map((step) => (
              <div
                key={step.number}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:border-sky-300 hover:shadow-md transition-all relative overflow-hidden"
              >
                <div className="text-3xl font-extrabold text-sky-200/90 font-mono mb-2">
                  {step.number}
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1.5">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <span className="inline-flex items-center gap-2 text-xs text-slate-500 font-mono bg-white px-4 py-2 rounded-full border border-slate-200 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Note: Explanatory UI flow. Live inference is executed by the connected MATLAB ResNet-18 pipeline.
            </span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. PLATFORM HIGHLIGHTS GRID                                              */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-sm">
          <div className="max-w-2xl mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-sky-50 text-sky-700 text-xs font-semibold uppercase tracking-wider mb-2">
              Platform Features
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
              Engineered for robust tele-ophthalmology in resource-constrained clinics
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2">
              Designed to support healthcare personnel across Primary Health Centers, Community Health Centers, and Vision Vans.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-white hover:shadow-md transition-all">
              <Cpu className="w-5 h-5 text-sky-600 mb-3" />
              <h4 className="text-sm font-bold text-slate-900 mb-1">AI-Assisted Screening</h4>
              <p className="text-xs text-slate-600">Standardized classification across International Clinical Diabetic Retinopathy (ICDR) scale grades.</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-white hover:shadow-md transition-all">
              <Layers className="w-5 h-5 text-cyan-600 mb-3" />
              <h4 className="text-sm font-bold text-slate-900 mb-1">Explainable Predictions</h4>
              <p className="text-xs text-slate-600">Grad-CAM heatmaps highlight microaneurysms, hemorrhages, and exudates directly on fundus landmarks.</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-white hover:shadow-md transition-all">
              <Activity className="w-5 h-5 text-emerald-600 mb-3" />
              <h4 className="text-sm font-bold text-slate-900 mb-1">Image Quality Awareness</h4>
              <p className="text-xs text-slate-600">Automated metrics for focus and illumination reduce ungradable referrals and unnecessary recalls.</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-white hover:shadow-md transition-all">
              <ShieldCheck className="w-5 h-5 text-purple-600 mb-3" />
              <h4 className="text-sm font-bold text-slate-900 mb-1">Referral Support</h4>
              <p className="text-xs text-slate-600">Stratifies patients into routine monitoring vs. priority ophthalmologist referral.</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-white hover:shadow-md transition-all">
              <Globe className="w-5 h-5 text-amber-600 mb-3" />
              <h4 className="text-sm font-bold text-slate-900 mb-1">Multilingual Patient Guidance</h4>
              <p className="text-xs text-slate-600">Accessible summaries translated into English, Hindi, and Kannada with clear vernacular explanations.</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-white hover:shadow-md transition-all">
              <Users className="w-5 h-5 text-rose-600 mb-3" />
              <h4 className="text-sm font-bold text-slate-900 mb-1">Telemedicine Workflow</h4>
              <p className="text-xs text-slate-600">Enables asynchronous doctor reviews, notes, and PDF generation from rural vision vans.</p>
            </div>
          </div>

          {/* Bottom Action Card */}
          <div className="mt-10 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-700 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-sky-600/20">
            <div>
              <h4 className="text-lg font-bold">Ready to test the screening portal?</h4>
              <p className="text-xs sm:text-sm text-sky-100 mt-0.5">Experience the fundus upload and explainability viewer interface.</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('screening')}
              className="px-6 py-3 rounded-xl bg-white text-sky-700 hover:bg-sky-50 text-xs font-bold shadow-md transition-colors shrink-0"
            >
              Launch Screening Portal →
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
