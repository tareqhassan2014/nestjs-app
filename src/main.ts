import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}

// Only run bootstrap if not in test environment
if (process.env.NODE_ENV !== 'test') {
  bootstrap();
}
