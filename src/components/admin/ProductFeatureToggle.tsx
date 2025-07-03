
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Star, Eye, EyeOff, StarOff } from 'lucide-react';

interface ProductFeatureToggleProps {
  productId: string;
  featured: boolean;
  hidden: boolean;
  onUpdate: () => void;
}

const ProductFeatureToggle: React.FC<ProductFeatureToggleProps> = ({
  productId,
  featured,
  hidden,
  onUpdate,
}) => {
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  const toggleFeatured = async () => {
    if (updating) return;
    
    setUpdating(true);
    try {
      console.log('Toggling featured status for product:', productId, 'from', featured, 'to', !featured);
      
      const { error } = await supabase
        .from('products')
        .update({ featured: !featured })
        .eq('id', productId);

      if (error) {
        console.error('Error updating featured status:', error);
        throw error;
      }

      toast({
        title: "Succès",
        description: `Produit ${!featured ? 'mis en avant' : 'retiré de la mise en avant'}`,
      });
      
      onUpdate();
    } catch (error: any) {
      console.error('Toggle featured error:', error);
      toast({
        title: "Erreur",
        description: `Impossible de modifier le statut: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const toggleHidden = async () => {
    if (updating) return;
    
    setUpdating(true);
    try {
      console.log('Toggling hidden status for product:', productId, 'from', hidden, 'to', !hidden);
      
      const { error } = await supabase
        .from('products')
        .update({ hidden: !hidden })
        .eq('id', productId);

      if (error) {
        console.error('Error updating hidden status:', error);
        throw error;
      }

      toast({
        title: "Succès",
        description: `Produit ${!hidden ? 'masqué' : 'rendu visible'}`,
      });
      
      onUpdate();
    } catch (error: any) {
      console.error('Toggle hidden error:', error);
      toast({
        title: "Erreur",
        description: `Impossible de modifier la visibilité: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex gap-2 items-center">
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleFeatured}
        disabled={updating}
        className={`p-2 hover:bg-gray-100 transition-colors ${
          featured ? 'text-yellow-600 bg-yellow-50' : 'text-gray-400'
        }`}
        title={featured ? 'Retirer de la mise en avant' : 'Mettre en avant'}
      >
        {featured ? <Star size={16} fill="currentColor" /> : <StarOff size={16} />}
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleHidden}
        disabled={updating}
        className={`p-2 hover:bg-gray-100 transition-colors ${
          hidden ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'
        }`}
        title={hidden ? 'Rendre visible' : 'Masquer le produit'}
      >
        {hidden ? <EyeOff size={16} /> : <Eye size={16} />}
      </Button>
      
      {updating && (
        <span className="text-xs text-gray-500">Mise à jour...</span>
      )}
    </div>
  );
};

export default ProductFeatureToggle;
