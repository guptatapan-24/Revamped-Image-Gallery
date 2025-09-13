// src/utils/watermarkUtils.ts - WATERMARK UTILITY FUNCTIONS
export const downloadWithWatermark = async (
  imageUrl: string, 
  imageName: string, 
  watermarkText: string = '© Your Gallery'
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Set canvas size to match image
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw the original image
        ctx.drawImage(img, 0, 0);

        // Add watermark background (optional semi-transparent rectangle)
        const textMetrics = ctx.measureText(watermarkText);
        const textWidth = textMetrics.width;
        const textHeight = 30;
        const padding = 10;

        // Position watermark in bottom-right corner
        const x = canvas.width - textWidth - padding * 2;
        const y = canvas.height - textHeight - padding;

        // Draw semi-transparent background for better text visibility
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x - padding, y - padding, textWidth + padding * 2, textHeight + padding * 2);

        // Configure text style
        ctx.font = 'bold 24px Arial, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.textBaseline = 'top';
        ctx.textAlign = 'left';

        // Add text stroke for better visibility
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.lineWidth = 1;
        ctx.strokeText(watermarkText, x, y);

        // Draw the actual text
        ctx.fillText(watermarkText, x, y);

        // Convert to blob and download
        canvas.toBlob((blob) => {
          if (blob) {
            const link = document.createElement('a');
            link.download = imageName.includes('.') ? imageName : `${imageName}.png`;
            link.href = URL.createObjectURL(blob);
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up
            URL.revokeObjectURL(link.href);
            resolve();
          } else {
            reject(new Error('Failed to create image blob'));
          }
        }, 'image/png', 0.95);

      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = imageUrl;
  });
};

// Enhanced watermark with logo
export const downloadWithLogoWatermark = async (
  imageUrl: string,
  imageName: string,
  logoUrl: string,
  text?: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const logo = new Image();
    
    img.crossOrigin = 'anonymous';
    logo.crossOrigin = 'anonymous';

    let imagesLoaded = 0;
    const totalImages = 2;

    const onImageLoad = () => {
      imagesLoaded++;
      if (imagesLoaded === totalImages) {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
          }

          canvas.width = img.width;
          canvas.height = img.height;

          // Draw original image
          ctx.drawImage(img, 0, 0);

          // Calculate logo size (max 10% of image width)
          const maxLogoWidth = img.width * 0.1;
          const logoScale = Math.min(maxLogoWidth / logo.width, maxLogoWidth / logo.height);
          const logoWidth = logo.width * logoScale;
          const logoHeight = logo.height * logoScale;

          // Position logo in bottom-right corner
          const logoX = img.width - logoWidth - 20;
          const logoY = img.height - logoHeight - 20;

          // Add semi-transparent background
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fillRect(logoX - 10, logoY - 10, logoWidth + 20, logoHeight + 20);

          // Draw logo
          ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight);

          // Add text if provided
          if (text) {
            ctx.font = 'bold 16px Arial';
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.textAlign = 'center';
            ctx.fillText(text, logoX + logoWidth / 2, logoY + logoHeight + 25);
          }

          canvas.toBlob((blob) => {
            if (blob) {
              const link = document.createElement('a');
              link.download = imageName.includes('.') ? imageName : `${imageName}.png`;
              link.href = URL.createObjectURL(blob);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(link.href);
              resolve();
            } else {
              reject(new Error('Failed to create image blob'));
            }
          }, 'image/png', 0.95);

        } catch (error) {
          reject(error);
        }
      }
    };

    img.onload = onImageLoad;
    logo.onload = onImageLoad;
    
    img.onerror = () => reject(new Error('Failed to load main image'));
    logo.onerror = () => reject(new Error('Failed to load logo'));

    img.src = imageUrl;
    logo.src = logoUrl;
  });
};

// Batch download with watermarks
export const downloadMultipleWithWatermarks = async (
  images: { url: string; name: string }[],
  watermarkText: string = '© Your Gallery'
): Promise<void> => {
  for (const image of images) {
    try {
      await downloadWithWatermark(image.url, image.name, watermarkText);
      // Small delay between downloads
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Failed to download ${image.name}:`, error);
    }
  }
};
