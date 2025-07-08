import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TypedConfigService } from './config/config.service';

const logger = new Logger('Bootstrap');

export async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    // Get the TypedConfigService as requested by the user
    const configService = app.get(TypedConfigService);
    const port = configService.app.port;

    await app.listen(port);

    logger.log(`Application is running on: http://localhost:${port}`);
    logger.log('Environment variables validated successfully');
    logger.log(`Environment: ${configService.app.environment}`);
    logger.log(`Service Name: ${configService.app.serviceName}`);
  } catch (error) {
    if (
      error.message &&
      error.message.includes('Environment validation failed')
    ) {
      logger.error('❌ Environment validation failed!');
      logger.error(error.message);
      logger.error('\nPlease check your environment variables and try again.');
    } else {
      logger.error('❌ Failed to start application:', error.message);
    }
    process.exit(1);
  }
}

// Only run bootstrap if not in test environment
if (process.env.NODE_ENV !== 'test') {
  bootstrap();
}
