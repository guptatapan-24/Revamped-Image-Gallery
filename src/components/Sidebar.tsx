import { useState } from "react";
import { X, Image, Folder, Tag, Calendar, Camera, Filter, Upload, Settings, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface SidebarProps {
  isOpen: boolean;
  selectedAlbum: string;
  onAlbumSelect: (album: string) => void;
  onClose: () => void;
}

const albums = [
  { id: "all", name: "All Images", count: 2847 },
  { id: "Nature Collection", name: "Nature Collection", count: 156 },
  { id: "City Life", name: "City Life", count: 89 },
  { id: "Macro World", name: "Macro World", count: 234 },
  { id: "Portraits", name: "Portraits", count: 178 },
  { id: "Architecture", name: "Architecture", count: 92 },
];

const quickFilters = [
  { id: "recent", name: "Recently Added", icon: Calendar },
  { id: "popular", name: "Most Popular", icon: Image },
  { id: "camera", name: "Camera Type", icon: Camera },
  { id: "tags", name: "Popular Tags", icon: Tag },
];

export const Sidebar = ({ isOpen, selectedAlbum, onAlbumSelect, onClose }: SidebarProps) => {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/20 z-30 lg:hidden" onClick={onClose} />
      
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-80 glass-effect border-r border-border/30 z-40 overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Browse Gallery</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3 mb-6">
            <Button className="w-full hero-gradient text-white justify-start">
              <Upload className="h-4 w-4 mr-2" />
              Upload Images
            </Button>
            <Button variant="outline" className="w-full justify-start border-border/30">
              <Palette className="h-4 w-4 mr-2" />
              Theme Editor
            </Button>
            <Button variant="outline" className="w-full justify-start border-border/30">
              <Settings className="h-4 w-4 mr-2" />
              Gallery Settings
            </Button>
          </div>

          <Separator className="mb-6" />

          {/* Albums */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <Folder className="h-4 w-4" />
              Albums & Collections
            </h3>
            <div className="space-y-1">
              {albums.map((album) => (
                <button
                  key={album.id}
                  onClick={() => onAlbumSelect(album.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-smooth flex items-center justify-between hover:bg-accent/10 ${
                    selectedAlbum === album.id 
                      ? "bg-accent/20 text-accent-foreground font-medium" 
                      : "text-foreground"
                  }`}
                >
                  <span>{album.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {album.count}
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          <Separator className="mb-6" />

          {/* Quick Filters */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Quick Filters
            </h3>
            <div className="space-y-1">
              {quickFilters.map((filter) => {
                const Icon = filter.icon;
                return (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(activeFilter === filter.id ? null : filter.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-smooth flex items-center gap-2 hover:bg-accent/10 ${
                      activeFilter === filter.id 
                        ? "bg-accent/20 text-accent-foreground" 
                        : "text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {filter.name}
                  </button>
                );
              })}
            </div>
          </div>

          <Separator className="mb-6" />

          {/* Popular Tags */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Popular Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {["landscape", "portrait", "nature", "urban", "macro", "black-white", "vintage", "modern"].map((tag) => (
                <Badge 
                  key={tag} 
                  variant="outline" 
                  className="cursor-pointer hover:bg-accent/20 hover:border-accent/50 transition-smooth"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* User Role Indicator */}
          <div className="mt-8 p-4 glass-effect rounded-lg border border-accent/20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 hero-gradient rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">A</span>
              </div>
              <div>
                <div className="font-medium text-sm">Admin Access</div>
                <div className="text-xs text-muted-foreground">Full gallery permissions</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};