import { useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Heart, Download, Share2, Info, Camera, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Image {
  id: string;
  url: string;
  title: string;
  description: string;
  tags: string[];
  author: string;
  camera: string;
  lens: string;
  settings: string;
  album: string;
  likes: number;
  comments: number;
  license: string;
}

interface LightboxProps {
  image: Image;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export const Lightbox = ({ image, onClose, onNext, onPrev }: LightboxProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          onPrev();
          break;
        case "ArrowRight":
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
  }, [onClose, onNext, onPrev]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm">
      <div className="flex h-full">
        {/* Main Image Area */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="relative max-w-5xl max-h-full">
            <img
              src={image.url}
              alt={image.title}
              className="max-w-full max-h-full object-contain shadow-strong"
            />
            
            {/* Navigation Arrows */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 glass-effect text-white hover:bg-white/20"
              onClick={onPrev}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 glass-effect text-white hover:bg-white/20"
              onClick={onNext}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Sidebar with Image Info */}
        <div className="w-96 glass-effect border-l border-white/10 overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">{image.title}</h2>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <p className="text-gray-300 mb-4">{image.description}</p>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button size="sm" className="hero-gradient text-white">
                <Heart className="h-4 w-4 mr-2" />
                Like ({image.likes})
              </Button>
              <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          {/* Image Details */}
          <div className="p-6 space-y-6">
            {/* Author Info */}
            <div>
              <h3 className="flex items-center gap-2 text-white font-semibold mb-2">
                <Info className="h-4 w-4" />
                Image Details
              </h3>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex justify-between">
                  <span>Author:</span>
                  <span className="text-white">{image.author}</span>
                </div>
                <div className="flex justify-between">
                  <span>Album:</span>
                  <span className="text-white">{image.album}</span>
                </div>
                <div className="flex justify-between">
                  <span>License:</span>
                  <span className="text-white">{image.license}</span>
                </div>
                <div className="flex justify-between">
                  <span>Comments:</span>
                  <span className="text-white">{image.comments}</span>
                </div>
              </div>
            </div>

            {/* Camera Info */}
            <div>
              <h3 className="flex items-center gap-2 text-white font-semibold mb-2">
                <Camera className="h-4 w-4" />
                Camera Details
              </h3>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex justify-between">
                  <span>Camera:</span>
                  <span className="text-white">{image.camera}</span>
                </div>
                <div className="flex justify-between">
                  <span>Lens:</span>
                  <span className="text-white">{image.lens}</span>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div>
              <h3 className="flex items-center gap-2 text-white font-semibold mb-2">
                <Settings2 className="h-4 w-4" />
                Camera Settings
              </h3>
              <p className="text-sm text-gray-300">{image.settings}</p>
            </div>

            {/* Tags */}
            <div>
              <h3 className="text-white font-semibold mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {image.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs bg-accent/20 text-accent rounded-full border border-accent/30"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};