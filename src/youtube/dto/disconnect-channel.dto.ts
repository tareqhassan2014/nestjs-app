import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DisconnectChannelDto {
  @ApiProperty({
    description: 'Dashboard ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  @IsNotEmpty()
  dashboardId: string;

  @ApiProperty({
    description: 'Channel ID to disconnect',
    example: 'UCXuqSBlHAE6Xw-yeJA0Tunw',
  })
  @IsString()
  @IsNotEmpty()
  channelId: string;
}
