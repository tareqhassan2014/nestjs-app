import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AppConfig,
  AuthConfig,
  DatabaseConfig,
  GoogleConfig,
  RateLimitConfig,
  RedisConfig,
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
 * }
 * ```
 */
@Injectable()
export class TypedConfigService {
  constructor(private configService: ConfigService) {}

  get database(): DatabaseConfig {
    return this.configService.get<DatabaseConfig>('database')!;
  }

  get auth(): AuthConfig {
    return this.configService.get<AuthConfig>('auth')!;
  }

  get google(): GoogleConfig {
    return this.configService.get<GoogleConfig>('google')!;
  }

  get app(): AppConfig {
    return this.configService.get<AppConfig>('app')!;
  }

  get redis(): RedisConfig {
    return this.configService.get<RedisConfig>('redis')!;
  }

  get rateLimit(): RateLimitConfig {
    return this.configService.get<RateLimitConfig>('rateLimit')!;
  }

  get isDevelopment(): boolean {
    return this.app.environment === 'development';
  }

  get isProduction(): boolean {
    return this.app.environment === 'production';
  }

  get isTest(): boolean {
    return this.app.environment === 'test';
  }
}
