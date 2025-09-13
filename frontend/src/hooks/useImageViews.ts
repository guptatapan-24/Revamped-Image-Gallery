// src/hooks/useImageViews.ts
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface ImageViewsRow {
  image_id: string;
  view_count: number;
  updated_at: string;
}

export const useImageViews = (imageId: string) => {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    let ignore = false;

    const fetchViews = async () => {
      console.log('🔍 Fetching views for:', imageId);
      
      const { data, error } = await supabase
        .from('image_views')
        .select('view_count')
        .eq('image_id', imageId)
        .maybeSingle();
      
      console.log('📊 Query result:', { data, error, imageId });
      
      if (!ignore) {
        if (error) {
          console.error('Query error:', error);
          setViews(0);
        } else {
          const count = data?.view_count ?? 0;
          console.log('📈 Setting views to:', count);
          setViews(count);
        }
      }
    };

    fetchViews();

    // Listen for changes
    const sub = supabase
      .channel(`image_views_${imageId}`)
      .on(
        'postgres_changes',
        { 
          event: '*',
          schema: 'public', 
          table: 'image_views', 
          filter: `image_id=eq.${imageId}` 
        },
        (payload: any) => {
          console.log('🔄 Real-time update:', payload);
          const newCount = payload.new?.view_count ?? 0;
          console.log('📈 Real-time setting views to:', newCount);
          setViews(newCount);
        }
      )
      .subscribe();

    return () => {
      ignore = true;
      supabase.removeChannel(sub);
    };
  }, [imageId]);

  return views; // Return just the views value, not an object
};
