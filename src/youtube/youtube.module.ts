import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GoogleAuthService } from './google-auth.service';
import { Video, VideoSchema } from './schemas/video.schema';
import {
  YoutubeAccount,
  YoutubeAccountSchema,
} from './schemas/youtube-account.schema';
import { YoutubeController } from './youtube.controller';
import { YoutubeService } from './youtube.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Video.name, schema: VideoSchema },
      { name: YoutubeAccount.name, schema: YoutubeAccountSchema },
    ]),
  ],
  controllers: [YoutubeController],
  providers: [YoutubeService, GoogleAuthService],
  exports: [YoutubeService, GoogleAuthService],
})
export class YoutubeModule {}
