import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { IsEmail, IsString } from 'class-validator';

@Schema({
  timestamps: true,
  collection: 'auth',
})
export class Auth {
  _id?: string;

  @Prop({
    trim: true,
    type: String,
    unique: true,
    required: [true, 'Email is required'],
  })
  @IsEmail()
  @IsString()
  email: string;

  @Prop({
    trim: true,
    type: String,
  })
  @IsString()
  displayName: string;
}

export const AuthSchema = SchemaFactory.createForClass(Auth);
