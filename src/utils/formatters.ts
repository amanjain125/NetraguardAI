import type { DiabeticRetinopathyGrade, ClinicalReviewStatus } from '../types/screening';

export const formatDate = (dateString: string, langCode: string = 'en'): string => {
  try {
    const d = new Date(dateString);
    const localeMap: Record<string, string> = {
      kn: 'kn-IN',
      hi: 'hi-IN',
      en: 'en-IN',
    };
    const locale = localeMap[langCode] || 'en-IN';
    return d.toLocaleDateString(locale, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export const formatTime = (dateString: string): string => {
  try {
    const d = new Date(dateString);
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '';
  }
};

export const formatPercentage = (decimal: number): string => {
  return `${Math.round(decimal * 100)}%`;
};

export const getSeverityBadgeStyle = (grade: DiabeticRetinopathyGrade): {
  bg: string;
  text: string;
  border: string;
  badge: string;
  label: string;
} => {
  switch (grade) {
    case 0:
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-800',
        border: 'border-emerald-200',
        badge: 'bg-emerald-500',
        label: 'Grade 0: No DR',
      };
    case 1:
      return {
        bg: 'bg-teal-50',
        text: 'text-teal-800',
        border: 'border-teal-200',
        badge: 'bg-teal-500',
        label: 'Grade 1: Mild NPDR',
      };
    case 2:
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-200',
        badge: 'bg-amber-500',
        label: 'Grade 2: Moderate NPDR',
      };
    case 3:
      return {
        bg: 'bg-orange-50',
        text: 'text-orange-900',
        border: 'border-orange-200',
        badge: 'bg-orange-500',
        label: 'Grade 3: Severe NPDR',
      };
    case 4:
      return {
        bg: 'bg-rose-50',
        text: 'text-rose-900',
        border: 'border-rose-200',
        badge: 'bg-rose-500',
        label: 'Grade 4: Proliferative DR',
      };
    default:
      return {
        bg: 'bg-slate-50',
        text: 'text-slate-800',
        border: 'border-slate-200',
        badge: 'bg-slate-500',
        label: 'Unknown',
      };
  }
};

export const getClinicalStatusBadge = (status: ClinicalReviewStatus) => {
  switch (status) {
    case 'Pending Review':
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500 animate-pulse',
      };
    case 'Under Review':
      return {
        bg: 'bg-sky-50 text-sky-700 border-sky-200',
        dot: 'bg-sky-500',
      };
    case 'Reviewed':
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
      };
    case 'Referred':
      return {
        bg: 'bg-purple-50 text-purple-700 border-purple-200',
        dot: 'bg-purple-500',
      };
  }
};
