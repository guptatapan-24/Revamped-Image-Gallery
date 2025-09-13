// src/components/Upload/TagsInput.tsx
import React, { useState } from 'react';
import { X } from 'lucide-react';

interface TagsInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
}

export const TagsInput: React.FC<TagsInputProps> = ({ 
  tags, 
  onTagsChange, 
  placeholder = "Add tags..." 
}) => {
  const [inputValue, setInputValue] = useState('');

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onTagsChange([...tags, trimmedTag]);
    }
    setInputValue('');
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 p-3 border rounded-md min-h-[42px] focus-within:ring-2 focus-within:ring-blue-500">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
          >
            #{tag}
            <button
              onClick={() => removeTag(tag)}
              className="text-blue-600 hover:text-blue-800"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 outline-none min-w-[120px] bg-transparent"
        />
      </div>
      <p className="text-xs text-gray-500 mt-1">
        Press Enter or comma to add tags
      </p>
    </div>
  );
};
