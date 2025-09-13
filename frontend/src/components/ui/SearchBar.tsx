// src/components/ui/SearchBar.tsx
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  placeholder = "Search images...",
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <div className="relative w-full max-w-md">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="w-5 h-5 text-muted-foreground" />
      </div>
      <Input
        type="search"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={placeholder}
        className={`pl-10 ${focused ? "ring-2 ring-primary" : ""}`}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        aria-label="Search images"
      />
    </div>
  );
};
