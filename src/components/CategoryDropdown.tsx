
import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

const CategoryDropdown = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Toutes les catégories');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchCategories();
    
    // Mettre à jour le texte du bouton selon la route actuelle
    const currentPath = location.pathname;
    if (currentPath === '/') {
      setSelectedCategory('Toutes les catégories');
    } else if (currentPath.startsWith('/category/')) {
      const categorySlug = currentPath.split('/category/')[1];
      const category = categories.find(cat => cat.slug === categorySlug);
      if (category) {
        setSelectedCategory(category.name);
      }
    }
  }, [location.pathname, categories]);

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

  const handleCategorySelect = (category: Category | null) => {
    if (category) {
      setSelectedCategory(category.name);
      navigate(`/category/${category.slug}`);
    } else {
      setSelectedCategory('Toutes les catégories');
      navigate('/');
    }
    setIsOpen(false);
  };

  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('switch') || name.includes('interrupteur')) return '🔌';
    if (name.includes('sensor') || name.includes('capteur')) return '📡';
    if (name.includes('camera') || name.includes('caméra')) return '📷';
    if (name.includes('gateway') || name.includes('passerelle')) return '🌐';
    if (name.includes('accessoire') || name.includes('accessory')) return '🔧';
    return '📦';
  };

  return (
    <div className="relative mb-4 mx-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-white border border-gray-300 rounded-lg px-4 py-3 text-left shadow-sm hover:bg-gray-50 transition-colors"
      >
        <span className="flex items-center">
          <span className="mr-2">{getCategoryIcon(selectedCategory)}</span>
          <span className="font-medium text-gray-900">{selectedCategory}</span>
        </span>
        <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          <button
            onClick={() => handleCategorySelect(null)}
            className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center border-b border-gray-100"
          >
            <span className="mr-3">🏠</span>
            <span className="font-medium">Toutes les catégories</span>
          </button>
          
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategorySelect(category)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center border-b border-gray-100 last:border-b-0"
            >
              <span className="mr-3">{getCategoryIcon(category.name)}</span>
              <span className="font-medium">{category.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryDropdown;
