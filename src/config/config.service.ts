import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AiServicesConfig,
  AppConfig,
  AuthConfig,
  AwsConfig,
  DatabaseConfig,
  ExternalServicesConfig,
  GoogleConfig,
  LoggingConfig,
  MuxConfig,
  RateLimitConfig,
  RedisConfig,
  StripeConfig,
} from './configuration';

/**
 * TypedConfigService provides strongly typed access to configuration values.
 *
 * Usage example:
 * ```typescript
 * // In a controller or service
 * constructor(private configService: TypedConfigService) {}
 *
 * someMethod() {
 *   const port = this.configService.app.port;
 *   const dbUrl = this.configService.database.url;
 *   const jwtSecret = this.configService.auth.jwtAccessTokenSecret;
 *   const stripeApiKey = this.configService.stripe.apiKey;
 *   const openaiKey = this.configService.aiServices.openaiApiKey;
 * }
 * ```
 */
@Injectable()
export class TypedConfigService {
  constructor(private configService: ConfigService) {}

  // ============================================
  // CORE CONFIGURATION
  // ============================================

  get app(): AppConfig {
    return this.configService.get<AppConfig>('app')!;
  }

  get database(): DatabaseConfig {
    return this.configService.get<DatabaseConfig>('database')!;
  }

  get redis(): RedisConfig {
    return this.configService.get<RedisConfig>('redis')!;
  }

  get rateLimit(): RateLimitConfig {
    return this.configService.get<RateLimitConfig>('rateLimit')!;
  }

  get logging(): LoggingConfig {
    return this.configService.get<LoggingConfig>('logging')!;
  }

  // ============================================
  // AUTHENTICATION & SECURITY
  // ============================================

  get auth(): AuthConfig {
    return this.configService.get<AuthConfig>('auth')!;
  }

  get google(): GoogleConfig {
    return this.configService.get<GoogleConfig>('google')!;
  }

  // ============================================
  // EXTERNAL SERVICES
  // ============================================

  get aws(): AwsConfig {
    return this.configService.get<AwsConfig>('aws')!;
  }

  get stripe(): StripeConfig {
    return this.configService.get<StripeConfig>('stripe')!;
  }

  get mux(): MuxConfig {
    return this.configService.get<MuxConfig>('mux')!;
  }

  get aiServices(): AiServicesConfig {
    return this.configService.get<AiServicesConfig>('aiServices')!;
  }

  get externalServices(): ExternalServicesConfig {
    return this.configService.get<ExternalServicesConfig>('externalServices')!;
  }

  // ============================================
  // ENVIRONMENT HELPERS
  // ============================================

  get isDevelopment(): boolean {
    return this.app.environment === 'development';
  }

  get isProduction(): boolean {
    return this.app.environment === 'production';
  }

  get isTest(): boolean {
    return this.app.environment === 'test';
  }

  get isProvision(): boolean {
    return this.app.environment === 'provision';
  }

  // ============================================
  // FEATURE AVAILABILITY CHECKS
  // ============================================

  get isAuthEnabled(): boolean {
    return !!(
      this.auth.jwtAccessTokenSecret && this.auth.jwtRefreshTokenSecret
    );
  }

  get isGoogleAuthEnabled(): boolean {
    return !!(this.google.clientId && this.google.clientSecret);
  }

  get isStripeEnabled(): boolean {
    return !!this.stripe.apiKey;
  }

  get isMuxEnabled(): boolean {
    return !!(this.mux.tokenId && this.mux.tokenSecret);
  }

  get isOpenAiEnabled(): boolean {
    return !!this.aiServices.openaiApiKey;
  }

  get isAwsEnabled(): boolean {
    return !!(this.aws.accessKey && this.aws.secretAccessKey);
  }

  get isRedisEnabled(): boolean {
    return !!(this.redis.host && this.redis.port);
  }

  // ============================================
  // COMPUTED PROPERTIES
  // ============================================

  get serverUrl(): string {
    const protocol = this.isProduction ? 'https' : 'http';
    const host = this.app.origin.replace(/^https?:\/\//, '');
    return `${protocol}://${host}`;
  }

  get corsOrigins(): string[] {
    return [this.app.origin, this.app.clientUrl].filter(Boolean);
  }

  get logLevel(): string {
    return this.logging.level;
  }

  get shouldLogRequests(): boolean {
    return this.logging.requestLogging;
  }

  get shouldPrettyPrintLogs(): boolean {
    return this.logging.prettyPrint;
  }
}
