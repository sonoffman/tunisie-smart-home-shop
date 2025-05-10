
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface BannerItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
}

const ImageAccordion = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [bannerItems, setBannerItems] = useState<BannerItem[]>([]);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        // Récupérer les bannières depuis la base de données
        const { data, error } = await supabase
          .from('banners')
          .select('*')
          .eq('active', true)
          .order('created_at', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          // Formater les données de la bannière
          const formattedBanners = data.map(banner => ({
            id: banner.id,
            title: banner.title,
            description: banner.subtitle || '',
            imageUrl: banner.image_url,
            link: banner.link || '#'
          }));
          setBannerItems(formattedBanners);
        } else {
          // Utiliser les bannières par défaut si aucune n'est trouvée
          setBannerItems(defaultBannerItems);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des bannières:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les bannières",
          variant: "destructive",
        });
        // Utiliser les bannières par défaut en cas d'erreur
        setBannerItems(defaultBannerItems);
      }
    };

    fetchBanners();
  }, [toast]);

  // Bannières par défaut à utiliser si aucune n'est trouvée dans la base de données
  const defaultBannerItems: BannerItem[] = [
    {
      id: '1',
      title: 'Modules WiFi Sonoff',
      description: 'Contrôlez vos appareils à distance avec la technologie Sonoff.',
      imageUrl: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&w=1200&q=80',
      link: '/category/wifi'
    },
    {
      id: '2',
      title: 'Modules ZigBee',
      description: 'Connectez tous vos appareils avec la technologie ZigBee de Sonoff.',
      imageUrl: 'https://images.unsplash.com/photo-1585399000684-d2f72660f092?auto=format&fit=crop&w=1200&q=80',
      link: '/category/zigbee'
    },
    {
      id: '3',
      title: 'Interrupteurs Intelligents',
      description: 'Transformez votre maison avec nos interrupteurs connectés.',
      imageUrl: 'https://images.unsplash.com/photo-1596394723269-b2cbca4e6313?auto=format&fit=crop&w=1200&q=80',
      link: '/category/switch'
    },
    {
      id: '4',
      title: 'Écrans Tactiles',
      description: 'Pilotez votre maison intelligente depuis un écran tactile.',
      imageUrl: 'https://images.unsplash.com/photo-1544437939-ab1e06a4d0de?auto=format&fit=crop&w=1200&q=80',
      link: '/category/screen'
    },
    {
      id: '5',
      title: 'Accessoires Sonoff',
      description: 'Complétez votre installation avec nos accessoires compatibles.',
      imageUrl: 'https://images.unsplash.com/photo-1558346490-c7d0047bfbf6?auto=format&fit=crop&w=1200&q=80',
      link: '/category/accessories'
    }
  ];

  // Ne pas afficher la bannière sur mobile
  if (isMobile) {
    return null;
  }

  return (
    <div className="container mx-auto px-4">
      <div className="image-accordion">
        {bannerItems.map((item, index) => (
          <div 
            key={item.id}
            className={`image-accordion-item ${index === activeIndex ? 'active' : ''}`}
            onClick={() => setActiveIndex(index)}
            style={{ backgroundImage: `url(${item.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          >
            <div className="image-accordion-content">
              <h3 className="text-xl font-bold">{item.title}</h3>
              {index === activeIndex && (
                <>
                  <p className="mt-2 mb-4">{item.description}</p>
                  <Link 
                    to={item.link} 
                    className="inline-block bg-sonoff-orange text-white px-4 py-2 rounded-md font-semibold hover:bg-opacity-90 transition-all"
                  >
                    Découvrir
                  </Link>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageAccordion;
