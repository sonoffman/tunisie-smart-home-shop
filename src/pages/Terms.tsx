import React from 'react';
import { Helmet } from 'react-helmet-async';
import Layout from '@/components/Layout';
import { useCMSContent } from '@/hooks/useCMSContent';

const Terms = () => {
  const fallbackContent = `
    <section>
      <h2 class="text-2xl font-semibold mb-4">1. Objet</h2>
      <p class="text-gray-700 leading-relaxed mb-6">
        Les présentes conditions générales d'utilisation (CGU) ont pour objet de définir les modalités 
        et conditions d'utilisation du site SONOFF Tunisie ainsi que les services proposés.
      </p>
    </section>

    <section>
      <h2 class="text-2xl font-semibold mb-4">2. Acceptation des Conditions</h2>
      <p class="text-gray-700 leading-relaxed mb-6">
        L'utilisation du site implique l'acceptation pleine et entière des présentes CGU. 
        Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser ce site.
      </p>
    </section>

    <section>
      <h2 class="text-2xl font-semibold mb-4">3. Utilisation du Site</h2>
      <p class="text-gray-700 leading-relaxed mb-6">
        L'utilisateur s'engage à utiliser le site de manière conforme à sa destination et aux lois en vigueur. 
        Toute utilisation abusive ou frauduleuse est strictement interdite.
      </p>
    </section>

    <section>
      <h2 class="text-2xl font-semibold mb-4">4. Produits et Services</h2>
      <p class="text-gray-700 leading-relaxed mb-6">
        Tous les produits présentés sur le site sont authentiques et conformes aux spécifications du fabricant. 
        Les prix et disponibilités sont susceptibles de modification sans préavis.
      </p>
    </section>

    <section>
      <h2 class="text-2xl font-semibold mb-4">5. Contact</h2>
      <p class="text-gray-700 leading-relaxed">
        Pour toute question concernant ces conditions d'utilisation, 
        veuillez nous contacter via les moyens mis à disposition sur le site.
      </p>
    </section>
  `;

  const { title, content, loading } = useCMSContent(
    'terms',
    'Conditions d\'Utilisation',
    fallbackContent
  );

  return (
    <Layout>
      <Helmet>
        <title>{title} - SONOFF Tunisie</title>
        <meta name="description" content="Consultez les conditions d'utilisation du site SONOFF Tunisie. Termes et conditions de vente." />
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

export default Terms;