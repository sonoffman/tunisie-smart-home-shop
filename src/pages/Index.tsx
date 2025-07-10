import React from 'react';
import Layout from '@/components/Layout';
import DebugAuthStatus from '@/components/DebugAuthStatus';

const Index = () => {
  return (
    <Layout>
      <DebugAuthStatus />
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Bienvenue sur SONOFF Tunisie
        </h1>
        <p className="text-center text-gray-600">
          Votre boutique en ligne pour les produits SONOFF
        </p>
      </div>
    </Layout>
  );
};

export default Index;
