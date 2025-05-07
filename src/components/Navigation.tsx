
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wifi, Radio, ToggleLeft, Monitor, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Define interface for category from database
interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

const Navigation = () => {
  const location = useLocation();
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Default categories as fallback
  const defaultCategories = [
    { id: '1', name: 'Module WiFi', slug: 'wifi', icon: 'wifi' },
    { id: '2', name: 'Module ZigBee', slug: 'zigbee', icon: 'radio' },
    { id: '3', name: 'Interrupteur', slug: 'switch', icon: 'toggle-left' },
    { id: '4', name: 'Écran', slug: 'screen', icon: 'monitor' },
    { id: '5', name: 'Accessoires', slug: 'accessories', icon: 'package' },
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name');

        if (error) throw error;
        
        if (data && data.length > 0) {
          setCategories(data);
        } else {
          // Use default categories if none in the database
          setCategories(defaultCategories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Use default categories as fallback
        setCategories(defaultCategories);
      }
    };

    fetchCategories();
  }, []);

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  // Get the appropriate icon component based on icon name
  const getIconComponent = (iconName: string | null) => {
    switch (iconName) {
      case 'wifi':
        return <Wifi size={20} />;
      case 'radio':
        return <Radio size={20} />;
      case 'toggle-left':
        return <ToggleLeft size={20} />;
      case 'monitor':
        return <Monitor size={20} />;
      case 'package':
        return <Package size={20} />;
      default:
        return <Package size={20} />; // Default icon
    }
  };

  return (
    <nav className="bg-gray-100 border-y w-full z-10">
      <div className="container mx-auto px-4">
        <ul className="flex flex-wrap justify-around">
          {categories.map((category) => (
            <li key={category.id} className="py-3">
              <Link 
                to={`/category/${category.slug}`} 
                className={`flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-sonoff-blue transition-colors ${
                  isActive(`/category/${category.slug}`) ? 'font-bold text-sonoff-blue' : ''
                }`}
              >
                <span className="text-sonoff-blue">{getIconComponent(category.icon)}</span>
                <span>{category.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
