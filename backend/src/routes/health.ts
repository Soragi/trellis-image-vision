import { Router } from 'express';
import { TrellisNimService } from '../services/TrellisNimService';
import { logger } from '../utils/logger';

const router = Router();

export function createHealthRoutes(): Router {
  // Basic health check
  router.get('/', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Deep health check including Trellis NIM connectivity
  router.get('/deep', async (req, res) => {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        trellisNim: 'unknown'
      }
    };

    try {
      const trellisService = new TrellisNimService();
      const nimStatus = await trellisService.checkHealth();
      healthStatus.services.trellisNim = nimStatus ? 'healthy' : 'unhealthy';
      
      if (!nimStatus) {
        healthStatus.status = 'degraded';
      }
    } catch (error) {
      logger.error('Health check error:', error);
      healthStatus.services.trellisNim = 'unhealthy';
      healthStatus.status = 'degraded';
    }

    const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(healthStatus);
  });

  return router;
}
