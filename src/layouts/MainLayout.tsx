import React from 'react';
import { Navbar } from '../components/common/Navbar';
import type { PageRoute } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { MedicalDisclaimer } from '../components/common/MedicalDisclaimer';

interface Props {
  children: React.ReactNode;
  currentPage: PageRoute;
  onNavigate: (page: PageRoute) => void;
}

export const MainLayout: React.FC<Props> = ({ children, currentPage, onNavigate }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-sky-100 selection:text-sky-900">
      {/* Top Clinical Safety Banner */}
      <MedicalDisclaimer variant="banner" />

      {/* Main Navbar */}
      <Navbar currentPage={currentPage} onNavigate={onNavigate} />

      {/* Main Content Area */}
      <main className="flex-1 w-full animate-in fade-in duration-150">
        {children}
      </main>

      {/* Footer */}
      <Footer onNavigate={onNavigate} />
    </div>
  );
};
