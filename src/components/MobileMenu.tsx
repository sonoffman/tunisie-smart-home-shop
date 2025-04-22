
import React from 'react';
import { Link } from 'react-router-dom';
import { X, Wifi, Radio, ToggleLeft, Monitor, Package } from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const categories = [
    { id: 'wifi', name: 'Module WiFi', icon: <Wifi size={20} /> },
    { id: 'zigbee', name: 'Module ZigBee', icon: <Radio size={20} /> },
    { id: 'switch', name: 'Interrupteur', icon: <ToggleLeft size={20} /> },
    { id: 'screen', name: 'Écran', icon: <Monitor size={20} /> },
    { id: 'accessories', name: 'Accessoires', icon: <Package size={20} /> },
  ];

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
            {categories.map((category) => (
              <li key={category.id}>
                <Link 
                  to={`/category/${category.id}`} 
                  className="flex items-center space-x-3 text-gray-700 hover:text-sonoff-blue px-2 py-2 rounded-md hover:bg-gray-100"
                  onClick={onClose}
                >
                  <span className="text-sonoff-blue">{category.icon}</span>
                  <span>{category.name}</span>
                </Link>
              </li>
            ))}
          </ul>
          
          <div className="mt-8 pt-6 border-t">
            <p className="px-2 mb-2 text-sm text-gray-500">Contact</p>
            <p className="px-2 font-semibold">50330000</p>
            <p className="px-2 text-sm">contact@sonoff-tunisie.com</p>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default MobileMenu;
