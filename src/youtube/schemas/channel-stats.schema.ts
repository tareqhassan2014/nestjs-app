import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

import { YoutubeAccount } from './youtube-account.schema';

export const YOUTUBE_CHANNEL_STATS_COLLECTION = 'youtube_channel_stats';

@Schema({ collection: YOUTUBE_CHANNEL_STATS_COLLECTION, timestamps: true })
export class YoutubeChannelStat extends Document {
  @Prop({
    type: Number,
    required: true,
    default: 0,
  })
  hourlyViewChange!: number;

  @Prop({ type: Number, required: true, default: 0 })
  hourlyViewChangeShort!: number;

  @Prop({ type: Number, required: true, default: 0 })
  hourlyViewChangeLong!: number;

  @Prop({ type: Number, required: true, default: 0 })
  shortViews!: number;

  @Prop({ type: Number, required: true, default: 0 })
  longViews!: number;

  @Prop({ type: Date, required: true, default: Date.now })
  timestamp!: Date;

  @Prop({ type: Number, required: true, default: 0 })
  totalViews!: number;

  @Prop({
    required: true,
    ref: YoutubeAccount.name,
    type: mongoose.Schema.Types.ObjectId,
  })
  youtubeAccountId!: mongoose.Schema.Types.ObjectId;
}

export const YoutubeChannelStatSchema =
  SchemaFactory.createForClass(YoutubeChannelStat);

// Create compound index for efficient queries
YoutubeChannelStatSchema.index({ youtubeAccountId: 1, timestamp: 1 });
