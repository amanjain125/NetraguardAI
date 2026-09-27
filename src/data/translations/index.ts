import { en } from './en';
import { hi } from './hi';
import { kn } from './kn';
import type { LanguageOption } from '../../types/screening';

export const translations = {
  en,
  hi,
  kn,
};

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
  { code: 'kn', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ' },
];

// Readily extensible future languages roadmap for India
export const UPCOMING_LANGUAGES = [
  'Tamil (தமிழ்)',
  'Telugu (తెలుగు)',
  'Malayalam (മലയാളം)',
  'Marathi (मराठी)',
  'Bengali (বাংলা)',
];
