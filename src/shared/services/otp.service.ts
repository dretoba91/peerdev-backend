import crypto from 'crypto';
import redis from '../../config/redis';
import { logger } from '../utils/loggers';


const OTP_TTL_SECONDS = 600; // 10 minutes
const OTP_LENGTH     = 6;

export class OtpService {

  // Generate a cryptographically secure OTP
  private generateCode(): string {
    const max  = Math.pow(10, OTP_LENGTH);   // 1_000_000
    const code = crypto.randomInt(0, max);    // cryptographically secure
    return code.toString().padStart(OTP_LENGTH, '0');
  }

  // Store OTP in Redis with TTL
  async generateAndStore(userId: string): Promise<string> {
    const code = this.generateCode();
    const key  = `otp:${userId}`;

    await redis.set(key, code, 'EX', OTP_TTL_SECONDS);
    logger.info(`OTP stored for user: ${userId}`);

    return code;
  }

  // Verify OTP — deletes it after successful verification (single use)
  async verify(userId: string, code: string): Promise<boolean> {
    const key    = `otp:${userId}`;
    const stored = await redis.get(key);

    // Not found → expired or never existed
    if (!stored) return false;

    // Wrong code
    if (stored !== code) return false;

    // Correct — delete immediately (single use enforcement)
    await redis.del(key);
    return true;
  }

  // Invalidate OTP manually (e.g. user requests a new one)
  async invalidate(userId: string): Promise<void> {
    await redis.del(`otp:${userId}`);
  }
}

export default new OtpService();
