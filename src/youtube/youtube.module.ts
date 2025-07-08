import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  YoutubeChannelStat,
  YoutubeChannelStatSchema,
} from './schemas/channel-stats.schema';
import {
  DashboardChannel,
  DashboardChannelSchema,
} from './schemas/dashboard-channel.schema';
import { Dashboard, DashboardSchema } from './schemas/dashboard.schema';
import { Video, VideoSchema } from './schemas/video.schema';
import {
  YoutubeAccount,
  YoutubeAccountSchema,
} from './schemas/youtube-account.schema';
import {
  YouTubeApiKey,
  YouTubeApiKeySchema,
} from './schemas/youtube-api-key.schema';
import { ApiKeyManagerService } from './services/api-key-manager.service';
import { GoogleAuthService } from './services/google-auth.service';
import { YoutubeController } from './youtube.controller';
import { YoutubeService } from './youtube.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Video.name, schema: VideoSchema },
      { name: YouTubeApiKey.name, schema: YouTubeApiKeySchema },
      { name: YoutubeAccount.name, schema: YoutubeAccountSchema },
      { name: Dashboard.name, schema: DashboardSchema },
      { name: DashboardChannel.name, schema: DashboardChannelSchema },
      { name: YoutubeChannelStat.name, schema: YoutubeChannelStatSchema },
    ]),
  ],
  controllers: [YoutubeController],
  exports: [YoutubeService, GoogleAuthService, ApiKeyManagerService],
  providers: [YoutubeService, GoogleAuthService, ApiKeyManagerService],
})
export class YoutubeModule {}
