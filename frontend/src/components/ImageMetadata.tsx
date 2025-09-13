// src/components/ImageMetadata.tsx - EXIF METADATA DISPLAY COMPONENT
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Camera, Calendar, Settings, Aperture, Timer, 
  Zap, MapPin, Info, ChevronDown, ChevronUp, Eye, EyeOff 
} from 'lucide-react';
import { Image } from '../types';

interface ImageMetadataProps {
  image: Image;
  compact?: boolean;
  className?: string;
}

const ImageMetadata: React.FC<ImageMetadataProps> = ({ 
  image, 
  compact = false, 
  className = "" 
}) => {
  const [isExpanded, setIsExpanded] = useState(!compact);
  const exif = image.exif || {};
  
  // Helper functions to format EXIF data
  const formatAperture = (fNumber: string | number) => {
    if (!fNumber) return 'N/A';
    return `f/${fNumber}`;
  };

  const formatShutterSpeed = (exposureTime: string | number) => {
    if (!exposureTime) return 'N/A';
    const speed = parseFloat(exposureTime.toString());
    return speed < 1 ? `1/${Math.round(1/speed)}s` : `${speed}s`;
  };

  const formatFocalLength = (focal: string | number) => {
    if (!focal) return 'N/A';
    return `${focal}mm`;
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

  // Compact version for gallery grid
  if (compact) {
    return (
      <div className={`bg-black bg-opacity-70 text-white text-xs p-2 rounded ${className}`}>
        <div className="grid grid-cols-2 gap-1">
          {exif.Make && exif.Model && (
            <div className="flex items-center gap-1">
              <Camera className="h-3 w-3" />
              <span className="truncate">{exif.Make} {exif.Model}</span>
            </div>
          )}
          {exif.ISO && (
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              <span>ISO {exif.ISO}</span>
            </div>
          )}
          {exif.FNumber && (
            <div className="flex items-center gap-1">
              <Aperture className="h-3 w-3" />
              <span>{formatAperture(exif.FNumber)}</span>
            </div>
          )}
          {exif.ExposureTime && (
            <div className="flex items-center gap-1">
              <Timer className="h-3 w-3" />
              <span>{formatShutterSpeed(exif.ExposureTime)}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Full metadata display
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Image Metadata
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {isExpanded ? 'Hide' : 'Show'}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-6">
          
          {/* Basic Image Info */}
          <div>
            <h4 className="font-semibold text-sm text-gray-700 uppercase tracking-wide mb-3">
              File Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Filename:</span>
                <span className="font-medium">{image.filename || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Format:</span>
                <span className="font-medium">{image.mime_type || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Dimensions:</span>
                <span className="font-medium">{image.width}×{image.height}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">File Size:</span>
                <span className="font-medium">{formatFileSize(image.size_bytes)}</span>
              </div>
            </div>
          </div>

          {/* Camera Information */}
          {(exif.Make || exif.Model || exif.LensModel) && (
            <div>
              <h4 className="font-semibold text-sm text-gray-700 uppercase tracking-wide mb-3">
                Camera Equipment
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {exif.Make && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Make:</span>
                    <span className="font-medium">{exif.Make}</span>
                  </div>
                )}
                {exif.Model && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Model:</span>
                    <span className="font-medium">{exif.Model}</span>
                  </div>
                )}
                {exif.LensModel && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lens:</span>
                    <span className="font-medium">{exif.LensModel}</span>
                  </div>
                )}
                {exif.Software && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Software:</span>
                    <span className="font-medium">{exif.Software}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Exposure Settings */}
          {(exif.ISO || exif.FNumber || exif.ExposureTime || exif.FocalLength) && (
            <div>
              <h4 className="font-semibold text-sm text-gray-700 uppercase tracking-wide mb-3">
                Exposure Settings
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {exif.FNumber && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Aperture className="h-5 w-5 mx-auto mb-1 text-gray-600" />
                    <div className="text-xs text-gray-600">Aperture</div>
                    <div className="font-semibold">{formatAperture(exif.FNumber)}</div>
                  </div>
                )}
                
                {exif.ExposureTime && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Timer className="h-5 w-5 mx-auto mb-1 text-gray-600" />
                    <div className="text-xs text-gray-600">Shutter</div>
                    <div className="font-semibold">{formatShutterSpeed(exif.ExposureTime)}</div>
                  </div>
                )}
                
                {exif.ISO && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Zap className="h-5 w-5 mx-auto mb-1 text-gray-600" />
                    <div className="text-xs text-gray-600">ISO</div>
                    <div className="font-semibold">{exif.ISO}</div>
                  </div>
                )}
                
                {exif.FocalLength && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Camera className="h-5 w-5 mx-auto mb-1 text-gray-600" />
                    <div className="text-xs text-gray-600">Focal Length</div>
                    <div className="font-semibold">{formatFocalLength(exif.FocalLength)}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Date Information */}
          {(exif.DateTimeOriginal || exif.DateTime) && (
            <div>
              <h4 className="font-semibold text-sm text-gray-700 uppercase tracking-wide mb-3">
                Date & Time
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {exif.DateTimeOriginal && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date Taken:</span>
                    <span className="font-medium">{formatDate(exif.DateTimeOriginal)}</span>
                  </div>
                )}
                {exif.DateTime && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Modified:</span>
                    <span className="font-medium">{formatDate(exif.DateTime)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* GPS Information */}
          {(exif.GPSLatitude || exif.GPSLongitude) && (
            <div>
              <h4 className="font-semibold text-sm text-gray-700 uppercase tracking-wide mb-3">
                <MapPin className="h-4 w-4 inline mr-2" />
                Location
              </h4>
              <div className="text-sm">
                <p className="text-gray-600">
                  📍 Latitude: {exif.GPSLatitude}
                </p>
                <p className="text-gray-600">
                  📍 Longitude: {exif.GPSLongitude}
                </p>
                {exif.GPSAltitude && (
                  <p className="text-gray-600">
                    ⛰️ Altitude: {exif.GPSAltitude}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Additional Settings */}
          {(exif.WhiteBalance || exif.Flash || exif.ExposureMode) && (
            <div>
              <h4 className="font-semibold text-sm text-gray-700 uppercase tracking-wide mb-3">
                Camera Settings
              </h4>
              <div className="flex flex-wrap gap-2">
                {exif.WhiteBalance && (
                  <Badge variant="secondary">WB: {exif.WhiteBalance}</Badge>
                )}
                {exif.Flash && (
                  <Badge variant="secondary">Flash: {exif.Flash}</Badge>
                )}
                {exif.ExposureMode && (
                  <Badge variant="secondary">Mode: {exif.ExposureMode}</Badge>
                )}
                {exif.MeteringMode && (
                  <Badge variant="secondary">Metering: {exif.MeteringMode}</Badge>
                )}
                {exif.ColorSpace && (
                  <Badge variant="secondary">Color: {exif.ColorSpace}</Badge>
                )}
              </div>
            </div>
          )}

        </CardContent>
      )}
    </Card>
  );
};

export default ImageMetadata;
