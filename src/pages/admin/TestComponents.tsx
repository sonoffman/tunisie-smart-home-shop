
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import DebugAuth from '@/components/test/DebugAuth';
import TestBannerUpload from '@/components/test/TestBannerUpload';
import TestPdfGeneration from '@/components/test/TestPdfGeneration';

const TestComponents = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  React.useEffect(() => {
    if (user === null || !isAdmin) {
      navigate('/');
      toast({
        title: "Accès refusé",
        description: user === null 
          ? "Vous devez être connecté pour accéder à cette page." 
          : "Vous n'avez pas les droits d'administrateur.",
        variant: "destructive",
      });
    }
  }, [user, isAdmin, navigate, toast]);

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-sonoff-blue">Composants de Test</h1>
          <Button variant="outline" onClick={() => navigate('/admin')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour au dashboard
          </Button>
        </div>

        <div className="space-y-8">
          <DebugAuth />
          <TestBannerUpload />
          <TestPdfGeneration />
        </div>
      </div>
    </Layout>
  );
};

export default TestComponents;
