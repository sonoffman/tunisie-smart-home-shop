
import React from 'react';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import CategoryDropdown from './CategoryDropdown';

const Navigation = () => {
  const isMobile = useIsMobile();

  if (isMobile) return null;

  return (
    <nav className="hidden md:flex items-center">
      <div className="flex items-center space-x-1 bg-gradient-to-r from-slate-50 to-white rounded-lg px-4 py-2 shadow-sm border border-slate-200">
        <CategoryDropdown />
        <div className="h-6 w-px bg-slate-300 mx-4"></div>
        <Link 
          to="/verify-product" 
          className="text-slate-700 hover:text-sonoff-blue hover:bg-slate-100 px-3 py-2 rounded-md transition-all duration-200 font-medium text-sm"
        >
          Vérif num série
        </Link>
        <Link 
          to="/blog" 
          className="text-slate-700 hover:text-sonoff-blue hover:bg-slate-100 px-3 py-2 rounded-md transition-all duration-200 font-medium text-sm"
        >
          Blog
        </Link>
        <Link 
          to="/training" 
          className="text-slate-700 hover:text-sonoff-blue hover:bg-slate-100 px-3 py-2 rounded-md transition-all duration-200 font-medium text-sm"
        >
          Formation
        </Link>
      </div>
    </nav>
  );
};

export default Navigation;
