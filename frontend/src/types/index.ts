// src/types/index.ts - ADD EXIF METADATA TO IMAGE TYPE
export interface Image {
  id: string;
  url: string;
  title: string;
  description: string;
  tags: string[];
  author: string;
  camera: string;
  lens: string;
  settings: string;
  album: string;
  likes: number;
  comments: number;
  license: string;
  privacy?: "public" | "unlisted" | "private";
  
  // Additional Supabase fields
  filename: string;
  original_filename: string;
  storage_path: string;
  mime_type: string;
  width?: number;
  height?: number;
  size_bytes: number;
  uploaded_by: string;
  view_count: number;
  created_at: string;

  // ✅ ADD EXIF METADATA STRUCTURE
  exif?: {
    // Camera Information
    Make?: string;                    // Camera manufacturer (Canon, Nikon, etc.)
    Model?: string;                   // Camera model
    LensModel?: string;              // Lens information
    Software?: string;               // Software used
    
    // Exposure Settings
    ISO?: number;                    // ISO sensitivity
    FNumber?: string;                // Aperture (f/2.8, f/5.6, etc.)
    ExposureTime?: string;           // Shutter speed (1/60, 1/100, etc.)
    FocalLength?: string;            // Focal length in mm
    FocalLengthIn35mmFilm?: string;  // 35mm equivalent focal length
    
    // Image Settings
    WhiteBalance?: string;           // White balance mode
    Flash?: string;                  // Flash settings
    ExposureMode?: string;           // Auto, Manual, etc.
    MeteringMode?: string;           // Metering mode
    Orientation?: number;            // Image orientation
    
    // Date/Time Information
    DateTime?: string;               // File modification date
    DateTimeOriginal?: string;       // Date photo was taken
    DateTimeDigitized?: string;      // Date photo was digitized
    
    // GPS Information (if available)
    GPSLatitude?: string;            // GPS latitude
    GPSLongitude?: string;           // GPS longitude
    GPSAltitude?: string;            // GPS altitude
    
    // Technical Details
    ColorSpace?: string;             // Color space (sRGB, Adobe RGB, etc.)
    ExposureBias?: string;           // Exposure compensation
    MaxApertureValue?: string;       // Maximum aperture
    SubjectDistance?: string;        // Distance to subject
    LightSource?: string;            // Light source type
  };
}

// Keep your existing SupabaseImage interface as is
export interface SupabaseImage {
  id: string;
  filename: string;
  original_filename: string;
  title: string;
  description?: string;
  storage_path: string;
  mime_type: string;
  width?: number;
  height?: number;
  size_bytes: number;
  uploaded_by: string;
  privacy: string;
  view_count: number;
  like_count: number;
  created_at: string;
  profiles?: {
    full_name?: string;
    username?: string;
  };
}
