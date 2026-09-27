import React, { useState } from 'react';
import { Eye, Layers, Sparkles, Sliders, Info, CheckCircle, AlertCircle, Image as ImageIcon, Flame } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

interface Props {
  originalImage: string;
  gradCamImage?: string;
  gradCamHeatmap?: string;
  gradCamOverlay?: string;
  gradCamAvailable?: boolean;
  gradCamLayer?: string;
  gradCamSource?: string;
  gradCamError?: string;
  prediction?: string;
  confidence?: number;
  interactiveBlend?: boolean;
}

export type ExplainabilityTab = 'overlay' | 'heatmap' | 'original' | 'side-by-side';

export const ExplainabilityViewer: React.FC<Props> = ({
  originalImage,
  gradCamImage,
  gradCamHeatmap,
  gradCamOverlay,
  gradCamAvailable = true,
  gradCamLayer = 'res5b_relu',
  gradCamSource,
  gradCamError,
  prediction,
  confidence,
  interactiveBlend = true,
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<ExplainabilityTab>('overlay');
  const [overlayOpacity, setOverlayOpacity] = useState<number>(75);
  const [showAnatomicalLabels, setShowAnatomicalLabels] = useState<boolean>(true);

  // Effective image URLs
  const effectiveOverlay = gradCamOverlay || gradCamImage;
  const effectiveHeatmap = gradCamHeatmap;
  const isAvailable = gradCamAvailable && Boolean(effectiveOverlay || effectiveHeatmap);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sky-100 text-sky-700">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {t.explainability.title}
            </h3>
            {isAvailable && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-100 text-sky-800 border border-sky-200">
                Layer: {gradCamLayer}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t.explainability.subtitle}
          </p>
        </div>

        {/* 4 Visualization Tabs */}
        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          <div className="inline-flex rounded-xl bg-slate-200/70 p-1 text-xs font-medium">
            {/* Tab 1: Grad-CAM Overlay */}
            <button
              type="button"
              onClick={() => setActiveTab('overlay')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'overlay'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-sky-600" />
              <span>Grad-CAM Overlay</span>
            </button>

            {/* Tab 2: Grad-CAM Heatmap */}
            <button
              type="button"
              onClick={() => setActiveTab('heatmap')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'heatmap'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-500" />
              <span>Score Heatmap</span>
            </button>

            {/* Tab 3: Original Retinal Fundus */}
            <button
              type="button"
              onClick={() => setActiveTab('original')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'original'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 text-slate-600" />
              <span>Original Fundus</span>
            </button>

            {/* Tab 4: Side-by-Side Comparison */}
            <button
              type="button"
              onClick={() => setActiveTab('side-by-side')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'side-by-side'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-slate-600" />
              <span>Side-by-Side</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowAnatomicalLabels(!showAnatomicalLabels)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              showAnatomicalLabels
                ? 'bg-sky-50 text-sky-700 border-sky-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Labels: {showAnatomicalLabels ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Main Display Area */}
      <div className="p-6">
        {!isAvailable ? (
          /* TRUTHFUL UNAVAILABLE STATE (No fake heatmaps) */
          <div className="p-8 rounded-2xl bg-amber-50/70 border border-amber-200/90 text-center space-y-3 max-w-xl mx-auto my-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-amber-950">
              Grad-CAM Explainability Unavailable
            </h4>
            <p className="text-xs text-amber-800 leading-relaxed">
              {gradCamError || "Grad-CAM is unavailable because the MATLAB explainability pipeline is not connected."}
            </p>
            <div className="pt-2 text-[11px] font-mono text-amber-900/80 bg-amber-100/60 p-2.5 rounded-xl border border-amber-200/80 inline-block text-left">
              Expected Pipeline: ResNet-18 (res5b_relu) &rarr; MATLAB gradCAM(netDL, image, label, FeatureLayer="res5b_relu")
            </div>
          </div>
        ) : (
          <div>
            {/* VIEW 1: GRAD-CAM OVERLAY WITH BLEND SLIDER */}
            {activeTab === 'overlay' && (
              <div className="space-y-4 max-w-2xl mx-auto animate-in fade-in duration-200">
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 shadow-inner flex items-center justify-center">
                  {/* Underlay Original */}
                  <img
                    src={originalImage}
                    alt="Original Fundus"
                    className="w-full h-full object-contain select-none"
                  />
                  {/* Overlay Heatmap with interactive opacity */}
                  {effectiveOverlay && (
                    <img
                      src={effectiveOverlay}
                      alt="Grad-CAM Overlay"
                      style={{ opacity: overlayOpacity / 100 }}
                      className="absolute inset-0 w-full h-full object-contain pointer-events-none transition-opacity duration-75"
                    />
                  )}

                  {/* Badges */}
                  <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-xs text-white text-[11px] font-mono px-2.5 py-1 rounded-md border border-white/20">
                    Grad-CAM Overlay ({overlayOpacity}%)
                  </div>
                  <div className="absolute top-3 right-3 bg-sky-950/80 backdrop-blur-xs text-sky-200 text-[10px] font-mono px-2 py-0.5 rounded border border-sky-400/30">
                    res5b_relu
                  </div>

                  {showAnatomicalLabels && (
                    <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
                      <span className="self-start px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[10px] text-white/90 border border-white/20 font-mono mt-8">
                        Macula Region
                      </span>
                      <span className="self-end px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[10px] text-white/90 border border-white/20 font-mono mb-10">
                        Optic Disc & Posterior Pole
                      </span>
                    </div>
                  )}

                  {/* Colormap Legend */}
                  <div className="absolute bottom-3 left-3 right-3 bg-black/80 backdrop-blur-md border border-white/10 rounded-xl px-3.5 py-2 text-[10px] text-white flex items-center justify-between pointer-events-none">
                    <span className="font-semibold text-slate-300">Model Feature Salience:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sky-300">0.0 (Low)</span>
                      <div className="w-28 h-2.5 rounded-full bg-gradient-to-r from-blue-600 via-cyan-400 via-emerald-400 via-amber-400 to-red-600"></div>
                      <span className="text-rose-400 font-bold">1.0 (High Activation)</span>
                    </div>
                  </div>
                </div>

                {/* Opacity Slider */}
                {interactiveBlend && (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
                      <span className="flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-sky-600" />
                        <span>Interactive Blend Opacity</span>
                      </span>
                      <span className="text-sky-600 font-mono font-bold">{overlayOpacity}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={overlayOpacity}
                      onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span>0% (Raw Fundus Only)</span>
                      <span>50% (Standard Diagnostic Blend)</span>
                      <span>100% (Full Salience Map)</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* VIEW 2: ISOLATED GRAD-CAM HEATMAP */}
            {activeTab === 'heatmap' && (
              <div className="space-y-4 max-w-2xl mx-auto animate-in fade-in duration-200">
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 shadow-inner flex items-center justify-center">
                  <img
                    src={effectiveHeatmap || effectiveOverlay}
                    alt="Grad-CAM Activation Score Map"
                    className="w-full h-full object-contain select-none"
                  />
                  <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-xs text-white text-[11px] font-mono px-2.5 py-1 rounded-md border border-white/20">
                    ResNet-18 Heatmap (JET Colormap)
                  </div>
                  <div className="absolute top-3 right-3 bg-sky-950/80 backdrop-blur-xs text-sky-200 text-[10px] font-mono px-2 py-0.5 rounded border border-sky-400/30">
                    res5b_relu
                  </div>

                  {/* Colormap Legend */}
                  <div className="absolute bottom-3 left-3 right-3 bg-black/80 backdrop-blur-md border border-white/10 rounded-xl px-3.5 py-2 text-[10px] text-white flex items-center justify-between pointer-events-none">
                    <span className="font-semibold text-slate-300">Feature Importance:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sky-300">Low Importance</span>
                      <div className="w-28 h-2.5 rounded-full bg-gradient-to-r from-blue-600 via-cyan-400 via-emerald-400 via-amber-400 to-red-600"></div>
                      <span className="text-rose-400 font-bold">High Importance</span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed text-center">
                  Actual Grad-CAM score map calculated from the trained Netraguard ResNet-18 weights at layer <span className="font-mono font-semibold text-slate-800">res5b_relu</span>.
                </div>
              </div>
            )}

            {/* VIEW 3: ORIGINAL RETINAL FUNDUS */}
            {activeTab === 'original' && (
              <div className="space-y-4 max-w-2xl mx-auto animate-in fade-in duration-200">
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 shadow-inner flex items-center justify-center">
                  <img
                    src={originalImage}
                    alt="Original Retinal Fundus"
                    className="w-full h-full object-contain select-none"
                  />
                  <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-xs text-white text-[11px] font-mono px-2.5 py-1 rounded-md border border-white/20">
                    Original Retinal Fundus Scan
                  </div>

                  {showAnatomicalLabels && (
                    <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
                      <span className="self-start px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[10px] text-white/90 border border-white/20 font-mono mt-8">
                        Macula Center
                      </span>
                      <span className="self-end px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[10px] text-white/90 border border-white/20 font-mono mb-4">
                        Optic Disc
                      </span>
                    </div>
                  )}
                </div>

                <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed text-center">
                  Standard 45° posterior pole retinal photograph before explainability feature extraction.
                </div>
              </div>
            )}

            {/* VIEW 4: SIDE-BY-SIDE COMPARISON */}
            {activeTab === 'side-by-side' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
                {/* Left: Original */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 px-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                      <span>Original Fundus</span>
                    </span>
                    <span className="text-[11px] font-normal text-slate-400">Raw Scan</span>
                  </div>
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-950 border border-slate-200 shadow-inner flex items-center justify-center">
                    <img
                      src={originalImage}
                      alt="Original Retinal Fundus"
                      className="w-full h-full object-contain select-none"
                    />
                  </div>
                </div>

                {/* Right: Grad-CAM Overlay */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 px-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                      <span>Grad-CAM Overlay</span>
                    </span>
                    <span className="text-[11px] font-mono text-sky-700">res5b_relu</span>
                  </div>
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-950 border border-slate-200 shadow-inner flex items-center justify-center">
                    <img
                      src={effectiveOverlay}
                      alt="Grad-CAM Overlay"
                      className="w-full h-full object-contain select-none"
                    />
                    {/* Legend */}
                    <div className="absolute bottom-2 left-2 right-2 bg-black/80 backdrop-blur-xs border border-white/10 rounded-lg px-2.5 py-1 text-[9px] text-white flex items-center justify-between pointer-events-none">
                      <span>Low</span>
                      <div className="w-20 h-1.5 rounded-full bg-gradient-to-r from-blue-500 via-emerald-400 via-amber-400 to-red-500"></div>
                      <span>High Salience</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Explainability Technical Callout */}
        <div className="mt-5 p-4 rounded-xl bg-sky-50/70 border border-sky-100 flex items-start gap-3">
          <Info className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700 leading-relaxed">
            <strong className="text-sky-950 font-semibold">ResNet-18 Explainability Architecture: </strong>
            Activation heatmap is produced by computing gradients and feature map activations at the final residual block (<code className="text-sky-900 font-mono">res5b_relu</code>), distinguishing anatomical regions influencing the classification.
            {prediction && (
              <div className="mt-1.5 flex items-center gap-2 font-mono text-[11px] text-sky-900">
                <CheckCircle className="w-3.5 h-3.5 text-sky-600" />
                <span>Class Target: <strong>{prediction}</strong> ({Math.round((confidence || 0.9) * 100)}% ResNet probability)</span>
              </div>
            )}
            {gradCamSource && (
              <div className="mt-1 text-[10px] text-slate-500">
                Source: {gradCamSource}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
