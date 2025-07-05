
import React from 'react';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import CategoryDropdown from './CategoryDropdown';

const Navigation = () => {
  const isMobile = useIsMobile();

  if (isMobile) return null;

  return (
    <nav className="hidden md:flex space-x-8">
      <CategoryDropdown />
      <Link 
        to="/products" 
        className="text-gray-700 hover:text-sonoff-blue transition-colors"
      >
        Tous les produits
      </Link>
      <Link 
        to="/verify-product" 
        className="text-gray-700 hover:text-sonoff-blue transition-colors"
      >
        Vérif num série
      </Link>
      <Link 
        to="/blog" 
        className="text-gray-700 hover:text-sonoff-blue transition-colors"
      >
        Blog
      </Link>
      <Link 
        to="/training" 
        className="text-gray-700 hover:text-sonoff-blue transition-colors"
      >
        Formation
      </Link>
    </nav>
  );
};

export default Navigation;
