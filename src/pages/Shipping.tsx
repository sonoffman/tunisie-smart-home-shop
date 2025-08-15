import React from 'react';
import { Helmet } from 'react-helmet-async';

const Shipping = () => {
  return (
    <>
      <Helmet>
        <title>Livraison - SONOFF Tunisie | Modalités et Tarifs</title>
        <meta name="description" content="Découvrez nos modalités de livraison en Tunisie. Tarifs, délais et zones de livraison pour vos commandes SONOFF." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Livraison</h1>
        
        <div className="max-w-4xl mx-auto space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Zones de Livraison</h2>
            <p className="text-gray-700 leading-relaxed">
              Nous livrons dans toute la Tunisie. Nos services de livraison couvrent :
            </p>
            <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
              <li>Grand Tunis et banlieues</li>
              <li>Toutes les gouvernorats de Tunisie</li>
              <li>Zones urbaines et rurales</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Délais de Livraison</h2>
            <p className="text-gray-700 leading-relaxed">
              Les délais de livraison varient selon votre localisation :
            </p>
            <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
              <li><strong>Grand Tunis :</strong> 24-48h ouvrées</li>
              <li><strong>Autres gouvernorats :</strong> 2-4 jours ouvrés</li>
              <li><strong>Zones éloignées :</strong> 3-5 jours ouvrés</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Frais de Livraison</h2>
            <p className="text-gray-700 leading-relaxed">
              Nos tarifs de livraison sont calculés selon la destination :
            </p>
            <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
              <li><strong>Grand Tunis :</strong> 7 TND</li>
              <li><strong>Autres gouvernorats :</strong> 12 TND</li>
              <li><strong>Livraison gratuite</strong> pour les commandes supérieures à 200 TND</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Modalités de Livraison</h2>
            <p className="text-gray-700 leading-relaxed">
              Nos modalités de livraison incluent :
            </p>
            <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
              <li>Livraison à domicile ou au bureau</li>
              <li>Paiement à la livraison disponible</li>
              <li>Suivi de commande par SMS/WhatsApp</li>
              <li>Emballage sécurisé pour tous les produits</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Contact Livraison</h2>
            <p className="text-gray-700 leading-relaxed">
              Pour toute question concernant votre livraison, contactez-nous via WhatsApp 
              ou téléphone. Notre équipe est disponible pour vous assister.
            </p>
          </section>
        </div>
      </div>
    </>
  );
};

export default Shipping;