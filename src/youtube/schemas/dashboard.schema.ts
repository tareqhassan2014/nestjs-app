import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

import { User } from '@/users/schemas/user.schema';

@Schema({ collection: 'dashboards', timestamps: true })
export class Dashboard extends Document {
  @Prop([
    {
      required: false,
      ref: 'DashboardChannel',
      type: mongoose.Schema.Types.ObjectId,
    },
  ])
  channels?: mongoose.Schema.Types.ObjectId[];

  @Prop({ type: String, required: true })
  name!: string;

  @Prop({
    required: false,
    ref: User.name,
    type: mongoose.Schema.Types.ObjectId,
  })
  userId?: mongoose.Schema.Types.ObjectId;
}

export const DashboardSchema = SchemaFactory.createForClass(Dashboard);
