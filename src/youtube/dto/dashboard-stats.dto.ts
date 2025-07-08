import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DashboardStatsDto {
  @ApiProperty({
    description: 'Dashboard ID to get stats for',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  @IsNotEmpty()
  dashboardId: string;
}

export interface ChannelStatsResponse {
  channelId: string;
  channelTitle: string;
  totalSubscribers: number;
  stats: Array<{
    timestamp: string;
    hourlyViewChange: number;
    hourlyViewChangeShort?: number;
    hourlyViewChangeLong?: number;
    totalViews?: number;
    shortViews?: number;
    longViews?: number;
  }>;
}

export interface DashboardStatsResponse extends Array<ChannelStatsResponse> {}
