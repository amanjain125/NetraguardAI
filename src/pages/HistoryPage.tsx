import React, { useState, useEffect, useMemo } from 'react';
import type { PageRoute } from '../components/common/Navbar';
import type { ScreeningResult } from '../types/screening';
import { screeningApi } from '../services/screeningApi';
import { 
  Search, 
  History as HistoryIcon, 
  ArrowRight, 
  Filter, 
  AlertCircle, 
  CheckCircle,
  Inbox
} from 'lucide-react';
import { formatDate, getSeverityBadgeStyle, getClinicalStatusBadge } from '../utils/formatters';

interface Props {
  onNavigate: (page: PageRoute) => void;
  onSelectRecord: (record: ScreeningResult) => void;
}

export const HistoryPage: React.FC<Props> = ({ onNavigate, onSelectRecord }) => {
  const [records, setRecords] = useState<ScreeningResult[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const load = async () => {
      const data = await screeningApi.getScreeningHistory();
      setRecords(data);
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const matchSearch =
        r.patientId.toLowerCase().includes(search.toLowerCase()) ||
        r.prediction.toLowerCase().includes(search.toLowerCase()) ||
        (r.centerLocation && r.centerLocation.toLowerCase().includes(search.toLowerCase()));

      if (!matchSearch) return false;

      if (statusFilter === 'referral' && !r.referable) return false;
      if (statusFilter === 'reviewed' && r.clinicalStatus !== 'Reviewed') return false;
      if (statusFilter === 'pending' && r.clinicalStatus === 'Reviewed') return false;

      return true;
    });
  }, [records, search, statusFilter]);

  const handleClearHistoryDemo = () => {
    setRecords([]);
  };

  const handleRestoreHistoryDemo = async () => {
    const data = await screeningApi.getScreeningHistory();
    setRecords(data);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold uppercase tracking-wider mb-2 border border-sky-300">
            <HistoryIcon className="w-3.5 h-3.5 text-sky-600" />
            <span>Auditable Audit Trail</span>
          </div>
          <div className="relative pl-3.5 border-l-4 border-sky-600">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              Screening Records &amp; History
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-600 mt-0.5">
              Archived diabetic retinopathy screening cases, classification logs, and patient records.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {records.length > 0 ? (
            <button
              type="button"
              onClick={handleClearHistoryDemo}
              className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:text-slate-950 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
            >
              Test Empty State
            </button>
          ) : (
            <button
              type="button"
              onClick={handleRestoreHistoryDemo}
              className="px-3.5 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-500 transition-colors cursor-pointer"
            >
              Restore Records
            </button>
          )}

          <button
            type="button"
            onClick={() => onNavigate('screening')}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/25 transition-colors cursor-pointer"
          >
            Start New Screening
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-300 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Patient ID, Center, or Classification..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 font-medium text-slate-900"
          />
        </div>

        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-slate-600 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs py-2 px-3.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-sky-500/20 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="referral">Referral Recommended Only</option>
            <option value="reviewed">Physician Reviewed</option>
            <option value="pending">Pending Clinical Sign-off</option>
          </select>
        </div>
      </div>

      {/* History Records Container */}
      {filtered.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-slate-300 p-12 text-center max-w-md mx-auto my-12 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Inbox className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            No screening records yet
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Screening records will appear here as soon as fundus images are evaluated by the AI pipeline and stored in the database.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => onNavigate('screening')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <span>Upload First Fundus Image</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* Table Layout */
        <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                {/* PROMINENTLY HIGHLIGHTED TABLE COLUMN HEADERS */}
                <tr className="bg-slate-100/90 border-b-2 border-slate-200 text-xs font-black text-slate-800 uppercase tracking-wider">
                  <th className="py-3.5 px-6">DATE</th>
                  <th className="py-3.5 px-6">PATIENT ID</th>
                  <th className="py-3.5 px-6">RESULT</th>
                  <th className="py-3.5 px-6">STATUS</th>
                  <th className="py-3.5 px-6">REFERRAL</th>
                  <th className="py-3.5 px-6 text-right">VIEW</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filtered.map((record) => {
                  const badge = getSeverityBadgeStyle(record.class);
                  const statusBadge = getClinicalStatusBadge(record.clinicalStatus);

                  return (
                    <tr
                      key={record.id}
                      className="hover:bg-sky-50/50 transition-colors cursor-pointer group"
                      onClick={() => {
                        onSelectRecord(record);
                        onNavigate('results');
                      }}
                    >
                      <td className="py-4 px-6 text-slate-800 font-bold whitespace-nowrap">
                        {formatDate(record.timestamp)}
                      </td>
                      <td className="py-4 px-6 font-mono font-black text-slate-950 group-hover:text-sky-600 transition-colors">
                        {record.patientId}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.badge}`}></span>
                          <span>{record.prediction}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`}></span>
                          <span>{record.clinicalStatus}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {record.referable ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                            <span>Referral Needed</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>Routine Care</span>
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectRecord(record);
                            onNavigate('results');
                          }}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold text-sky-700 hover:text-white hover:bg-sky-600 border border-sky-300 transition-all inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                        >
                          <span>Inspect Report</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
