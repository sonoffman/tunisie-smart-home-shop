
import React, { useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { toast } = useToast();

  useEffect(() => {
    // Create required buckets on application startup
    const checkAndCreateBuckets = async () => {
      try {
        console.log("Checking and creating storage buckets...");
        
        try {
          const { data: buckets, error: listError } = await supabase.storage.listBuckets();
          
          if (listError) {
            console.error("Error listing buckets:", listError);
            return;
          }
          
          // List of buckets we want to ensure exist
          const requiredBuckets = [
            { name: 'product-images', public: true, fileSizeLimit: 10485760 }, // 10MB
            { name: 'banners', public: true, fileSizeLimit: 10485760 }, // 10MB
            { name: 'invoice-assets', public: true, fileSizeLimit: 5242880 } // 5MB
          ];
          
          // Check each required bucket
          for (const bucket of requiredBuckets) {
            const bucketExists = buckets?.some(b => b.name === bucket.name);
            
            if (!bucketExists) {
              console.log(`Creating ${bucket.name} bucket...`);
              const { error } = await supabase.storage.createBucket(bucket.name, {
                public: bucket.public,
                fileSizeLimit: bucket.fileSizeLimit
              });
              
              if (error) {
                console.error(`Error creating ${bucket.name} bucket:`, error);
                // Show toast notification about the error
                toast({
                  title: "Erreur",
                  description: `Impossible de créer le stockage pour ${bucket.name}. Veuillez réessayer plus tard.`,
                  variant: "destructive",
                });
              } else {
                console.log(`Bucket '${bucket.name}' created successfully`);
                
                // Update bucket policies to make it public
                try {
                  // Create a policy to allow public access
                  const { error: policyError } = await supabase.storage.from(bucket.name)
                    .createSignedUrl('dummy.txt', 60);
                  
                  if (policyError && !policyError.message.includes("The resource was not found")) {
                    console.error(`Error setting bucket policy for ${bucket.name}:`, policyError);
                  }
                } catch (policyError) {
                  console.error(`Error setting policy for ${bucket.name}:`, policyError);
                }
              }
            } else {
              console.log(`Bucket '${bucket.name}' already exists`);
            }
          }
        } catch (error) {
          console.error("Error with storage buckets:", error);
          toast({
            title: "Erreur",
            description: "Un problème est survenu lors de la vérification des espaces de stockage.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error checking buckets:", error);
      }
    };
    
    checkAndCreateBuckets();
  }, [toast]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
