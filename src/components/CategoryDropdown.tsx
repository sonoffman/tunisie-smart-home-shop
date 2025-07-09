
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Cpu, Home, Lightbulb, Shield, Zap, Gauge, Thermometer, Eye, Plug } from 'lucide-react';

const CategoryDropdown = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  // Icônes et traductions pour les catégories
  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('switch') || name.includes('interrupteur')) return <Lightbulb className="h-4 w-4" />;
    if (name.includes('sensor') || name.includes('capteur')) return <Eye className="h-4 w-4" />;
    if (name.includes('security') || name.includes('securite') || name.includes('sécurité')) return <Shield className="h-4 w-4" />;
    if (name.includes('camera') || name.includes('caméra')) return <Eye className="h-4 w-4" />;
    if (name.includes('power') || name.includes('alimentation')) return <Zap className="h-4 w-4" />;
    if (name.includes('control') || name.includes('controle') || name.includes('contrôle')) return <Gauge className="h-4 w-4" />;
    if (name.includes('temperature') || name.includes('température')) return <Thermometer className="h-4 w-4" />;
    if (name.includes('hub') || name.includes('gateway')) return <Cpu className="h-4 w-4" />;
    if (name.includes('plug') || name.includes('prise')) return <Plug className="h-4 w-4" />;
    if (name.includes('accessoire') || name.includes('accessory')) return <Home className="h-4 w-4" />;
    return <Home className="h-4 w-4" />;
  };

  const getCategoryDisplayName = (categoryName: string) => {
    const translations: { [key: string]: string } = {
      'smart switches': 'Interrupteurs Intelligents',
      'smart switch': 'Interrupteurs Intelligents',
      'switches': 'Interrupteurs',
      'sensors': 'Capteurs',
      'sensor': 'Capteurs',
      'security cameras': 'Caméras de Sécurité',
      'security': 'Sécurité',
      'power management': 'Gestion d\'Alimentation',
      'power': 'Alimentation',
      'control hubs': 'Hubs de Contrôle',
      'hubs': 'Hubs',
      'temperature control': 'Contrôle de Température',
      'temperature': 'Température',
      'smart plugs': 'Prises Intelligentes',
      'plugs': 'Prises',
      'accessories': 'Accessoires',
      'accessoire': 'Accessoires',
      'package accessoire': 'Kits d\'Accessoires'
    };

    const lowerName = categoryName.toLowerCase();
    return translations[lowerName] || categoryName;
  };

  const handleCategorySelect = (categorySlug: string) => {
    navigate(`/category/${categorySlug}`);
    setIsOpen(false);
  };

  const handleAllProducts = () => {
    navigate('/products');
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 text-gray-700 hover:text-sonoff-blue transition-colors bg-transparent"
        >
          <Home className="h-4 w-4" />
          Catégories
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 bg-white shadow-lg border border-gray-200 z-50">
        <DropdownMenuItem 
          onClick={handleAllProducts}
          className="flex items-center gap-3 px-4 py-3 hover:bg-sonoff-blue/10 cursor-pointer"
        >
          <Cpu className="h-4 w-4 text-sonoff-blue" />
          <span className="font-medium">Tous les Produits</span>
        </DropdownMenuItem>
        
        <div className="border-t border-gray-100 my-1" />
        
        {categories.map((category) => (
          <DropdownMenuItem
            key={category.id}
            onClick={() => handleCategorySelect(category.slug)}
            className="flex items-center gap-3 px-4 py-3 hover:bg-sonoff-blue/10 cursor-pointer"
          >
            <span className="text-sonoff-blue">
              {getCategoryIcon(category.name)}
            </span>
            <span className="font-medium text-gray-800">
              {getCategoryDisplayName(category.name)}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CategoryDropdown;
