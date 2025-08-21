import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import SitemapGenerator from '@/components/SitemapGenerator';
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface ProductSEO {
  id: string;
  name: string;
  slug: string;
  seo_title?: string;
  seo_description?: string;
  indexable: boolean;
  hidden: boolean;
}

const SEOManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<ProductSEO[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingBulk, setProcessingBulk] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchProducts();
  }, [user, navigate]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, slug, seo_title, seo_description, indexable, hidden')
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les produits",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const bulkUpdateSEO = async () => {
    setProcessingBulk(true);
    try {
      // Récupérer tous les produits et mettre à jour leurs métadonnées
      const { data: allProducts, error: fetchError } = await supabase
        .from('products')
        .select('id, name, description')
        .neq('hidden', true);

      if (fetchError) throw fetchError;

      // Mettre à jour chaque produit individuellement
      for (const product of allProducts || []) {
        const seoTitle = product.name.length <= 50 
          ? `${product.name} | Sonoff Tunisie`
          : `${product.name.substring(0, 47)}... | Sonoff Tunisie`;

        let seoDescription = '';
        if (product.description && product.description.length > 50) {
          const cleanDesc = product.description.replace(/【.*?】/g, '').trim();
          seoDescription = cleanDesc.length <= 157 ? cleanDesc : `${cleanDesc.substring(0, 157)}...`;
        } else if (product.description) {
          seoDescription = `${product.description} Disponible chez Sonoff Tunisie.`;
        } else {
          seoDescription = `Découvrez ${product.name} chez Sonoff Tunisie. Livraison rapide en Tunisie.`;
        }

        await supabase
          .from('products')
          .update({
            seo_title: seoTitle,
            seo_description: seoDescription,
            indexable: true
          })
          .eq('id', product.id);
      }
      
      toast({
        title: "Succès",
        description: "Les métadonnées SEO ont été mises à jour pour tous les produits",
      });
      
      fetchProducts();
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour des métadonnées",
        variant: "destructive",
      });
    } finally {
      setProcessingBulk(false);
    }
  };

  const getSEOStatus = (product: ProductSEO) => {
    if (product.hidden || !product.indexable) {
      return { status: 'non-indexable', color: 'destructive' };
    }
    if (!product.seo_title || !product.seo_description) {
      return { status: 'incomplet', color: 'warning' };
    }
    return { status: 'optimisé', color: 'success' };
  };

  const getProductUrl = (slug: string) => {
    return `https://www.sonoff-tunisie.com/produit/${slug}`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Gestion SEO</h1>
        <p>Chargement...</p>
      </div>
    );
  }

  const optimizedCount = products.filter(p => getSEOStatus(p).status === 'optimisé').length;
  const indexableCount = products.filter(p => !p.hidden && p.indexable).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion SEO</h1>
        <Button 
          onClick={bulkUpdateSEO}
          disabled={processingBulk}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${processingBulk ? 'animate-spin' : ''}`} />
          {processingBulk ? 'Mise à jour...' : 'Regénérer SEO'}
        </Button>
      </div>

      {/* Statistiques SEO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Produits Optimisés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {optimizedCount}/{products.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Produits avec SEO complet
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Indexables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {indexableCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Produits visibles par Google
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pourcentage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {Math.round((optimizedCount / products.length) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Taux d'optimisation SEO
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Générateur de Sitemap */}
      <SitemapGenerator />

      {/* Tableau des produits */}
      <Card>
        <CardHeader>
          <CardTitle>État SEO des Produits</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Titre SEO</TableHead>
                <TableHead>Description SEO</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const seoStatus = getSEOStatus(product);
                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell>
                      <a 
                        href={getProductUrl(product.slug)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        /produit/{product.slug}
                      </a>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate text-sm">
                        {product.seo_title || '❌ Manquant'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate text-sm">
                        {product.seo_description || '❌ Manquant'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={seoStatus.color as any}
                        className="flex items-center gap-1"
                      >
                        {seoStatus.status === 'optimisé' ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <AlertCircle className="h-3 w-3" />
                        )}
                        {seoStatus.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SEOManagement;