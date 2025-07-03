
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

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

const DynamicImageAccordion = () => {
  const [banners, setBanners] = useState<BannerAccordion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        console.log('Fetching banners from banner_accordion table...');
        const { data, error } = await supabase
          .from('banner_accordion')
          .select('*')
          .eq('actif', true)
          .order('ordre', { ascending: true });

        if (error) {
          console.error('Error fetching banners:', error);
          throw error;
        }
        
        console.log('Banners fetched successfully:', data?.length || 0, 'active banners found');
        console.log('Banner data:', data);
        
        if (data && data.length > 0) {
          setBanners(data);
        } else {
          console.log('No active banners found in database');
          setBanners([]);
        }
      } catch (error) {
        console.error('Error fetching banners:', error);
        setBanners([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();

    // Set up real-time subscription for banner updates
    const channel = supabase
      .channel('banner_accordion_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'banner_accordion'
        },
        (payload) => {
          console.log('Banner change detected:', payload);
          fetchBanners(); // Refresh banners when changes occur
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up banner subscription');
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="h-96 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Chargement des bannières...</p>
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Aucune bannière active trouvée</p>
      </div>
    );
  }

  console.log('Rendering', banners.length, 'banners');

  return (
    <div className="relative w-full mb-8">
      <Carousel className="w-full" opts={{ align: "start", loop: true }}>
        <CarouselContent>
          {banners.map((banner, index) => (
            <CarouselItem key={banner.id}>
              <div 
                className="relative w-full h-96 overflow-hidden rounded-lg shadow-lg"
                style={{
                  backgroundImage: `url(${banner.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <div className="text-center text-white max-w-2xl px-4">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4">
                      {banner.titre}
                    </h1>
                    <p className="text-lg md:text-xl mb-8 opacity-90">
                      {banner.description}
                    </p>
                    {banner.lien_bouton && banner.texte_bouton && (
                      <Button 
                        asChild 
                        size="lg" 
                        className="bg-sonoff-orange hover:bg-sonoff-orange/90 text-white px-8 py-3 text-lg"
                      >
                        <Link to={banner.lien_bouton}>
                          {banner.texte_bouton}
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
                {/* Debug info in development */}
                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  {index + 1}/{banners.length}
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {banners.length > 1 && (
          <>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </>
        )}
      </Carousel>
      
      {/* Indicators */}
      {banners.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {banners.map((_, index) => (
            <div
              key={index}
              className="w-2 h-2 rounded-full bg-gray-300"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DynamicImageAccordion;
