
import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface CMSPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  created_at: string;
}

const CMSPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<CMSPage | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const location = useLocation();

  useEffect(() => {
    fetchCMSPage();
  }, [slug, location]);

  const fetchCMSPage = async () => {
    try {
      if (!slug) {
        throw new Error('Slug parameter is missing');
      }
      
      const { data, error } = await supabase
        .from('cms_pages')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      setPage(data as CMSPage);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: `Impossible de charger la page: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <p className="text-center">Chargement de la page...</p>
        </div>
      </Layout>
    );
  }

  if (!page) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <div className="bg-red-50 p-4 rounded-md">
            <h1 className="text-2xl font-bold text-red-700">Page non trouvée</h1>
            <p className="mt-2 text-red-600">
              Désolé, la page que vous cherchez n'existe pas ou a été déplacée.
            </p>
            <Link to="/">
              <Button className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à l'accueil
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <h1 className="text-3xl font-bold mb-6 text-sonoff-blue">{page.title}</h1>
          
          <div 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </div>
      </div>
    </Layout>
  );
};

export default CMSPage;
