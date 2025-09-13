// src/components/Upload/ImageUpload.tsx - WITH EXIF INTEGRATION
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  CloudUpload, X, Check, AlertCircle, Trash2 
} from 'lucide-react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { extractExifData } from '../../utils/exifExtractor'; // ✅ Import EXIF extractor

// ✅ Safe error message utility
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return String(error);
}

// ✅ Tags Input Component
interface TagsInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
}

const TagsInput: React.FC<TagsInputProps> = ({ 
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
      <div className="flex flex-wrap gap-2 p-3 border border-input rounded-md min-h-[42px] focus-within:ring-2 focus-within:ring-blue-500 bg-white">
        {tags.map((tag, index) => (
          <span
            key={`${tag}-${index}`}
            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
          >
            #{tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-blue-600 hover:text-blue-800 ml-1"
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
      <p className="text-xs text-muted-foreground mt-1">
        Press Enter or comma to add tags
      </p>
    </div>
  );
};

// ✅ Updated UploadFile interface with EXIF data
interface UploadFile {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  progress: number;
  error?: string;
  imageData?: {
    width: number;
    height: number;
    size: string;
    type: string;
  };
  exifData?: any; // ✅ Added EXIF data field
}

interface ImageUploadProps {
  onUploadComplete?: (files: UploadFile[]) => void;
  maxFiles?: number;
  maxSize?: number;
  acceptedFormats?: string[];
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onUploadComplete,
  maxFiles = 10,
  maxSize = 10485760, // 10MB
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
}) => {
  const { user, isAuthenticated } = useAuth();
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [globalProgress, setGlobalProgress] = useState(0);
  
  // ✅ Album and Tags Selection
  const [selectedAlbum, setSelectedAlbum] = useState('general');
  const [customAlbum, setCustomAlbum] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const albums = [
    'general', 'nature', 'portraits', 'architecture', 
    'street', 'landscape', 'macro', 'wildlife'
  ];

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const extractImageData = (file: File): Promise<UploadFile['imageData']> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
          size: formatFileSize(file.size),
          type: file.type
        });
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => {
        resolve({
          width: 0,
          height: 0,
          size: formatFileSize(file.size),
          type: file.type
        });
      };
      img.src = URL.createObjectURL(file);
    });
  };

  // ✅ Updated onDrop function with EXIF extraction
  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    console.log('Files dropped:', { acceptedFiles, rejectedFiles });

    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach(({ file, errors }) => {
        console.log('Rejected file:', file.name, errors);
      });
    }

    const newFiles: UploadFile[] = await Promise.all(
      acceptedFiles.map(async (file) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
        const preview = URL.createObjectURL(file);
        const imageData = await extractImageData(file);
        
        // ✅ Extract EXIF data
        const exifData = await extractExifData(file);
        console.log('📊 EXIF extracted for', file.name, ':', Object.keys(exifData).length, 'fields');
        
        return {
          id,
          file,
          preview,
          status: 'pending' as const,
          progress: 0,
          imageData,
          exifData // ✅ Include EXIF data
        };
      })
    );

    setUploadFiles(prev => [...prev, ...newFiles].slice(0, maxFiles));
  }, [maxFiles]);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject
  } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.avif']
    },
    maxFiles: maxFiles - uploadFiles.length,
    maxSize,
    multiple: true
  });

  const removeFile = (fileId: string) => {
    setUploadFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  // ✅ Enhanced upload function with EXIF data storage
  const uploadFile = async (uploadFile: UploadFile): Promise<void> => {
    try {
      if (!user) {
        throw new Error('Please log in to upload images');
      }

      setUploadFiles(prev => 
        prev.map(f => f.id === uploadFile.id ? { ...f, status: 'uploading', progress: 0 } : f)
      );

      const fileExt = uploadFile.file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

      console.log('📁 Uploading file:', fileName);
      console.log('📊 File size:', formatFileSize(uploadFile.file.size));
      console.log('🎯 User ID:', user.id);

      // Progress simulation
      const progressInterval = setInterval(() => {
        setUploadFiles(prev => 
          prev.map(f => {
            if (f.id === uploadFile.id && f.status === 'uploading') {
              const newProgress = Math.min(f.progress + 10, 85);
              return { ...f, progress: newProgress };
            }
            return f;
          })
        );
      }, 300);

      // ✅ Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, uploadFile.file, {
          cacheControl: '3600',
          upsert: false
        });

      clearInterval(progressInterval);

      if (uploadError) {
        console.error('❌ Storage upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      if (!uploadData) {
        throw new Error('Upload failed: No data returned from storage');
      }

      console.log('✅ Storage upload successful:', uploadData);

      setUploadFiles(prev => 
        prev.map(f => f.id === uploadFile.id ? { ...f, progress: 90 } : f)
      );

      // ✅ Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);

      console.log('🔗 Public URL generated:', publicUrl);

      // ✅ Enhanced database save with EXIF data
      const albumName = selectedAlbum === 'custom' ? customAlbum : selectedAlbum;
      
      const { data: imageData, error: dbError } = await supabase
        .from('images')
        .insert({
          url: publicUrl,
          storage_path: fileName,
          filename: uploadFile.file.name,
          original_filename: uploadFile.file.name,
          title: uploadFile.file.name.split('.')[0],
          description: `Uploaded to ${albumName} album`,
          uploaded_by: user.id,
          privacy: 'public',
          album: albumName,
          tags: tags,
          author: user.email || 'Unknown User',
          
          // ✅ Enhanced camera/lens information from EXIF
          camera: uploadFile.exifData?.Make && uploadFile.exifData?.Model 
            ? `${uploadFile.exifData.Make} ${uploadFile.exifData.Model}` 
            : 'Unknown',
          lens: uploadFile.exifData?.LensModel || 'Unknown',
          settings: uploadFile.exifData?.ISO 
            ? `ISO ${uploadFile.exifData.ISO}, f/${uploadFile.exifData.FNumber || '?'}, ${uploadFile.exifData.ExposureTime || '?'}s`
            : `${uploadFile.imageData?.width || 0}x${uploadFile.imageData?.height || 0}`,
          
          license: 'All Rights Reserved',
          
          // ✅ Store complete EXIF metadata as JSON
          exif: uploadFile.exifData || {},
          
          // ✅ Enhanced image properties from EXIF
          width: uploadFile.exifData?.ImageWidth || uploadFile.imageData?.width || null,
          height: uploadFile.exifData?.ImageHeight || uploadFile.imageData?.height || null,
          size_bytes: uploadFile.file.size,
          mime_type: uploadFile.file.type,
          view_count: 0,
          likes: 0,
          comments: 0,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (dbError) {
        console.error('❌ Database error:', dbError);
        // Clean up uploaded file if database insert fails
        await supabase.storage.from('images').remove([fileName]);
        throw new Error(`Failed to save image data: ${dbError.message}`);
      }

      console.log('✅ Image saved to database:', imageData);

      setUploadFiles(prev => 
        prev.map(f => f.id === uploadFile.id ? { 
          ...f, 
          status: 'completed', 
          progress: 100 
        } : f)
      );

    } catch (error) {
      console.error('❌ Upload error:', error);
      const errorMessage = getErrorMessage(error);
      
      setUploadFiles(prev => 
        prev.map(f => f.id === uploadFile.id ? { 
          ...f, 
          status: 'error', 
          error: errorMessage
        } : f)
      );
    }
  };

  // ✅ Test Storage Function (for debugging)
  const testStorage = async () => {
    try {
      console.log('🧪 Testing storage connection...');
      console.log('👤 User:', user);
      
      if (!user) {
        alert('Please log in first');
        return;
      }
      
      const testContent = 'Hello World Test';
      const testBlob = new Blob([testContent], { type: 'text/plain' });
      const testFileName = `test/${user.id}/test-${Date.now()}.txt`;
      
      const { data, error } = await supabase.storage
        .from('images')
        .upload(testFileName, testBlob);

      if (error) {
        console.error('❌ Storage test failed:', error);
        alert(`Storage test failed: ${error.message}\n\nPlease check:\n1. 'images' bucket exists\n2. Storage policies are set up\n3. You are logged in`);
      } else {
        console.log('✅ Storage test successful:', data);
        alert('✅ Storage test successful! Upload should work now.');
        
        // Clean up test file
        await supabase.storage.from('images').remove([testFileName]);
      }
    } catch (error) {
      console.error('❌ Storage test error:', error);
      alert(`Storage test error: ${getErrorMessage(error)}`);
    }
  };

  const handleUploadAll = async () => {
    if (!isAuthenticated) {
      alert('Please log in to upload images');
      return;
    }

    if (!user) {
      alert('User information not available. Please refresh and try again.');
      return;
    }

    if (selectedAlbum === 'custom' && !customAlbum.trim()) {
      alert('Please enter a custom album name');
      return;
    }

    setIsUploading(true);
    setGlobalProgress(0);
    
    const pendingFiles = uploadFiles.filter(f => f.status === 'pending');
    
    if (pendingFiles.length === 0) {
      setIsUploading(false);
      return;
    }

    console.log(`🚀 Starting upload of ${pendingFiles.length} files...`);

    // Upload files sequentially to avoid overwhelming the API
    for (const file of pendingFiles) {
      try {
        await uploadFile(file);
        // Small delay between uploads
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Failed to upload ${file.file.name}:`, error);
      }
    }

    const completedFiles = uploadFiles.filter(f => f.status === 'completed');
    const finalProgress = Math.round((completedFiles.length / uploadFiles.length) * 100);
    setGlobalProgress(finalProgress);
    
    setIsUploading(false);
    
    console.log(`✅ Upload completed: ${completedFiles.length}/${uploadFiles.length} files successful`);
    
    if (onUploadComplete) {
      onUploadComplete(uploadFiles.filter(f => f.status === 'completed'));
    }

    // Show success message
    if (completedFiles.length > 0) {
      alert(`✅ Successfully uploaded ${completedFiles.length} images with EXIF metadata to your gallery!`);
    }
  };

  const clearAll = () => {
    uploadFiles.forEach(f => {
      if (f.preview) URL.revokeObjectURL(f.preview);
    });
    setUploadFiles([]);
    setGlobalProgress(0);
  };

  const getDropzoneStyle = () => {
    let baseStyle = "border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer ";
    
    if (isDragAccept) {
      return baseStyle + "border-green-500 bg-green-50 dark:bg-green-950";
    }
    if (isDragReject) {
      return baseStyle + "border-red-500 bg-red-50 dark:bg-red-950";
    }
    if (isDragActive) {
      return baseStyle + "border-primary bg-primary/5";
    }
    
    return baseStyle + "border-border hover:border-border/80 hover:bg-accent/50";
  };

  React.useEffect(() => {
    if (uploadFiles.length === 0) {
      setGlobalProgress(0);
      return;
    }
    
    const totalProgress = uploadFiles.reduce((sum, file) => sum + file.progress, 0);
    const avgProgress = Math.round(totalProgress / uploadFiles.length);
    setGlobalProgress(avgProgress);
  }, [uploadFiles]);

  return (
    <div className="space-y-6">
      {/* ✅ Upload Settings Card */}
      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">Upload Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="album">Album</Label>
            <select
              id="album"
              value={selectedAlbum}
              onChange={(e) => setSelectedAlbum(e.target.value)}
              className="w-full mt-1 p-2 border rounded-md bg-white"
            >
              {albums.map(album => (
                <option key={album} value={album}>
                  {album.charAt(0).toUpperCase() + album.slice(1)}
                </option>
              ))}
              <option value="custom">Create New Album...</option>
            </select>
          </div>
          
          {selectedAlbum === 'custom' && (
            <div>
              <Label htmlFor="customAlbum">Album Name</Label>
              <Input
                id="customAlbum"
                value={customAlbum}
                onChange={(e) => setCustomAlbum(e.target.value)}
                placeholder="Enter album name"
              />
            </div>
          )}
        </div>
        
        <div className="mt-4">
          <Label>Tags</Label>
          <TagsInput 
            tags={tags}
            onTagsChange={setTags}
            placeholder="Add tags (press Enter or comma to add)..."
          />
        </div>

        {/* ✅ Debug Section */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              User: {user ? `${user.email} (${user.id.slice(0, 8)}...)` : 'Not logged in'}
            </span>
            <Button variant="outline" size="sm" onClick={testStorage}>
              Test Storage
            </Button>
          </div>
        </div>
      </Card>

      {/* Upload Drop Zone */}
      <div {...getRootProps()} className={getDropzoneStyle()}>
        <input {...getInputProps()} />
        <div className="space-y-4">
          <CloudUpload className="h-12 w-12 mx-auto text-muted-foreground" />
          
          {isDragActive ? (
            <p className="text-lg font-medium text-primary">
              Drop your images here...
            </p>
          ) : (
            <div>
              <p className="text-lg font-medium">
                Drag & drop images here, or click to browse
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Supports JPEG, PNG, WebP, AVIF up to {formatFileSize(maxSize)}
              </p>
              <p className="text-sm text-muted-foreground">
                Maximum {maxFiles} files • EXIF metadata will be extracted automatically
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Upload Progress */}
      {isUploading && uploadFiles.length > 0 && (
        <div className="bg-primary/5 p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Uploading to "{selectedAlbum === 'custom' ? customAlbum : selectedAlbum}" album with EXIF data...
            </span>
            <span className="text-sm text-muted-foreground">{globalProgress}%</span>
          </div>
          <Progress value={globalProgress} className="w-full" />
        </div>
      )}

      {/* File List with EXIF Preview */}
      {uploadFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">
              Selected Files ({uploadFiles.length})
            </h3>
            <div className="flex gap-2">
              <Button variant="outline" onClick={clearAll} size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
              <Button 
                onClick={handleUploadAll} 
                disabled={isUploading || uploadFiles.every(f => f.status !== 'pending') || !user}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <CloudUpload className="h-4 w-4 mr-2" />
                {isUploading ? 'Uploading...' : 'Upload All with EXIF'}
              </Button>
            </div>
          </div>

          {/* ✅ THIS IS WHERE THE EXIF PREVIEW CODE GOES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {uploadFiles.map((uploadFile) => (
              <div key={uploadFile.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <img 
                      src={uploadFile.preview} 
                      alt={uploadFile.file.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={() => removeFile(uploadFile.id)}
                      disabled={uploadFile.status === 'uploading'}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">
                      {uploadFile.file.name}
                    </h4>
                    
                    {/* Basic image data */}
                    {uploadFile.imageData && (
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>{uploadFile.imageData.width} × {uploadFile.imageData.height}</p>
                        <p>{uploadFile.imageData.size}</p>
                        <p>{uploadFile.imageData.type}</p>
                      </div>
                    )}

                    {/* ✅ EXIF Data Preview - YOUR PROVIDED CODE GOES HERE */}
                    {uploadFile.exifData && Object.keys(uploadFile.exifData).length > 0 && (
                      <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                        <div className="text-blue-700 font-medium mb-1">
                          📊 EXIF Data ({Object.keys(uploadFile.exifData).length} fields)
                        </div>
                        
                        {/* Camera Information */}
                        {uploadFile.exifData.Make && uploadFile.exifData.Model && (
                          <div className="text-blue-600">
                            📷 {uploadFile.exifData.Make} {uploadFile.exifData.Model}
                          </div>
                        )}
                        
                        {/* Lens Information */}
                        {uploadFile.exifData.LensModel && (
                          <div className="text-blue-600">
                            🔍 {uploadFile.exifData.LensModel}
                          </div>
                        )}
                        
                        {/* Exposure Settings */}
                        {(uploadFile.exifData.ISO || uploadFile.exifData.FNumber || uploadFile.exifData.ExposureTime) && (
                          <div className="text-blue-600">
                            ⚙️ {uploadFile.exifData.ISO ? `ISO ${uploadFile.exifData.ISO}` : ''}
                            {uploadFile.exifData.FNumber ? `, f/${uploadFile.exifData.FNumber}` : ''}
                            {uploadFile.exifData.ExposureTime ? `, ${uploadFile.exifData.ExposureTime}s` : ''}
                          </div>
                        )}
                        
                        {/* Date Taken */}
                        {uploadFile.exifData.DateTimeOriginal && (
                          <div className="text-blue-600">
                            📅 {new Date(uploadFile.exifData.DateTimeOriginal).toLocaleDateString()}
                          </div>
                        )}
                        
                        {/* GPS Location */}
                        {uploadFile.exifData.GPSLatitude && uploadFile.exifData.GPSLongitude && (
                          <div className="text-blue-600">
                            📍 GPS: {uploadFile.exifData.GPSLatitude}, {uploadFile.exifData.GPSLongitude}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Status badge */}
                  <div className="flex flex-col items-end">
                    <Badge variant={
                      uploadFile.status === 'completed' ? 'default' :
                      uploadFile.status === 'error' ? 'destructive' :
                      uploadFile.status === 'uploading' ? 'secondary' : 'outline'
                    }>
                      {uploadFile.status === 'completed' && <Check className="h-3 w-3 mr-1" />}
                      {uploadFile.status === 'error' && <AlertCircle className="h-3 w-3 mr-1" />}
                      {uploadFile.status.charAt(0).toUpperCase() + uploadFile.status.slice(1)}
                    </Badge>
                  </div>
                </div>

                {/* Progress and error handling */}
                {(uploadFile.status === 'uploading' || uploadFile.status === 'completed') && (
                  <Progress value={uploadFile.progress} className="w-full" />
                )}

                {uploadFile.status === 'error' && uploadFile.error && (
                  <div className="text-sm text-destructive bg-red-50 p-2 rounded">
                    <p className="font-medium">Upload Failed:</p>
                    <p>{uploadFile.error}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
