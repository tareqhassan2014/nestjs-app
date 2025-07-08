import { plainToClass } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  validateSync,
} from 'class-validator';

import { Description } from '@/util/description.decorator';

export enum Environment {
  TEST = 'test',
  PROVISION = 'provision',
  PRODUCTION = 'production',
  DEVELOPMENT = 'development',
}

export class EnvironmentVariables {
  // ============================================
  // APPLICATION CONFIGURATION
  // ============================================

  @Description(
    'The environment the application is running in (e.g., development, production, test)',
  )
  @IsEnum(Environment)
  NODE_ENV: Environment = Environment.DEVELOPMENT;

  @Description('The name of the service, used for logging and monitoring')
  @IsString()
  SERVICE_NAME: string = 'nexlev-analytics-api';

  @Description('The port number the application should listen on')
  @IsNumber()
  @Min(0)
  @Max(65535)
  PORT: number = 3000;

  @Description('Server origin URL for CORS configuration')
  @IsString()
  ORIGIN: string = 'http://localhost:3000';

  @Description('The base URL for the client application')
  @IsString()
  @IsUrl({ protocols: ['http', 'https'], require_tld: false })
  CLIENT_URL: string = 'http://localhost:3001';

  @Description('The root directory path for serving static files')
  @IsString()
  SERVE_STATIC_ROOT_PATH: string = 'client';

  @Description('Maximum results for channel filtering operations')
  @IsNumber()
  @Min(150)
  @Max(500)
  CHANNEL_FILTER_MAX_RESULTS: number = 250;

  // ============================================
  // RATE LIMITING CONFIGURATION
  // ============================================

  @Description('Global rate limit TTL (time-to-live) in seconds')
  @IsNumber()
  @Min(1)
  @Max(3600)
  @IsOptional()
  RATE_LIMIT_TTL?: number = 60;

  @Description('Global rate limit maximum requests per TTL window')
  @IsNumber()
  @Min(1)
  @Max(10000)
  @IsOptional()
  RATE_LIMIT_MAX?: number = 100;

  @Description('Authentication rate limit TTL in seconds')
  @IsNumber()
  @Min(1)
  @Max(3600)
  @IsOptional()
  AUTH_RATE_LIMIT_TTL?: number = 900;

  @Description('Authentication rate limit maximum attempts per TTL window')
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  AUTH_RATE_LIMIT_MAX?: number = 5;

  @Description('API rate limit TTL in seconds')
  @IsNumber()
  @Min(1)
  @Max(3600)
  @IsOptional()
  API_RATE_LIMIT_TTL?: number = 60;

  @Description('API rate limit maximum requests per TTL window')
  @IsNumber()
  @Min(1)
  @Max(1000)
  @IsOptional()
  API_RATE_LIMIT_MAX?: number = 60;

  @Description('Upload rate limit TTL in seconds')
  @IsNumber()
  @Min(1)
  @Max(86400)
  @IsOptional()
  UPLOAD_RATE_LIMIT_TTL?: number = 3600;

  @Description('Upload rate limit maximum uploads per TTL window')
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  UPLOAD_RATE_LIMIT_MAX?: number = 10;

  // ============================================
  // LOGGING CONFIGURATION
  // ============================================

  @Description(
    'The log level for application logging (e.g., info, debug, error)',
  )
  @IsString()
  @IsOptional()
  LOG_LEVEL?: string = 'info';

  @Description('Enable detailed logging of HTTP requests')
  @IsBoolean()
  @IsOptional()
  LOG_REQUEST?: boolean = false;

  @Description(
    'Enable pretty-printed logs for easier readability in development',
  )
  @IsBoolean()
  @IsOptional()
  PINO_PRETTY?: boolean = false;

  // ============================================
  // DATABASE CONFIGURATION
  // ============================================

  @Description('The MongoDB connection URI used to connect to the database')
  @IsString()
  MONGODB_URI: string = 'mongodb://localhost:27017/nexlev-extension';

  // ============================================
  // REDIS CONFIGURATION
  // ============================================

  @Description('Redis server hostname for caching and rate limiting')
  @IsString()
  REDIS_HOST: string = 'localhost';

  @Description('Redis server port number')
  @IsNumber()
  @Min(0)
  @Max(65535)
  REDIS_PORT: number = 6379;

  @Description('Redis server username for authentication (if required)')
  @IsString()
  @IsOptional()
  REDIS_USERNAME?: string = undefined;

  @Description('Redis server password for authentication (if required)')
  @IsString()
  @IsOptional()
  REDIS_PASSWORD?: string = undefined;

  // ============================================
  // AUTHENTICATION & SECURITY
  // ============================================

  @Description('OpenAuth issuer URL (This is the URL of the OpenAuth server)')
  @IsString()
  @IsOptional()
  OPEN_AUTH_ISSUER?: string = undefined;

  @Description('Google OAuth Client ID used for authentication')
  @IsString()
  GOOGLE_CLIENT_ID: string = undefined;

  @Description('Google OAuth Client Secret used for authentication')
  @IsString()
  GOOGLE_CLIENT_SECRET: string = undefined;

  @Description('JWT secret key used to sign access tokens')
  @IsString()
  JWT_ACCESS_TOKEN_SECRET: string = undefined;

  @Description('JWT access token expiration in seconds')
  @IsString()
  JWT_ACCESS_TOKEN_EXPIRATION: string = '90d';

  @Description('JWT secret key used to sign refresh tokens')
  @IsString()
  JWT_REFRESH_TOKEN_SECRET: string = undefined;

  @Description('JWT refresh token expiration in seconds')
  @IsString()
  JWT_REFRESH_TOKEN_EXPIRATION: string = '365d';

  @Description('JWT secret key used to sign invite tokens')
  @IsString()
  JWT_INVITE_SECRET: string = 'your-secret_key';

  @Description('Private RSA key in PEM format, used for signing sensitive data')
  @IsString()
  PRIVATE_KEY_PEM: string = undefined;

  @Description('Encryption key for sensitive data')
  @IsString()
  ENCRYPTION_KEY: string = undefined;

  @Description('Encryption key specifically for YouTube API keys storage')
  @IsString()
  @IsOptional()
  YOUTUBE_API_KEY_ENCRYPTION_KEY?: string = undefined;

  // ============================================
  // AWS SERVICES
  // ============================================

  @Description('AWS access key for S3 and other AWS services')
  @IsString()
  AWS_ACCESS_KEY: string = undefined;

  @Description('AWS secret access key for S3 and other AWS services')
  @IsString()
  AWS_SECRET_ACCESS_KEY: string = undefined;

  @Description('AWS S3 bucket name for storing assets and files')
  @IsString()
  AWS_S3_BUCKET_NAME: string = 'nexlev-analytics-assets';

  @Description('AWS S3 bucket region')
  @IsString()
  AWS_S3_REGION: string = 'eu-central-1';

  @Description('AWS SES access key for email services')
  @IsString()
  AWS_SES_ACCESS_KEY: string = undefined;

  @Description('AWS SES secret access key for email services')
  @IsString()
  AWS_SES_SECRET_ACCESS_KEY: string = undefined;

  // ============================================
  // STRIPE PAYMENT CONFIGURATION
  // ============================================

  @Description('Stripe API key for payment processing')
  @IsString()
  STRIPE_API_KEY: string = undefined;

  @Description('Stripe webhook secret for verifying incoming events')
  @IsString()
  STRIPE_WEBHOOK_SECRET: string = undefined;

  @Description(
    'Stripe webhook secret for verifying course payment webhook events',
  )
  @IsString()
  STRIPE_COURSE_WEBHOOK_SECRET: string = undefined;

  @Description('Stripe product ID for main subscription handling')
  @IsString()
  STRIPE_PRODUCT_ID: string = 'prod_Qs1DcNKP14zdoI';

  @Description('Stripe product ID for NexLev Lite subscription')
  @IsString()
  NEXLEV_LITE_PRODUCT_ID: string = undefined;

  @Description('Stripe product ID for NexLev Pro subscription')
  @IsString()
  NEXLEV_PRO_PRODUCT_ID: string = undefined;

  @Description('Nexlev Pro Monthly Price ID')
  @IsString()
  NEXLEV_PRO_MONTHLY_PRICE_ID: string = undefined;

  @Description('Nexlev Pro Yearly Price ID')
  @IsString()
  NEXLEV_PRO_YEARLY_PRICE_ID: string = undefined;

  @Description('Nexlev Lite Monthly Price ID')
  @IsString()
  NEXLEV_LITE_MONTHLY_PRICE_ID: string = undefined;

  @Description('Nexlev Lite Yearly Price ID')
  @IsString()
  NEXLEV_LITE_YEARLY_PRICE_ID: string = undefined;

  @Description('Coupon code for cancel flow handling')
  @IsString()
  CANCEL_FLOW_COUPON_CODE: string = undefined;

  // ============================================
  // MUX VIDEO CONFIGURATION
  // ============================================

  @Description('Mux API Token ID for video uploading and streaming')
  @IsString()
  MUX_TOKEN_ID: string = undefined;

  @Description('Mux API Token Secret for video uploading and streaming')
  @IsString()
  MUX_TOKEN_SECRET: string = undefined;

  @Description('Mux Webhook Secret for verifying webhook events')
  @IsString()
  @IsOptional()
  MUX_WEBHOOK_SECRET?: string = undefined;

  @Description(
    'Mux Signing Key ID for generating signed URLs for secure video playback',
  )
  @IsString()
  @IsOptional()
  MUX_SIGNING_KEY_ID?: string = undefined;

  @Description(
    'Mux Private Key (PEM format) for generating signed URLs. Ensure newlines are escaped if in .env as single line.',
  )
  @IsString()
  @IsOptional()
  MUX_PRIVATE_KEY?: string = undefined;

  // ============================================
  // AI SERVICES API KEYS
  // ============================================

  @Description('OpenAI API key for AI services')
  @IsString()
  OPENAI_API_KEY: string = undefined;

  @Description('OpenAI API key specifically for image generation')
  @IsString()
  OPENAI_API_KEY_IMAGE_GEN: string = undefined;

  @Description('Gemini API key for accessing Google AI services')
  @IsString()
  GEMINI_API_KEY?: string = undefined;

  @Description('Groq API key for AI services')
  @IsString()
  GROQ_API_KEY: string = undefined;

  // ============================================
  // EXTERNAL SERVICES API KEYS
  // ============================================

  @Description('RapidAPI key for external API services')
  @IsString()
  RAPIDAPI_KEY: string = undefined;

  @Description('Kit API key for email marketing services')
  @IsString()
  KIT_API_KEY: string = undefined;
}

/**
 * Validates environment variables using the EnvironmentVariables class
 * This function is called during application startup to ensure all required
 * environment variables are present and valid
 */
export function validateEnv(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
    whitelist: true,
    forbidNonWhitelisted: true,
  });

  if (errors.length > 0) {
    const errorMessages = errors.map((error) => {
      const constraints = Object.values(error.constraints || {}).join(', ');
      return `${error.property}: ${constraints}`;
    });

    throw new Error(
      `Environment validation failed:\n${errorMessages.join('\n')}`,
    );
  }

  return validatedConfig;
}
