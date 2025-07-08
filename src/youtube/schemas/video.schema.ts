import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { VideoCategory } from '../enums/video-category.enum';
import { VideoStatus } from '../enums/video-status.enum';
import {
  VideoAnalytics,
  VideoEngagement,
  VideoMetadata,
  VideoThumbnail,
} from '../interfaces/video.interface';

export type VideoDocument = Video & Document;

@Schema({ timestamps: true, collection: 'videos' })
export class Video {
  @Prop({
    type: String,
    required: [true, 'Video title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
    index: true,
  })
  title: string;

  @Prop({
    type: String,
    required: [true, 'Video description is required'],
    trim: true,
    maxlength: [5000, 'Description cannot exceed 5000 characters'],
  })
  description: string;

  @Prop({
    type: String,
    required: [true, 'YouTube video ID is required'],
    unique: true,
    index: true,
  })
  youtubeId: string;

  @Prop({
    type: String,
    required: [true, 'Video URL is required'],
    unique: true,
  })
  url: string;

  @Prop({
    type: String,
    enum: Object.values(VideoStatus),
    required: true,
    default: VideoStatus.DRAFT,
    index: true,
  })
  status: VideoStatus;

  @Prop({
    type: String,
    enum: Object.values(VideoCategory),
    required: true,
    index: true,
  })
  category: VideoCategory;

  @Prop({
    type: [String],
    default: [],
    index: true,
  })
  tags: string[];

  @Prop({
    type: {
      url: { type: String, required: true },
      width: { type: Number, required: true },
      height: { type: Number, required: true },
      quality: {
        type: String,
        enum: ['default', 'medium', 'high', 'standard', 'maxres'],
        default: 'default',
      },
    },
    required: true,
  })
  thumbnail: VideoThumbnail;

  @Prop({
    type: {
      duration: { type: Number, required: true },
      resolution: { type: String, required: true },
      frameRate: { type: Number, required: true },
      bitrate: { type: Number, required: true },
      format: { type: String, required: true },
      size: { type: Number, required: true },
    },
    required: true,
  })
  metadata: VideoMetadata;

  @Prop({
    type: {
      views: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      dislikes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      watchTime: { type: Number, default: 0 },
      clickThroughRate: { type: Number, default: 0 },
      lastUpdated: { type: Date, default: Date.now },
    },
    default: {},
  })
  analytics: VideoAnalytics;

  @Prop({
    type: {
      averageViewDuration: { type: Number, default: 0 },
      retentionRate: { type: Number, default: 0 },
      engagementRate: { type: Number, default: 0 },
      topComments: { type: [String], default: [] },
    },
    default: {},
  })
  engagement: VideoEngagement;

  @Prop({ type: Date, index: true })
  publishedAt?: Date;

  @Prop({ type: Date, index: true })
  scheduledAt?: Date;

  @Prop({ type: String, index: true })
  channelId?: string;

  @Prop({ type: String })
  channelTitle?: string;

  @Prop({ type: String, index: true })
  ownerId?: string; // Reference to user who owns/manages this video

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Date })
  deletedAt?: Date;

  @Prop({ type: Boolean, default: false })
  isFeatured: boolean;

  @Prop({ type: Boolean, default: false })
  isMonetized: boolean;

  @Prop({ type: [String], default: [] })
  playlists: string[];

  @Prop({ type: String })
  language?: string;

  @Prop({ type: [String], default: [] })
  subtitles: string[]; // Array of subtitle language codes

  @Prop({ type: Boolean, default: false })
  isLiveStream: boolean;

  @Prop({ type: Boolean, default: true })
  allowComments: boolean;

  @Prop({ type: Boolean, default: false })
  isAgeRestricted: boolean;
}

export const VideoSchema = SchemaFactory.createForClass(Video);
