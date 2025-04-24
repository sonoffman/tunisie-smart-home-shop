
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MobileMenu from './MobileMenu';
import { UserMenu } from './UserMenu';
import { useCart } from '@/contexts/CartContext';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { totalItems } = useCart();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
    // Will implement search functionality when connected to Supabase
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="h-20 flex items-center justify-between">
          {/* Mobile Menu Button */}
          <button 
            onClick={toggleMenu} 
            className="lg:hidden text-sonoff-blue"
            aria-label="Menu"
          >
            <Menu size={24} />
          </button>

          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-sonoff-blue">
            SONOFF Tunisie
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex relative w-1/3">
            <Input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10"
            />
            <Button 
              type="submit" 
              variant="ghost" 
              size="icon" 
              className="absolute right-0 top-0 h-full"
            >
              <Search size={20} />
            </Button>
          </form>

          {/* Contact */}
          <div className="hidden md:flex items-center">
            <span className="font-semibold text-sonoff-blue">50330000</span>
          </div>

          {/* User Account & Cart */}
          <div className="flex items-center space-x-4">
            <UserMenu />
            <Link to="/cart" className="text-sonoff-blue hover:text-sonoff-orange transition-colors relative">
              <ShoppingCart size={24} />
              {totalItems > 0 && (
                <Badge variant="destructive" className="absolute -top-2 -right-2 rounded-full px-1.5 min-w-[20px] h-5 flex items-center justify-center">
                  {totalItems}
                </Badge>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu isOpen={isMenuOpen} onClose={toggleMenu} />
    </header>
  );
};

export default Header;
