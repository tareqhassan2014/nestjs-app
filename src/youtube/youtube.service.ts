import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { google } from 'googleapis';
import { Model } from 'mongoose';
import { CreateYoutubeAccountDto } from './dto/create-youtube-account.dto';
import { YoutubeCallbackDto } from './dto/youtube-callback.dto';
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
