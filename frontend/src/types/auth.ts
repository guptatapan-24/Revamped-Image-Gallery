// src/types/auth.ts - FIXED AUTH TYPES
import { User as SupabaseUser } from '@supabase/supabase-js';

// Helper function to safely access any user object
export const getUserMetadata = (user: any) => {
  if (!user) return {};
  
  // Handle both custom User and Supabase User types
  const metadata = user.user_metadata || user.raw_user_meta_data || {};
  return metadata;
};

// Helper functions for specific metadata access
export const getUsername = (user: any): string => {
  const metadata = getUserMetadata(user);
  return metadata?.username || 
         user?.email?.split('@')[0] || 
         'user';
};

export const getFullName = (user: any): string => {
  const metadata = getUserMetadata(user);
  return metadata?.full_name || 
         metadata?.name ||
         metadata?.username || 
         getUsername(user);
};

export const getAvatarUrl = (user: any): string | undefined => {
  const metadata = getUserMetadata(user);
  return metadata?.avatar_url || metadata?.picture;
};

export const getUserEmail = (user: any): string => {
  return user?.email || '';
};

export const getUserCreatedAt = (user: any): string => {
  return user?.created_at || user?.createdAt || new Date().toISOString();
};

export const getUserId = (user: any): string => {
  return user?.id || user?.uid || '';
};
