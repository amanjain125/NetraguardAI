import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { SUPPORTED_LANGUAGES, UPCOMING_LANGUAGES } from '../../data/translations';
import type { SupportedLanguage } from '../../types/screening';

export const LanguageSelector: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white/90 text-slate-700 hover:bg-white hover:border-slate-300 focus:outline-none shadow-2xs transition-colors whitespace-nowrap ${
          compact ? 'px-2 py-1 text-[11px] font-semibold' : 'px-3 py-1.5 text-xs font-medium'
        }`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Globe className={compact ? "w-3 h-3 text-sky-600 shrink-0" : "w-3.5 h-3.5 text-sky-600 shrink-0"} />
        <span>{compact ? currentLang.code.toUpperCase() : currentLang.nativeLabel}</span>
        <ChevronDown className={`text-slate-400 transition-transform ${compact ? "w-2.5 h-2.5" : "w-3.5 h-3.5"} ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-xl bg-white shadow-xl ring-1 ring-slate-900/5 border border-slate-100 p-1.5 focus:outline-none animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Active Languages
          </div>
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = lang.code === language;
            return (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code as SupportedLanguage);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg text-left transition-colors ${
                  isSelected
                    ? 'bg-sky-50 text-sky-900 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div>
                  <span className="block font-medium">{lang.nativeLabel}</span>
                  <span className="block text-[10px] text-slate-400 font-normal">{lang.label}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-sky-600" />}
              </button>
            );
          })}

          <div className="mt-2 pt-2 border-t border-slate-100 px-2.5 py-1">
            <span className="text-[10px] text-slate-400 font-medium">Coming Soon (Rural Triage):</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {UPCOMING_LANGUAGES.map((item) => (
                <span
                  key={item}
                  className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-500"
                >
                  {item.split(' ')[0]}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
