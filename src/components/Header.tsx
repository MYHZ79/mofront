import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Goal,Target, Plus, LogIn, User, ChevronDown } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';

interface HeaderProps {
  onShowAuth: () => void;
}

export function Header({ onShowAuth }: HeaderProps) {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { isAuthenticated } = useAuthContext();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800/50 z-50 transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link 
              to="/" 
              className="flex items-center gap-2 group relative"
              onMouseEnter={() => {
                const logo = document.querySelector('.logo-animation');
                if (logo) logo.classList.add('animate-pulse');
              }}
              onMouseLeave={() => {
                const logo = document.querySelector('.logo-animation');
                if (logo) logo.classList.remove('animate-pulse');
              }}
            >
              <div className="logo-animation w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20 group-hover:shadow-red-500/30 transition-all duration-300">
                <Goal className="w-6 h-6 text-white transform group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                موتیو
              </span>
            </Link>

            {isAuthenticated && (
              <nav className="hidden md:flex items-center gap-6">
                <Link
                  to="/goals"
                  className={`text-sm font-medium transition-all duration-200 relative ${
                    isActive('/goals')
                      ? 'text-red-500'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <span className="relative z-10">اهداف من</span>
                  {isActive('/goals') && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500 transform -translate-y-1"></span>
                  )}
                </Link>
                <Link
                  to="/profile"
                  className={`text-sm font-medium transition-all duration-200 relative ${
                    isActive('/profile')
                      ? 'text-red-500'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <span className="relative z-10">پروفایل</span>
                  {isActive('/profile') && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500 transform -translate-y-1"></span>
                  )}
                </Link>
              </nav>
            )}
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/create-goal"
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-2.5 rounded-lg font-medium hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center gap-2 shadow-lg shadow-red-500/20 hover:shadow-red-500/30"
                >
                  <Plus className="w-4 h-4" />
                  هدف جدید
                </Link>
                
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-lg shadow-gray-900/20"
                  >
                    <User className="w-5 h-5 text-gray-300" />
                  </button>
                  
                  {userMenuOpen && (
                    <div 
                      className="absolute left-0 mt-2 w-48 bg-gray-800 rounded-xl shadow-xl py-1 border border-gray-700/50 backdrop-blur-sm"
                      onMouseLeave={() => setUserMenuOpen(false)}
                    >
                      <Link
                        to="/profile"
                        className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors flex items-center gap-2"
                      >
                        <User className="w-4 h-4" />
                        پروفایل
                      </Link>
                      <Link
                        to="/goals"
                        className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors flex items-center gap-2"
                      >
                        <Target className="w-4 h-4" />
                        اهداف من
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-right px-4 py-2.5 text-sm text-red-500 hover:bg-gray-700/50 transition-colors flex items-center gap-2"
                      >
                        <LogIn className="w-4 h-4" />
                        خروج
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button
                onClick={onShowAuth}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-2.5 rounded-lg font-medium hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center gap-2 shadow-lg shadow-red-500/20 hover:shadow-red-500/30"
              >
                <LogIn className="w-4 h-4" />
                ورود
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
