
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserMenu } from './UserMenu';
import Navigation from './Navigation';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [phone, setPhone] = useState('50330000');
  const { totalItems } = useCart();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const { data, error } = await supabase
          .from('cms_pages')
          .select('content')
          .eq('slug', 'contact-info')
          .maybeSingle();

        if (error) throw error;
        
        if (data?.content) {
          try {
            const parsedInfo = JSON.parse(data.content);
            if (parsedInfo.phone) {
              setPhone(parsedInfo.phone);
            }
          } catch (parseError) {
            console.error("Error parsing contact info JSON:", parseError);
          }
        }
      } catch (error) {
        console.error("Error fetching contact info:", error);
      }
    };

    fetchContactInfo();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } catch (error) {
      console.error('Error during search:', error);
    }
  };

  const whatsappNumber = "21650330000";
  const whatsappMessage = encodeURIComponent("Bonjour je souhaite avoir plus d'informations");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <header className="bg-white shadow-sm">
      <div className={`mx-auto ${isMobile ? 'px-2' : 'container px-4'}`}>
        <div className="h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className={`font-bold text-sonoff-blue ${isMobile ? 'text-lg' : 'text-2xl'}`}>
            SONOFF Tunisie
          </Link>

          {/* Navigation - Desktop only */}
          <Navigation />

          {/* Search Bar - Hidden on Mobile */}
          <form onSubmit={handleSearch} className="hidden md:flex relative w-1/3">
            <Input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-12"
            />
            <Button 
              type="submit" 
              variant="ghost" 
              size="icon" 
              className="absolute right-0 top-0 h-full w-12"
            >
              <Search size={20} />
            </Button>
          </form>

          {/* Contact - Hidden on Mobile */}
          <div className="hidden md:flex items-center">
            <a href={`tel:${phone}`} className="font-semibold text-sonoff-blue hover:text-sonoff-orange transition-colors">
              {phone}
            </a>
          </div>

          {/* User Account & Cart */}
          <div className="flex items-center space-x-2">
            <UserMenu />
            <Link to="/cart" className="text-sonoff-blue hover:text-sonoff-orange transition-colors relative">
              <ShoppingCart size={24} />
              {totalItems > 0 && (
                <Badge variant="destructive" className="absolute -top-2 -right-2 rounded-full px-1.5 min-w-[20px] h-5 flex items-center justify-center">
                  {totalItems}
                </Badge>
              )}
            </Link>
            {isMobile && (
              <a 
                href={whatsappUrl}
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center bg-green-500 text-white px-2 py-2 rounded-md text-xs"
              >
                <MessageSquare size={14} className="mr-1" />
                <span className="font-semibold text-white">50330000 Whats Msg</span>
              </a>
            )}
          </div>
        </div>

        {/* Mobile Search Bar - Only on Mobile */}
        {isMobile && (
          <form onSubmit={handleSearch} className="relative w-full pb-4">
            <Input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-12 h-10"
            />
            <Button 
              type="submit" 
              variant="ghost" 
              size="icon" 
              className="absolute right-0 top-0 h-10 w-10"
            >
              <Search size={18} />
            </Button>
          </form>
        )}
      </div>
    </header>
  );
};

export default Header;
