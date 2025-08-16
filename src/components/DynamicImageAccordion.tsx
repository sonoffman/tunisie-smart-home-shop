
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { type CarouselApi } from '@/components/ui/carousel';

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

const DynamicImageAccordion = () => {
  const [banners, setBanners] = useState<BannerAccordion[]>([]);
  const [loading, setLoading] = useState(true);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const isMobile = useIsMobile();

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
          fetchBanners();
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up banner subscription');
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (!api || banners.length === 0) {
      return;
    }

    try {
      setCurrent(api.selectedScrollSnap());

      const handleSelect = () => {
        try {
          setCurrent(api.selectedScrollSnap());
        } catch (error) {
          console.error('Error updating carousel current slide:', error);
        }
      };

      api.on("select", handleSelect);

      // Auto-scroll every 5 seconds (as requested)
      const interval = setInterval(() => {
        try {
          if (api && banners.length > 1) {
            api.scrollNext();
          }
        } catch (error) {
          console.error('Error auto-scrolling carousel:', error);
        }
      }, 5000);

      return () => {
        clearInterval(interval);
        try {
          api.off("select", handleSelect);
        } catch (error) {
          console.error('Error cleaning up carousel listeners:', error);
        }
      };
    } catch (error) {
      console.error('Error setting up carousel:', error);
    }
  }, [api, banners.length]);

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
      <Carousel 
        className="w-full" 
        opts={{ align: "start", loop: true }}
        setApi={setApi}
        onError={(error) => console.error('Carousel error:', error)}
      >
        <CarouselContent>
          {banners.map((banner, index) => (
            <CarouselItem key={banner.id}>
              <div 
                className="relative w-full h-96 overflow-hidden rounded-lg shadow-lg transition-all duration-500"
                style={{
                  backgroundImage: `url(${isMobile && banner.image_mobile ? banner.image_mobile : banner.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <div className="text-center text-white max-w-2xl px-4 transform transition-transform duration-500">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in">
                      {banner.titre}
                    </h1>
                    <p className="text-lg md:text-xl mb-8 opacity-90 animate-fade-in-delay">
                      {banner.description}
                    </p>
                    {banner.lien_bouton && banner.texte_bouton && (
                      <Button 
                        asChild 
                        size="lg" 
                        className="bg-sonoff-orange hover:bg-sonoff-orange/90 text-white px-8 py-3 text-lg transform hover:scale-105 transition-all duration-300"
                      >
                        <Link to={banner.lien_bouton}>
                          {banner.texte_bouton}
                        </Link>
                      </Button>
                    )}
                  </div>
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
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === current ? 'bg-sonoff-orange' : 'bg-gray-300'
              }`}
              onClick={() => {
                try {
                  api?.scrollTo(index);
                } catch (error) {
                  console.error('Error scrolling to slide:', error);
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DynamicImageAccordion;
