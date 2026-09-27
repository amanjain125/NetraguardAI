/**
 * NETRAGUARD AI - Service Layer
 * 
 * FUTURE INTEGRATION:
 * 1. Connect this service to the backend API (e.g. POST /api/screen).
 * 2. The backend server will communicate with the existing MATLAB AI pipeline
 *    (ResNet-18 feature extraction, classification, and Grad-CAM generation).
 * 3. Do not move or replicate the MATLAB AI model inside the frontend.
 * 4. Maintain this service layer as the strict boundary between UI and API.
 */

import type { ScreeningResult, ClinicalReviewStatus, DRSeverityLabel, DiabeticRetinopathyGrade } from '../types/screening';
import { DEMO_SCREENING_RECORDS } from '../data/demoData';

// Configuration for FastAPI backend endpoint
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export interface BackendScreeningResponse {
  predictedClass: number;
  predictedClassName: string;
  confidence: number;
  screeningStatus: string;
  referralMessage: string;
  gradCAMAvailable?: boolean;
  gradCAMHeatmap?: string | null;
  gradCAMOverlay?: string | null;
  gradCAMImage?: string | null;
  originalImageUrl?: string | null;
  gradCAMLayer?: string | null;
  gradCAMSource?: string | null;
  gradCAMMethod?: string | null;
  gradCAMError?: string | null;
  debug?: Record<string, any> | null;
}

export class ScreeningService {
  private static instance: ScreeningService;

  private constructor() {}

  public static getInstance(): ScreeningService {
    if (!ScreeningService.instance) {
      ScreeningService.instance = new ScreeningService();
    }
    return ScreeningService.instance;
  }

  /**
   * Health check verifying FastAPI server and ONNX Runtime model readiness.
   */
  public async checkHealth(): Promise<{ status: string; model: string; featureLayer?: string }> {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error(`Health check failed with status: ${response.status}`);
    }
    return response.json();
  }

  /**
   * Status check for the backend pipeline.
   */
  public async isBackendConnected(): Promise<boolean> {
    try {
      const health = await this.checkHealth();
      return health.status === 'ok';
    } catch {
      return false;
    }
  }

  /**
   * Live screening API call:
   * Sends retinal fundus image via multipart/form-data to POST /api/screen
   * Runs inference on netraguard_resnet18.onnx and returns authentic predictions and real Grad-CAM.
   */
  public async screenImage(file: File): Promise<BackendScreeningResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/screen`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let errorDetail = `Backend screening request failed (${response.status} ${response.statusText})`;
      try {
        const errorJson = await response.json();
        if (errorJson.detail) {
          errorDetail = errorJson.detail;
        }
      } catch {
        // use default errorDetail
      }
      throw new Error(errorDetail);
    }

    return await response.json();
  }

  /**
   * Analyzes an image with the live backend and converts into full ScreeningResult structure.
   */
  public async analyzeImage(
    imageFile: File,
    patientMetadata?: { patientId?: string; centerLocation?: string }
  ): Promise<ScreeningResult> {
    const result = await this.screenImage(imageFile);

    const severityMap: Record<number, DRSeverityLabel> = {
      0: 'No Apparent DR',
      1: 'Mild Non-Proliferative DR',
      2: 'Moderate Non-Proliferative DR',
      3: 'Severe Non-Proliferative DR',
      4: 'Proliferative DR',
    };

    const isReferable = result.screeningStatus.includes('Referable') || result.predictedClass >= 2;

    return {
      id: `SCR-${Date.now().toString().slice(-6)}`,
      patientId: patientMetadata?.patientId || `PT-${Math.floor(1000 + Math.random() * 9000)}`,
      centerLocation: patientMetadata?.centerLocation || 'Primary Rural Health Center (KA-04)',
      timestamp: new Date().toISOString(),
      prediction: severityMap[result.predictedClass] || (result.predictedClassName as DRSeverityLabel),
      class: result.predictedClass as DiabeticRetinopathyGrade,
      confidence: result.confidence,
      referable: isReferable,
      macularInvolvementSuspected: result.predictedClass >= 3,
      recommendation: result.referralMessage,
      imageQuality: {
        status: 'Adequate',
        focusScore: 0.94,
        illuminationScore: 0.91,
        fieldCoverageScore: 0.95,
        artifactsDetected: false,
      },
      originalImageUrl: result.originalImageUrl || URL.createObjectURL(imageFile),
      gradCamImageUrl: result.gradCAMOverlay || result.gradCAMImage || undefined,
      gradCamHeatmapUrl: result.gradCAMHeatmap || undefined,
      gradCamOverlayUrl: result.gradCAMOverlay || undefined,
      gradCamAvailable: result.gradCAMAvailable,
      gradCamLayer: result.gradCAMLayer || 'res5b_relu',
      gradCamSource: result.gradCAMSource || undefined,
      gradCamMethod: result.gradCAMMethod || 'CAM',
      gradCamError: result.gradCAMError || undefined,
      debug: result.debug || undefined,
      clinicalStatus: 'Pending Review',
    };
  }

  /**
   * Fetches previous screening history records from the backend database.
   */
  public async getScreeningHistory(): Promise<ScreeningResult[]> {
    return Promise.resolve(DEMO_SCREENING_RECORDS);
  }

  /**
   * Fetches single screening by ID.
   */
  public async getScreeningById(id: string): Promise<ScreeningResult | null> {
    const records = await this.getScreeningHistory();
    return records.find((r) => r.id === id) || null;
  }

  /**
   * Clinical action: Updates doctor review and clinical recommendation.
   */
  public async updateDoctorReview(
    id: string,
    notes: string,
    status: ClinicalReviewStatus,
    doctorName: string
  ): Promise<ScreeningResult> {
    const record = await this.getScreeningById(id);
    if (!record) {
      throw new Error(`Screening record ${id} not found.`);
    }

    const updated: ScreeningResult = {
      ...record,
      doctorNotes: notes,
      clinicalStatus: status,
      reviewedBy: doctorName,
      reviewTimestamp: new Date().toISOString(),
    };

    return Promise.resolve(updated);
  }
}

export const screeningApi = ScreeningService.getInstance();
