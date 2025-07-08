import { registerAs } from '@nestjs/config';

// ============================================
// CONFIGURATION INTERFACES
// ============================================

export interface AppConfig {
  port: number;
  environment: string;
  serviceName: string;
  origin: string;
  clientUrl: string;
  serveStaticRootPath: string;
  channelFilterMaxResults: number;
}

export interface DatabaseConfig {
  url: string;
}

export interface RedisConfig {
  host: string;
  port: number;
  username?: string;
  password?: string;
}

export interface RateLimitConfig {
  global: {
    ttl: number;
    limit: number;
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

export interface LoggingConfig {
  level: string;
  requestLogging: boolean;
  prettyPrint: boolean;
}

export interface AuthConfig {
  openAuthIssuer?: string;
  jwtAccessTokenSecret: string;
  jwtAccessTokenExpiration: string;
  jwtRefreshTokenSecret: string;
  jwtRefreshTokenExpiration: string;
  jwtInviteSecret: string;
  encryptionKey: string;
  privateKeyPem: string;
}

export interface GoogleConfig {
  clientId: string;
  clientSecret: string;
}

export interface AwsConfig {
  accessKey: string;
  secretAccessKey: string;
  s3BucketName: string;
  s3Region: string;
  sesAccessKey: string;
  sesSecretAccessKey: string;
}

export interface StripeConfig {
  apiKey: string;
  webhookSecret: string;
  courseWebhookSecret: string;
  productId: string;
  nexlevLiteProductId: string;
  nexlevProProductId: string;
  nexlevProMonthlyPriceId: string;
  nexlevProYearlyPriceId: string;
  nexlevLiteMonthlyPriceId: string;
  nexlevLiteYearlyPriceId: string;
  cancelFlowCouponCode: string;
}

export interface MuxConfig {
  tokenId: string;
  tokenSecret: string;
  webhookSecret?: string;
  signingKeyId?: string;
  privateKey?: string;
}

export interface AiServicesConfig {
  openaiApiKey: string;
  openaiApiKeyImageGen: string;
  geminiApiKey?: string;
  groqApiKey: string;
}

export interface ExternalServicesConfig {
  rapidApiKey: string;
  kitApiKey: string;
  youtubeApiKeyEncryptionKey?: string;
}

// ============================================
// CONFIGURATION FACTORIES
// ============================================

export const appConfig = registerAs(
  'app',
  (): AppConfig => ({
    port: parseInt(process.env.PORT || '3000', 10),
    environment: process.env.NODE_ENV || 'development',
    serviceName: process.env.SERVICE_NAME || 'nexlev-analytics-api',
    origin: process.env.ORIGIN || 'http://localhost:3000',
    clientUrl: process.env.CLIENT_URL || 'http://localhost:3001',
    serveStaticRootPath: process.env.SERVE_STATIC_ROOT_PATH || 'client',
    channelFilterMaxResults: parseInt(
      process.env.CHANNEL_FILTER_MAX_RESULTS || '250',
      10,
    ),
  }),
);

export const databaseConfig = registerAs(
  'database',
  (): DatabaseConfig => ({
    url:
      process.env.MONGODB_URI || 'mongodb://localhost:27017/nexlev-extension',
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
      ttl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10),
      limit: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    },
    auth: {
      ttl: parseInt(process.env.AUTH_RATE_LIMIT_TTL || '900', 10),
      limit: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '5', 10),
    },
    api: {
      ttl: parseInt(process.env.API_RATE_LIMIT_TTL || '60', 10),
      limit: parseInt(process.env.API_RATE_LIMIT_MAX || '60', 10),
    },
    upload: {
      ttl: parseInt(process.env.UPLOAD_RATE_LIMIT_TTL || '3600', 10),
      limit: parseInt(process.env.UPLOAD_RATE_LIMIT_MAX || '10', 10),
    },
  }),
);

export const loggingConfig = registerAs(
  'logging',
  (): LoggingConfig => ({
    level: process.env.LOG_LEVEL || 'info',
    requestLogging: process.env.LOG_REQUEST === 'true',
    prettyPrint: process.env.PINO_PRETTY === 'true',
  }),
);

export const authConfig = registerAs(
  'auth',
  (): AuthConfig => ({
    openAuthIssuer: process.env.OPEN_AUTH_ISSUER,
    jwtAccessTokenSecret: process.env.JWT_ACCESS_TOKEN_SECRET || '',
    jwtAccessTokenExpiration: process.env.JWT_ACCESS_TOKEN_EXPIRATION || '90d',
    jwtRefreshTokenSecret: process.env.JWT_REFRESH_TOKEN_SECRET || '',
    jwtRefreshTokenExpiration:
      process.env.JWT_REFRESH_TOKEN_EXPIRATION || '365d',
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

export const awsConfig = registerAs(
  'aws',
  (): AwsConfig => ({
    accessKey: process.env.AWS_ACCESS_KEY || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    s3BucketName: process.env.AWS_S3_BUCKET_NAME || 'nexlev-analytics-assets',
    s3Region: process.env.AWS_S3_REGION || 'eu-central-1',
    sesAccessKey: process.env.AWS_SES_ACCESS_KEY || '',
    sesSecretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY || '',
  }),
);

export const stripeConfig = registerAs(
  'stripe',
  (): StripeConfig => ({
    apiKey: process.env.STRIPE_API_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    courseWebhookSecret: process.env.STRIPE_COURSE_WEBHOOK_SECRET || '',
    productId: process.env.STRIPE_PRODUCT_ID || 'prod_Qs1DcNKP14zdoI',
    nexlevLiteProductId: process.env.NEXLEV_LITE_PRODUCT_ID || '',
    nexlevProProductId: process.env.NEXLEV_PRO_PRODUCT_ID || '',
    nexlevProMonthlyPriceId: process.env.NEXLEV_PRO_MONTHLY_PRICE_ID || '',
    nexlevProYearlyPriceId: process.env.NEXLEV_PRO_YEARLY_PRICE_ID || '',
    nexlevLiteMonthlyPriceId: process.env.NEXLEV_LITE_MONTHLY_PRICE_ID || '',
    nexlevLiteYearlyPriceId: process.env.NEXLEV_LITE_YEARLY_PRICE_ID || '',
    cancelFlowCouponCode: process.env.CANCEL_FLOW_COUPON_CODE || '',
  }),
);

export const muxConfig = registerAs(
  'mux',
  (): MuxConfig => ({
    tokenId: process.env.MUX_TOKEN_ID || '',
    tokenSecret: process.env.MUX_TOKEN_SECRET || '',
    webhookSecret: process.env.MUX_WEBHOOK_SECRET,
    signingKeyId: process.env.MUX_SIGNING_KEY_ID,
    privateKey: process.env.MUX_PRIVATE_KEY,
  }),
);

export const aiServicesConfig = registerAs(
  'aiServices',
  (): AiServicesConfig => ({
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    openaiApiKeyImageGen: process.env.OPENAI_API_KEY_IMAGE_GEN || '',
    geminiApiKey: process.env.GEMINI_API_KEY,
    groqApiKey: process.env.GROQ_API_KEY || '',
  }),
);

export const externalServicesConfig = registerAs(
  'externalServices',
  (): ExternalServicesConfig => ({
    rapidApiKey: process.env.RAPIDAPI_KEY || '',
    kitApiKey: process.env.KIT_API_KEY || '',
    youtubeApiKeyEncryptionKey: process.env.YOUTUBE_API_KEY_ENCRYPTION_KEY,
  }),
);

// ============================================
// ENVIRONMENT VALIDATION
// ============================================

/**
 * Validates essential environment variables required for the application to start.
 * This is a lightweight validation that runs before the full class-validator validation.
 */
export function validateEssentialEnv(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const requiredVars = ['NODE_ENV', 'PORT', 'SERVICE_NAME', 'MONGODB_URI'];

  const missingVars = requiredVars.filter((varName) => !config[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
        'Please check your .env file and ensure all required variables are set.',
    );
  }

  return config;
}

/**
 * Validates environment variables that are required for specific features.
 * This is called after the application starts to warn about missing optional configs.
 */
export function validateFeatureEnv(): void {
  const warnings: string[] = [];

  // Authentication warnings
  if (!process.env.JWT_ACCESS_TOKEN_SECRET) {
    warnings.push(
      'JWT_ACCESS_TOKEN_SECRET is not set - authentication will not work',
    );
  }

  if (!process.env.JWT_REFRESH_TOKEN_SECRET) {
    warnings.push(
      'JWT_REFRESH_TOKEN_SECRET is not set - refresh tokens will not work',
    );
  }

  if (!process.env.ENCRYPTION_KEY) {
    warnings.push('ENCRYPTION_KEY is not set - data encryption will not work');
  }

  // Google OAuth warnings
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    warnings.push(
      'Google OAuth credentials are not set - Google authentication will not work',
    );
  }

  // Payment warnings
  if (!process.env.STRIPE_API_KEY) {
    warnings.push(
      'STRIPE_API_KEY is not set - payment processing will not work',
    );
  }

  // AI Services warnings
  if (!process.env.OPENAI_API_KEY) {
    warnings.push('OPENAI_API_KEY is not set - AI features will not work');
  }

  if (warnings.length > 0 && process.env.NODE_ENV !== 'test') {
    console.warn('⚠️  Configuration warnings:');
    warnings.forEach((warning) => console.warn(`   - ${warning}`));
    console.warn('');
  }
}
