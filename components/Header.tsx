import React from 'react';
import type { Portal } from '../App';
import { GraduationCap, Wallet, SearchCheck } from './icons/Icons';

interface HeaderProps {
  activePortal: Portal;
  setActivePortal: (portal: Portal) => void;
}

const Header: React.FC<HeaderProps> = ({ activePortal, setActivePortal }) => {
  // FIX: Replaced JSX.Element with React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
  const navItems: { id: Portal; name: string; icon: React.ReactElement }[] = [
    { id: 'university', name: 'University', icon: <GraduationCap /> },
    { id: 'student', name: 'Student', icon: <Wallet /> },
    { id: 'verifier', name: 'Employer', icon: <SearchCheck /> },
  ];

  return (
    <header className="bg-ledger-brown shadow-lg border-b-4 border-gold-trim/50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <div className="flex-shrink-0 text-aged-paper flex items-center">
              <GraduationCap className="h-9 w-9 mr-3 text-gold-trim"/>
              <span className="text-3xl font-serif">AcademiChain</span>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActivePortal(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-semibold transition-all duration-200 border border-transparent ${
                    activePortal === item.id
                      ? 'bg-gold-trim/80 text-ledger-brown shadow-emboss'
                      : 'text-aged-paper/70 hover:bg-aged-paper/10'
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>
      {/* Mobile Nav */}
      <div className="md:hidden border-t border-gold-trim/20">
         <div className="flex justify-around">
            {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActivePortal(item.id)}
                  className={`flex flex-col items-center justify-center w-full p-2 text-xs font-semibold transition-colors duration-200 ${
                    activePortal === item.id
                      ? 'bg-gold-trim/80 text-ledger-brown'
                      : 'text-aged-paper/70 hover:bg-aged-paper/10'
                  }`}
                >
                  {React.cloneElement(item.icon, { className: 'w-5 h-5 mb-1' })}
                  <span>{item.name}</span>
                </button>
            ))}
         </div>
      </div>
    </header>
  );
};

export default Header;