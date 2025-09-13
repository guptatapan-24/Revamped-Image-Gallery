// src/components/ui/FilterDrawer.tsx
import React, { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer"; // Assuming you have these components
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar"; // Assuming calendar component exists

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  albums: { id: string; name: string }[];
  tags: string[];
  licenses: string[];
  selectedAlbums: string[];
  selectedTags: string[];
  selectedLicenses: string[];
  selectedDateRange: { from: Date | null; to: Date | null };
  onFilterChange: (filters: {
    albums: string[];
    tags: string[];
    licenses: string[];
    dateRange: { from: Date | null; to: Date | null };
  }) => void;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  albums,
  tags,
  licenses,
  selectedAlbums,
  selectedTags,
  selectedLicenses,
  selectedDateRange,
  onFilterChange,
}) => {
  // Local state for changes before applying
  const [localAlbums, setLocalAlbums] = useState<string[]>(selectedAlbums);
  const [localTags, setLocalTags] = useState<string[]>(selectedTags);
  const [localLicenses, setLocalLicenses] = useState<string[]>(selectedLicenses);
  const [localDateRange, setLocalDateRange] = useState<{ from: Date | null; to: Date | null }>(selectedDateRange);

  const toggleSelection = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
    if (list.includes(value)) {
      setList(list.filter((item) => item !== value));
    } else {
      setList([...list, value]);
    }
  };

  const applyFilters = () => {
    onFilterChange({
      albums: localAlbums,
      tags: localTags,
      licenses: localLicenses,
      dateRange: localDateRange,
    });
    onClose();
  };

  const clearFilters = () => {
    setLocalAlbums([]);
    setLocalTags([]);
    setLocalLicenses([]);
    setLocalDateRange({ from: null, to: null });
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="w-80 p-6 bg-card shadow-lg">
        <DrawerHeader>
          <DrawerTitle>Filters</DrawerTitle>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon" aria-label="Close filter drawer">
              ✕
            </Button>
          </DrawerClose>
        </DrawerHeader>

        {/* Albums Filter */}
        <section className="mb-6">
          <h3 className="font-semibold mb-2 text-foreground">Albums</h3>
          <div className="flex flex-col space-y-1 max-h-40 overflow-y-auto">
            {albums.map((album) => (
              <div key={album.id} className="flex items-center space-x-2">
                <Checkbox
                  checked={localAlbums.includes(album.id)}
                  onCheckedChange={() => toggleSelection(localAlbums, setLocalAlbums, album.id)}
                  id={`filter-album-${album.id}`}
                />
                <Label htmlFor={`filter-album-${album.id}`} className="cursor-pointer text-foreground">
                  {album.name}
                </Label>
              </div>
            ))}
          </div>
        </section>

        {/* Tags Filter */}
        <section className="mb-6">
          <h3 className="font-semibold mb-2 text-foreground">Tags</h3>
          <div className="flex flex-col space-y-1 max-h-40 overflow-y-auto">
            {tags.map((tag) => (
              <div key={tag} className="flex items-center space-x-2">
                <Checkbox
                  checked={localTags.includes(tag)}
                  onCheckedChange={() => toggleSelection(localTags, setLocalTags, tag)}
                  id={`filter-tag-${tag}`}
                />
                <Label htmlFor={`filter-tag-${tag}`} className="cursor-pointer text-foreground">
                  #{tag}
                </Label>
              </div>
            ))}
          </div>
        </section>

        {/* Licenses Filter */}
        <section className="mb-6">
          <h3 className="font-semibold mb-2 text-foreground">Licenses</h3>
          <div className="flex flex-col space-y-1 max-h-40 overflow-y-auto">
            {licenses.map((license) => (
              <div key={license} className="flex items-center space-x-2">
                <Checkbox
                  checked={localLicenses.includes(license)}
                  onCheckedChange={() => toggleSelection(localLicenses, setLocalLicenses, license)}
                  id={`filter-license-${license}`}
                />
                <Label htmlFor={`filter-license-${license}`} className="cursor-pointer text-foreground">
                  {license}
                </Label>
              </div>
            ))}
          </div>
        </section>

        {/* Date Range Filter */}
        <section className="mb-6">
          <h3 className="font-semibold mb-2 text-foreground">Date Range</h3>
          {/* Use calendar component or custom date pickers */}
          <Calendar
            mode="range"
            selected={localDateRange}
            onSelect={(range) => {
  if (range) {
    setLocalDateRange({
      from: range.from ?? null,
      to: range.to ?? null,
    });
  } else {
    setLocalDateRange({ from: null, to: null });
  }
}}
          />
        </section>

        {/* Controls */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={clearFilters}>
            Clear
          </Button>
          <Button variant="default" onClick={applyFilters}>
            Apply
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
