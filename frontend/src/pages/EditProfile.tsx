// src/pages/EditProfile.tsx - COMPLETE FIXED VERSION
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  ArrowLeft, Camera, Save, User, Mail, 
  MapPin, Globe, Calendar, Upload, Loader2, CheckCircle
} from 'lucide-react';

interface ProfileData {
  name: string;
  username: string;
  email: string;
  bio: string;
  location: string;
  website: string;
  phone: string;
  dateOfBirth: string;
  privacy: 'public' | 'private';
  avatar_url: string;
}

const EditProfile: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState<ProfileData>({
    name: '',
    username: '',
    email: '',
    bio: '',
    location: '',
    website: '',
    phone: '',
    dateOfBirth: '',
    privacy: 'public',
    avatar_url: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  // ✅ Helper function to safely get user data
  const getUserName = (): string => {
    if (!user) return '';
    return user.user_metadata?.full_name || 
           user.user_metadata?.name || 
           user.email?.split('@')[0] || 
           '';
  };

  const getUserUsername = (): string => {
    if (!user) return '';
    return user.user_metadata?.username || 
           user.email?.split('@')[0] || 
           '';
  };

  const getUserAvatar = (): string => {
    if (!user) return '';
    return user.user_metadata?.avatar_url || '';
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user) {
      loadProfileData();
    }
  }, [isAuthenticated, navigate, user]);

  // ✅ Load profile data from both auth metadata and profiles table
  const loadProfileData = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Set initial data from auth user
      const initialData: ProfileData = {
        name: getUserName(),
        username: getUserUsername(),
        email: user.email || '',
        bio: '',
        location: '',
        website: '',
        phone: '',
        dateOfBirth: '',
        privacy: 'public',
        avatar_url: getUserAvatar()
      };

      setFormData(initialData);
      setAvatarPreview(initialData.avatar_url || '/api/placeholder/150/150');

      // Try to load additional data from profiles table
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.warn('Error loading profile:', error);
      } else if (profileData) {
        // Merge profile data with auth data
        const mergedData: ProfileData = {
          name: profileData.full_name || initialData.name,
          username: profileData.username || initialData.username,
          email: initialData.email, // Keep from auth
          bio: profileData.bio || '',
          location: profileData.location || '',
          website: profileData.website || '',
          phone: profileData.phone || '',
          dateOfBirth: profileData.date_of_birth || '',
          privacy: profileData.privacy || 'public',
          avatar_url: profileData.avatar_url || initialData.avatar_url
        };

        setFormData(mergedData);
        setAvatarPreview(mergedData.avatar_url || '/api/placeholder/150/150');
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle form field changes
  const handleChange = (field: keyof ProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    // Clear success message when editing
    if (success) setSuccess(false);
  };

  // ✅ Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (formData.bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters';
    }

    if (formData.website && !formData.website.match(/^https?:\/\/.+/)) {
      newErrors.website = 'Website must be a valid URL starting with http:// or https://';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Handle avatar upload with Supabase Storage
  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, avatar: 'Avatar file must be less than 5MB' }));
      return;
    }

    setUploading(true);
    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update form data and preview
      setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
      setAvatarPreview(publicUrl);

      // Clear any avatar errors
      if (errors.avatar) {
        setErrors(prev => ({ ...prev, avatar: '' }));
      }

    } catch (err) {
      console.error('Error uploading avatar:', err);
      setErrors(prev => ({ 
        ...prev, 
        avatar: 'Failed to upload avatar. Please try again.' 
      }));
    } finally {
      setUploading(false);
    }
  };

  // ✅ Handle form submission with real Supabase integration
  const handleSave = async () => {
    if (!validateForm() || !user?.id) return;

    setSaving(true);
    try {
      // Update user metadata in auth.users
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: formData.name,
          username: formData.username,
          avatar_url: formData.avatar_url
        }
      });

      if (authError) {
        console.warn('Failed to update auth metadata:', authError);
      }

      // Upsert profile data in profiles table
      const profileData = {
        id: user.id,
        full_name: formData.name,
        username: formData.username,
        bio: formData.bio,
        location: formData.location,
        website: formData.website,
        phone: formData.phone,
        date_of_birth: formData.dateOfBirth || null,
        avatar_url: formData.avatar_url,
        privacy: formData.privacy,
        updated_at: new Date().toISOString()
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData, {
          onConflict: 'id'
        });

      if (profileError) throw profileError;

      setSuccess(true);
      console.log('✅ Profile updated successfully');

      // Navigate back after a short delay
      setTimeout(() => {
        navigate('/profile');
      }, 1500);

    } catch (err) {
      console.error('❌ Failed to save profile:', err);
      setErrors(prev => ({ 
        ...prev, 
        submit: err instanceof Error ? err.message : 'Failed to save profile' 
      }));
    } finally {
      setSaving(false);
    }
  };

  // Show loading state
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

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Profile
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Profile</h1>
            <p className="text-muted-foreground">Update your profile information</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Success Message */}
          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Profile updated successfully! Redirecting...
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Error */}
          {errors.submit && (
            <Alert variant="destructive">
              <AlertDescription>{errors.submit}</AlertDescription>
            </Alert>
          )}

          {/* Avatar Section */}
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Profile Picture</h2>
            <div className="flex items-center gap-6">
              <div className="relative">
                <img
                  src={avatarPreview}
                  alt="Profile avatar"
                  className="w-24 h-24 rounded-full object-cover border-4 border-primary/10"
                />
                <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors">
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    disabled={uploading || saving}
                  />
                </label>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Click the camera icon to upload a new profile picture
                </p>
                <p className="text-xs text-muted-foreground">
                  Recommended: Square image, at least 400x400px, max 5MB
                </p>
                {errors.avatar && (
                  <p className="text-sm text-destructive mt-1">{errors.avatar}</p>
                )}
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    <User className="h-4 w-4 inline mr-2" />
                    Full Name *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Enter your full name"
                    disabled={saving}
                  />
                  {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Username *
                  </label>
                  <Input
                    value={formData.username}
                    onChange={(e) => handleChange('username', e.target.value)}
                    placeholder="Enter your username"
                    disabled={saving}
                  />
                  {errors.username && <p className="text-sm text-destructive mt-1">{errors.username}</p>}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  <Mail className="h-4 w-4 inline mr-2" />
                  Email Address *
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  disabled={true}
                  className="bg-muted cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Email cannot be changed here. Contact support to update your email.
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Bio
                </label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  disabled={saving}
                />
                <div className="flex justify-between mt-1">
                  {errors.bio && <p className="text-sm text-destructive">{errors.bio}</p>}
                  <p className="text-xs text-muted-foreground ml-auto">
                    {formData.bio.length}/500 characters
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    <MapPin className="h-4 w-4 inline mr-2" />
                    Location
                  </label>
                  <Input
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    placeholder="City, Country"
                    disabled={saving}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    <Globe className="h-4 w-4 inline mr-2" />
                    Website
                  </label>
                  <Input
                    value={formData.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    placeholder="https://yourwebsite.com"
                    disabled={saving}
                  />
                  {errors.website && <p className="text-sm text-destructive mt-1">{errors.website}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Phone Number
                  </label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    disabled={saving}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    <Calendar className="h-4 w-4 inline mr-2" />
                    Date of Birth
                  </label>
                  <Input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                    disabled={saving}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Privacy</h2>
            <div>
              <label className="text-sm font-medium mb-2 block">Profile Visibility</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="privacy"
                    value="public"
                    checked={formData.privacy === 'public'}
                    onChange={(e) => handleChange('privacy', e.target.value as 'public' | 'private')}
                    className="mr-2"
                    disabled={saving}
                  />
                  Public - Anyone can see your profile
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="privacy"
                    value="private"
                    checked={formData.privacy === 'private'}
                    onChange={(e) => handleChange('privacy', e.target.value as 'public' | 'private')}
                    className="mr-2"
                    disabled={saving}
                  />
                  Private - Only you can see your profile
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => navigate('/profile')}
              disabled={saving || uploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || uploading}
              className="min-w-[120px]"
            >
              {saving ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin h-4 w-4" />
                  Saving...
                </div>
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

export default EditProfile;
