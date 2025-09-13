// src/pages/Profile.tsx - COMPLETE WITH WORKING NAVIGATION & ROLE ACCESS
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { validateImageData } from '../utils/imageUtils';
import { Image } from '../types';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { 
  Camera, Heart, Eye, Users, Settings, Edit, 
  User, Mail, MapPin, Calendar, Shield, Crown,
  Upload, Sparkles, ArrowRight
} from 'lucide-react';

interface UserStats {
  totalUploads: number;
  totalLikes: number;
  totalViews: number;
}

interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  bio: string;
  email: string;
  avatar_url?: string;
  location?: string;
  website?: string;
  created_at: string;
}

const Profile: React.FC = () => {
  const { user, isAuthenticated, userRole, hasRole } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userImages, setUserImages] = useState<Image[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalUploads: 0,
    totalLikes: 0,
    totalViews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Safe user ID getter
  const userId = user?.id;

  // ✅ Navigation handlers - FIXED
  const handleEditProfile = () => {
    console.log('✅ Navigating to edit profile...');
    navigate('/profile/edit');
  };

  const handleSettings = () => {
    console.log('✅ Navigating to settings...');
    navigate('/settings');
  };

  const handleAdminDashboard = () => {
    console.log('✅ Navigating to admin dashboard...');
    navigate('/admin');
  };

  const handleEditorDashboard = () => {
    console.log('✅ Navigating to editor dashboard...');
    navigate('/editor');
  };

  const handleUpload = () => {
    console.log('✅ Navigating to upload...');
    navigate('/upload');
  };

  const handleGenerate = () => {
    console.log('✅ Navigating to generate...');
    navigate('/generate');
  };

  // ✅ Fetch user profile data
  const fetchUserProfile = useCallback(async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.warn('Profile not found in database, using auth data');
      }

      // Use profile data or fallback to auth data
      setProfile(data || {
        id: userId,
        username: user?.user_metadata?.username || user?.email?.split('@')[0] || 'user',
        full_name: user?.user_metadata?.full_name || user?.user_metadata?.name || 'User',
        email: user?.email || '',
        bio: 'Photography enthusiast and digital artist. Love capturing moments and creating beautiful imagery.',
        location: 'San Francisco, CA',
        created_at: user?.created_at || new Date().toISOString(),
        avatar_url: user?.user_metadata?.avatar_url || ''
      });

    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data');
    }
  }, [user, userId]);

  // ✅ Fetch user images
  const fetchUserImages = useCallback(async () => {
    if (!userId) return;

    try {
      console.log('🔄 Fetching user images for:', userId);
      
      const { data, error } = await supabase
        .from('images')
        .select('*')
        .eq('uploaded_by', userId)
        .order('created_at', { ascending: false })
        .limit(12);

      if (error) throw error;

      console.log('✅ Found user images:', data?.length || 0);
      const processedImages = (data || []).map(validateImageData);
      setUserImages(processedImages);

    } catch (err) {
      console.error('Error fetching user images:', err);
      setUserImages([]); // Set empty array instead of error
    }
  }, [userId]);

  // ✅ Calculate real user statistics
  const calculateStats = useCallback(async () => {
    if (!userId) return;

    try {
      console.log('📊 Calculating stats for user:', userId);

      // Get total uploads count
      const { count: uploadsCount } = await supabase
        .from('images')
        .select('*', { count: 'exact', head: true })
        .eq('uploaded_by', userId);

      // Get total likes for user's images
      const { data: likesData } = await supabase
        .from('images')
        .select('likes, like_count')
        .eq('uploaded_by', userId);

      const totalLikes = likesData?.reduce((sum, img) => 
        sum + (img.likes || img.like_count || 0), 0) || 0;

      // Get total views for user's images
      const { data: viewsData } = await supabase
        .from('images')
        .select('view_count')
        .eq('uploaded_by', userId);

      const totalViews = viewsData?.reduce((sum, img) => 
        sum + (img.view_count || 0), 0) || 0;

      const realStats = {
        totalUploads: uploadsCount || 0,
        totalLikes: totalLikes,
        totalViews: totalViews,
      };

      console.log('✅ Real user stats:', realStats);
      setStats(realStats);

    } catch (err) {
      console.error('Error calculating stats:', err);
      // Fallback to basic stats
      setStats({
        totalUploads: userImages.length,
        totalLikes: userImages.reduce((sum, img) => sum + (img.likes || 0), 0),
        totalViews: userImages.reduce((sum, img) => sum + (img.view_count || 0), 0),
      });
    }
  }, [userId, userImages]);

  // ✅ Load all data
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const loadProfileData = async () => {
      if (!userId) return;
      
      setLoading(true);
      try {
        await Promise.all([
          fetchUserProfile(),
          fetchUserImages()
        ]);
      } catch (err) {
        console.error('Error loading profile data:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [userId, isAuthenticated, navigate, fetchUserProfile, fetchUserImages]);

  // Calculate stats after images are loaded
  useEffect(() => {
    if (!loading) {
      calculateStats();
    }
  }, [userImages, loading, calculateStats]);

  // ✅ Handle image click
  const handleImageClick = (image: Image) => {
    console.log('Image clicked:', image.title);
    // You can add lightbox or navigation here
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-4">Please Log In</h2>
          <p className="text-muted-foreground mb-6">You need to be logged in to view your profile.</p>
          <Button onClick={() => navigate('/login')}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-4">Error</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* ✅ Profile Header - FIXED NAVIGATION */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-4xl font-bold">
                  {profile?.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt="Profile" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    profile?.username?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                
                {/* ✅ Role Badge */}
                <div className="absolute -bottom-2 -right-2">
                  {userRole === 'admin' && (
                    <div className="bg-red-500 text-white rounded-full p-2" title="Admin">
                      <Crown className="h-4 w-4" />
                    </div>
                  )}
                  {userRole === 'editor' && (
                    <div className="bg-blue-500 text-white rounded-full p-2" title="Editor">
                      <Edit className="h-4 w-4" />
                    </div>
                  )}
                  {userRole === 'user' && (
                    <div className="bg-green-500 text-white rounded-full p-2" title="User">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">
                      {profile?.full_name || 'User'}
                    </h1>
                    <p className="text-muted-foreground text-lg mb-2">
                      @{profile?.username || 'username'}
                    </p>
                    
                    {/* ✅ Role Display */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        userRole === 'admin' ? 'bg-red-100 text-red-800' :
                        userRole === 'editor' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                      </span>
                      <span className="text-muted-foreground">visitor</span>
                    </div>

                    <p className="text-muted-foreground max-w-md">
                      {profile?.bio || 'No bio available'}
                    </p>
                  </div>

                  {/* ✅ Action Buttons - FIXED NAVIGATION */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleEditProfile}
                      className="flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Edit Profile
                    </Button>

                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleSettings}
                      className="flex items-center gap-2"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Button>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {profile?.email}
                  </div>
                  {profile?.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {profile.location}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Joined {new Date(profile?.created_at || '').toLocaleDateString('en-US', { 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* ✅ Role-Based Dashboard Access */}
        {(hasRole('admin') || hasRole('editor')) && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Dashboard Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {hasRole('admin') && (
                  <Button
                    onClick={handleAdminDashboard}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Admin Dashboard
                  </Button>
                )}
                {hasRole('editor') && (
                  <Button
                    onClick={handleEditorDashboard}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editor Dashboard
                  </Button>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Access specialized tools and management features based on your role.
              </p>
            </CardContent>
          </Card>
        )}

        {/* ✅ Stats Cards - WITH REAL DATA */}
        <div className="grid grid-cols-3 gap-8 mb-8">
  <div className="bg-white p-8 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow">
    <Camera className="h-16 w-16 text-blue-500 mx-auto mb-6" />
    <h3 className="text-4xl font-bold text-gray-900 mb-2">{stats.totalUploads}</h3>
    <p className="text-gray-600 text-lg">Uploads</p>
  </div>

  <div className="bg-white p-8 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow">
    <Heart className="h-16 w-16 text-red-500 mx-auto mb-6" />
    <h3 className="text-4xl font-bold text-gray-900 mb-2">{stats.totalLikes}</h3>
    <p className="text-gray-600 text-lg">Likes</p>
  </div>

  <div className="bg-white p-8 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow">
    <Eye className="h-16 w-16 text-green-500 mx-auto mb-6" />
    <h3 className="text-4xl font-bold text-gray-900 mb-2">{stats.totalViews}</h3>
    <p className="text-gray-600 text-lg">Views</p>
  </div>
</div>

        {/* ✅ Recent Uploads Section - WITH REAL IMAGES */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Uploads</CardTitle>
              {userImages.length > 12 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/gallery')}
                >
                  View All ({stats.totalUploads})
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {userImages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userImages.slice(0, 12).map(image => (
                  <div 
                    key={image.id}
                    className="relative aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer group"
                    onClick={() => handleImageClick(image)}
                  >
                    <img
                      src={image.url}
                      alt={image.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      onLoad={() => console.log('✅ Image loaded:', image.title)}
                      onError={() => console.log('❌ Image failed:', image.title)}
                    />
                    
                    {/* Image overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-center">
                        <h4 className="font-semibold text-sm mb-1">{image.title}</h4>
                        <div className="flex items-center justify-center gap-4 text-xs">
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {image.likes || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {image.view_count || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Camera className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No uploads yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start sharing your amazing photography with the world
                </p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={handleUpload}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Photos
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleGenerate}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate with AI
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
