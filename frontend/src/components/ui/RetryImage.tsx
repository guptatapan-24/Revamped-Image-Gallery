// src/components/ui/RetryImage.tsx - ENHANCED WITH LONGER RETRIES
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from './button';
import { Loader2, AlertCircle, RefreshCw, Clock } from 'lucide-react';

interface RetryImageProps {
  src: string;
  alt: string;
  className?: string;
  isAiGenerated?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

// ✅ ENHANCED: More retries with longer delays for AI images
const AI_RETRY_DELAYS = [1000, 2000, 5000, 10000, 20000, 30000]; // Up to 30 seconds
const REGULAR_RETRY_DELAYS = [1000, 2000, 4000]; // Regular images
const AI_MAX_RETRIES = 6;
const REGULAR_MAX_RETRIES = 3;

export const RetryImage: React.FC<RetryImageProps> = ({
  src,
  alt,
  className = "",
  isAiGenerated = false,
  onLoad,
  onError
}) => {
  const [retryCount, setRetryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imgSrc, setImgSrc] = useState(src);
  const [countdown, setCountdown] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const countdownRef = useRef<NodeJS.Timeout>();

  const maxRetries = isAiGenerated ? AI_MAX_RETRIES : REGULAR_MAX_RETRIES;
  const retryDelays = isAiGenerated ? AI_RETRY_DELAYS : REGULAR_RETRY_DELAYS;

  // Reset when src changes
  useEffect(() => {
    console.log(`🖼️ RetryImage: New src (${isAiGenerated ? 'AI' : 'Regular'}):`, src);
    setIsLoading(true);
    setHasError(false);
    setRetryCount(0);
    setCountdown(0);
    setImgSrc(src);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (countdownRef.current) {
      clearTimeout(countdownRef.current);
    }
  }, [src, isAiGenerated]);

  const startCountdown = useCallback((totalTime: number) => {
    setCountdown(Math.ceil(totalTime / 1000));
    
    const updateCountdown = () => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (countdownRef.current) {
            clearTimeout(countdownRef.current);
          }
          return 0;
        }
        countdownRef.current = setTimeout(updateCountdown, 1000);
        return prev - 1;
      });
    };
    
    countdownRef.current = setTimeout(updateCountdown, 1000);
  }, []);

  const handleLoad = useCallback(() => {
    console.log(`✅ Image loaded successfully (attempt ${retryCount + 1}):`, alt);
    setIsLoading(false);
    setHasError(false);
    setCountdown(0);
    onLoad?.();
  }, [alt, onLoad, retryCount]);

  const handleError = useCallback(() => {
    console.error(`❌ Image failed to load (attempt ${retryCount + 1}):`, imgSrc);
    setIsLoading(false);
    
    if (retryCount < maxRetries - 1) {
      const delay = retryDelays[retryCount] || retryDelays[retryDelays.length - 1];
      console.log(`🔄 Scheduling retry ${retryCount + 2}/${maxRetries} in ${delay}ms`);
      
      startCountdown(delay);
      
      timeoutRef.current = setTimeout(() => {
        const newSrc = isAiGenerated 
          ? `${src}?retry=${retryCount + 1}&t=${Date.now()}&cb=${Math.random().toString(36).slice(2)}`
          : `${src}?t=${Date.now()}`;
        
        setRetryCount(prev => prev + 1);
        setIsLoading(true);
        setImgSrc(newSrc);
      }, delay);
    } else {
      console.error(`❌ Max retries (${maxRetries}) reached for:`, src);
      setHasError(true);
      onError?.();
    }
  }, [imgSrc, retryCount, maxRetries, src, isAiGenerated, retryDelays, startCountdown, onError]);

  const handleManualRetry = useCallback(() => {
    console.log('🔄 Manual retry triggered');
    setRetryCount(0);
    setIsLoading(true);
    setHasError(false);
    setCountdown(0);
    setImgSrc(`${src}?manual=${Date.now()}&cb=${Math.random().toString(36).slice(2)}`);
  }, [src]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (countdownRef.current) {
        clearTimeout(countdownRef.current);
      }
    };
  }, []);

  if (hasError) {
    return (
      <div className={`flex flex-col items-center justify-center bg-gray-900/80 rounded-lg p-8 text-center ${className}`}>
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-white text-lg mb-2">Failed to load image</p>
        <p className="text-gray-400 text-sm mb-4">
          {isAiGenerated 
            ? `AI image failed to load after ${maxRetries} attempts. This may indicate the image is still processing or there's a storage issue.`
            : 'Image could not be loaded after multiple attempts.'
          }
        </p>
        <Button 
          onClick={handleManualRetry} 
          className="bg-blue-600 hover:bg-blue-700" 
          size="sm"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
        <p className="text-xs text-gray-500 mt-2">
          Attempted {retryCount + 1} times
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10">
          <div className="text-center text-white">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-sm mb-2">
              Loading {isAiGenerated ? 'AI generated ' : ''}image...
            </p>
            {retryCount > 0 && (
              <p className="text-xs text-gray-300">
                Attempt {retryCount + 1}/{maxRetries}
              </p>
            )}
            {countdown > 0 && (
              <div className="flex items-center justify-center gap-1 text-xs text-blue-300 mt-2">
                <Clock className="h-3 w-3" />
                <span>Retry in {countdown}s</span>
              </div>
            )}
          </div>
        </div>
      )}

      <img
        ref={imgRef}
        key={imgSrc} // Force remount on src change
        src={imgSrc}
        alt={alt}
        className={className}
        onLoad={handleLoad}
        onError={handleError}
        loading="eager"
        style={{ 
          opacity: isLoading ? 0.3 : 1,
          transition: 'opacity 0.3s ease'
        }}
      />
    </div>
  );
};
