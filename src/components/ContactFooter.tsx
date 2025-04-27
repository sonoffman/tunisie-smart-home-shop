
// Do not modify this file directly. This file is part of the Lovable project template.
import React from 'react';

const ContactFooter = () => {
  return (
    <div className="bg-gray-100 py-12">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-full space-y-4">
            <h2 className="text-2xl font-bold text-sonoff-blue">Contact</h2>
            <p className="text-gray-700">
              Vous avez des questions ou des préoccupations? Contactez-nous et notre équipe vous répondra dans les plus brefs délais.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
              <div className="space-y-2">
                <p className="font-semibold">Adresse</p>
                <p className="text-gray-600">123 Rue de l'Innovation, Tunis 1001, Tunisie</p>
              </div>
              
              <div className="space-y-2">
                <p className="font-semibold">Téléphone</p>
                <p className="text-gray-600">+216 71 234 567</p>
              </div>
              
              <div className="space-y-2">
                <p className="font-semibold">Email</p>
                <p className="text-gray-600">info@sonoff-tunisie.com</p>
              </div>
              
              <div className="space-y-2">
                <p className="font-semibold">Heures d'ouverture</p>
                <p className="text-gray-600">Lundi - Vendredi: 9h - 18h</p>
                <p className="text-gray-600">Samedi: 9h - 13h</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactFooter;
