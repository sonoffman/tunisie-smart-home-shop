
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Check, X, Eye, EyeOff } from 'lucide-react';

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
        description: `Produit ${!hidden ? 'masqué' : 'affiché'}`,
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
    <div className="flex gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleFeatured}
        disabled={updating}
        className={`p-1 hover:bg-gray-100 ${featured ? 'text-green-600' : 'text-gray-400'}`}
        title={featured ? 'Retirer de la mise en avant' : 'Mettre en avant'}
      >
        {featured ? <Check size={16} /> : <X size={16} />}
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleHidden}
        disabled={updating}
        className={`p-1 hover:bg-gray-100 ${hidden ? 'text-red-600' : 'text-green-600'}`}
        title={hidden ? 'Afficher le produit' : 'Masquer le produit'}
      >
        {hidden ? <EyeOff size={16} /> : <Eye size={16} />}
      </Button>
    </div>
  );
};

export default ProductFeatureToggle;
