import React, { useState, useEffect } from 'react';
import type { PageRoute } from '../components/common/Navbar';
import type { ScreeningResult } from '../types/screening';
import { screeningApi } from '../services/screeningApi';
import { MetricsSummary } from '../components/dashboard/MetricsSummary';
import { DoctorDashboardTable } from '../components/dashboard/DoctorDashboardTable';
import { MedicalDisclaimer } from '../components/common/MedicalDisclaimer';
import { 
  ChevronRight, 
  Calendar, 
  Brain, 
  RefreshCw,
  PlusCircle,
  Stethoscope
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
  const [backendConnected, setBackendConnected] = useState<boolean>(true);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const data = await screeningApi.getScreeningHistory();
      setRecords(data);
      const isConnected = await screeningApi.isBackendConnected();
      setBackendConnected(isConnected);
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

  // Format today's date
  const todayStr = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-slate-900 selection:bg-sky-100 selection:text-sky-900">
      
      {/* 1. Breadcrumb & Page Title Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          {/* Highlighted Breadcrumb Tag */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold border border-sky-300 shadow-2xs">
              <Stethoscope className="w-3.5 h-3.5 text-sky-600" />
              <span>Doctor Dashboard</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-200 text-slate-900 text-xs font-extrabold">
              Clinical Review
            </span>
          </div>

          {/* Prominently Highlighted Main H1 Heading */}
          <div className="relative pl-4 border-l-4 border-sky-600">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight font-sans">
              Clinical Review
            </h1>
            <p className="text-sm font-medium text-slate-600 mt-0.5">
              Review retinal screening cases and confirm AI-assisted findings.
            </p>
          </div>
        </div>

        {/* Date Button & Action Controls */}
        <div className="flex items-center gap-2.5 self-start shrink-0">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 shadow-2xs text-xs font-bold text-slate-800">
            <Calendar className="w-4 h-4 text-sky-600" />
            <span>{todayStr}</span>
          </div>

          <button
            type="button"
            onClick={fetchRecords}
            className="p-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 hover:text-slate-950 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
            title="Refresh records"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => onNavigate('screening')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/25 transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Screening</span>
          </button>
        </div>
      </div>

      {/* 2. Dark AI ENGINE Status Banner */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:px-6 sm:py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-white text-xs shadow-lg">
        {/* Left: AI ENGINE Highlighted Heading */}
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-400/30">
            <Brain className="w-4.5 h-4.5" />
          </div>
          <div className="flex items-center gap-2 font-bold">
            <span className="text-sky-300 font-mono tracking-wider uppercase text-[11px] px-2 py-0.5 rounded bg-sky-500/20 border border-sky-400/30">
              AI ENGINE
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-white font-bold">MATLAB ResNet-18 + Grad-CAM</span>
          </div>
        </div>

        {/* Center: Backend Connection Status */}
        <div className="flex items-center gap-2 font-bold">
          <span className={`w-2.5 h-2.5 rounded-full ${backendConnected ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]' : 'bg-amber-400'} animate-pulse`}></span>
          <span className={backendConnected ? 'text-emerald-400 font-extrabold' : 'text-amber-400 font-extrabold'}>
            {backendConnected ? 'Backend Connected' : 'Offline (Demo Mode)'}
          </span>
        </div>

        {/* Right: Last Updated */}
        <div className="text-slate-400 text-[11px] font-mono">
          Last updated: {todayStr}, 10:24 AM
        </div>
      </div>

      {/* 3. Top 4 Summary Cards (Highlighted Headings) */}
      <MetricsSummary records={records} />

      {/* 4. Main Clinical Review Table */}
      <DoctorDashboardTable
        records={records}
        onSelectRecord={handleSelectRecord}
        onReviewRecord={handleReviewRecord}
      />

      {/* 5. Medical Safety Disclaimer */}
      <MedicalDisclaimer variant="card" />

    </div>
  );
};
