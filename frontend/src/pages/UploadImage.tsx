// src/pages/UploadImage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImageUpload } from '../components/Upload/ImageUpload';
import { Button } from '../components/ui/button';
import { ArrowLeft, Upload, CheckCircle } from 'lucide-react';

const UploadImage: React.FC = () => {
  const navigate = useNavigate();
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

  const handleUploadComplete = (files: any[]) => {
    setUploadedFiles(files);
    console.log('Upload completed:', files);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Upload Images</h1>
            <p className="text-muted-foreground">
              Add new images to your gallery
            </p>
          </div>
        </div>

        {/* Upload Component */}
        <div className="max-w-4xl mx-auto">
          <ImageUpload 
            onUploadComplete={handleUploadComplete}
            maxFiles={20}
            maxSize={10485760} // 10MB
          />
        </div>

        {/* Success State */}
        {uploadedFiles.length > 0 && (
          <div className="max-w-4xl mx-auto mt-8 p-6 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
              <CheckCircle className="h-5 w-5" />
              <h3 className="font-medium">Upload Successful!</h3>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300 mt-2">
              {uploadedFiles.length} image{uploadedFiles.length !== 1 ? 's' : ''} uploaded successfully.
            </p>
            <div className="mt-4 flex gap-2">
              <Button onClick={() => navigate('/')} size="sm">
                View Gallery
              </Button>
              <Button variant="outline" onClick={() => setUploadedFiles([])} size="sm">
                Upload More
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadImage;
