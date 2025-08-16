import React from 'react';
import { Helmet } from 'react-helmet-async';
import Layout from '@/components/Layout';
import { useCMSContent } from '@/hooks/useCMSContent';

const Shipping = () => {
  const fallbackContent = `
    <section>
      <h2 class="text-2xl font-semibold mb-4">Zones de Livraison</h2>
      <p class="text-gray-700 leading-relaxed mb-4">
        Nous livrons dans toute la Tunisie. Nos services de livraison couvrent :
      </p>
      <ul class="list-disc list-inside text-gray-700 mb-6 space-y-1">
        <li>Grand Tunis et banlieues</li>
        <li>Toutes les gouvernorats de Tunisie</li>
        <li>Zones urbaines et rurales</li>
      </ul>
    </section>

    <section>
      <h2 class="text-2xl font-semibold mb-4">Délais de Livraison</h2>
      <p class="text-gray-700 leading-relaxed mb-4">
        Les délais de livraison varient selon votre localisation :
      </p>
      <ul class="list-disc list-inside text-gray-700 mb-6 space-y-1">
        <li><strong>Grand Tunis :</strong> 24-48h ouvrées</li>
        <li><strong>Autres gouvernorats :</strong> 2-4 jours ouvrés</li>
        <li><strong>Zones éloignées :</strong> 3-5 jours ouvrés</li>
      </ul>
    </section>

    <section>
      <h2 class="text-2xl font-semibold mb-4">Frais de Livraison</h2>
      <p class="text-gray-700 leading-relaxed mb-4">
        Nos tarifs de livraison sont calculés selon la destination :
      </p>
      <ul class="list-disc list-inside text-gray-700 mb-6 space-y-1">
        <li><strong>Grand Tunis :</strong> 7 TND</li>
        <li><strong>Autres gouvernorats :</strong> 12 TND</li>
        <li><strong>Livraison gratuite</strong> pour les commandes supérieures à 200 TND</li>
      </ul>
    </section>

    <section>
      <h2 class="text-2xl font-semibold mb-4">Modalités de Livraison</h2>
      <p class="text-gray-700 leading-relaxed mb-4">
        Nos modalités de livraison incluent :
      </p>
      <ul class="list-disc list-inside text-gray-700 mb-6 space-y-1">
        <li>Livraison à domicile ou au bureau</li>
        <li>Paiement à la livraison disponible</li>
        <li>Suivi de commande par SMS/WhatsApp</li>
        <li>Emballage sécurisé pour tous les produits</li>
      </ul>
    </section>

    <section>
      <h2 class="text-2xl font-semibold mb-4">Contact Livraison</h2>
      <p class="text-gray-700 leading-relaxed">
        Pour toute question concernant votre livraison, contactez-nous via WhatsApp 
        ou téléphone. Notre équipe est disponible pour vous assister.
      </p>
    </section>
  `;

  const { title, content, loading } = useCMSContent(
    'shipping',
    'Livraison',
    fallbackContent
  );

  return (
    <Layout>
      <Helmet>
        <title>{title} - SONOFF Tunisie | Modalités et Tarifs</title>
        <meta name="description" content="Découvrez nos modalités de livraison en Tunisie. Tarifs, délais et zones de livraison pour vos commandes SONOFF." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-sonoff-blue">{title}</h1>
        
        {loading ? (
          <div className="text-center py-8">Chargement...</div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Shipping;