import { logger } from '../utils/logger';
import { TrellisAsset } from './TrellisNimService';

export type JobStatus = 'queued' | 'processing' | 'succeeded' | 'failed';

export interface Job {
  id: string;
  status: JobStatus;
  createdAt: Date;
  updatedAt?: Date;
  imagePaths: string[];
  parameters: any;
  message?: string;
  assets?: TrellisAsset[];
  error?: string;
}

export interface JobUpdate {
  status?: JobStatus;
  message?: string;
  assets?: TrellisAsset[];
  error?: string;
  updatedAt?: Date;
}

export class JobManager {
  private jobs: Map<string, Job> = new Map();
  private readonly MAX_JOBS = 1000; // Maximum number of jobs to keep in memory
  private readonly JOB_CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour

  constructor() {
    // Start periodic cleanup of old jobs
    setInterval(() => {
      this.cleanupOldJobs();
    }, this.JOB_CLEANUP_INTERVAL);
    
    logger.info('JobManager initialized');
  }

  createJob(jobData: Omit<Job, 'updatedAt'>): Job {
    const job: Job = {
      ...jobData,
      updatedAt: new Date()
    };
    
    this.jobs.set(job.id, job);
    logger.info(`Created job ${job.id} with status: ${job.status}`);
    
    // Cleanup if we have too many jobs
    if (this.jobs.size > this.MAX_JOBS) {
      this.cleanupOldJobs(true);
    }
    
    return job;
  }

  getJob(jobId: string): Job | undefined {
    return this.jobs.get(jobId);
  }

  updateJob(jobId: string, update: JobUpdate): Job | null {
    const job = this.jobs.get(jobId);
    if (!job) {
      logger.warn(`Attempted to update non-existent job: ${jobId}`);
      return null;
    }

    const updatedJob: Job = {
      ...job,
      ...update,
      updatedAt: update.updatedAt || new Date()
    };

    this.jobs.set(jobId, updatedJob);
    logger.info(`Updated job ${jobId}: status=${updatedJob.status}, message=${updatedJob.message || 'none'}`);
    
    return updatedJob;
  }

  getAllJobs(): Job[] {
    return Array.from(this.jobs.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  getJobsByStatus(status: JobStatus): Job[] {
    return this.getAllJobs().filter(job => job.status === status);
  }

  deleteJob(jobId: string): boolean {
    const deleted = this.jobs.delete(jobId);
    if (deleted) {
      logger.info(`Deleted job ${jobId}`);
    } else {
      logger.warn(`Attempted to delete non-existent job: ${jobId}`);
    }
    return deleted;
  }

  getJobCount(): number {
    return this.jobs.size;
  }

  getJobStats() {
    const jobs = this.getAllJobs();
    const stats = {
      total: jobs.length,
      queued: 0,
      processing: 0,
      succeeded: 0,
      failed: 0
    };

    jobs.forEach(job => {
      stats[job.status]++;
    });

    return stats;
  }

  private cleanupOldJobs(force: boolean = false) {
    const now = new Date();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    const jobs = this.getAllJobs();
    
    let cleanedCount = 0;
    
    for (const job of jobs) {
      const age = now.getTime() - job.createdAt.getTime();
      const shouldCleanup = force || 
        (age > maxAge && (job.status === 'succeeded' || job.status === 'failed'));
      
      if (shouldCleanup) {
        this.jobs.delete(job.id);
        cleanedCount++;
        
        // If forcing cleanup, only remove the oldest jobs until we're under the limit
        if (force && this.jobs.size <= this.MAX_JOBS * 0.8) {
          break;
        }
      }
    }
    
    if (cleanedCount > 0) {
      logger.info(`Cleaned up ${cleanedCount} old jobs. Current job count: ${this.jobs.size}`);
    }
  }
}
