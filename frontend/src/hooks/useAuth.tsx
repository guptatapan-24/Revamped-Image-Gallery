// src/hooks/useAuth.tsx - COMPLETE WITH ROLE MANAGEMENT
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, Session, AuthError } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  loading: boolean;
  userRole: string;
  hasRole: (role: string) => boolean;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ user: User | null; error: AuthError | null; needsConfirmation?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: AuthError | null }>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  resendConfirmation: (email: string) => Promise<{ error: AuthError | null }>;
  updateUserRole: (userId: string, role: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Get user role safely
  const getUserRole = (): string => {
    return user?.user_metadata?.role || 'user';
  };

  const userRole = getUserRole();

  // ✅ Check if user has specific role
  const hasRole = (role: string): boolean => {
    const currentRole = getUserRole();
    
    if (role === 'user') return true; // All authenticated users are 'user'
    if (role === 'editor') return ['editor', 'admin'].includes(currentRole);
    if (role === 'admin') return currentRole === 'admin';
    
    return false;
  };

  // ✅ Update user role (admin only)
  const updateUserRole = async (userId: string, role: string) => {
    if (!hasRole('admin')) {
      throw new Error('Only admins can update user roles');
    }

    try {
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        user_metadata: { role }
      });

      if (error) throw error;
      
      console.log('✅ User role updated successfully');
    } catch (error) {
      console.error('❌ Failed to update user role:', error);
      throw error;
    }
  };

  useEffect(() => {
    // Initialize auth state
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        } else {
          console.log('✅ Initial session loaded:', session?.user?.email);
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state changed:', event, session?.user?.email);
        
        switch (event) {
          case 'INITIAL_SESSION':
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
            break;
            
          case 'SIGNED_IN':
            console.log('✅ User signed in with role:', session?.user?.user_metadata?.role || 'user');
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
            break;
            
          case 'SIGNED_OUT':
            console.log('👋 User signed out');
            setSession(null);
            setUser(null);
            setLoading(false);
            break;
            
          case 'TOKEN_REFRESHED':
            console.log('🔄 Token refreshed');
            setSession(session);
            setUser(session?.user ?? null);
            break;
            
          case 'USER_UPDATED':
            console.log('📝 User updated');
            setSession(session);
            setUser(session?.user ?? null);
            break;
            
          default:
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ✅ Enhanced signUp with role support
  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      console.log('📝 Attempting signup for:', email);

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'user', // Default role
            ...metadata
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (signUpError) {
        console.error('❌ Signup error:', signUpError);
        return { user: null, error: signUpError };
      }

      console.log('✅ Signup successful:', signUpData.user?.email);

      // Check if user needs to confirm email
      if (signUpData.user && !signUpData.session) {
        console.log('📧 User needs to confirm email');
        return { 
          user: signUpData.user, 
          error: null, 
          needsConfirmation: true 
        };
      }

      return { user: signUpData.user, error: null, needsConfirmation: false };
      
    } catch (error) {
      console.error('❌ Signup process error:', error);
      return { user: null, error: error as AuthError };
    }
  };

  // ✅ Enhanced signIn
  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔑 Attempting login for:', email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('❌ Login error:', error.message);
        
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Please check your email and click the confirmation link to activate your account.');
        } else if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please check your credentials and try again.');
        } else {
          throw new Error(error.message);
        }
      }

      console.log('✅ Login successful:', data.user?.email);
      return { user: data.user, error: null };
      
    } catch (error) {
      console.error('❌ Login process error:', error);
      return { user: null, error: error as AuthError };
    }
  };

  // ✅ Resend confirmation email
  const resendConfirmation = async (email: string) => {
    try {
      console.log('📧 Resending confirmation email to:', email);
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        console.error('❌ Resend confirmation error:', error);
        return { error };
      }

      console.log('✅ Confirmation email resent successfully');
      return { error: null };
    } catch (error) {
      console.error('❌ Resend confirmation process error:', error);
      return { error: error as AuthError };
    }
  };

  // ✅ Sign out with cleanup
  const signOut = async () => {
    console.log('👋 Signing out...');
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Signout error:', error);
        throw error;
      } else {
        console.log('✅ Signed out successfully');
      }
    } catch (error) {
      console.error('❌ Signout failed:', error);
      // Force clear state even if signout fails
      setUser(null);
      setSession(null);
      setLoading(false);
      throw error;
    }
  };

  const logout = signOut;

  const value = {
    user,
    session,
    isAuthenticated: !!user,
    loading,
    userRole,
    hasRole,
    signUp,
    signIn,
    signOut,
    logout,
    resendConfirmation,
    updateUserRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
