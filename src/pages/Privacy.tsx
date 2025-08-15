import React from 'react';
import { Helmet } from 'react-helmet-async';

const Privacy = () => {
  return (
    <>
      <Helmet>
        <title>Politique de Confidentialité - SONOFF Tunisie</title>
        <meta name="description" content="Découvrez comment SONOFF Tunisie protège vos données personnelles. Notre politique de confidentialité détaillée." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Politique de Confidentialité</h1>
        
        <div className="max-w-4xl mx-auto space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Collecte des Données</h2>
            <p className="text-gray-700 leading-relaxed">
              Nous collectons uniquement les informations nécessaires au traitement de vos commandes 
              et à l'amélioration de nos services. Ces données incluent vos informations de contact, 
              adresse de livraison et historique de commandes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Utilisation des Données</h2>
            <p className="text-gray-700 leading-relaxed">
              Vos données personnelles sont utilisées exclusivement pour :
            </p>
            <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
              <li>Le traitement et la livraison de vos commandes</li>
              <li>Le service client et le support technique</li>
              <li>L'amélioration de nos services</li>
              <li>L'envoi d'informations commerciales (avec votre consentement)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Protection des Données</h2>
            <p className="text-gray-700 leading-relaxed">
              Nous mettons en œuvre toutes les mesures techniques et organisationnelles appropriées 
              pour protéger vos données contre l'accès non autorisé, la modification, la divulgation 
              ou la destruction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Vos Droits</h2>
            <p className="text-gray-700 leading-relaxed">
              Conformément à la réglementation en vigueur, vous disposez d'un droit d'accès, 
              de rectification, de suppression et de portabilité de vos données personnelles. 
              Vous pouvez exercer ces droits en nous contactant.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Contact</h2>
            <p className="text-gray-700 leading-relaxed">
              Pour toute question relative à cette politique de confidentialité 
              ou pour exercer vos droits, contactez-nous via les moyens disponibles sur le site.
            </p>
          </section>
        </div>
      </div>
    </>
  );
};

export default Privacy;