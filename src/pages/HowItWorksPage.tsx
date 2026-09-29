import React from 'react';
import type { PageRoute } from '../components/common/Navbar';
import { 
  HelpCircle, 
  Layers, 
  Cpu, 
  HeartHandshake, 
  ArrowRight, 
  ShieldAlert, 
  Network, 
  Code2, 
  Server
} from 'lucide-react';

interface Props {
  onNavigate: (page: PageRoute) => void;
}

export const HowItWorksPage: React.FC<Props> = ({ onNavigate }) => {

  const pipelineStages = [
    {
      title: 'Fundus Image Acquisition',
      desc: 'Standard 45° macula-centered or disc-centered retinal photography captured by a non-mydriatic tabletop or portable fundus camera.',
      tag: 'Hardware Input',
    },
    {
      title: 'Quality Assessment',
      desc: 'Automated evaluation of illumination uniformity, focus sharpness, and optic disc/fovea field visibility before deep neural inference.',
      tag: 'Pre-flight Check',
    },
    {
      title: 'Lesion-Aware Preprocessing',
      desc: 'Color normalization, contrast enhancement (CLAHE), and standardization to 224×224 tensor input for network stability.',
      tag: 'Image Processing',
    },
    {
      title: 'ResNet-18 Deep Feature Extraction',
      desc: 'Residual Convolutional Neural Network extracts hierarchical vascular representations, microaneurysm footprints, and hard exudates.',
      tag: 'Deep Learning',
    },
    {
      title: 'DR Multi-Class Classification',
      desc: 'Softmax probability distribution across ICDR 5 grades (No DR, Mild, Moderate, Severe, Proliferative).',
      tag: 'Classification',
    },
    {
      title: 'Grad-CAM Explainability Generation',
      desc: 'Computes gradients of the target class score with respect to layer 4 feature maps, producing localization heatmaps.',
      tag: 'Explainable AI',
    },
    {
      title: 'Referral Triage Logic',
      desc: 'Stratifies cases into urgent ophthalmic referral (Moderate/Severe/PDR) vs. routine community monitoring (No DR/Mild).',
      tag: 'Clinical Decision Support',
    },
    {
      title: 'Multilingual Patient Guidance',
      desc: 'Transforms technical findings into compassionate, easily understandable language in English, Hindi, Kannada, and regional tongues.',
      tag: 'Human-Centered Care',
    },
  ];

  const techStack = [
    {
      name: 'MATLAB',
      badge: 'Core AI Engine',
      description: 'Used for neural network training, ResNet-18 residual feature extraction, and Grad-CAM mathematical formulation.',
      icon: Cpu,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      name: 'Deep Learning & ResNet-18',
      badge: 'Computer Vision',
      description: '18-layer residual architecture providing optimal convergence speed and high inference efficiency for edge deployment.',
      icon: Network,
      color: 'text-sky-600 bg-sky-50 border-sky-200',
    },
    {
      name: 'Grad-CAM',
      badge: 'Explainability (XAI)',
      description: 'Gradient-weighted Class Activation Mapping to eliminate "black-box" skepticism and ensure clinical auditability.',
      icon: Layers,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
    },
    {
      name: 'React & TypeScript',
      badge: 'Modern Frontend',
      description: 'High-performance component architecture, strict typing for medical data, and reactive multilingual state management.',
      icon: Code2,
      color: 'text-cyan-600 bg-cyan-50 border-cyan-200',
    },
    {
      name: 'Backend REST API',
      badge: 'Integration Bridge',
      description: 'Standardized POST /api/screen contracts connecting the browser client to the running MATLAB production engine.',
      icon: Server,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      name: 'Medical Decision Support',
      badge: 'Clinical Safety',
      description: 'Adherence to triage boundaries, image quality validation, and specialist escalation workflows.',
      icon: HeartHandshake,
      color: 'text-rose-600 bg-rose-50 border-rose-200',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Header */}
      <div className="text-left space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-semibold uppercase tracking-wider">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>System Architecture & Scientific Basis</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          How NETRAGUARD AI Works
        </h1>
        <p className="text-base text-slate-600 max-w-3xl leading-relaxed">
          Understanding the clinical rationale, deep learning methodology, and explainability mechanisms behind our diabetic retinopathy screening pipeline.
        </p>
      </div>

      {/* The Problem Section */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-xs space-y-6">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-600" />
          <h2 className="text-xl font-bold text-slate-900">
            The Clinical & Humanitarian Problem
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-slate-600 leading-relaxed">
          <div>
            <p className="mb-3">
              Over <strong>77 million adults in India</strong> live with diabetes mellitus, and up to 20% develop some degree of diabetic retinopathy (DR). In early stages, microvascular leakage and microaneurysms cause no symptoms whatsoever.
            </p>
            <p>
              By the time a patient notices blurred vision, progressive maculopathy or proliferative vitreous hemorrhages have already caused permanent visual impairment.
            </p>
          </div>
          <div>
            <p className="mb-3">
              India has fewer than <strong>25,000 ophthalmologists</strong>, with the vast majority concentrated in Tier-1 metropolitan centers. In rural Primary Health Centers (PHCs) and Community Health Centers (CHCs), access to trained vitreoretinal specialists is severely limited.
            </p>
            <p>
              NETRAGUARD AI acts as an intelligent decision-support filter, ensuring that patients requiring urgent laser photocoagulation or anti-VEGF therapy are detected and referred promptly.
            </p>
          </div>
        </div>
      </div>

      {/* The Technical Pipeline Visualization */}
      <div className="space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-700 font-mono">
            Step-by-Step Processing Flow
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">
            The Screening Pipeline
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            From raw photons in the clinic to actionable, explainable clinical guidance.
          </p>
        </div>

        <div className="relative border-l-2 border-sky-200 ml-4 sm:ml-6 pl-6 sm:pl-8 space-y-8">
          {pipelineStages.map((stage, idx) => (
            <div key={stage.title} className="relative group">
              {/* Timeline marker */}
              <div className="absolute -left-[35px] sm:-left-[43px] top-1 w-6 h-6 rounded-full bg-white border-2 border-sky-600 text-sky-600 flex items-center justify-center text-[10px] font-bold font-mono group-hover:bg-sky-600 group-hover:text-white transition-colors">
                {idx + 1}
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-sky-300 transition-all">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="text-sm font-bold text-slate-900">
                    {stage.title}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-100 text-slate-600 border border-slate-200">
                    {stage.tag}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {stage.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Technology Stack Grid */}
      <div className="space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-700 font-mono">
            Modular Engineering
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">
            System Technologies & Components
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Decoupled architecture combining MATLAB's scientific computing with web-scale accessibility.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {techStack.map((tech) => {
            const Icon = tech.icon;
            return (
              <div
                key={tech.name}
                className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl border ${tech.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {tech.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">
                  {tech.name}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {tech.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA to Screening */}
      <div className="p-8 rounded-3xl bg-sky-50 border border-sky-100 text-center space-y-4">
        <h3 className="text-lg font-bold text-slate-900">
          Ready to experience the screening workflow?
        </h3>
        <p className="text-xs text-slate-600 max-w-md mx-auto">
          Explore the fundus upload interface, inspect the Grad-CAM heatmap blend, and see patient-friendly summaries.
        </p>
        <button
          type="button"
          onClick={() => onNavigate('screening')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-md shadow-sky-600/20 transition-all"
        >
          <span>Launch Screening Portal</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
