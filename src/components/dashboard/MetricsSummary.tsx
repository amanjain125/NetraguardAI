import React from 'react';
import type { ScreeningResult } from '../../types/screening';
import { Users, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface Props {
  records: ScreeningResult[];
}

export const MetricsSummary: React.FC<Props> = ({ records }) => {
  const totalScreenings = records.length;
  const awaitingReview = records.filter((r) => r.clinicalStatus === 'Pending Review' || r.clinicalStatus === 'Under Review').length;
  const referralRecommended = records.filter((r) => r.referable).length;
  const completedReviews = records.filter((r) => r.clinicalStatus === 'Reviewed' || r.clinicalStatus === 'Referred').length;

  const cards = [
    {
      title: 'Total Screenings',
      value: totalScreenings,
      subtitle: 'All recorded tele-screenings',
      icon: Users,
      color: 'text-sky-600',
      bg: 'bg-sky-50',
      border: 'border-sky-100',
    },
    {
      title: 'Awaiting Review',
      value: awaitingReview,
      subtitle: 'Pending clinical sign-off',
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
    },
    {
      title: 'Specialist Referral Recommended',
      value: referralRecommended,
      subtitle: 'Moderate/Severe DR detected',
      icon: AlertTriangle,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'border-rose-100',
    },
    {
      title: 'Completed Reviews',
      value: completedReviews,
      subtitle: 'Physician reviewed cases',
      icon: CheckCircle,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl ${card.bg} ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
                {card.value}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">cases</span>
            </div>

            <p className="text-xs text-slate-400 mt-1">
              {card.subtitle}
            </p>
          </div>
        );
      })}
    </div>
  );
};
