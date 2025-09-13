// src/components/ProfileSetup.tsx - Fixed all imports and references
import React, { useState } from 'react';
import { Camera } from 'lucide-react';
import { Button } from './ui/button';        // ✅ Fixed import
import { Card } from './ui/card';            // ✅ Fixed import  
import { Label } from './ui/label';          // ✅ Fixed import
import { Input } from './ui/input';          // ✅ Fixed import
import { SmartAvatar } from './ui/avatar';   // ✅ Fixed import (use SmartAvatar from earlier)
import { useAuth } from '../hooks/useAuth';  // ✅ Added useAuth import
import { supabase } from '../lib/supabase';  // ✅ Added supabase import

export const ProfileSetup: React.FC = () => {
  const { user } = useAuth(); // ✅ Fixed: Get user from auth context
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    bio: '',
    avatar: null as File | null
  });
  const [avatarPreview, setAvatarPreview] = useState('');

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, avatar: file }));
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!user) {
      alert('Please log in first');
      return;
    }

    setLoading(true);
    
    try {
      // Upload avatar to Supabase Storage if provided
      let avatarUrl = '';
      
      if (formData.avatar) {
        const fileExt = formData.avatar.name.split('.').pop();
        const fileName = `${user.id}-avatar.${fileExt}`; // ✅ Fixed: user is now available
        
        // Create avatars bucket if it doesn't exist
        const { error: bucketError } = await supabase.storage
          .createBucket('avatars', { public: true });
        
        if (bucketError && bucketError.message !== 'Bucket already exists') {
          console.log('Bucket creation error:', bucketError);
        }
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, formData.avatar, { upsert: true });
        
        if (!uploadError) {
          const { data } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);
          avatarUrl = data.publicUrl;
        }
      }

      // Save profile to database
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id, // ✅ Fixed: user.id is now available
          full_name: formData.full_name,
          username: formData.username,
          bio: formData.bio,
          avatar_url: avatarUrl
        });

      if (profileError) {
        throw profileError;
      }

      // Update auth user metadata
      await supabase.auth.updateUser({
        data: {
          full_name: formData.full_name,
          username: formData.username,
          avatar_url: avatarUrl
        }
      });

      alert('Profile updated successfully!');
      
      // Optionally redirect or refresh user context
      window.location.reload();
      
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto p-6"> {/* ✅ Fixed: Card now imported */}
      <h2 className="text-2xl font-bold text-center mb-6">Complete Your Profile</h2>
      
      {/* Avatar Section */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative">
          <SmartAvatar 
            src={avatarPreview}
            name={formData.full_name || 'User'}
            size="xl"
          />
          
          <label className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-2 cursor-pointer hover:bg-blue-600 transition-colors">
            <Camera className="h-4 w-4" />
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </label>
        </div>
        
        <p className="text-sm text-muted-foreground mt-2 text-center">
          Upload a profile picture or we'll generate one from your name
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="full_name">Full Name</Label> {/* ✅ Fixed: Label now imported */}
          <Input
            id="full_name"
            value={formData.full_name}
            onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
            placeholder="Enter your full name"
            required
          />
        </div>

        <div>
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
            placeholder="Choose a username"
            required
          />
        </div>

        <div>
          <Label htmlFor="bio">Bio (Optional)</Label>
          <textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            placeholder="Tell us about yourself..."
            className="w-full p-2 border border-input rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
        </div>
      </div>

      <Button 
        onClick={handleSave} 
        className="w-full mt-6"
        disabled={loading || !formData.full_name || !formData.username}
      >
        {loading ? 'Saving...' : 'Complete Profile'}
      </Button>
    </Card>
  );
};
