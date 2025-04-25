
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from '@/components/ui/dialog';
import { Pencil, Trash2, PlusCircle } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  product_count?: number;
}

const CategoryManagement = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState({ name: '', slug: '', icon: '' });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    // Redirect non-admin users
    if (user === null) {
      navigate('/');
      toast({
        title: "Accès refusé",
        description: "Vous devez être connecté pour accéder à cette page.",
        variant: "destructive",
      });
    } else if (!isAdmin) {
      navigate('/');
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas les droits d'administrateur.",
        variant: "destructive",
      });
    } else {
      fetchCategories();
    }
  }, [user, isAdmin, navigate, toast]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      // Fetch categories with product count
      const { data: categoriesWithCount, error: countError } = await supabase
        .rpc('get_categories_with_product_count');

      if (countError) throw countError;
      setCategories(categoriesWithCount || []);

      // If the above RPC function is not available, use this alternative approach
      if (!categoriesWithCount) {
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*');

        if (categoriesError) throw categoriesError;

        // For each category, count products
        const categoriesWithProductCount = await Promise.all(
          categoriesData.map(async (category) => {
            const { count, error: productError } = await supabase
              .from('products')
              .select('id', { count: 'exact', head: true })
              .eq('category_id', category.id);
            
            if (productError) throw productError;
            
            return {
              ...category,
              product_count: count || 0
            };
          })
        );

        setCategories(categoriesWithProductCount);
      }
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

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-');
  };

  const handleNameChange = (name: string, isNew: boolean = true) => {
    if (isNew) {
      setNewCategory({
        ...newCategory,
        name,
        slug: generateSlug(name)
      });
    } else if (editingCategory) {
      setEditingCategory({
        ...editingCategory,
        name,
        slug: generateSlug(name)
      });
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom de la catégorie ne peut pas être vide",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([
          { 
            name: newCategory.name,
            slug: newCategory.slug || generateSlug(newCategory.name),
            icon: newCategory.icon || null
          }
        ])
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Succès",
        description: "La catégorie a été ajoutée avec succès",
      });
      
      // Clear form
      setNewCategory({ name: '', slug: '', icon: '' });
      setIsAddDialogOpen(false);
      
      // Refresh data
      fetchCategories();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible d'ajouter la catégorie: ${error.message}`,
        variant: "destructive",
      });
    }
  };
  
  const handleUpdateCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom de la catégorie ne peut pas être vide",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('categories')
        .update({ 
          name: editingCategory.name,
          slug: editingCategory.slug,
          icon: editingCategory.icon
        })
        .eq('id', editingCategory.id);
      
      if (error) throw error;
      
      toast({
        title: "Succès",
        description: "La catégorie a été mise à jour avec succès",
      });
      
      setEditingCategory(null);
      setIsEditDialogOpen(false);
      
      // Refresh data
      fetchCategories();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de mettre à jour la catégorie: ${error.message}`,
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteCategory = async (id: string) => {
    try {
      // Check if category has products
      const { count, error: countError } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('category_id', id);
      
      if (countError) throw countError;
      
      if (count && count > 0) {
        toast({
          title: "Action impossible",
          description: `Cette catégorie contient ${count} produits. Veuillez les supprimer ou les réassigner avant de supprimer cette catégorie.`,
          variant: "destructive",
        });
        return;
      }
      
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Succès",
        description: "La catégorie a été supprimée avec succès",
      });
      
      // Refresh data
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
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <PlusCircle className="h-5 w-5" />
                  Ajouter une catégorie
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter une nouvelle catégorie</DialogTitle>
                  <DialogDescription>
                    Créez une nouvelle catégorie de produits
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Nom de la catégorie
                    </label>
                    <Input 
                      id="name"
                      value={newCategory.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Ex: Interrupteurs intelligents"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="slug" className="text-sm font-medium">
                      Slug (URL)
                    </label>
                    <Input 
                      id="slug"
                      value={newCategory.slug}
                      onChange={(e) => setNewCategory({...newCategory, slug: e.target.value})}
                      placeholder="Ex: interrupteurs-intelligents"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="icon" className="text-sm font-medium">
                      Icône (optionnel)
                    </label>
                    <Input 
                      id="icon"
                      value={newCategory.icon}
                      onChange={(e) => setNewCategory({...newCategory, icon: e.target.value})}
                      placeholder="Ex: light-bulb (nom de l'icône Lucide)"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Annuler</Button>
                  </DialogClose>
                  <Button onClick={handleAddCategory}>Ajouter</Button>
                </DialogFooter>
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
                <TableHead>Nombre de produits</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">Chargement...</TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">Aucune catégorie trouvée</TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.slug}</TableCell>
                    <TableCell>{category.icon || '-'}</TableCell>
                    <TableCell>{category.product_count || 0}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Dialog open={isEditDialogOpen && editingCategory?.id === category.id} onOpenChange={(open) => {
                        setIsEditDialogOpen(open);
                        if (!open) setEditingCategory(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              setEditingCategory(category);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4 mr-1" />
                            Éditer
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Modifier la catégorie</DialogTitle>
                            <DialogDescription>
                              Modifiez les détails de cette catégorie
                            </DialogDescription>
                          </DialogHeader>
                          {editingCategory && (
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <label htmlFor="edit-name" className="text-sm font-medium">
                                  Nom de la catégorie
                                </label>
                                <Input 
                                  id="edit-name"
                                  value={editingCategory.name}
                                  onChange={(e) => handleNameChange(e.target.value, false)}
                                />
                              </div>
                              <div className="space-y-2">
                                <label htmlFor="edit-slug" className="text-sm font-medium">
                                  Slug (URL)
                                </label>
                                <Input 
                                  id="edit-slug"
                                  value={editingCategory.slug}
                                  onChange={(e) => setEditingCategory({...editingCategory, slug: e.target.value})}
                                />
                              </div>
                              <div className="space-y-2">
                                <label htmlFor="edit-icon" className="text-sm font-medium">
                                  Icône (optionnel)
                                </label>
                                <Input 
                                  id="edit-icon"
                                  value={editingCategory.icon || ''}
                                  onChange={(e) => setEditingCategory({...editingCategory, icon: e.target.value})}
                                />
                              </div>
                            </div>
                          )}
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Annuler</Button>
                            </DialogClose>
                            <Button onClick={handleUpdateCategory}>Enregistrer</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-red-500"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Supprimer
                      </Button>
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
