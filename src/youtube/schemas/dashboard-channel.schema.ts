import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

import { Dashboard } from './dashboard.schema';
import { YoutubeAccount } from './youtube-account.schema';

export const DASHBOARD_CHANNEL_COLLECTION = 'dashboard_channels';

@Schema({ collection: DASHBOARD_CHANNEL_COLLECTION, timestamps: true })
export class DashboardChannel extends Document {
  @Prop({
    required: true,
    ref: Dashboard.name,
    type: mongoose.Schema.Types.ObjectId,
  })
  dashboardId: string;

  @Prop({
    required: true,
    ref: YoutubeAccount.name,
    type: mongoose.Schema.Types.ObjectId,
  })
  youtubeAccountId: YoutubeAccount;
}

export const DashboardChannelSchema =
  SchemaFactory.createForClass(DashboardChannel);
