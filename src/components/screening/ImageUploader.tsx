import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, AlertCircle, FileCheck, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { DEMO_SAMPLE_FUNDUS_URL } from '../../data/demoData';
import precisionEyeAsset from '../../assets/precision_eye.jpg';

interface Props {
  onImageSelected: (file: File | null, previewUrl: string | null) => void;
  onProceedToScreening: () => void;
  selectedImagePreview: string | null;
  selectedFileName: string | null;
  isLoading?: boolean;
}

export const ImageUploader: React.FC<Props> = ({
  onImageSelected,
  onProceedToScreening,
  selectedImagePreview,
  selectedFileName,
  isLoading = false,
}) => {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validateAndProcessFile = (file: File) => {
    setErrorMessage(null);

    // Validate type: JPG, JPEG, PNG
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setErrorMessage(t.screening.invalidType);
      return;
    }

    // Validate size: max 20MB
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrorMessage(t.screening.fileTooLarge);
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    onImageSelected(file, previewUrl);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const handleClear = () => {
    setErrorMessage(null);
    onImageSelected(null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLoadSampleDemo = async () => {
    setErrorMessage(null);
    try {
      const response = await fetch(precisionEyeAsset);
      const blob = await response.blob();
      const file = new File([blob], 'sample_retinal_scan.jpg', { type: 'image/jpeg' });
      onImageSelected(file, precisionEyeAsset);
    } catch {
      onImageSelected(null, DEMO_SAMPLE_FUNDUS_URL);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Main Upload Dropzone or Preview Area */}
      {!selectedImagePreview ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 group flex flex-col items-center justify-center min-h-[320px] ${
            isDragging
              ? 'border-sky-500 bg-sky-50/50 scale-[0.99]'
              : 'border-slate-300 hover:border-sky-400 hover:bg-slate-50/60'
          }`}
        >
          <div className="w-16 h-16 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 mb-4 group-hover:scale-110 group-hover:bg-sky-100 transition-all duration-200 shadow-xs">
            <UploadCloud className="w-8 h-8" />
          </div>

          <h3 className="text-lg font-bold text-slate-800 mb-1">
            {t.screening.dropzoneTitle}
          </h3>
          <p className="text-sm text-slate-500 max-w-md mb-3">
            {t.screening.dropzoneSubtitle}
          </p>

          <p className="text-xs text-slate-400 font-medium">
            {t.screening.supportedFormats}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              {t.screening.chooseImage}
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleLoadSampleDemo();
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>{t.screening.sampleImage}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Image Preview Box */
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-600" />
              <div>
                <h4 className="text-sm font-semibold text-slate-900">
                  {selectedFileName || 'Standard Retinal Fundus Photograph'}
                </h4>
                <p className="text-xs text-slate-400">
                  Ready for AI feature extraction pipeline
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClear}
              disabled={isLoading}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
            >
              <X className="w-3.5 h-3.5" />
              <span>{t.screening.clearImage}</span>
            </button>
          </div>

          {/* Centered Image Preview Frame */}
          <div className="relative max-w-md mx-auto aspect-square rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 shadow-md flex items-center justify-center">
            <img
              src={selectedImagePreview}
              alt="Uploaded retinal fundus"
              className="w-full h-full object-contain select-none"
            />
            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[11px] font-mono px-2.5 py-1 rounded-md border border-white/20 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
              <span>45° Field of View</span>
            </div>

            {/* Inference Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-3 animate-in fade-in duration-150">
                <Loader2 className="w-9 h-9 text-sky-400 animate-spin" />
                <span className="text-xs font-bold font-mono tracking-wider text-sky-200">
                  Analyzing Fundus via ResNet-18...
                </span>
                <span className="text-[11px] text-slate-400">
                  FastAPI · ONNX Runtime
                </span>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <div className="text-xs text-slate-500">
              * Click continue to evaluate the screening interface and API integration contract.
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleClear}
                disabled={isLoading}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                {t.screening.clearImage}
              </button>

              <button
                type="button"
                onClick={onProceedToScreening}
                disabled={isLoading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-75 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-md shadow-sky-600/20 active:scale-98 transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Analyzing Image...</span>
                  </>
                ) : (
                  <>
                    <span>{t.screening.continueToScreening}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
