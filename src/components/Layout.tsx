
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
    // Create required buckets on application startup
    const checkAndCreateBuckets = async () => {
      try {
        console.log("Checking and creating storage buckets...");
        
        // Bucket for product images
        try {
          const { data: buckets, error: listError } = await supabase.storage.listBuckets();
          
          if (listError) {
            console.error("Error listing buckets:", listError);
            return;
          }
          
          // Check if product-images bucket exists
          const productBucketExists = buckets?.some(bucket => bucket.name === 'product-images');
          
          if (!productBucketExists) {
            console.log("Creating product-images bucket...");
            const { data, error } = await supabase.storage.createBucket('product-images', {
              public: true,
              fileSizeLimit: 10485760, // 10MB
            });
            
            if (error) {
              console.error("Error creating product-images bucket:", error);
            } else {
              console.log("Bucket 'product-images' created successfully");
              
              // Set bucket public
              const { error: policyError } = await supabase
                .storage
                .from('product-images')
                .createSignedUrl('dummy.txt', 60);
                
              if (policyError && !policyError.message.includes("The resource was not found")) {
                console.error("Error setting bucket policy:", policyError);
              }
            }
          } else {
            console.log("Bucket 'product-images' already exists");
          }
          
          // Check if banners bucket exists
          const bannerBucketExists = buckets?.some(bucket => bucket.name === 'banners');
          
          if (!bannerBucketExists) {
            console.log("Creating banners bucket...");
            const { data, error } = await supabase.storage.createBucket('banners', {
              public: true,
              fileSizeLimit: 10485760, // 10MB
            });
            
            if (error) {
              console.error("Error creating banners bucket:", error);
            } else {
              console.log("Bucket 'banners' created successfully");
              
              // Set bucket public
              const { error: policyError } = await supabase
                .storage
                .from('banners')
                .createSignedUrl('dummy.txt', 60);
                
              if (policyError && !policyError.message.includes("The resource was not found")) {
                console.error("Error setting bucket policy:", policyError);
              }
            }
          } else {
            console.log("Bucket 'banners' already exists");
          }
        } catch (error) {
          console.error("Error with storage buckets:", error);
        }
      } catch (error) {
        console.error("Error checking buckets:", error);
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
