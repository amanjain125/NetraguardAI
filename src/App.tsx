import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './hooks/useLanguage';
import { MainLayout } from './layouts/MainLayout';
import type { PageRoute } from './components/common/Navbar';
import { HomePage } from './pages/HomePage';
import { ScreeningPage } from './pages/ScreeningPage';
import { ResultsPage } from './pages/ResultsPage';
import { DoctorDashboardPage } from './pages/DoctorDashboardPage';
import { HistoryPage } from './pages/HistoryPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { DEMO_SCREENING_RECORDS } from './data/demoData';
import type { ScreeningResult } from './types/screening';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageRoute>(() => {
    const hash = window.location.hash.replace('#', '') as PageRoute;
    const validPages: PageRoute[] = ['home', 'screening', 'dashboard', 'history', 'how-it-works', 'results'];
    return validPages.includes(hash) ? hash : 'home';
  });

  const [selectedResult, setSelectedResult] = useState<ScreeningResult>(DEMO_SCREENING_RECORDS[0]);

  // Sync hash with route for clean bookmarking and navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as PageRoute;
      const validPages: PageRoute[] = ['home', 'screening', 'dashboard', 'history', 'how-it-works', 'results'];
      if (validPages.includes(hash)) {
        setCurrentPage(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (page: PageRoute) => {
    setCurrentPage(page);
    window.location.hash = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectRecordForDetail = (record: ScreeningResult) => {
    setSelectedResult(record);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'screening':
        return (
          <ScreeningPage
            onNavigate={handleNavigate}
            onSetSelectedResult={handleSelectRecordForDetail}
          />
        );
      case 'results':
        return (
          <ResultsPage
            result={selectedResult}
            onNavigate={handleNavigate}
          />
        );
      case 'dashboard':
        return (
          <DoctorDashboardPage
            onNavigate={handleNavigate}
            onSelectRecordForDetail={handleSelectRecordForDetail}
          />
        );
      case 'history':
        return (
          <HistoryPage
            onNavigate={handleNavigate}
            onSelectRecord={handleSelectRecordForDetail}
          />
        );
      case 'how-it-works':
        return <HowItWorksPage onNavigate={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <LanguageProvider>
      <MainLayout currentPage={currentPage} onNavigate={handleNavigate}>
        {renderCurrentPage()}
      </MainLayout>
    </LanguageProvider>
  );
};

export default App;
