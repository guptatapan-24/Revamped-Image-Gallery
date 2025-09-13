// src/components/Gallery.tsx - FIXED CLICK HANDLERS
import React, { useState, useEffect, useCallback } from "react";
import { supabase } from '../lib/supabase';
import { Heart, MessageCircle, Eye, Download, Sparkles } from "lucide-react";
import { PrivacySettings as UIPrivacySettings } from "./ui/PrivacySettings";
import PrivacySettings from './PrivacySettings';
import { Button } from "./ui/button";
import { BatchActions } from "./ui/BatchActions";
import { StableDiffusionModal } from "./AIGeneration/StableDiffusionModal";
import { getImageUrl, isAiGenerated, validateImageData } from '../utils/imageUtils';
import { Image } from "../types";
import DownloadButton from "./DownloadButton";
import ImageComments from "../components/ImageComments";
import { useImageViews } from '../hooks/useImageViews';

const ViewCount: React.FC<{ imageId: string }> = ({ imageId }) => {
  const views = useImageViews(imageId);
  return <span>{views ?? '—'}</span>;
};

interface GalleryProps {
  images: Image[];
  onImageClick: (image: Image) => void;
  onUpdateImagePrivacy?: (imageId: string, privacy: Image["privacy"]) => void;
  onBatchDelete?: (ids: string[]) => void;
  onBatchMove?: (ids: string[], albumId: string) => void;
  onBatchEditMetadata?: (ids: string[]) => void;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
}

export const Gallery: React.FC<GalleryProps> = ({
  images: initialImages,
  onImageClick,
  onUpdateImagePrivacy,
  onBatchDelete,
  onBatchMove,
  onBatchEditMetadata,
  selectedIds = [],
  onSelectionChange,
}) => {
  const [images, setImages] = useState<Image[]>(initialImages || []);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempPrivacy, setTempPrivacy] = useState<"public" | "unlisted" | "private">("public");
  const [showAIModal, setShowAIModal] = useState(false);

  // ✅ Add debug logging for image clicks
  const handleImageClick = (image: Image, event: React.MouseEvent) => {
    console.log('🖱️ IMAGE CLICKED IN GRID:', image.id, image.title);
    console.log('🎯 Click target:', event.currentTarget);
    onImageClick(image);
  };

  const fetchImages = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Fetching images with unified access...');
      
      const { data, error } = await supabase
        .from('images')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Failed to fetch images:', error);
        return;
      }

      const processedImages = data?.map(validateImageData) || [];
      console.log('✅ Processed images with unified URLs:', processedImages.length);
      setImages(processedImages);
    } catch (error) {
      console.error('❌ Error fetching images:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  useEffect(() => {
    if (initialImages && initialImages.length > 0) {
      setImages(initialImages.map(validateImageData));
    }
  }, [initialImages]);

  const toggleSelect = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
  e.stopPropagation(); // Prevent event bubbling
  if (onSelectionChange) {
    const checked = e.target.checked;
    const newSelection = checked 
      ? [...selectedIds, id] 
      : selectedIds.filter(sid => sid !== id);
    onSelectionChange(newSelection);
  }
};

  const selectAll = () => {
    if (onSelectionChange) {
      onSelectionChange(images.map(img => img.id));
    }
  };

  const deselectAll = () => {
    if (onSelectionChange) {
      onSelectionChange([]);
    }
  };

  const startEdit = (image: Image, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent modal open
    setEditingId(image.id);
    setTempPrivacy(image.privacy || "public");
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = () => {
    if (editingId && onUpdateImagePrivacy) {
      onUpdateImagePrivacy(editingId, tempPrivacy);
      setEditingId(null);
    }
  };

  const handleAIGenerated = useCallback((imageId: string, imageData?: Image) => {
    console.log('🎉 AI generation completed:', { imageId, imageData });
    setShowAIModal(false);
    
    if (imageData) {
      const processedImage = validateImageData(imageData);
      console.log('➕ Adding AI image with consistent URL:', processedImage.url);
      setImages(prevImages => [processedImage, ...prevImages]);
    } else {
      setTimeout(fetchImages, 1000);
    }
  }, [fetchImages]);

  const handleRefresh = useCallback(() => {
    console.log('🔄 Manual refresh triggered');
    fetchImages();
  }, [fetchImages]);

  if (isLoading && images.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading images...</p>
        </div>
      </div>
    );
  }

  if (!isLoading && images.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-center px-6">
        <div>
          <h3 className="text-2xl font-semibold text-muted-foreground mb-2">No images found</h3>
          <p className="text-muted-foreground mb-4">Try adjusting your filters or search.</p>
          <Button
            onClick={() => setShowAIModal(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Generate with AI
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between px-6 mb-4">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={selectedIds.length === images.length ? deselectAll : selectAll}
          >
            {selectedIds.length === images.length ? "Deselect All" : "Select All"}
          </Button>
          
          <Button
            onClick={() => setShowAIModal(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Generate with AI
          </Button>

          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            🔄 {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>

        {onBatchDelete && onBatchMove && onBatchEditMetadata && (
          <BatchActions
            selectedCount={selectedIds.length}
            onDelete={() => onBatchDelete(selectedIds)}
            onMoveToAlbum={() => onBatchMove(selectedIds, "target-album-id")}
            onEditMetadata={() => onBatchEditMetadata(selectedIds)}
            disabled={selectedIds.length === 0}
          />
        )}
      </div>

      <section className="px-6 py-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {images.map(image => {
            const isSelected = selectedIds.includes(image.id);
            const isEditing = editingId === image.id;
            const isAI = isAiGenerated(image);

            return (
              <div
                key={image.id}
                className={`relative rounded-xl shadow-soft border ${
                  isSelected ? "ring-4 ring-primary" : "border-border"
                }`}
              >
                {/* ✅ FIXED: Single click handler on main image area */}
                <div 
                  className="relative aspect-[4/3] rounded-t-xl overflow-hidden cursor-pointer"
                  onClick={(e) => handleImageClick(image, e)}
                >
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                    onLoad={() => console.log('✅ Image loaded immediately:', image.title)}
                    onError={(e) => {
                      console.error('❌ Image failed to load:', image.url);
                      try {
                        const fallbackUrl = getImageUrl(image);
                        if (fallbackUrl !== image.url) {
                          console.log('🔄 Trying fallback URL:', fallbackUrl);
                          e.currentTarget.src = fallbackUrl;
                        }
                      } catch (urlError) {
                        console.error('❌ Fallback URL generation failed:', urlError);
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTcwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4=';
                      }
                    }}
                  />
                  
                  {/* AI Badge */}
                  {isAI && (
                    <div className="absolute top-2 left-2 z-20 pointer-events-none">
                      <span className="bg-purple-500 text-white rounded-full px-2 py-1 text-xs font-medium flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        AI
                      </span>
                    </div>
                  )}
                  
                  {/* Privacy Badge */}
                  <div className={`absolute top-2 ${isAI ? 'right-2' : 'left-2'} z-20 pointer-events-none`}>
                    <PrivacySettings image={image} compact={true} />
                  </div>
                  
                  {/* ✅ FIXED: Selection checkbox with proper event handling */}
                  <div className={`absolute ${isAI ? 'top-2 left-16' : 'top-2 left-20'} z-20`}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => toggleSelect(image.id, e)}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Select image ${image.title}`}
                      className="h-5 w-5 cursor-pointer"
                    />
                  </div>
                  
                  {/* Download and Heart buttons with stopPropagation */}
                  <div className="absolute top-2 right-2 z-20" onClick={(e) => e.stopPropagation()}>
                    <DownloadButton 
                      image={image} 
                      variant="ghost" 
                      size="icon"
                      className="text-white hover:bg-white/20"
                    />
                  </div>
                  
                  <div className="absolute top-2 right-10 z-20">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={(e) => e.stopPropagation()}
                      className="text-white hover:bg-white/20"
                    >
                      <Heart className="w-5 h-5" />
                    </Button>
                  </div>
                  
                  {/* Album badge */}
                  <div className="absolute bottom-2 left-2 z-20 pointer-events-none">
                    <span className="bg-black bg-opacity-50 text-white rounded-full px-2 py-0.5 text-xs">
                      {image.album}
                    </span>
                  </div>
                </div>

                {/* ✅ FIXED: Info section without conflicting click handler */}
                <div className="p-4 bg-card rounded-b-xl">
                  <h3 className="font-semibold text-foreground line-clamp-1 truncate">
                    {image.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {image.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-muted-foreground">{image.author}</span>
                    <div onClick={(e) => e.stopPropagation()}>
                      <DownloadButton 
                        image={image} 
                        variant="outline" 
                        size="sm"
                      />
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-1">
                    Privacy: {isEditing ? null : image.privacy}
                  </p>

                  {isEditing ? (
                    <div onClick={(e) => e.stopPropagation()}>
                      <PrivacySettings value={tempPrivacy} onChange={setTempPrivacy} />
                      <div className="mt-2 flex gap-2">
                        <Button variant="outline" size="sm" onClick={cancelEdit}>Cancel</Button>
                        <Button variant="default" size="sm" onClick={saveEdit}>Save</Button>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={(e) => startEdit(image, e)} 
                      className="mt-2"
                    >
                      Edit Privacy
                    </Button>
                  )}

                  <div className="mt-3 flex justify-between text-sm text-muted-foreground">
                    <span>{image.author}</span>
                    <div className="flex space-x-3">
                      <div className="flex items-center space-x-1">
                        <Heart size={14} />
                        <span>{image.likes}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle size={14} />
                        <span>{image.comments}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye size={14} />
                        <ViewCount imageId={image.id} />
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {image.tags?.slice(0, 3).map((tag, index) => (
                      <span
                        key={`${tag}-${index}`}
                        className="text-xs inline-block bg-accent text-white rounded-full px-2 py-0.5"
                      >
                        #{tag}
                      </span>
                    ))}
                    {image.tags && image.tags.length > 3 && (
                      <span className="text-xs inline-block bg-muted text-muted-foreground rounded-full px-2 py-0.5">
                        +{image.tags.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {showAIModal && (
        <StableDiffusionModal
          onClose={() => setShowAIModal(false)}
          onGenerated={handleAIGenerated}
        />
      )}
    </>
  );
};
