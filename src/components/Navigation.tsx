
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wifi, Radio, ToggleLeft, Monitor, Package } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();
  
  const categories = [
    { id: 'wifi', name: 'Module WiFi', icon: <Wifi size={20} /> },
    { id: 'zigbee', name: 'Module ZigBee', icon: <Radio size={20} /> },
    { id: 'switch', name: 'Interrupteur', icon: <ToggleLeft size={20} /> },
    { id: 'screen', name: 'Écran', icon: <Monitor size={20} /> },
    { id: 'accessories', name: 'Accessoires', icon: <Package size={20} /> },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <nav className="bg-gray-100 border-y">
      <div className="container mx-auto px-4">
        <ul className="flex flex-wrap justify-around">
          {categories.map((category) => (
            <li key={category.id} className="py-3">
              <Link 
                to={`/category/${category.id}`} 
                className={`flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-sonoff-blue transition-colors ${
                  isActive(`/category/${category.id}`) ? 'font-bold text-sonoff-blue' : ''
                }`}
              >
                <span className="text-sonoff-blue">{category.icon}</span>
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
