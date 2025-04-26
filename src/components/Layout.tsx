
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
        // Bucket pour les images de produits
        const { data: productBucketExists } = await supabase.storage.getBucket('product-images');
        
        if (!productBucketExists) {
          await supabase.storage.createBucket('product-images', {
            public: true,
          });
        }
        
        // Bucket pour les bannières
        const { data: bannerBucketExists } = await supabase.storage.getBucket('banners');
        
        if (!bannerBucketExists) {
          await supabase.storage.createBucket('banners', {
            public: true,
          });
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
      <ContactFooter />
      <Footer />
    </div>
  );
};

export default Layout;
