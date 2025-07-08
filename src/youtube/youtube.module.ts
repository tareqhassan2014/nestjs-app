import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiKeyManagerService } from './api-key-manager.service';
import { GoogleAuthService } from './google-auth.service';
import { Video, VideoSchema } from './schemas/video.schema';
import {
  YoutubeAccount,
  YoutubeAccountSchema,
} from './schemas/youtube-account.schema';
import {
  YouTubeApiKey,
  YouTubeApiKeySchema,
} from './schemas/youtube-api-key.schema';
import { YoutubeController } from './youtube.controller';
import { YoutubeService } from './youtube.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Video.name, schema: VideoSchema },
      { name: YoutubeAccount.name, schema: YoutubeAccountSchema },
      { name: YouTubeApiKey.name, schema: YouTubeApiKeySchema },
    ]),
  ],
  controllers: [YoutubeController],
  providers: [YoutubeService, GoogleAuthService, ApiKeyManagerService],
  exports: [YoutubeService, GoogleAuthService, ApiKeyManagerService],
})
export class YoutubeModule {}
