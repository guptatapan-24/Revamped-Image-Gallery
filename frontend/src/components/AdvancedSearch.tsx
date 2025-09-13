// src/components/AdvancedSearch.tsx - FIXED VERSION
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, X, Filter } from 'lucide-react';
import { Image } from '../types';

interface AdvancedSearchProps {
  onSearchResults: (results: Image[]) => void; // ✅ Callback to send results
  onClearSearch: () => void; // ✅ Callback to clear search
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ 
  onSearchResults, 
  onClearSearch 
}) => {
  const [filters, setFilters] = useState({
    keyword: '',
    album: '',
    dateFrom: '',
    dateTo: '',
    camera: '',
    license: ''
  });

  const [searching, setSearching] = useState(false);
  const [albums, setAlbums] = useState<string[]>([]);

  // Load available albums
  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const { data } = await supabase
          .from('images')
          .select('album')
          .not('album', 'is', null);
        
        if (data) {
          const uniqueAlbums = [...new Set(data.map(item => item.album).filter(Boolean))];
          setAlbums(uniqueAlbums);
        }
      } catch (error) {
        console.error('Error fetching albums:', error);
      }
    };
    
    fetchAlbums();
  }, []);

  // ✅ Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchFilters) => {
      await searchImages(searchFilters);
    }, 500),
    [onSearchResults]
  );

  // ✅ Main search function
  const searchImages = async (searchFilters = filters) => {
    setSearching(true);
    
    try {
      let query = supabase
        .from('images')
        .select('*');

      // Keyword search
      if (searchFilters.keyword.trim()) {
        query = query.or(
          `title.ilike.%${searchFilters.keyword}%,` +
          `description.ilike.%${searchFilters.keyword}%,` +
          `tags.cs.{${searchFilters.keyword}}`
        );
      }

      // Album filter
      if (searchFilters.album) {
        query = query.eq('album', searchFilters.album);
      }

      // Date filters
      if (searchFilters.dateFrom) {
        query = query.gte('created_at', searchFilters.dateFrom);
      }
      if (searchFilters.dateTo) {
        query = query.lte('created_at', searchFilters.dateTo + 'T23:59:59');
      }

      // Camera filter
      if (searchFilters.camera.trim()) {
        query = query.or(
          `exif->Camera.ilike.%${searchFilters.camera}%,` +
          `exif->Make.ilike.%${searchFilters.camera}%,` +
          `exif->Model.ilike.%${searchFilters.camera}%`
        );
      }

      // License filter
      if (searchFilters.license) {
        query = query.eq('license', searchFilters.license);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Search error:', error);
        return;
      }

      // ✅ Send results back to parent
      console.log('🎯 Sending search results to parent:', data?.length || 0);
      onSearchResults(data || []);
      
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearching(false);
    }
  };

  // Handle input changes with auto-search
  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Auto-search on keyword input
    if (key === 'keyword') {
      if (value.trim()) {
        debouncedSearch(newFilters);
      } else {
        onClearSearch(); // Clear if empty
      }
    }
  };

  // Manual search trigger
  const handleSearch = () => {
    searchImages(filters);
  };

  // Clear all filters
  const clearFilters = () => {
    const emptyFilters = {
      keyword: '',
      album: '',
      dateFrom: '',
      dateTo: '',
      camera: '',
      license: ''
    };
    setFilters(emptyFilters);
    onClearSearch(); // ✅ Call parent's clear function
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Advanced Search & Filters</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Keyword Search */}
        <div>
          <label className="block text-sm font-medium mb-1">Search Keywords</label>
          <Input
            placeholder="Search title, description, tags..."
            value={filters.keyword}
            onChange={(e) => handleFilterChange('keyword', e.target.value)}
          />
        </div>

        {/* Album Filter */}
        <div>
          <label className="block text-sm font-medium mb-1">Album</label>
          <Select 
            value={filters.album} 
            onValueChange={(value) => handleFilterChange('album', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Albums" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Albums</SelectItem>
              {albums.map(album => (
                <SelectItem key={album} value={album}>{album}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Camera Filter */}
        <div>
          <label className="block text-sm font-medium mb-1">Camera</label>
          <Input
            placeholder="Canon, Nikon, iPhone..."
            value={filters.camera}
            onChange={(e) => handleFilterChange('camera', e.target.value)}
          />
        </div>

        {/* Date From */}
        <div>
          <label className="block text-sm font-medium mb-1">Date From</label>
          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
          />
        </div>

        {/* Date To */}
        <div>
          <label className="block text-sm font-medium mb-1">Date To</label>
          <Input
            type="date"
            value={filters.dateTo}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
          />
        </div>

        {/* License Filter */}
        <div>
          <label className="block text-sm font-medium mb-1">License</label>
          <Select 
            value={filters.license} 
            onValueChange={(value) => handleFilterChange('license', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Licenses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Licenses</SelectItem>
              <SelectItem value="cc">Creative Commons</SelectItem>
              <SelectItem value="copyright">Copyright</SelectItem>
              <SelectItem value="public">Public Domain</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-between items-center">
        <div className="flex gap-2">
          <Button 
            onClick={handleSearch} 
            disabled={searching}
            className="flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            {searching ? 'Searching...' : 'Search'}
          </Button>
          
          <Button 
            onClick={clearFilters} 
            variant="outline"
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Clear Filters
          </Button>
        </div>

        {/* Search status */}
        <div className="text-sm text-muted-foreground">
          {searching && (
            <span className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              Searching...
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Debounce utility
function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default AdvancedSearch;
