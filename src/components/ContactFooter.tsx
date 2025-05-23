
import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

const ContactFooter = () => {
  return (
    <div className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <h3 className="text-xl font-bold mb-4">Contactez-nous</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center">
            <Phone className="mr-3 h-5 w-5 text-sonoff-orange" />
            <div>
              <p className="font-semibold">Téléphone</p>
              <a href="tel:+21650330000" className="text-gray-300 hover:text-white transition-colors">
                +216 50 330 000
              </a>
            </div>
          </div>
          
          <div className="flex items-center">
            <Mail className="mr-3 h-5 w-5 text-sonoff-orange" />
            <div>
              <p className="font-semibold">Email</p>
              <a href="mailto:contact@sonoff-tunisie.com" className="text-gray-300 hover:text-white transition-colors">
                contact@sonoff-tunisie.com
              </a>
            </div>
          </div>
          
          <div className="flex items-center">
            <MapPin className="mr-3 h-5 w-5 text-sonoff-orange" />
            <div>
              <p className="font-semibold">Localisation</p>
              <a 
                href="https://www.google.com/maps?q=36.734334,10.312741" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Voir sur Google Maps
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactFooter;
