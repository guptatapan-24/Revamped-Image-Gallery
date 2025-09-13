// src/pages/GenerateImage.tsx
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Mock API function - replace with your actual API
const handleImageGeneration = async (prompt: string): Promise<string> => {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Replace with your actual API call
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate image');
    }

    const data = await response.json();
    return data.imageUrl;
  } catch (error) {
    // For demo purposes, return a placeholder
    console.error('Image generation failed:', error);
    return `https://picsum.photos/512/512?random=${Date.now()}`;
  }
};

const GenerateImage: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt.");
      return;
    }
    setError(null);
    setLoading(true);
    setImageUrl(null);
    try {
      const url = await handleImageGeneration(prompt.trim());
      setImageUrl(url);
    } catch (e) {
      setError("Failed to generate image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">AI Image Generator</h1>
          <p className="text-muted-foreground">
            Create stunning images from text descriptions using AI
          </p>
        </div>
        
        <div className="max-w-lg mx-auto p-6 bg-card rounded-md shadow-soft space-y-4">
          <label htmlFor="generate-prompt" className="block text-sm font-medium text-foreground">
            Enter prompt for image generation
          </label>
          <Input
            id="generate-prompt"
            type="text"
            placeholder="Describe the image you want..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            disabled={loading}
          />

          <Button onClick={handleGenerate} disabled={loading} variant="default" className="w-full">
            {loading ? "Generating..." : "Generate Image"}
          </Button>

          {error && <p className="text-destructive text-sm">{error}</p>}

          {imageUrl && (
            <div className="mt-4">
              <img src={imageUrl} alt="Generated" className="w-full rounded-md shadow-md" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateImage;
