import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

import { User } from '@/users/schemas/user.schema';
import { Video } from '@/youtube/schemas/video.schema';

export const YOUTUBE_ACCOUNT_COLLECTION = 'youtube_accounts';

@Schema({ collection: YOUTUBE_ACCOUNT_COLLECTION, timestamps: true })
export class YoutubeAccount extends Document {
  @Prop({ type: String, required: true })
  accessToken: string;

  @Prop({ type: String, required: true })
  refreshToken: string;

  @Prop({ type: Date, required: true })
  expiresAt: Date;

  @Prop({ type: String, required: true })
  channelId: string;

  @Prop({ type: String, required: true })
  channelThumbnail: string;

  @Prop({ type: String, required: true })
  channelTitle: string;

  @Prop({
    type: Date,
    required: false,
    default: Date.now,
  })
  lastFullScan?: Date;

  @Prop({
    required: false,
    ref: User.name,
    type: mongoose.Schema.Types.ObjectId,
  })
  userId?: string;

  @Prop({
    required: false,
    ref: Video.name,
    type: [mongoose.Schema.Types.ObjectId],
  })
  videos?: Video[];
}

export const YoutubeAccountSchema =
  SchemaFactory.createForClass(YoutubeAccount);
