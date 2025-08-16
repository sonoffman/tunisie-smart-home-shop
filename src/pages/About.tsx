import React from 'react';
import { Helmet } from 'react-helmet-async';
import Layout from '@/components/Layout';
import { useCMSContent } from '@/hooks/useCMSContent';

const About = () => {
  const fallbackContent = `
    <section>
      <h2 class="text-2xl font-semibold mb-4">Notre Mission</h2>
      <p class="text-gray-700 leading-relaxed mb-6">
        SONOFF Tunisie est votre partenaire de confiance pour tous vos projets de domotique intelligente. 
        Nous nous spécialisons dans la distribution de produits SONOFF de haute qualité, offrant des solutions 
        innovantes pour rendre votre maison plus intelligente, plus confortable et plus économe en énergie.
      </p>
    </section>

    <section>
      <h2 class="text-2xl font-semibold mb-4">Nos Produits</h2>
      <p class="text-gray-700 leading-relaxed mb-6">
        Nous proposons une gamme complète de dispositifs intelligents incluant des interrupteurs WiFi, 
        des modules ZigBee, des écrans tactiles et de nombreux accessoires compatibles. Tous nos produits 
        sont authentiques et bénéficient d'une garantie constructeur.
      </p>
    </section>

    <section>
      <h2 class="text-2xl font-semibold mb-4">Notre Engagement</h2>
      <p class="text-gray-700 leading-relaxed">
        Nous nous engageons à fournir un service client exceptionnel, des conseils techniques professionnels 
        et un support après-vente de qualité. Notre équipe d'experts est là pour vous accompagner dans 
        tous vos projets de maison intelligente.
      </p>
    </section>
  `;

  const { title, content, loading } = useCMSContent(
    'about',
    'À Propos de SONOFF Tunisie',
    fallbackContent
  );

  return (
    <Layout>
      <Helmet>
        <title>{title} - SONOFF Tunisie | Votre Partenaire Domotique</title>
        <meta name="description" content="Découvrez SONOFF Tunisie, votre spécialiste en solutions domotiques intelligentes. Notre mission, nos valeurs et notre expertise." />
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

export default About;