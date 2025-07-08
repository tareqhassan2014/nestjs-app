# Configuration Service

This module provides strongly typed access to configuration values throughout the application.

## Usage

The `TypedConfigService` can be injected into any service or controller to access configuration values with full type safety.

### Basic Usage

```typescript
import { Injectable } from '@nestjs/common';
import { TypedConfigService } from './config/config.service';

@Injectable()
export class MyService {
  constructor(private configService: TypedConfigService) {}

  someMethod() {
    // Application configuration
    const port = this.configService.app.port;
    const environment = this.configService.app.environment;
    const serviceName = this.configService.app.serviceName;

    // Database configuration
    const dbUrl = this.configService.database.url;

    // Authentication configuration
    const jwtSecret = this.configService.auth.jwtAccessTokenSecret;
    const encryptionKey = this.configService.auth.encryptionKey;

    // Redis configuration
    const redisHost = this.configService.redis.host;
    const redisPort = this.configService.redis.port;

    // Google OAuth configuration
    const googleClientId = this.configService.google.clientId;
    const googleClientSecret = this.configService.google.clientSecret;

    // Environment checks
    if (this.configService.isDevelopment) {
      // Development-specific logic
    }

    if (this.configService.isProduction) {
      // Production-specific logic
    }
  }
}
```

### In Controllers

```typescript
import { Controller, Get } from '@nestjs/common';
import { TypedConfigService } from './config/config.service';

@Controller('config')
export class ConfigController {
  constructor(private configService: TypedConfigService) {}

  @Get('app')
  getAppConfig() {
    return {
      serviceName: this.configService.app.serviceName,
      environment: this.configService.app.environment,
      port: this.configService.app.port,
    };
  }
}
```

### In Main Application

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TypedConfigService } from './config/config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get the TypedConfigService
  const configService = app.get(TypedConfigService);
  const port = configService.app.port;

  await app.listen(port);
}
```

## Environment Variables

The following environment variables are validated on startup:

### Required Variables

- `NODE_ENV`: Application environment (development, production, test)
- `PORT`: Port number for the application
- `SERVICE_NAME`: Name of the service
- `MONGODB_URI`: MongoDB connection string

### Optional Variables

- `ORIGIN`: CORS origin URL (default: http://localhost:3000)
- `CLIENT_URL`: Client application URL (default: http://localhost:3001)
- `SERVE_STATIC_ROOT_PATH`: Static files root path (default: client)
- `REDIS_HOST`: Redis host (default: localhost)
- `REDIS_PORT`: Redis port (default: 6379)
- `REDIS_USERNAME`: Redis username (optional)
- `REDIS_PASSWORD`: Redis password (optional)
- `GOOGLE_CLIENT_ID`: Google OAuth client ID (optional)
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret (optional)
- `JWT_ACCESS_TOKEN_SECRET`: JWT access token secret (optional)
- `JWT_REFRESH_TOKEN_SECRET`: JWT refresh token secret (optional)
- `JWT_INVITE_SECRET`: JWT invite token secret (default: your-secret_key)
- `ENCRYPTION_KEY`: Encryption key for sensitive data (optional)
- `PRIVATE_KEY_PEM`: Private RSA key in PEM format (optional)

## Configuration Sections

### App Configuration

- `port`: Application port
- `environment`: Current environment
- `serviceName`: Service name
- `origin`: CORS origin
- `clientUrl`: Client application URL
- `serveStaticRootPath`: Static files root path

### Database Configuration

- `url`: MongoDB connection string

### Authentication Configuration

- `jwtAccessTokenSecret`: JWT access token secret
- `jwtRefreshTokenSecret`: JWT refresh token secret
- `jwtInviteSecret`: JWT invite token secret
- `encryptionKey`: Encryption key
- `privateKeyPem`: Private RSA key

### Redis Configuration

- `host`: Redis host
- `port`: Redis port
- `username`: Redis username (optional)
- `password`: Redis password (optional)

### Google Configuration

- `clientId`: Google OAuth client ID
- `clientSecret`: Google OAuth client secret

### Rate Limit Configuration

- `global`: Global rate limiting configuration
- `auth`: Authentication rate limiting
- `api`: API rate limiting
- `upload`: Upload rate limiting

## Environment Validation

The application validates essential environment variables on startup. If any required variables are missing, the application will fail to start with a clear error message.

To add custom validation, modify the `validateEssentialEnv` function in `configuration.ts`.
