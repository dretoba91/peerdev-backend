import Redis from 'ioredis';
import { logger } from '../shared/utils/loggers';

const redis = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number(process.env.REDIS_PORT) || 6379,
  retryStrategy: (times) => {
    // Retry connection with backoff — stops after 10 attempts
    if (times > 10) {
      logger.error('Redis connection failed after 10 attempts');
      return null;
    }
    return Math.min(times * 100, 3000);
  },
});

redis.on('connect', () => logger.info('✅ Redis connected'));
redis.on('error',   (err) => logger.error('❌ Redis error:', err));

export default redis;