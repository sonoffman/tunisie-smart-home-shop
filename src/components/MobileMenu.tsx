
import React from 'react';
import { Link } from 'react-router-dom';
import { X, MessageSquare, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, phoneNumber = '50330000' }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCategories, setShowCategories] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  if (!isOpen) return null;

  const whatsappNumber = "21650330000";
  const whatsappMessage = encodeURIComponent("Bonjour je souhaite avoir plus d'informations");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="h-full w-3/4 max-w-xs bg-white shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-sonoff-blue">Menu</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-4">
            <li>
              <a 
                href={whatsappUrl}
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center bg-green-500 text-white px-4 py-3 rounded-md hover:bg-green-600 transition-all mb-4"
              >
                <MessageSquare size={20} className="mr-2" />
                <span>Contacter via WhatsApp</span>
              </a>
            </li>
            
            <li>
              <button
                onClick={() => setShowCategories(!showCategories)}
                className="flex items-center justify-between w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <span>Catégories</span>
                <ChevronDown 
                  size={16} 
                  className={`transform transition-transform ${showCategories ? 'rotate-180' : ''}`}
                />
              </button>
              
              {showCategories && (
                <ul className="ml-4 mt-2 space-y-2">
                  {categories.map((category) => (
                    <li key={category.id}>
                      <Link 
                        to={`/category/${category.slug}`}
                        onClick={onClose}
                        className="flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md"
                      >
                        {category.icon && (
                          <span className="mr-2 text-lg">{category.icon}</span>
                        )}
                        {category.name}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link 
                      to="/products"
                      onClick={onClose}
                      className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md border-t pt-3"
                    >
                      Tous les produits
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            <li>
              <Link 
                to="/products" 
                onClick={onClose}
                className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Tous les produits
              </Link>
            </li>
            
            <li>
              <Link 
                to="/verify-product" 
                onClick={onClose}
                className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Vérif num série
              </Link>
            </li>
            
            <li>
              <Link 
                to="/blog" 
                onClick={onClose}
                className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Blog
              </Link>
            </li>
            
            <li>
              <Link 
                to="/training" 
                onClick={onClose}
                className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Formation
              </Link>
            </li>
          </ul>
          
          <div className="mt-8 pt-6 border-t">
            <p className="px-2 mb-2 text-sm text-gray-500">Contact</p>
            <p className="px-2 font-semibold">{phoneNumber}</p>
            <p className="px-2 text-sm">contact@sonoff-tunisie.com</p>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default MobileMenu;
