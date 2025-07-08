import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypedConfigService } from './config/config.service';
import {
  appConfig,
  authConfig,
  databaseConfig,
  googleConfig,
  rateLimitConfig,
  redisConfig,
  validateEssentialEnv,
} from './config/configuration';
import { UsersModule } from './users/users.module';
import { YoutubeModule } from './youtube/youtube.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEssentialEnv,
      load: [
        appConfig,
        authConfig,
        databaseConfig,
        googleConfig,
        redisConfig,
        rateLimitConfig,
      ],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('database.url'),
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    YoutubeModule,
  ],
  controllers: [AppController],
  providers: [AppService, TypedConfigService],
  exports: [TypedConfigService],
})
export class AppModule {}
