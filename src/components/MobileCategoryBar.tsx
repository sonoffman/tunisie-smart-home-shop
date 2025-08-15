import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Grid, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

const MobileCategoryBar = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Only show on mobile
  if (!isMobile) return null;

  return (
    <div className="sticky top-0 z-40 bg-white border-b shadow-sm p-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <div className="flex items-center">
              <Grid size={16} className="mr-2" />
              <span>Choisir une catégorie</span>
            </div>
            <ChevronDown size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-72 max-h-80 overflow-y-auto">
          <DropdownMenuItem asChild>
            <Link to="/products" className="flex items-center w-full">
              <span className="font-medium">Tous les produits</span>
            </Link>
          </DropdownMenuItem>
          {categories.map((category) => (
            <DropdownMenuItem key={category.id} asChild>
              <Link 
                to={`/category/${category.slug}`}
                className="flex items-center w-full"
              >
                {category.icon && (
                  <span className="mr-2 text-lg">{category.icon}</span>
                )}
                <span>{category.name}</span>
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default MobileCategoryBar;