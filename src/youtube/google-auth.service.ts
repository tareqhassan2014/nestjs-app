import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Auth, google } from 'googleapis';

@Injectable()
export class GoogleAuthService {
  private readonly oauth2Client: Auth.OAuth2Client;
  public readonly scopes = [
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/yt-analytics.readonly',
    'https://www.googleapis.com/auth/yt-analytics-monetary.readonly',
  ];

  constructor(private readonly configService: ConfigService) {
    this.oauth2Client = new google.auth.OAuth2(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
      this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
      `${this.configService.get<string>('ORIGIN')}/api/youtube/channel/callback`,
    );
  }

  getAuthUrl(state: string): string {
    return this.oauth2Client.generateAuthUrl({
      state: state,
      prompt: 'consent',
      scope: this.scopes,
      access_type: 'offline',
    });
  }

  getOAuth2Client(): Auth.OAuth2Client {
    return this.oauth2Client;
  }
}
