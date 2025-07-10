
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, ImageIcon, Trash2 } from 'lucide-react';

const TestBannerUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name, file.size);
      
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Fichier trop volumineux",
          description: "La taille du fichier ne doit pas dépasser 10MB",
          variant: "destructive",
        });
        return;
      }

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

  const handleTestUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Aucun fichier sélectionné",
        description: "Veuillez d'abord sélectionner une image",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      console.log('Starting banner upload test...');

      // Nettoyer le nom de fichier
      const cleanFileName = selectedFile.name
        .replace(/[^a-zA-Z0-9.-]/g, '-')
        .replace(/-+/g, '-');
      
      const fileName = `test-banner-${Date.now()}-${cleanFileName}`;
      
      console.log('Uploading to banners bucket with filename:', fileName);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('banners')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Erreur upload: ${uploadError.message}`);
      }
      
      console.log('File uploaded successfully:', uploadData);
      
      const { data } = supabase.storage.from('banners').getPublicUrl(fileName);
      const imageUrl = data.publicUrl;
      
      console.log('Public URL:', imageUrl);

      // Créer une bannière test
      const testBanner = {
        titre: 'Bannière Test',
        description: 'Ceci est une bannière de test créée automatiquement',
        image: imageUrl,
        lien_bouton: '/test',
        texte_bouton: 'Test',
        ordre: 999,
        actif: false // Inactive pour ne pas affecter l'affichage
      };

      console.log('Creating test banner:', testBanner);

      const { data: banner, error: bannerError } = await supabase
        .from('banner_accordion')
        .insert([testBanner])
        .select()
        .single();

      if (bannerError) {
        console.error('Banner creation error:', bannerError);
        throw new Error(`Erreur création bannière: ${bannerError.message}`);
      }

      console.log('Banner created successfully:', banner);

      toast({
        title: "Upload réussi",
        description: "L'image a été uploadée et la bannière de test créée avec succès",
      });

      // Nettoyer l'état
      setSelectedFile(null);
      setPreviewUrl(null);
      
      // Reset input
      const input = document.getElementById('test-file-input') as HTMLInputElement;
      if (input) input.value = '';

    } catch (error: any) {
      console.error('Banner upload test error:', error);
      toast({
        title: "Erreur test upload",
        description: `Impossible d'uploader l'image: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    const input = document.getElementById('test-file-input') as HTMLInputElement;
    if (input) input.value = '';
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Test Upload Bannière
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
          {previewUrl ? (
            <div className="relative w-full">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="w-full h-32 object-cover rounded-md" 
              />
              <button 
                className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white"
                onClick={clearSelection}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <ImageIcon className="h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">
                Sélectionnez une image de test
              </p>
            </div>
          )}
          
          <label className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sonoff-blue hover:bg-sonoff-teal cursor-pointer">
            <Upload className="mr-2 h-4 w-4" />
            Choisir une image
            <input 
              id="test-file-input"
              type="file" 
              className="sr-only" 
              accept="image/*"
              onChange={handleFileChange}
            />
          </label>
        </div>

        <Button 
          onClick={handleTestUpload}
          disabled={isUploading || !selectedFile}
          className="w-full"
        >
          {isUploading ? (
            <>Upload en cours...</>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Tester Upload Bannière
            </>
          )}
        </Button>
        
        <p className="text-sm text-gray-500">
          Ce test va uploader l'image et créer une bannière de test inactive.
        </p>
      </CardContent>
    </Card>
  );
};

export default TestBannerUpload;
