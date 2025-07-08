import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

import { User } from '@/users/schemas/user.schema';

@Schema({
  timestamps: true,
  collection: 'connection_attempts',
})
export class ConnectionAttempt extends Document {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
    unique: true,
    index: true,
  })
  userId: string;

  @Prop({
    type: Date,
    required: true,
    default: Date.now,
  })
  attemptTime: Date;
}

export const ConnectionAttemptSchema =
  SchemaFactory.createForClass(ConnectionAttempt);
