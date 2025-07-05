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

interface BannerAccordion {
  id: string;
  titre: string;
  description: string;
  image: string;
  lien_bouton: string;
  texte_bouton: string;
  ordre: number;
  actif: boolean;
}

const BannerManagement = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [banners, setBanners] = useState<BannerAccordion[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [bannerForm, setBannerForm] = useState({
    id: '',
    titre: '',
    description: '',
    image: '',
    lien_bouton: '',
    texte_bouton: 'Découvrir',
    ordre: 0,
    actif: true,
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
        const { error: createError } = await supabase.storage.createBucket('banners', {
          public: true,
          fileSizeLimit: 1024 * 1024 * 10,
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
        .from('banner_accordion')
        .select('*')
        .order('ordre');

      if (error) throw error;
      
      if (data) {
        setBanners(data);
        
        if (data.length > 0) {
          setBannerForm(data[0]);
          setPreviewUrl(data[0].image);
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
      [name]: name === 'ordre' ? parseInt(value) || 0 : value,
    });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBannerForm({
      ...bannerForm,
      actif: e.target.checked,
    });
  };

  const handleSaveBanner = async () => {
    try {
      setSaving(true);
      
      let imageUrl = bannerForm.image;
      
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
        titre: bannerForm.titre,
        description: bannerForm.description,
        image: imageUrl,
        lien_bouton: bannerForm.lien_bouton,
        texte_bouton: bannerForm.texte_bouton,
        ordre: bannerForm.ordre,
        actif: bannerForm.actif,
      };
      
      let result;
      if (bannerForm.id) {
        const { data, error } = await supabase
          .from('banner_accordion')
          .update(bannerData)
          .eq('id', bannerForm.id)
          .select()
          .single();
          
        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        result = data;
        
        toast({
          title: "Bannière mise à jour",
          description: "La bannière a été mise à jour avec succès",
        });
      } else {
        const { data, error } = await supabase
          .from('banner_accordion')
          .insert([bannerData])
          .select()
          .single();
          
        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
        result = data;
        
        toast({
          title: "Bannière ajoutée",
          description: "La nouvelle bannière a été ajoutée avec succès",
        });
      }
      
      fetchBanners();
      clearForm();
    } catch (error: any) {
      console.error('Save banner error:', error);
      toast({
        title: "Erreur",
        description: `Impossible d'enregistrer la bannière: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEditBanner = (banner: BannerAccordion) => {
    setBannerForm(banner);
    setPreviewUrl(banner.image);
    setSelectedFile(null);
  };

  const handleDeleteBanner = async (id: string) => {
    try {
      setSaving(true);
      
      const { error: deleteError } = await supabase
        .from('banner_accordion')
        .delete()
        .eq('id', id);
        
      if (deleteError) throw deleteError;
      
      toast({
        title: "Bannière supprimée",
        description: "La bannière a été supprimée avec succès",
      });
      
      fetchBanners();
      
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
      titre: '',
      description: '',
      image: '',
      lien_bouton: '',
      texte_bouton: 'Découvrir',
      ordre: banners.length + 1,
      actif: true,
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
                              image: '',
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

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Titre</label>
                  <Input 
                    name="titre"
                    value={bannerForm.titre}
                    onChange={handleInputChange}
                    placeholder="Titre de la bannière"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <Textarea 
                    name="description"
                    value={bannerForm.description}
                    onChange={handleInputChange}
                    placeholder="Description"
                    rows={3}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Lien du bouton</label>
                  <Input 
                    name="lien_bouton"
                    value={bannerForm.lien_bouton}
                    onChange={handleInputChange}
                    placeholder="/products/category/switches"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Texte du bouton</label>
                  <Input 
                    name="texte_bouton"
                    value={bannerForm.texte_bouton}
                    onChange={handleInputChange}
                    placeholder="Découvrir"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Ordre</label>
                  <Input 
                    name="ordre"
                    type="number"
                    value={bannerForm.ordre}
                    onChange={handleInputChange}
                    placeholder="0"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="actif"
                    name="actif"
                    checked={bannerForm.actif}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-sonoff-blue focus:ring-sonoff-blue border-gray-300 rounded"
                  />
                  <label htmlFor="actif" className="ml-2 block text-sm text-gray-700">
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
                      Nouveau
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
                    Aucune bannière trouvée.
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
                            src={banner.image} 
                            alt={banner.titre}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4 md:w-2/3 flex flex-col">
                          <div className="flex-grow">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{banner.titre}</h3>
                              <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-600 rounded">
                                Ordre: {banner.ordre}
                              </span>
                              {!banner.actif && (
                                <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                                  Inactive
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{banner.description}</p>
                            {banner.lien_bouton && (
                              <p className="text-xs text-blue-600 mb-4">
                                Lien: {banner.lien_bouton} | Bouton: {banner.texte_bouton}
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
