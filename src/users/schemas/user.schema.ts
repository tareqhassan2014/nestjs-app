import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
  SubscriptionPlan,
  SubscriptionStatus,
} from '../enums/subscription.enum';
import { UserRole } from '../enums/user-role.enum';
import { LastWatchedVideo } from '../interfaces/user.interface';
import { Subscription, SubscriptionSchema } from './subscription.schema';

export type UserDocument = User & Document;

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    index: true,
    validate: {
      validator: function (email: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: 'Invalid email format',
    },
  })
  email: string;

  @Prop({ type: String, index: true, sparse: true })
  googleId?: string;

  @Prop({ type: String, required: true, trim: true })
  firstName: string;

  @Prop({ type: String, required: true, trim: true })
  lastName: string;

  @Prop({ type: String })
  image?: string;

  @Prop({ type: String, unique: true, sparse: true })
  accountId?: string;

  @Prop({ type: String })
  password?: string;

  @Prop({ type: Boolean, default: false })
  hasUsedTrial?: boolean;

  @Prop({ type: Boolean, default: false })
  hasUsedCancelFlowCoupon?: boolean;

  @Prop({
    type: String,
    enum: Object.values(UserRole),
    required: true,
    default: UserRole.USER,
  })
  role: UserRole;

  @Prop({
    type: [SubscriptionSchema],
    default: [],
  })
  subscriptions?: Subscription[];

  @Prop({ type: Boolean, default: false })
  hasCourseAccess?: boolean;

  @Prop({ type: Date, index: true })
  lastVisited?: Date;

  @Prop({
    type: [
      {
        moduleId: { type: String, required: true },
        videoId: { type: String, required: true },
        timestamp: { type: Date, required: true },
      },
    ],
    default: [],
  })
  lastWatchedVideos?: LastWatchedVideo[];

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Date })
  deletedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Add virtuals to the schema
UserSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`.trim();
});

UserSchema.virtual('currentSubscription').get(function () {
  if (!this.subscriptions || this.subscriptions.length === 0) {
    return undefined;
  }

  // Find the most recent active subscription
  return (
    this.subscriptions
      .filter(
        (sub) =>
          sub.status === SubscriptionStatus.ACTIVE ||
          sub.status === SubscriptionStatus.TRIALING,
      )
      .sort(
        (a, b) => (b.startDate?.getTime() || 0) - (a.startDate?.getTime() || 0),
      )[0] || this.subscriptions[this.subscriptions.length - 1]
  );
});

UserSchema.virtual('subscriptionStatus').get(function () {
  const currentSub =
    this.subscriptions?.find(
      (sub) =>
        sub.status === SubscriptionStatus.ACTIVE ||
        sub.status === SubscriptionStatus.TRIALING,
    ) || this.subscriptions?.[this.subscriptions.length - 1];

  return currentSub?.status || SubscriptionStatus.FREE;
});

UserSchema.virtual('subscriptionPlan').get(function () {
  const currentSub =
    this.subscriptions?.find(
      (sub) =>
        sub.status === SubscriptionStatus.ACTIVE ||
        sub.status === SubscriptionStatus.TRIALING,
    ) || this.subscriptions?.[this.subscriptions.length - 1];

  return currentSub?.plan || SubscriptionPlan.FREE;
});

// Add virtuals to JSON output
UserSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

UserSchema.set('toObject', {
  virtuals: true,
});
