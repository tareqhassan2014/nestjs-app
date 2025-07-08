import { Public } from '@/auth/decorators/public.decorator';
import { User } from '@/auth/decorators/user.decorator';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { isValidObjectId } from 'mongoose';
import { CreateVideoDto } from './dto/create-video.dto';
import { DisconnectChannelDto } from './dto/disconnect-channel.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { YoutubeCallbackDto } from './dto/youtube-callback.dto';
import { VideoCategory } from './enums/video-category.enum';
import { VideoStatus } from './enums/video-status.enum';
import { YoutubeService } from './youtube.service';

@ApiTags('youtube')
@Controller('youtube')
export class YoutubeController {
  constructor(
    private readonly youtubeService: YoutubeService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new video' })
  @ApiResponse({ status: 201, description: 'Video created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Video already exists' })
  async create(@Body(ValidationPipe) createVideoDto: CreateVideoDto) {
    return this.youtubeService.create(createVideoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all videos' })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Videos retrieved successfully' })
  async findAll(@Query('includeInactive') includeInactive: string) {
    const include = includeInactive === 'true';
    return this.youtubeService.findAll(include);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search videos' })
  @ApiQuery({ name: 'q', required: true, type: String })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
  })
  async search(@Query('q') query: string) {
    if (!query || query.trim().length === 0) {
      throw new BadRequestException('Search query is required');
    }
    return this.youtubeService.searchVideos(query.trim());
  }

  @Get('count/active')
  @ApiOperation({ summary: 'Get active videos count' })
  @ApiResponse({
    status: 200,
    description: 'Active videos count retrieved successfully',
  })
  async getActiveVideosCount() {
    return this.youtubeService.getActiveVideosCount();
  }

  @Get('count/inactive')
  @ApiOperation({ summary: 'Get inactive videos count' })
  @ApiResponse({
    status: 200,
    description: 'Inactive videos count retrieved successfully',
  })
  async getInactiveVideosCount() {
    return this.youtubeService.getInactiveVideosCount();
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured videos' })
  @ApiResponse({
    status: 200,
    description: 'Featured videos retrieved successfully',
  })
  async getFeaturedVideos() {
    return this.youtubeService.getFeaturedVideos();
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get videos by status' })
  @ApiParam({ name: 'status', enum: VideoStatus })
  @ApiResponse({ status: 200, description: 'Videos retrieved successfully' })
  async getVideosByStatus(@Param('status') status: VideoStatus) {
    if (!Object.values(VideoStatus).includes(status)) {
      throw new BadRequestException('Invalid video status');
    }
    return this.youtubeService.getVideosByStatus(status);
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Get videos by category' })
  @ApiParam({ name: 'category', enum: VideoCategory })
  @ApiResponse({ status: 200, description: 'Videos retrieved successfully' })
  async getVideosByCategory(@Param('category') category: VideoCategory) {
    if (!Object.values(VideoCategory).includes(category)) {
      throw new BadRequestException('Invalid video category');
    }
    return this.youtubeService.getVideosByCategory(category);
  }

  @Get('owner/:ownerId')
  @ApiOperation({ summary: 'Get videos by owner' })
  @ApiParam({ name: 'ownerId', description: 'Owner user ID' })
  @ApiResponse({ status: 200, description: 'Videos retrieved successfully' })
  async getVideosByOwner(@Param('ownerId') ownerId: string) {
    if (!isValidObjectId(ownerId)) {
      throw new BadRequestException('Invalid owner ID');
    }
    return this.youtubeService.getVideosByOwner(ownerId);
  }

  @Get('tags')
  @ApiOperation({ summary: 'Get videos by tags' })
  @ApiQuery({ name: 'tags', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Videos retrieved successfully' })
  async getVideosByTags(@Query('tags') tags: string) {
    if (!tags || tags.trim().length === 0) {
      throw new BadRequestException('Tags query parameter is required');
    }
    const tagArray = tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
    if (tagArray.length === 0) {
      throw new BadRequestException('At least one valid tag is required');
    }
    return this.youtubeService.getVideosByTags(tagArray);
  }

  @Get('youtube/:youtubeId')
  @ApiOperation({ summary: 'Get video by YouTube ID' })
  @ApiParam({ name: 'youtubeId', description: 'YouTube video ID' })
  @ApiResponse({ status: 200, description: 'Video retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Video not found' })
  async findByYoutubeId(@Param('youtubeId') youtubeId: string) {
    if (!youtubeId || youtubeId.trim().length === 0) {
      throw new BadRequestException('YouTube ID is required');
    }
    return this.youtubeService.findByYoutubeId(youtubeId.trim());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get video by ID' })
  @ApiParam({ name: 'id', description: 'Video ID' })
  @ApiResponse({ status: 200, description: 'Video retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Video not found' })
  async findOne(@Param('id') id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid video ID');
    }
    return this.youtubeService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update video' })
  @ApiParam({ name: 'id', description: 'Video ID' })
  @ApiResponse({ status: 200, description: 'Video updated successfully' })
  @ApiResponse({ status: 404, description: 'Video not found' })
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateVideoDto: UpdateVideoDto,
  ) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid video ID');
    }
    return this.youtubeService.update(id, updateVideoDto);
  }

  @Patch(':id/publish')
  @ApiOperation({ summary: 'Publish video' })
  @ApiParam({ name: 'id', description: 'Video ID' })
  @ApiResponse({ status: 200, description: 'Video published successfully' })
  @ApiResponse({ status: 404, description: 'Video not found' })
  async publishVideo(@Param('id') id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid video ID');
    }
    return this.youtubeService.publishVideo(id);
  }

  @Patch(':id/schedule')
  @ApiOperation({ summary: 'Schedule video' })
  @ApiParam({ name: 'id', description: 'Video ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        scheduledAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Video scheduled successfully' })
  @ApiResponse({ status: 404, description: 'Video not found' })
  async scheduleVideo(
    @Param('id') id: string,
    @Body('scheduledAt') scheduledAt: string,
  ) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid video ID');
    }
    if (!scheduledAt) {
      throw new BadRequestException('Scheduled date is required');
    }
    const scheduledDate = new Date(scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
      throw new BadRequestException('Invalid scheduled date');
    }
    if (scheduledDate <= new Date()) {
      throw new BadRequestException('Scheduled date must be in the future');
    }
    return this.youtubeService.scheduleVideo(id, scheduledDate);
  }

  @Patch(':id/toggle-featured')
  @ApiOperation({ summary: 'Toggle video featured status' })
  @ApiParam({ name: 'id', description: 'Video ID' })
  @ApiResponse({
    status: 200,
    description: 'Video featured status toggled successfully',
  })
  @ApiResponse({ status: 404, description: 'Video not found' })
  async toggleFeatured(@Param('id') id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid video ID');
    }
    return this.youtubeService.toggleFeatured(id);
  }

  @Patch(':id/analytics')
  @ApiOperation({ summary: 'Update video analytics' })
  @ApiParam({ name: 'id', description: 'Video ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        views: { type: 'number' },
        likes: { type: 'number' },
        dislikes: { type: 'number' },
        comments: { type: 'number' },
        shares: { type: 'number' },
        watchTime: { type: 'number' },
        clickThroughRate: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Video analytics updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Video not found' })
  async updateAnalytics(@Param('id') id: string, @Body() analyticsData: any) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid video ID');
    }
    return this.youtubeService.updateAnalytics(id, analyticsData);
  }

  @Patch(':id/engagement')
  @ApiOperation({ summary: 'Update video engagement' })
  @ApiParam({ name: 'id', description: 'Video ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        averageViewDuration: { type: 'number' },
        retentionRate: { type: 'number' },
        engagementRate: { type: 'number' },
        topComments: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Video engagement updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Video not found' })
  async updateEngagement(@Param('id') id: string, @Body() engagementData: any) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid video ID');
    }
    return this.youtubeService.updateEngagement(id, engagementData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete video' })
  @ApiParam({ name: 'id', description: 'Video ID' })
  @ApiResponse({ status: 200, description: 'Video deleted successfully' })
  @ApiResponse({ status: 404, description: 'Video not found' })
  async remove(@Param('id') id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid video ID');
    }
    return this.youtubeService.remove(id);
  }

  @Delete(':id/hard')
  @ApiOperation({ summary: 'Hard delete video' })
  @ApiParam({ name: 'id', description: 'Video ID' })
  @ApiResponse({ status: 204, description: 'Video deleted successfully' })
  @ApiResponse({ status: 404, description: 'Video not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async hardDelete(@Param('id') id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid video ID');
    }
    return this.youtubeService.hardDelete(id);
  }

  @Get('/connect')
  @ApiOperation({
    summary: 'Initiate YouTube OAuth flow',
    description:
      'Redirects to Google OAuth consent screen for YouTube API access',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns OAuth URL for Google consent screen',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid user or other error',
  })
  async initiateOAuth(@User('id') userId: string): Promise<{ url: string }> {
    const url = await this.youtubeService.generateOAuthUrl(userId);
    return { url };
  }

  @Get('/reconnect')
  @ApiOperation({
    summary: 'Reconnect YouTube channel',
    description:
      'Initiates OAuth flow to reconnect an existing YouTube channel',
  })
  @ApiQuery({
    name: 'channelId',
    required: true,
    type: String,
    description: 'Channel ID to reconnect',
  })
  @ApiQuery({
    name: 'dashboardId',
    required: true,
    type: String,
    description: 'Dashboard ID',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirects to Google OAuth consent screen',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Channel ID and Dashboard ID are required',
  })
  @ApiResponse({
    status: 404,
    description: 'YouTube account not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized access to YouTube account',
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
  @ApiOperation({
    summary: 'Disconnect YouTube channel',
    description: 'Disconnects a YouTube channel from the dashboard',
  })
  @ApiResponse({
    status: 200,
    description: 'Channel disconnected successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Dashboard, YouTube account, or channel connection not found',
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
  @ApiOperation({
    summary: 'Handle YouTube OAuth callback',
    description:
      'Processes the OAuth callback from Google and creates/updates YouTube account',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirects to analytics page with success or error',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - missing required parameters',
  })
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
