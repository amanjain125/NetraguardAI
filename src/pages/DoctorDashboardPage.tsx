import React, { useState, useEffect } from 'react';
import type { PageRoute } from '../components/common/Navbar';
import type { ScreeningResult } from '../types/screening';
import { screeningApi } from '../services/screeningApi';
import { MetricsSummary } from '../components/dashboard/MetricsSummary';
import { DoctorDashboardTable } from '../components/dashboard/DoctorDashboardTable';
import { MatlabIntegrationBanner } from '../components/screening/MatlabIntegrationBanner';
import { MedicalDisclaimer } from '../components/common/MedicalDisclaimer';
import { 
  Stethoscope, 
  PlusCircle, 
  RefreshCw
} from 'lucide-react';

interface Props {
  onNavigate: (page: PageRoute) => void;
  onSelectRecordForDetail: (record: ScreeningResult) => void;
}

export const DoctorDashboardPage: React.FC<Props> = ({
  onNavigate,
  onSelectRecordForDetail,
}) => {
  const [records, setRecords] = useState<ScreeningResult[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const data = await screeningApi.getScreeningHistory();
      setRecords(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleSelectRecord = (record: ScreeningResult) => {
    onSelectRecordForDetail(record);
    onNavigate('results');
  };

  const handleReviewRecord = (record: ScreeningResult) => {
    onSelectRecordForDetail(record);
    onNavigate('results');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner & Doctor Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 text-xs font-semibold border border-sky-200">
              <Stethoscope className="w-3.5 h-3.5 text-sky-600" />
              <span>Physician Tele-Triage Desk</span>
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-mono">Karnataka Rural Health Network</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Doctor Clinical Review Workspace
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Review AI-assisted diabetic retinopathy screenings submitted from Primary Health Centers and mobile vision vans.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchRecords}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            title="Refresh records"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => onNavigate('screening')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Screening</span>
          </button>
        </div>
      </div>

      {/* MATLAB Architecture Notice */}
      <MatlabIntegrationBanner compact />

      {/* Metrics Summary Row */}
      <MetricsSummary records={records} />

      {/* Screenings Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-bold text-slate-900">
            Recent Tele-Screening Registry
          </h2>
          <span className="text-xs text-slate-400">
            Showing {records.length} registered patient cases
          </span>
        </div>

        <DoctorDashboardTable
          records={records}
          onSelectRecord={handleSelectRecord}
          onReviewRecord={handleReviewRecord}
        />
      </div>

      {/* Medical Safety Disclaimer */}
      <MedicalDisclaimer variant="card" />
    </div>
  );
};
