// src/utils/exifExtractor.ts
import ExifReader from 'exifreader';

export const extractExifData = async (file: File): Promise<any> => {
  try {
    console.log('🔍 Extracting EXIF from:', file.name);
    
    const tags = await ExifReader.load(file);
    
    // Extract useful EXIF fields
    const exif = {
      // Camera Information
      Make: tags.Make?.description,
      Model: tags.Model?.description,
      LensModel: tags.LensModel?.description,
      Software: tags.Software?.description,
      
      // Exposure Settings
      ISO: tags.ISOSpeedRatings?.value,
      FNumber: tags.FNumber?.description,
      ExposureTime: tags.ExposureTime?.description,
      FocalLength: tags.FocalLength?.description,
      FocalLengthIn35mmFilm: tags.FocalLengthIn35mmFilm?.value,
      
      // Camera Settings
      WhiteBalance: tags.WhiteBalance?.description,
      Flash: tags.Flash?.description,
      ExposureMode: tags.ExposureMode?.description,
      MeteringMode: tags.MeteringMode?.description,
      
      // Date/Time Information
      DateTime: tags.DateTime?.description,
      DateTimeOriginal: tags.DateTimeOriginal?.description,
      DateTimeDigitized: tags.DateTimeDigitized?.description,
      
      // GPS Information (if available)
      GPSLatitude: tags.GPSLatitude?.description,
      GPSLongitude: tags.GPSLongitude?.description,
      GPSAltitude: tags.GPSAltitude?.description,
      
      // Image Properties
      ImageWidth: tags.ImageWidth?.value,
      ImageHeight: tags.ImageHeight?.value,
      ColorSpace: tags.ColorSpace?.description,
      Orientation: tags.Orientation?.value,
    };
    
    // Remove undefined values
    const cleanExif = Object.fromEntries(
      Object.entries(exif).filter(([_, value]) => value !== undefined)
    );
    
    console.log('✅ EXIF extracted:', Object.keys(cleanExif).length, 'fields');
    return cleanExif;
    
  } catch (error) {
    console.error('❌ EXIF extraction failed:', error);
    return {};
  }
};
