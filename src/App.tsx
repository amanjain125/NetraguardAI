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
import { DoctorLoginPage } from './pages/DoctorLoginPage';
import { SplashScreen } from './components/common/SplashScreen';
import { DEMO_SCREENING_RECORDS } from './data/demoData';
import type { ScreeningResult } from './types/screening';
import type { DoctorProfile } from './types/auth';
import { getRegisteredDoctors } from './types/auth';

export const App: React.FC = () => {
  // Splash screen state: starts on initial site open
  const [showSplash, setShowSplash] = useState<boolean>(true);

  // Doctor authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('netraguard_doctor_auth') === 'true';
  });

  const [currentDoctor, setCurrentDoctor] = useState<DoctorProfile | null>(() => {
    const saved = localStorage.getItem('netraguard_doctor_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    const registered = getRegisteredDoctors();
    return registered.length > 0 ? registered[0] : null;
  });

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

  const handleLoginSuccess = (doctor: DoctorProfile) => {
    setIsAuthenticated(true);
    setCurrentDoctor(doctor);
    localStorage.setItem('netraguard_doctor_auth', 'true');
    localStorage.setItem('netraguard_doctor_profile', JSON.stringify(doctor));
    handleNavigate('home');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('netraguard_doctor_auth');
    localStorage.removeItem('netraguard_doctor_profile');
  };

  // 1. Initial Logo Splash Screen on site open
  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  // 2. Doctor Login Screen if not authenticated
  if (!isAuthenticated) {
    return (
      <LanguageProvider>
        <DoctorLoginPage 
          onLoginSuccess={handleLoginSuccess} 
          onReplaySplash={() => setShowSplash(true)} 
        />
      </LanguageProvider>
    );
  }

  // 3. Authenticated Clinical Application Pages
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
      <MainLayout
        currentPage={currentPage}
        onNavigate={handleNavigate}
        currentDoctor={currentDoctor}
        onLogout={handleLogout}
      >
        {renderCurrentPage()}
      </MainLayout>
    </LanguageProvider>
  );
};

export default App;
