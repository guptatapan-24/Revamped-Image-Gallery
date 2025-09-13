// src/components/QuickStats.tsx - MINI ANALYTICS WIDGET
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Eye, Heart, Image as ImageIcon, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';

const QuickStats: React.FC = () => {
  const [stats, setStats] = useState({
    totalImages: 0,
    totalViews: 0,
    totalLikes: 0,
    recentUploads: 0
  });

  useEffect(() => {
    const fetchQuickStats = async () => {
      try {
        const { data: images } = await supabase
          .from('images')
          .select('view_count, likes, created_at');

        const totalImages = images?.length || 0;
        const totalViews = images?.reduce((sum, img) => sum + (img.view_count || 0), 0) || 0;
        const totalLikes = images?.reduce((sum, img) => sum + (img.likes || 0), 0) || 0;
        
        const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentUploads = images?.filter(img => 
          new Date(img.created_at) > last24h
        ).length || 0;

        setStats({ totalImages, totalViews, totalLikes, recentUploads });
      } catch (error) {
        console.error('Error fetching quick stats:', error);
      }
    };

    fetchQuickStats();
  }, []);

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
          <div>
            <ImageIcon className="h-5 w-5 mx-auto mb-1 text-blue-500" />
            <div className="text-lg font-semibold">{stats.totalImages}</div>
            <div className="text-xs text-gray-500">Images</div>
          </div>
          <div>
            <Eye className="h-5 w-5 mx-auto mb-1 text-green-500" />
            <div className="text-lg font-semibold">{stats.totalViews}</div>
            <div className="text-xs text-gray-500">Views</div>
          </div>
          <div>
            <Heart className="h-5 w-5 mx-auto mb-1 text-red-500" />
            <div className="text-lg font-semibold">{stats.totalLikes}</div>
            <div className="text-xs text-gray-500">Likes</div>
          </div>
          <div>
            <TrendingUp className="h-5 w-5 mx-auto mb-1 text-purple-500" />
            <div className="text-lg font-semibold">{stats.recentUploads}</div>
            <div className="text-xs text-gray-500">Today</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickStats;
