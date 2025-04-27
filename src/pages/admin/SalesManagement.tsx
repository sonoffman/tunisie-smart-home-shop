
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import Layout from '@/components/Layout';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, Search } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Product } from '@/components/ProductCard';
import ProductGrid from '@/components/ProductGrid';

const SalesManagement = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateSaleDialogOpen, setIsCreateSaleDialogOpen] = useState(false);

  useEffect(() => {
    if (user === null || !isAdmin) {
      navigate('/');
      toast({
        title: "Accès refusé",
        description: user === null 
          ? "Vous devez être connecté pour accéder à cette page." 
          : "Vous n'avez pas les droits d'administrateur.",
        variant: "destructive",
      });
    } else {
      fetchProducts();
    }
  }, [user, isAdmin, navigate, toast]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(name)
        `)
        .order('name');

      if (error) throw error;

      const formattedProducts = data.map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.main_image_url || '/placeholder.svg',
        category: product.categories?.name || 'Non catégorisé',
        description: product.description,
        stock: product.stock_quantity
      }));

      setProducts(formattedProducts);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de charger les produits: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSale = () => {
    setIsCreateSaleDialogOpen(true);
  };

  // Filtrer les produits selon le terme de recherche
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-sonoff-blue">Gestion des Ventes</h1>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={() => navigate('/admin')}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Retour au dashboard
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Retourner au tableau de bord d'administration</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={handleCreateSale} className="bg-sonoff-blue hover:bg-sonoff-teal">
                    <Plus className="mr-2 h-4 w-4" /> Nouvelle vente
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Créer une nouvelle vente</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Rechercher par nom, description ou catégorie"
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Produits disponibles</h2>
          {loading ? (
            <div className="text-center py-10">
              <p>Chargement...</p>
            </div>
          ) : (
            <ProductGrid 
              products={filteredProducts} 
              title="Sélectionnez un produit pour créer une vente" 
              isAdmin={true}
            />
          )}
        </div>

        <Dialog open={isCreateSaleDialogOpen} onOpenChange={setIsCreateSaleDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une vente</DialogTitle>
              <DialogDescription>
                Sélectionnez les produits et les quantités pour créer une vente
              </DialogDescription>
            </DialogHeader>
            
            {/* Contenu du formulaire de création de vente */}
            <div className="py-4">
              {/* Formulaire à compléter selon les besoins */}
              <p>Interface de création de vente en cours de développement...</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default SalesManagement;
