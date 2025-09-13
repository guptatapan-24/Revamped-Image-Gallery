// src/pages/ProfileSettings.tsx - COMPLETE IMPLEMENTATION WITH SAVE FUNCTIONALITY
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2, Save, User, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProfileData {
  name: string;
  email: string;
  bio: string;
  location: string;
  avatar_url?: string;
  username?: string;
}

const ProfileSettings: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ProfileData>({
    name: '',
    email: '',
    bio: '',
    location: '',
    avatar_url: '',
    username: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // ✅ Safe way to get user name from user_metadata or email
  const getUserName = () => {
    if (!user) return '';
    
    // Try different sources for user name
    return user.user_metadata?.full_name || 
           user.user_metadata?.name || 
           user.user_metadata?.username ||
           user.email?.split('@')[0] || 
           '';
  };

  // ✅ Load profile data on component mount
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user) {
      loadProfileData();
    }
  }, [user, isAuthenticated, navigate]);

  const loadProfileData = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // ✅ First, set data from auth user and user_metadata
      const initialData: ProfileData = {
        name: getUserName(),
        email: user.email || '',
        bio: '',
        location: '',
        avatar_url: user.user_metadata?.avatar_url || '',
        username: user.user_metadata?.username || ''
      };

      setFormData(initialData);

      // ✅ Then, try to load additional data from profiles table
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.warn('Profile not found, will create new one on save:', error);
      } else if (profileData) {
        // ✅ Merge profile data with auth data
        setFormData(prev => ({
          ...prev,
          name: profileData.full_name || profileData.username || prev.name,
          bio: profileData.bio || '',
          location: profileData.location || '',
          avatar_url: profileData.avatar_url || prev.avatar_url,
          username: profileData.username || prev.username
        }));
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear success message when user starts editing
    if (success) setSuccess(false);
    if (error) setError(null);
  };

  // ✅ Implement save functionality
  const handleSave = async () => {
    if (!user?.id) {
      setError('User not authenticated');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // ✅ Update user metadata (auth.users table)
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: formData.name,
          username: formData.username,
          avatar_url: formData.avatar_url
        }
      });

      if (authError) {
        throw new Error(`Failed to update user metadata: ${authError.message}`);
      }

      // ✅ Upsert profile data (profiles table)
      const profileData = {
        id: user.id,
        full_name: formData.name,
        username: formData.username,
        bio: formData.bio,
        location: formData.location,
        avatar_url: formData.avatar_url,
        email: formData.email,
        updated_at: new Date().toISOString()
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData, {
          onConflict: 'id'
        });

      if (profileError) {
        throw new Error(`Failed to update profile: ${profileError.message}`);
      }

      setSuccess(true);
      console.log('✅ Profile updated successfully');

      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);

    } catch (err) {
      console.error('❌ Error saving profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  // ✅ Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-xl font-semibold mb-2">Loading Profile...</h2>
          <p className="text-muted-foreground">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  // ✅ Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-4">Please Log In</h2>
          <p className="text-muted-foreground mb-6">You need to be logged in to access profile settings.</p>
          <Button onClick={() => navigate('/login')}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* ✅ Header with back button */}
          <div className="flex items-center mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/profile')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Button>
            <h1 className="text-3xl font-bold">Profile Settings</h1>
          </div>
          
          {/* ✅ Profile form */}
          <div className="bg-card rounded-lg border p-6 space-y-6">
            {/* Success Message */}
            {success && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-700">
                  ✅ Profile updated successfully!
                </AlertDescription>
              </Alert>
            )}

            {/* Error Message */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Current User Info */}
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Logged in as:</strong> {user?.email} 
                {user?.user_metadata?.role && (
                  <span className="ml-2 px-2 py-1 bg-primary text-primary-foreground rounded text-xs">
                    {user.user_metadata.role}
                  </span>
                )}
              </p>
            </div>

            {/* Form Fields */}
            <div>
              <label className="text-sm font-medium mb-2 block">Name</label>
              <Input 
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                disabled={saving}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Username</label>
              <Input 
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Choose a username"
                disabled={saving}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Email</label>
              <Input 
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                type="email"
                disabled={true}
                className="bg-muted"
                title="Email cannot be changed here"
              />
              <p className="text-xs text-muted-foreground mt-1">
                To change your email, please contact support or use account settings.
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Bio</label>
              <Textarea 
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                placeholder="Tell us about yourself..."
                disabled={saving}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Location</label>
              <Input 
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="City, Country"
                disabled={saving}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Avatar URL</label>
              <Input 
                name="avatar_url"
                value={formData.avatar_url}
                onChange={handleInputChange}
                placeholder="https://example.com/avatar.jpg"
                type="url"
                disabled={saving}
              />
            </div>
            
            {/* Save Button */}
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="w-full"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
