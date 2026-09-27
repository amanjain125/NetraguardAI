import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  X, 
  Search, 
  Activity, 
  User,
  LogOut,
  Stethoscope,
  ChevronDown
} from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { LanguageSelector } from './LanguageSelector';
import logoImg from '../../assets/logo.jpeg';
import type { DoctorProfile } from '../../types/auth';

export type PageRoute = 'home' | 'screening' | 'dashboard' | 'history' | 'how-it-works' | 'results';

interface Props {
  currentPage: PageRoute;
  onNavigate: (page: PageRoute) => void;
  currentDoctor?: DoctorProfile | null;
  onLogout?: () => void;
}

export const Navbar: React.FC<Props> = ({ currentPage, onNavigate, currentDoctor, onLogout }) => {
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [doctorMenuOpen, setDoctorMenuOpen] = useState(false);
  const doctorMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (doctorMenuRef.current && !doctorMenuRef.current.contains(e.target as Node)) {
        setDoctorMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { id: 'home' as PageRoute, label: t.nav.home },
    { id: 'screening' as PageRoute, label: t.nav.screening },
    { id: 'dashboard' as PageRoute, label: t.nav.dashboard },
    { id: 'history' as PageRoute, label: t.nav.history },
    { id: 'how-it-works' as PageRoute, label: t.nav.howItWorks },
  ];

  const handleNavClick = (page: PageRoute) => {
    onNavigate(page);
    setMobileMenuOpen(false);
    setSearchOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('dashboard');
      setSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-sky-100/85 backdrop-blur-md border-b border-sky-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-13 sm:h-14">
          
          {/* ================================================================= */}
          {/* Brand Logo: Wordmark First + Compact Retinal Badge Icon           */}
          {/* ================================================================= */}
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-1.5 sm:gap-2 cursor-pointer group select-none shrink-0"
          >
            <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 group-hover:text-sky-700 transition-colors">
              NETRA<span className="text-sky-600">GUARD</span>
            </span>

            {/* Official Circular Retinal Emblem with User's Logo */}
            <div className="relative flex items-center justify-center w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full overflow-hidden border border-sky-300 shadow-2xs shadow-sky-600/30 text-white transition-transform group-hover:scale-105 bg-white shrink-0">
              <img src={logoImg} alt="NETRAGUARD Logo" className="w-full h-full object-cover select-none" />
              {/* Subtle pulsing live indicator node */}
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
            </div>

            <span className="px-1 py-0.5 text-[8px] font-extrabold tracking-wider uppercase rounded bg-sky-200/80 text-sky-800 border border-sky-300/80 hidden sm:inline-block">
              AI
            </span>
          </div>

          {/* ================================================================= */}
          {/* Navigation Links: Smaller, compact buttons with subtle active bar */}
          {/* ================================================================= */}
          <nav className="hidden lg:flex items-center h-full">
            {navLinks.map((link) => {
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`relative h-full px-3 lg:px-3.5 xl:px-4 flex items-center text-[12px] sm:text-[13px] font-semibold tracking-tight whitespace-nowrap transition-all duration-150 border-b-2 ${
                    isActive
                      ? 'bg-sky-200/40 text-slate-950 border-sky-600'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-sky-200/20 border-transparent'
                  }`}
                >
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>

          {/* ================================================================= */}
          {/* Right Action Cluster: Search -> Activity -> Lang -> Profile       */}
          {/* ================================================================= */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Search Icon Toggle */}
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              title="Search cases or patients"
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-950 hover:bg-sky-200/40 transition-colors"
              aria-label="Search"
            >
              <Search className="w-3.5 h-3.5" />
            </button>

            {/* Quick Screening Intake Icon */}
            <button
              type="button"
              onClick={() => handleNavClick('screening')}
              title="Quick Fundus Screening Intake"
              className="p-1.5 rounded-lg text-slate-600 hover:text-sky-700 hover:bg-sky-200/40 transition-colors"
              aria-label="Screening portal"
            >
              <Activity className="w-3.5 h-3.5" />
            </button>

            {/* Language Selector */}
            <div className="hidden sm:block">
              <LanguageSelector compact />
            </div>

            {/* Doctor Profile Menu at Far Right Corner */}
            <div className="relative" ref={doctorMenuRef}>
              <button
                type="button"
                onClick={() => setDoctorMenuOpen(!doctorMenuOpen)}
                title={currentDoctor ? `${currentDoctor.name} (${currentDoctor.role})` : "Doctor Clinical Profile / Workspace"}
                className="flex items-center gap-1.5 pl-1.5 pr-2 sm:pr-2.5 py-1 rounded-full bg-white/95 border border-sky-300 text-slate-800 hover:text-sky-700 hover:border-sky-400 shadow-2xs transition-all active:scale-95 cursor-pointer"
                aria-label="Clinician workspace and profile"
              >
                <div className="relative w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px] font-bold">
                  {currentDoctor ? currentDoctor.name.replace('Dr. ', '').charAt(0) : <User className="w-3.5 h-3.5" />}
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-white"></span>
                </div>
                {currentDoctor && (
                  <span className="text-[11px] font-bold text-slate-800 hidden md:inline-block max-w-[100px] truncate">
                    {currentDoctor.name.split(' ')[0]} {currentDoctor.name.split(' ')[1] || ''}
                  </span>
                )}
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* Doctor Profile Dropdown */}
              {doctorMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200/90 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-100 text-sky-800 border border-sky-200 font-bold">
                        VERIFIED CLINICIAN
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {currentDoctor?.name || 'Dr. Kalyani Sharma'}
                    </div>
                    <div className="text-[11px] text-sky-700 font-medium truncate">
                      {currentDoctor?.role || 'Chief Ophthalmologist'}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate mt-0.5">
                      {currentDoctor?.hospital || 'AIIMS Apex Eye Centre'}
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        onNavigate('dashboard');
                        setDoctorMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                      <Stethoscope className="w-3.5 h-3.5 text-sky-600" />
                      <span>Doctor Review Dashboard</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onNavigate('screening');
                        setDoctorMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                      <Activity className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Start Retinal Screening</span>
                    </button>
                  </div>

                  {onLogout && (
                    <div className="border-t border-slate-100 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setDoctorMenuOpen(false);
                          onLogout();
                        }}
                        className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-600" />
                        <span>Log Out / Switch Account</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:text-slate-950 hover:bg-sky-200/40 focus:outline-none transition-colors ml-0.5"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Quick Search Slide-Down Bar */}
        {searchOpen && (
          <form 
            onSubmit={handleSearchSubmit}
            className="py-2.5 px-1 border-t border-sky-200/80 flex items-center gap-3 animate-in fade-in slide-in-from-top-1 duration-150"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-sky-600 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient record by ID (e.g. PT-KA-9402) or clinic location..."
                className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl bg-white/90 border border-sky-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Mobile Slide-down Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-sky-200/80 space-y-1 animate-in slide-in-from-top-2 duration-150">
            {navLinks.map((link) => {
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-left transition-colors ${
                    isActive
                      ? 'bg-sky-200/60 text-sky-950 font-bold border-l-4 border-sky-600 pl-3'
                      : 'text-slate-700 hover:bg-sky-200/30 hover:text-slate-950'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-sky-600"></span>}
                </button>
              );
            })}

            <div className="pt-3 mt-2 border-t border-sky-200/80 flex items-center justify-between px-3">
              <span className="text-xs text-slate-600 font-medium">Language:</span>
              <LanguageSelector />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
