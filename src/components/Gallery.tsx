import { Heart, MessageCircle, Eye, Download } from "lucide-react";

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

interface GalleryProps {
  images: Image[];
  onImageClick: (image: Image) => void;
}

export const Gallery = ({ images, onImageClick }: GalleryProps) => {
  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-center px-6">
        <div>
          <h3 className="text-2xl font-semibold text-muted-foreground mb-2">No images found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
        </div>
      </div>
    );
  }

  return (
    <section className="px-6 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {images.map((image) => (
            <div
              key={image.id}
              className="group relative card-gradient rounded-xl overflow-hidden shadow-soft hover:shadow-medium transition-smooth cursor-pointer"
              onClick={() => onImageClick(image)}
            >
              {/* Image Container */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover transition-smooth group-hover:scale-105"
                />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-smooth" />
                
                {/* Quick Actions */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-smooth">
                  <div className="flex gap-2">
                    <button 
                      className="p-2 glass-effect rounded-full hover:bg-white/20 transition-smooth"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Heart className="h-4 w-4 text-white" />
                    </button>
                    <button 
                      className="p-2 glass-effect rounded-full hover:bg-white/20 transition-smooth"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Download className="h-4 w-4 text-white" />
                    </button>
                  </div>
                </div>

                {/* Album Badge */}
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-1 text-xs font-medium glass-effect text-white rounded-full">
                    {image.album}
                  </span>
                </div>
              </div>

              {/* Image Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-smooth line-clamp-1">
                    {image.title}
                  </h3>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {image.description}
                </p>

                {/* Author & Stats */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="font-medium">{image.author}</span>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      <span>{image.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      <span>{image.comments}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      <span>{Math.floor(Math.random() * 1000) + 100}</span>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {image.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs bg-accent-soft text-accent-foreground rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                  {image.tags.length > 3 && (
                    <span className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded-full">
                      +{image.tags.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};