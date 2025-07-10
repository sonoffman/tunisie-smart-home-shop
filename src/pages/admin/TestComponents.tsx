
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import TestPdfGeneration from '@/components/test/TestPdfGeneration';
import TestBannerUpload from '@/components/test/TestBannerUpload';

const TestComponents = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  if (!user || !isAdmin) {
    navigate('/');
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-sonoff-blue">Tests des Corrections</h1>
          
          <Button variant="outline" onClick={() => navigate('/admin')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour au dashboard
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <TestPdfGeneration />
          <TestBannerUpload />
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Instructions de test :</h3>
          <ul className="list-disc list-inside text-blue-700 space-y-1">
            <li>Le test PDF va créer automatiquement un client et une facture de test</li>
            <li>Le test bannière nécessite de sélectionner une image (utilisez image.jpg fournie)</li>
            <li>Les tests vont vérifier que les politiques RLS fonctionnent correctement</li>
            <li>Consultez la console du navigateur pour les détails de débogage</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default TestComponents;
