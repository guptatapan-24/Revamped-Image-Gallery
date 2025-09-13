// src/pages/Index.tsx - UNIFIED IMAGE PROCESSING
import React, { useState, useEffect } from "react";
import { Gallery } from "../components/Gallery";
import { Lightbox } from "../components/Lightbox";
import { RightActionBar } from "../components/RightActionBar";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";

// ✅ Import unified utilities
import { validateImageData } from "../utils/imageUtils";
import { Image } from "../types";

// Import sample images for hero section
import heroImage from "../assets/hero-banner.jpg";

const albums = ["Nature Collection", "City Life", "Macro World", "Portraits", "Architecture", "AI Generated"];
const licenses = ["Creative Commons", "All Rights Reserved", "Public Domain", "Generated Content"];

interface IndexProps {
  selectedAlbum?: string;
  selectedTag?: string | null;
  searchTerm?: string;
}

const Index: React.FC<IndexProps> = ({ 
  selectedAlbum = "all", 
  selectedTag = null, 
  searchTerm = "" 
}) => {
  const { isAuthenticated, user } = useAuth();
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [filteredImages, setFilteredImages] = useState<Image[]>([]);
  const [allImages, setAllImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilter, setShowFilter] = useState(false);

  // ✅ Fetch images with unified processing
  const fetchImages = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Fetching images with unified processing...');

      const { data: images, error: fetchError } = await supabase
        .from('images')
        .select('*')
        .eq('privacy', 'public')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Supabase fetch error:', fetchError);
        throw fetchError;
      }

      console.log('📄 Raw database images:', images?.length || 0);

      // ✅ Transform all images with unified validation
      const transformedImages: Image[] = (images || []).map(validateImageData);

      setAllImages(transformedImages);
      console.log('✅ Processed images with unified URLs:', transformedImages.length);

    } catch (err) {
      console.error('Error fetching images:', err);
      setError(err instanceof Error ? err.message : 'Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  // ✅ Enhanced filtering logic
  useEffect(() => {
    let filtered = [...allImages];

    if (selectedAlbum && selectedAlbum !== "all") {
      filtered = filtered.filter(image => 
        image.album.toLowerCase().includes(selectedAlbum.toLowerCase())
      );
    }

    if (selectedTag) {
      filtered = filtered.filter(image => 
        image.tags.some(tag => tag.toLowerCase() === selectedTag.toLowerCase())
      );
    }

    if (searchTerm && searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(image => 
        image.title.toLowerCase().includes(term) ||
        image.description.toLowerCase().includes(term) ||
        image.tags.some(tag => tag.toLowerCase().includes(term)) ||
        image.author.toLowerCase().includes(term) ||
        image.filename.toLowerCase().includes(term)
      );
    }

    setFilteredImages(filtered);
  }, [allImages, selectedAlbum, selectedTag, searchTerm]);

  const handleImageClick = (image: Image) => {
    setSelectedImage(image);
  };

  const handleNextImage = () => {
    if (!selectedImage) return;
    const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id);
    const nextIndex = (currentIndex + 1) % filteredImages.length;
    setSelectedImage(filteredImages[nextIndex]);
  };

  const handlePrevImage = () => {
    if (!selectedImage) return;
    const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id);
    const prevIndex = (currentIndex - 1 + filteredImages.length) % filteredImages.length;
    setSelectedImage(filteredImages[prevIndex]);
  };

  const handleImageSave = (updatedImage: Image) => {
    console.log("Saving image:", updatedImage);
    
    setFilteredImages(prev => 
      prev.map(img => img.id === updatedImage.id ? updatedImage : img)
    );
    setAllImages(prev => 
      prev.map(img => img.id === updatedImage.id ? updatedImage : img)
    );
    setSelectedImage(updatedImage);
  };

  const handleToggleView = () => {
    setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
  };

  const handleOpenFilter = () => {
    setShowFilter(true);
  };

  const handleOpenSearch = () => {
    window.location.href = '/vector-search';
  };

  const handleLike = () => {
    console.log('Like gallery');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Amazing Photography Gallery',
        text: 'Check out this amazing photography gallery with AI-generated images!',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Gallery URL copied to clipboard!');
    }
  };

  const handleDownload = () => {
    console.log('Download all images');
  };

  const handleBookmark = () => {
    console.log('Bookmark gallery');
  };

  const totalViews = allImages.reduce((sum, img) => sum + img.view_count, 0);
  const totalComments = allImages.reduce((sum, img) => sum + img.comments, 0);
  const totalLikes = allImages.reduce((sum, img) => sum + img.likes, 0);

  const getFilterStatus = () => {
    if (selectedTag) return `Tagged: #${selectedTag}`;
    if (selectedAlbum && selectedAlbum !== "all") return `Album: ${selectedAlbum}`;
    if (searchTerm) return `Search: "${searchTerm}"`;
    return "All Images";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-96 bg-gradient-hero flex items-center justify-center text-white">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <h1 className="text-4xl lg:text-6xl font-bold mb-4">
            Discover Amazing Photography
          </h1>
          <p className="text-lg lg:text-xl opacity-90 mb-8">
            Explore our curated collection of stunning images from talented photographers around the world, including AI-generated masterpieces
          </p>
          {!isAuthenticated && (
            <div className="flex gap-4 justify-center">
              <a href="/register" className="bg-primary hover:bg-primary/90 px-6 py-3 rounded-lg font-medium transition-colors">
                Get Started
              </a>
              <a href="/login" className="border border-white/30 hover:bg-white/10 px-6 py-3 rounded-lg font-medium transition-colors">
                Sign In
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Gallery Stats */}
      <section className="py-12 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="text-3xl font-bold text-primary mb-2">
                {loading ? '...' : filteredImages.length}
              </h3>
              <p className="text-muted-foreground">
                {getFilterStatus() === "All Images" ? "Images Found" : "Filtered Results"}
              </p>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-primary mb-2">
                {loading ? '...' : allImages.length}
              </h3>
              <p className="text-muted-foreground">Total Images</p>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-primary mb-2">
                {loading ? '...' : totalLikes}
              </h3>
              <p className="text-muted-foreground">Total Likes</p>
            </div>
          </div>
        </div>
      </section>

      {/* Image Gallery */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {getFilterStatus()}
              </h2>
              <p className="text-muted-foreground">
                {loading ? 'Loading...' : (
                  <>
                    {filteredImages.length} image{filteredImages.length !== 1 ? 's' : ''} 
                    {(selectedTag || selectedAlbum !== "all" || searchTerm) && (
                      <span className="text-primary ml-2">
                        • Filtered results
                      </span>
                    )}
                  </>
                )}
              </p>
            </div>
            
            {isAuthenticated && (
              <div className="flex gap-2">
                <a href="/upload" className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Upload Images
                </a>
                
              </div>
            )}
          </div>

          {/* Gallery Component */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="ml-4 text-muted-foreground">Loading images from database...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 text-lg mb-4">{error}</p>
              <p className="text-muted-foreground mb-4">
                Unable to load images from the database.
              </p>
              <button 
                onClick={fetchImages}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : filteredImages.length > 0 ? (
            <Gallery 
              images={filteredImages} 
              onImageClick={handleImageClick}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg mb-4">
                {searchTerm || selectedTag || selectedAlbum !== "all" 
                  ? "No images match your current filter" 
                  : "No images in gallery yet"
                }
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                {searchTerm || selectedTag || selectedAlbum !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : isAuthenticated 
                    ? "Upload some images to get started!" 
                    : "Sign up to start uploading images"
                }
              </p>
              
              {isAuthenticated ? (
                <div className="flex gap-4 justify-center">
                  <a href="/upload" className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-medium transition-colors">
                    Upload Your First Image
                  </a>
                  <a href="/ai-generate" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                    Generate with AI
                  </a>
                </div>
              ) : (
                <div className="flex gap-4 justify-center">
                  <a href="/register" className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-medium transition-colors">
                    Get Started
                  </a>
                  <a href="/login" className="border border-input hover:bg-accent hover:text-accent-foreground px-6 py-3 rounded-lg font-medium transition-colors">
                    Sign In
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <RightActionBar
        totalLikes={totalLikes}
        totalViews={totalViews}
        totalComments={totalComments}
        viewMode={viewMode}
        onToggleView={handleToggleView}
        onOpenFilter={handleOpenFilter}
        onOpenSearch={handleOpenSearch}
        onLike={handleLike}
        onShare={handleShare}
        onDownload={handleDownload}
        onBookmark={handleBookmark}
      />

      {/* ✅ Lightbox with unified image handling */}
      {selectedImage && (
        <Lightbox
          image={selectedImage}
          albums={albums}
          licenses={licenses}
          onClose={() => setSelectedImage(null)}
          onNext={handleNextImage}
          onPrev={handlePrevImage}
          onSave={handleImageSave}
        />
      )}
    </div>
  );
};

export default Index;
