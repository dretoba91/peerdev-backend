
import type { StringValue } from "ms";

interface EnvironmentConfig {
    // JWT
  JWT_SECRET: string;
  JWT_EXPIRE: StringValue;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRE: StringValue;
}

export const environment: EnvironmentConfig = {
  JWT_SECRET: process.env.JWT_SECRET || 'secret',
  JWT_EXPIRE: (process.env.JWT_EXPIRE || '4h') as StringValue,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'refresh_secret',
  JWT_REFRESH_EXPIRE: (process.env.JWT_REFRESH_EXPIRE || '7d') as StringValue,
};

export const config = environment;