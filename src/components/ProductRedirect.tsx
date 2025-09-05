import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const ProductRedirect = () => {
  const { id } = useParams<{ id: string }>();
  const [slug, setSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchProductSlug = async () => {
      if (!id) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('products')
          .select('slug')
          .eq('id', id)
          .single();

        if (error || !data?.slug) {
          setNotFound(true);
        } else {
          setSlug(data.slug);
        }
      } catch (error) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProductSlug();
  }, [id]);

  if (loading) {
    return <div>Redirection...</div>;
  }

  if (notFound || !slug) {
    return <Navigate to="/products" replace />;
  }

  // 301 redirect to new URL structure
  return <Navigate to={`/produit/${slug}`} replace />;
};

export default ProductRedirect;