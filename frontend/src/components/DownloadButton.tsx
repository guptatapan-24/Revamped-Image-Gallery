// src/components/DownloadButton.tsx - DOWNLOAD WITH WATERMARK COMPONENT
import React, { useState } from 'react';
import { Button } from './ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { Download, Loader2, Image as ImageIcon } from 'lucide-react';
import { downloadWithWatermark, downloadWithLogoWatermark } from '../utils/watermarkUtils';
import { Image } from '../types';

interface DownloadButtonProps {
  image: Image;
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const DownloadButton: React.FC<DownloadButtonProps> = ({
  image,
  className = '',
  variant = 'ghost',
  size = 'sm'
}) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (withWatermark: boolean = false, watermarkText?: string) => {
    setDownloading(true);
    
    try {
      const fileName = image.original_filename || image.title || `image-${image.id}`;
      
      if (withWatermark) {
        await downloadWithWatermark(
          image.url, 
          fileName, 
          watermarkText || `© ${image.author} - Your Gallery`
        );
        
        // Show success notification
        showNotification('✅ Image downloaded with watermark!', 'success');
      } else {
        // Direct download without watermark
        const link = document.createElement('a');
        link.href = image.url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification('✅ Image downloaded!', 'success');
      }
    } catch (error) {
      console.error('Download failed:', error);
      showNotification('❌ Download failed. Please try again.', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    const notification = document.createElement('div');
    notification.innerHTML = `
      <div style="
        position: fixed; 
        top: 20px; 
        right: 20px; 
        background: ${type === 'success' ? '#10B981' : '#EF4444'}; 
        color: white; 
        padding: 12px 20px; 
        border-radius: 6px; 
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        font-size: 14px;
        max-width: 300px;
      ">
        ${message}
      </div>
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 3000);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
          disabled={downloading}
          onClick={(e) => e.stopPropagation()}
        >
          {downloading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {size !== 'icon' && (
            <span className="ml-2">
              {downloading ? 'Downloading...' : 'Download'}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleDownload(false)}>
          <ImageIcon className="h-4 w-4 mr-2" />
          Original Image
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleDownload(true)}>
          <Download className="h-4 w-4 mr-2" />
          With Watermark
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleDownload(true, `© ${image.author}`)}>
          <Download className="h-4 w-4 mr-2" />
          Author Watermark
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleDownload(true, '© Your Gallery - Premium')}>
          <Download className="h-4 w-4 mr-2" />
          Custom Watermark
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DownloadButton;
