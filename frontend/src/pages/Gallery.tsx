// src/pages/Gallery.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { Gallery as GalleryComponent } from '../components/Gallery';
import AdvancedSearch from '../components/AdvancedSearch';
import PrivacySettings from '../components/PrivacySettings';
import ImageMetadata from '../components/ImageMetadata';
import DownloadButton from '../components/DownloadButton';
import ImageComments from '../components/ImageComments';
import { Download } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Image } from '../types';
import { supabase } from '../lib/supabase';
import { downloadMultipleWithWatermarks } from '../utils/watermarkUtils';
import QuickStats from '../components/QuickStats';
import { useImageViews } from '../hooks/useImageViews';

type PrivacyType = 'public' | 'unlisted' | 'private';

const GalleryPage: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [allImages, setAllImages] = useState<Image[]>([]);
  const [filteredImages, setFilteredImages] = useState<Image[]>([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      const { data, error } = await supabase
        .from('images')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) console.error(error);
      else setAllImages(data || []);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const imagesToDisplay = isSearchActive ? filteredImages : allImages;

  const handleSearchResults = useCallback((list: Image[]) => {
    setFilteredImages(list);
    setIsSearchActive(true);
  }, []);

  const handleClearSearch = useCallback(() => {
    setFilteredImages([]);
    setIsSearchActive(false);
  }, []);

  const handlePrivacyUpdate = useCallback(
    (id: string, p: PrivacyType) => {
      setAllImages((prev) =>
        prev.map((img) => (img.id === id ? { ...img, privacy: p } : img)),
      );
      setFilteredImages((prev) =>
        prev.map((img) => (img.id === id ? { ...img, privacy: p } : img)),
      );
    },
    []
  );

  const handleImageClick = useCallback((img: Image) => {
    setSelectedImage(img);
  }, []);

  const handleBatchDownload = async () => {
    const sel = imagesToDisplay.filter((i) => selectedIds.includes(i.id));
    if (sel.length === 0) {
      alert('Please select images to download');
      return;
    }
    try {
      const list = sel.map((i) => ({
        url: i.url,
        name: i.original_filename || i.title || `image-${i.id}.png`,
      }));
      await downloadMultipleWithWatermarks(list, '© Your Gallery');
      alert(`Downloaded ${sel.length} images`);
      setSelectedIds([]);
    } catch (e) {
      console.error(e);
      alert('Batch download failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-bold mb-6">Gallery</h1>

        <AdvancedSearch
          onSearchResults={handleSearchResults}
          onClearSearch={handleClearSearch}
        />

        {isSearchActive && (
          <div className="mb-4 p-4 bg-blue-50 border rounded">
            Found <strong>{filteredImages.length}</strong> images.&nbsp;
            <button
              onClick={handleClearSearch}
              className="underline text-blue-700"
            >
              Show all ({allImages.length})
            </button>
          </div>
        )}

        {imagesToDisplay.length > 0 && (
          <div className="mb-4 flex items-center justify-between bg-white p-4 border rounded">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  selectedIds.length === imagesToDisplay.length
                    ? setSelectedIds([])
                    : setSelectedIds(imagesToDisplay.map((i) => i.id))
                }
              >
                {selectedIds.length === imagesToDisplay.length
                  ? 'Deselect All'
                  : 'Select All'}
              </Button>
              {selectedIds.length > 0 && (
                <span className="text-sm text-gray-600">
                  {selectedIds.length} selected
                </span>
              )}
            </div>
            {selectedIds.length > 0 && (
              <Button
                onClick={handleBatchDownload}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download ({selectedIds.length})
              </Button>
            )}
          </div>
        )}

        <QuickStats />

        <GalleryComponent
          images={imagesToDisplay}
          onImageClick={handleImageClick}
          onUpdateImagePrivacy={(id, p) =>
            handlePrivacyUpdate(id, p as PrivacyType)
          }
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />

        {isSearchActive && filteredImages.length === 0 && (
          <p className="text-center mt-10 text-gray-600">No images found.</p>
        )}

        {selectedImage && (
          <ImageModal
            key={selectedImage.id} // Force remount for each image
            image={selectedImage}
            onClose={() => setSelectedImage(null)}
            onPrivacyUpdate={handlePrivacyUpdate}
          />
        )}
      </div>
    </div>
  );
};

export default GalleryPage;

/* Modal component */
interface ModalProps {
  image: Image;
  onClose: () => void;
  onPrivacyUpdate: (id: string, p: PrivacyType) => void;
}

const ImageModal: React.FC<ModalProps> = ({ image, onClose, onPrivacyUpdate }) => {
  console.log('🔥 MODAL OPENED FOR:', image.id, image.title); // Add this line
  
  const views = useImageViews(image.id); // Now correctly gets just the number

  useEffect(() => {
    if (!image?.id) {
      console.log('❌ No image ID found');
      return;
    }
    
    const recordView = async () => {
      try {
        console.log('🚀 Recording view for:', image.id, 'Type:', typeof image.id);
        
        // Log the exact parameters being sent
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
            
            // Force a small delay to ensure database is updated before real-time subscription picks up
            setTimeout(() => {
              console.log('🔄 View should be updated via real-time subscription');
            }, 100);
          }
        }
      } catch (err) {
        console.error('❌ Exception caught:', err);
      }
    };
    
    recordView();
  }, [image.id]);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-7xl w-full max-h-[95vh] overflow-hidden flex">
        <div className="flex-1 p-6 overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">{image.title}</h2>
            <div className="flex gap-2">
              <DownloadButton image={image} variant="outline" size="default" />
              <button
                onClick={onClose}
                className="text-2xl font-bold text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
          </div>

          <img
            src={image.url}
            alt={image.title}
            className="w-full h-auto rounded-lg shadow"
          />

          <p className="mt-4 text-gray-600">{image.description}</p>
          <div className="flex flex-wrap gap-2 my-2">
            {image.tags.map((t) => (
              <span
                key={t}
                className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
              >
                #{t}
              </span>
            ))}
          </div>

          <div className="text-sm text-gray-500 space-y-1 mt-4">
            <p>Author: {image.author}</p>
            <p>Album: {image.album}</p>
            <p>License: {image.license}</p>
            <p>
              Likes: {image.likes} | Views: {views ?? '—'}
            </p>
          </div>

          <ImageComments imageId={image.id} imageTitle={image.title} />
        </div>

        <div className="w-96 border-l bg-gray-50 p-4 overflow-auto">
          <PrivacySettings image={image} onPrivacyUpdate={onPrivacyUpdate} />
          <ImageMetadata image={image} />
        </div>
      </div>
    </div>
  );
};
