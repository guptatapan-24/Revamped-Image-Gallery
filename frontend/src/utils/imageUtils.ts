// src/utils/imageUtils.ts - UNIFIED IMAGE ACCESS
import { supabase } from '../lib/supabase';
import { Image } from '../types';

export const getImageUrl = (image: Image): string => {
  // ✅ All images now use the same URL structure
  if (image.url) {
    return image.url; // Direct URL from database
  }
  
  // ✅ Fallback: construct URL from storage_path
  if (image.storage_path) {
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(image.storage_path);
    return publicUrl;
  }
  
  // ✅ Last resort: construct from filename and user ID
  if (image.filename && image.uploaded_by) {
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(`${image.uploaded_by}/${image.filename}`);
    return publicUrl;
  }
  
  throw new Error('Unable to construct image URL');
};

export const isAiGenerated = (image: Image): boolean => {
  return image.tags?.includes('ai-generated') || 
         image.tags?.includes('stable-diffusion') || 
         image.album === 'AI Generated' ||
         image.filename?.includes('ai-generated') ||
         image.camera === 'Stability AI';
};

export const validateImageData = (image: any): Image => {
  return {
    ...image,
    url: image.url || getImageUrl(image),
    filename: image.filename || `image-${image.id}.jpg`,
    original_filename: image.original_filename || image.filename || `image-${image.id}.jpg`,
    title: image.title || image.original_filename?.split('.')[0] || 'Untitled',
    description: image.description || 'A beautiful image from our gallery.',
    tags: image.tags || ['photography', 'gallery'],
    author: image.author || 'Anonymous',
    camera: image.camera || 'Camera',
    lens: image.lens || 'Lens',
    settings: image.settings || `${image.width || 0}x${image.height || 0}`,
    album: image.album || 'General',
    likes: image.likes || image.like_count || 0,
    comments: image.comments || 0,
    license: image.license || 'All Rights Reserved',
    view_count: image.view_count || 0,
    storage_path: image.storage_path || `${image.uploaded_by}/${image.filename}`,
    mime_type: image.mime_type || 'image/jpeg',
    width: image.width || 0,
    height: image.height || 0,
    size_bytes: image.size_bytes || 0,
    uploaded_by: image.uploaded_by,
    privacy: image.privacy as "public" | "unlisted" | "private",
    created_at: image.created_at
  };
};
