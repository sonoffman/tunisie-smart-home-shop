
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Pencil, 
  Eye 
} from 'lucide-react';

interface CMSPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  created_at: string;
  updated_at?: string;
}

const CMSManagement = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pages, setPages] = useState<CMSPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<Partial<CMSPage>>({
    title: '',
    slug: '',
    content: ''
  });

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
      fetchCMSPages();
    }
  }, [user, isAdmin, navigate, toast]);

  const fetchCMSPages = async () => {
    try {
      const { data, error } = await supabase
        .from('cms_pages')
        .select('*')
        .order('title', { ascending: true });

      if (error) throw error;
      setPages(data as CMSPage[]);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de charger les pages: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentPage(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenDialog = (page: CMSPage) => {
    setCurrentPage(page);
  };

  const handleSave = async (closeDialog: () => void) => {
    try {
      if (!currentPage.title || !currentPage.slug || !currentPage.content) {
        toast({
          title: "Erreur",
          description: "Veuillez remplir tous les champs obligatoires.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('cms_pages')
        .update({
          title: currentPage.title,
          content: currentPage.content
        })
        .eq('id', currentPage.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "La page a été mise à jour avec succès",
      });

      fetchCMSPages();
      closeDialog();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de sauvegarder la page: ${error.message}`,
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
          <h1 className="text-3xl font-bold text-sonoff-blue">Gestion des pages CMS</h1>
          
          <Button variant="outline" onClick={() => navigate('/admin')}>
            Retour au dashboard
          </Button>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableCaption>Pages CMS du site</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">Chargement...</TableCell>
                </TableRow>
              ) : pages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">Aucune page trouvée</TableCell>
                </TableRow>
              ) : (
                pages.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell className="font-medium">{page.title}</TableCell>
                    <TableCell>{page.slug}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => handleOpenDialog(page)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>Modifier la page</DialogTitle>
                              <DialogDescription>
                                Modifiez le contenu de la page {currentPage.title}.
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="title">Titre</Label>
                                <Input
                                  id="title"
                                  name="title"
                                  value={currentPage.title}
                                  onChange={handleInputChange}
                                />
                              </div>
                              
                              <div className="grid gap-2">
                                <Label htmlFor="slug">Slug URL (non modifiable)</Label>
                                <Input
                                  id="slug"
                                  name="slug"
                                  value={currentPage.slug}
                                  readOnly
                                  disabled
                                />
                              </div>
                              
                              <div className="grid gap-2">
                                <Label htmlFor="content">Contenu (supporte le HTML)</Label>
                                <Textarea
                                  id="content"
                                  name="content"
                                  value={currentPage.content}
                                  onChange={handleInputChange}
                                  className="min-h-[300px]"
                                />
                              </div>
                            </div>
                            
                            <div className="flex justify-end gap-4">
                              <DialogClose asChild>
                                <Button variant="outline">Annuler</Button>
                              </DialogClose>
                              <DialogClose>
                                {/* Corrected DialogClose format */}
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
                          onClick={() => window.open(`/${page.slug}`, '_blank')}
                        >
                          <Eye className="h-4 w-4" />
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

export default CMSManagement;
