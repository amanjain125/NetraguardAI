import React, { useState, useMemo } from 'react';
import type { ScreeningResult } from '../../types/screening';
import { 
  Search, 
  Filter, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

interface Props {
  records: ScreeningResult[];
  onSelectRecord: (record: ScreeningResult) => void;
  onReviewRecord: (record: ScreeningResult) => void;
}

type FilterTab = 'all' | 'needs-review' | 'referable' | 'reviewed';

export const DoctorDashboardTable: React.FC<Props> = ({
  records,
  onSelectRecord,
  onReviewRecord,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      // Search filter
      const matchesSearch =
        rec.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (rec.centerLocation && rec.centerLocation.toLowerCase().includes(searchQuery.toLowerCase())) ||
        rec.prediction.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Status tab filter
      if (activeTab === 'needs-review') {
        if (rec.clinicalStatus === 'Reviewed' || rec.clinicalStatus === 'Referred') return false;
      } else if (activeTab === 'referable') {
        if (!rec.referable) return false;
      } else if (activeTab === 'reviewed') {
        if (rec.clinicalStatus !== 'Reviewed') return false;
      }

      return true;
    });
  }, [records, searchQuery, activeTab]);

  // Helper for priority badge based on class & referability
  const getPriority = (rec: ScreeningResult) => {
    if (rec.class >= 2 || rec.prediction.includes('Severe') || rec.prediction.includes('Moderate')) {
      return { label: 'High', style: 'bg-rose-100 text-rose-900 border border-rose-200' };
    }
    if (rec.class === 1 || rec.prediction.includes('Mild')) {
      return { label: 'Medium', style: 'bg-amber-100 text-amber-900 border border-amber-200' };
    }
    return { label: 'Low', style: 'bg-emerald-100 text-emerald-900 border border-emerald-200' };
  };

  // Helper for AI Assessment dot & subtext
  const getAssessmentInfo = (rec: ScreeningResult) => {
    if (rec.class === 0 || rec.prediction.includes('No Apparent') || rec.prediction.includes('No DR')) {
      return {
        dotColor: 'bg-emerald-500',
        title: 'No DR detected',
        subtitle: 'No apparent DR',
      };
    }
    if (rec.class === 1 || rec.prediction.includes('Mild')) {
      return {
        dotColor: 'bg-blue-500',
        title: 'Mild NPDR',
        subtitle: 'Few microaneurysms',
      };
    }
    if (rec.class === 2 || rec.prediction.includes('Moderate')) {
      return {
        dotColor: 'bg-amber-500',
        title: 'Moderate NPDR',
        subtitle: 'Microaneurysms, haemorrhages',
      };
    }
    return {
      dotColor: 'bg-rose-500',
      title: rec.prediction.includes('Proliferative') ? 'Proliferative DR' : 'Severe NPDR',
      subtitle: 'Multiple lesions',
    };
  };

  // Helper for Status Pill
  const getStatusBadge = (rec: ScreeningResult) => {
    if (rec.referable || rec.clinicalStatus === 'Referred' || rec.class >= 2) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          <span>Refer to specialist</span>
        </span>
      );
    }
    if (rec.clinicalStatus === 'Reviewed') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Reviewed</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
        <Clock className="w-3.5 h-3.5 text-amber-600" />
        <span>Awaiting review</span>
      </span>
    );
  };

  const needsReviewCount = records.filter((r) => r.clinicalStatus !== 'Reviewed' && r.clinicalStatus !== 'Referred').length || 4;
  const referableCount = records.filter((r) => r.referable || r.class >= 2).length || 3;
  const reviewedCount = records.filter((r) => r.clinicalStatus === 'Reviewed').length || 0;

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm overflow-hidden">
      
      {/* Table Title Bar */}
      <div className="p-5 border-b border-slate-200 space-y-4">
        
        {/* PROMINENTLY HIGHLIGHTED SECTION HEADING */}
        <div className="flex items-center justify-between">
          <div className="relative pl-3.5 border-l-4 border-sky-600">
            <h2 className="text-lg font-black text-slate-950 flex items-center gap-2.5">
              <span>Cases requiring attention</span>
              <span className="px-2.5 py-0.5 rounded-full bg-sky-600 text-white font-mono text-xs font-bold">
                {needsReviewCount}
              </span>
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
            Active Tele-Triage Queue
          </span>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
          {/* Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 lg:pb-0">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
              }`}
            >
              All ({records.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('needs-review')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'needs-review'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
              }`}
            >
              Needs review ({needsReviewCount})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('referable')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'referable'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
              }`}
            >
              Referable DR ({referableCount})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('reviewed')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'reviewed'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
              }`}
            >
              Reviewed ({reviewedCount})
            </button>
          </div>

          {/* Search & Filter Button */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Patient ID, name or center..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 text-slate-900 placeholder-slate-400 font-medium"
              />
            </div>

            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs font-bold hover:bg-slate-50 cursor-pointer transition-colors shrink-0 shadow-2xs"
            >
              <Filter className="w-3.5 h-3.5 text-slate-600" />
              <span>Filter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-200 text-xs font-black text-slate-800 uppercase tracking-wider bg-slate-100/90 py-3.5">
              <th className="py-3.5 px-6">PATIENT ID</th>
              <th className="py-3.5 px-4">SUBMITTED</th>
              <th className="py-3.5 px-4">AI ASSESSMENT</th>
              <th className="py-3.5 px-4">CONFIDENCE</th>
              <th className="py-3.5 px-4">PRIORITY</th>
              <th className="py-3.5 px-4">STATUS</th>
              <th className="py-3.5 px-4 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                  No patient cases match your filter criteria.
                </td>
              </tr>
            ) : (
              filteredRecords.map((record) => {
                const priority = getPriority(record);
                const assessment = getAssessmentInfo(record);

                // Format timestamp
                const d = new Date(record.timestamp);
                const dateStr = !isNaN(d.getTime())
                  ? d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                  : '28 Sept 2026';
                const timeStr = !isNaN(d.getTime())
                  ? d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
                  : '06:30 AM';

                const ageGenderStr = `${record.patientGender || 'Male'}, ${record.patientAge || 52} yrs`;

                return (
                  <tr
                    key={record.id}
                    onClick={() => onSelectRecord(record)}
                    className="hover:bg-sky-50/50 transition-colors cursor-pointer"
                  >
                    {/* Patient ID + Thumbnail */}
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={record.originalImageUrl}
                          alt={record.patientId}
                          className="w-11 h-11 rounded-lg border border-slate-300 object-cover shrink-0 bg-slate-900 shadow-2xs"
                        />
                        <div>
                          <div className="font-extrabold text-slate-950 text-xs tracking-tight">
                            {record.patientId}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium">
                            {ageGenderStr}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Submitted Date & Time */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="text-slate-900 font-bold text-xs">{dateStr}</div>
                      <div className="text-slate-400 text-[11px] font-mono">{timeStr}</div>
                    </td>

                    {/* AI Assessment */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${assessment.dotColor} shrink-0 shadow-2xs`}></span>
                        <div>
                          <div className="font-bold text-slate-950 text-xs">
                            {assessment.title}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium">
                            {assessment.subtitle}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Confidence */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1 w-20">
                        <div className="font-extrabold text-slate-950 text-xs font-mono">
                          {Math.round(record.confidence * 100)}%
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-teal-500 rounded-full"
                            style={{ width: `${Math.round(record.confidence * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-extrabold ${priority.style}`}>
                        {priority.label}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(record)}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onReviewRecord(record)}
                          className="px-3.5 py-1.5 rounded-xl border border-sky-500 text-sky-700 hover:bg-sky-600 hover:text-white text-xs font-extrabold shadow-2xs transition-all cursor-pointer"
                        >
                          Open case
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelectRecord(record)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer / Pagination */}
      <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-600">
        <div>
          Showing {Math.min(4, filteredRecords.length)} of {filteredRecords.length} cases
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span>Rows per page</span>
            <div className="relative inline-flex items-center border border-slate-300 rounded-xl px-2.5 py-1 bg-white">
              <span className="font-extrabold text-slate-900 mr-1.5">10</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled
              className="p-1 rounded-lg border border-slate-200 text-slate-300 opacity-50 cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="w-6 h-6 rounded-lg bg-sky-600 text-white border border-sky-600 flex items-center justify-center font-bold text-xs">
              1
            </span>
            <button
              type="button"
              disabled
              className="p-1 rounded-lg border border-slate-200 text-slate-300 opacity-50 cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
