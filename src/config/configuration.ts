import { registerAs } from '@nestjs/config';

export interface DatabaseConfig {
  url: string;
}

export interface AuthConfig {
  jwtAccessTokenSecret: string;
  jwtRefreshTokenSecret: string;
  jwtInviteSecret: string;
  encryptionKey: string;
  privateKeyPem: string;
}

export interface GoogleConfig {
  clientId: string;
  clientSecret: string;
}

export interface AppConfig {
  port: number;
  environment: string;
  serviceName: string;
  origin: string;
  clientUrl: string;
  serveStaticRootPath: string;
}

export interface RedisConfig {
  host: string;
  port: number;
  username?: string;
  password?: string;
}

export interface RateLimitConfig {
  global: {
    ttl: number; // seconds
    limit: number; // requests per ttl
  };
  auth: {
    ttl: number;
    limit: number;
  };
  api: {
    ttl: number;
    limit: number;
  };
  upload: {
    ttl: number;
    limit: number;
  };
}

export const databaseConfig = registerAs(
  'database',
  (): DatabaseConfig => ({
    url:
      process.env.MONGODB_URI || 'mongodb://localhost:27017/nexlev-extension',
  }),
);

export const authConfig = registerAs(
  'auth',
  (): AuthConfig => ({
    jwtAccessTokenSecret: process.env.JWT_ACCESS_TOKEN_SECRET || '',
    jwtRefreshTokenSecret: process.env.JWT_REFRESH_TOKEN_SECRET || '',
    jwtInviteSecret: process.env.JWT_INVITE_SECRET || 'your-secret_key',
    encryptionKey: process.env.ENCRYPTION_KEY || '',
    privateKeyPem: process.env.PRIVATE_KEY_PEM || '',
  }),
);

export const googleConfig = registerAs(
  'google',
  (): GoogleConfig => ({
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  }),
);

export const appConfig = registerAs(
  'app',
  (): AppConfig => ({
    port: parseInt(process.env.PORT || '3000', 10),
    environment: process.env.NODE_ENV || 'development',
    serviceName: process.env.SERVICE_NAME || 'nexlev-analytics-api',
    origin: process.env.ORIGIN || 'http://localhost:3000',
    clientUrl: process.env.CLIENT_URL || 'http://localhost:3001',
    serveStaticRootPath: process.env.SERVE_STATIC_ROOT_PATH || 'client',
  }),
);

export const redisConfig = registerAs(
  'redis',
  (): RedisConfig => ({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
  }),
);

export const rateLimitConfig = registerAs(
  'rateLimit',
  (): RateLimitConfig => ({
    global: {
      ttl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10), // 1 minute
      limit: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // 100 requests per minute
    },
    auth: {
      ttl: parseInt(process.env.AUTH_RATE_LIMIT_TTL || '900', 10), // 15 minutes
      limit: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '5', 10), // 5 attempts per 15 minutes
    },
    api: {
      ttl: parseInt(process.env.API_RATE_LIMIT_TTL || '60', 10), // 1 minute
      limit: parseInt(process.env.API_RATE_LIMIT_MAX || '60', 10), // 60 requests per minute
    },
    upload: {
      ttl: parseInt(process.env.UPLOAD_RATE_LIMIT_TTL || '3600', 10), // 1 hour
      limit: parseInt(process.env.UPLOAD_RATE_LIMIT_MAX || '10', 10), // 10 uploads per hour
    },
  }),
);

// Simple validation function for essential environment variables
export function validateEssentialEnv(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const requiredVars = ['NODE_ENV', 'PORT', 'SERVICE_NAME', 'MONGODB_URI'];

  const missingVars = requiredVars.filter((varName) => !config[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`,
    );
  }

  return config;
}
