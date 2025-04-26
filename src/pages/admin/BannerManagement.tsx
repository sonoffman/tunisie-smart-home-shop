
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Upload, ImageIcon, Trash2, Save } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  link: string;
  active: boolean;
}

const BannerManagement = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [bannerForm, setBannerForm] = useState({
    id: '',
    title: '',
    subtitle: '',
    image_url: '',
    link: '',
    active: true,
  });

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
      fetchBanners();
      checkStorageBucket();
    }
  }, [user, isAdmin, navigate, toast]);

  const checkStorageBucket = async () => {
    try {
      const { data, error } = await supabase.storage.getBucket('banners');
      
      if (error && error.message.includes('The resource was not found')) {
        // Create bucket if it doesn't exist
        const { error: createError } = await supabase.storage.createBucket('banners', {
          public: true,
          fileSizeLimit: 1024 * 1024 * 10, // 10MB
        });
        
        if (createError) throw createError;
        
        toast({
          title: "Bucket créé",
          description: "Le bucket de stockage pour les bannières a été créé avec succès",
        });
      } else if (error) {
        throw error;
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Erreur lors de la vérification du bucket: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data) {
        setBanners(data);
        
        // Load first banner into form if available
        if (data.length > 0) {
          setBannerForm(data[0]);
          setPreviewUrl(data[0].image_url);
        }
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de charger les bannières: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBannerForm({
      ...bannerForm,
      [name]: value,
    });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBannerForm({
      ...bannerForm,
      active: e.target.checked,
    });
  };

  const handleSaveBanner = async () => {
    try {
      setSaving(true);
      
      let imageUrl = bannerForm.image_url;
      
      // Upload new image if selected
      if (selectedFile) {
        const fileName = `banner-${Date.now()}-${selectedFile.name.replace(/\s+/g, '-')}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('banners')
          .upload(fileName, selectedFile, {
            cacheControl: '3600',
            upsert: false
          });
          
        if (uploadError) throw uploadError;
        
        if (uploadData) {
          const { data } = supabase.storage.from('banners').getPublicUrl(fileName);
          imageUrl = data.publicUrl;
        }
      }
      
      const bannerData = {
        title: bannerForm.title,
        subtitle: bannerForm.subtitle,
        image_url: imageUrl,
        link: bannerForm.link,
        active: bannerForm.active,
      };
      
      let result;
      
      if (bannerForm.id) {
        // Update existing banner
        const { data, error } = await supabase
          .from('banners')
          .update(bannerData)
          .eq('id', bannerForm.id)
          .select()
          .single();
          
        if (error) throw error;
        result = data;
        
        toast({
          title: "Bannière mise à jour",
          description: "La bannière a été mise à jour avec succès",
        });
      } else {
        // Create new banner
        const { data, error } = await supabase
          .from('banners')
          .insert([bannerData])
          .select()
          .single();
          
        if (error) throw error;
        result = data;
        
        toast({
          title: "Bannière ajoutée",
          description: "La nouvelle bannière a été ajoutée avec succès",
        });
      }
      
      // Reload banners
      fetchBanners();
      
      // Reset form for a new banner
      clearForm();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible d'enregistrer la bannière: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEditBanner = (banner: Banner) => {
    setBannerForm(banner);
    setPreviewUrl(banner.image_url);
    setSelectedFile(null);
  };

  const handleDeleteBanner = async (id: string) => {
    try {
      setSaving(true);
      
      // Get current banner data to extract image URL
      const { data: currentBanner, error: fetchError } = await supabase
        .from('banners')
        .select('image_url')
        .eq('id', id)
        .single();
        
      if (fetchError) throw fetchError;
      
      // Delete banner from database
      const { error: deleteError } = await supabase
        .from('banners')
        .delete()
        .eq('id', id);
        
      if (deleteError) throw deleteError;
      
      // Extract file path from URL
      if (currentBanner?.image_url) {
        try {
          const url = new URL(currentBanner.image_url);
          const filePath = url.pathname.split('/').slice(-2).join('/');
          
          if (filePath) {
            await supabase.storage
              .from('banners')
              .remove([filePath]);
          }
        } catch (e) {
          console.log("Couldn't delete storage file, it may be an external URL", e);
        }
      }
      
      toast({
        title: "Bannière supprimée",
        description: "La bannière a été supprimée avec succès",
      });
      
      // Reload banners
      fetchBanners();
      
      // Reset form if we were editing this banner
      if (bannerForm.id === id) {
        clearForm();
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de supprimer la bannière: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const clearForm = () => {
    setBannerForm({
      id: '',
      title: '',
      subtitle: '',
      image_url: '',
      link: '',
      active: true,
    });
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-sonoff-blue">Gestion des Bannières</h1>
          
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>{bannerForm.id ? "Modifier la bannière" : "Nouvelle bannière"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Image upload */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Image de la bannière</label>
                  
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
                    {previewUrl ? (
                      <div className="relative w-full">
                        <img 
                          src={previewUrl} 
                          alt="Preview" 
                          className="w-full h-40 object-cover rounded-md" 
                        />
                        <button 
                          className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white"
                          onClick={() => {
                            setPreviewUrl(null);
                            setSelectedFile(null);
                            setBannerForm({
                              ...bannerForm,
                              image_url: '',
                            });
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <ImageIcon className="h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">
                          Cliquez pour sélectionner une image
                        </p>
                      </div>
                    )}
                    
                    <label className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sonoff-blue hover:bg-sonoff-teal cursor-pointer">
                      <Upload className="mr-2 h-4 w-4" />
                      Choisir une image
                      <input 
                        type="file" 
                        className="sr-only" 
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Titre</label>
                  <Input 
                    name="title"
                    value={bannerForm.title}
                    onChange={handleInputChange}
                    placeholder="Titre de la bannière"
                  />
                </div>

                {/* Subtitle */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Sous-titre</label>
                  <Textarea 
                    name="subtitle"
                    value={bannerForm.subtitle}
                    onChange={handleInputChange}
                    placeholder="Sous-titre ou description"
                    rows={3}
                  />
                </div>

                {/* Link */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Lien</label>
                  <Input 
                    name="link"
                    value={bannerForm.link}
                    onChange={handleInputChange}
                    placeholder="URL du lien (ex: /products/category/switches)"
                  />
                </div>

                {/* Active */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="active"
                    name="active"
                    checked={bannerForm.active}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-sonoff-blue focus:ring-sonoff-blue border-gray-300 rounded"
                  />
                  <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
                    Bannière active
                  </label>
                </div>

                <div className="pt-4 flex space-x-2">
                  <Button 
                    className="flex-1 bg-sonoff-blue hover:bg-sonoff-teal"
                    onClick={handleSaveBanner}
                    disabled={saving || !previewUrl}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? 'Enregistrement...' : 'Enregistrer'}
                  </Button>
                  
                  {bannerForm.id && (
                    <Button 
                      variant="outline"
                      onClick={clearForm}
                    >
                      Annuler
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Bannières existantes</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-6">Chargement des bannières...</div>
                ) : banners.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    Aucune bannière n'a été créée. Utilisez le formulaire pour ajouter votre première bannière.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {banners.map((banner) => (
                      <div 
                        key={banner.id}
                        className="border rounded-lg overflow-hidden flex flex-col md:flex-row"
                      >
                        <div className="md:w-1/3 h-40">
                          <img 
                            src={banner.image_url} 
                            alt={banner.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4 md:w-2/3 flex flex-col">
                          <div className="flex-grow">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{banner.title}</h3>
                              {!banner.active && (
                                <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                                  Inactive
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{banner.subtitle}</p>
                            {banner.link && (
                              <p className="text-xs text-blue-600 mb-4">
                                Lien: {banner.link}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditBanner(banner)}
                            >
                              Modifier
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteBanner(banner.id)}
                            >
                              Supprimer
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BannerManagement;
