import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { VideoCategory } from '../enums/video-category.enum';
import { VideoStatus } from '../enums/video-status.enum';
import { CreateVideoDto } from './create-video.dto';

export class UpdateVideoThumbnailDto {
  @ApiPropertyOptional({
    description: 'Thumbnail URL',
    example: 'https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Thumbnail URL must be a valid URL' })
  url?: string;

  @ApiPropertyOptional({
    description: 'Thumbnail width in pixels',
    example: 1920,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Width must be a number' })
  @Min(1, { message: 'Width must be a positive number' })
  width?: number;

  @ApiPropertyOptional({
    description: 'Thumbnail height in pixels',
    example: 1080,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Height must be a number' })
  @Min(1, { message: 'Height must be a positive number' })
  height?: number;

  @ApiPropertyOptional({
    description: 'Thumbnail quality',
    example: 'maxres',
    enum: ['default', 'medium', 'high', 'standard', 'maxres'],
  })
  @IsOptional()
  @IsEnum(['default', 'medium', 'high', 'standard', 'maxres'], {
    message: 'Quality must be a valid thumbnail quality',
  })
  quality?: 'default' | 'medium' | 'high' | 'standard' | 'maxres';
}

export class UpdateVideoMetadataDto {
  @ApiPropertyOptional({
    description: 'Video duration in seconds',
    example: 300,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Duration must be a number' })
  @Min(0, { message: 'Duration must be a non-negative number' })
  duration?: number;

  @ApiPropertyOptional({
    description: 'Video resolution',
    example: '1920x1080',
  })
  @IsOptional()
  @IsString({ message: 'Resolution must be a string' })
  resolution?: string;

  @ApiPropertyOptional({
    description: 'Video frame rate',
    example: 30,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Frame rate must be a number' })
  @Min(0, { message: 'Frame rate must be a non-negative number' })
  frameRate?: number;

  @ApiPropertyOptional({
    description: 'Video bitrate',
    example: 8000,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Bitrate must be a number' })
  @Min(0, { message: 'Bitrate must be a non-negative number' })
  bitrate?: number;

  @ApiPropertyOptional({
    description: 'Video format',
    example: 'mp4',
  })
  @IsOptional()
  @IsString({ message: 'Format must be a string' })
  format?: string;

  @ApiPropertyOptional({
    description: 'Video file size in bytes',
    example: 104857600,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Size must be a number' })
  @Min(0, { message: 'Size must be a non-negative number' })
  size?: number;
}

const UpdateVideoDtoBase: any = PartialType(CreateVideoDto);

export class UpdateVideoDto extends UpdateVideoDtoBase {
  @ApiPropertyOptional({
    description: 'Video title',
    example: 'My Amazing YouTube Video',
    minLength: 1,
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title cannot be empty' })
  @MinLength(1, { message: 'Title must be at least 1 character long' })
  @MaxLength(100, { message: 'Title must not exceed 100 characters' })
  @Transform(({ value }) => (typeof value === 'string' ? value?.trim() : value))
  title?: string;

  @ApiPropertyOptional({
    description: 'Video description',
    example: 'This is an amazing video about...',
    minLength: 1,
    maxLength: 5000,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty({ message: 'Description cannot be empty' })
  @MinLength(1, { message: 'Description must be at least 1 character long' })
  @MaxLength(5000, { message: 'Description must not exceed 5000 characters' })
  @Transform(({ value }) => (typeof value === 'string' ? value?.trim() : value))
  description?: string;

  @ApiPropertyOptional({
    description: 'YouTube video ID',
    example: 'dQw4w9WgXcQ',
  })
  @IsOptional()
  @IsString({ message: 'YouTube ID must be a string' })
  @IsNotEmpty({ message: 'YouTube ID cannot be empty' })
  @MaxLength(50, { message: 'YouTube ID must not exceed 50 characters' })
  @Transform(({ value }) => (typeof value === 'string' ? value?.trim() : value))
  youtubeId?: string;

  @ApiPropertyOptional({
    description: 'Video URL',
    example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  })
  @IsOptional()
  @IsNotEmpty({ message: 'URL cannot be empty' })
  @IsUrl({}, { message: 'URL must be a valid URL' })
  url?: string;

  @ApiPropertyOptional({
    description: 'Video status',
    example: VideoStatus.PUBLISHED,
    enum: VideoStatus,
  })
  @IsOptional()
  @IsEnum(VideoStatus, { message: 'Status must be a valid video status' })
  status?: VideoStatus;

  @ApiPropertyOptional({
    description: 'Video category',
    example: VideoCategory.EDUCATION,
    enum: VideoCategory,
  })
  @IsOptional()
  @IsEnum(VideoCategory, { message: 'Category must be a valid video category' })
  category?: VideoCategory;

  @ApiPropertyOptional({
    description: 'Video tags',
    example: ['education', 'tutorial', 'programming'],
  })
  @IsOptional()
  @IsArray({ message: 'Tags must be an array' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  @MaxLength(50, {
    each: true,
    message: 'Each tag must not exceed 50 characters',
  })
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value.map((tag) => (typeof tag === 'string' ? tag?.trim() : tag));
    }
    return value;
  })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Video thumbnail information',
    type: UpdateVideoThumbnailDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateVideoThumbnailDto)
  thumbnail?: UpdateVideoThumbnailDto;

  @ApiPropertyOptional({
    description: 'Video metadata',
    type: UpdateVideoMetadataDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateVideoMetadataDto)
  metadata?: UpdateVideoMetadataDto;

  @ApiPropertyOptional({
    description: 'Channel ID',
    example: 'UCxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @IsOptional()
  @IsString({ message: 'Channel ID must be a string' })
  @MaxLength(50, { message: 'Channel ID must not exceed 50 characters' })
  @Transform(({ value }) => (typeof value === 'string' ? value?.trim() : value))
  channelId?: string;

  @ApiPropertyOptional({
    description: 'Channel title',
    example: 'My Amazing Channel',
  })
  @IsOptional()
  @IsString({ message: 'Channel title must be a string' })
  @MaxLength(100, { message: 'Channel title must not exceed 100 characters' })
  @Transform(({ value }) => (typeof value === 'string' ? value?.trim() : value))
  channelTitle?: string;

  @ApiPropertyOptional({
    description: 'Owner user ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsMongoId({ message: 'Owner ID must be a valid MongoDB ObjectId' })
  ownerId?: string;

  @ApiPropertyOptional({
    description: 'Whether the video is featured',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Is featured must be a boolean' })
  isFeatured?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the video is monetized',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Is monetized must be a boolean' })
  isMonetized?: boolean;

  @ApiPropertyOptional({
    description: 'Video language',
    example: 'en',
  })
  @IsOptional()
  @IsString({ message: 'Language must be a string' })
  language?: string;

  @ApiPropertyOptional({
    description: 'Whether the video is a live stream',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Is live stream must be a boolean' })
  isLiveStream?: boolean;

  @ApiPropertyOptional({
    description: 'Whether comments are allowed',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Allow comments must be a boolean' })
  allowComments?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the video is age restricted',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Is age restricted must be a boolean' })
  isAgeRestricted?: boolean;
}
