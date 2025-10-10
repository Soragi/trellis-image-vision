import fs from 'fs/promises';
import path from 'path';
import { logger } from './logger';

export async function createUploadsDir(): Promise<void> {
  const uploadsDir = path.join(__dirname, '../../uploads');
  const imagesDir = path.join(uploadsDir, 'images');
  const modelsDir = path.join(uploadsDir, 'models');
  const logsDir = path.join(__dirname, '../../logs');

  try {
    await fs.mkdir(uploadsDir, { recursive: true });
    await fs.mkdir(imagesDir, { recursive: true });
    await fs.mkdir(modelsDir, { recursive: true });
    await fs.mkdir(logsDir, { recursive: true });
    
    logger.info('Created upload directories successfully');
  } catch (error) {
    logger.error('Failed to create upload directories:', error);
    throw error;
  }
}

export async function cleanupFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
    logger.debug(`Cleaned up file: ${filePath}`);
  } catch (error) {
    logger.warn(`Failed to cleanup file ${filePath}:`, error);
  }
}

export async function getFileSize(filePath: string): Promise<number> {
  try {
    const stats = await fs.stat(filePath);
    return stats.size;
  } catch (error) {
    logger.error(`Failed to get file size for ${filePath}:`, error);
    return 0;
  }
}

export function getFileSizeMB(sizeBytes: number): number {
  return parseFloat((sizeBytes / (1024 * 1024)).toFixed(2));
}
