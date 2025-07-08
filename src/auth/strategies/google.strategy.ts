import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

import { Strategy } from 'passport-google-oauth20';

import { EnvironmentKey } from '@/config';
import { AuthService } from '@/auth/auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      scope: ['email', 'profile'],
      clientID: configService.get<string>(EnvironmentKey.GOOGLE_CLIENT_ID),
      clientSecret: configService.get<string>(
        EnvironmentKey.GOOGLE_CLIENT_SECRET,
      ),
      callbackURL: `${configService.get<string>(EnvironmentKey.ORIGIN)}/api/auth/google/redirect`,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<any> {
    return await this.authService.googleLogin(profile);
  }
}
