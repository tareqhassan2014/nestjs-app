import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TypedConfigService } from './config/config.service';

const logger = new Logger('Bootstrap');

export async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    const configService = app.get(TypedConfigService);
    const port = configService.app.port;
    const environment = configService.app.environment;

    await app.listen(port, async () => {
      const serverUrl = await app.getUrl();
      logger.log(`=================================`);
      logger.log(`======= ENV: ${environment} =======`);
      logger.log(`🚀 Server is running on: ${serverUrl}`);
      logger.log(`=================================`);
    });
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
