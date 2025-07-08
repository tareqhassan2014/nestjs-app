import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateYoutubeAccountDto {
  @IsString()
  @IsNotEmpty()
  channelId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  accessToken: string;

  @IsString()
  @IsNotEmpty()
  refreshToken: string;

  @IsString()
  @IsNotEmpty()
  channelTitle: string;

  @IsOptional()
  @IsString()
  channelDescription?: string;

  @IsOptional()
  @IsString()
  channelThumbnail?: string;

  @IsOptional()
  @IsDate()
  expiresAt?: Date;
}
