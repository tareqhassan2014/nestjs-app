# Configuration Service

This module provides strongly typed access to configuration values throughout the application. It includes comprehensive environment variable validation and organized configuration sections for all application features.

## Quick Start

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

    // External services
    const stripeApiKey = this.configService.stripe.apiKey;
    const openaiKey = this.configService.aiServices.openaiApiKey;

    // Environment checks
    if (this.configService.isDevelopment) {
      // Development-specific logic
    }

    // Feature availability checks
    if (this.configService.isStripeEnabled) {
      // Payment processing logic
    }
  }
}
```

### Feature Availability Checks

The configuration service provides convenient methods to check if features are properly configured:

```typescript
// Check if authentication is properly configured
if (this.configService.isAuthEnabled) {
  // JWT tokens are configured
}

// Check if Google OAuth is available
if (this.configService.isGoogleAuthEnabled) {
  // Google OAuth credentials are set
}

// Check if Stripe payments are enabled
if (this.configService.isStripeEnabled) {
  // Stripe API key is configured
}

// Check if OpenAI features are available
if (this.configService.isOpenAiEnabled) {
  // OpenAI API key is configured
}
```

## Configuration Sections

### Application Configuration (`app`)

Core application settings that define how the service runs.

**Environment Variables:**

- `NODE_ENV` (required): Application environment (development, production, test, provision)
- `SERVICE_NAME` (required): Name of the service for logging and monitoring
- `PORT` (required): Port number the application listens on
- `ORIGIN`: Server origin URL for CORS configuration (default: http://localhost:3000)
- `CLIENT_URL`: Base URL for the client application (default: http://localhost:3001)
- `SERVE_STATIC_ROOT_PATH`: Root directory for serving static files (default: client)
- `CHANNEL_FILTER_MAX_RESULTS`: Maximum results for channel filtering (default: 250)

**Usage:**

```typescript
const appConfig = this.configService.app;
console.log(appConfig.port); // 3000
console.log(appConfig.environment); // 'development'
```

### Database Configuration (`database`)

MongoDB connection settings.

**Environment Variables:**

- `MONGODB_URI` (required): MongoDB connection string

**Usage:**

```typescript
const dbConfig = this.configService.database;
console.log(dbConfig.url); // 'mongodb://localhost:27017/nexlev-extension'
```

### Redis Configuration (`redis`)

Redis server configuration for caching and rate limiting.

**Environment Variables:**

- `REDIS_HOST`: Redis server hostname (default: localhost)
- `REDIS_PORT`: Redis server port (default: 6379)
- `REDIS_USERNAME`: Redis username (optional)
- `REDIS_PASSWORD`: Redis password (optional)

**Usage:**

```typescript
const redisConfig = this.configService.redis;
console.log(redisConfig.host); // 'localhost'
console.log(redisConfig.port); // 6379
```

### Rate Limiting Configuration (`rateLimit`)

Rate limiting settings for different endpoints.

**Environment Variables:**

- `RATE_LIMIT_TTL`: Global rate limit TTL in seconds (default: 60)
- `RATE_LIMIT_MAX`: Global rate limit max requests (default: 100)
- `AUTH_RATE_LIMIT_TTL`: Auth rate limit TTL in seconds (default: 900)
- `AUTH_RATE_LIMIT_MAX`: Auth rate limit max attempts (default: 5)
- `API_RATE_LIMIT_TTL`: API rate limit TTL in seconds (default: 60)
- `API_RATE_LIMIT_MAX`: API rate limit max requests (default: 60)
- `UPLOAD_RATE_LIMIT_TTL`: Upload rate limit TTL in seconds (default: 3600)
- `UPLOAD_RATE_LIMIT_MAX`: Upload rate limit max uploads (default: 10)

**Usage:**

```typescript
const rateLimitConfig = this.configService.rateLimit;
console.log(rateLimitConfig.global.ttl); // 60
console.log(rateLimitConfig.auth.limit); // 5
```

### Logging Configuration (`logging`)

Logging behavior and format settings.

**Environment Variables:**

- `LOG_LEVEL`: Log level (default: info)
- `LOG_REQUEST`: Enable HTTP request logging (default: false)
- `PINO_PRETTY`: Enable pretty-printed logs (default: false)

**Usage:**

```typescript
const loggingConfig = this.configService.logging;
console.log(loggingConfig.level); // 'info'
console.log(loggingConfig.requestLogging); // false
```

### Authentication Configuration (`auth`)

JWT tokens and encryption settings.

**Environment Variables:**

- `OPEN_AUTH_ISSUER`: OpenAuth issuer URL (optional)
- `JWT_ACCESS_TOKEN_SECRET`: JWT access token secret (required for auth)
- `JWT_ACCESS_TOKEN_EXPIRATION`: JWT access token expiration (default: 90d)
- `JWT_REFRESH_TOKEN_SECRET`: JWT refresh token secret (required for auth)
- `JWT_REFRESH_TOKEN_EXPIRATION`: JWT refresh token expiration (default: 365d)
- `JWT_INVITE_SECRET`: JWT invite token secret (default: your-secret_key)
- `PRIVATE_KEY_PEM`: Private RSA key in PEM format (required for auth)
- `ENCRYPTION_KEY`: Encryption key for sensitive data (required for auth)

**Usage:**

```typescript
const authConfig = this.configService.auth;
console.log(authConfig.jwtAccessTokenSecret);
console.log(authConfig.jwtAccessTokenExpiration); // '90d'
```

### Google OAuth Configuration (`google`)

Google OAuth authentication settings.

**Environment Variables:**

- `GOOGLE_CLIENT_ID`: Google OAuth Client ID (required for Google auth)
- `GOOGLE_CLIENT_SECRET`: Google OAuth Client Secret (required for Google auth)

**Usage:**

```typescript
const googleConfig = this.configService.google;
console.log(googleConfig.clientId);
```

### AWS Services Configuration (`aws`)

AWS S3 and SES configuration.

**Environment Variables:**

- `AWS_ACCESS_KEY`: AWS access key (required for AWS services)
- `AWS_SECRET_ACCESS_KEY`: AWS secret access key (required for AWS services)
- `AWS_S3_BUCKET_NAME`: S3 bucket name (default: nexlev-analytics-assets)
- `AWS_S3_REGION`: S3 bucket region (default: eu-central-1)
- `AWS_SES_ACCESS_KEY`: SES access key (required for email services)
- `AWS_SES_SECRET_ACCESS_KEY`: SES secret access key (required for email services)

**Usage:**

```typescript
const awsConfig = this.configService.aws;
console.log(awsConfig.s3BucketName); // 'nexlev-analytics-assets'
console.log(awsConfig.s3Region); // 'eu-central-1'
```

### Stripe Payment Configuration (`stripe`)

Stripe payment processing settings.

**Environment Variables:**

- `STRIPE_API_KEY`: Stripe API key (required for payments)
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook secret (required for webhooks)
- `STRIPE_COURSE_WEBHOOK_SECRET`: Stripe course webhook secret
- `STRIPE_PRODUCT_ID`: Main subscription product ID (default: prod_Qs1DcNKP14zdoI)
- `NEXLEV_LITE_PRODUCT_ID`: NexLev Lite product ID
- `NEXLEV_PRO_PRODUCT_ID`: NexLev Pro product ID
- `NEXLEV_PRO_MONTHLY_PRICE_ID`: NexLev Pro monthly price ID
- `NEXLEV_PRO_YEARLY_PRICE_ID`: NexLev Pro yearly price ID
- `NEXLEV_LITE_MONTHLY_PRICE_ID`: NexLev Lite monthly price ID
- `NEXLEV_LITE_YEARLY_PRICE_ID`: NexLev Lite yearly price ID
- `CANCEL_FLOW_COUPON_CODE`: Coupon code for cancel flow

**Usage:**

```typescript
const stripeConfig = this.configService.stripe;
console.log(stripeConfig.apiKey);
console.log(stripeConfig.productId);
```

### Mux Video Configuration (`mux`)

Mux video streaming and upload settings.

**Environment Variables:**

- `MUX_TOKEN_ID`: Mux API Token ID (required for video services)
- `MUX_TOKEN_SECRET`: Mux API Token Secret (required for video services)
- `MUX_WEBHOOK_SECRET`: Mux webhook secret (optional)
- `MUX_SIGNING_KEY_ID`: Mux signing key ID for secure playback (optional)
- `MUX_PRIVATE_KEY`: Mux private key for signed URLs (optional)

**Usage:**

```typescript
const muxConfig = this.configService.mux;
console.log(muxConfig.tokenId);
console.log(muxConfig.signingKeyId);
```

### AI Services Configuration (`aiServices`)

AI service API keys and settings.

**Environment Variables:**

- `OPENAI_API_KEY`: OpenAI API key (required for AI features)
- `OPENAI_API_KEY_IMAGE_GEN`: OpenAI API key for image generation
- `GEMINI_API_KEY`: Gemini API key (optional)
- `GROQ_API_KEY`: Groq API key (required for AI features)

**Usage:**

```typescript
const aiConfig = this.configService.aiServices;
console.log(aiConfig.openaiApiKey);
console.log(aiConfig.groqApiKey);
```

### External Services Configuration (`externalServices`)

External API keys and service configurations.

**Environment Variables:**

- `RAPIDAPI_KEY`: RapidAPI key (required for external APIs)
- `KIT_API_KEY`: Kit API key for email marketing (required for email features)
- `YOUTUBE_API_KEY_ENCRYPTION_KEY`: YouTube API key encryption key (optional)

**Usage:**

```typescript
const externalConfig = this.configService.externalServices;
console.log(externalConfig.rapidApiKey);
console.log(externalConfig.kitApiKey);
```

## Environment Validation

The application performs comprehensive environment validation on startup:

### Essential Variables

These variables are required for the application to start:

- `NODE_ENV`
- `PORT`
- `SERVICE_NAME`
- `MONGODB_URI`

### Feature Validation

The application will warn about missing optional configuration that affects specific features:

- **Authentication**: Missing JWT secrets or encryption keys
- **Google OAuth**: Missing client ID or secret
- **Payment Processing**: Missing Stripe API key
- **AI Features**: Missing OpenAI API key

### Custom Validation

You can extend the validation by modifying the `validateEssentialEnv` or `validateFeatureEnv` functions in `configuration.ts`.

## Environment Helpers

The configuration service provides convenient environment checks:

```typescript
// Environment type checks
if (this.configService.isDevelopment) {
  /* ... */
}
if (this.configService.isProduction) {
  /* ... */
}
if (this.configService.isTest) {
  /* ... */
}
if (this.configService.isProvision) {
  /* ... */
}

// Feature availability checks
if (this.configService.isAuthEnabled) {
  /* ... */
}
if (this.configService.isGoogleAuthEnabled) {
  /* ... */
}
if (this.configService.isStripeEnabled) {
  /* ... */
}
if (this.configService.isMuxEnabled) {
  /* ... */
}
if (this.configService.isOpenAiEnabled) {
  /* ... */
}
if (this.configService.isAwsEnabled) {
  /* ... */
}
if (this.configService.isRedisEnabled) {
  /* ... */
}
```

## Logger Configuration

The logger configuration integrates with the configuration service and supports:

- **Development**: Colorized, human-readable logs
- **Production**: Structured JSON logs with file rotation
- **Pretty Print**: Pino-compatible pretty printing (set `PINO_PRETTY=true`)
- **Request Logging**: HTTP request logging (set `LOG_REQUEST=true`)

The logger automatically creates log files in production:

- `logs/error.log`: Error-level logs only
- `logs/combined.log`: All logs
- `logs/exceptions.log`: Uncaught exceptions
- `logs/rejections.log`: Unhandled promise rejections

## Best Practices

1. **Use TypedConfigService**: Always inject and use the typed config service instead of accessing `process.env` directly
2. **Check Feature Availability**: Use the `is*Enabled` methods to conditionally enable features
3. **Environment-Specific Logic**: Use environment helper methods for environment-specific behavior
4. **Validation**: Add custom validation for new configuration requirements
5. **Documentation**: Update this README when adding new configuration options

## Error Handling

The configuration system provides clear error messages:

- **Missing Required Variables**: Lists all missing variables with helpful context
- **Invalid Values**: Class-validator provides detailed validation errors
- **Feature Warnings**: Non-blocking warnings for missing optional configuration

## Security Considerations

- **Sensitive Data**: Never log or expose sensitive configuration values
- **Environment Files**: Keep `.env` files out of version control
- **Production Secrets**: Use secure secret management in production
- **Encryption Keys**: Generate strong, unique encryption keys for each environment
