import { Router } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';
import { TrellisNimService } from '../services/TrellisNimService';
import { JobManager } from '../services/JobManager';
import { logger } from '../utils/logger';
import { validateGenerationRequest } from '../utils/validation';

const router = Router();
const jobManager = new JobManager();
const trellisService = new TrellisNimService();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/images');
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    files: 10 // Maximum 10 files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PNG, JPEG, JPG, and WEBP are allowed.'));
    }
  }
});

export function createJobRoutes(): Router {
  // Submit a new generation job
  router.post('/', upload.array('images', 10), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({
          error: 'No images provided',
          message: 'At least one image is required for 3D generation'
        });
      }

      // Parse and validate generation parameters
      const generationParams = {
        meshFormat: req.body.meshFormat || 'glb',
        textureFormat: req.body.textureFormat || 'png',
        seed: req.body.seed ? parseInt(req.body.seed) : 0,
        noTexture: req.body.noTexture === 'true',
        slatCfgScale: req.body.slatCfgScale ? parseFloat(req.body.slatCfgScale) : 3,
        ssCfgScale: req.body.ssCfgScale ? parseFloat(req.body.ssCfgScale) : 7.5,
        slatSamplingSteps: req.body.slatSamplingSteps ? parseInt(req.body.slatSamplingSteps) : 25,
        ssSamplingSteps: req.body.ssSamplingSteps ? parseInt(req.body.ssSamplingSteps) : 25,
      };

      const validationError = validateGenerationRequest(generationParams);
      if (validationError) {
        return res.status(400).json({
          error: 'Invalid parameters',
          message: validationError
        });
      }

      const jobId = uuidv4();
      
      // Create job entry
      const job = jobManager.createJob({
        id: jobId,
        status: 'queued',
        createdAt: new Date(),
        imagePaths: files.map(f => f.path),
        parameters: generationParams
      });

      logger.info(`Created job ${jobId} with ${files.length} images`);
      
      // Start processing asynchronously
      processJobAsync(jobId, files, generationParams);

      res.status(202).json({
        jobId,
        status: 'queued',
        message: 'Job submitted successfully. Processing will begin shortly.'
      });

    } catch (error) {
      logger.error('Error submitting job:', error);
      res.status(500).json({
        error: 'Failed to submit job',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Submit job with base64 images (compatible with existing frontend)
  router.post('/base64', async (req, res) => {
    try {
      const { images, ...params } = req.body;
      
      if (!images || !Array.isArray(images) || images.length === 0) {
        return res.status(400).json({
          error: 'No images provided',
          message: 'At least one base64 image is required'
        });
      }

      const generationParams = {
        meshFormat: params.meshFormat || 'glb',
        textureFormat: params.textureFormat || 'png',
        seed: params.seed || 0,
        noTexture: params.noTexture || false,
        slatCfgScale: params.slatCfgScale || 3,
        ssCfgScale: params.ssCfgScale || 7.5,
        slatSamplingSteps: params.slatSamplingSteps || 25,
        ssSamplingSteps: params.ssSamplingSteps || 25,
      };

      const validationError = validateGenerationRequest(generationParams);
      if (validationError) {
        return res.status(400).json({
          error: 'Invalid parameters',
          message: validationError
        });
      }

      const jobId = uuidv4();
      
      // Convert base64 images to files
      const imagePaths = await Promise.all(
        images.map(async (base64Image: string, index: number) => {
          const buffer = Buffer.from(base64Image.split(',')[1], 'base64');
          const filename = `${jobId}-image-${index}.png`;
          const imagePath = path.join(__dirname, '../../uploads/images', filename);
          await fs.mkdir(path.dirname(imagePath), { recursive: true });
          await fs.writeFile(imagePath, buffer);
          return imagePath;
        })
      );

      // Create job entry
      const job = jobManager.createJob({
        id: jobId,
        status: 'queued',
        createdAt: new Date(),
        imagePaths,
        parameters: generationParams
      });

      logger.info(`Created base64 job ${jobId} with ${images.length} images`);
      
      // Start processing asynchronously
      processJobAsync(jobId, imagePaths.map(p => ({ path: p })), generationParams);

      res.status(202).json({
        jobId,
        status: 'queued',
        message: 'Job submitted successfully. Processing will begin shortly.'
      });

    } catch (error) {
      logger.error('Error submitting base64 job:', error);
      res.status(500).json({
        error: 'Failed to submit job',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get job status
  router.get('/:jobId', (req, res) => {
    try {
      const { jobId } = req.params;
      const job = jobManager.getJob(jobId);
      
      if (!job) {
        return res.status(404).json({
          error: 'Job not found',
          message: `No job found with ID: ${jobId}`
        });
      }

      // Convert internal job format to API response format
      const response = {
        jobId: job.id,
        status: job.status,
        message: job.message,
        assets: job.assets,
        error: job.error,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt
      };

      res.json(response);
    } catch (error) {
      logger.error('Error getting job status:', error);
      res.status(500).json({
        error: 'Failed to get job status',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // List all jobs (for debugging/admin purposes)
  router.get('/', (req, res) => {
    try {
      const jobs = jobManager.getAllJobs();
      res.json({ jobs });
    } catch (error) {
      logger.error('Error listing jobs:', error);
      res.status(500).json({
        error: 'Failed to list jobs',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  return router;
}

// Async job processing function
async function processJobAsync(
  jobId: string, 
  files: (Express.Multer.File | { path: string })[], 
  params: any
) {
  try {
    jobManager.updateJob(jobId, { 
      status: 'processing', 
      message: 'Initializing Trellis NIM processing...',
      updatedAt: new Date()
    });

    // Submit to Trellis NIM service
    const result = await trellisService.generateModel(files.map(f => f.path), params);
    
    if (result.success && result.assets) {
      jobManager.updateJob(jobId, {
        status: 'succeeded',
        message: 'Model generation completed successfully',
        assets: result.assets,
        updatedAt: new Date()
      });
      logger.info(`Job ${jobId} completed successfully`);
    } else {
      jobManager.updateJob(jobId, {
        status: 'failed',
        error: result.error || 'Unknown error during model generation',
        updatedAt: new Date()
      });
      logger.error(`Job ${jobId} failed: ${result.error}`);
    }
  } catch (error) {
    logger.error(`Error processing job ${jobId}:`, error);
    jobManager.updateJob(jobId, {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      updatedAt: new Date()
    });
  } finally {
    // Clean up uploaded images after processing
    try {
      await Promise.all(files.map(f => fs.unlink(f.path).catch(() => {})));
    } catch (cleanupError) {
      logger.warn(`Failed to clean up uploaded files for job ${jobId}:`, cleanupError);
    }
  }
}
