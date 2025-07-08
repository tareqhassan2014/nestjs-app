import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
  SubscriptionPlan,
  SubscriptionStatus,
} from '../enums/subscription.enum';

export type SubscriptionDocument = Subscription & Document;

@Schema({ timestamps: true })
export class Subscription {
  @Prop({ type: String, index: true, sparse: true })
  stripeCustomerId?: string;

  @Prop({ type: String, index: true, sparse: true })
  stripeSubscriptionId?: string;

  @Prop({
    type: String,
    enum: Object.values(SubscriptionStatus),
    required: true,
  })
  status: SubscriptionStatus;

  @Prop({
    type: String,
    enum: Object.values(SubscriptionPlan),
    required: true,
  })
  plan: SubscriptionPlan;

  @Prop({ type: String })
  planNickname?: string;

  @Prop({
    type: String,
    enum: ['month', 'year', 'week', 'day'],
    default: 'month',
  })
  interval?: string;

  @Prop({ type: Date, required: true })
  startDate: Date;

  @Prop({ type: Date })
  endDate?: Date;

  @Prop({ type: Boolean, default: false })
  isTrial?: boolean;

  @Prop({ type: Date })
  trialEndDate?: Date;

  @Prop({ type: String })
  priceId?: string;

  @Prop({ type: String })
  productId?: string;

  @Prop({ type: String })
  invoiceId?: string;

  @Prop({ type: Number })
  stripeEventCreationTime?: number;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
