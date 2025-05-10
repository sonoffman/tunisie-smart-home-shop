
import React from 'react';
import { Link } from 'react-router-dom';
import { X, Wifi, Radio, ToggleLeft, Monitor, Package, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber?: string;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, phoneNumber = '50330000' }) => {
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
