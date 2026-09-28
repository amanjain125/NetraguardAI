/**
 * NETRAGUARD AI - Type Definitions
 * 
 * Defines standard data contracts for the screening workflow,
 * clinical review, and future MATLAB AI pipeline integration.
 */

export type DiabeticRetinopathyGrade = 0 | 1 | 2 | 3 | 4;

export type DRSeverityLabel = 
  | 'No Apparent DR'
  | 'Mild Non-Proliferative DR'
  | 'Moderate Non-Proliferative DR'
  | 'Severe Non-Proliferative DR'
  | 'Proliferative DR';

export type QualityGrade = 'Adequate' | 'Suboptimal' | 'Ungradable';

export type ClinicalReviewStatus = 'Pending Review' | 'Under Review' | 'Reviewed' | 'Referred';

export interface ImageQualityMetrics {
  status: QualityGrade;
  focusScore: number;       // 0.0 - 1.0 (or percentage)
  illuminationScore: number; // 0.0 - 1.0
  fieldCoverageScore: number;// 0.0 - 1.0
  artifactsDetected: boolean;
  notes?: string;
}

export interface ScreeningResult {
  id: string;
  patientId: string;
  patientName?: string;
  patientAge?: number;
  patientGender?: 'Male' | 'Female' | 'Other';
  patientPhone?: string;
  centerLocation?: string;
  timestamp: string;
  
  // AI Model Screening Outputs (Future MATLAB Pipeline Target)
  prediction: DRSeverityLabel;
  class: DiabeticRetinopathyGrade;
  confidence: number; // 0.0 - 1.0
  
  // Clinical Metrics
  referable: boolean;
  macularInvolvementSuspected: boolean;
  recommendation: string;
  
  // Image Quality
  imageQuality: ImageQualityMetrics;
  
  // Image Artifacts & Real Grad-CAM Explainability
  originalImageUrl: string;
  processedImageUrl?: string;
  gradCamImageUrl?: string;
  gradCamHeatmapUrl?: string;
  gradCamOverlayUrl?: string;
  gradCamAvailable?: boolean;
  gradCamLayer?: string;
  gradCamSource?: string;
  gradCamMethod?: string;
  gradCamError?: string;
  debug?: Record<string, any>;
  
  // Clinical Workflow
  clinicalStatus: ClinicalReviewStatus;
  reviewedBy?: string;
  reviewTimestamp?: string;
  doctorNotes?: string;
}

export interface ScreeningApiContract {
  // Backend target contract for POST /api/screen
  analyzeImage(file: File, metadata?: { patientId?: string; centerId?: string }): Promise<ScreeningResult>;
  getScreeningHistory(): Promise<ScreeningResult[]>;
  getScreeningById(id: string): Promise<ScreeningResult | null>;
  updateDoctorReview(id: string, notes: string, status: ClinicalReviewStatus, doctorName: string): Promise<ScreeningResult>;
}

export type SupportedLanguage = 'en' | 'hi' | 'kn';

export interface LanguageOption {
  code: SupportedLanguage;
  label: string;
  nativeLabel: string;
  flagCode?: string;
}
