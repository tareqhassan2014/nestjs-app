import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsString, Max, MaxLength } from 'class-validator';
import mongoose, { Document } from 'mongoose';

export const YOUTUBE_API_KEY_COLLECTION = 'youtube_apiKeys';

@Schema({ collection: YOUTUBE_API_KEY_COLLECTION, timestamps: true })
export class YouTubeApiKey extends Document {
  @ApiProperty({
    required: true,
    type: Boolean,
  })
  @IsBoolean()
  @Prop({
    type: Boolean,
    default: true,
  })
  isActive!: boolean;

  @ApiProperty({
    required: true,
    type: String,
  })
  @IsString()
  @MaxLength(256)
  @Prop({ type: String, required: true })
  key!: string;

  @ApiProperty({
    required: true,
  })
  @IsString()
  @Prop({ type: Date, required: true })
  lastReset!: Date;

  @ApiProperty({
    required: true,
  })
  @IsString()
  @Prop({ type: Date, required: true })
  lastUsed!: Date;

  @ApiProperty({
    required: false,
    type: String,
  })
  @IsString()
  @MaxLength(256)
  @Prop({ type: String, required: false })
  name?: string;

  @ApiProperty({
    required: true,
    type: Number,
  })
  @IsInt()
  @Max(99999999999)
  @Prop({ type: Number, required: true, default: 0 })
  usageCount!: number;

  @ApiProperty({
    required: true,
    type: Number,
  })
  @IsInt()
  @Max(99999999999)
  @Prop({ type: Number, required: true, default: 0 })
  usedQuota!: number;

  @ApiProperty({
    required: true,
    type: String,
  })
  @Prop({
    required: false,
    type: mongoose.Schema.Types.ObjectId,
  })
  userId?: mongoose.Schema.Types.ObjectId;
}

export const YouTubeApiKeySchema = SchemaFactory.createForClass(YouTubeApiKey);
