import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CMSContent {
  title: string;
  content: string;
  loading: boolean;
  error: string | null;
}

export const useCMSContent = (slug: string, fallbackTitle: string, fallbackContent: string): CMSContent => {
  const [title, setTitle] = useState(fallbackTitle);
  const [content, setContent] = useState(fallbackContent);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error: fetchError } = await supabase
          .from('cms_pages')
          .select('title, content')
          .eq('slug', slug)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (data) {
          setTitle(data.title);
          setContent(data.content);
        } else {
          // Use fallback content if no CMS page exists
          setTitle(fallbackTitle);
          setContent(fallbackContent);
        }
      } catch (err: any) {
        setError(err.message);
        // Use fallback content on error
        setTitle(fallbackTitle);
        setContent(fallbackContent);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [slug, fallbackTitle, fallbackContent]);

  return { title, content, loading, error };
};