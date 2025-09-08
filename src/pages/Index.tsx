import { useState } from "react";
import { Header } from "@/components/Header";
import { Gallery } from "@/components/Gallery";
import { Lightbox } from "@/components/Lightbox";
import { Sidebar } from "@/components/Sidebar";
import heroImage from "@/assets/hero-banner.jpg";
import sample1 from "@/assets/sample-1.jpg";
import sample2 from "@/assets/sample-2.jpg";
import sample3 from "@/assets/sample-3.jpg";

// Sample data - in a real app this would come from your backend
const sampleImages = [
  {
    id: "1",
    url: sample1,
    title: "Mountain Lake Sunset",
    description: "A serene mountain lake reflecting the golden sunset sky",
    tags: ["landscape", "nature", "sunset"],
    author: "John Doe",
    camera: "Canon EOS R5",
    lens: "24-70mm f/2.8",
    settings: "ISO 100, f/8, 1/125s",
    album: "Nature Collection",
    likes: 142,
    comments: 8,
    license: "Creative Commons"
  },
  {
    id: "2",
    url: sample2,
    title: "Urban Night Lights",
    description: "City streets illuminated by neon lights and traffic",
    tags: ["urban", "night", "street"],
    author: "Jane Smith",
    camera: "Sony A7IV",
    lens: "85mm f/1.4",
    settings: "ISO 1600, f/2.8, 1/60s",
    album: "City Life",
    likes: 89,
    comments: 5,
    license: "All Rights Reserved"
  },
  {
    id: "3",
    url: sample3,
    title: "Morning Dewdrops",
    description: "Macro shot of dewdrops on flower petals",
    tags: ["macro", "nature", "morning"],
    author: "Mike Johnson",
    camera: "Nikon D850",
    lens: "100mm f/2.8 Macro",
    settings: "ISO 200, f/5.6, 1/250s",
    album: "Macro World",
    likes: 201,
    comments: 12,
    license: "Creative Commons"
  }
];

const Index = () => {
  const [selectedImage, setSelectedImage] = useState<typeof sampleImages[0] | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAlbum, setSelectedAlbum] = useState("all");

  const filteredImages = sampleImages.filter(image => {
    const matchesSearch = image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         image.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesAlbum = selectedAlbum === "all" || image.album === selectedAlbum;
    return matchesSearch && matchesAlbum;
  });

  return (
    <div className="min-h-screen gallery-bg">
      {/* Header */}
      <Header 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Main Layout */}
      <div className="flex">
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen}
          selectedAlbum={selectedAlbum}
          onAlbumSelect={setSelectedAlbum}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content */}
        <main className={`flex-1 transition-smooth ${sidebarOpen ? 'ml-80' : 'ml-0'}`}>
          {/* Hero Section */}
          <section className="relative h-96 overflow-hidden">
            <img 
              src={heroImage} 
              alt="Professional Photography Gallery" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="text-center text-white px-6">
                <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  PhotoVault
                </h1>
                <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-2xl mx-auto">
                  Professional image gallery platform for photographers and creatives
                </p>
                <div className="flex gap-4 justify-center">
                  <button className="hero-gradient px-8 py-3 rounded-lg font-semibold text-white shadow-glow hover:shadow-strong transition-smooth">
                    Explore Gallery
                  </button>
                  <button className="glass-effect px-8 py-3 rounded-lg font-semibold text-white border border-white/20 hover:bg-white/10 transition-smooth">
                    Upload Images
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Gallery Stats */}
          <section className="px-6 py-8 bg-white/50 backdrop-blur-sm border-b border-border/30">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">2,847</div>
                  <div className="text-muted-foreground">Total Images</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">156</div>
                  <div className="text-muted-foreground">Albums</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">89</div>
                  <div className="text-muted-foreground">Contributors</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">12.5k</div>
                  <div className="text-muted-foreground">Total Likes</div>
                </div>
              </div>
            </div>
          </section>

          {/* Gallery */}
          <Gallery 
            images={filteredImages}
            onImageClick={setSelectedImage}
          />
        </main>
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <Lightbox
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
          onNext={() => {
            const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id);
            const nextIndex = (currentIndex + 1) % filteredImages.length;
            setSelectedImage(filteredImages[nextIndex]);
          }}
          onPrev={() => {
            const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id);
            const prevIndex = currentIndex === 0 ? filteredImages.length - 1 : currentIndex - 1;
            setSelectedImage(filteredImages[prevIndex]);
          }}
        />
      )}
    </div>
  );
};

export default Index;