// src/components/AIGeneration/StableDiffusionModal.tsx - Enhanced with proper data return
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardHeader, CardContent } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Slider } from '../ui/slider';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { StableDiffusionRequest, stableDiffusionService } from '../../services/stableDiffusionAPI';
import { Wand2, Loader2, Sparkles, Settings, AlertCircle, CheckCircle } from 'lucide-react';

// ✅ Utility function for safe error handling
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return String(error);
}

interface StableDiffusionModalProps {
  onClose: () => void;
  onGenerated?: (imageId: string, imageData?: any) => void; // ✅ Enhanced callback
}

export const StableDiffusionModal: React.FC<StableDiffusionModalProps> = ({
  onClose,
  onGenerated
}) => {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<string>('');
  
  const [formData, setFormData] = useState({
    prompt: '',
    width: 1024,
    height: 1024,
    steps: 30,
    seed: 0,
    style: 'photographic'
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // ✅ Enhanced validation
  const validateInputs = (): boolean => {
    if (!user) {
      setError('Please log in to generate images');
      return false;
    }

    if (!formData.prompt.trim()) {
      setError('Please enter a prompt to describe your image');
      return false;
    }

    if (formData.prompt.length < 3) {
      setError('Please enter a more descriptive prompt (at least 3 characters)');
      return false;
    }

    if (!import.meta.env.VITE_STABILITY_API_KEY) {
      setError('Stability AI API key not configured. Please add VITE_STABILITY_API_KEY to your .env file.');
      return false;
    }

    return true;
  };

  // ✅ Enhanced generation handler that returns complete image data
  const handleGenerate = async () => {
    setError(null);
    setSuccess(null);
    
    if (!validateInputs()) return;

    setIsGenerating(true);
    setGenerationProgress('Preparing your request...');

    try {
      const request: StableDiffusionRequest = {
        prompt: formData.prompt,
        width: formData.width,
        height: formData.height,
        steps: formData.steps,
        seed: formData.seed || undefined,
        style: formData.style
      };

      console.log('🎨 Starting image generation...', request);
      setGenerationProgress('Sending request to Stability AI...');

      // ✅ Call the service and get the generated image data
      const generatedImageData = await stableDiffusionService.generateImage(request, user!.id);
      
      console.log('🎉 Generation completed:', generatedImageData);
      setGenerationProgress('Image generated successfully!');
      
      if (generatedImageData) {
        setSuccess('🎉 Image generated successfully! Added to your gallery.');
        
        // ✅ Pass the complete image data back to Gallery
        onGenerated?.(generatedImageData.id, generatedImageData);
        
        setTimeout(() => onClose(), 2000);
      } else {
        setError('Image generation completed but no image data was returned.');
      }

    } catch (err) {
      console.error('❌ Generation error:', err);
      const errorMessage = getErrorMessage(err);
      
      // ✅ Provide helpful error messages
      if (errorMessage.includes('API error: 401')) {
        setError('Invalid API key. Please check your Stability AI API key configuration.');
      } else if (errorMessage.includes('API error: 402')) {
        setError('Insufficient credits. Please add credits to your Stability AI account.');
      } else if (errorMessage.includes('API error: 429')) {
        setError('Rate limit exceeded. Please wait a moment and try again.');
      } else if (errorMessage.includes('Network')) {
        setError('Network error. Please check your internet connection and try again.');
      } else {
        setError(`Generation failed: ${errorMessage}`);
      }
      
      setGenerationProgress('');
    } finally {
      setIsGenerating(false);
    }
  };

  // ✅ Enhanced prompt suggestions
  const promptSuggestions = [
    "A majestic dragon soaring through clouds at sunset, fantasy art",
    "Cyberpunk cityscape with neon lights, futuristic, detailed",
    "Peaceful forest glade with magical creatures, enchanting",
    "Abstract geometric patterns in vibrant colors, modern art",
    "Vintage car on a desert highway, cinematic lighting",
    "Cozy library with floating books, magical atmosphere",
    "Space station orbiting Earth, sci-fi, highly detailed",
    "Serene Japanese garden with cherry blossoms, traditional"
  ];

  const styles = [
    { value: 'photographic', label: 'Photographic' },
    { value: 'digital-art', label: 'Digital Art' },
    { value: 'cinematic', label: 'Cinematic' },
    { value: 'anime', label: 'Anime' },
    { value: 'fantasy-art', label: 'Fantasy Art' },
    { value: 'comic-book', label: 'Comic Book' },
    { value: 'line-art', label: 'Line Art' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-500" />
            <h2 className="text-2xl font-bold">AI Image Generator</h2>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            disabled={isGenerating}
          >
            ×
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* ✅ Enhanced Status Messages */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-md text-green-800 text-sm">
              <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {generationProgress && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-800 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{generationProgress}</span>
            </div>
          )}

          {/* Prompt Input */}
          <div className="space-y-2">
            <Label htmlFor="prompt" className="text-base font-medium">
              Describe your image *
            </Label>
            <textarea
              id="prompt"
              value={formData.prompt}
              onChange={(e) => setFormData(prev => ({ ...prev, prompt: e.target.value }))}
              placeholder="A beautiful landscape with mountains and a lake at sunset..."
              className="w-full p-3 border rounded-md resize-none h-24 focus:ring-2 focus:ring-purple-500"
              disabled={isGenerating}
              maxLength={500}
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">
                {formData.prompt.length}/500 characters
              </span>
              <span className="text-xs text-red-500">* Required</span>
            </div>
            
            {/* Prompt Suggestions */}
            <div className="space-y-2">
              <Label className="text-sm text-gray-600">Quick suggestions:</Label>
              <div className="flex flex-wrap gap-2">
                {promptSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setFormData(prev => ({ ...prev, prompt: suggestion }))}
                    className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50"
                    disabled={isGenerating}
                  >
                    {suggestion.slice(0, 35)}...
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Style Selection */}
          <div className="space-y-2">
            <Label>Art Style</Label>
            <Select
              value={formData.style}
              onValueChange={(value) => setFormData(prev => ({ ...prev, style: value }))}
              disabled={isGenerating}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {styles.map(style => (
                  <SelectItem key={style.value} value={style.value}>
                    {style.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Advanced Settings */}
          <div className="space-y-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2"
              disabled={isGenerating}
            >
              <Settings className="h-4 w-4" />
              Advanced Settings
            </Button>

            {showAdvanced && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <Label>Dimensions</Label>
                  <Select
                    value={`${formData.width}x${formData.height}`}
                    onValueChange={(value) => {
                      const [width, height] = value.split('x').map(Number);
                      setFormData(prev => ({ ...prev, width, height }));
                    }}
                    disabled={isGenerating}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1024x1024">Square (1024×1024)</SelectItem>
                      <SelectItem value="1152x896">Landscape (1152×896)</SelectItem>
                      <SelectItem value="896x1152">Portrait (896×1152)</SelectItem>
                      <SelectItem value="1216x832">Wide (1216×832)</SelectItem>
                      <SelectItem value="832x1216">Tall (832×1216)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Quality Steps: {formData.steps}</Label>
                  <Slider
                    value={[formData.steps]}
                    onValueChange={(value) => 
                      setFormData(prev => ({ ...prev, steps: value[0] }))
                    }
                    min={10}
                    max={50}
                    step={5}
                    className="w-full"
                    disabled={isGenerating}
                  />
                  <p className="text-xs text-gray-500">Higher = better quality, slower generation</p>
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="seed">Seed (optional - for reproducible results)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="seed"
                      type="number"
                      value={formData.seed}
                      onChange={(e) => 
                        setFormData(prev => ({ ...prev, seed: parseInt(e.target.value) || 0 }))
                      }
                      placeholder="0 for random"
                      className="flex-1"
                      disabled={isGenerating}
                    />
                    <Button
                      variant="outline"
                      onClick={() => 
                        setFormData(prev => ({ ...prev, seed: Math.floor(Math.random() * 1000000) }))
                      }
                      disabled={isGenerating}
                    >
                      🎲
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">Same seed + prompt = same image</p>
                </div>
              </div>
            )}
          </div>

          {/* Generate Button */}
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={onClose} 
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating || !formData.prompt.trim()}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate Image (~$0.005)
                </>
              )}
            </Button>
          </div>

          {/* Info */}
          <div className="text-xs text-gray-500 text-center space-y-1 border-t pt-4">
            <p>💡 Powered by Stability AI's Stable Diffusion XL</p>
            <p>🎨 Generated images are automatically saved to your gallery</p>
            <p>⚡ Generation typically takes 10-30 seconds</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
