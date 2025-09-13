// src/components/ImageEditor.tsx - Fixed with centralized Image type
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

// ✅ Import the centralized Image type
import { Image } from '../types';

interface ImageEditorProps {
  image: Image;
  albums: string[];
  licenses: string[];
  onCancel: () => void;
  onSave: (updatedImageData: Omit<Image, "url"> & { url: string }) => void; // ✅ Use centralized Image type
}

export const ImageEditor: React.FC<ImageEditorProps> = ({
  image,
  albums,
  licenses,
  onCancel,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    title: image.title,
    description: image.description,
    album: image.album,
    tags: image.tags.join(', '),
    privacy: image.privacy || 'public',
    license: image.license,
    author: image.author,
    camera: image.camera,
    lens: image.lens,
    settings: image.settings,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // ✅ Create updated image data that matches the centralized Image interface
    const updatedImageData: Omit<Image, "url"> & { url: string } = {
      ...image, // ✅ Spread all existing properties from centralized Image
      title: formData.title,
      description: formData.description,
      album: formData.album,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
      privacy: formData.privacy as "public" | "unlisted" | "private",
      license: formData.license,
      author: formData.author,
      camera: formData.camera,
      lens: formData.lens,
      settings: formData.settings,
      url: image.url, // ✅ Include URL as required by the type
    };

    onSave(updatedImageData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="Enter image title"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Enter image description"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="album">Album</Label>
        <Select value={formData.album} onValueChange={(value) => handleInputChange('album', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select album" />
          </SelectTrigger>
          <SelectContent>
            {albums.map(album => (
              <SelectItem key={album} value={album}>
                {album}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input
          id="tags"
          value={formData.tags}
          onChange={(e) => handleInputChange('tags', e.target.value)}
          placeholder="photography, nature, landscape"
        />
      </div>

      <div>
        <Label htmlFor="privacy">Privacy</Label>
        <Select value={formData.privacy} onValueChange={(value) => handleInputChange('privacy', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select privacy" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="public">Public</SelectItem>
            <SelectItem value="unlisted">Unlisted</SelectItem>
            <SelectItem value="private">Private</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="license">License</Label>
        <Select value={formData.license} onValueChange={(value) => handleInputChange('license', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select license" />
          </SelectTrigger>
          <SelectContent>
            {licenses.map(license => (
              <SelectItem key={license} value={license}>
                {license}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="author">Author</Label>
        <Input
          id="author"
          value={formData.author}
          onChange={(e) => handleInputChange('author', e.target.value)}
          placeholder="Enter author name"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="camera">Camera</Label>
          <Input
            id="camera"
            value={formData.camera}
            onChange={(e) => handleInputChange('camera', e.target.value)}
            placeholder="Camera model"
          />
        </div>
        <div>
          <Label htmlFor="lens">Lens</Label>
          <Input
            id="lens"
            value={formData.lens}
            onChange={(e) => handleInputChange('lens', e.target.value)}
            placeholder="Lens model"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="settings">Camera Settings</Label>
        <Input
          id="settings"
          value={formData.settings}
          onChange={(e) => handleInputChange('settings', e.target.value)}
          placeholder="ISO 100, f/2.8, 1/60s"
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Save Changes
        </Button>
      </div>
    </form>
  );
};
