// src/components/Sidebar.tsx
import React, { useState } from "react";
import { 
  X, Image, Search, Palette, Camera, Settings, 
  User, Shield, Edit, Home, Plus, Filter 
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { useAuth } from "../hooks/useAuth";
import { Upload } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  selectedAlbum: string;
  selectedTag?: string; // ✅ Add tag selection
  onAlbumSelect: (album: string) => void;
  onTagSelect?: (tag: string) => void; // ✅ Add tag handler
  onClose: () => void;
}

const albums = [
  { id: "all", name: "All Images", count: 2847 },
  { id: "nature", name: "Nature Collection", count: 156 },
  { id: "city", name: "City Life", count: 89 },
  { id: "macro", name: "Macro World", count: 234 },
  { id: "portraits", name: "Portraits", count: 178 },
  { id: "architecture", name: "Architecture", count: 92 },
];

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  selectedAlbum, 
  selectedTag,
  onAlbumSelect, 
  onTagSelect,
  onClose 
}) => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const navigation = [
    { name: "Home", href: "/", icon: Home, public: true },
    { name: "My Profile", href: "/profile", icon: User, public: false },
    { name: "Upload Images", href: "/upload", icon: Upload, public: false },
    // { name: "Generate Image", href: "/generate-image", icon: Plus, public: false },
    { name: "Palette Editor", href: "/palette", icon: Palette, public: false },
  ];

  const adminNavigation = [
    { name: "Admin Dashboard", href: "/admin", icon: Shield, role: "admin" },
    { name: "Editor Dashboard", href: "/editor", icon: Edit, role: "editor" },
  ];

  const isActiveRoute = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  const canAccessRoute = (route: any) => {
    if (route.public) return true;
    if (!isAuthenticated) return false;
    if (route.role) {
      return user?.role === route.role || user?.role === 'admin';
    }
    return true;
  };

  // ✅ Add tag click handler
  const handleTagClick = (tag: string) => {
    if (onTagSelect) {
      onTagSelect(tag);
      console.log('Tag selected:', tag); // Debug log
      onClose(); // Close sidebar on mobile after selection
    }
  };

  // ✅ Add album click handler with debug
  const handleAlbumClick = (albumId: string) => {
    console.log('Album selected:', albumId); // Debug log
    onAlbumSelect(albumId);
    onClose(); // Close sidebar on mobile after selection
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed
        top-16
        left-0
        z-50
        h-[calc(100vh-4rem)]
        w-80
        bg-card border-r shadow-lg
        transform transition-transform duration-300 ease-in-out
        ${isOpen 
          ? 'translate-x-0' 
          : '-translate-x-full'
        }
        overflow-y-auto
      `}>
        <div className="p-6">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-lg">Browse Gallery</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="space-y-2 mb-6">
            <h3 className="font-medium text-sm text-muted-foreground mb-3">
              Navigation
            </h3>
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.href);
              const canAccess = canAccessRoute(item);

              if (!canAccess) return null;

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                    ${isActive 
                      ? 'bg-accent text-accent-foreground font-medium' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/10'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <Separator className="my-6" />

          {/* Role-based Navigation */}
          {isAuthenticated && (user?.role === 'admin' || user?.role === 'editor') && (
            <>
              <nav className="space-y-2 mb-6">
                <h3 className="font-medium text-sm text-muted-foreground mb-3">
                  Dashboard
                </h3>
                {adminNavigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActiveRoute(item.href);
                  const canAccess = canAccessRoute(item);

                  if (!canAccess) return null;

                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={onClose}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                        ${isActive 
                          ? 'bg-accent text-accent-foreground font-medium' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent/10'
                        }
                      `}
                    >
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
              <Separator className="my-6" />
            </>
          )}

          {/* Albums & Collections */}
          <div className="mb-6">
            <h3 className="font-medium text-sm text-muted-foreground mb-3">
              Albums & Collections
            </h3>
            <div className="space-y-1">
              {albums.map((album) => (
                <button
                  key={album.id}
                  onClick={() => handleAlbumClick(album.id)} // ✅ Use handler with debug
                  className={`
                    w-full text-left px-3 py-2 rounded-lg text-sm transition-colors 
                    flex items-center justify-between hover:bg-accent/10
                    ${selectedAlbum === album.id
                      ? "bg-accent/20 text-accent-foreground font-medium"
                      : "text-foreground"
                    }
                  `}
                >
                  <span>{album.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {album.count}
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          <Separator className="my-6" />

          {/* ✅ Popular Tags with Click Functionality */}
          <div>
            <h3 className="font-medium text-sm text-muted-foreground mb-3">
              Popular Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {["landscape", "portrait", "nature", "urban", "macro", "black-white", "vintage", "modern"].map((tag) => (
                <Badge 
                  key={tag}
                  variant={selectedTag === tag ? "default" : "outline"} // ✅ Show selected state
                  className={`text-xs cursor-pointer transition-colors ${
                    selectedTag === tag 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-accent/10"
                  }`}
                  onClick={() => handleTagClick(tag)} // ✅ Add click handler
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* User Role Indicator */}
          {isAuthenticated && user && (
            <div className="mt-6 p-3 bg-accent/10 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user.name || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {user.role || 'Member'} Access
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
