
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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Eye, 
  EyeOff 
} from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  featured_image: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

const BlogManagement = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNew, setIsNew] = useState(false);
  const [currentPost, setCurrentPost] = useState<Partial<BlogPost>>({
    title: '',
    slug: '',
    content: '',
    featured_image: '',
    published: true
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
      fetchBlogPosts();
    }
  }, [user, isAdmin, navigate, toast]);

  const fetchBlogPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data as BlogPost[]);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de charger les articles: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentPost(prev => ({ ...prev, [name]: value }));

    // Generate slug from title if it's a new post and slug hasn't been manually edited
    if (name === 'title' && isNew && !currentPost.slug) {
      const slug = value
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');
      setCurrentPost(prev => ({ ...prev, slug }));
    }
  };

  const handleSwitchChange = (checked: boolean) => {
    setCurrentPost(prev => ({ ...prev, published: checked }));
  };

  const handleOpenDialog = (post?: BlogPost) => {
    if (post) {
      setCurrentPost(post);
      setIsNew(false);
    } else {
      setCurrentPost({
        title: '',
        slug: '',
        content: '',
        featured_image: '',
        published: true
      });
      setIsNew(true);
    }
  };

  const handleSave = async (closeDialog: () => void) => {
    try {
      if (!currentPost.title || !currentPost.slug || !currentPost.content) {
        toast({
          title: "Erreur",
          description: "Veuillez remplir tous les champs obligatoires.",
          variant: "destructive",
        });
        return;
      }

      // Process slug to ensure it's URL-friendly
      const processedSlug = currentPost.slug
        .toLowerCase()
        .replace(/[^\w-]/g, '')
        .replace(/\s+/g, '-');

      const postData = {
        ...currentPost,
        slug: processedSlug,
        author_id: user?.id
      };

      let result;
      
      if (isNew) {
        // Correction: Ensure all required fields are present
        const newPost = {
          title: postData.title || '',
          slug: processedSlug,
          content: postData.content || '',
          featured_image: postData.featured_image || null,
          published: postData.published !== undefined ? postData.published : true,
          author_id: user?.id
        };
        
        result = await supabase.from('blog_posts').insert([newPost]);
      } else {
        result = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', currentPost.id);
      }

      if (result.error) throw result.error;

      toast({
        title: "Succès",
        description: isNew 
          ? "L'article a été créé avec succès" 
          : "L'article a été mis à jour avec succès",
      });

      fetchBlogPosts();
      closeDialog();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de sauvegarder l'article: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (post: BlogPost, closeDialog: () => void) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', post.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "L'article a été supprimé avec succès",
      });

      fetchBlogPosts();
      closeDialog();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de supprimer l'article: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-sonoff-blue">Gestion du blog</h1>
          
          <div className="flex gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvel article
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>{isNew ? 'Créer un nouvel article' : 'Modifier l\'article'}</DialogTitle>
                  <DialogDescription>
                    Complétez le formulaire ci-dessous pour {isNew ? 'créer' : 'modifier'} l'article.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Titre *</Label>
                    <Input
                      id="title"
                      name="title"
                      value={currentPost.title}
                      onChange={handleInputChange}
                      placeholder="Titre de l'article"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="slug">Slug URL *</Label>
                    <Input
                      id="slug"
                      name="slug"
                      value={currentPost.slug}
                      onChange={handleInputChange}
                      placeholder="slug-url-de-larticle"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="featured_image">Image à la une (URL)</Label>
                    <Input
                      id="featured_image"
                      name="featured_image"
                      value={currentPost.featured_image || ''}
                      onChange={handleInputChange}
                      placeholder="https://exemple.com/image.jpg"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="content">Contenu *</Label>
                    <Textarea
                      id="content"
                      name="content"
                      value={currentPost.content}
                      onChange={handleInputChange}
                      placeholder="Contenu de l'article (supporte le HTML)"
                      className="min-h-[200px]"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="published"
                      checked={currentPost.published ?? true}
                      onCheckedChange={handleSwitchChange}
                    />
                    <Label htmlFor="published">Publier l'article</Label>
                  </div>
                </div>
                
                <div className="flex justify-end gap-4">
                  <DialogClose asChild>
                    <Button variant="outline">Annuler</Button>
                  </DialogClose>
                  <DialogClose>
                    {/* Corrected DialogClose format */}
                    <Button onClick={() => handleSave(() => {})}>
                      {isNew ? 'Créer' : 'Mettre à jour'}
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
            <TableCaption>Liste des articles du blog</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date de création</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">Chargement...</TableCell>
                </TableRow>
              ) : posts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">Aucun article trouvé</TableCell>
                </TableRow>
              ) : (
                posts.map((post) => (
                  <TableRow key={post.id} className={!post.published ? "opacity-60" : ""}>
                    <TableCell className="font-medium">{post.title}</TableCell>
                    <TableCell>{post.slug}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {post.published ? (
                          <>
                            <Eye className="h-4 w-4 text-green-600 mr-1" />
                            <span>Publié</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-4 w-4 text-gray-600 mr-1" />
                            <span>Brouillon</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(post.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => handleOpenDialog(post)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>Modifier l'article</DialogTitle>
                              <DialogDescription>
                                Modifiez les détails de votre article de blog.
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="edit-title">Titre</Label>
                                <Input
                                  id="edit-title"
                                  name="title"
                                  value={currentPost.title}
                                  onChange={handleInputChange}
                                />
                              </div>
                              
                              <div className="grid gap-2">
                                <Label htmlFor="edit-slug">Slug URL</Label>
                                <Input
                                  id="edit-slug"
                                  name="slug"
                                  value={currentPost.slug}
                                  onChange={handleInputChange}
                                />
                              </div>
                              
                              <div className="grid gap-2">
                                <Label htmlFor="edit-featured_image">Image à la une (URL)</Label>
                                <Input
                                  id="edit-featured_image"
                                  name="featured_image"
                                  value={currentPost.featured_image || ''}
                                  onChange={handleInputChange}
                                />
                              </div>
                              
                              <div className="grid gap-2">
                                <Label htmlFor="edit-content">Contenu</Label>
                                <Textarea
                                  id="edit-content"
                                  name="content"
                                  value={currentPost.content}
                                  onChange={handleInputChange}
                                  className="min-h-[200px]"
                                />
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id="edit-published"
                                  checked={currentPost.published ?? true}
                                  onCheckedChange={handleSwitchChange}
                                />
                                <Label htmlFor="edit-published">Publier l'article</Label>
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
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="icon" className="text-red-500">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Confirmer la suppression</DialogTitle>
                              <DialogDescription>
                                Êtes-vous sûr de vouloir supprimer cet article? Cette action est irréversible.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="flex justify-end gap-4 mt-4">
                              <DialogClose asChild>
                                <Button variant="outline">Annuler</Button>
                              </DialogClose>
                              <DialogClose>
                                {/* Corrected DialogClose format */}
                                <Button variant="destructive" onClick={() => handleDelete(post, () => {})}>
                                  Supprimer
                                </Button>
                              </DialogClose>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
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

export default BlogManagement;
