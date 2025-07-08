import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { google } from 'googleapis';
import { Model } from 'mongoose';
import { CreateYoutubeAccountDto } from './dto/create-youtube-account.dto';
import { DashboardStatsResponse } from './dto/dashboard-stats.dto';
import { YoutubeCallbackDto } from './dto/youtube-callback.dto';
import { YoutubeChannelStat } from './schemas/channel-stats.schema';
import { DashboardChannel } from './schemas/dashboard-channel.schema';
import { Dashboard } from './schemas/dashboard.schema';
import { Video } from './schemas/video.schema';
import { YoutubeAccount } from './schemas/youtube-account.schema';
import { ApiKeyManagerService } from './services/api-key-manager.service';
import { GoogleAuthService } from './services/google-auth.service';

@Injectable()
export class YoutubeService {
  constructor(
    @InjectModel(Video.name) private videoModel: Model<Video>,
    @InjectModel(YoutubeAccount.name)
    private youtubeAccountModel: Model<YoutubeAccount>,
    @InjectModel(Dashboard.name)
    private dashboardModel: Model<Dashboard>,
    @InjectModel(DashboardChannel.name)
    private dashboardChannelModel: Model<DashboardChannel>,
    @InjectModel(YoutubeChannelStat.name)
    private channelStatsModel: Model<YoutubeChannelStat>,
    private readonly configService: ConfigService,
    private readonly googleAuthService: GoogleAuthService,
    private readonly apiKeyManagerService: ApiKeyManagerService,
  ) {}

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

  async getDashboardStats(
    dashboardId: string,
  ): Promise<DashboardStatsResponse> {
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

    // Find dashboard channels with populated YouTube accounts
    const dashboardChannels = await this.dashboardChannelModel
      .find({ dashboardId })
      .populate({
        path: 'youtubeAccountId',
        model: YoutubeAccount.name,
        select: 'channelId channelTitle _id',
      })
      .exec();

    if (!dashboardChannels || dashboardChannels.length === 0) {
      return [];
    }

    // Generate array of expected timestamps for the last 48 hours
    const expectedTimestamps = Array.from({ length: 48 }, (_, i) => {
      const d = new Date();
      d.setHours(d.getHours() - (47 - i));
      d.setMinutes(0, 0, 0);
      return d.toISOString();
    });

    // Process each channel's data and fetch subscriber counts
    const channelStats = await Promise.all(
      dashboardChannels.map(async (dashboardChannel) => {
        const youtubeAccount = dashboardChannel.youtubeAccountId as any; // Type assertion for populated field

        // Fetch channel stats from database using youtubeAccountId
        const channelStatsData = await this.channelStatsModel
          .find({
            youtubeAccountId: youtubeAccount._id,
            timestamp: { $gte: fortyEightHoursAgo },
          })
          .sort({ timestamp: 1 })
          .exec();

        // Fetch subscriber count from YouTube API
        let totalSubscribers = 0;
        try {
          const channelResponse =
            await this.apiKeyManagerService.makeYoutubeApiCall(
              (youtube) =>
                youtube.channels.list({
                  part: ['statistics'],
                  id: [youtubeAccount.channelId],
                }),
              'channels.list',
            );

          totalSubscribers = parseInt(
            channelResponse.data.items?.[0]?.statistics?.subscriberCount || '0',
          );
        } catch (error) {
          console.error('Error fetching subscriber count:', error);
          // Continue with 0 subscribers if API call fails
        }

        // Create a map of existing stats by hour for easy lookup
        const statsMap = new Map(
          channelStatsData.map((stat) => [
            new Date(stat.timestamp).setMinutes(0, 0, 0),
            {
              hourlyViewChange: stat.hourlyViewChange,
              hourlyViewChangeShort: stat.hourlyViewChangeShort,
              hourlyViewChangeLong: stat.hourlyViewChangeLong,
              totalViews: stat.totalViews,
              shortViews: stat.shortViews,
              longViews: stat.longViews,
            },
          ]),
        );

        // Fill in missing hours with 0
        const hourlyStats = expectedTimestamps.map((timestamp) => {
          const hourKey = new Date(timestamp).setMinutes(0, 0, 0);
          const statData = statsMap.get(hourKey) || {
            hourlyViewChange: 0,
            hourlyViewChangeShort: 0,
            hourlyViewChangeLong: 0,
            totalViews: 0,
            shortViews: 0,
            longViews: 0,
          };

          return {
            timestamp,
            hourlyViewChange: statData.hourlyViewChange,
            hourlyViewChangeShort: statData.hourlyViewChangeShort,
            hourlyViewChangeLong: statData.hourlyViewChangeLong,
            totalViews: statData.totalViews,
            shortViews: statData.shortViews,
            longViews: statData.longViews,
          };
        });

        return {
          channelId: youtubeAccount.channelId,
          channelTitle: youtubeAccount.channelTitle,
          totalSubscribers,
          stats: hourlyStats,
        };
      }),
    );

    return channelStats;
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
