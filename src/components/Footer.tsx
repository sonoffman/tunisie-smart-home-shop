
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ContactInfo {
  phone: string;
  email: string;
  address: string;
}

const Footer = () => {
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    phone: "50330000",
    email: "contact@sonoff-tunisie.com",
    address: "Tunis, Tunisie"
  });

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
            setContactInfo({
              phone: parsedInfo.phone || contactInfo.phone,
              email: parsedInfo.email || contactInfo.email,
              address: parsedInfo.address || contactInfo.address
            });
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

  return (
    <footer className="bg-gray-100 pt-12 pb-6 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: SONOFF Tunisie */}
          <div>
            <h3 className="text-xl font-bold text-sonoff-blue mb-4">SONOFF Tunisie</h3>
            <p className="text-gray-600">
              Votre partenaire de confiance pour les solutions domotiques intelligentes.
            </p>
          </div>

          {/* Column 2: Services */}
          <div>
            <h3 className="text-xl font-bold text-sonoff-blue mb-4">Service</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/verify-product" 
                  className="text-gray-600 hover:text-sonoff-blue transition-colors"
                >
                  Vérification du numéro de série
                </Link>
              </li>
              <li>
                <Link 
                  to="/blog" 
                  className="text-gray-600 hover:text-sonoff-blue transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link 
                  to="/training" 
                  className="text-gray-600 hover:text-sonoff-blue transition-colors"
                >
                  Inscription à une formation
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div>
            <h3 className="text-xl font-bold text-sonoff-blue mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center text-gray-600">
                <Phone size={18} className="mr-2 text-sonoff-blue" />
                <a href={`tel:${contactInfo.phone}`} className="hover:text-sonoff-blue transition-colors">
                  {contactInfo.phone}
                </a>
              </li>
              <li className="flex items-center text-gray-600">
                <Mail size={18} className="mr-2 text-sonoff-blue" />
                <a href={`mailto:${contactInfo.email}`} className="hover:text-sonoff-blue transition-colors">
                  {contactInfo.email}
                </a>
              </li>
              <li className="flex items-center text-gray-600">
                <MapPin size={18} className="mr-2 text-sonoff-blue" />
                <span>{contactInfo.address}</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Informations */}
          <div>
            <h3 className="text-xl font-bold text-sonoff-blue mb-4">Informations</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/about" 
                  className="text-gray-600 hover:text-sonoff-blue transition-colors"
                >
                  À propos de nous
                </Link>
              </li>
              <li>
                <Link 
                  to="/terms" 
                  className="text-gray-600 hover:text-sonoff-blue transition-colors"
                >
                  Conditions d'utilisation
                </Link>
              </li>
              <li>
                <Link 
                  to="/privacy" 
                  className="text-gray-600 hover:text-sonoff-blue transition-colors"
                >
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link 
                  to="/shipping" 
                  className="text-gray-600 hover:text-sonoff-blue transition-colors"
                >
                  Livraison et retours
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-10 pt-6 text-center">
          <p className="text-gray-500">© 2025 SONOFF Tunisie. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
