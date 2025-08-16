import React from 'react';
import { Helmet } from 'react-helmet-async';
import Layout from '@/components/Layout';
import { useCMSContent } from '@/hooks/useCMSContent';

const Privacy = () => {
  const fallbackContent = `
    <section>
      <h2 class="text-2xl font-semibold mb-4">1. Collecte des Données</h2>
      <p class="text-gray-700 leading-relaxed mb-6">
        Nous collectons uniquement les informations nécessaires au traitement de vos commandes 
        et à l'amélioration de nos services. Ces données incluent vos informations de contact, 
        adresse de livraison et historique de commandes.
      </p>
    </section>

    <section>
      <h2 class="text-2xl font-semibold mb-4">2. Utilisation des Données</h2>
      <p class="text-gray-700 leading-relaxed mb-4">
        Vos données personnelles sont utilisées exclusivement pour :
      </p>
      <ul class="list-disc list-inside text-gray-700 mb-6 space-y-1">
        <li>Le traitement et la livraison de vos commandes</li>
        <li>Le service client et le support technique</li>
        <li>L'amélioration de nos services</li>
        <li>L'envoi d'informations commerciales (avec votre consentement)</li>
      </ul>
    </section>

    <section>
      <h2 class="text-2xl font-semibold mb-4">3. Protection des Données</h2>
      <p class="text-gray-700 leading-relaxed mb-6">
        Nous mettons en œuvre toutes les mesures techniques et organisationnelles appropriées 
        pour protéger vos données contre l'accès non autorisé, la modification, la divulgation 
        ou la destruction.
      </p>
    </section>

    <section>
      <h2 class="text-2xl font-semibold mb-4">4. Vos Droits</h2>
      <p class="text-gray-700 leading-relaxed mb-6">
        Conformément à la réglementation en vigueur, vous disposez d'un droit d'accès, 
        de rectification, de suppression et de portabilité de vos données personnelles. 
        Vous pouvez exercer ces droits en nous contactant.
      </p>
    </section>

    <section>
      <h2 class="text-2xl font-semibold mb-4">5. Contact</h2>
      <p class="text-gray-700 leading-relaxed">
        Pour toute question relative à cette politique de confidentialité 
        ou pour exercer vos droits, contactez-nous via les moyens disponibles sur le site.
      </p>
    </section>
  `;

  const { title, content, loading } = useCMSContent(
    'privacy',
    'Politique de Confidentialité',
    fallbackContent
  );

  return (
    <Layout>
      <Helmet>
        <title>{title} - SONOFF Tunisie</title>
        <meta name="description" content="Découvrez comment SONOFF Tunisie protège vos données personnelles. Notre politique de confidentialité détaillée." />
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

export default Privacy;