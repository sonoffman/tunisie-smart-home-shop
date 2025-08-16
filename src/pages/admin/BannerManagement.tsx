
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
  image_mobile: string | null;
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
  const [selectedMobileFile, setSelectedMobileFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mobilePreviewUrl, setMobilePreviewUrl] = useState<string | null>(null);
  const [bannerForm, setBannerForm] = useState({
    id: '',
    titre: '',
    description: '',
    image: '',
    image_mobile: '',
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
      console.error('Storage bucket error:', error);
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
      console.log('Fetching banners...');
      
      const { data, error } = await supabase
        .from('banner_accordion')
        .select('*')
        .order('ordre');

      if (error) {
        console.error('Error fetching banners:', error);
        throw error;
      }
      
      console.log('Banners fetched successfully:', data);
      
      if (data) {
        setBanners(data);
        
        if (data.length > 0) {
          setBannerForm(data[0]);
          setPreviewUrl(data[0].image);
          setMobilePreviewUrl(data[0].image_mobile);
        }
      }
    } catch (error: any) {
      console.error('Fetch banners error:', error);
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
      console.log('File selected:', file.name, file.size);
      
      // Vérifier la taille du fichier (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Fichier trop volumineux",
          description: "La taille du fichier ne doit pas dépasser 10MB",
          variant: "destructive",
        });
        return;
      }

      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Type de fichier invalide",
          description: "Veuillez sélectionner une image",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
    }
  };

  const handleMobileFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('Mobile file selected:', file.name, file.size);
      
      // Vérifier la taille du fichier (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Fichier trop volumineux",
          description: "La taille du fichier ne doit pas dépasser 10MB",
          variant: "destructive",
        });
        return;
      }

      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Type de fichier invalide",
          description: "Veuillez sélectionner une image",
          variant: "destructive",
        });
        return;
      }

      setSelectedMobileFile(file);
      const fileUrl = URL.createObjectURL(file);
      setMobilePreviewUrl(fileUrl);
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
      console.log('Starting banner save process...');
      
      // Vérifier les champs obligatoires
      if (!bannerForm.titre.trim()) {
        toast({
          title: "Erreur",
          description: "Le titre est obligatoire",
          variant: "destructive",
        });
        return;
      }

      let imageUrl = bannerForm.image;
      let mobileImageUrl = bannerForm.image_mobile;
      
      if (selectedFile) {
        console.log('Uploading file:', selectedFile.name);
        
        // Nettoyer le nom de fichier
        const cleanFileName = selectedFile.name
          .replace(/[^a-zA-Z0-9.-]/g, '-')
          .replace(/-+/g, '-');
        
        const fileName = `banner-${Date.now()}-${cleanFileName}`;
        
        console.log('Attempting to upload to banners bucket with filename:', fileName);
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('banners')
          .upload(fileName, selectedFile, {
            cacheControl: '3600',
            upsert: false
          });
          
        if (uploadError) {
          console.error('Upload error details:', uploadError);
          
          // Essayer de créer le bucket s'il n'existe pas
          if (uploadError.message.includes('The resource was not found')) {
            console.log('Bucket not found, creating it...');
            const { error: createError } = await supabase.storage.createBucket('banners', {
              public: true,
              fileSizeLimit: 1024 * 1024 * 10,
            });
            
            if (createError) {
              console.error('Error creating bucket:', createError);
              throw new Error(`Impossible de créer le bucket: ${createError.message}`);
            }
            
            // Réessayer l'upload
            const { data: retryUploadData, error: retryUploadError } = await supabase.storage
              .from('banners')
              .upload(fileName, selectedFile, {
                cacheControl: '3600',
                upsert: false
              });
              
            if (retryUploadError) {
              console.error('Retry upload error:', retryUploadError);
              throw new Error(`Erreur upload (tentative 2): ${retryUploadError.message}`);
            }
            
            if (retryUploadData) {
              const { data } = supabase.storage.from('banners').getPublicUrl(fileName);
              imageUrl = data.publicUrl;
              console.log('File uploaded successfully after bucket creation, URL:', imageUrl);
            }
          } else {
            throw new Error(`Erreur upload: ${uploadError.message}`);
          }
        } else if (uploadData) {
          const { data } = supabase.storage.from('banners').getPublicUrl(fileName);
          imageUrl = data.publicUrl;
          console.log('File uploaded successfully, URL:', imageUrl);
        }
      }

      if (selectedMobileFile) {
        console.log('Uploading mobile file:', selectedMobileFile.name);
        
        // Nettoyer le nom de fichier
        const cleanFileName = selectedMobileFile.name
          .replace(/[^a-zA-Z0-9.-]/g, '-')
          .replace(/-+/g, '-');
        
        const fileName = `banner-mobile-${Date.now()}-${cleanFileName}`;
        
        console.log('Attempting to upload mobile image to banners bucket with filename:', fileName);
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('banners')
          .upload(fileName, selectedMobileFile, {
            cacheControl: '3600',
            upsert: false
          });
          
        if (uploadError) {
          console.error('Mobile upload error details:', uploadError);
          throw new Error(`Erreur upload mobile: ${uploadError.message}`);
        } else if (uploadData) {
          const { data } = supabase.storage.from('banners').getPublicUrl(fileName);
          mobileImageUrl = data.publicUrl;
          console.log('Mobile file uploaded successfully, URL:', mobileImageUrl);
        }
      }
      
      const bannerData = {
        titre: bannerForm.titre.trim(),
        description: bannerForm.description?.trim() || '',
        image: imageUrl,
        image_mobile: mobileImageUrl || null,
        lien_bouton: bannerForm.lien_bouton?.trim() || '',
        texte_bouton: bannerForm.texte_bouton?.trim() || 'Découvrir',
        ordre: bannerForm.ordre,
        actif: bannerForm.actif,
      };
      
      console.log('Banner data to save:', bannerData);
      
      let result;
      if (bannerForm.id) {
        console.log('Updating existing banner with ID:', bannerForm.id);
        const { data, error } = await supabase
          .from('banner_accordion')
          .update(bannerData)
          .eq('id', bannerForm.id)
          .select()
          .single();
          
        if (error) {
          console.error('Update error:', error);
          throw new Error(`Erreur mise à jour: ${error.message}`);
        }
        result = data;
        
        toast({
          title: "Bannière mise à jour",
          description: "La bannière a été mise à jour avec succès",
        });
      } else {
        console.log('Creating new banner...');
        const { data, error } = await supabase
          .from('banner_accordion')
          .insert([bannerData])
          .select()
          .single();
          
        if (error) {
          console.error('Insert error:', error);
          throw new Error(`Erreur création: ${error.message}`);
        }
        result = data;
        
        toast({
          title: "Bannière ajoutée",
          description: "La nouvelle bannière a été ajoutée avec succès",
        });
      }
      
      console.log('Banner saved successfully:', result);
      await fetchBanners();
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
    console.log('Editing banner:', banner);
    setBannerForm(banner);
    setPreviewUrl(banner.image);
    setMobilePreviewUrl(banner.image_mobile);
    setSelectedFile(null);
    setSelectedMobileFile(null);
  };

  const handleDeleteBanner = async (id: string) => {
    try {
      setSaving(true);
      console.log('Deleting banner with ID:', id);
      
      if (!isAdmin) {
        throw new Error('Permissions insuffisantes - vous devez être administrateur');
      }
      
      const { error: deleteError } = await supabase
        .from('banner_accordion')
        .delete()
        .eq('id', id);
        
      if (deleteError) {
        console.error('Delete error:', deleteError);
        throw new Error(`Erreur suppression: ${deleteError.message}`);
      }
      
      console.log('Banner deleted successfully');
      toast({
        title: "Bannière supprimée",
        description: "La bannière a été supprimée avec succès",
      });
      
      fetchBanners();
      
      if (bannerForm.id === id) {
        clearForm();
      }
    } catch (error: any) {
      console.error('Delete banner error:', error);
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
      image_mobile: '',
      lien_bouton: '',
      texte_bouton: 'Découvrir',
      ordre: banners.length + 1,
      actif: true,
    });
    setSelectedFile(null);
    setSelectedMobileFile(null);
    setPreviewUrl(null);
    setMobilePreviewUrl(null);
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
                  <label className="block text-sm font-medium text-gray-700">Image de la bannière (Desktop/Tablette)</label>
                  
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
                    {previewUrl ? (
                      <div className="relative w-full">
                        <img 
                          src={previewUrl} 
                          alt="Preview Desktop" 
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
                          Cliquez pour sélectionner une image (Desktop)
                        </p>
                      </div>
                    )}
                    
                    <label className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sonoff-blue hover:bg-sonoff-teal cursor-pointer">
                      <Upload className="mr-2 h-4 w-4" />
                      Choisir une image (Desktop)
                      <input 
                        type="file" 
                        className="sr-only" 
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Image de la bannière (Mobile)</label>
                  
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
                    {mobilePreviewUrl ? (
                      <div className="relative w-full">
                        <img 
                          src={mobilePreviewUrl} 
                          alt="Preview Mobile" 
                          className="w-full h-40 object-cover rounded-md" 
                        />
                        <button 
                          className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white"
                          onClick={() => {
                            setMobilePreviewUrl(null);
                            setSelectedMobileFile(null);
                            setBannerForm({
                              ...bannerForm,
                              image_mobile: '',
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
                          Cliquez pour sélectionner une image (Mobile)
                        </p>
                        <p className="text-xs text-gray-400">
                          Optionnel: si non fournie, l'image desktop sera utilisée
                        </p>
                      </div>
                    )}
                    
                    <label className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sonoff-blue hover:bg-sonoff-teal cursor-pointer">
                      <Upload className="mr-2 h-4 w-4" />
                      Choisir une image (Mobile)
                      <input 
                        type="file" 
                        className="sr-only" 
                        accept="image/*"
                        onChange={handleMobileFileChange}
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
                    disabled={saving || (!previewUrl && !bannerForm.image)}
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
