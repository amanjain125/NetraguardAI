import React, { useState, useMemo } from 'react';
import type { ScreeningResult } from '../../types/screening';
import { 
  Search, 
  Calendar, 
  CheckCircle, 
  AlertCircle
} from 'lucide-react';
import { formatDate, formatPercentage, getSeverityBadgeStyle, getClinicalStatusBadge } from '../../utils/formatters';

interface Props {
  records: ScreeningResult[];
  onSelectRecord: (record: ScreeningResult) => void;
  onReviewRecord: (record: ScreeningResult) => void;
}

type FilterTab = 'all' | 'needs-review' | 'reviewed' | 'referral';

export const DoctorDashboardTable: React.FC<Props> = ({
  records,
  onSelectRecord,
  onReviewRecord,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

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
        if (rec.clinicalStatus === 'Reviewed') return false;
      } else if (activeTab === 'reviewed') {
        if (rec.clinicalStatus !== 'Reviewed' && rec.clinicalStatus !== 'Referred') return false;
      } else if (activeTab === 'referral') {
        if (!rec.referable) return false;
      }

      // Date filter
      if (dateFilter !== 'all') {
        const recordDate = new Date(rec.timestamp);
        const now = new Date();
        if (dateFilter === 'today') {
          if (recordDate.toDateString() !== now.toDateString()) return false;
        } else if (dateFilter === '7days') {
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (recordDate < sevenDaysAgo) return false;
        }
      }

      return true;
    });
  }, [records, searchQuery, activeTab, dateFilter]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Top Filter and Search Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'all'
                ? 'bg-sky-50 text-sky-700 border border-sky-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Screenings ({records.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('needs-review')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'needs-review'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Needs Clinical Review ({records.filter((r) => r.clinicalStatus !== 'Reviewed').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('referral')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'referral'
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Referral Recommended ({records.filter((r) => r.referable).length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reviewed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'reviewed'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Reviewed
          </button>
        </div>

        {/* Search and Date filter controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Patient ID or Center..."
              className="pl-9 pr-4 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 w-full sm:w-64 transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="py-1.5 px-3 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Screening Records Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4 sm:px-6">Patient ID</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">AI Result</th>
              <th className="py-3 px-4">Confidence</th>
              <th className="py-3 px-4">Referral Status</th>
              <th className="py-3 px-4">Clinical Status</th>
              <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <div className="max-w-xs mx-auto space-y-2">
                    <p className="font-semibold text-slate-600">No screening records matched.</p>
                    <p className="text-[11px]">Try adjusting your search criteria or filter tabs.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredRecords.map((record) => {
                const badge = getSeverityBadgeStyle(record.class);
                const statusBadge = getClinicalStatusBadge(record.clinicalStatus);

                return (
                  <tr
                    key={record.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => onSelectRecord(record)}
                  >
                    {/* Patient ID */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="font-mono font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                        {record.patientId}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[160px]">
                        {record.centerLocation || 'Field Vision Unit'}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      {formatDate(record.timestamp)}
                    </td>

                    {/* AI Result */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.badge}`}></span>
                        <span>{record.prediction}</span>
                      </span>
                    </td>

                    {/* Confidence */}
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                      {formatPercentage(record.confidence)}
                    </td>

                    {/* Referral Status */}
                    <td className="py-3.5 px-4">
                      {record.referable ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                          <AlertCircle className="w-3 h-3" />
                          <span>Specialist Review</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                          <CheckCircle className="w-3 h-3" />
                          <span>Routine Follow-up</span>
                        </span>
                      )}
                    </td>

                    {/* Clinical Status */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${statusBadge.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`}></span>
                        <span>{record.clinicalStatus}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => onSelectRecord(record)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 hover:text-sky-700 hover:bg-sky-50 border border-slate-200 transition-colors"
                        >
                          View Report
                        </button>
                        <button
                          type="button"
                          onClick={() => onReviewRecord(record)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white shadow-xs transition-colors"
                        >
                          Review
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
    </div>
  );
};
