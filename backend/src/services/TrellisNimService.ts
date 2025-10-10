import axios, { AxiosInstance } from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

export interface TrellisAsset {
  id: string;
  type: string;
  url: string;
  sizeMB?: number;
  previewImageUrl?: string;
}

export interface GenerationResult {
  success: boolean;
  assets?: TrellisAsset[];
  error?: string;
}

export interface GenerationParameters {
  meshFormat?: string;
  textureFormat?: string;
  seed?: number;
  noTexture?: boolean;
  slatCfgScale?: number;
  ssCfgScale?: number;
  slatSamplingSteps?: number;
  ssSamplingSteps?: number;
}

export class TrellisNimService {
  private client: AxiosInstance;
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.TRELLIS_NIM_URL || 'http://localhost:8080';
    this.apiKey = process.env.TRELLIS_NIM_API_KEY || '';
    
    if (!this.apiKey) {
      logger.warn('TRELLIS_NIM_API_KEY not provided. Some features may not work.');
    }

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000, // 30 second timeout for requests
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
      }
    });

    logger.info(`Trellis NIM Service initialized with base URL: ${this.baseUrl}`);
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.client.get('/health', { timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      logger.error('Trellis NIM health check failed:', error);
      return false;
    }
  }

  async generateModel(imagePaths: string[], params: GenerationParameters): Promise<GenerationResult> {
    try {
      logger.info(`Starting 3D generation with ${imagePaths.length} images`);
      
      // Convert image files to base64
      const images = await Promise.all(
        imagePaths.map(async (imagePath) => {
          const imageBuffer = await fs.readFile(imagePath);
          const base64 = imageBuffer.toString('base64');
          const mimeType = this.getMimeType(imagePath);
          return `data:${mimeType};base64,${base64}`;
        })
      );

      // Prepare the request payload according to Trellis NIM API spec
      const payload = {
        images,
        mesh_format: params.meshFormat || 'glb',
        texture_format: params.textureFormat || 'png',
        seed: params.seed || 0,
        no_texture: params.noTexture || false,
        slat_cfg_scale: params.slatCfgScale || 3,
        ss_cfg_scale: params.ssCfgScale || 7.5,
        slat_sampling_steps: params.slatSamplingSteps || 25,
        ss_sampling_steps: params.ssSamplingSteps || 25,
      };

      logger.info('Submitting generation request to Trellis NIM...');
      
      // Submit the generation request
      const response = await this.client.post('/generate', payload, {
        timeout: 300000 // 5 minute timeout for generation
      });

      if (response.status !== 200) {
        throw new Error(`Trellis NIM returned status ${response.status}: ${response.statusText}`);
      }

      const result = response.data;
      
      // Process the response and save assets locally
      const assets = await this.processGenerationResult(result);
      
      logger.info(`3D generation completed successfully. Generated ${assets.length} assets.`);
      
      return {
        success: true,
        assets
      };

    } catch (error) {
      logger.error('Error during 3D model generation:', error);
      
      let errorMessage = 'Unknown error during model generation';
      if (axios.isAxiosError(error)) {
        if (error.response) {
          errorMessage = `Trellis NIM API error: ${error.response.status} - ${error.response.data?.error || error.response.statusText}`;
        } else if (error.request) {
          errorMessage = 'Failed to connect to Trellis NIM service. Please ensure the Docker container is running.';
        } else {
          errorMessage = `Request setup error: ${error.message}`;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  private async processGenerationResult(result: any): Promise<TrellisAsset[]> {
    const assets: TrellisAsset[] = [];
    const modelsDir = path.join(__dirname, '../../uploads/models');
    
    // Ensure models directory exists
    await fs.mkdir(modelsDir, { recursive: true });

    try {
      // Process GLB model if present
      if (result.model_data) {
        const assetId = uuidv4();
        const filename = `model-${assetId}.glb`;
        const filePath = path.join(modelsDir, filename);
        
        // Decode base64 model data and save to file
        const modelBuffer = Buffer.from(result.model_data, 'base64');
        await fs.writeFile(filePath, modelBuffer);
        
        const stats = await fs.stat(filePath);
        const sizeMB = stats.size / (1024 * 1024);
        
        assets.push({
          id: assetId,
          type: 'glb',
          url: `/downloads/${filename}`,
          sizeMB: parseFloat(sizeMB.toFixed(2))
        });
        
        logger.info(`Saved GLB model: ${filename} (${sizeMB.toFixed(2)} MB)`);
      }

      // Process texture images if present
      if (result.texture_data && !result.no_texture) {
        const assetId = uuidv4();
        const filename = `texture-${assetId}.png`;
        const filePath = path.join(modelsDir, filename);
        
        const textureBuffer = Buffer.from(result.texture_data, 'base64');
        await fs.writeFile(filePath, textureBuffer);
        
        const stats = await fs.stat(filePath);
        const sizeMB = stats.size / (1024 * 1024);
        
        assets.push({
          id: assetId,
          type: 'texture',
          url: `/downloads/${filename}`,
          sizeMB: parseFloat(sizeMB.toFixed(2))
        });
        
        logger.info(`Saved texture: ${filename} (${sizeMB.toFixed(2)} MB)`);
      }

      // Process preview images if present
      if (result.preview_images && Array.isArray(result.preview_images)) {
        for (let i = 0; i < result.preview_images.length; i++) {
          const assetId = uuidv4();
          const filename = `preview-${assetId}-${i}.png`;
          const filePath = path.join(modelsDir, filename);
          
          const previewBuffer = Buffer.from(result.preview_images[i], 'base64');
          await fs.writeFile(filePath, previewBuffer);
          
          const stats = await fs.stat(filePath);
          const sizeMB = stats.size / (1024 * 1024);
          
          assets.push({
            id: assetId,
            type: 'preview',
            url: `/downloads/${filename}`,
            sizeMB: parseFloat(sizeMB.toFixed(2))
          });
          
          logger.info(`Saved preview image: ${filename} (${sizeMB.toFixed(2)} MB)`);
        }
      }

    } catch (error) {
      logger.error('Error processing generation result:', error);
      throw new Error('Failed to process generated assets');
    }

    return assets;
  }

  private getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
      case '.png': return 'image/png';
      case '.jpg':
      case '.jpeg': return 'image/jpeg';
      case '.webp': return 'image/webp';
      default: return 'image/png';
    }
  }
}

"""
Insert API Credentials here

To use this service, you need to set the following environment variables:

1. TRELLIS_NIM_URL - The URL where your Trellis NIM Docker container is running (default: http://localhost:8080)
2. TRELLIS_NIM_API_KEY - Your NVIDIA API key for authenticating with the Trellis NIM service

Example in your .env file:
TRELLIS_NIM_URL=http://localhost:8080
TRELLIS_NIM_API_KEY=your_nvidia_api_key_here
"""
