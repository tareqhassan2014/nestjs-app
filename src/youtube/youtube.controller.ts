import { Public } from '@/auth/decorators/public.decorator';
import { User } from '@/auth/decorators/user.decorator';
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import {
  DashboardStatsDto,
  DashboardStatsResponse,
} from './dto/dashboard-stats.dto';
import { DisconnectChannelDto } from './dto/disconnect-channel.dto';
import { YoutubeCallbackDto } from './dto/youtube-callback.dto';
import { YoutubeService } from './youtube.service';

@ApiTags('youtube')
@Controller('youtube')
export class YoutubeController {
  constructor(
    private readonly youtubeService: YoutubeService,
    private readonly configService: ConfigService,
  ) {}

  @Get('/connect')
  @ApiOperation({ summary: 'Initiate YouTube OAuth flow' })
  @ApiResponse({ status: 200, description: 'Returns OAuth URL' })
  async initiateOAuth(@User('id') userId: string): Promise<{ url: string }> {
    const url = await this.youtubeService.generateOAuthUrl(userId);
    return { url };
  }

  @Get('/channel/stats')
  @ApiOperation({ summary: 'Get channel statistics' })
  @ApiQuery({ name: 'dashboardId', required: true, type: String })
  @ApiResponse({
    status: 200,
    description: 'Returns channel statistics',
    type: Array,
  })
  async getChannelStats(
    @Query() dashboardStatsDto: DashboardStatsDto,
  ): Promise<DashboardStatsResponse> {
    try {
      return await this.youtubeService.getDashboardStats(
        dashboardStatsDto.dashboardId,
      );
    } catch (error) {
      if (error.message === 'Dashboard not found') {
        throw new HttpException('Dashboard not found', HttpStatus.NOT_FOUND);
      }

      console.error('Error fetching channel stats:', error);
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('/reconnect')
  @ApiOperation({ summary: 'Reconnect YouTube channel' })
  @ApiQuery({ name: 'channelId', required: true, type: String })
  @ApiQuery({ name: 'dashboardId', required: true, type: String })
  @ApiResponse({
    status: 302,
    description: 'Redirects to OAuth consent screen',
  })
  async reconnectChannel(
    @Res() res: Response,
    @User('id') userId: string,
    @Query('channelId') channelId: string,
    @Query('dashboardId') dashboardId: string,
  ) {
    if (!channelId || !dashboardId) {
      throw new HttpException(
        'Channel ID and Dashboard ID are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const authUrl = await this.youtubeService.getReconnectUrl(
      userId,
      channelId,
      dashboardId,
    );

    res.redirect(authUrl);
  }

  @Post('/disconnect')
  @ApiOperation({ summary: 'Disconnect YouTube channel' })
  @ApiResponse({
    status: 200,
    description: 'Channel disconnected successfully',
  })
  async disconnectChannel(
    @User('id') userId: string,
    @Body() disconnectChannelDto: DisconnectChannelDto,
  ) {
    const { dashboardId, channelId } = disconnectChannelDto;

    return await this.youtubeService.disconnectChannel(
      userId,
      dashboardId,
      channelId,
    );
  }

  @Public()
  @Get('/callback')
  @ApiOperation({ summary: 'Handle YouTube OAuth callback' })
  @ApiResponse({ status: 302, description: 'Redirects to analytics page' })
  async handleCallback(
    @Res() res: Response,
    @Query() youtubeCallbackDto: YoutubeCallbackDto,
  ) {
    try {
      const url = await this.youtubeService.handleCallback(youtubeCallbackDto);

      return res.redirect(url.toString());
    } catch (error) {
      const errorMessage =
        error.message || 'An error occurred during OAuth callback';

      // Generate URL from request and send error message as parameter
      const clientUrl = this.configService.get<string>('CLIENT_URL');
      const errorUrl = new URL('/analytics', clientUrl);
      errorUrl.searchParams.set('success', 'false');
      errorUrl.searchParams.set('message', errorMessage);

      return res.redirect(errorUrl.toString());
    }
  }
}
