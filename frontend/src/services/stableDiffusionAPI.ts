// src/services/stableDiffusionAPI.ts - FIXED WITH CONSISTENT STORAGE PATHS
import { supabase } from "../lib/supabase";

export interface StableDiffusionRequest {
  prompt: string;
  width?: number;
  height?: number;
  steps?: number;
  seed?: number;
  style?: string;
}

class StableDiffusionService {
  private apiKey = import.meta.env.VITE_STABILITY_API_KEY;
  private baseUrl = 'https://api.stability.ai';

  async generateImage(request: StableDiffusionRequest, userId: string) {
    console.log('🚀 Starting AI generation:', { prompt: request.prompt, userId });

    // ✅ Validate inputs
    if (!this.apiKey) {
      throw new Error('Stability AI API key not configured. Please check your environment variables.');
    }
    if (!request.prompt?.trim()) {
      throw new Error('Prompt is required');
    }
    if (!userId) {
      throw new Error('User ID is required');
    }

    let jobId: string | null = null;

    try {
      // ✅ Create job record first
      const { data: job, error: jobError } = await supabase
        .from('ai_jobs')
        .insert({
          user_id: userId,
          prompt: request.prompt,
          provider: 'stability_ai',
          settings: request,
          status: 'processing'
        })
        .select()
        .single();

      if (jobError) {
        console.error('❌ Failed to create job:', jobError);
        throw new Error(`Failed to create job: ${jobError.message}`);
      }

      jobId = job.id;
      console.log('✅ Job created:', jobId);

      // ✅ Call Stability AI API
      console.log('🚀 Calling Stability AI API...');
      
      const requestBody = {
        text_prompts: [{
          text: request.prompt,
          weight: 1
        }],
        cfg_scale: 7,
        height: request.height || 1024,
        width: request.width || 1024,
        steps: request.steps || 30,
        samples: 1,
        seed: request.seed || Math.floor(Math.random() * 1000000)
      };

      const response = await fetch(`${this.baseUrl}/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Stability AI API error:', response.status, errorText);
        throw new Error(`Stability AI API error (${response.status}): ${errorText}`);
      }

      const responseJSON = await response.json();
      
      if (!responseJSON.artifacts?.[0]?.base64) {
        throw new Error('No image data received from Stability AI');
      }

      const base64Image = responseJSON.artifacts[0].base64;
      console.log('✅ Image generated, converting and uploading...');

      // ✅ Convert and upload with consistent path structure
      const imageBlob = this.base64ToBlob(base64Image);
      const timestamp = Date.now();
      const filename = `ai-generated-${timestamp}-${Math.random().toString(36).slice(2)}.png`;
      const imageUrl = await this.uploadToSupabase(imageBlob, filename, userId);

      // ✅ FIXED: Consistent storage path like regular images
      const currentTime = new Date().toISOString();
      const imageRecord = {
        url: imageUrl,
        filename: filename,
        original_filename: `${request.prompt.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}.png`,
        storage_path: `${userId}/${filename}`, // ✅ Same structure as regular images
        title: `Generated: ${request.prompt.slice(0, 50)}${request.prompt.length > 50 ? '...' : ''}`,
        description: `AI generated image from prompt: "${request.prompt}"`,
        uploaded_by: userId,
        privacy: 'public',
        album: 'AI Generated',
        tags: ['ai-generated', 'stable-diffusion'],
        author: 'AI Generated',
        camera: 'Stability AI',
        lens: 'SDXL 1.0',
        settings: `${request.width || 1024}x${request.height || 1024}, ${request.steps || 30} steps`,
        license: 'Generated Content',
        mime_type: 'image/png',
        width: request.width || 1024,
        height: request.height || 1024,
        size_bytes: imageBlob.size,
        likes: 0,
        comments: 0,
        view_count: 0,
        like_count: 0,
        created_at: currentTime,
        generation_meta: {
          prompt: request.prompt,
          provider: 'stability_ai',
          model: 'stable-diffusion-xl-1024-v1-0',
          settings: request,
          generated_at: currentTime,
          job_id: jobId
        }
      };

      console.log('💾 Inserting image record with consistent structure...');

      const { data: image, error: imageError } = await supabase
        .from('images')
        .insert(imageRecord)
        .select()
        .single();

      if (imageError) {
        console.error('❌ Failed to save image:', imageError);
        
        // Clean up uploaded file
        const cleanupPath = `${userId}/${filename}`;
        await supabase.storage.from('images').remove([cleanupPath]);
        
        throw new Error(`Database save failed: ${imageError.message}`);
      }

      console.log('✅ Image saved successfully with consistent path:', image.id);

      // ✅ Update job as completed
      await supabase
        .from('ai_jobs')
        .update({
          status: 'completed',
          result_image_id: image.id,
          completed_at: currentTime
        })
        .eq('id', jobId);

      return image;

    } catch (error) {
      console.error('❌ Generation error:', error);
      
      // Update job with error if job was created
      if (jobId) {
        try {
          await supabase
            .from('ai_jobs')
            .update({
              status: 'failed',
              error_message: error instanceof Error ? error.message : String(error),
              completed_at: new Date().toISOString()
            })
            .eq('id', jobId);
        } catch (updateError) {
          console.error('❌ Failed to update job with error:', updateError);
        }
      }

      throw new Error(`AI Generation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private base64ToBlob(base64: string): Blob {
    const cleanBase64 = base64.replace(/^data:image\/[a-z]+;base64,/, '');
    const byteCharacters = atob(cleanBase64);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: 'image/png' });
  }

  // ✅ FIXED: Use same folder structure as regular images
  private async uploadToSupabase(blob: Blob, filename: string, userId: string): Promise<string> {
    // ✅ Create path exactly like regular images: userId/filename
    const filePath = `${userId}/${filename}`;
    
    console.log('📁 Uploading with consistent path structure:', filePath);
    console.log('📊 Blob info:', { size: blob.size, type: blob.type });

    try {
      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, blob, {
          cacheControl: '3600', // Same cache control as regular images
          upsert: false,
          contentType: 'image/png'
        });

      if (error) {
        console.error('❌ Storage upload failed:', error);
        throw new Error(`Storage upload failed: ${error.message}`);
      }

      console.log('✅ Storage upload successful:', data?.path);

      // ✅ Generate public URL using same method as regular images
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      console.log('🔗 Generated consistent public URL:', publicUrl);
      return publicUrl;

    } catch (error) {
      console.error('❌ Upload process failed:', error);
      throw error;
    }
  }

  async getAvailableModels() {
    try {
      const response = await fetch(`${this.baseUrl}/v1/engines/list`, {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Failed to get available models:', error);
      throw error;
    }
  }
}

export const stableDiffusionService = new StableDiffusionService();
