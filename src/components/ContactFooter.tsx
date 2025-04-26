
import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const ContactFooter: React.FC = () => {
  return (
    <div className="bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Contactez-nous</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Phone */}
          <div className="flex flex-col items-center">
            <div className="bg-sonoff-blue text-white p-3 rounded-full mb-3">
              <Phone size={24} />
            </div>
            <h3 className="text-lg font-semibold mb-1">Téléphone</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a 
                    href="tel:+21655123456" 
                    className="text-sonoff-blue hover:underline"
                  >
                    +216 55 123 456
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Cliquer pour appeler</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <p className="text-sm text-gray-600 mt-1">Lun-Ven: 9h-18h</p>
          </div>
          
          {/* Email */}
          <div className="flex flex-col items-center">
            <div className="bg-sonoff-blue text-white p-3 rounded-full mb-3">
              <Mail size={24} />
            </div>
            <h3 className="text-lg font-semibold mb-1">Email</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a 
                    href="mailto:contact@sonoff-store.tn" 
                    className="text-sonoff-blue hover:underline"
                  >
                    contact@sonoff-store.tn
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Cliquer pour envoyer un email</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <p className="text-sm text-gray-600 mt-1">Réponse sous 24h</p>
          </div>
          
          {/* Address */}
          <div className="flex flex-col items-center">
            <div className="bg-sonoff-blue text-white p-3 rounded-full mb-3">
              <MapPin size={24} />
            </div>
            <h3 className="text-lg font-semibold mb-1">Adresse</h3>
            <p className="text-center">123 Rue de la Domotique</p>
            <p className="text-center">Tunis, Tunisie</p>
            <p className="text-sm text-gray-600 mt-1">Code Postal: 1000</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactFooter;
