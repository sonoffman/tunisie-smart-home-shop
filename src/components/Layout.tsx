
// Do not modify this file directly. This file is part of the Lovable project template.
import React, { useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import ContactFooter from './ContactFooter';
import { supabase } from '@/integrations/supabase/client';

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  useEffect(() => {
    // Vérifier et créer les buckets nécessaires au démarrage de l'application
    const checkAndCreateBuckets = async () => {
      try {
        console.log("Checking and creating storage buckets...");
        
        // Bucket pour les images de produits
        try {
          const { data: productBucketExists, error: productBucketError } = await supabase.storage.getBucket('product-images');
          
          if (productBucketError && productBucketError.message && productBucketError.message.includes('not found')) {
            console.log("Creating product-images bucket...");
            const { data, error } = await supabase.storage.createBucket('product-images', {
              public: true,
              fileSizeLimit: 10485760, // 10MB
            });
            
            if (error) {
              console.error("Error creating product-images bucket:", error);
            } else {
              console.log("Bucket 'product-images' créé avec succès");
            }
          } else if (productBucketExists) {
            console.log("Bucket 'product-images' already exists");
          }
        } catch (error) {
          console.error("Error with product-images bucket:", error);
        }
        
        // Bucket pour les bannières
        try {
          const { data: bannerBucketExists, error: bannerBucketError } = await supabase.storage.getBucket('banners');
          
          if (bannerBucketError && bannerBucketError.message && bannerBucketError.message.includes('not found')) {
            console.log("Creating banners bucket...");
            const { data, error } = await supabase.storage.createBucket('banners', {
              public: true,
              fileSizeLimit: 10485760, // 10MB
            });
            
            if (error) {
              console.error("Error creating banners bucket:", error);
            } else {
              console.log("Bucket 'banners' créé avec succès");
            }
          } else if (bannerBucketExists) {
            console.log("Bucket 'banners' already exists");
          }
        } catch (error) {
          console.error("Error with banners bucket:", error);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification des buckets:", error);
      }
    };
    
    checkAndCreateBuckets();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
