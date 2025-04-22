
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface BannerItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
}

const ImageAccordion = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const bannerItems: BannerItem[] = [
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
