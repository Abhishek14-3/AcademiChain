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
    <header className="bg-brand-primary shadow-lg">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <div className="flex-shrink-0 text-white flex items-center">
              <GraduationCap className="h-8 w-8 mr-2 text-brand-accent"/>
              <span className="text-2xl font-bold">AcademiChain</span>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActivePortal(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    activePortal === item.id
                      ? 'bg-brand-accent text-brand-dark'
                      : 'text-gray-300 hover:bg-brand-secondary hover:text-white'
                  }`}
                >
                  {item.icon}
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>
      {/* Mobile Nav */}
      <div className="md:hidden border-t border-brand-dark">
         <div className="flex justify-around p-2">
            {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActivePortal(item.id)}
                  className={`flex flex-col items-center justify-center w-full p-2 rounded-md text-xs font-medium transition-colors duration-200 ${
                    activePortal === item.id
                      ? 'bg-brand-accent text-brand-dark'
                      : 'text-gray-300 hover:bg-brand-secondary hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span className="mt-1">{item.name}</span>
                </button>
            ))}
         </div>
      </div>
    </header>
  );
};

export default Header;