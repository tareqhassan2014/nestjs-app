import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { google } from 'googleapis';
import { Model } from 'mongoose';
import { CreateVideoDto } from './dto/create-video.dto';
import { CreateYoutubeAccountDto } from './dto/create-youtube-account.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { YoutubeCallbackDto } from './dto/youtube-callback.dto';
import { VideoCategory } from './enums/video-category.enum';
import { VideoStatus } from './enums/video-status.enum';
import { GoogleAuthService } from './google-auth.service';
import { Video } from './schemas/video.schema';
import { YoutubeAccount } from './schemas/youtube-account.schema';

@Injectable()
export class YoutubeService {
  constructor(
    @InjectModel(Video.name) private videoModel: Model<Video>,
    @InjectModel(YoutubeAccount.name)
    private youtubeAccountModel: Model<YoutubeAccount>,
    private readonly configService: ConfigService,
    private readonly googleAuthService: GoogleAuthService,
  ) {}

  async create(createVideoDto: CreateVideoDto): Promise<Video> {
    try {
      // Check if video already exists
      const existingVideo = await this.videoModel.findOne({
        youtubeId: createVideoDto.youtubeId,
      });
      if (existingVideo) {
        throw new ConflictException(
          'Video with this YouTube ID already exists',
        );
      }

      // Create video with default analytics and engagement data
      const videoData = {
        ...createVideoDto,
        analytics: {
          views: 0,
          likes: 0,
          dislikes: 0,
          comments: 0,
          shares: 0,
          watchTime: 0,
          clickThroughRate: 0,
          lastUpdated: new Date(),
        },
        engagement: {
          averageViewDuration: 0,
          retentionRate: 0,
          engagementRate: 0,
          topComments: [],
        },
      };

      const createdVideo = new this.videoModel(videoData);
      return await createdVideo.save();
    } catch (error) {
      if (error.code === 11000) {
        if (error.keyPattern?.youtubeId) {
          throw new ConflictException(
            'Video with this YouTube ID already exists',
          );
        }
        if (error.keyPattern?.url) {
          throw new ConflictException('Video with this URL already exists');
        }
      }
      throw error;
    }
  }

  async findAll(includeInactive: boolean = false): Promise<Video[]> {
    const filter = includeInactive
      ? {}
      : { isActive: true, deletedAt: { $exists: false } };
    return this.videoModel.find(filter).exec();
  }

  async findOne(id: string): Promise<Video> {
    const video = await this.videoModel.findById(id).exec();
    if (!video) {
      throw new NotFoundException('Video not found');
    }
    return video;
  }

  async findByYoutubeId(youtubeId: string): Promise<Video> {
    const video = await this.videoModel.findOne({ youtubeId }).exec();
    if (!video) {
      throw new NotFoundException('Video not found');
    }
    return video;
  }

  async update(id: string, updateVideoDto: UpdateVideoDto): Promise<Video> {
    const video = await this.videoModel.findById(id);
    if (!video) {
      throw new NotFoundException('Video not found');
    }

    // Check if YouTube ID is being updated and already exists
    if (
      updateVideoDto.youtubeId &&
      updateVideoDto.youtubeId !== video.youtubeId
    ) {
      const existingVideo = await this.videoModel.findOne({
        youtubeId: updateVideoDto.youtubeId,
      });
      if (existingVideo) {
        throw new ConflictException(
          'Video with this YouTube ID already exists',
        );
      }
    }

    const updatedVideo = await this.videoModel
      .findByIdAndUpdate(id, updateVideoDto, { new: true })
      .exec();

    if (!updatedVideo) {
      throw new NotFoundException('Video not found');
    }

    return updatedVideo;
  }

  async remove(id: string): Promise<Video> {
    const video = await this.videoModel.findById(id);
    if (!video) {
      throw new NotFoundException('Video not found');
    }

    // Soft delete
    const deletedVideo = await this.videoModel
      .findByIdAndUpdate(
        id,
        { isActive: false, deletedAt: new Date() },
        { new: true },
      )
      .exec();

    if (!deletedVideo) {
      throw new NotFoundException('Video not found');
    }

    return deletedVideo;
  }

  async hardDelete(id: string): Promise<void> {
    const result = await this.videoModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Video not found');
    }
  }

  async getActiveVideosCount(): Promise<number> {
    return this.videoModel
      .countDocuments({
        isActive: true,
        deletedAt: { $exists: false },
      })
      .exec();
  }

  async getInactiveVideosCount(): Promise<number> {
    return this.videoModel
      .countDocuments({
        $or: [{ isActive: false }, { deletedAt: { $exists: true } }],
      })
      .exec();
  }

  async getVideosByStatus(status: VideoStatus): Promise<Video[]> {
    return this.videoModel
      .find({
        status,
        isActive: true,
        deletedAt: { $exists: false },
      })
      .exec();
  }

  async getVideosByCategory(category: VideoCategory): Promise<Video[]> {
    return this.videoModel
      .find({
        category,
        isActive: true,
        deletedAt: { $exists: false },
      })
      .exec();
  }

  async getVideosByOwner(ownerId: string): Promise<Video[]> {
    return this.videoModel
      .find({
        ownerId,
        isActive: true,
        deletedAt: { $exists: false },
      })
      .exec();
  }

  async getFeaturedVideos(): Promise<Video[]> {
    return this.videoModel
      .find({
        isFeatured: true,
        isActive: true,
        deletedAt: { $exists: false },
      })
      .exec();
  }

  async getVideosByTags(tags: string[]): Promise<Video[]> {
    return this.videoModel
      .find({
        tags: { $in: tags },
        isActive: true,
        deletedAt: { $exists: false },
      })
      .exec();
  }

  async updateAnalytics(id: string, analytics: Partial<any>): Promise<Video> {
    const video = await this.videoModel.findById(id);
    if (!video) {
      throw new NotFoundException('Video not found');
    }

    const updatedVideo = await this.videoModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            analytics: {
              ...video.analytics,
              ...analytics,
              lastUpdated: new Date(),
            },
          },
        },
        { new: true },
      )
      .exec();

    if (!updatedVideo) {
      throw new NotFoundException('Video not found');
    }

    return updatedVideo;
  }

  async updateEngagement(id: string, engagement: Partial<any>): Promise<Video> {
    const video = await this.videoModel.findById(id);
    if (!video) {
      throw new NotFoundException('Video not found');
    }

    const updatedVideo = await this.videoModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            engagement: { ...video.engagement, ...engagement },
          },
        },
        { new: true },
      )
      .exec();

    if (!updatedVideo) {
      throw new NotFoundException('Video not found');
    }

    return updatedVideo;
  }

  async publishVideo(id: string): Promise<Video> {
    const video = await this.videoModel.findById(id);
    if (!video) {
      throw new NotFoundException('Video not found');
    }

    const updatedVideo = await this.videoModel
      .findByIdAndUpdate(
        id,
        {
          status: VideoStatus.PUBLISHED,
          publishedAt: new Date(),
        },
        { new: true },
      )
      .exec();

    if (!updatedVideo) {
      throw new NotFoundException('Video not found');
    }

    return updatedVideo;
  }

  async scheduleVideo(id: string, scheduledAt: Date): Promise<Video> {
    const video = await this.videoModel.findById(id);
    if (!video) {
      throw new NotFoundException('Video not found');
    }

    const updatedVideo = await this.videoModel
      .findByIdAndUpdate(
        id,
        {
          status: VideoStatus.SCHEDULED,
          scheduledAt,
        },
        { new: true },
      )
      .exec();

    if (!updatedVideo) {
      throw new NotFoundException('Video not found');
    }

    return updatedVideo;
  }

  async toggleFeatured(id: string): Promise<Video> {
    const video = await this.videoModel.findById(id);
    if (!video) {
      throw new NotFoundException('Video not found');
    }

    const updatedVideo = await this.videoModel
      .findByIdAndUpdate(id, { isFeatured: !video.isFeatured }, { new: true })
      .exec();

    if (!updatedVideo) {
      throw new NotFoundException('Video not found');
    }

    return updatedVideo;
  }

  async searchVideos(query: string): Promise<Video[]> {
    return this.videoModel
      .find({
        $and: [
          { isActive: true, deletedAt: { $exists: false } },
          {
            $or: [
              { title: { $regex: query, $options: 'i' } },
              { description: { $regex: query, $options: 'i' } },
              { tags: { $regex: query, $options: 'i' } },
              { channelTitle: { $regex: query, $options: 'i' } },
            ],
          },
        ],
      })
      .exec();
  }

  async generateOAuthUrl(userId: string): Promise<string> {
    return this.googleAuthService.getAuthUrl(userId);
  }

  async handleCallback(youtubeCallbackDto: YoutubeCallbackDto): Promise<URL> {
    const { code, state } = youtubeCallbackDto;
    const returnUrl = new URL(
      '/analytics',
      this.configService.get<string>('CLIENT_URL'),
    );

    if (!code || typeof code !== 'string') {
      returnUrl.searchParams.set('success', 'false');
      returnUrl.searchParams.set('message', 'Authorization code is required');

      return returnUrl;
    }

    if (!state) {
      returnUrl.searchParams.set('success', 'false');
      returnUrl.searchParams.set('message', 'State parameter is missing');

      return returnUrl;
    }

    const userId = state;

    // Get OAuth2 client and exchange code for tokens
    const oauth2Client = this.googleAuthService.getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    if (!tokens.access_token || !tokens.refresh_token) {
      returnUrl.searchParams.set('success', 'false');
      returnUrl.searchParams.set('message', 'Failed to retrieve tokens');

      return returnUrl;
    }

    // Initialize YouTube API client
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    // Fetch user's YouTube channel information
    const response = await youtube.channels.list({
      mine: true,
      part: ['snippet'],
    });

    const channel = response?.data?.items?.[0];

    if (!channel) {
      returnUrl.searchParams.set('success', 'false');
      returnUrl.searchParams.set(
        'message',
        'The account you selected has no YouTube channel',
      );

      return returnUrl;
    }

    const channelId = channel.id;
    const accessToken = tokens.access_token;
    const refreshToken = tokens.refresh_token;
    const channelTitle = channel.snippet?.title;
    const expiresAt = new Date(tokens.expiry_date);
    const channelDescription = channel.snippet?.description;
    const channelThumbnail = channel.snippet?.thumbnails?.default?.url;

    // Create or update YouTube account
    const youtubeAccount = await this.youtubeAccountModel.findOneAndUpdate(
      { channelId },
      {
        expiresAt,
        userId: userId,
        accessToken,
        channelTitle,
        refreshToken,
        channelDescription,
        channelThumbnail,
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      },
    );

    if (!youtubeAccount) {
      returnUrl.searchParams.set('success', 'false');
      returnUrl.searchParams.set(
        'message',
        'Failed to create or update YouTube account',
      );

      return returnUrl;
    }

    returnUrl.searchParams.set('success', 'true');
    returnUrl.searchParams.set(
      'message',
      'YouTube account connected successfully',
    );

    return returnUrl;
  }

  async getReconnectUrl(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _userId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _channelId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _dashboardId: string,
  ): Promise<string> {
    // TODO: Implement getReconnectUrl logic
    throw new Error('getReconnectUrl method not implemented yet');
  }

  async disconnectChannel(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _userId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _dashboardId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _channelId: string,
  ): Promise<any> {
    // TODO: Implement disconnectChannel logic
    throw new Error('disconnectChannel method not implemented yet');
  }

  async createYoutubeAccount(
    createYoutubeAccountDto: CreateYoutubeAccountDto,
  ): Promise<YoutubeAccount> {
    return this.youtubeAccountModel.create(createYoutubeAccountDto);
  }
}
