
import React, { useState, useCallback } from 'react';
import UniversityPortal from './pages/UniversityPortal';
import StudentWallet from './pages/StudentWallet';
import EmployerVerifier from './pages/EmployerVerifier';
import Header from './components/Header';
import { ToastProvider } from './contexts/ToastContext';

export type Portal = 'university' | 'student' | 'verifier';

const App: React.FC = () => {
  const [activePortal, setActivePortal] = useState<Portal>('university');

  const renderPortal = useCallback(() => {
    switch (activePortal) {
      case 'university':
        return <UniversityPortal />;
      case 'student':
        return <StudentWallet />;
      case 'verifier':
        return <EmployerVerifier />;
      default:
        return <UniversityPortal />;
    }
  }, [activePortal]);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-aged-paper font-serif text-ledger-brown">
        <Header activePortal={activePortal} setActivePortal={setActivePortal} />
        <main className="p-4 sm:p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {renderPortal()}
          </div>
        </main>
        <footer className="text-center p-4 text-ledger-brown/60 text-sm">
           <div className="w-full max-w-lg mx-auto border-b border-ledger-brown/20 mb-2"></div>
          <p>&copy; {new Date().getFullYear()} AcademiChain Ledger. A Demonstration of Verifiable Credentials.</p>
        </footer>
      </div>
    </ToastProvider>
  );
};

export default App;