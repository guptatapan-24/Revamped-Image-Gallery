// src/components/Lightbox.tsx - WITH VIEW TRACKING
import React, { useEffect, useState, useCallback } from "react";
import {
  X, ChevronLeft, ChevronRight, Heart, Download, Share2,
  Info, Camera, Settings2, Sparkles, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageEditor } from "./ImageEditor";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import { useImageViews } from '../hooks/useImageViews'; // ✅ Add view tracking

// ✅ Import unified utilities instead of RetryImage
import { getImageUrl, isAiGenerated } from '../utils/imageUtils';
import { Image } from "../types";

// ✅ Type guard for error handling
function isErrorWithCode(error: unknown): error is { code: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as any).code === 'string'
  );
}

interface Props {
  image: Image;
  albums: string[];
  licenses: string[];
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSave: (updated: Image) => void;
}

export const Lightbox = ({
  image, albums, licenses, onClose, onNext, onPrev, onSave,
}: Props) => {
  const { user, isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [likeCount, setLikeCount] = useState(image.likes || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  // ✅ Add view tracking
  console.log('🔥 LIGHTBOX OPENED FOR:', image.id, image.title);
  const views = useImageViews(image.id);

  // ✅ Use unified detection and URL handling
  const isAI = isAiGenerated(image);
  const imageUrl = image.url || getImageUrl(image);

  // ✅ Record view when lightbox opens
  useEffect(() => {
    if (!image?.id) {
      console.log('❌ No image ID found in Lightbox');
      return;
    }
    
    const recordView = async () => {
      try {
        console.log('🚀 Recording view for:', image.id, 'Type:', typeof image.id);
        
        const params = { p_image_id: image.id };
        console.log('📤 RPC Parameters:', params);
        
        const response = await supabase
          .rpc('increment_image_view', params);
        
        console.log('📊 Full RPC Response:', response);
        
        if (response.error) {
          console.error('❌ RPC Error Details:', {
            message: response.error.message,
            details: response.error.details,
            hint: response.error.hint,
            code: response.error.code
          });
        } else {
          console.log('✅ RPC Success! Data:', response.data);
          if (response.data && response.data.length > 0) {
            console.log('📈 New view count:', response.data[0].new_view_count);
          }
        }
      } catch (err) {
        console.error('❌ Exception caught:', err);
      }
    };
    
    recordView();
  }, [image.id]);

  useEffect(() => {
    console.log('🖼️ Image changed:', image.title, 'AI Generated:', isAI);
    setLikeCount(image.likes || 0);
  }, [image.id, image.likes, isAI]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          if (isEditing) {
            setIsEditing(false);
          } else {
            onClose();
          }
          break;
        case "ArrowLeft":
          e.preventDefault();
          onPrev();
          break;
        case "ArrowRight":
          e.preventDefault();
          onNext();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [onClose, onNext, onPrev, isEditing]);

  // ✅ Like status checking
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (!isAuthenticated || !user || !image.id) return;
      
      try {
        const { data, error } = await supabase
          .from('likes')
          .select('id')
          .eq('user_id', user.id)
          .eq('image_id', image.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking like status:', error);
          return;
        }
        
        setIsLiked(!!data);
      } catch (error) {
        console.error('Error in checkLikeStatus:', error);
      }
    };
    
    checkLikeStatus();
  }, [image.id, user, isAuthenticated]);

  const handleLike = async () => {
    if (!isAuthenticated || !user) {
      alert('Please log in to like images');
      return;
    }

    if (isLiking) return;
    setIsLiking(true);

    try {
      if (isLiked) {
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('image_id', image.id);

        if (error) throw error;
        setIsLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
      } else {
        const { error } = await supabase
          .from('likes')
          .upsert(
            { 
              user_id: user.id, 
              image_id: image.id 
            },
            { 
              onConflict: 'user_id,image_id',
              ignoreDuplicates: true 
            }
          );

        if (error) throw error;
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
      }

      await supabase
        .from('images')
        .update({ like_count: likeCount + (isLiked ? -1 : 1) })
        .eq('id', image.id);

    } catch (error) {
      console.error('Error updating like:', error);
      
      if (isErrorWithCode(error) && error.code === '23505') {
        const { data } = await supabase
          .from('likes')
          .select('id')
          .eq('user_id', user.id)
          .eq('image_id', image.id)
          .maybeSingle();
        setIsLiked(!!data);
      } else {
        alert('Failed to update like. Please try again.');
        setIsLiked(!isLiked);
        setLikeCount(prev => isLiked ? prev + 1 : prev - 1);
      }
    } finally {
      setIsLiking(false);
    }
  };

  const handleSave = (updatedImageData: Omit<Image, "url"> & { url: string }) => {
    const updatedImage: Image = { 
      ...updatedImageData, 
      url: image.url 
    };
    onSave(updatedImage);
    setIsEditing(false);
  };

  const handleDownload = () => {
    try {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `${image.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      window.open(imageUrl, '_blank');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: image.title,
          text: image.description,
          url: window.location.href
        });
      } catch (error) {
        console.log('Share cancelled or failed:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Image URL copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy URL:', error);
        alert('Unable to share. Please copy the URL manually.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex">
      {/* Main Image Area */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative w-full h-full flex items-center justify-center">
          
          {/* ✅ Regular img with unified URL - no retry needed */}
          <img
            src={imageUrl}
            alt={image.title}
            className="max-w-[calc(100vw-400px)] max-h-[calc(100vh-2rem)] object-contain rounded-lg shadow-2xl"
            onLoad={() => console.log('✅ Lightbox image loaded immediately:', image.title)}
            onError={() => console.error('❌ Lightbox image failed:', image.title)}
          />
          
          {/* ✅ AI Badge */}
          {isAI && (
            <div className="absolute top-4 left-4 z-20">
              <span className="bg-purple-500 text-white rounded-full px-3 py-1 text-sm font-medium flex items-center gap-1">
                <Sparkles className="h-4 w-4" />
                AI Generated
              </span>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 rounded-full transition-all duration-200 z-10"
            onClick={onPrev}
            aria-label="Previous image"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 rounded-full transition-all duration-200 z-10"
            onClick={onNext}
            aria-label="Next image"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-96 bg-black/80 border-l border-white/10 overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          {isEditing ? (
            <h2 className="text-xl font-bold text-white">Edit Image</h2>
          ) : (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <h2 className="text-xl font-bold text-white truncate pr-4">{image.title}</h2>
              {isAI && (
                <Sparkles className="h-5 w-5 text-purple-400 flex-shrink-0" />
              )}
            </div>
          )}
          <div className="flex space-x-2 flex-shrink-0 ml-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
              onClick={onClose}
              aria-label="Close lightbox"
            >
              <X className="h-5 w-5" />
            </Button>
            <Button
              variant="secondary"
              onClick={() => setIsEditing((prev) => !prev)}
              className="text-white bg-white/10 hover:bg-white/20"
              size="sm"
            >
              {isEditing ? "Cancel" : "Edit"}
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-grow overflow-auto">
          {isEditing ? (
            <ImageEditor
              image={image}
              albums={albums}
              licenses={licenses}
              onCancel={() => setIsEditing(false)}
              onSave={handleSave}
            />
          ) : (
            <>
              <p className="text-gray-300 mb-4 whitespace-pre-wrap leading-relaxed">
                {image.description}
              </p>

              {/* ✅ AI generation info */}
              {isAI && (
                <div className="mb-4 p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-purple-300 text-sm">
                    <Sparkles className="h-4 w-4" />
                    <span>This image was generated using AI technology</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 mb-6">
                <Button 
                  size="sm" 
                  className={`transition-all duration-200 ${
                    isLiked 
                      ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg' 
                      : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg'
                  }`}
                  onClick={handleLike}
                  disabled={isLiking}
                >
                  <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                  {isLiking ? 'Updating...' : (isLiked ? 'Liked' : 'Like')} ({likeCount})
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-white/30 bg-white/10 text-white hover:bg-white/20 transition-all duration-200"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4 mr-2" /> 
                  Download
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-white/30 bg-white/10 text-white hover:bg-white/20 transition-all duration-200"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4 mr-2" /> 
                  Share
                </Button>
              </div>

              {/* Image Details */}
              <div className="space-y-6 text-sm text-gray-300">
                <section>
                  <h3 className="flex items-center gap-2 font-semibold mb-3 text-white">
                    <Info className="h-4 w-4" />
                    Image Details
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Author:</span>
                      <span className="text-white font-medium">{image.author}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Album:</span>
                      <span className="text-white">{image.album}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">License:</span>
                      <span className="text-white">{image.license}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Privacy:</span>
                      <span className="text-white capitalize">{image.privacy || 'public'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Comments:</span>
                      <span className="text-white">{image.comments}</span>
                    </div>
                    {/* ✅ Add view count display */}
                    <div className="flex justify-between">
                      <span className="text-gray-400">Views:</span>
                      <span className="text-white flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {views ?? '—'}
                      </span>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="flex items-center gap-2 font-semibold mb-3 text-white">
                    <Camera className="h-4 w-4" />
                    {isAI ? 'Generation Info' : 'Camera Details'}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">{isAI ? 'Model:' : 'Camera:'}</span>
                      <span className="text-white">{image.camera}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">{isAI ? 'Version:' : 'Lens:'}</span>
                      <span className="text-white">{image.lens}</span>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="flex items-center gap-2 font-semibold mb-3 text-white">
                    <Settings2 className="h-4 w-4" />
                    {isAI ? 'Generation Settings' : 'Camera Settings'}
                  </h3>
                  <p className="text-gray-300 leading-relaxed">{image.settings}</p>
                </section>

                <section>
                  <h3 className="font-semibold mb-3 text-white">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {image.tags && image.tags.length > 0 ? (
                      image.tags.map((tag, index) => (
                        <span
                          key={`${tag}-${index}`}
                          className={`px-3 py-1 text-xs rounded-full border transition-colors cursor-pointer ${
                            tag === 'ai-generated' || tag === 'stable-diffusion'
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/30'
                              : 'bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30'
                          }`}
                        >
                          #{tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 italic">No tags added</span>
                    )}
                  </div>
                </section>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Lightbox;
