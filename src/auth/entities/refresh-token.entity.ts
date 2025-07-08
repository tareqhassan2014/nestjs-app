import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema()
export class RefreshToken extends Document {
  @Prop({
    type: String,
    unique: true,
    required: true,
  })
  refreshToken: string;

  @Prop({
    type: String,
    ref: 'User',
    index: true,
    required: true,
  })
  userId: string;

  @Prop({
    type: Date,
    required: true,
    default: Date.now,
  })
  issuedAt: Date;

  @Prop({
    type: Date,
    required: true,
  })
  expiresAt: Date;

  @Prop({
    type: Boolean,
    default: false,
  })
  isRevoked: boolean;

  @Prop({
    type: String,
    required: true,
  })
  userAgent: string;

  @Prop({
    type: String,
    required: true,
  })
  ipAddress: string; // Add IP address for validation
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
