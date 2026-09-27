import React from 'react';
import { Navbar } from '../components/common/Navbar';
import type { PageRoute } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { MedicalDisclaimer } from '../components/common/MedicalDisclaimer';

import type { DoctorProfile } from '../types/auth';

interface Props {
  children: React.ReactNode;
  currentPage: PageRoute;
  onNavigate: (page: PageRoute) => void;
  currentDoctor?: DoctorProfile | null;
  onLogout?: () => void;
}

export const MainLayout: React.FC<Props> = ({ children, currentPage, onNavigate, currentDoctor, onLogout }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-sky-100 selection:text-sky-900">
      {/* Top Clinical Safety Banner */}
      <div className="no-print">
        <MedicalDisclaimer variant="banner" />
      </div>

      {/* Main Navbar with Doctor session */}
      <div className="no-print">
        <Navbar
          currentPage={currentPage}
          onNavigate={onNavigate}
          currentDoctor={currentDoctor}
          onLogout={onLogout}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 w-full animate-in fade-in duration-150">
        {children}
      </main>

      {/* Footer */}
      <div className="no-print">
        <Footer onNavigate={onNavigate} />
      </div>
    </div>
  );
};
