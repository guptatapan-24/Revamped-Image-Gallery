// src/components/Header.tsx - ADD PALETTE EDITOR NAVIGATION
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { StableDiffusionModal } from './AIGeneration/StableDiffusionModal';
import { 
  LogOut, 
  User, 
  Upload, 
  Sparkles, 
  Menu, 
  X,
  Search,
  Shield,
  Edit,
  Settings,
  BarChart3,
  Palette // ✅ Add Palette icon import
} from 'lucide-react';

interface HeaderProps {
  onMenuClick?: () => void;
  searchTerm?: string;
  onSearchChange?: React.Dispatch<React.SetStateAction<string>>;
}

const Header: React.FC<HeaderProps> = ({
  onMenuClick,
  searchTerm = '',
  onSearchChange
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [internalSearchTerm, setInternalSearchTerm] = useState('');

  // Get user role
  const userRole = user?.user_metadata?.role || 'user';
  const isAdmin = userRole === 'admin';
  const isEditor = userRole === 'editor' || userRole === 'admin';

  const currentSearchTerm = searchTerm || internalSearchTerm;
  const handleSearchChange = onSearchChange || setInternalSearchTerm;

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    try {
      await logout();
      setMobileMenuOpen(false);
      window.location.href = '/';
    } catch (error) {
      console.error('❌ Logout failed:', error);
      alert('Logout failed. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleAIGenerated = (imageId: string, imageData?: any) => {
    setShowAIModal(false);
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              {onMenuClick && (
                <Button variant="ghost" size="sm" onClick={onMenuClick} className="mr-3">
                  <Menu className="h-6 w-6" />
                </Button>
              )}
              
              <a href="/" className="text-2xl font-bold text-primary hover:text-primary/80 transition-colors">
                Revamping
              </a>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="/" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                Home
              </a>
              
              
              {/* ✅ Add Palette Editor Link for authenticated users */}
              {isAuthenticated && (
                <>

                  
                  <a href="/profile" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                    Profile
                  </a>
                </>
              )}

              {/* Admin/Editor Navigation */}
              {isEditor && (
                <a href="/editor" className="text-blue-600 hover:text-blue-900 transition-colors font-medium flex items-center gap-1">
                  <Edit className="h-4 w-4" />
                  Editor
                </a>
              )}
              {isAdmin && (
                <a href="/admin" className="text-red-600 hover:text-red-900 transition-colors font-medium flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  Admin
                </a>
              )}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search images..."
                  value={currentSearchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-64 px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>

              {/* Upload Button */}
              <Button 
                onClick={() => window.location.href = '/upload'}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>

              {/* Pink AI Generate Button */}
              <Button
                onClick={() => setShowAIModal(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Generate
              </Button>

              {/* User Actions */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-2">
                  {/* Role Badge */}
                  {isAdmin && (
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                      Admin
                    </span>
                  )}
                  {isEditor && !isAdmin && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      Editor
                    </span>
                  )}

                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => window.location.href = '/login'}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <div className="flex flex-col space-y-4">
                {/* Mobile Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search images..."
                    value={currentSearchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>

                <a href="/" className="text-gray-600 hover:text-gray-900 font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
                  Home
                </a>
                <a href="/gallery" className="text-gray-600 hover:text-gray-900 font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
                  Gallery
                </a>
                
                {isAuthenticated && (
                  <>
                    {/* ✅ Add Mobile Palette Editor Link */}
                    <a href="/palette" className="text-gray-600 hover:text-gray-900 font-medium py-2 flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                      <Palette className="h-4 w-4" />
                      Theme Editor
                    </a>
                    
                    <a href="/profile" className="text-gray-600 hover:text-gray-900 font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
                      Profile
                    </a>

                    {/* Mobile Admin/Editor Links */}
                    {isEditor && (
                      <a href="/editor" className="text-blue-600 hover:text-blue-900 font-medium py-2 flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                        <Edit className="h-4 w-4" />
                        Editor Dashboard
                      </a>
                    )}
                    {isAdmin && (
                      <a href="/admin" className="text-red-600 hover:text-red-900 font-medium py-2 flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                        <Shield className="h-4 w-4" />
                        Admin Dashboard
                      </a>
                    )}
                  </>
                )}

                <div className="pt-4 border-t border-gray-200 space-y-2">
                  {/* Mobile Action Buttons */}
                  <Button 
                    onClick={() => {
                      setMobileMenuOpen(false);
                      window.location.href = '/upload';
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>

                  <Button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setShowAIModal(true);
                    }}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate with AI
                  </Button>

                  {/* Mobile Auth Actions */}
                  {isAuthenticated ? (
                    <div className="space-y-2">
                      {/* Role Badge */}
                      <div className="text-center">
                        {isAdmin && (
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                            Admin User
                          </span>
                        )}
                        {isEditor && !isAdmin && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            Editor User
                          </span>
                        )}
                      </div>
                      
                      <Button 
                        variant="outline" 
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="w-full"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        {isLoggingOut ? 'Logging out...' : 'Logout'}
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setMobileMenuOpen(false);
                        window.location.href = '/login';
                      }}
                      className="w-full"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Sign In
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* AI Generation Modal */}
      {showAIModal && (
        <StableDiffusionModal
          onClose={() => setShowAIModal(false)}
          onGenerated={handleAIGenerated}
        />
      )}
    </>
  );
};

export default Header;
