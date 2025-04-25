
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import Layout from '@/components/Layout';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil, Trash } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

const CategoryManagement = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentCategory, setCurrentCategory] = useState<Partial<Category>>({
    name: '',
    slug: '',
    icon: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/');
      toast({
        title: "Accès refusé",
        description: "Vous devez être connecté pour accéder à cette page.",
        variant: "destructive",
      });
      return;
    } 
    
    if (!isAdmin) {
      navigate('/');
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas les droits d'administrateur.",
        variant: "destructive",
      });
      return;
    } 
    
    fetchCategories();
  }, [user, isAdmin, navigate, toast]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setCategories(data);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de charger les catégories: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'name') {
      // Generate slug from name
      const slug = value.toLowerCase()
        .replace(/[éèê]/g, 'e')
        .replace(/[àâ]/g, 'a')
        .replace(/[ùû]/g, 'u')
        .replace(/[ôö]/g, 'o')
        .replace(/[ïî]/g, 'i')
        .replace(/[ç]/g, 'c')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setCurrentCategory(prev => ({ ...prev, [name]: value, slug }));
    } else {
      setCurrentCategory(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleOpenDialog = (category: Category) => {
    setCurrentCategory(category);
  };

  const handleSave = async (closeDialog: () => void) => {
    try {
      if (!currentCategory.name || !currentCategory.slug) {
        toast({
          title: "Erreur",
          description: "Le nom et le slug sont requis.",
          variant: "destructive",
        });
        return;
      }

      if (currentCategory.id) {
        const { error } = await supabase
          .from('categories')
          .update({
            name: currentCategory.name,
            slug: currentCategory.slug,
            icon: currentCategory.icon
          })
          .eq('id', currentCategory.id);

        if (error) throw error;

        toast({
          title: "Succès",
          description: "La catégorie a été mise à jour.",
        });
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([{
            name: currentCategory.name,
            slug: currentCategory.slug,
            icon: currentCategory.icon
          }]);

        if (error) throw error;

        toast({
          title: "Succès",
          description: "La catégorie a été créée.",
        });
      }

      fetchCategories();
      closeDialog();
      setCurrentCategory({ name: '', slug: '', icon: '' });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de sauvegarder la catégorie: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "La catégorie a été supprimée.",
      });

      fetchCategories();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de supprimer la catégorie: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-sonoff-blue">Gestion des catégories</h1>
          
          <div className="flex gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button>Nouvelle catégorie</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter une catégorie</DialogTitle>
                  <DialogDescription>
                    Créez une nouvelle catégorie de produits.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nom</Label>
                    <Input
                      id="name"
                      name="name"
                      value={currentCategory.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="slug">Slug URL</Label>
                    <Input
                      id="slug"
                      name="slug"
                      value={currentCategory.slug}
                      onChange={handleInputChange}
                      placeholder="Généré automatiquement"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="icon">Icône (nom Lucide)</Label>
                    <Input
                      id="icon"
                      name="icon"
                      value={currentCategory.icon || ''}
                      onChange={handleInputChange}
                      placeholder="Ex: ShoppingCart"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-4">
                  <DialogClose asChild>
                    <Button variant="outline">Annuler</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button onClick={() => handleSave(() => {})}>
                      Sauvegarder
                    </Button>
                  </DialogClose>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" onClick={() => navigate('/admin')}>
              Retour au dashboard
            </Button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableCaption>Liste des catégories</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Icône</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">Chargement...</TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">Aucune catégorie trouvée</TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.slug}</TableCell>
                    <TableCell>{category.icon || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => handleOpenDialog(category)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Modifier la catégorie</DialogTitle>
                              <DialogDescription>
                                Modifiez les informations de la catégorie {category.name}.
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="edit-name">Nom</Label>
                                <Input
                                  id="edit-name"
                                  name="name"
                                  value={currentCategory.name}
                                  onChange={handleInputChange}
                                />
                              </div>
                              
                              <div className="grid gap-2">
                                <Label htmlFor="edit-slug">Slug URL</Label>
                                <Input
                                  id="edit-slug"
                                  name="slug"
                                  value={currentCategory.slug}
                                  onChange={handleInputChange}
                                />
                              </div>
                              
                              <div className="grid gap-2">
                                <Label htmlFor="edit-icon">Icône (nom Lucide)</Label>
                                <Input
                                  id="edit-icon"
                                  name="icon"
                                  value={currentCategory.icon || ''}
                                  onChange={handleInputChange}
                                />
                              </div>
                            </div>
                            
                            <div className="flex justify-end gap-4">
                              <DialogClose asChild>
                                <Button variant="outline">Annuler</Button>
                              </DialogClose>
                              <DialogClose asChild>
                                <Button onClick={() => handleSave(() => {})}>
                                  Mettre à jour
                                </Button>
                              </DialogClose>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleDelete(category.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
};

export default CategoryManagement;
